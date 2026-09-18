// lib/farcaster-feed.js — the one place that decides what a
// `/api/farcaster/casts` response MEANS, so a broken rail can never again be
// rendered as an idle account.
//
// Card t_2b6083b9 (follow-up to the security card t_34ed4a8b). The residual it
// closes: `components/FarcasterFeed.tsx` inspected only the JSON body —
//
//     .then(r => r.json()).then(d => d.casts ? … : d.error ? … : setCasts([]))
//
// — and upstream Neynar failures carry `{"message":"…"}`: neither `casts` nor
// `error`. So an exhausted rail (upstream `429`) or a revoked key (upstream
// `401`) fell straight through to the empty branch and a PUBLIC page said
// "No recent casts." for a rail that was down. The status was never read.
//
// Plain JS on purpose: `components/FarcasterFeed.tsx` and
// `tests/farcaster/feed-outcome.test.js` must exercise the SAME code path, and
// `node --test` cannot import a `.tsx` module. Dependency-free, no React, no
// fetch — it classifies a response that was already received.
//
// Contract: ONE response in, ONE decision out. No polling, no retry, no timers.

/**
 * The honest "not wired yet" line — kept verbatim from the pre-existing
 * component. It is the ONLY failure that may claim the key is unprovisioned:
 * our handler emits it with a 503 and an error body naming NEYNAR_API_KEY.
 */
export const COPY_UNCONFIGURED =
  "// rail wired — NEYNAR_API_KEY not yet provisioned in Cloudflare; feed activates on deploy"

/** Appended to every degraded line. The card's whole point, in five words. */
const DEGRADED_TAIL = "degraded feed, not an idle account"

/** Upstream detail is operator-useful but must never read as a stack trace. */
const DETAIL_MAX = 120

/**
 * Pull a short, single-line operator detail out of a response body. Accepts the
 * three shapes our own handler and Neynar actually emit (`error`, `message`,
 * `detail`) and nothing else — never a nested object, never a multi-line blob.
 *
 * @param {unknown} body
 * @returns {string}
 */
function detail(body) {
  if (!body || typeof body !== "object") return ""
  const raw = /** @type {Record<string, unknown>} */ (body)
  const value = raw.error ?? raw.message ?? raw.detail
  if (typeof value !== "string") return ""
  const flat = value.replace(/\s+/g, " ").trim()
  if (!flat) return ""
  return flat.length > DETAIL_MAX ? `${flat.slice(0, DETAIL_MAX - 3)}...` : flat
}

/** `; retry in ~58s` when our own limiter told us when the window resets. */
function retryHint(body) {
  if (!body || typeof body !== "object") return ""
  const n = /** @type {Record<string, unknown>} */ (body).retry_after
  if (typeof n !== "number" || !Number.isFinite(n) || n <= 0) return ""
  return `retry in ~${Math.round(n)}s`
}

/**
 * Build a degraded decision. Segments are joined with ` · ` so the line stays a
 * single mono string that wraps predictably in the Terminal Dossier feed box.
 */
function degraded(status, body, headline) {
  const segments = [headline]
  const hint = retryHint(body)
  if (hint) segments.push(hint)
  const d = detail(body)
  if (d) segments.push(`detail: ${d}`)
  segments.push(DEGRADED_TAIL)
  return { kind: "degraded", status, message: segments.join(" · ") }
}

/**
 * Classify one `/api/farcaster/casts` response.
 *
 * @param {number} status  HTTP status of the response (`r.status`).
 * @param {unknown} body   Parsed JSON body, or null when it was not JSON.
 * @returns {{kind: "casts", casts: any[], status: number}
 *         | {kind: "unconfigured", status: number, message: string}
 *         | {kind: "degraded", status: number, message: string}}
 */
export function classifyFeedResponse(status, body) {
  const record = body && typeof body === "object" ? /** @type {Record<string, any>} */ (body) : null
  const casts = record ? record.casts : undefined
  const ok = typeof status === "number" && status >= 200 && status < 300

  // The ONLY path that may yield an empty feed: a successful response that
  // actually carries a cast array. `[]` is truthy in JS but a legitimate
  // "quiet account" — that is exactly the state "No recent casts." is for
  // (acceptance criterion 2: do not regress the honest empty state).
  if (ok && Array.isArray(casts)) {
    return { kind: "casts", casts, status }
  }

  // 503 + a key-naming error body = the rail is wired but the credential slot
  // is empty. Distinct from an upstream 5xx on purpose, and checked before the
  // status-code branches so the copy stays exactly as it was.
  if (status === 503 && /neynar_api_key|not configured/i.test(detail(body))) {
    return { kind: "unconfigured", status, message: COPY_UNCONFIGURED }
  }

  // ── Quota exhaustion, the denial-of-wallet condition this card is about ──
  // Both sources collapse to 429: our KV limiter ({error, retry_after}) and
  // Neynar's own budget ({message}). Neither is an empty account.
  if (status === 429) {
    return degraded(status, body, "// rail throttled — feed quota exhausted (HTTP 429)")
  }

  // ── Revoked / invalid credential ─────────────────────────────────────────
  if (status === 401 || status === 403) {
    return degraded(
      status,
      body,
      `// rail key rejected — NEYNAR_API_KEY is invalid or revoked (HTTP ${status})`,
    )
  }

  // ── Upstream fault ───────────────────────────────────────────────────────
  if (typeof status === "number" && status >= 500) {
    return degraded(status, body, `// rail fault — upstream feed error (HTTP ${status})`)
  }

  // ── A 2xx that carries no cast list ──────────────────────────────────────
  // The pre-#66 handler hard-coded 200 over an upstream failure, so this shape
  // is the historical mask of exactly this bug. Never "empty".
  if (ok) {
    return degraded(
      status,
      body,
      `// rail degraded — /api/farcaster returned HTTP ${status} with no cast list`,
    )
  }

  return degraded(
    status,
    body,
    `// rail degraded — /api/farcaster returned HTTP ${status} without a feed`,
  )
}
