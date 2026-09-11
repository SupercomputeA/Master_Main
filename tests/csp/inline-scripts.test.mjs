/**
 * Tests for scripts/check-inline-scripts.mjs — the CI gate that keeps
 * `script-src 'self'` (public/_headers) safe.
 *
 * The gate itself has to be tested: a security assertion that silently stops
 * matching is worse than no assertion, because the policy is then declared safe
 * on its word.
 *
 * Run:  node --test tests/csp/
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { checkExport, readScriptSrc, report, scanHtml } from "../../scripts/check-inline-scripts.mjs";

const quiet = { stdout: () => {} };

/** Build a throwaway export dir. `files` maps relative path -> contents. */
function fixture(files) {
  const dir = mkdtempSync(join(tmpdir(), "csp-inline-"));
  for (const [rel, contents] of Object.entries(files)) {
    const full = join(dir, rel);
    mkdirSync(join(full, ".."), { recursive: true });
    writeFileSync(full, contents);
  }
  return dir;
}

const PAGE = (head, body = "<p>hi</p>") => `<!DOCTYPE html><html><head>${head}</head><body>${body}</body></html>`;
const DATA_BLOCK = '<script id="__NEXT_DATA__" type="application/json">{"props":{}}</script>';

function run(dir, opts = {}) {
  const res = checkExport(dir, opts);
  return { res, ok: report(res, quiet) };
}

/* ------------------------------------------------------------- the invariant */

test("clean export with data-block scripts only passes", () => {
  const dir = fixture({
    "index.html": PAGE(
      DATA_BLOCK +
        '<script type="application/ld+json">{"@context":"https://schema.org"}</script>' +
        '<script type="speculationrules">{"prerender":[]}</script>' +
        '<script src="/_next/static/chunks/a.js" defer></script>',
    ),
    "terms.html": PAGE(DATA_BLOCK),
  });
  const { res, ok } = run(dir);
  assert.equal(ok, true);
  assert.equal(res.violations.length, 0);
  assert.equal(res.totals.inlineScripts, 4);
  assert.equal(res.totals.externalScripts, 1);
});

test("fails on an executable inline script with no type — the card's alert(1) case", () => {
  const dir = fixture({ "index.html": PAGE(DATA_BLOCK + "<script>alert(1)</script>") });
  const { res, ok } = run(dir);
  assert.equal(ok, false);
  assert.equal(res.violations.length, 1);
  assert.equal(res.violations[0].kind, "executable-inline-script");
  assert.equal(res.violations[0].line, 1);
});

test("fails on type=text/javascript", () => {
  const dir = fixture({ "index.html": PAGE('<script type="text/javascript">console.log(1)</script>') });
  assert.equal(run(dir).ok, false);
});

test("fails on type=application/javascript (legacy alias included)", () => {
  const dir = fixture({ "index.html": PAGE('<script type="application/javascript">console.log(1)</script>') });
  assert.equal(run(dir).ok, false);
});

test("fails on type=module with an inline body", () => {
  const dir = fixture({ "index.html": PAGE('<script type="module">import x from "/y.js"</script>') });
  const { res, ok } = run(dir);
  assert.equal(ok, false);
  assert.match(res.violations[0].detail, /type="module"/);
});

test("fails on an empty type attribute (defaults to JavaScript)", () => {
  const dir = fixture({ "index.html": PAGE('<script type="">alert(1)</script>') });
  assert.equal(run(dir).ok, false);
});

test("passes on an unknown non-JS type (data block by contract)", () => {
  const dir = fixture({ "index.html": PAGE('<script type="text/template"><b>tpl</b></script>') });
  assert.equal(run(dir).ok, true);
});

/* ------------------------------------------------------- inline event handler */

test("fails on an inline event handler attribute", () => {
  const dir = fixture({ "index.html": PAGE("", '<img src="/a.png" onerror="steal()">') });
  const { res, ok } = run(dir);
  assert.equal(ok, false);
  assert.equal(res.violations[0].kind, "inline-event-handler");
});

test("fails on a handler on a <script> tag — regression: scripts are tags too", () => {
  const dir = fixture({
    "index.html": PAGE('<script type="module" src="http://localhost:4001/src/main.tsx" onerror="handleLoadError()"></script>'),
  });
  const { res, ok } = run(dir);
  assert.equal(ok, false);
  assert.equal(res.violations.length, 1);
  assert.equal(res.violations[0].kind, "inline-event-handler");
  assert.equal(res.totals.externalScripts, 1, "src-carrying script still counts as external");
});

test("fails on a single-quoted handler value", () => {
  const dir = fixture({ "index.html": PAGE("", "<body onclick='go()'>") });
  assert.equal(run(dir).ok, false);
});

/* --------------------------------------------------- must NOT false-positive */

test("passes on a commented-out executable script (inert)", () => {
  const dir = fixture({ "index.html": PAGE("<!-- <script>alert(1)</script> -->" + DATA_BLOCK) });
  const { res, ok } = run(dir);
  assert.equal(ok, true);
  assert.equal(res.totals.inlineScripts, 1);
});

test("passes when markup appears inside a quoted attribute value", () => {
  const dir = fixture({ "index.html": PAGE("", '<div data-x="<script>alert(1)</script>" onclick-not-a-handler="1"></div>') });
  const { res, ok } = run(dir);
  assert.equal(ok, true);
  assert.equal(res.violations.length, 0);
});

test("ignores a bare '<' in text content", () => {
  const dir = fixture({ "index.html": PAGE("", "<p>a < b and ondrop=nope</p>") });
  const { res, ok } = run(dir);
  assert.equal(ok, true);
  assert.equal(res.totals.inlineHandlers, 0);
});

test("counts style= attributes without failing (drift visibility)", () => {
  const dir = fixture({ "index.html": PAGE("", '<div style="color:red"><span style="top:0"></span></div>') });
  const { res, ok } = run(dir);
  assert.equal(ok, true);
  assert.equal(res.totals.styleAttrs, 2);
});

/* --------------------------------------------------------------------- wasm */

test("fails when a .wasm file reaches the export", () => {
  const dir = fixture({ "index.html": PAGE(DATA_BLOCK), "_next/static/chunks/mod.wasm": "\0asm" });
  const { res, ok } = run(dir);
  assert.equal(ok, false);
  assert.equal(res.wasm.length, 1);
});

/* ---------------------------------------------------------------- exceptions */

test("an excepted path reports its violations but does not fail the build", () => {
  const dir = fixture({ "admin/index.html": PAGE("<script>alert('dev')</script>") });
  const { res, ok } = run(dir);
  assert.equal(ok, true, "excepted file must not fail the build");
  assert.equal(res.violations.length, 0);
  assert.equal(res.excepted.length, 1);
  assert.equal(res.excepted[0].rel, "admin/index.html");
  assert.equal(res.excepted[0].findings.length, 1);
});

test("--strict ignores exceptions and fails", () => {
  const dir = fixture({ "admin/index.html": PAGE("<script>alert('dev')</script>") });
  const { res, ok } = run(dir, { strict: true });
  assert.equal(ok, false);
  assert.equal(res.violations.length, 1);
});

test("an exception whose file is clean is reported stale (warning, not failure)", () => {
  const dir = fixture({ "admin/index.html": PAGE(DATA_BLOCK) });
  const { res, ok } = run(dir);
  assert.equal(ok, true);
  assert.equal(res.staleExceptions.length, 1);
  assert.match(res.staleExceptions[0].why, /clean/);
});

test("an exception whose file is gone is reported stale", () => {
  const dir = fixture({ "index.html": PAGE(DATA_BLOCK) });
  const { res, ok } = run(dir);
  assert.equal(ok, true);
  assert.equal(res.staleExceptions.length, 1);
  assert.match(res.staleExceptions[0].why, /not in the export/);
});

/* -------------------------------------------------------------- the policy */

test("reads the script-src directive out of out/_headers", () => {
  const dir = fixture({
    "index.html": PAGE(DATA_BLOCK),
    _headers: "/*\n  Content-Security-Policy: default-src 'self'; script-src 'self'; object-src 'none'\n",
  });
  const { res } = run(dir);
  assert.equal(res.scriptSrc, "script-src 'self'");
});

test("script-src absence is reported as null (pre-PR-#59 trees)", () => {
  const dir = fixture({ "index.html": PAGE(DATA_BLOCK), _headers: "/*\n  X-Frame-Options: DENY\n" });
  const { res, ok } = run(dir);
  assert.equal(res.scriptSrc, null);
  assert.equal(ok, true);
});

/* ----------------------------------------------------------------- plumbing */

test("throws a useful error when the export dir is missing or has no html", () => {
  assert.throws(() => checkExport("/definitely/not/here"), /export directory not found/);
  const empty = fixture({ "readme.txt": "nothing" });
  assert.throws(() => checkExport(empty), /no \.html files/);
});

test("scanHtml reports 1-based line numbers and never mutates its input", () => {
  const html = ["<html>", "<body>", "<script>alert(1)</script>", "</body>", "</html>"].join("\n");
  const before = String(html);
  const res = scanHtml(html, "t.html");
  assert.equal(res.findings[0].line, 3);
  assert.equal(html, before);
});
