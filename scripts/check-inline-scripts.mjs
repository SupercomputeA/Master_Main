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
 */
export function scanHtml(html, file = "<string>", { scriptSrc = null } = {}) {
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

  const lineOf = makeLineIndex(html);
  const push = (kind, index, detail) => {
    findings.push({ file, line: lineOf(index), kind, detail, snippet: snippet(html, index) });
  };

  const scanAttrs = (attrs) => {
    for (const [name, index] of attrs.named) {
      // HTML attribute names are ASCII case-insensitive: `ONERROR`, `OnError`
      // and `onerror` are one handler, and all three are CSP-blocked
      // (script-src-attr, browser-verified). Compare the lowercased name.
      if (/^on[a-z]+$/.test(name.toLowerCase())) {
        inlineHandlers += 1;
        push("inline-event-handler", index, `inline event handler attribute \`${name}="…"\` (blocked by script-src 'self')`);
      } else if (name.toLowerCase() === "style") {
        styleAttrs += 1;
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
      : `\n✓ PASS — 0 unexcepted executable inline scripts, 0 unexcepted inline handlers, 0 unexcepted cross-origin script srcs, 0 .wasm${
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
