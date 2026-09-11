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

import { checkExport, decodeCharRefs, readScriptSrc, refreshUrl, report, scanHtml, scriptSrcAllowsOrigin, urlSchemeOf } from "../../scripts/check-inline-scripts.mjs";

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

/**
 * R2 — the complete HTML spec "JavaScript MIME type" list. A short list is a
 * silent false negative: each of these executes in Chrome and is CSP-blocked,
 * while the gate reported PASS.
 */
const JS_MIME_TYPES_SPEC = [
  "application/ecmascript",
  "application/javascript",
  "application/x-ecmascript",
  "application/x-javascript",
  "text/ecmascript",
  "text/javascript",
  "text/javascript1.0",
  "text/javascript1.1",
  "text/javascript1.2",
  "text/javascript1.3",
  "text/javascript1.4",
  "text/javascript1.5",
  "text/jscript",
  "text/livescript",
  "text/x-ecmascript",
  "text/x-javascript",
];

test("fails on every JavaScript MIME type in the HTML spec's list", () => {
  assert.equal(JS_MIME_TYPES_SPEC.length, 16, "the spec list is 16 entries");
  for (const mime of JS_MIME_TYPES_SPEC) {
    const dir = fixture({ "index.html": PAGE(`<script type="${mime}">console.log(1)</script>`) });
    const { res, ok } = run(dir);
    assert.equal(ok, false, `type="${mime}" is executable and must fail`);
    assert.equal(res.violations[0].kind, "executable-inline-script", `type="${mime}"`);
  }
});

test("fails on a mixed-case JavaScript MIME type", () => {
  const dir = fixture({ "index.html": PAGE('<script type="TEXT/JavaScript">console.log(1)</script>') });
  assert.equal(run(dir).ok, false);
});

test("reports a parameterised JavaScript MIME type without failing (inert in Chrome)", () => {
  const dir = fixture({ "index.html": PAGE('<script type="text/javascript;charset=utf-8">console.log(1)</script>') });
  const { res, ok } = run(dir);
  assert.equal(ok, true, "Chrome treats `text/javascript;charset=utf-8` as inert — report, do not fail");
  assert.equal(res.violations.length, 0);
  assert.equal(res.totals.jsMimeEssence, 1);
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

/**
 * R1 — HTML attribute names are ASCII case-insensitive, so `ONERROR`/
 * `OnError`/`onErRoR` are one handler and all of them are CSP-blocked
 * (script-src-attr, browser-verified). The gate used to demand a literal
 * lowercase `on` prefix and stayed silent on every non-lowercase spelling.
 */
test("fails on an upper/mixed-case handler name", () => {
  for (const name of ["ONERROR", "OnError", "ONCLICK", "oNeRrOr"]) {
    const dir = fixture({ "index.html": PAGE("", `<img src="/a.png" ${name}="steal()">`) });
    const { res, ok } = run(dir);
    assert.equal(ok, false, `${name} is an enforced CSP violation and must fail`);
    assert.equal(res.violations[0].kind, "inline-event-handler", name);
  }
});

test("fails on ONERROR on a <script src=…> tag", () => {
  const dir = fixture({ "index.html": PAGE('<script src="/a.js" ONERROR="handleLoadError()"></script>') });
  const { res, ok } = run(dir);
  assert.equal(ok, false);
  assert.equal(res.violations[0].kind, "inline-event-handler");
  assert.equal(res.totals.externalScripts, 1);
});

test("does not treat a name that merely starts with `on`-ish text as a handler", () => {
  const dir = fixture({ "index.html": PAGE("", '<div on="x" onclick-not-a-handler="1" owner="me"></div>') });
  const { res, ok } = run(dir);
  assert.equal(ok, true);
  assert.equal(res.totals.inlineHandlers, 0);
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

test("does not count a closing tag as a style= attribute", () => {
  const dir = fixture({ "index.html": PAGE("<style>a{color:red}</style>") });
  const { res, ok } = run(dir);
  assert.equal(ok, true);
  assert.equal(res.totals.styleAttrs, 0);
});

test("passes on a raw <script> inside a <textarea> (RCDATA — inert in the browser)", () => {
  const dir = fixture({ "index.html": PAGE("", '<textarea><script>alert(1)</script></textarea><p>after</p>') });
  const { res, ok } = run(dir);
  assert.equal(ok, true, "textarea content is text, not markup — flagging it would be a spurious red build");
  assert.equal(res.totals.inlineScripts, 0);
});

test("keeps scanning markup after a <textarea> closes", () => {
  const dir = fixture({
    "index.html": PAGE("", '<textarea><script>x</script></textarea><img src="/a.png" onerror="boom()">'),
  });
  const { res, ok } = run(dir);
  assert.equal(ok, false);
  assert.equal(res.totals.inlineHandlers, 1);
  assert.equal(res.violations[0].kind, "inline-event-handler");
});

/* ------------------------------------------------------ cross-origin script src */

/**
 * R3 — `'self'` allows SAME-ORIGIN scripts only. Every `src` used to be printed
 * as "(external — allowed by script-src 'self')", which was untrue for an
 * absolute `src` and would have hidden a silently blocked CDN/analytics script.
 */
const CSP_SELF = "/*\n  Content-Security-Policy: default-src 'self'; script-src 'self'\n";

test("fails on a cross-origin <script src> when script-src ships", () => {
  const dir = fixture({
    "index.html": PAGE(DATA_BLOCK + '<script src="https://cdn.example.com/analytics.js"></script>'),
    _headers: CSP_SELF,
  });
  const { res, ok } = run(dir);
  assert.equal(ok, false);
  assert.equal(res.violations[0].kind, "cross-origin-script-src");
  assert.equal(res.totals.crossOriginScripts, 1);
  assert.equal(res.totals.sameOriginScripts, 0);
  assert.ok(res.crossOriginHosts.has("cdn.example.com"));
});

test("treats a protocol-relative <script src> as cross-origin", () => {
  const dir = fixture({
    "index.html": PAGE('<script src="//cdn.example.com/a.js"></script>'),
    _headers: CSP_SELF,
  });
  const { res, ok } = run(dir);
  assert.equal(ok, false);
  assert.equal(res.violations[0].kind, "cross-origin-script-src");
});

test("relative srcs are same-origin and never judged", () => {
  const dir = fixture({
    "index.html": PAGE(
      '<script src="/_next/a.js"></script><script src="a.js"></script><script src="./b.js"></script>',
    ),
    _headers: CSP_SELF,
  });
  const { res, ok } = run(dir);
  assert.equal(ok, true);
  assert.equal(res.violations.length, 0);
  assert.equal(res.totals.sameOriginScripts, 3);
  assert.equal(res.totals.crossOriginScripts, 0);
});

test("allows a cross-origin src whose host the shipped script-src names", () => {
  const dir = fixture({
    "index.html": PAGE('<script src="https://cdn.example.com/a.js"></script>'),
    _headers: "/*\n  Content-Security-Policy: script-src 'self' https://cdn.example.com\n",
  });
  const { res, ok } = run(dir);
  assert.equal(ok, true, "the policy allows this host, so the browser does not block it");
  assert.equal(res.violations.length, 0);
  assert.equal(res.totals.crossOriginScripts, 1);
});

test("counts cross-origin srcs without judging them before script-src ships", () => {
  const dir = fixture({
    "index.html": PAGE('<script src="https://cdn.example.com/a.js"></script>'),
    _headers: "/*\n  X-Frame-Options: DENY\n",
  });
  const { res, ok } = run(dir);
  assert.equal(ok, true, "no policy shipped => nothing to judge against (PR #59 ordering)");
  assert.equal(res.violations.length, 0);
  assert.equal(res.totals.crossOriginScripts, 1);
});

test("scriptSrcAllowsOrigin reads the host-source grammar", () => {
  const cdn = { host: "cdn.example.com", scheme: "https" };
  assert.equal(scriptSrcAllowsOrigin(cdn, "script-src 'self' https://cdn.example.com"), true);
  assert.equal(scriptSrcAllowsOrigin(cdn, "script-src 'self' https://cdn.example.com:443"), true);
  assert.equal(scriptSrcAllowsOrigin(cdn, "script-src 'self' https:"), true, "scheme source");
  assert.equal(scriptSrcAllowsOrigin({ host: "cdn.example.com", scheme: null }, "script-src 'self' http:"), true, "protocol-relative src can load under a scheme source");
  assert.equal(scriptSrcAllowsOrigin(cdn, "script-src *"), true);
  assert.equal(scriptSrcAllowsOrigin(cdn, "script-src 'self' 'unsafe-inline'"), false);
  assert.equal(scriptSrcAllowsOrigin({ host: "sub.cdn.example.com", scheme: "https" }, "script-src *.cdn.example.com"), true);
  assert.equal(scriptSrcAllowsOrigin(cdn, "script-src *.cdn.example.com"), false, "a wildcard does not cover the apex");
  assert.equal(scriptSrcAllowsOrigin(cdn, "script-src 'self' http:"), false, "wrong scheme");
  assert.equal(scriptSrcAllowsOrigin(cdn, null), null, "no policy shipped => nothing to judge");
});

/* ------------------------- attribute-carried execution surfaces ------------- */

/**
 * `iframe srcdoc` — an `about:srcdoc` document inherits the parent's policy
 * container, so an inline script inside the attribute is CSP-blocked exactly
 * like a top-level one. Browser-verified (Chrome, `script-src 'self'`, with a
 * `securitypolicyviolation` listener and an image beacon proving non-execution):
 * the srcdoc-internal script fired `script-src-elem`/`inline` and never ran, an
 * inline handler inside it fired `script-src-attr`, and a same-origin
 * `<script src>` inside it DID load (so the document is governed, not dropped).
 */
test("fails on an executable inline script inside an iframe srcdoc — the card's case", () => {
  const dir = fixture({ "index.html": PAGE(DATA_BLOCK, `<iframe srcdoc='<script>alert(1)</script>'></iframe>`) });
  const { res, ok } = run(dir);
  assert.equal(ok, false, "a srcdoc-carried inline script is blocked by script-src 'self' in production");
  assert.equal(res.violations.length, 1);
  assert.equal(res.violations[0].kind, "executable-inline-script");
  assert.match(res.violations[0].detail, /srcdoc/);
  assert.equal(res.violations[0].line, 1, "the finding points at the attribute in the outer document");
  assert.equal(res.totals.srcdocDocuments, 1);
});

test("fails on an inline handler inside an iframe srcdoc", () => {
  const dir = fixture({ "index.html": PAGE(DATA_BLOCK, `<iframe srcdoc='<img src="x" onerror="alert(1)">'></iframe>`) });
  const { res, ok } = run(dir);
  assert.equal(ok, false);
  assert.equal(res.violations[0].kind, "inline-event-handler");
  assert.equal(res.totals.inlineHandlers, 1);
});

test("merges a srcdoc document's counters and does not flag inert markup (negative control)", () => {
  const dir = fixture({
    "index.html": PAGE(DATA_BLOCK, `<iframe srcdoc='<script src="/child.js"></script><p>inert</p>'></iframe>`),
  });
  const { res, ok } = run(dir);
  assert.equal(ok, true, "a same-origin external script inside srcdoc is allowed by 'self'");
  assert.equal(res.violations.length, 0);
  assert.equal(res.totals.srcdocDocuments, 1);
  assert.equal(res.totals.sameOriginScripts, 1);
  assert.equal(res.totals.inlineScripts, 1, "only the outer __NEXT_DATA__ data block");
});

test("fails on a srcdoc nested inside a srcdoc (recursion)", () => {
  const dir = fixture({
    "index.html": PAGE(
      DATA_BLOCK,
      `<iframe srcdoc="<iframe srcdoc='<script>alert(1)</script>'></iframe>"></iframe>`,
    ),
  });
  const { res, ok } = run(dir);
  assert.equal(ok, false, "each nested about:srcdoc document inherits the policy in turn");
  assert.equal(res.violations[0].kind, "executable-inline-script");
  assert.equal(res.totals.srcdocDocuments, 2);
});

test("fails loudly when srcdoc nesting exceeds the scanner's depth cap", () => {
  // Entity-escaped per level, the way a serializer does it — which is also the
  // only way to nest more than two levels in real markup.
  const escapeAttr = (s) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  let body = "<script>alert(1)</script>";
  for (let i = 0; i < 6; i++) body = `<iframe srcdoc="${escapeAttr(body)}"></iframe>`;
  const dir = fixture({ "index.html": PAGE(DATA_BLOCK, body) });
  const { res, ok } = run(dir);
  assert.equal(ok, false, "markup the scanner cannot follow must not pass silently");
  assert.ok(res.violations.some((f) => f.kind === "srcdoc-nesting-depth"), JSON.stringify(res.violations));
});

/**
 * The entity-escaped form, which is what a React/JSX build actually emits for
 * `srcdoc={html}`. Browser-verified: the srcdoc document decoded it into a real
 * inline script and blocked it (`script-src-elem`), the escaped handler fired
 * `script-src-attr`, and no beacon for either ever arrived — while the escaped
 * same-origin `<script src>` next to them DID load.
 */
test("fails on an entity-escaped srcdoc script — the shape a React export emits", () => {
  const dir = fixture({
    "index.html": PAGE(
      DATA_BLOCK,
      `<iframe srcdoc="&lt;script src=&quot;/child.js&quot;&gt;&lt;/script&gt;&lt;script&gt;alert(1)&lt;/script&gt;&lt;img src=x onerror=&quot;alert(2)&quot;&gt;"></iframe>`,
    ),
  });
  const { res, ok } = run(dir);
  assert.equal(ok, false, "the browser decodes the attribute value into a real inline script");
  assert.deepEqual(
    res.violations.map((f) => f.kind).sort(),
    ["executable-inline-script", "inline-event-handler"],
    JSON.stringify(res.violations),
  );
  assert.equal(res.totals.sameOriginScripts, 1, "the escaped same-origin src inside the srcdoc is counted");
});

test("fails on an entity-escaped srcdoc nested inside an escaped srcdoc", () => {
  const dir = fixture({
    "index.html": PAGE(
      DATA_BLOCK,
      `<iframe srcdoc="&lt;iframe srcdoc=&quot;&amp;lt;script&amp;gt;alert(1)&amp;lt;/script&amp;gt;&quot;&gt;&lt;/iframe&gt;"></iframe>`,
    ),
  });
  const { res, ok } = run(dir);
  assert.equal(ok, false, "each level decodes once, exactly like the tokenizer");
  assert.equal(res.violations[0].kind, "executable-inline-script");
  assert.equal(res.totals.srcdocDocuments, 2);
});

test("passes on a srcdoc escaped twice — that is text, not markup (negative control)", () => {
  const dir = fixture({
    "index.html": PAGE(DATA_BLOCK, `<iframe srcdoc="&amp;lt;script&amp;gt;alert(1)&amp;lt;/script&amp;gt;"></iframe>`),
  });
  const { res, ok } = run(dir);
  assert.equal(ok, true, "one decode leaves '&lt;script&gt;' as literal text in the srcdoc document");
  assert.equal(res.violations.length, 0);
  assert.equal(res.totals.srcdocDocuments, 1);
});

test("does not flag a sandboxed srcdoc that cannot execute scripts (inert, browser-verified)", () => {
  const dir = fixture({
    "index.html": PAGE(
      DATA_BLOCK,
      `<iframe sandbox="allow-same-origin" srcdoc='<script>alert(1)</script>'></iframe>`,
    ),
  });
  const { res, ok } = run(dir);
  assert.equal(ok, true, "sandbox without allow-scripts executes nothing and fires no violation");
  assert.equal(res.totals.inertSrcdoc, 1);
  assert.equal(res.totals.srcdocDocuments, 0);
});

test("still flags a sandboxed srcdoc that does allow scripts", () => {
  const dir = fixture({
    "index.html": PAGE(DATA_BLOCK, `<iframe sandbox="allow-scripts" srcdoc='<script>alert(1)</script>'></iframe>`),
  });
  const { res, ok } = run(dir);
  assert.equal(ok, false);
  assert.equal(res.totals.srcdocDocuments, 1);
  assert.equal(res.totals.inertSrcdoc, 0);
});

test("judges a cross-origin <script src> inside a srcdoc against the shipped script-src", () => {
  const dir = fixture({
    "index.html": PAGE(DATA_BLOCK, `<iframe srcdoc='<script src="https://cdn.example.com/a.js"></script>'></iframe>`),
    _headers: CSP_SELF,
  });
  const { res, ok } = run(dir);
  assert.equal(ok, false);
  assert.equal(res.violations[0].kind, "cross-origin-script-src");
  assert.ok(res.crossOriginHosts.has("cdn.example.com"));
});

/**
 * `javascript:` URLs on href/action/formaction. Element-initiated javascript:
 * execution is a hyperlink traversal or a form submission; the URL is run as
 * script and refused by the `script-src` inline check. Browser-verified: click
 * on each of these fired `script-src-elem`/`blockedURI: inline` (forms: shipped
 * `form-action` first), no beacon ever arrived, and the flag never got set.
 */
test("fails on href=javascript: — the card's case", () => {
  const dir = fixture({ "index.html": PAGE(DATA_BLOCK, `<a href="javascript:alert(1)">x</a>`) });
  const { res, ok } = run(dir);
  assert.equal(ok, false);
  assert.equal(res.violations[0].kind, "javascript-url");
  assert.equal(res.totals.javascriptUrls, 1);
});

test("fails on a form action= and a per-button formaction= javascript: URL", () => {
  const dir = fixture({
    "index.html": PAGE(
      DATA_BLOCK,
      `<form action="javascript:alert(1)"><button formaction="javascript:alert(2)">go</button></form>`,
    ),
  });
  const { res, ok } = run(dir);
  assert.equal(ok, false);
  assert.equal(res.violations.length, 2);
  assert.deepEqual([...new Set(res.violations.map((f) => f.kind))], ["javascript-url"]);
  assert.equal(res.totals.javascriptUrls, 2);
});

/**
 * Every spelling below is one Chrome's URL parser resolved to a `javascript:`
 * URL (read back from `.href` on the live element), and each was clicked and
 * confirmed blocked. The scanner reads raw markup, so it has to do the same
 * character-reference decoding the HTML tokenizer does before the URL parser
 * ever sees the value.
 */
const JAVASCRIPT_URL_SPELLINGS = [
  "javascript:alert(1)",
  "JaVaScRiPt:alert(1)",
  " javascript:alert(1)",
  "&#9;javascript:alert(1)",
  "java&#9;script:alert(1)",
  "&#106;avascript:alert(1)",
  "javascript&colon;alert(1)",
  "javascript&#58;alert(1)",
  "jav&#x61;script:alert(1)",
  "&Tab;javascript:alert(1)",
  "javascript&#10;:alert(1)",
  "jav&#x09;ascript:alert(1)",
  "&#106avascript:alert(1)",
  "&#0000106;avascript:alert(1)",
];

test("fails on every javascript: spelling Chrome resolves to one", () => {
  for (const spelling of JAVASCRIPT_URL_SPELLINGS) {
    const dir = fixture({ "index.html": PAGE(DATA_BLOCK, `<a href="${spelling}">x</a>`) });
    const { res, ok } = run(dir);
    assert.equal(ok, false, `href="${spelling}" is a javascript: URL and must fail`);
    assert.equal(res.violations[0].kind, "javascript-url", spelling);
  }
});

/**
 * Negative controls: Chrome resolved each of these to a RELATIVE URL, not a
 * javascript: URL (browser-verified `.href`), so flagging them would be a
 * false red build. `&Colon;` is not `:` (Chrome maps it to U+2237), `&tab;` is
 * not an HTML5 reference at all, and a leading `"` survives URL preprocessing.
 */
test("passes on hrefs that only look like javascript: URLs", () => {
  const inert = [
    "javascript&Colon;alert(1)",
    "&tab;javascript:alert(1)",
    "&quot;javascript:alert(1)",
    "https://example.com/javascript:x",
    "/relative/javascript:1",
    "#javascript:1",
    "mailto:someone@example.com",
    "alert(1)",
  ];
  for (const value of inert) {
    const dir = fixture({ "index.html": PAGE(DATA_BLOCK, `<a href="${value}">x</a>`) });
    const { res, ok } = run(dir);
    assert.equal(ok, true, `href="${value}" is not a javascript: URL`);
    assert.equal(res.totals.javascriptUrls, 0, value);
  }
});

test("does not flag javascript: text that is not a URL attribute value", () => {
  const dir = fixture({
    "index.html": PAGE(
      DATA_BLOCK +
        '<script type="application/json">{"next":"javascript:alert(1)"}</script>' +
        '<a data-href="javascript:alert(1)">x</a>',
      "<p>javascript:alert(1)</p>",
    ),
  });
  const { res, ok } = run(dir);
  assert.equal(ok, true, "only the attributes the browser resolves and executes are judged");
  assert.equal(res.totals.javascriptUrls, 0);
});

test("fails on a meta refresh whose url= is a javascript: URL", () => {
  const dir = fixture({
    "index.html": PAGE(
      DATA_BLOCK,
      `<meta http-equiv="refresh" content="0;url=javascript:alert(1)">`,
    ),
  });
  const { res, ok } = run(dir);
  assert.equal(ok, false);
  assert.equal(res.violations[0].kind, "javascript-url");
});

test("passes on meta refreshes that navigate somewhere ordinary", () => {
  for (const content of ["30", "0;url=/next", "0; url='https://example.com'", "0;url=index.html"]) {
    const dir = fixture({ "index.html": PAGE(DATA_BLOCK, `<meta http-equiv="refresh" content="${content}">`) });
    const { res, ok } = run(dir);
    assert.equal(ok, true, `content="${content}" is not a javascript: URL`);
  }
});

test("urlSchemeOf agrees with Chrome's own answer for the 17 probed spellings", () => {
  // Left column: raw attribute value. Right: what Chrome's `.href` resolved it
  // to — `javascript:…` or a relative URL (browser-verified, jsurl-variants.html).
  const resolvedToJavascript = [
    "javascript:alert(1)",
    "JaVaScRiPt:alert(1)",
    " javascript:alert(1)",
    "&#9;javascript:alert(1)",
    "java&#9;script:alert(1)",
    "&#106;avascript:alert(1)",
    "javascript&colon;alert(1)",
    "javascript&#58;alert(1)",
    "jav&#x61;script:alert(1)",
    "&Tab;javascript:alert(1)",
    "javascript&#10;:alert(1)",
    "jav&#x09;ascript:alert(1)",
    "&#106avascript:alert(1)",
    "&#0000106;avascript:alert(1)",
  ];
  for (const value of resolvedToJavascript) assert.equal(urlSchemeOf(value), "javascript", value);

  const resolvedToRelative = ["javascript&Colon;alert(1)", "&tab;javascript:alert(1)", '&quot;javascript:alert(1)'];
  for (const value of resolvedToRelative) assert.notEqual(urlSchemeOf(value), "javascript", value);

  assert.equal(urlSchemeOf(undefined), null);
  assert.equal(urlSchemeOf(""), null);
  assert.equal(urlSchemeOf("https://example.com/a"), "https");
  assert.equal(urlSchemeOf("MAILTO:a@b.c"), "mailto");
});

test("decodeCharRefs decodes numeric references and only the named ones HTML defines", () => {
  assert.equal(decodeCharRefs("&#106;"), "j");
  assert.equal(decodeCharRefs("&#x6a;"), "j");
  assert.equal(decodeCharRefs("&#0000106;"), "j");
  assert.equal(decodeCharRefs("&colon;"), ":");
  assert.equal(decodeCharRefs("&Tab;"), "\t");
  assert.equal(decodeCharRefs("&NewLine;"), "\n");
  assert.equal(decodeCharRefs("&lt;script&gt;"), "<script>", "the escaped form a serializer emits");
  assert.equal(decodeCharRefs("&quot;a&quot;"), '"a"');
  assert.equal(decodeCharRefs("&amp;amp;"), "&amp;", "decoded ONCE — no re-decoding of its own output");
  assert.equal(decodeCharRefs("&Colon;"), "&Colon;", "Chrome maps this to U+2237, not ':'");
  assert.equal(decodeCharRefs("&tab;"), "&tab;", "not an HTML5 named reference");
});

test("refreshUrl reads the url= target of a refresh directive", () => {
  assert.equal(refreshUrl("0;url=javascript:alert(1)"), "javascript:alert(1)");
  assert.equal(refreshUrl("0; URL = 'https://example.com'"), "https://example.com");
  assert.equal(refreshUrl("30"), null);
  assert.equal(refreshUrl("0;url=/next"), "/next");
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
