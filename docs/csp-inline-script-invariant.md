# The CSP inline-script invariant (what keeps `script-src 'self'` safe)

`public/_headers` ships a strict Content-Security-Policy whose script directive is:

```
script-src 'self'
```

No nonce, no hash, no `'unsafe-inline'`. That policy is only *safe* because of a
property of the build output, not of the source tree:

> **The static export must ship zero executable inline scripts and zero inline
> event handler attributes.**

Every inline `<script>` the Pages Router emits is a **data block** —
`type="application/json"` (`__NEXT_DATA__`), `application/ld+json`,
`speculationrules`. CSP does not apply to a script body that is not JavaScript,
so those 152 tags are fine. The first *executable* inline script to appear would
be silently blocked in production on every page carrying it: no build error, no
CI signal, just a CSP violation in a console nobody reads.

`scripts/check-inline-scripts.mjs` is the CI gate for that property.

Sibling assertion: `scripts/assert-headers.mjs` pins the *values* in the `/*`
section of the same file (COOP, `X-Frame-Options`, the CSP directives this script
depends on, and the absence of COEP) — see `docs/headers-invariant.md`. This file
owns the *content* half of the invariant; that one owns the header half. Neither
is sufficient alone: a correct `script-src` value guards nothing if the header
never applies (M1), and an export with no inline scripts is still unsafe if
`script-src` gains `'unsafe-inline'`.

## Where it runs

`.github/workflows/ci-cd.yml`, `validate` job, after `npx next build`:

```yaml
- name: Test the CSP inline-script gate itself
  run: node --test tests/csp/inline-scripts.test.mjs

- name: Assert export ships no executable inline scripts (guards script-src 'self')
  run: node scripts/check-inline-scripts.mjs out
```

`deploy` declares `needs: validate`, so a failing assertion blocks the deploy of
every branch lane (main / staging / development).

Run it locally the same way — after a build:

```bash
npx next build
node scripts/check-inline-scripts.mjs out      # or: npm run check:inline-scripts
node scripts/check-inline-scripts.mjs out --strict
node --test tests/csp/inline-scripts.test.mjs  # or: npm run test:csp
```

Exit code `0` = invariant holds, `1` = broken (or no export found).

## What it fails on

1. Any `<script>` **without `src`** whose `type` is missing, empty, or a
   JavaScript MIME type. The set is the complete HTML spec "JavaScript MIME
   type" list — `text/javascript`, `application/javascript`,
   `text/javascript1.0`–`1.5`, `text/x-ecmascript`, `application/x-ecmascript`
   and the rest of the 16 entries — plus the `module` keyword. Attribute *names*
   are matched case-insensitively, because HTML says they are: `ONERROR`,
   `OnError` and `onerror` are one handler.
2. Any inline event handler attribute (`onclick=`, `onerror=`, `ONCLICK=`, …)
   anywhere in the markup — including on a `<script>` tag, which is where the
   one we ship lives.
3. Any **cross-origin `<script src>`** while a `script-src` is shipped that does
   not name its host. `'self'` allows **same-origin** scripts only, so an
   absolute `src` (`https://cdn…`, `//cdn…`) is blocked by the browser in
   production exactly like an inline script is. Relative references are
   same-origin by construction and are never flagged; a host the policy names
   (or `*`, `*.suffix`, a scheme source like `https:`) is allowed.
4. Any `.wasm` file in the export. `WebAssembly.compile/instantiate` needs
   `'wasm-unsafe-eval'` in `script-src`; there are 0 `.wasm` files today
   (Turbopack's lazy loader references `WebAssembly` from ~52 chunks but never
   fires), so a new one is a policy decision that must be made on purpose.
5. Any **`javascript:` URL** on `href`, `action`, `formaction`, or in a
   `<meta http-equiv="refresh">` `url=`. Element-initiated `javascript:`
   execution is exactly a hyperlink traversal and a form submission: the URL is
   run as script and refused by the `script-src` inline check
   (`script-src-elem` / `blockedURI: inline`), or one step earlier by the shipped
   `form-action 'self'` (`blockedURI: javascript`). Browser-verified for 17
   spellings of `javascript:` — mixed case, HTML character references
   (`&#106;`, `&colon;`, `&Tab;`, `&#58;`), embedded tab/newline, leading
   whitespace — all blocked, none executed. The scanner decodes character
   references the same way the tokenizer does before the URL parser sees the
   value, and *only* the references HTML actually defines: `&Colon;` is not `:`
   (Chrome maps it to U+2237) and `&tab;` is not a reference, so neither is
   decoded — flagging them would invent a URL the browser never sees.
6. Any **executable inline script, or inline handler, inside an `srcdoc`**. An
   `about:srcdoc` document inherits its parent's policy container, so its
   `<script>` bodies are blocked exactly like top-level ones (`script-src-elem`)
   and its handlers as `script-src-attr` — while a same-origin `<script src>`
   inside it still loads. The attribute value is scanned recursively as the
   document it becomes, entity-decoded **once per level** exactly like the
   tokenizer: `srcdoc="&lt;script&gt;…"` (what a React/JSX build emits for
   `srcdoc={html}`) is a real blocked script, while a value escaped *twice* is
   literal text and stays inert. Nesting past `MAX_SRCDOC_DEPTH` (5) fails with a
   `srcdoc-nesting-depth` finding rather than passing markup the scanner could
   not follow.

It does **not** fail on: `style=` attribute counts, `http://localhost`
references, a parameterised JavaScript MIME type
(`type="text/javascript;charset=utf-8"` is inert in Chrome — an engine that
implements MIME *essence* matching would execute it, so it is counted and
reported but never failed), or the `script-src` line itself. Those are printed
every run for drift visibility, because they are one decision away from
becoming the next problem.

Content that cannot execute is skipped rather than counted: a raw `<script>`
inside a `<textarea>` is RCDATA — the browser never parses markup there — so
flagging it would be a spurious red build. `<title>` is deliberately *not*
skipped, because SVG `<title>` is parsed as markup and skipping it could hide a
real script. An `<iframe sandbox=…>` **without `allow-scripts`** is skipped the
same way: nothing in its `srcdoc` executes and no violation fires
(browser-verified), so flagging it would be a false red build. It is counted as
`inertSrcdoc` and printed.

`data:` in `<iframe src>` / `<object data>` / `<embed src>` needs no rule: the
shipped `frame-src 'self'` and `object-src 'none'` refuse it outright
(`frame-src` / `object-src` violations, no execution — browser-verified), and
Chrome refuses top-level navigation to a `data:` URL as well.

`<svg><script>`, `<template><script>` and `<noscript><script>` are **already
flagged** and stay that way on purpose: the first two are inert in a browser, so
flagging them is a false red build rather than a silent pass — the fail-loud
direction, which is the one to keep.

## Today's numbers (on `main`)

```
html files scanned        154
<script src=…>            2179  (external — 'self' allows SAME-ORIGIN only)
  same-origin             2177  (relative references — allowed)
  cross-origin               2  (not judged — no script-src in _headers yet)
inline <script>           154   [application/json×152, module×1, <missing>×1]
  data blocks             152
  executable              2
inline event handlers     1
javascript: URLs          0    (executed as script then blocked by script-src 'self' — browser-verified)
srcdoc sub-documents      0    (scanned as their own documents — CSP is inherited from this one)
style= attributes         2492  (informational — style-src allows 'unsafe-inline')
http://localhost refs     3     (informational — dev-mode artifact leakage)
.wasm files               0     (must be 0 without a policy decision)
✓ PASS — 0 unexcepted violations (3 pre-existing violations excepted)
```

All 3 unexcepted-by-`--strict` findings, and both cross-origin `src`s, live in
the one excepted file below. Until PR #59 ships `script-src`, the cross-origin
count is informational — there is no policy to judge it against yet, and the
report says so on its `policy:` line. The numbers are the report verbatim:
run the two commands above rather than trusting this table.

## The one exception (`ALLOWED_EXCEPTIONS`)

`admin/index.html` — the legacy TinaCMS/Vite admin SPA, copied verbatim from
`public/admin/index.html` into the export (it is a committed, dev-mode Vite
bundle that boots from `http://localhost:4001`; it is live today at
`https://supercompute.io/admin/`). It contributes:

| line | finding |
|---|---|
| 10 | inline `<script type="module">` (Vite React-refresh preamble) |
| 18 | inline `<script>` with no `type` (`handleLoadError` bootstrapper) |
| 27 | `onerror="handleLoadError()"` on a `<script src=…>` tag |

Those three are **pre-existing, not framework output, and blocked by the shipped
CSP today**. Two of its `<script src>`s also point at `http://localhost:4001` —
cross-origin, so once `script-src` ships they become findings too (the report
counts them under `cross-origin` meanwhile, rather than calling them "allowed").
The exception exists so the gate can land and stay green while it enforces the
invariant everywhere else; the fix is deleting the file, not maintaining the
exception.

Rules for the map in `scripts/check-inline-scripts.mjs`:

- It is **path-scoped** (an exact export-relative path) — never a glob, never a
  whole framework, never a finding *kind*.
- Every entry names an **owner card** that removes the need for it.
- Entries are **printed on every run** under a loud `EXCEPTED` banner, with line
  numbers and snippets, so the violations stay visible instead of silent.
- An entry that is no longer needed (the file became clean, or left the export)
  raises a `⚠ STALE EXCEPTION` warning telling you to delete it.
- `--strict` ignores the map entirely — use it in any review of the admin
  surface, and to verify the gate still has teeth.

Owner: **`t_f0ba29a2`** — *CSP follow-up F3: delete legacy `public/admin/`*.
When F3 lands, delete the `admin/index.html` entry; the gate then passes strict.

## When this assertion fails

Pick one, deliberately — do not silence the check:

1. **The emitting code is wrong** (an inline body added to `public/**`, a
   `next/script` with an inline body). Move it to a file under `public/` and
   reference it with `src`. This is the expected fix.
2. **The policy needs to change.** A nonce/hash pipeline, or `'unsafe-inline'`,
   or dropping the static export — each is a real security decision, so update
   `public/_headers` *and* this document in the same change.
3. **A pre-existing, owned exception.** Add a path entry with a reason and an
   owner card. Never a glob, and never without the card.

## Known breakers to re-check before framework or routing changes

- **Next.js App Router.** RSC flight data is emitted as *executable* inline
  script (`self.__next_f.push(...)`) and `script-src 'self'` blocks it. This app
  is Pages Router + `output: "export"`. This assertion fails first on any such
  migration, and that failure is the trigger to re-derive the policy.
- **A new `public/**` SPA** — hand-written or tool-generated markup copied
  verbatim into the export, as `public/admin/` was.
- **`next/script` with an inline body**, or any `dangerouslySetInnerHTML`
  carrying a script tag.
- **A cross-origin `<script src>`** — a CDN, an analytics tag, an on-ramp
  widget. `'self'` blocks it in production; the gate fails it unless the shipped
  `script-src` names that host, so widening the policy is a deliberate act
  rather than a silent one.
- **An `srcdoc` on an `<iframe>`** — the attribute value is a document the
  browser builds and this policy governs (recursively, and including the
  entity-escaped form a serializer emits). Never scanned by hand: if a component
  needs to frame generated markup, that markup gets the same inline-script rules
  as any other page.
- **A `javascript:` URL** on a link, a form `action`, a `formaction`, or a
  `meta refresh` `url=`. It is dead markup under this policy, not a handler.
- **Any `.wasm`** — see above.

## Coupling to the policy itself

This gate guards a policy that lives in `public/_headers` and arrives with
**PR #59**. Until that lands, the report prints
`script-src NOT FOUND in _headers — this assertion has nothing to guard yet`.
That is a warning, not a failure: the gate must not depend on PR ordering. Once
the policy is present the line reads `script-src 'self'
https://static.cloudflareinsights.com` and the gate is load-bearing.

If `script-src` ever contains `'unsafe-inline'`, the report says so explicitly —
at that point this assertion has stopped being the thing keeping inline scripts
safe.

## The one cross-origin script host the policy names

`script-src` is not `'self'` alone, and the reason is not in this repo: with Web
Analytics enabled on the zone, Cloudflare's **edge** injects the RUM beacon tag
into every HTML *navigation* response, after `next build` has finished:

```html
<script type="module" src="https://static.cloudflareinsights.com/beacon.min.js/v3…"
        integrity="sha512-…" crossorigin="anonymous" data-cf-beacon='…'></script>
```

It is invisible to the export scanner on purpose: `out/*.html` never contains it
(`curl` without a navigation `Accept`/`Sec-Fetch-Mode: navigate` does not see it
either), so no amount of parsing the build output can pin it down. The only
artifact that can is the policy, which is why the carve-out is asserted by
`tests/csp/analytics-beacon.test.mjs` instead of by `check-inline-scripts.mjs`.

Two hosts are required, because the beacon both loads and posts — the second half
is the one that gets forgotten:

| Directive | Host | Why |
|---|---|---|
| `script-src` | `https://static.cloudflareinsights.com` | the injected tag's `src` |
| `connect-src` | `https://cloudflareinsights.com` | the beacon's `POST /cdn-cgi/rum` |

Under the previous `script-src 'self'` every page load logged a `script-src-elem`
violation (card **t_83174cd2**; the production `csp_reports` table shows hits for
`/`, `/auth`, `/staking`, `/community`, `/app`, `/marketplace`) and the analytics
never reported. The alternative — turning Web Analytics off — is a zone-level
dashboard change, not a repo one, so the beacon would keep being injected either
way; allowing its two hosts is the code-owned, reversible half. If Web Analytics
is ever switched off at the zone, remove both entries (and the matching
expectations in `tests/csp/analytics-beacon.test.mjs`) in the same commit.

The carve-out is deliberately narrow: `script-src` is exactly `'self'` plus that
one host. No wildcard, no scheme source, no `'unsafe-inline'` — the test fails on
any of those, so "fix the beacon by loosening the policy" is not an available
move.

## Why static inspection, not a served-page probe

CSP violations exist only at runtime, so "serve `out/` and watch for console
errors" covers only the pages a probe visits and needs a browser in CI. The
invariant is a property of the emitted markup, so it is checked by parsing all
154 files: deterministic, no browser, no network, sub-second.

The gate's own tests (`tests/csp/inline-scripts.test.mjs`, 59 cases) cover the
fail cases — including every MIME type in the HTML spec's list, non-lowercase
handler names, cross-origin `src`s, `javascript:` URLs in all 14
browser-verified spellings, and `srcdoc` scripts (plain, nested, and
entity-escaped) — the must-not-false-positive cases (comment-inert markup,
markup inside a quoted attribute value, a bare `<` in text, a `<script>` inside
a `<textarea>`, a `sandbox`ed `srcdoc`, a `srcdoc` escaped twice, and the three
spellings Chrome resolves to a relative URL rather than a `javascript:` one),
the exception/stale-exception behaviour, and the `script-src` reader.

The rule set is not guessed from the spec: each fail case was browser-verified
in Chrome under `script-src 'self'` with a `securitypolicyviolation` listener
recording what the engine actually enforced, plus an execution beacon logged
server-side to prove what did *not* run.

## Reproducing the acceptance test

```bash
# 1. inject an executable inline script into a source public/*.html
printf '\n<script>alert(1)</script>\n' >> public/coming-soon/index.html
npx next build
node scripts/check-inline-scripts.mjs out ; echo "exit=$?"   # -> FAIL, exit=1

# 2. revert and rebuild
git checkout -- public/coming-soon/index.html
npx next build
node scripts/check-inline-scripts.mjs out ; echo "exit=$?"   # -> PASS, exit=0
```
