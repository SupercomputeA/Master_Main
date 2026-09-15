// functions/api/csp-report.js — CSP violation collector (card t_38a77267)
//
// POST /api/csp-report  <- Reporting-Endpoints `csp`, legacy `Report-To`, and
//                          the CSP `report-uri` / `report-to csp` directives.
//
// Cloudflare Pages Functions ONLY — `public/_headers` does not apply here, so
// this endpoint is its own surface and must not be reachable as a static file.
//
// Contract:
//   * accepts the legacy `application/csp-report` body AND the modern
//     `application/reports+json` body (array, or a bare Report object);
//   * caps the body at 8 KB (streamed, so an oversized upload is dropped
//     instead of buffered) and caps the number of reports per request;
//   * NEVER reflects the body back — every path answers 204 No Content;
//   * stores an AGGREGATE in D1 (`csp_reports`): one row per
//     day + directive + blocked origin + document path + disposition, with a
//     hit counter, so the signal is a count and not a firehose;
//   * strips the query string and fragment from every URL it stores (a blocked
//     URL can carry a session token or a signed-URL secret) and length-caps
//     every column.
//
// No PII is stored: no user agent, no referrer, no `script-sample` (the sample
// is inline source code and can itself contain secrets).
//
// Read the data with scripts/csp-report-stats.sh — see docs/csp-telemetry.md.

const MAX_BODY_BYTES = 8 * 1024; // 8 KB
const MAX_REPORTS_PER_REQUEST = 32;
const MAX_FIELD_CHARS = 200;
// Per-day ceiling on distinct rollup keys. Past this, new keys collapse into a
// single overflow row so a hostile page cannot create unbounded rows.
const MAX_DISTINCT_KEYS_PER_DAY = 500;
const OVERFLOW_BUCKET = "__overflow__";
const SITE_ORIGIN = "https://supercompute.io";

// `blocked-uri` values that are keywords rather than URLs.
const NON_URL_TOKENS = new Set([
  "inline",
  "eval",
  "wasm-eval",
  "wasm-unsafe-eval",
  "unsafe-inline",
  "unsafe-eval",
  "data",
  "blob",
  "filesystem",
  "self",
  "about",
  "about:blank",
  "null",
  "javascript",
  "http",
  "https",
]);

const RESPONSE_HEADERS = {
  "Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff",
  "Content-Security-Policy": "default-src 'none'",
  "Referrer-Policy": "no-referrer",
};

/** Truncate to the per-column cap. Non-strings become "". */
export function cap(value, max = MAX_FIELD_CHARS) {
  if (typeof value !== "string") return "";
  return value.length > max ? value.slice(0, max) : value;
}

/** Drop the fragment and the query string — the part that can carry a secret. */
function stripQueryAndFragment(value) {
  return value.split("#", 1)[0].split("?", 1)[0];
}

/**
 * Sanitize one URL from a report.
 * Returns { origin, url } where `origin` is the aggregation key
 * (scheme://host[:port] only, or a keyword like `inline`/`eval`/`data`) and
 * `url` is origin+path with the query string removed, capped for storage.
 */
export function sanitizeUrl(value, fallback = "(unknown)") {
  if (typeof value !== "string") return { origin: fallback, url: "" };
  const raw = value.trim();
  if (!raw) return { origin: fallback, url: "" };
  const bare = stripQueryAndFragment(raw);
  const lower = bare.toLowerCase();
  const keyword = lower.endsWith(":") ? lower.slice(0, -1) : lower;
  if (NON_URL_TOKENS.has(keyword)) return { origin: keyword, url: "" };
  try {
    const url = new URL(bare);
    if (!url.host) return { origin: cap(lower), url: "" };
    const origin = cap(`${url.protocol}//${url.host}`);
    return { origin, url: cap(`${origin}${url.pathname}`) };
  } catch {
    // Not a parseable URL and not a known keyword (e.g. a bare host or a
    // scheme we do not know). Keep the sanitized head only.
    return { origin: cap(keyword), url: "" };
  }
}

/**
 * Sanitize the reporting document. Our own origin is implied, so store the
 * path alone; anything from another origin keeps its origin so a forged or
 * unexpected reporter is visible rather than invisible.
 */
export function sanitizeDocument(value) {
  if (typeof value !== "string" || !value.trim()) return "(unknown)";
  const bare = stripQueryAndFragment(value.trim());
  try {
    const url = new URL(bare);
    const path = url.pathname || "/";
    if (`${url.protocol}//${url.host}` === SITE_ORIGIN) return cap(path);
    return cap(`${url.protocol}//${url.host}${path}`);
  } catch {
    return cap(bare);
  }
}

/** `effective-directive` when present, else the `violated-directive` name. */
export function normalizeDirective(report) {
  const raw =
    report["effective-directive"] ??
    report.effectiveDirective ??
    report["violated-directive"] ??
    report.violatedDirective ??
    "";
  const name = String(raw).trim().split(/\s+/)[0].toLowerCase();
  return cap(name || "(unknown)");
}

/**
 * Normalize either report body into flat records.
 * Returns [] for anything unparseable — never throws, never echoes.
 */
export function parseReports(text, contentType = "") {
  if (typeof text !== "string" || !text.trim()) return [];
  let payload;
  try {
    payload = JSON.parse(text);
  } catch {
    return [];
  }
  const ct = String(contentType).toLowerCase();

  const reports = [];
  if (Array.isArray(payload)) {
    for (const entry of payload) {
      if (!entry || typeof entry !== "object") continue;
      // The csp group can in principle carry other report types.
      if (entry.type && entry.type !== "csp-violation") continue;
      if (!entry.body || typeof entry.body !== "object") continue;
      reports.push({ body: entry.body, source: "reports+json" });
    }
  } else if (payload && typeof payload === "object") {
    const legacy = payload["csp-report"];
    if (legacy && typeof legacy === "object") {
      reports.push({ body: legacy, source: "report-uri" });
    } else if (payload.body && typeof payload.body === "object" && !Array.isArray(payload.body)) {
      // Some engines send a single Report object without the array wrapper.
      reports.push({ body: payload.body, source: "reports+json" });
    }
  }
  if (reports.length === 0) return [];

  const source = ct.includes("reports+json")
    ? "reports+json"
    : ct.includes("csp-report")
      ? "report-uri"
      : null;

  return reports.map(({ body, source: fallbackSource }) => {
    const blocked = sanitizeUrl(body["blocked-uri"] ?? body.blockedURL);
    return {
      directive: normalizeDirective(body),
      blockedOrigin: blocked.origin,
      blockedUrl: blocked.url,
      documentPath: sanitizeDocument(
        body["document-uri"] ?? body.documentURL ?? body.documentUri,
      ),
      disposition: cap(String(body.disposition ?? "enforce").toLowerCase(), 16) || "enforce",
      source: source || fallbackSource,
    };
  });
}

/**
 * Read the body with a hard byte cap. Returns null when the request exceeds the
 * cap (caller answers 204) so an oversized upload is never buffered.
 */
export async function readCappedBody(request, capBytes = MAX_BODY_BYTES) {
  const declared = Number(request.headers.get("content-length") || "0");
  if (Number.isFinite(declared) && declared > capBytes) return null;
  if (!request.body) return "";
  const reader = request.body.getReader();
  const chunks = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    if (!value) continue;
    total += value.byteLength;
    if (total > capBytes) {
      try {
        await reader.cancel();
      } catch {
        // the stream is already gone; nothing to clean up
      }
      return null;
    }
    chunks.push(value);
  }
  const buf = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    buf.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(buf);
}

/**
 * Upsert one aggregate row. The cap guard is evaluated inside the INSERT ...
 * SELECT ... WHERE, so a day that is already at the ceiling cannot grow: that
 * statement changes zero rows and the report falls through to the overflow row.
 */
export async function storeReport(db, record, now = Math.floor(Date.now() / 1000)) {
  const day = new Date(now * 1000).toISOString().slice(0, 10);
  const bucketKey = [
    day,
    record.directive,
    record.blockedOrigin,
    record.documentPath,
    record.disposition,
  ].join("|");

  const upsert = await db
    .prepare(
      `INSERT INTO csp_reports
         (bucket_key, day, violated_directive, blocked_origin, blocked_path,
          document_path, disposition, source, hits, first_seen, last_seen)
       SELECT ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?
       WHERE (SELECT COUNT(*) FROM csp_reports WHERE day = ?) < ?
       ON CONFLICT(bucket_key) DO UPDATE SET
         hits = hits + 1,
         last_seen = excluded.last_seen,
         blocked_path = excluded.blocked_path,
         source = excluded.source`,
    )
    .bind(
      bucketKey,
      day,
      record.directive,
      record.blockedOrigin,
      record.blockedUrl,
      record.documentPath,
      record.disposition,
      record.source,
      now,
      now,
      day,
      MAX_DISTINCT_KEYS_PER_DAY,
    )
    .run();

  const changes = Number(upsert?.meta?.changes ?? 1);
  if (changes > 0) return "aggregated";

  await db
    .prepare(
      `INSERT INTO csp_reports
         (bucket_key, day, violated_directive, blocked_origin, blocked_path,
          document_path, disposition, source, hits, first_seen, last_seen)
       VALUES (?, ?, ?, ?, '', ?, '', ?, 1, ?, ?)
       ON CONFLICT(bucket_key) DO UPDATE SET
         hits = hits + 1,
         last_seen = excluded.last_seen`,
    )
    .bind(`${day}|${OVERFLOW_BUCKET}`, day, OVERFLOW_BUCKET, OVERFLOW_BUCKET, OVERFLOW_BUCKET, record.source, now, now)
    .run();
  return "overflow";
}

function noContent() {
  return new Response(null, { status: 204, headers: RESPONSE_HEADERS });
}

export async function onRequest({ request, env }) {
  if (request.method !== "POST") {
    return new Response(null, { status: 405, headers: { ...RESPONSE_HEADERS, Allow: "POST" } });
  }

  let text;
  try {
    text = await readCappedBody(request);
  } catch {
    return noContent(); // unreadable body: drop it, never reflect it
  }
  if (text === null || text === "") return noContent();

  const reports = parseReports(text, request.headers.get("content-type") || "");
  if (reports.length === 0) return noContent();

  const db = env && env.DB;
  if (!db) {
    // A missing binding must be loud in `wrangler pages deployment tail` —
    // silently dropping telemetry is how "we think nothing broke" starts.
    console.error("csp-report: DB binding missing — reports dropped");
    return noContent();
  }

  for (const record of reports.slice(0, MAX_REPORTS_PER_REQUEST)) {
    try {
      await storeReport(db, record);
    } catch (err) {
      console.error("csp-report: store failed:", err && err.message ? err.message : err);
    }
  }
  return noContent();
}
