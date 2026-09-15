#!/usr/bin/env node
/**
 * assert-headers.mjs — assert the header VALUES `public/_headers` pins into prod.
 *
 * WHAT IT GUARDS
 * --------------
 * `scripts/check-inline-scripts.mjs` guards the *content* half of the CSP
 * (`script-src 'self'` is only safe while the export ships no executable inline
 * script). This script guards the *header* half: the values themselves.
 *
 * The file has silently shipped three wrong values, each invisible until someone
 * curled production:
 *
 *   M1  The whole file sat in path-less blocks. `_headers` only applies headers
 *       inside a path section ("/*" or "/path"); a header declared with no path
 *       above it is dropped on the floor. CSS-style `/* comment *​/` banners were
 *       read as (bogus) path lines, so every real header attached to nothing —
 *       none of it had ever reached a browser.
 *   M2  `X-Frame-Options: DENY` contradicted `frame-ancestors 'self'`. Modern
 *       browsers honour frame-ancestors and ignore XFO, older ones let DENY win,
 *       so same-origin framing was broken on some browsers and fine on others.
 *   M3  `Cross-Origin-Opener-Policy: same-origin` severed `window.opener` for the
 *       Coinbase Wallet popup (`lib/web3.ts`), breaking a live wallet flow. The
 *       value must be `same-origin-allow-popups` while that connector exists.
 *
 * Every one of those is a *value* defect that no build catches: the file parses,
 * the deploy succeeds, the site serves headers nobody asserted. This is that
 * assertion, run on every PR (source mode) and against prod (live mode).
 *
 * MODES
 * -----
 *   node scripts/assert-headers.mjs                                  # public/_headers
 *   node scripts/assert-headers.mjs --file out/_headers --same-as public/_headers
 *   node scripts/assert-headers.mjs --url https://supercompute.io    # live drift check
 *   node scripts/assert-headers.mjs --json
 *
 *   --file <path>     headers source (default `public/_headers`).
 *   --same-as <path>  also assert the two files are byte-identical after
 *                     trimming trailing whitespace. `out/_headers` is what
 *                     Cloudflare actually receives, so "the build copied it
 *                     verbatim" belongs in the same assertion.
 *   --url <url>       live mode: fetch the URL and assert the same pins against
 *                     the RESPONSE headers (this is the "did prod ship it?" mode).
 *                     Never falls back to the source file — prod drift is the
 *                     whole point, and a silent fallback would report green.
 *   --json            machine-readable result on stdout.
 *
 * Exit: 0 = every pin holds, 1 = at least one does not (or the source/URL is
 * unreadable). Live mode also fails on a non-2xx status.
 *
 * WHY THE PINS LIVE IN CODE AND NOT IN A SNAPSHOT
 * -----------------------------------------------
 * A snapshot of the whole file would fail on every legitimate cache-policy edit
 * and train everyone to `--update-snapshot`, which is how a security pin dies.
 * Only the values that carry a *decision* are pinned, each with the reason it is
 * pinned; anything else in the file may change freely.
 *
 * KEEPING IT HONEST
 * -----------------
 * `tests/headers/assert-headers.test.mjs` drives this file's real `public/_headers`
 * (it must pass) and mutation-tests every pin (each one must fail when reverted)
 * — including the historical M1/M2/M3 shapes, pasted verbatim as fixtures. A
 * header pin that silently stops matching is worse than no pin: the policy is
 * then declared safe on its own word.
 */

import { readFileSync } from "node:fs";

/**
 * The values that carry a decision. Change an entry only with the reason, and
 * change it in the same commit as `public/_headers` (or with a pointer to the
 * card that made the decision) — this list IS the pin.
 */
export const EXPECTED = {
  /** The only section a browser-wide header may live in. */
  section: "/*",

  cspHeader: "content-security-policy",

  /**
   * CSP directives whose token lists are pinned. `must` = tokens that have to be
   * there; `forbid` = tokens whose presence breaks the policy's contract.
   */
  cspDirectives: [
    {
      name: "script-src",
      must: ["'self'"],
      forbid: ["'unsafe-inline'", "'unsafe-eval'", "'unsafe-hashes'", "*", "http:", "https:"],
      why:
        "guards the whole inline-script invariant (scripts/check-inline-scripts.mjs). " +
        "'self' with no nonce/hash/'unsafe-inline' is what makes an inline-script regression fail closed.",
    },
    {
      name: "connect-src",
      must: [
        "https://mainnet.base.org",
        "https://eth.drpc.org",
        "https://*.walletconnect.com",
        "https://*.walletconnect.org",
        "wss://*.walletconnect.com",
        "wss://*.walletconnect.org",
      ],
      forbid: [],
      why:
        "every browser-side RPC/relay transport in lib/web3.ts must be listed here or wagmi fails " +
        "silently in prod. base -> mainnet.base.org (viem default), mainnet -> eth.drpc.org (pinned " +
        "because eth.merkle.io 429s), WalletConnect relay -> *.walletconnect.com/.org over https+wss.",
    },
    {
      name: "frame-ancestors",
      must: ["'self'"],
      forbid: ["*", "http:", "https:"],
      why:
        "modern browsers read frame-ancestors and ignore X-Frame-Options (M2). 'self' is the " +
        "clickjacking control that must agree with X-Frame-Options: SAMEORIGIN below.",
    },
  ],

  /** Header name -> the single value the /* section must declare. */
  exact: [
    {
      name: "cross-origin-opener-policy",
      value: "same-origin-allow-popups",
      why:
        "M3. `same-origin` severs window.opener for the Coinbase Wallet popup opened by " +
        "lib/web3.ts, which killed a live wallet flow; `allow-popups` restores the opener only " +
        "for popups we initiate. Revert to `same-origin` only if no popup flow remains.",
    },
    {
      name: "x-frame-options",
      value: "sameorigin", // compared case-insensitively
      why:
        "M2. Must agree with frame-ancestors 'self'. It was DENY, which older browsers let win " +
        "over the CSP — same-origin framing silently broke. SAMEORIGIN keeps the legacy control.",
    },
  ],

  /** Headers whose presence is a defect, by value. */
  forbidden: [
    {
      name: "cross-origin-embedder-policy",
      value: "require-corp",
      why:
        "COEP require-corp blocks every cross-origin subresource that lacks a CORP header and " +
        "breaks extension-injected wallet providers (they are not CORS-negotiated). COEP is " +
        "deliberately absent: crossOriginIsolated is false either way (no SharedArrayBuffer use).",
    },
  ],

  /** Reported so drift is visible; never fails the build. */
  informational: [
    "x-content-type-options",
    "referrer-policy",
    "permissions-policy",
    "reporting-endpoints",
    "report-to",
    "strict-transport-security",
  ],
};

/** A path section line: `/`, `/*`, `/path`, `*.css`. No whitespace, no comment. */
const PATH_LINE = /^[/*][^\s]*$/;
/** `Name: value` (header names are ASCII case-insensitive in HTML/HTTP). */
const HEADER_LINE = /^([A-Za-z][A-Za-z0-9-]*)\s*:\s*(.*)$/;

/**
 * Parse a Cloudflare Pages `_headers` file.
 *
 * Sections are path lines at column 0; the header lines under one belong to it.
 * Anything else is reported as an issue rather than skipped, because "the file
 * parsed but nothing applied" is exactly the M1 failure this exists to catch.
 */
export function parseHeaders(text) {
  const sections = [];
  const issues = [];
  const warnings = [];
  let current = null;

  const lines = String(text).split(/\r?\n/);
  lines.forEach((raw, idx) => {
    const line = idx + 1;
    const trimmed = raw.trim();
    if (trimmed === "" || trimmed.startsWith("#")) return;

    const indented = /^[ \t]/.test(raw);

    if (!indented && PATH_LINE.test(trimmed)) {
      current = { path: trimmed, line, headers: new Map(), entries: [] };
      sections.push(current);
      return;
    }

    const header = HEADER_LINE.exec(trimmed);
    if (header && current) {
      const name = header[1].toLowerCase();
      const value = header[2].trim();
      if (!current.headers.has(name)) current.headers.set(name, []);
      current.headers.get(name).push(value);
      current.entries.push({ name, value, line, indented });
      if (!indented) {
        warnings.push({
          kind: "non-indented-header",
          line,
          raw: trimmed,
          detail:
            `${name} is not indented. Indentation is the documented form for a header line; ` +
            `the file is only unambiguous with it.`,
        });
      }
      return;
    }

    if (header && !current) {
      // M1 verbatim: a header declared above any path section applies to nothing.
      issues.push({
        kind: "orphan-header",
        line,
        raw: trimmed,
        detail:
          `${header[1]} is declared outside any path section, so Cloudflare Pages applies it to ` +
          `NOTHING (M1). Put it under a "/*" section.`,
      });
      return;
    }

    if (trimmed.startsWith("/") || trimmed.startsWith("*")) {
      issues.push({
        kind: "bad-path-line",
        line,
        raw: trimmed,
        detail:
          `not a valid path section (whitespace after the leading "/" or "*"). A CSS-style ` +
          `"/* comment */" banner is read as a bogus path, so the header lines under it attach to ` +
          `nothing (M1). Use "#" for comments.`,
      });
      current = null; // do not let what follows inherit the previous section
      return;
    }

    issues.push({
      kind: "unparsable-line",
      line,
      raw: trimmed,
      detail:
        "neither a # comment, a path section, nor a `Name: value` header. Pages ignores it, and " +
        "any header line around it may be attached to the wrong block (M1).",
    });
  });

  for (const s of sections) {
    if (s.entries.length === 0) {
      warnings.push({
        kind: "empty-section",
        line: s.line,
        raw: s.path,
        detail: `${s.path} declares no headers — it applies nothing.`,
      });
    }
  }

  return { sections, issues, warnings };
}

/** Header map (lowercased name -> raw values) for one section path. */
export function headersFor(parsed, path = EXPECTED.section) {
  const section = parsed.sections.find((s) => s.path === path);
  return section ? section.headers : null;
}

/** Split a CSP header value into directive -> tokens. */
export function parseCsp(value) {
  const directives = new Map();
  for (const part of String(value).split(";")) {
    const tokens = part.trim().split(/\s+/).filter(Boolean);
    if (tokens.length === 0) continue;
    directives.set(tokens[0].toLowerCase(), tokens.slice(1));
  }
  return directives;
}

/** Build the same shape `headersFor` returns, from a live/fetch header container. */
export function headersFromResponse(headers) {
  const map = new Map();
  const entries = typeof headers.entries === "function" ? headers.entries() : Object.entries(headers ?? {});
  for (const [name, value] of entries) {
    const key = String(name).toLowerCase();
    map.set(key, [String(value)]);
  }
  return map;
}

/**
 * Assert the pinned values in one header map. `origin` is only used in messages.
 * Returns findings (fail) and warnings (report only) — never throws.
 */
export function checkHeaderSet(headers, { origin = "headers", mode = "source" } = {}) {
  const findings = [];
  const warnings = [];
  const pins = [];
  const present = [];

  if (!headers) {
    findings.push({
      kind: "missing-section",
      detail: `no "${EXPECTED.section}" section — a header declared outside a path section applies to nothing (M1).`,
    });
    return { findings, warnings, pins, present, ok: false };
  }

  const get = (name) => headers.get(name)?.[0]; // first declaration wins for the pinned scalars

  /* ---- CSP: whole directives, not just presence ---------------------------- */
  const cspRaw = headers.get(EXPECTED.cspHeader);
  if (!cspRaw || cspRaw.length === 0) {
    findings.push({
      kind: "missing-header",
      detail: `the "${EXPECTED.section}" section declares no Content-Security-Policy.`,
    });
  } else {
    const csp = parseCsp(cspRaw.join("; "));
    for (const rule of EXPECTED.cspDirectives) {
      const tokens = csp.get(rule.name);
      if (!tokens) {
        findings.push({
          kind: "missing-directive",
          detail: `CSP has no ${rule.name} directive (${rule.why})`,
        });
        continue;
      }
      for (const must of rule.must) {
        if (!tokens.includes(must)) {
          findings.push({
            kind: "missing-source",
            detail: `CSP ${rule.name} is missing ${must} (${rule.why})`,
          });
        }
      }
      for (const bad of rule.forbid) {
        const hit = tokens.find((t) => t.toLowerCase() === bad.toLowerCase());
        if (hit) {
          findings.push({
            kind: "forbidden-source",
            detail: `CSP ${rule.name} contains ${hit}, which breaks the pinned contract (${rule.why})`,
          });
        }
      }
    }
  }

  /* ---- scalar pins --------------------------------------------------------- */
  for (const rule of EXPECTED.exact) {
    const actual = get(rule.name);
    const ok = actual !== undefined && actual.toLowerCase() === rule.value.toLowerCase();
    pins.push({ name: rule.name, expected: rule.value, actual: actual ?? null, ok });
    if (!ok) {
      findings.push({
        kind: "wrong-header-value",
        detail:
          `${rule.name} is ${actual === undefined ? "NOT DECLARED" : `"${actual}"`}, pinned to ` +
          `"${rule.value}" (${rule.why})`,
      });
    }
  }

  for (const rule of EXPECTED.forbidden) {
    const actual = get(rule.name);
    if (actual !== undefined && actual.toLowerCase().includes(rule.value)) {
      findings.push({
        kind: "forbidden-header",
        detail: `${rule.name}: ${actual} (${rule.why})`,
      });
      pins.push({ name: rule.name, expected: "absent", actual, ok: false });
    } else {
      if (actual !== undefined) {
        warnings.push({
          kind: "unexpected-header",
          line: null,
          raw: `${rule.name}: ${actual}`,
          detail: `${rule.name} is declared with a value that is not the pinned defect (${rule.value}). Reported, not failed — confirm it is intentional.`,
        });
      }
      pins.push({ name: rule.name, expected: "absent", actual: actual ?? null, ok: true });
    }
  }

  for (const name of EXPECTED.informational) {
    const actual = get(name);
    if (actual !== undefined) present.push({ name, value: actual });
  }

  return {
    origin,
    mode,
    findings,
    warnings,
    pins,
    present,
    ok: findings.length === 0,
  };
}

/** Source mode: parse `public/_headers` (or `out/_headers`) and assert it. */
export function checkSource(text, { source = "public/_headers", mode = "source" } = {}) {
  const parsed = parseHeaders(text);
  const headers = headersFor(parsed, EXPECTED.section);
  const res = checkHeaderSet(headers, { origin: source, mode });
  // Parse-level defects (M1 shapes) are failures in their own right.
  res.findings = [...parsed.issues, ...res.findings];
  res.warnings = [...parsed.warnings, ...res.warnings];
  res.ok = res.findings.length === 0;
  res.path = source;
  res.parsed = parsed;
  res.text = text;
  return res;
}

/** Read a headers file and assert it. */
export function checkFile(path) {
  let text;
  try {
    text = readFileSync(path, "utf8");
  } catch (err) {
    return {
      path,
      ok: false,
      findings: [{ kind: "unreadable-source", detail: `${path} could not be read: ${err.message}` }],
      warnings: [],
      pins: [],
      present: [],
    };
  }
  return checkSource(text, { source: path });
}

/** Live mode: fetch `url` and assert the response headers with the same pins. */
export async function checkLive(url, { fetchImpl = fetch } = {}) {
  let response;
  try {
    response = await fetchImpl(url, { redirect: "follow", headers: { "user-agent": "supercompute-header-assert/1.0" } });
  } catch (err) {
    return {
      path: url,
      mode: "live",
      ok: false,
      findings: [{ kind: "unreachable", detail: `${url} could not be fetched: ${err.message}` }],
      warnings: [],
      pins: [],
      present: [],
    };
  }
  const res = checkHeaderSet(headersFromResponse(response.headers), { origin: url, mode: "live" });
  res.path = url;
  res.status = response.status;
  if (!(response.status >= 200 && response.status < 300)) {
    res.findings = [
      { kind: "http-status", detail: `${url} answered HTTP ${response.status}, not 2xx.` },
      ...res.findings,
    ];
  }
  res.ok = res.findings.length === 0;
  return res;
}

/** Assert two header files are the same bytes (modulo trailing whitespace). */
export function checkSameAs(a, b) {
  const norm = (p) => {
    try {
      return readFileSync(p, "utf8").replace(/[ \t]+$/gm, "").trimEnd();
    } catch (err) {
      return `__unreadable__: ${err.message}`;
    }
  };
  const left = norm(a);
  const right = norm(b);
  if (left === right) return { ok: true, findings: [], a, b };
  return {
    ok: false,
    a,
    b,
    findings: [
      {
        kind: "file-drift",
        detail:
          `${a} and ${b} differ (modulo trailing whitespace). Cloudflare Pages serves ` +
          `${b} after a build, so a difference means the pin does not describe what ships.`,
      },
    ],
  };
}

export function report(res, { stdout = console.log } = {}) {
  const bar = "─".repeat(74);
  const mode = res.mode === "live" ? "LIVE (against a served URL)" : "SOURCE (_headers)";
  stdout(`\n=== Headers invariant: pinned values in the effective "${EXPECTED.section}" section ===`);
  stdout(`mode:     ${mode}`);
  stdout(`source:   ${res.path ?? "(unknown)"}${res.status !== undefined ? `  [HTTP ${res.status}]` : ""}`);

  if (res.pins?.length) {
    stdout("");
    for (const pin of res.pins) {
      stdout(
        `${pin.ok ? "✓" : "✗"} ${pin.name.padEnd(32)} expected ${pin.expected.padEnd(26)} actual ${pin.actual ?? "(absent)"}`,
      );
    }
  }

  if (res.present?.length) {
    stdout("");
    stdout("Reported for drift visibility (not pinned):");
    for (const h of res.present) stdout(`  ${h.name}: ${h.value}`);
  }

  for (const w of res.warnings ?? []) {
    stdout(`\n⚠ ${w.kind}${w.line ? ` (line ${w.line})` : ""} — ${w.detail}`);
    if (w.raw) stdout(`    ${w.raw}`);
  }

  if (res.findings?.length) {
    stdout(`\n${bar}`);
    stdout(`✗ ${res.findings.length} header defect(s) — prod would serve these unasserted:\n`);
    for (const f of res.findings) {
      stdout(`  [${f.kind}]${f.line ? ` line ${f.line}:` : ""} ${f.detail}`);
      if (f.raw) stdout(`      ${f.raw}`);
    }
  }

  stdout(
    res.ok
      ? `\n✓ PASS — ${EXPECTED.section} declares the pinned header set (COOP, XFO, CSP directives; no COEP require-corp).`
      : `\n✗ FAIL — the pinned header set does not hold. Fix public/_headers (and, if the decision itself changed, EXPECTED in scripts/assert-headers.mjs in the same commit).`,
  );
  return Boolean(res.ok);
}

const invokedDirectly = process.argv[1] && import.meta.url === `file://${process.argv[1]}`;
if (invokedDirectly) {
  const args = process.argv.slice(2);
  const flag = (name) => {
    const i = args.indexOf(name);
    return i === -1 ? undefined : args[i + 1];
  };
  const file = flag("--file") ?? "public/_headers";
  const url = flag("--url");
  const sameAs = flag("--same-as");
  const json = args.includes("--json");

  const fail = (res) => {
    if (json) console.log(JSON.stringify(res, null, 2));
    else report(res);
    process.exitCode = 1;
  };

  if (url) {
    checkLive(url).then((res) => {
      if (json) console.log(JSON.stringify(res, null, 2));
      else report(res);
      process.exitCode = res.ok ? 0 : 1;
    });
  } else {
    const res = checkFile(file);
    let ok = res.ok;
    if (sameAs) {
      const same = checkSameAs(file, sameAs);
      res.findings = [...res.findings, ...same.findings];
      res.ok = ok && same.ok;
      ok = res.ok;
    }
    if (json) console.log(JSON.stringify({ ...res, parsed: undefined, text: undefined }, null, 2));
    else report(res);
    process.exitCode = ok ? 0 : 1;
  }
}
