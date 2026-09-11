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
real script.

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
- **Any `.wasm`** — see above.

## Coupling to the policy itself

This gate guards a policy that lives in `public/_headers` and arrives with
**PR #59**. Until that lands, the report prints
`script-src NOT FOUND in _headers — this assertion has nothing to guard yet`.
That is a warning, not a failure: the gate must not depend on PR ordering. Once
the policy is present the line reads `script-src 'self'` and the gate is
load-bearing.

If `script-src` ever contains `'unsafe-inline'`, the report says so explicitly —
at that point this assertion has stopped being the thing keeping inline scripts
safe.

## Why static inspection, not a served-page probe

CSP violations exist only at runtime, so "serve `out/` and watch for console
errors" covers only the pages a probe visits and needs a browser in CI. The
invariant is a property of the emitted markup, so it is checked by parsing all
154 files: deterministic, no browser, no network, sub-second.

The gate's own tests (`tests/csp/inline-scripts.test.mjs`, 38 cases) cover the
fail cases — including every MIME type in the HTML spec's list, non-lowercase
handler names, and cross-origin `src`s — the must-not-false-positive cases
(comment-inert markup, markup inside a quoted attribute value, a bare `<` in
text, a `<script>` inside a `<textarea>`), the exception/stale-exception
behaviour, and the `script-src` reader.

The rule set is not guessed from the spec: each fail case was browser-verified
in Chrome under `script-src 'self'` with a `securitypolicyviolation` listener
recording what the engine actually enforced.

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
