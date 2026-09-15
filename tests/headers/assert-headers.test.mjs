/**
 * Tests for scripts/assert-headers.mjs — the CI gate that pins the header VALUES
 * `public/_headers` ships to prod (COOP, X-Frame-Options, CSP directives, no COEP).
 *
 * The gate itself has to be tested. A header assertion that silently stops
 * matching is worse than none: prod is then declared pinned on its own word, and
 * nobody notices until a browser does. So this suite does two different things:
 *
 *   1. Drives the file's REAL `public/_headers` — it must pass. If a pin is
 *      written for a value the repo does not ship, that fails here.
 *   2. Mutation-tests every pin against that same real text — mutate the value
 *      back to the defect and the gate MUST go red. Each mutation asserts the
 *      needle was found first, so a mutation that quietly does nothing cannot
 *      produce a false green.
 *
 * The M1/M2/M3 fixtures at the bottom are the historical shapes, pasted
 * verbatim: the file that applied nothing, the XFO/CSP contradiction, and the
 * COOP that severed window.opener. The gate's job is to fail on each of them.
 *
 * Run:  node --test tests/headers/assert-headers.test.mjs
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import {
  EXPECTED,
  checkFile,
  checkHeaderSet,
  checkLive,
  checkSameAs,
  checkSource,
  headersFor,
  headersFromResponse,
  parseCsp,
  parseHeaders,
  report,
} from "../../scripts/assert-headers.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = join(HERE, "..", "..");
const REAL = join(REPO, "public", "_headers");
const SCRIPT = join(REPO, "scripts", "assert-headers.mjs");

const QUIET = { stdout: () => {} };

/** Read the real file once — every mutation test starts from exactly these bytes. */
function readReal() {
  return checkFile(REAL).text;
}

/** Replace `from` with `to`, asserting the needle was really there exactly once. */
function mutate(text, from, to) {
  const hits = text.split(from).length - 1;
  assert.equal(hits, 1, `mutation needle not found exactly once: ${JSON.stringify(from)}`);
  return text.replace(from, to);
}

/**
 * The real file with its COOP value normalised to what `EXPECTED` pins.
 *
 * Rationale: each pin test below must go red for the value it mutates, and for
 * nothing else. On a tree whose `public/_headers` still ships the pre-#94 COOP
 * (i.e. `main` before that fix lands) the raw file would make a dozen tests fail
 * for one unrelated root cause and bury it. Exactly TWO tests drive the raw file
 * — the acceptance pair ("the repo's real public/_headers passes every pin" and
 * its CLI twin) — so on such a tree those two are the only red ones, and they say
 * why. After the fix lands they are green and this helper is a no-op.
 */
function canonicalReal() {
  const text = readReal();
  const line = /^ {2}Cross-Origin-Opener-Policy:.*$/m.exec(text);
  assert.ok(line, "public/_headers declares COOP — if that stops being true, revisit these tests");
  return text.replace(line[0], `  Cross-Origin-Opener-Policy: ${EXPECTED.exact[0].value}`);
}

/**
 * The `script-src` directive exactly as the real file writes it.
 *
 * Derived, not hard-coded: the needle has to survive a host being added to the
 * policy. It was hard-coded to `script-src 'self';` and that stopped matching the
 * moment `script-src` gained `https://static.cloudflareinsights.com` (the Web
 * Analytics carve-out, t_83174cd2) — the pins were untouched, only the needle
 * rotted, which reddened the two mutation tests below for the wrong reason.
 */
function scriptSrcDirective() {
  const line = /^ {2}Content-Security-Policy:(.*)$/m.exec(canonicalReal());
  assert.ok(line, "public/_headers declares Content-Security-Policy — if that stops being true, revisit these tests");
  const directive = line[1]
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.split(/\s+/)[0].toLowerCase() === "script-src");
  assert.ok(directive, "the policy declares script-src — if that stops being true, revisit these tests");
  return `${directive};`;
}

/** Write a `_headers` fixture to a throwaway file and return its path (for CLI tests). */
function tempHeaders(text) {
  const dir = mkdtempSync(join(tmpdir(), "headers-cli-"));
  const file = join(dir, "_headers");
  writeFileSync(file, text);
  return file;
}

function source(text) {
  const res = checkSource(text, { source: "fixture/_headers" });
  return { res, ok: report(res, QUIET) };
}

const kinds = (res) => res.findings.map((f) => f.kind);

/* -------------------------------------------------- the raw file is the pin */

/**
 * The acceptance test: the file this repo actually ships satisfies every pin.
 * This is one of only two tests that read the raw file — see canonicalReal().
 */
test("the repo's real public/_headers passes every pin", () => {
  const res = checkFile(REAL);
  const ok = report(res, QUIET);
  assert.equal(ok, true, JSON.stringify(res.findings, null, 2));
  assert.equal(res.findings.length, 0);
});

test("the raw file declares X-Frame-Options SAMEORIGIN and no COEP (the M2 pair)", () => {
  const res = checkFile(REAL);
  const byName = Object.fromEntries(res.pins.map((p) => [p.name, p]));
  // The COOP value is asserted by the acceptance test above (it is the one pin a
  // pre-#94 tree fails); these two hold on either side of that fix.
  assert.equal(byName["x-frame-options"].actual.toUpperCase(), "SAMEORIGIN");
  assert.equal(byName["cross-origin-embedder-policy"].actual, null, "COEP must be absent");
});

test("out/_headers matches public/_headers when a build is present", () => {
  const out = join(REPO, "out", "_headers");
  if (!existsSync(out)) return; // no export in this checkout — the CI step asserts it after `next build`
  const same = checkSameAs(out, REAL);
  assert.equal(same.ok, true, "the build must copy the headers verbatim, or the pin describes nothing");
});

/* ------------------------------- M3: COOP — the value that broke wallet popups */

test("fails when COOP is set back to same-origin — the card's negative control", () => {
  const text = mutate(canonicalReal(), "Cross-Origin-Opener-Policy: same-origin-allow-popups", "Cross-Origin-Opener-Policy: same-origin");
  const { res, ok } = source(text);
  assert.equal(ok, false, "same-origin severs window.opener for the Coinbase Wallet popup");
  assert.deepEqual(kinds(res), ["wrong-header-value"]);
  assert.match(res.findings[0].detail, /cross-origin-opener-policy/);
  assert.match(res.findings[0].detail, /same-origin-allow-popups/);
});

test("fails when COOP is missing entirely", () => {
  const text = mutate(canonicalReal(), "  Cross-Origin-Opener-Policy: same-origin-allow-popups\n", "");
  const { res, ok } = source(text);
  assert.equal(ok, false);
  assert.equal(kinds(res)[0], "wrong-header-value");
  assert.match(res.findings[0].detail, /NOT DECLARED/);
});

test("a comment mentioning COOP same-origin does not satisfy or break the pin", () => {
  const text = mutate(
    canonicalReal(),
    "  Cross-Origin-Opener-Policy: same-origin-allow-popups",
    "# historical: COOP was same-origin here, which broke the popup\n  Cross-Origin-Opener-Policy: same-origin-allow-popups",
  );
  const { ok } = source(text);
  assert.equal(ok, true, "only the /* section's header lines are judged, not prose");
});

/* ---------------------------------------- M2: XFO must agree with the CSP */

test("fails when X-Frame-Options goes back to DENY", () => {
  const text = mutate(canonicalReal(), "  X-Frame-Options: SAMEORIGIN", "  X-Frame-Options: DENY");
  const { res, ok } = source(text);
  assert.equal(ok, false);
  assert.deepEqual(kinds(res), ["wrong-header-value"]);
  assert.match(res.findings[0].detail, /frame-ancestors/);
});

test("accepts X-Frame-Options in any case (HTTP values are case-insensitive)", () => {
  const text = mutate(canonicalReal(), "  X-Frame-Options: SAMEORIGIN", "  x-frame-options: SameOrigin");
  const { ok } = source(text);
  assert.equal(ok, true);
});

test("fails when frame-ancestors is dropped while XFO stays", () => {
  const text = mutate(canonicalReal(), "; frame-ancestors 'self';", ";");
  const { res, ok } = source(text);
  assert.equal(ok, false);
  assert.equal(kinds(res)[0], "missing-directive");
  assert.match(res.findings[0].detail, /frame-ancestors/);
});

/* --------------------------------------------- CSP directives and transports */

test("fails when connect-src loses a pinned browser transport", () => {
  const text = mutate(canonicalReal(), " https://mainnet.base.org https://eth.drpc.org", " https://eth.drpc.org");
  const { res, ok } = source(text);
  assert.equal(ok, false);
  assert.deepEqual(kinds(res), ["missing-source"]);
  assert.match(res.findings[0].detail, /connect-src is missing https:\/\/mainnet\.base\.org/);
});

test("fails when eth.drpc.org is replaced by the RPC host that 429s", () => {
  const text = mutate(canonicalReal(), " https://mainnet.base.org https://eth.drpc.org", " https://mainnet.base.org https://eth.merkle.io");
  const { res, ok } = source(text);
  assert.equal(ok, false);
  assert.match(res.findings[0].detail, /eth\.drpc\.org/);
});

test("fails when the WalletConnect relay origins are dropped", () => {
  const text = mutate(canonicalReal(), " wss://*.walletconnect.com wss://*.walletconnect.org", "");
  const { ok, res } = source(text);
  assert.equal(ok, false);
  assert.equal(res.findings.length, 2, "both wss relay origins are pinned");
});

test("an EXTRA connect-src host is fine — the pins are a floor, not a snapshot", () => {
  const text = mutate(canonicalReal(), "connect-src 'self'", "connect-src 'self' https://api.example.com");
  const { ok } = source(text);
  assert.equal(ok, true);
});

test("fails when script-src gains 'unsafe-inline'", () => {
  const needle = scriptSrcDirective();
  const text = mutate(canonicalReal(), needle, needle.replace("'self'", "'self' 'unsafe-inline'"));
  const { res, ok } = source(text);
  assert.equal(ok, false);
  assert.deepEqual(kinds(res), ["forbidden-source"]);
  assert.match(res.findings[0].detail, /check-inline-scripts/);
});

test("fails when script-src is removed", () => {
  const text = mutate(canonicalReal(), scriptSrcDirective(), "");
  const { res, ok } = source(text);
  assert.equal(ok, false);
  assert.equal(kinds(res)[0], "missing-directive");
});

test("an extra script-src host is fine — the pin is a floor, not a snapshot", () => {
  const needle = scriptSrcDirective();
  const text = mutate(canonicalReal(), needle, needle.replace(/;$/, " https://static.cloudflareinsights.com;"));
  const { ok, res } = source(text);
  assert.equal(ok, true, "adding a named host must not redden the gate (that is how the CSP carve-out lands)");
  assert.equal(res.findings.length, 0);
});

test("fails when the whole CSP header is removed", () => {
  const text = canonicalReal().replace(/^ {2}Content-Security-Policy:.*$/m, "");
  const { res, ok } = source(text);
  assert.equal(ok, false);
  assert.ok(kinds(res).includes("missing-header"));
});

/* ------------------------------------------------------ COEP must stay absent */

test("fails when COEP: require-corp comes back (breaks extension-injected providers)", () => {
  const text = mutate(canonicalReal(), "  Permissions-Policy: camera=(), microphone=(), geolocation=()", "  Permissions-Policy: camera=(), microphone=(), geolocation=()\n  Cross-Origin-Embedder-Policy: require-corp");
  const { res, ok } = source(text);
  assert.equal(ok, false);
  assert.deepEqual(kinds(res), ["forbidden-header"]);
  assert.match(res.findings[0].detail, /cross-origin-embedder-policy: require-corp/);
});

test("an unexpected COEP value is reported, not failed (drift visibility)", () => {
  const text = mutate(canonicalReal(), "  Permissions-Policy: camera=(), microphone=(), geolocation=()", "  Permissions-Policy: camera=(), microphone=(), geolocation=()\n  Cross-Origin-Embedder-Policy: credentialless");
  const { ok, res } = source(text);
  assert.equal(ok, true);
  assert.equal(res.warnings.filter((w) => w.kind === "unexpected-header").length, 1);
});

/* ------------------------------------------- M1: headers that apply to nothing */

/** The pre-#59 file, verbatim: CSS-style comment banners + headers with no path. */
const M1_FILE = `/*!
 * SUPERCOMPUTE Frontend Static Assets
 * Served from Cloudflare Workers
 */

/* Cross-origin isolation for SharedArrayBuffer */
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp

/* Cache policies */
*.html: Cache-Control: public, max-age=0, must-revalidate
*.css: Cache-Control: public, max-age=31536000, immutable

/* Security headers */
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin`;

test("the historical path-less file (M1) fails — this is the bug that shipped nothing", () => {
  const { res, ok } = source(M1_FILE);
  assert.equal(ok, false);
  assert.ok(kinds(res).includes("missing-section"), "no /* section => nothing reached a browser");
  assert.equal(kinds(res).filter((k) => k === "orphan-header").length, 5, "every real header sits under a bogus path");
  assert.equal(kinds(res).filter((k) => k === "bad-path-line").length, 8, "CSS-style banners are not path sections");
});

test("headers before any path section are orphan headers, not declarations", () => {
  const { res, ok } = source("Cross-Origin-Opener-Policy: same-origin-allow-popups\n");
  assert.equal(ok, false);
  assert.deepEqual(kinds(res), ["orphan-header", "missing-section"]);
  assert.match(res.findings[0].detail, /applies it to NOTHING/);
});

test("a CSS-style banner does not silently swallow the headers under it", () => {
  const { res, ok } = source(`/* Security headers */
X-Frame-Options: SAMEORIGIN`);
  assert.equal(ok, false);
  assert.ok(kinds(res).includes("bad-path-line"));
  assert.ok(kinds(res).includes("orphan-header"));
});

test("an unindented header inside a real section is accepted, with a warning", () => {
  const text = mutate(canonicalReal(), "  X-Frame-Options: SAMEORIGIN", "X-Frame-Options: SAMEORIGIN");
  const { res, ok } = source(text);
  assert.equal(ok, true, "Pages reads the line; the documented form is indentation");
  assert.equal(res.warnings.filter((w) => w.kind === "non-indented-header").length, 1);
});

test("a path section with no headers is reported as applying nothing", () => {
  const { res, ok } = source(`${canonicalReal()}\n\n/dead-section\n`);
  assert.equal(ok, true);
  assert.ok(res.warnings.some((w) => w.kind === "empty-section" && w.raw === "/dead-section"));
});

test("a line that is neither comment, path nor header fails (it may orphan its neighbours)", () => {
  const { res, ok } = source(`${canonicalReal()}\n\njust some prose\n`);
  assert.equal(ok, false);
  assert.deepEqual(kinds(res), ["unparsable-line"]);
});

/* ------------------------------------------------------------- unit surface */

test("parseHeaders splits sections and keeps header order", () => {
  const parsed = parseHeaders("/*\n  A: 1\n  B: 2\n\n/*.css\n  Cache-Control: max-age=1\n");
  assert.deepEqual(
    parsed.sections.map((s) => s.path),
    ["/*", "/*.css"],
  );
  assert.deepEqual(parsed.sections[0].entries.map((e) => e.name), ["a", "b"]);
  assert.equal(parsed.issues.length, 0);
});

test("headersFor returns null when the /* section is absent", () => {
  assert.equal(headersFor(parseHeaders("/*.css\n  A: 1\n")), null);
});

test("parseCsp reads directives case-insensitively and keeps token lists", () => {
  const csp = parseCsp("default-src 'self'; Script-Src 'self' https://a.example; connect-src 'self'");
  assert.deepEqual(csp.get("script-src"), ["'self'", "https://a.example"]);
  assert.deepEqual(csp.get("connect-src"), ["'self'"]);
  assert.equal(csp.size, 3);
});

test("headersFromResponse lowercases names and accepts Headers or a plain object", () => {
  const fromHeaders = headersFromResponse(new Headers({ "Cross-Origin-Opener-Policy": "same-origin-allow-popups" }));
  assert.deepEqual(fromHeaders.get("cross-origin-opener-policy"), ["same-origin-allow-popups"]);
  const fromObject = headersFromResponse({ "X-Frame-Options": "SAMEORIGIN" });
  assert.deepEqual(fromObject.get("x-frame-options"), ["SAMEORIGIN"]);
});

test("checkHeaderSet fails closed when the /* section does not exist", () => {
  const res = checkHeaderSet(null);
  assert.equal(res.ok, false);
  assert.equal(res.findings[0].kind, "missing-section");
});

test("checkSameAs reports drift and unreadable files", () => {
  const dir = mkdtempSync(join(tmpdir(), "headers-same-"));
  const a = join(dir, "a");
  const b = join(dir, "b");
  const c = join(dir, "c");
  writeFileSync(a, "/*\n  A: 1\n");
  writeFileSync(b, "/*\n  A: 1\n\n");
  writeFileSync(c, "/*\n  A: 2\n");
  assert.equal(checkSameAs(a, b).ok, true, "trailing whitespace is not drift");
  assert.equal(checkSameAs(a, c).ok, false);
  assert.equal(checkSameAs(a, join(dir, "nope")).ok, false);
});

/* --------------------------------------------------------------- live mode */

/** The header set prod actually served (curl -I https://supercompute.io, 2026-09-15). */
const PROD_HEADERS_COOP_SAME_ORIGIN = {
  "content-security-policy":
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "connect-src 'self' https://api.neynar.com https://mainnet.base.org https://eth.drpc.org " +
    "https://*.walletconnect.com https://*.walletconnect.org wss://*.walletconnect.com wss://*.walletconnect.org; " +
    "frame-ancestors 'self'; object-src 'none'",
  "cross-origin-opener-policy": "same-origin",
  "x-frame-options": "SAMEORIGIN",
  "x-content-type-options": "nosniff",
};

const PROD_HEADERS_FIXED = { ...PROD_HEADERS_COOP_SAME_ORIGIN, "cross-origin-opener-policy": "same-origin-allow-popups" };

test("live mode catches the pre-#94 prod COOP value", async () => {
  const res = await checkLive("https://supercompute.io", {
    fetchImpl: async () => new Response("", { status: 200, headers: PROD_HEADERS_COOP_SAME_ORIGIN }),
  });
  assert.equal(res.ok, false);
  assert.deepEqual(kinds(res), ["wrong-header-value"]);
  assert.equal(res.status, 200);
});

test("live mode passes on the fixed prod header set", async () => {
  const res = await checkLive("https://supercompute.io", {
    fetchImpl: async () => new Response("", { status: 200, headers: PROD_HEADERS_FIXED }),
  });
  assert.equal(res.ok, true, JSON.stringify(res.findings, null, 2));
  assert.equal(res.mode, "live");
});

test("live mode fails on a non-2xx status even when the headers look right", async () => {
  const res = await checkLive("https://supercompute.io", {
    fetchImpl: async () => new Response("nope", { status: 522, headers: PROD_HEADERS_FIXED }),
  });
  assert.equal(res.ok, false);
  assert.equal(res.findings[0].kind, "http-status");
});

test("live mode fails closed when the fetch itself fails", async () => {
  const res = await checkLive("https://supercompute.io", {
    fetchImpl: async () => {
      throw new Error("ENOTFOUND");
    },
  });
  assert.equal(res.ok, false);
  assert.equal(res.findings[0].kind, "unreachable");
});

/* ------------------------------------------------------------------- the CLI */

const run = (args) => spawnSync(process.execPath, [SCRIPT, ...args], { cwd: REPO, encoding: "utf8" });

test("CLI exits 0 on the repo's real public/_headers", () => {
  const out = run([]);
  assert.equal(out.status, 0, out.stdout + out.stderr);
  assert.match(out.stdout, /✓ PASS/);
  assert.match(out.stdout, /cross-origin-opener-policy/);
});

test("CLI exits 1 when COOP is mutated back to same-origin — proving the guard guards", () => {
  const file = tempHeaders(canonicalReal().replace(
    "Cross-Origin-Opener-Policy: same-origin-allow-popups",
    "Cross-Origin-Opener-Policy: same-origin",
  ));
  const out = run(["--file", file]);
  assert.equal(out.status, 1, out.stdout);
  assert.match(out.stdout, /✗ FAIL/);
  assert.match(out.stdout, /same-origin-allow-popups/);
});

test("CLI exits 1 on the same file with only the COOP line removed", () => {
  const file = tempHeaders(canonicalReal().replace(/^ {2}Cross-Origin-Opener-Policy:.*\n/m, ""));
  const out = run(["--file", file]);
  assert.equal(out.status, 1, out.stdout);
  assert.match(out.stdout, /NOT DECLARED/);
});

test("CLI --same-as fails when the built copy drifts from the source", () => {
  const file = tempHeaders(canonicalReal().replace(/^ {2}X-Content-Type-Options: nosniff$/m, "  X-Content-Type-Options: sniff"));
  const out = run(["--file", file, "--same-as", REAL]);
  assert.equal(out.status, 1, out.stdout);
  assert.match(out.stdout, /\[file-drift\]/);
});

test("CLI --json prints a parseable result", () => {
  const out = run(["--file", tempHeaders(canonicalReal()), "--json"]);
  assert.equal(out.status, 0, out.stdout + out.stderr);
  const parsed = JSON.parse(out.stdout);
  assert.equal(parsed.ok, true);
  assert.ok(Array.isArray(parsed.pins));
});

test("CLI fails closed on a missing source file", () => {
  const out = run(["--file", "/definitely/not/here/_headers"]);
  assert.equal(out.status, 1);
  assert.match(out.stdout, /unreadable-source/);
});
