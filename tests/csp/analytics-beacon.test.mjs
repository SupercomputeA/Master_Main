/**
 * Tests for the Cloudflare Web Analytics beacon carve-out in public/_headers
 * (card t_83174cd2).
 *
 * WHY THIS EXISTS
 * ---------------
 * The beacon tag is NOT in this repo and NOT in the built export. Cloudflare's
 * edge injects it into every HTML *navigation* response for the zone, after the
 * build is finished:
 *
 *   <script type="module" src="https://static.cloudflareinsights.com/beacon.min.js/v3…"
 *           integrity="sha512-…" crossorigin="anonymous" data-cf-beacon='…'></script>
 *
 * and the beacon then POSTs its RUM payload to https://cloudflareinsights.com/cdn-cgi/rum.
 *
 * So it cannot be caught by scanning `out/` the way check-inline-scripts.mjs
 * catches inline scripts: the only artifact that can pin it down is the policy
 * itself, which is what this test reads. `script-src 'self'` blocked the tag with
 * a `script-src-elem` violation on every page (real production rows in the D1
 * `csp_reports` table) and the analytics never reported.
 *
 * The two assertions that matter are paired on purpose — a beacon that loads but
 * cannot POST is as broken as one that never loads, and the second half is the
 * one nobody remembers to add.
 *
 * Run:  node --test tests/csp/analytics-beacon.test.mjs
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { scriptSrcAllowsOrigin } from "../../scripts/check-inline-scripts.mjs";

const REPO = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const HEADERS = join(REPO, "public", "_headers");

/** The host the injected tag loads its script from. */
const BEACON_SCRIPT_HOST = "static.cloudflareinsights.com";
/** The origin the beacon posts its RUM payload to (`POST /cdn-cgi/rum`). */
const BEACON_REPORT_ORIGIN = "cloudflareinsights.com";

/** The enforcing policy line out of public/_headers (the `/*` block). */
function readPolicy() {
  const text = readFileSync(HEADERS, "utf8");
  const m = text.match(/^\s*Content-Security-Policy\s*:\s*(.+)$/im);
  assert.ok(m, "public/_headers must ship a Content-Security-Policy line");
  return m[1].trim();
}

/** One directive's source list, name dropped. `null` when the directive is absent. */
function sourcesOf(policy, name) {
  for (const part of policy.split(";")) {
    const tokens = part.trim().split(/\s+/);
    if (tokens[0]?.toLowerCase() === name) return tokens.slice(1);
  }
  return null;
}

test("script-src names the beacon's script host, so the injected tag is allowed", () => {
  const scriptSrc = ["script-src", ...sourcesOf(readPolicy(), "script-src")].join(" ");
  assert.ok(
    sourcesOf(readPolicy(), "script-src").includes(`https://${BEACON_SCRIPT_HOST}`),
    `script-src must name https://${BEACON_SCRIPT_HOST} — Cloudflare's edge injects that tag into every navigations and the export cannot show it`,
  );
  // The same host, judged by the shipped gate's own matcher: an entry the matcher
  // cannot parse would pass the string check above and still block in the browser.
  assert.equal(
    scriptSrcAllowsOrigin({ scheme: "https", host: BEACON_SCRIPT_HOST }, scriptSrc),
    true,
    "the shipped script-src must actually match the beacon host under scriptSrcAllowsOrigin()",
  );
});

test("connect-src names the beacon's report origin, so the RUM POST is allowed", () => {
  const connectSrc = sourcesOf(readPolicy(), "connect-src");
  assert.ok(connectSrc, "connect-src must be present");
  assert.ok(
    connectSrc.includes(`https://${BEACON_REPORT_ORIGIN}`),
    `connect-src must name https://${BEACON_REPORT_ORIGIN} — the beacon POSTs to https://${BEACON_REPORT_ORIGIN}/cdn-cgi/rum, so allowing only script-src leaves it loading and then failing to report`,
  );
});

test("script-src stays exact — the carve-out is one host, not a wildcard or a loosened policy", () => {
  const scriptSrc = sourcesOf(readPolicy(), "script-src");
  assert.deepEqual(
    scriptSrc,
    ["'self'", `https://${BEACON_SCRIPT_HOST}`],
    "script-src must be exactly 'self' + the beacon host; any other addition is a deliberate policy change that has to update this list",
  );
  for (const banned of ["'unsafe-inline'", "'unsafe-eval'", "'wasm-unsafe-eval'", "*", "https:", "http:", "data:"]) {
    assert.ok(
      !scriptSrc.includes(banned),
      `script-src must not carry ${banned}; the beacon fix is a single named host, never a blanket allowance`,
    );
  }
  // A wildcard would name the host while also trusting every other subdomain of it.
  assert.ok(
    !scriptSrc.some((token) => token.includes("*")),
    "the beacon host must be named exactly — a *.cloudflareinsights.com entry widens the trust surface past the one script that exists",
  );
});

test("violation telemetry survives the carve-out", () => {
  const policy = readPolicy();
  assert.match(policy, /report-uri \/api\/csp-report/, "the policy must keep reporting violations to /api/csp-report");
  assert.match(policy, /report-to csp/, "the policy must keep the modern report-to target");
  const text = readFileSync(HEADERS, "utf8");
  assert.match(text, /^\s*Reporting-Endpoints:\s*csp="https:\/\/supercompute\.io\/api\/csp-report"$/m);
});
