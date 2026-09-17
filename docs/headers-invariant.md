# The headers invariant (what `public/_headers` must keep declaring)

`public/_headers` is the single source of the response headers Cloudflare Pages serves for
supercompute.io. The build copies it verbatim (`public/_headers` → `out/_headers`, verified on three
real `next build` runs); Pages then applies each block to the path section above it.

Three defects in that file have shipped to production. None of them was catchable by a build:

| # | What was wrong | What it looked like | Who noticed |
|---|---|---|---|
| M1 | Every header sat in a **path-less block** (CSS-style `/* banner */` lines were read as bogus paths) | File parses, deploy succeeds, **no header reaches a browser** | Someone curled prod |
| M2 | `X-Frame-Options: DENY` contradicted `frame-ancestors 'self'` | Fine on modern browsers, same-origin framing broken on older ones | Someone curled prod |
| M3 | `Cross-Origin-Opener-Policy: same-origin` severed `window.opener` for the Coinbase Wallet popup (`lib/web3.ts`) | Wallet connect popup dead in prod, site otherwise healthy | Someone curled prod |

The pattern is the same each time: the file is valid input, the deploy is green, and the only
verifier is a human with curl. `scripts/assert-headers.mjs` is the automated verifier.

## Where it runs

`.github/workflows/ci-cd.yml`, `validate` job, after the static-export assertions:

```yaml
- name: Test the header-pin gate itself
  run: node --test tests/headers/assert-headers.test.mjs

- name: Assert the pinned header values survive the build (COOP, XFO, CSP, no COEP)
  run: node scripts/assert-headers.mjs --file out/_headers --same-as public/_headers
```

`validate` is a required status check on `main` and `deploy` declares `needs: validate`, so a broken
pin blocks every lane (main / staging / development). The `--same-as` half is what makes the pin
describe what actually ships: it fails if the build output drifts from the source file.

Run it locally the same way, no build required for the source half:

```bash
node scripts/assert-headers.mjs                                  # public/_headers
node scripts/assert-headers.mjs --file out/_headers --same-as public/_headers
npm run check:headers
npm run check:headers:live                                       # against https://supercompute.io
```

Exit `0` = every pin holds, `1` = at least one does not (or the source/URL is unreadable).

## The pins (and why each one is a decision, not a preference)

| Pin | Value | Why |
|---|---|---|
| `Cross-Origin-Opener-Policy` | `same-origin-allow-popups` | M3. `same-origin` kills the Coinbase Wallet popup's opener. Revert to `same-origin` only if no popup flow remains. |
| `X-Frame-Options` | `SAMEORIGIN` (case-insensitive) | M2. Must agree with `frame-ancestors 'self'`; `DENY` silently won on older browsers. |
| `Cross-Origin-Embedder-Policy` | **absent** | `require-corp` blocks cross-origin subresources without CORP and breaks extension-injected wallet providers. `crossOriginIsolated` is false either way — nothing is lost by omitting it. |
| CSP `script-src` | must contain `'self'`, must not contain `'unsafe-inline'`/`'unsafe-eval'`/`*`/`http:`/`https:` | This is the half that `scripts/check-inline-scripts.mjs` depends on: the export ships no executable inline script, so the policy needs no nonce/hash. |
| CSP `connect-src` | must contain `https://mainnet.base.org`, `https://eth.drpc.org`, `https://*.walletconnect.com`, `https://*.walletconnect.org`, `wss://*.walletconnect.com`, `wss://*.walletconnect.org` | Every browser-side transport in `lib/web3.ts`. A missing host is a silent runtime failure (`eth.merkle.io` also 429s under load, which is why mainnet is pinned to a host that answers). |
| CSP `frame-ancestors` | must contain `'self'` | The modern half of the M2 pair; without it `X-Frame-Options` is the only control and it disagrees with the policy in the other direction. |
| structure | a `/*` section must exist; no header line outside a path section; no invalid path line | M1. Reported per line, with the reason. |

Anything else in the file may change freely — cache policies, telemetry headers, added origins.
The extra hosts are *allowed on purpose*: these are floors, not snapshots, because a whole-file
snapshot trains everyone to re-record it, which is how a security pin dies quietly.

## Live drift mode

The same expectations run against a served URL, which is the only way to catch "the source file is
right and prod serves something else":

```bash
node scripts/assert-headers.mjs --url https://supercompute.io
```

`.github/workflows/header-drift.yml` runs it daily and on `workflow_dispatch`. It fails on a non-2xx
status as well as on drift, because "prod is 502ing" is exactly the moment nobody is looking at
headers. This is the automated version of the `curl -sI` step that found M1, M2 and M3.

## Tested, not trusted

`tests/headers/assert-headers.test.mjs` drives the repo's **real** `public/_headers` (it must pass)
and mutation-tests every pin against that same text: revert COOP to `same-origin`, remove
`mainnet.base.org` from `connect-src`, add back `COEP: require-corp`, drop `frame-ancestors`, put
COOP back above any path section — each mutation must turn the gate red. Each mutation asserts its
needle was found first, so a mutation that quietly does nothing cannot produce a false green.
