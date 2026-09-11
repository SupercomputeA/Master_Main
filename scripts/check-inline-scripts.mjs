#!/usr/bin/env node
/**
 * check-inline-scripts.mjs — assert the static export ships no executable
 * inline <script> bodies and no inline event handler attributes.
 *
 * WHAT IT GUARDS
 * --------------
 * `public/_headers` pins `script-src 'self'` (no nonce, no hash, no
 * 'unsafe-inline'). That policy is only *safe* because every inline <script>
 * the build emits is a DATA BLOCK — `type="application/json"` (Next.js
 * `__NEXT_DATA__`), `application/ld+json`, `speculationrules` — and CSP does
 * not apply to a non-JavaScript script body. The moment one *executable*
 * inline script appears, every page carrying it degrades silently in
 * production: the browser blocks the script, logs a CSP violation, and
 * nothing in CI notices.
 *
 * This script is that missing CI gate. It walks the built export, parses every
 * .html file, and exits non-zero when the invariant is broken.
 *
 *   node scripts/check-inline-scripts.mjs [export-dir] [--strict]
 *
 *   export-dir  default `out` — the directory `npx next build` writes.
 *   --strict    ignore ALLOWED_EXCEPTIONS below (fail on every violation).
 *
 * Exit: 0 = invariant holds, 1 = invariant broken (or no export found).
 *
 * WHY STATIC INSPECTION AND NOT A SERVED-PAGE PROBE
 * -------------------------------------------------
 * CSP violations exist only at runtime, so "serve out/ and look for console
 * errors" only covers the pages a probe happens to visit and needs a browser in
 * CI. The invariant is a property of the emitted markup, so it is checked by
 * parsing the markup: deterministic, no browser, covers all 154 files.
 *
 * ---------------------------------------------------------------------------
 * KNOWN BREAKERS — re-verify `script-src 'self'` before any of these
 * ---------------------------------------------------------------------------
 * 1. Next.js **App Router**. RSC flight data is emitted as *executable* inline
 *    script (`self.__next_f.push(...)`), which `script-src 'self'` blocks. This
 *    app is on the Pages Router (static export) — if a routing/framework
 *    migration is ever proposed, this assertion fails first, and that failure
 *    is the trigger to re-derive the CSP (nonce/hash pipeline, or
 *    `'unsafe-inline'`, or dropping the static export). Do not silence this
 *    check to let such a migration through.
 * 2. Any inline <script> body hand-written in `public/`, any `next/script` with
 *    an inline body, or a new `public/**` SPA copied verbatim into the export
 *    (it is not framework output, so nothing regenerates its markup for you).
 *    The one such file we ship today is excepted below.
 * 3. Any `.wasm` file reaching the export. `WebAssembly.compile/instantiate`
 *    needs `'wasm-unsafe-eval'` in `script-src`; without it the module dies at
 *    runtime with a CSP violation. There are 0 `.wasm` files today (Turbopack's
 *    lazy loader references `WebAssembly` from ~52 chunks but never fires), so
 *    a new `.wasm` is a policy decision, not a build detail — this check fails
 *    loudly so the decision gets made on purpose.
 *
 * ALLOWED inline scripts: any <script> WITHOUT `src` whose `type` attribute is
 * present and is NOT a JavaScript MIME type.
 *
 * ALLOWED external scripts: a <script src> whose `src` is a relative reference
 * (same-origin by construction), plus — when the shipped `script-src` names its
 * host — an absolute one. `'self'` allows SAME-ORIGIN only, so a cross-origin
 * `src` is a violation and is reported as one, not printed as "allowed".
 *
 * ATTRIBUTE-CARRIED EXECUTION SURFACES — each browser-verified with a
 * `securitypolicyviolation` listener under `script-src 'self'` plus an image
 * beacon proving whether the script actually ran (see docs/csp-inline-script-
 * invariant.md for the run):
 *
 * 1. `javascript:` URLs on `href` / `action` / `formaction` (and a
 *    `<meta http-equiv="refresh">` `url=`). Element-initiated javascript:
 *    execution is exactly a hyperlink traversal and a form submission, and the
 *    URL the browser runs is subject to the `script-src` inline check: every
 *    spelling Chrome resolves to `javascript:` — mixed case, HTML character
 *    references (`&#106;`, `&colon;`, `&Tab;`), embedded tab/newline — is
 *    blocked (`script-src-elem`, `blockedURI` `inline`) and the handler never
 *    fires. On a form it is refused one step earlier by the shipped
 *    `form-action 'self'` (`blockedURI` `javascript`), and by `script-src`
 *    itself when no `form-action` ships. Either way: silently dead markup.
 *
 * 2. `srcdoc` on `<iframe>`. An `about:srcdoc` document inherits the parent's
 *    policy container, so its `<script>` bodies are blocked exactly like a
 *    top-level one (`script-src-elem`) and its inline handlers as
 *    `script-src-attr` — while a same-origin `<script src>` inside it still
 *    loads (verified: the srcdoc-internal control script ran). The value is
 *    therefore scanned recursively as the document it becomes — including the
 *    entity-escaped form a React/JSX build emits
 *    (`srcdoc="&lt;script&gt;…"`), which the browser decodes into the same
 *    blocked script.
 *
 * NOT A PROBLEM, verified — do not "fix" by loosening:
 *   - `sandbox` on an iframe WITHOUT `allow-scripts`: nothing in its `srcdoc`
 *     executes and no violation fires. Flagging it would be a false red build,
 *     so that value is skipped (and counted as `inertSrcdoc`).
 *   - `data:`/`blob:` in `<iframe src>`, `<object data>`, `<embed src>`: refused
 *     by the shipped `frame-src 'self'` / `object-src 'none'` (`frame-src` /
 *     `object-src` violations), and Chrome refuses top-level navigation to a
 *     `data:` URL — no execution surface.
 *   - `<svg><script>`, `<template><script>`, `<noscript><script>` are inert in a
 *     browser but ARE flagged below: that is the fail-loud direction (a false
 *     red build, not a silent pass). Left as-is on purpose.
 *
 * INERT CONTENT SKIPPED: `<textarea>` bodies are RCDATA — the browser never
 * parses markup inside them — so a raw `<script>` there is not a violation and
 * must not fail the build. `<title>` is deliberately NOT skipped: SVG `<title>`
 * is parsed as markup, so skipping it could hide a real script.
 *
 * NOT failed here (reported for drift visibility only): `style=` attribute
 * count (`style-src` currently allows 'unsafe-inline'), `http://localhost`
 * references, a parameterised JS MIME type (`text/javascript;charset=utf-8` is
 * inert in Chrome but a JS-MIME essence match per spec), and the `script-src`
 * line read out of `public/_headers`.
 */

import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join, relative, sep } from "node:path";

/**
 * MIME types that make an inline <script> EXECUTABLE (and thus CSP-blocked).
 *
 * The complete HTML spec "JavaScript MIME type" list (16 entries) plus the
 * `module` keyword. Each entry was browser-verified to execute and to be
 * CSP-blocked under `script-src 'self'`; an incomplete list is a silent false
 * negative, which is the whole failure mode this file exists to remove.
 */
const JS_MIME_TYPES = new Set([
  "module", // not a MIME type: the `type="module"` keyword, which executes as JS
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
]);

/**
 * Attributes the browser resolves as a URL and *executes* as script when the
 * scheme is `javascript:`. Element-initiated javascript: URLs are run for a
 * hyperlink traversal (`href`) and a form submission (`action`, plus the
 * per-button `formaction` override) — and for nothing else: a `javascript:` URL
 * in `<iframe src>`, `<img src>` etc. is a load error, not script, so those are
 * deliberately not flagged (a rule there would be a false red build).
 */
const URL_SCRIPT_ATTRS = new Set(["href", "action", "formaction"]);

/** `sandbox` token list, case-insensitive, that lets a frame execute scripts. */
const SANDBOX_ALLOW_SCRIPTS = /(?:^|\s)allow-scripts(?:\s|$)/i;

/**
 * HTML character references that decodeCharRefs handles, matched EXACTLY as the
 * HTML5 named table does (case-sensitive):
 *   - `&colon;` -> `:` — confirmed to still resolve to a javascript: URL
 *   - `&Tab;` / `&NewLine;` -> whitespace the URL parser strips
 *   - the set an HTML serializer emits: `&amp;` `&lt;` `&gt;` `&quot;` `&apos;`
 *     (and their `&AMP;`-style uppercase duplicates). This is what makes an
 *     entity-escaped `srcdoc` visible at all: a React/JSX build emits
 *     `<iframe srcdoc="&lt;script&gt;…">`, and the browser decodes it into a
 *     real `<script>` inside the srcdoc document — browser-verified as a
 *     `script-src-elem` violation with no execution.
 *   - `&Colon;` is NOT `:` (Chrome resolves it to U+2237) and `&tab;` is not a
 *     reference at all, both browser-verified; decoding them would invent a
 *     javascript: URL the browser never sees. Deliberately absent.
 * The full 2231-entry table is deliberately not implemented: the entries above
 * are the ones that can produce markup or a URL scheme. Decoding happens ONCE
 * per pass, per document level, exactly like the HTML tokenizer — a value
 * escaped twice must stay inert (`&amp;lt;script&amp;gt;` is text, not markup).
 *
 * Numeric references (`&#106;`, `&#x6a;`, and — browser-verified — the
 * semicolon-less form `&#106avascript:`, which Chrome still decodes) are
 * handled in the same function.
 */
const NAMED_CHAR_REFS = new Map([
  ["amp", "&"],
  ["AMP", "&"],
  ["lt", "<"],
  ["LT", "<"],
  ["gt", ">"],
  ["GT", ">"],
  ["quot", '"'],
  ["QUOT", '"'],
  ["apos", "'"],
  ["colon", ":"],
  ["Tab", "\t"],
  ["NewLine", "\n"],
]);

/** Depth cap for `srcdoc` recursion; past it the scanner fails loudly. */
export const MAX_SRCDOC_DEPTH = 5;

/** Decode the character references that can matter to markup or a URL scheme. */
export function decodeCharRefs(value) {
  return value.replace(
    /&(#[0-9]+;?|#[xX][0-9a-fA-F]+;?|amp;|AMP;|lt;|LT;|gt;|GT;|quot;|QUOT;|apos;|colon;|Tab;|NewLine;)/g,
    (match, body) => {
      if (body[0] === "#") {
        const hex = body[1] === "x" || body[1] === "X";
        const code = parseInt(body.slice(hex ? 2 : 1).replace(/;$/, ""), hex ? 16 : 10);
        if (!Number.isFinite(code) || code <= 0 || code > 0x10ffff) return match;
        try {
          return String.fromCodePoint(code);
        } catch {
          return match;
        }
      }
      const named = NAMED_CHAR_REFS.get(body.replace(/;$/, ""));
      return named === undefined ? match : named;
    },
  );
}

/**
 * The URL scheme a browser will see in an attribute value, or `null`.
 *
 * Mirrors the URL parser's own preprocessing: decode HTML character references
 * (the HTML tokenizer does this before the value ever reaches the URL parser),
 * strip leading/trailing C0 controls and spaces, then remove tab/LF/CR
 * anywhere, then read the scheme. Verified against Chrome's own `.href`
 * resolution for 17 spellings of `javascript:` — the rule must not invent one
 * the browser does not see, nor miss one it does.
 */
export function urlSchemeOf(rawValue) {
  if (rawValue === undefined || rawValue === null) return null;
  let value = decodeCharRefs(String(rawValue));
  value = value.replace(/^[\u0000-\u0020]+/, "").replace(/[\u0000-\u0020]+$/, "");
  value = value.replace(/[\t\n\r]/g, "");
  const match = /^([a-zA-Z][a-zA-Z0-9+.-]*):/.exec(value);
  return match ? match[1].toLowerCase() : null;
}

/** The `url=` target of a `<meta http-equiv="refresh">` `content` value. */
export function refreshUrl(content) {
  const match = /\burl\s*=\s*(.*)$/is.exec(content);
  if (!match) return null;
  return match[1].trim().replace(/^(['"])(.*)\1$/s, "$2").trim();
}

/**
 * Path-scoped, shrink-only exceptions. A path is export-relative and POSIX.
 * Rules for this map:
 *   - Every entry names an OWNER CARD that removes the need for it.
 *   - Entries are counted and printed on every run; they are never silent.
 *   - An entry that is no longer needed (file clean, or file gone) raises a
 *     loud warning so it gets deleted. It is a warning, not a failure because
 *     the condition it names is pre-existing AND owned by another card: failing
 *     `validate` here would block the deploy lane for every branch until that
 *     other card lands, which is how guards get switched off. The warning
 *     prints the removal instruction on every run instead.
 *   - `--strict` ignores this map entirely.
 */
export const ALLOWED_EXCEPTIONS = new Map([
  [
    "admin/index.html",
    {
      reason:
        "Legacy TinaCMS/Vite admin SPA copied verbatim from public/admin/index.html. Its markup is a " +
        "dev-mode Vite bundle (loads http://localhost:4001) and is not regenerated by any build step. " +
        "script-src 'self' blocks its 2 inline <script> bodies and its inline onerror handler today.",
      owner: "t_f0ba29a2 — CSP follow-up F3: delete legacy public/admin/ (the fix is deleting the file, not maintaining this exception)",
    },
  ],
]);

const VOID_OK = /^<[a-zA-Z][a-zA-Z0-9:._-]*/; // a '<' only starts a tag if this matches

/** Elements whose content is RCDATA (text) — the browser parses no markup inside. */
const RCDATA_TAGS = new Set(["textarea"]);

/**
 * Origin of a `<script src>`, or `null` when it is a relative reference.
 *
 * `'self'` allows same-origin script loads only, so a relative `src` is
 * allowed by construction and anything with an explicit scheme or a
 * protocol-relative `//` is cross-origin until the policy says otherwise.
 */
function srcOrigin(src) {
  const value = src.trim();
  if (!/^(?:[a-zA-Z][a-zA-Z0-9+.-]*:|\/\/)/.test(value)) return null; // relative -> same-origin
  const protocolRelative = value.startsWith("//");
  try {
    const url = new URL(protocolRelative ? `https:${value}` : value);
    return {
      origin: `${url.protocol}//${url.host}`,
      scheme: protocolRelative ? null : url.protocol.replace(":", ""),
      host: (url.hostname || url.host).toLowerCase(),
    };
  } catch {
    return { origin: value, scheme: null, host: value.toLowerCase() };
  }
}

/**
 * Does the shipped `script-src` directive permit this cross-origin `src`?
 *
 * A deliberately small reader of the CSP host-source grammar — `*`, scheme
 * sources (`https:`), exact hosts, `*.suffix` wildcards, with optional scheme
 * and port. It is only ever asked about hand-written policy for one static
 * site, and every miss reports a violation, which is the fail-loud direction.
 * Host-only comparison for named hosts: the scheme of a named host is not
 * modelled, so the only way to slip past it is a policy that names the host
 * under a scheme the src could not have loaded from anyway.
 *
 * Returns `null` when no `script-src` is shipped — there is nothing to judge
 * against, exactly as the report's `policy:` line says.
 */
export function scriptSrcAllowsOrigin(origin, scriptSrc) {
  if (!scriptSrc) return null;
  const sources = scriptSrc.trim().split(/\s+/).slice(1); // drop the directive name
  for (const token of sources) {
    if (token.startsWith("'")) continue; // 'self', 'unsafe-inline', 'sha256-…' — never a host-source
    if (token === "*") return true;
    const schemeSource = token.match(/^([a-z][a-z0-9+.-]*):$/i);
    if (schemeSource) {
      // A scheme source allows that scheme anywhere; a protocol-relative src has
      // no scheme of its own, so it can load under it.
      if (!origin.scheme || origin.scheme === schemeSource[1].toLowerCase()) return true;
      continue;
    }
    const name = token
      .replace(/^[a-z][a-z0-9+.-]*:\/\//i, "")
      .split(/[/?#]/)[0]
      .replace(/:\d+$/, "")
      .toLowerCase();
    if (!name) continue;
    if (name === origin.host) return true;
    if (name.startsWith("*.") && origin.host.endsWith(name.slice(1))) return true; // `*.foo.com` covers sub.foo.com
  }
  return false;
}

/* ------------------------------------------------------------------ scanner */

/**
 * Scan one HTML document.
 *
 * Single pass, comment-aware, quote-aware. Returns findings with 1-based line
 * numbers. Deliberately dependency-free and small enough to audit top to
 * bottom: this is a security assertion, so its behaviour must not change when
 * an unrelated transitive dependency is bumped.
 *
 * `scriptSrc` is the shipped `script-src` directive (or null). It is only used
 * to judge a cross-origin `<script src>`: with no policy shipped there is
 * nothing to judge against, so those are counted, not failed.
 *
 * `depth` is internal: `srcdoc` values are scanned by calling this function
 * again, and the recursion is capped by MAX_SRCDOC_DEPTH.
 */
export function scanHtml(html, file = "<string>", { scriptSrc = null, depth = 0 } = {}) {
  const findings = [];
  const scriptTypes = new Map();
  const crossOriginHosts = new Map();
  let inlineScripts = 0;
  let externalScripts = 0;
  let sameOriginScripts = 0;
  let crossOriginScripts = 0;
  let inlineHandlers = 0;
  let styleAttrs = 0;
  let localhostRefs = 0;
  let jsMimeEssence = 0;
  let javascriptUrls = 0;
  let srcdocDocuments = 0;
  let inertSrcdoc = 0;

  const lineOf = makeLineIndex(html);
  const push = (kind, index, detail) => {
    findings.push({ file, line: lineOf(index), kind, detail, snippet: snippet(html, index) });
  };

  /** Index of an attribute name, for pointing a finding at the right place. */
  const attrIndex = (attrs, wanted) => {
    const hit = attrs.named.find(([name]) => name.toLowerCase() === wanted);
    return hit ? hit[1] : 0;
  };

  const scanAttrs = (attrs) => {
    for (const [name, index] of attrs.named) {
      const lower = name.toLowerCase();
      // HTML attribute names are ASCII case-insensitive: `ONERROR`, `OnError`
      // and `onerror` are one handler, and all three are CSP-blocked
      // (script-src-attr, browser-verified). Compare the lowercased name.
      if (/^on[a-z]+$/.test(lower)) {
        inlineHandlers += 1;
        push("inline-event-handler", index, `inline event handler attribute \`${name}="…"\` (blocked by script-src 'self')`);
      } else if (lower === "style") {
        styleAttrs += 1;
      } else if (URL_SCRIPT_ATTRS.has(lower)) {
        // A javascript: URL here is executed as script by the browser and is
        // blocked by `script-src 'self'` (script-src-elem, browser-verified) —
        // i.e. the one failure mode this gate exists to catch.
        const value = attrs.values.get(lower);
        if (urlSchemeOf(value) === "javascript") {
          javascriptUrls += 1;
          push(
            "javascript-url",
            index,
            `\`${name}="${snippet(String(value), 0, 60)}"\` is a javascript: URL — the browser runs it as inline script and \`script-src 'self'\` blocks it, so it never executes`,
          );
        }
      }
    }

    // `<meta http-equiv="refresh" content="0;url=javascript:…">` — same scheme,
    // same browser-verified block (script-src-elem / blockedURI `inline`).
    if ((attrs.values.get("http-equiv") ?? "").trim().toLowerCase() === "refresh") {
      const content = attrs.values.get("content");
      const target = content === undefined ? null : refreshUrl(content);
      if (target !== null && urlSchemeOf(target) === "javascript") {
        javascriptUrls += 1;
        push(
          "javascript-url",
          attrIndex(attrs, "content"),
          `\`<meta http-equiv="refresh" content="…;url=javascript:…">\` navigates to a javascript: URL — blocked by \`script-src 'self'\`, so the refreshed script never runs`,
        );
      }
    }

    // An `about:srcdoc` document inherits its parent's policy container, so the
    // attribute value is a document the browser builds and this policy governs:
    // scan it as one. Every counter it produces is merged (it is markup we
    // ship), and each finding is re-pointed at the attribute in this file.
    const srcdoc = attrs.values.get("srcdoc");
    if (srcdoc !== undefined) {
      const sandbox = attrs.values.get("sandbox");
      if (sandbox !== undefined && !SANDBOX_ALLOW_SCRIPTS.test(decodeCharRefs(sandbox))) {
        // sandbox without allow-scripts: the frame executes nothing and fires
        // no violation (browser-verified) — flagging it would be a false red.
        inertSrcdoc += 1;
      } else if (depth >= MAX_SRCDOC_DEPTH) {
        push(
          "srcdoc-nesting-depth",
          attrIndex(attrs, "srcdoc"),
          `srcdoc nested more than ${MAX_SRCDOC_DEPTH} levels deep — the scanner stops here and fails loudly rather than passing unread markup`,
        );
      } else {
        srcdocDocuments += 1;
        // The tokenizer decodes the attribute value before it becomes a
        // document, so `<iframe srcdoc="&lt;script&gt;…">` IS an inline script
        // to the browser (browser-verified). Decode once per level, exactly
        // like the tokenizer: a value escaped twice stays text.
        const sub = scanHtml(decodeCharRefs(srcdoc), file, { scriptSrc, depth: depth + 1 });
        inlineScripts += sub.stats.inlineScripts;
        externalScripts += sub.stats.externalScripts;
        sameOriginScripts += sub.stats.sameOriginScripts;
        crossOriginScripts += sub.stats.crossOriginScripts;
        inlineHandlers += sub.stats.inlineHandlers;
        styleAttrs += sub.stats.styleAttrs;
        jsMimeEssence += sub.stats.jsMimeEssence;
        javascriptUrls += sub.stats.javascriptUrls;
        srcdocDocuments += sub.stats.srcdocDocuments;
        inertSrcdoc += sub.stats.inertSrcdoc;
        for (const [host, count] of sub.stats.crossOriginHosts) {
          crossOriginHosts.set(host, (crossOriginHosts.get(host) ?? 0) + count);
        }
        for (const [type, count] of sub.stats.scriptTypes) {
          scriptTypes.set(type, (scriptTypes.get(type) ?? 0) + count);
        }
        for (const finding of sub.findings) {
          push(
            finding.kind,
            attrIndex(attrs, "srcdoc"),
            `inside <iframe srcdoc="…">${finding.line > 1 ? ` (line ${finding.line} of the srcdoc body)` : ""}: ${finding.detail}`,
          );
        }
      }
    }
  };

  let i = 0;
  const n = html.length;
  while (i < n) {
    const lt = html.indexOf("<", i);
    if (lt === -1) break;

    // HTML comment — inert: neither CSP nor a browser executes it.
    if (html.startsWith("<!--", lt)) {
      const end = html.indexOf("-->", lt + 4);
      i = end === -1 ? n : end + 3;
      continue;
    }

    const rest = html.slice(lt);
    if (/^<script\b/i.test(rest)) {
      const { attrs, tagEnd } = parseTag(html, lt);
      scanAttrs(attrs); // <script onerror=…> is a handler too
      const src = getAttr(attrs, "src");
      const typeAttr = getAttr(attrs, "type");
      const type = (typeAttr ?? "").trim().toLowerCase();
      const bodyEnd = findScriptClose(html, tagEnd);
      const body = html.slice(tagEnd + 1, bodyEnd === -1 ? n : bodyEnd);

      if (src !== undefined) {
        externalScripts += 1;
        const origin = srcOrigin(src);
        if (origin === null) {
          sameOriginScripts += 1;
        } else {
          crossOriginScripts += 1;
          crossOriginHosts.set(origin.host, (crossOriginHosts.get(origin.host) ?? 0) + 1);
          // `'self'` allows same-origin only. Judged against the shipped policy
          // (null policy => nothing to judge => counted, not failed).
          if (scriptSrcAllowsOrigin(origin, scriptSrc) === false) {
            push(
              "cross-origin-script-src",
              lt,
              `cross-origin <script src="${origin.origin}…"> — host \`${origin.host}\` is not allowed by the shipped \`${scriptSrc}\`, so the browser blocks it in production`,
            );
          }
        }
      } else {
        inlineScripts += 1;
        scriptTypes.set(type || "<missing>", (scriptTypes.get(type || "<missing>") ?? 0) + 1);
        if (type === "") {
          push(
            "executable-inline-script",
            lt,
            "inline <script> with no type attribute — defaults to JavaScript, blocked by script-src 'self'",
          );
        } else if (JS_MIME_TYPES.has(type)) {
          push("executable-inline-script", lt, `inline <script type="${type}"> is executable — blocked by script-src 'self'`);
        } else if (JS_MIME_TYPES.has(type.split(";")[0].trim())) {
          // `text/javascript;charset=utf-8` — a JS-MIME *essence* match. Chrome treats
          // the parameterised form as inert, so it is reported, never failed: an engine
          // implementing essence matching would execute it.
          jsMimeEssence += 1;
        }
      }
      if (bodyEnd === -1) {
        i = n;
      } else {
        const closeGt = html.indexOf(">", bodyEnd);
        i = closeGt === -1 ? n : closeGt + 1;
      }
      continue;
    } else if (rest.startsWith("</") || rest.startsWith("<!") || rest.startsWith("<?") || VOID_OK.test(rest)) {
      const { attrs, end, name } = parseTag(html, lt);
      scanAttrs(attrs);
      i = end;
      // RCDATA content is text, not markup: jump to the closing tag so a raw
      // `<script>` inside a <textarea> is not a spurious violation (inert in the
      // browser). Only on a START tag, or the closing tag would skip again.
      if (!rest.startsWith("</") && RCDATA_TAGS.has(name)) {
        const close = html.slice(i).search(new RegExp(`</${name}(?=[\\s/>])`, "i"));
        i = close === -1 ? n : i + close;
      }
      continue;
    }

    // A bare '<' in text content — not markup.
    i = lt + 1;
  }

  // Counted off the RAW text, so a http://localhost reference written inside a
  // srcdoc attribute value is counted too — it is still a dev artifact we ship.
  localhostRefs = countMatches(html, /https?:\/\/localhost[:/]/gi);
  return {
    findings,
    stats: {
      inlineScripts,
      externalScripts,
      sameOriginScripts,
      crossOriginScripts,
      crossOriginHosts,
      inlineHandlers,
      styleAttrs,
      localhostRefs,
      jsMimeEssence,
      javascriptUrls,
      srcdocDocuments,
      inertSrcdoc,
      scriptTypes,
    },
  };
}

/** Parse `<tag …>` starting at `lt`; honour quoted attribute values. */
function parseTag(html, lt) {
  const n = html.length;
  let i = lt + 1;
  if (html[i] === "/") i += 1; // a closing tag: the element name follows
  const tagStart = i;
  while (i < n && !/[\s/>]/.test(html[i])) i++; // skip tag name
  const tagName = html.slice(tagStart, i).toLowerCase();
  const attrs = { values: new Map(), named: [] };
  while (i < n) {
    while (i < n && /[\s/]/.test(html[i])) i++; // skip whitespace and stray '/'
    if (i >= n || html[i] === ">") {
      if (i < n) i += 1;
      break;
    }
    const nameStart = i;
    while (i < n && !/[\s=/>]/.test(html[i])) i++;
    const name = html.slice(nameStart, i);
    if (!name) {
      i += 1;
      continue;
    }
    let value;
    let j = i;
    while (j < n && /\s/.test(html[j])) j++;
    if (html[j] === "=") {
      j += 1;
      while (j < n && /\s/.test(html[j])) j++;
      const q = html[j];
      if (q === '"' || q === "'") {
        const close = html.indexOf(q, j + 1);
        value = html.slice(j + 1, close === -1 ? n : close);
        i = close === -1 ? n : close + 1;
      } else {
        const start = j;
        while (j < n && !/[\s>]/.test(html[j])) j++;
        value = html.slice(start, j);
        i = j;
      }
    }
    const lower = name.toLowerCase();
    if (!attrs.values.has(lower)) attrs.values.set(lower, value);
    attrs.named.push([name, nameStart]);
  }
  return { attrs, end: i, tagEnd: i - 1, name: tagName };
}

/** Index of the `</script` that terminates the current script data state. */
function findScriptClose(html, from) {
  const re = /<\/script(?=[\s/>])/gi;
  re.lastIndex = from + 1;
  const m = re.exec(html);
  return m ? m.index : -1;
}

function getAttr(attrs, name) {
  return attrs.values.get(name.toLowerCase());
}

function countMatches(text, re) {
  let c = 0;
  while (re.exec(text)) c++;
  return c;
}

function makeLineIndex(html) {
  const offsets = [0];
  for (let i = 0; i < html.length; i++) if (html[i] === "\n") offsets.push(i + 1);
  return (index) => {
    let lo = 0;
    let hi = offsets.length - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (offsets[mid] <= index) lo = mid;
      else hi = mid - 1;
    }
    return lo + 1;
  };
}

function snippet(html, index, len = 90) {
  const raw = html.slice(index, index + len).replace(/\s+/g, " ");
  return raw.length === len ? `${raw}…` : raw;
}

/* --------------------------------------------------------------------- walk */

export function walkFiles(dir, suffix) {
  const out = [];
  const visit = (d) => {
    for (const entry of readdirSync(d, { withFileTypes: true })) {
      const p = join(d, entry.name);
      if (entry.isDirectory()) visit(p);
      else if (entry.isFile() && entry.name.toLowerCase().endsWith(suffix)) out.push(p);
    }
  };
  visit(dir);
  return out.sort();
}

/** The script-src directive as actually shipped in out/_headers (informational). */
export function readScriptSrc(dir) {
  const headersPath = join(dir, "_headers");
  if (!existsSync(headersPath)) return null;
  const text = readFileSync(headersPath, "utf8");
  const m = text.match(/^\s*Content-Security-Policy\s*:\s*(.+)$/im);
  if (!m) return null;
  const policy = m[1].replace(/\\\s*\n\s*/g, " ");
  const d = policy.match(/(?:^|;)\s*(script-src[^;]*)/i);
  return d ? d[1].trim() : null;
}

/* ---------------------------------------------------------------------- run */

export function checkExport(dir, { exceptions = ALLOWED_EXCEPTIONS, strict = false } = {}) {
  if (!existsSync(dir) || !statSync(dir).isDirectory()) {
    throw new Error(`export directory not found: ${dir} (run \`npx next build\` first)`);
  }
  const files = walkFiles(dir, ".html");
  if (files.length === 0) throw new Error(`no .html files under ${dir} — is this really the static export?`);
  const scriptSrc = readScriptSrc(dir);

  const violations = []; // unexcepted findings -> fail
  const excepted = []; // findings inside an excepted file -> report, no fail
  const entries = [];
  const totals = {
    inlineScripts: 0,
    externalScripts: 0,
    sameOriginScripts: 0,
    crossOriginScripts: 0,
    inlineHandlers: 0,
    styleAttrs: 0,
    localhostRefs: 0,
    jsMimeEssence: 0,
    javascriptUrls: 0,
    srcdocDocuments: 0,
    inertSrcdoc: 0,
  };
  const typeHistogram = new Map();
  const crossOriginHosts = new Map();

  for (const file of files) {
    const rel = relative(dir, file).split(sep).join("/");
    const res = scanHtml(readFileSync(file, "utf8"), file, { scriptSrc });
    totals.inlineScripts += res.stats.inlineScripts;
    totals.externalScripts += res.stats.externalScripts;
    totals.sameOriginScripts += res.stats.sameOriginScripts;
    totals.crossOriginScripts += res.stats.crossOriginScripts;
    totals.inlineHandlers += res.stats.inlineHandlers;
    totals.styleAttrs += res.stats.styleAttrs;
    totals.localhostRefs += res.stats.localhostRefs;
    totals.jsMimeEssence += res.stats.jsMimeEssence;
    totals.javascriptUrls += res.stats.javascriptUrls;
    totals.srcdocDocuments += res.stats.srcdocDocuments;
    totals.inertSrcdoc += res.stats.inertSrcdoc;
    for (const [host, c] of res.stats.crossOriginHosts) {
      crossOriginHosts.set(host, (crossOriginHosts.get(host) ?? 0) + c);
    }
    for (const [t, c] of res.stats.scriptTypes) typeHistogram.set(t, (typeHistogram.get(t) ?? 0) + c);
    if (res.findings.length === 0) continue;
    const exception = exceptions.get(rel);
    if (exception && !strict) {
      const owned = res.findings.map((f) => ({ ...f, rel }));
      excepted.push({ rel, exception, findings: owned });
    } else {
      entries.push(rel);
      violations.push(...res.findings.map((f) => ({ ...f, rel })));
    }
  }

  // Stale exception entries: the file is clean or the file is gone.
  const staleExceptions = [];
  if (!strict) {
    for (const [rel, exception] of exceptions) {
      const hit = excepted.find((e) => e.rel === rel);
      if (!hit) {
        const present = files.some((f) => relative(dir, f).split(sep).join("/") === rel);
        staleExceptions.push({ rel, exception, why: present ? "file is clean" : "file is not in the export" });
      }
    }
  }

  return {
    dir,
    files,
    totals,
    typeHistogram,
    crossOriginHosts,
    violations,
    excepted,
    staleExceptions,
    wasm: walkFiles(dir, ".wasm"),
    scriptSrc,
    strict,
    offendingFiles: [...new Set(entries)],
  };
}

export function report(res, { stdout = console.log } = {}) {
  const { dir, files, totals, typeHistogram, crossOriginHosts, violations, excepted, staleExceptions, wasm, scriptSrc, strict } = res;
  const rel = (p) => relative(process.cwd(), p).split(sep).join("/");
  const bar = "─".repeat(74);

  stdout(`\n=== CSP invariant: no executable inline scripts in the static export ===`);
  stdout(`export:   ${rel(dir)}`);
  stdout(
    `policy:   ${
      scriptSrc
        ? scriptSrc
        : "script-src NOT FOUND in _headers — this assertion has nothing to guard yet (arrives with PR #59)"
    }`,
  );
  if (strict) stdout(`mode:     STRICT (ALLOWED_EXCEPTIONS ignored)`);

  const byType = [...typeHistogram.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([t, c]) => `${t}×${c}`)
    .join(", ");

  const exceptedCount = excepted.reduce((n, e) => n + e.findings.length, 0);
  const count = (kind) =>
    violations.filter((f) => f.kind === kind).length +
    excepted.reduce((n, e) => n + e.findings.filter((f) => f.kind === kind).length, 0);
  const executableTotal = count("executable-inline-script");
  const handlerTotal = count("inline-event-handler");
  const javascriptTotal = count("javascript-url");

  stdout("");
  stdout(`html files scanned        ${files.length}`);
  stdout(`<script src=…>            ${totals.externalScripts}  (external — 'self' allows SAME-ORIGIN only)`);
  stdout(`  same-origin             ${totals.sameOriginScripts}  (relative references — allowed)`);
  stdout(
    `  cross-origin            ${totals.crossOriginScripts}  ${
      scriptSrc
        ? `(${count("cross-origin-script-src")} not allowed by the shipped script-src${
            crossOriginHosts.size ? ` — hosts: ${[...crossOriginHosts.keys()].join(", ")}` : ""
          })`
        : "(not judged — no script-src in _headers yet)"
    }`,
  );
  stdout(`inline <script>           ${totals.inlineScripts}  [${byType}]`);
  stdout(`  data blocks             ${totals.inlineScripts - executableTotal}`);
  stdout(`  executable              ${executableTotal}`);
  if (totals.jsMimeEssence > 0) {
    stdout(`  js-MIME essence         ${totals.jsMimeEssence}  (informational — parameterised type, inert in Chrome)`);
  }
  stdout(`inline event handlers     ${handlerTotal}`);
  stdout(`javascript: URLs           ${javascriptTotal}  (executed as script then blocked by script-src 'self' — browser-verified)`);
  stdout(
    `srcdoc sub-documents      ${totals.srcdocDocuments}  (scanned as their own documents — CSP is inherited from this one)${
      totals.inertSrcdoc ? `; ${totals.inertSrcdoc} skipped (sandbox without allow-scripts — inert)` : ""
    }`,
  );
  stdout(`style= attributes         ${totals.styleAttrs}  (informational — style-src allows 'unsafe-inline')`);
  stdout(`http://localhost refs     ${totals.localhostRefs}  (informational — dev-mode artifact leakage)`);
  stdout(`.wasm files               ${wasm.length}  (must be 0 without a policy decision)`);

  for (const e of excepted) {
    stdout(`\n${bar}`);
    stdout(`EXCEPTED — ${e.rel} — ${e.findings.length} pre-existing violation(s), NOT failing the build`);
    stdout(`  reason: ${e.exception.reason}`);
    stdout(`  owner:  ${e.exception.owner}`);
    for (const f of e.findings) stdout(`  :${f.line}  [${f.kind}] ${f.detail}\n        ${f.snippet}`);
  }

  for (const s of staleExceptions) {
    stdout(`\n⚠ STALE EXCEPTION — ${s.rel} (${s.why}).`);
    stdout(`  Remove its entry from ALLOWED_EXCEPTIONS in scripts/check-inline-scripts.mjs.`);
    stdout(`  owner was: ${s.exception.owner}`);
  }

  if (violations.length > 0) {
    stdout(`\n${bar}`);
    stdout(`✗ ${violations.length} violation(s) — script-src 'self' would block these in production:\n`);
    for (const f of violations) stdout(`  ${f.rel}:${f.line}  [${f.kind}] ${f.detail}\n      ${f.snippet}`);
  }
  if (wasm.length > 0) {
    stdout(`\n✗ ${wasm.length} .wasm file(s) in the export — WebAssembly.compile/instantiate needs 'wasm-unsafe-eval' in script-src:`);
    for (const w of wasm) stdout(`  ${rel(w)}`);
  }
  if (scriptSrc && /'unsafe-inline'/.test(scriptSrc)) {
    stdout(`\n⚠ script-src contains 'unsafe-inline' — this assertion is no longer the thing keeping inline scripts safe.`);
  }

  const failed = violations.length > 0 || wasm.length > 0;
  stdout(
    failed
      ? `\n✗ FAIL — the export is not compatible with the shipped CSP (script-src 'self').`
      : `\n✓ PASS — 0 unexcepted executable inline scripts, 0 unexcepted inline handlers, 0 unexcepted javascript: URLs, 0 unexcepted cross-origin script srcs, 0 .wasm${
          exceptedCount ? ` (${exceptedCount} pre-existing violation(s) excepted — see above)` : ""
        }.`,
  );
  return !failed;
}

const invokedDirectly = process.argv[1] && import.meta.url === `file://${process.argv[1]}`;
if (invokedDirectly) {
  const args = process.argv.slice(2);
  const strict = args.includes("--strict");
  const dir = args.find((a) => !a.startsWith("--")) ?? "out";
  try {
    process.exitCode = report(checkExport(dir, { strict })) ? 0 : 1;
  } catch (err) {
    console.error(`✗ ${err.message}`);
    process.exitCode = 1;
  }
}
