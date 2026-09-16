# DECISION — Pages Functions invocation profile for the root middleware (2026-09-11)

**Status:** ACCEPTED — the widened profile stays; **no `public/_routes.json` in this change.**
**Card:** `t_cde072c3` (F5 follow-up to `t_58f99396` / PR #71). **Decided by:** website ops profile.
**Merge / deploy:** Mone's explicit go — `main` is PR-only.

## Position

1. PR #71 ships as-is. A root `functions/_middleware.js` is documented to run in front of static
   files, so static requests can now invoke the Worker. Accept that.
2. Do **not** add `public/_routes.json` alongside a header/routing change — a wrong `include` rule
   breaks every `/api/*` route at once (auth, school, token, web3, kg, farcaster), and the narrowed
   profile cannot be confirmed in production until a deploy happens.
3. The narrowing **is** pre-verified locally (see below) and stays one card away, to be pulled when a
   run-back criterion fires.

## What the profile actually is (measured, not assumed)

| | generated `_routes.json` | static request invokes the Worker? |
|---|---|---|
| `origin/main` today (no root middleware) | 15 routes, all under `/api/` | no |
| with PR #71 (root middleware) | `{"version":1,"include":["/*"],"exclude":[]}` | **yes** (documented + reproduced locally) |

Reproduce without any Cloudflare auth — this is the same generator CI uses:

```bash
cd <worktree>
npx wrangler pages functions build --outdir=/tmp/x --output-routes-path=/tmp/routes-with.json
# and again against a copy of functions/ with _middleware.js parked
```

The 15 pre-change entries: `/api/token`, `/api/school`, `/api/projects`, `/api/farcaster`,
`/api/auth`, `/api/articles`, `/api/web3/*`, `/api/kg/*`, `/api/articles/*`, `/api/tina/webhook`,
`/api/auth/{profile,nonce,message,logout,login}`.

**Coverage check:** every one of those 15 entries begins with `/api/`, and all 17 files under
`functions/` are either `api/**` or a non-route (`_middleware.js`, `_shared/security-headers.js`).
So `include: ["/api/*"]` is a strict superset of the pre-change route list — verified mechanically,
not by inspection.

## Runtime evidence — `wrangler pages dev` 4.87.0, real D1 + KV, deploy layout

Four variants, same probes. `mw=` is a scratch-instrumented middleware stamping which branch it took
(the instrumentation is local-only and never committed).

| path | status | bytes | A root mw | B no mw | D instrumented | E +`_routes.json /api/*` |
|---|---|---|---|---|---|---|
| `/api/school` | 200 | 22272 | nosniff | **bare** | mw=api-branch | mw=api-branch |
| `/api/auth/nonce` | 200 | 76 | nosniff | bare | mw=api-branch | mw=api-branch |
| `/api/farcaster` | 503 | 93 | nosniff | bare | mw=api-branch | mw=api-branch |
| `/api/kg?graph=defi` | 200 | 678 | nosniff | bare | mw=api-branch | mw=api-branch |
| `/api/token` | 200 | 324 | nosniff | bare | mw=api-branch | mw=api-branch |
| `/api/projects` | 200 | 15 | nosniff | bare | mw=api-branch | mw=api-branch |
| `/api/web3/gate` | 200 | 479 | nosniff | bare | mw=api-branch | mw=api-branch |
| `/terms` | 200 | 23086 | nosniff | nosniff (`_headers`) | **mw=static-branch** | *not invoked* |
| `/no-such-page` | 404 | 2491 | — | — | **mw=static-branch** | *not invoked* |
| `/_next/static/chunks/*.js` | 200 | 30698 | — | — | **mw=static-branch** | *not invoked* |

What this proves:

- **B matches live production exactly** — Functions responses ship bare (`nosniff` absent) while
  static assets carry `_headers`. The dev runtime is a faithful repro for this surface.
- **D proves the widening is real in the runtime**: static paths, including a 404 and a
  `/_next/static/**` chunk, take the middleware's static branch ⇒ the Worker is invoked for them.
- **E proves the narrowing is safe**: with `include: ["/api/*"]` every `/api/*` probe still reaches
  the middleware and returns the **identical status and byte count** as the un-narrowed profiles,
  while static paths no longer invoke the Worker at all.

Honest limits: Miniflare is not the production routing layer, and its per-request `ms` is
warmup-polluted noise (E `/terms` p50 4.4 ms vs D 63.3 ms is not a production delta). Production
static latency and real invocation counts require the deploy; that is why no latency claim is made
here.

## Live baseline before this change (probed 2026-09-11)

- `/api/*` ship bare — no nosniff / Referrer-Policy / CSP. This is what PR #71 fixes.
- static `/terms` carries `_headers` (`nosniff`, `referrer-policy`) — `_headers` remains the
  authority for static assets either way.
- live sizes match the local run: `/api/school` 22272, `/api/kg?graph=defi` 678, `/api/token` 324,
  `/api/web3/gate` 479, unknown path → 404 2491 B. `/api/farcaster` 503 is expected (its Neynar key
  path is unconfigured).

## Cost model — where the threshold is

- Functions free tier: **100k requests/day**; this project is set to **fail open**, so when the
  allowance is exhausted static assets keep serving but `/api/*` stops for the rest of the day.
- Real export fan-out: **14–16 unique static refs per HTML page** (13–15 JS chunks + 1 CSS), 538
  files in the export ⇒ a cold page view ≈ **15–17 invocations** ⇒ the allowance is ≈ **6,250 cold
  page views/day**. Nothing on this site has shown pressure at that level.

## Run-back criteria — narrow when any of these fires

- [ ] Daily Functions invocations exceed **30k** (30% of the free allowance) — Workers & Pages →
      `supercompute` → Metrics.
- [ ] Any `/api/*` failure that coincides with allowance exhaustion → narrow immediately.
- [ ] Static TTFB p50 regresses **> 10 ms** against the pre-#71 baseline (CF analytics:
      `/_next/static/*` and `*.html`).
- [ ] A new Function lands **outside `/api/*`** — the middleware's `FUNCTION_PATH_PREFIX` and this
      whole analysis change with it.
- [ ] The account turns out to be on **Workers Standard** (the daily cap is removed entirely) → keep
      the widened profile permanently and close this file.

## The alternative, pre-verified (pull this when a criterion fires)

`public/_routes.json`:

```json
{ "version": 1, "include": ["/api/*"], "exclude": [] }
```

Then, before any merge: re-run the four named probes plus `/api/token`, `/api/projects`,
`/api/web3/gate`; after the deploy read the deployment's **generated** `_routes.json` and
`curl -sI https://supercompute.io/api/school`. Do not bundle it with a header or routing change.

## Post-merge requirement for PR #71

**Prerequisite:** `npx wrangler login` — the stored OAuth token currently returns
`Failed to fetch auth token: 400 Bad Request`, which blocks every Cloudflare API/dashboard readback
(it does *not* block `wrangler pages dev`, `pages functions build`, or this local evidence).

After the deploy: read back the deployment's generated `_routes.json` (expect
`include: ["/*"]`) and `curl -sI https://supercompute.io/api/school` (expect the security header
set to now be present). Only then is the profile change confirmed in production.

## Harness pitfall worth remembering

`wrangler pages dev <directory>` resolves `functions/` from the **project** (cwd / its
`wrangler.toml`), *not* from the served directory. A matrix built by copying different `functions/`
trees into scratch asset directories silently serves one variant for every run — the first version of
this evidence was invalid for exactly that reason. Give each variant its own project dir and pass
`--cwd` (with a `node_modules` link, or esbuild fails on `viem/utils`).
