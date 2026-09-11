# CSP violation telemetry (card t_38a77267)

The live CSP is strict (`script-src 'self'`, no `'unsafe-inline'`, `object-src 'none'`).
Strict is only *safe* if a policy-induced break is visible, so the enforcing policy
reports every violation to a collector on our own origin. This document is the
operator's side of that loop: where reports go, what is stored, how to read it.

No `Content-Security-Policy-Report-Only` header is used — the policy stays enforcing.

## Wiring

`public/_headers` (the `/*` block) carries three things:

| Header | Value | Purpose |
|---|---|---|
| `Content-Security-Policy` | `…; report-uri /api/csp-report; report-to csp` | the policy itself, plus its report targets |
| `Reporting-Endpoints` | `csp="https://supercompute.io/api/csp-report"` | modern (Chrome ≥ 96, Safari 16.4+) reporting API |
| `Report-To` | `{"group":"csp","max_age":10886400,"endpoints":[{"url":"https://supercompute.io/api/csp-report"}]}` | legacy reporting API, older engines |

`report-uri` is deliberately document-relative: on a preview branch
(`<branch>.supercompute.pages.dev`) the legacy fallback stays on the preview origin
instead of polluting production counters. Modern-Chrome reports use the absolute
production URL, as specified.

`public/_headers` does **not** apply to Pages Functions, so the endpoint is its own
file: `functions/api/csp-report.js` (served at `/api/csp-report`, same routing rule as
every other `functions/api/*` handler).

## Storage — D1, table `csp_reports`

Migration: `migrations/0008_csp_reports.sql`. It is **applied by CI** — the
`Apply D1 migrations (idempotent)` step in `.github/workflows/ci-cd.yml` runs it
(alongside `0002`/`0006`) on every deploy, and the file is written to be safely
re-runnable. Nothing has to be run by hand for the table to exist in production.
One row per rollup identity, so the signal is a **count, not a firehose**:

```
bucket_key = day | violated_directive | blocked_origin | document_path | disposition
```

`hits` increments on every repeat; `first_seen` / `last_seen` are unix seconds.
Every URL is stored with its **query string and fragment removed** (a blocked URL can
carry a session token or a signed-URL secret) and every column is capped at 200 chars.
`script-sample` (inline source code) and user agents are never stored.

A day is capped at **500 distinct keys**; past that, new keys collapse into a single
`__overflow__` row, so a hostile page cannot create unbounded rows. The body is capped
at **8 KB**, streamed, so an oversized upload is dropped instead of buffered, and the
handler answers `204 No Content` on every path — it never reflects the body back.

## The one-line query

"How many CSP violations in the last 24h, by directive":

```bash
npx wrangler d1 execute supercompute-db --remote --command "SELECT violated_directive, SUM(hits) AS hits, COUNT(*) AS groups FROM csp_reports WHERE last_seen >= unixepoch()-86400 GROUP BY 1 ORDER BY hits DESC;"
```

`scripts/csp-report-stats.sh` wraps it (and adds `--days N`, `--by-host`, `--local`,
`--prune`):

```bash
./scripts/csp-report-stats.sh                 # last 24h by directive
./scripts/csp-report-stats.sh --days 7        # last week
./scripts/csp-report-stats.sh --by-host       # directive + blocked host + page path
./scripts/csp-report-stats.sh --prune         # drop rows older than 90 days
```

Drill into one directive, with the pages that hit it:

```bash
npx wrangler d1 execute supercompute-db --remote --command "SELECT blocked_origin, document_path, SUM(hits) AS hits FROM csp_reports WHERE violated_directive='script-src' GROUP BY 1,2 ORDER BY hits DESC LIMIT 20;"
```

## Local verification (no deploy, no Cloudflare auth)

`wrangler pages dev` runs the real Functions against a local D1 and replays
`out/_headers`, so the whole loop is testable offline:

```bash
npx next build
npx wrangler d1 execute supercompute-db --local --file=./migrations/0008_csp_reports.sql
npx wrangler pages dev out --port 8795 --local-protocol https \
  --https-key-path key.pem --https-cert-path cert.pem     # background
curl -sk -o /dev/null -w '%{http_code}\n' -X POST https://127.0.0.1:8795/api/csp-report \
  -H 'Content-Type: application/csp-report' \
  -d '{"csp-report":{"document-uri":"https://supercompute.io/dao","blocked-uri":"https://evil.example/a.js?token=x","effective-directive":"script-src","disposition":"enforce"}}'
```

Do **not** pass `--d1 DB=supercompute-db` to `pages dev`. That flag binds a local D1
keyed by the *name string*, which is a **different sqlite file** than the one
`wrangler d1 execute --local` opens (keyed by the `database_id` from `wrangler.toml`).
With no `--d1` flag the binding resolves out of `wrangler.toml` and the dev server and
the read path agree, so reports written by the Function are visible to the query below.

Then read the local table with the same wrapper used in production:

```bash
./scripts/csp-report-stats.sh --local            # last 24h, by directive
./scripts/csp-report-stats.sh --local --by-host  # directive + blocked host + page path
```

### Real-browser verification

Two things bite here, both found the hard way:

- A driven browser's Reporting-API upload is **not** visible to the page's request
  listener (`page.on('request')` sees nothing) and delivery can be deferred or flushed
  at browser shutdown. Do not conclude "no reports" from a silent listener — **read D1**.
  The console is still the reliable in-browser signal: the violation appears as
  `Loading the script '…' violates the following Content Security Policy directive: "script-src 'self'"`.
- `Reporting-Endpoints` / `Report-To` carry the **absolute production URL**, so a local
  run only collects reports if those two lines are pointed at the local origin first
  (`out/_headers` is a build artifact — rewrite it there, never in `public/_headers`).

A page whose markup itself violates the policy is the cleanest fixture (no injection
needed): drop a file with an inline `<script>` into the gitignored `out/` directory and
open it — the shipped `/*` header rule applies to it, and the report arrives on load.

Unit tests (fake D1, no wrangler needed):

```bash
npm run test:csp        # node --test tests/csp/csp-report.test.mjs
```

## Reading a report

- `violated_directive` is the *effective* directive (`script-src-elem`, `connect-src`, …),
  which is what the browser actually blocked on.
- `blocked_origin` is the aggregate key: `https://fonts.gstatic.com`, `inline`, `eval`, `self`, `data`.
- `document_path` is the page that reported. Our own origin is implied, so production
  rows carry a bare path (`/dao`); a non-production or forged document keeps its origin.

## Expectable vs unexpected

Baseline noise to ignore (the policy intentionally allows neither):

- `https://fonts.gstatic.com` / `https://fonts.googleapis.com` — the Google-Fonts
  style/font pairs; `style-src` allows `fonts.googleapis.com` but a CSS `@font-face`
  served from `fonts.gstatic.com` under a `script-src` context still reports on some engines.
- `https://*.walletconnect.com` / `*.walletconnect.org` — WalletConnect relay frames
  and sockets when the connector is loaded.

Anything else — especially `script-src` blocked by a third-party host or `inline` — is a
real finding: it means a page is trying to execute something the policy forbids. The
cleanliness target for a crawl of the site is **0 violations** outside the two families
above (the `public/admin/` deletion in card t_f0ba29a2 removed the one page that
violated on every load).

## Retention

Rows are cheap (one per distinct violation shape per day). Prune quarterly:

```bash
./scripts/csp-report-stats.sh --prune
```
