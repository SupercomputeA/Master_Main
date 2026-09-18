# Changelog

All notable changes to the Supercompute main site live here. Format loosely follows
[Keep a Changelog](https://keepachangelog.com/), versioning follows
[SemVer](https://semver.org/).

The publishing app ships independently on `feat/supercompute-publishing` and tracks
its own versions over there.

## [Unreleased]

### Removed
- The dead legacy standalone-Worker tree — `src/worker.js`, `src/api/*` (auth, articles, agents,
  projects, staking) and `src/utils/*` (siwe, wallet). It was on no deploy path: no workflow
  referenced it, `wrangler.toml` names no `main` (so `wrangler deploy` cannot publish its
  bundle), and live `/api/auth` answers with the Pages Function's endpoint list. It was a second,
  diverging copy of the auth lane — `src/api/auth.js` still authorized admins with a byte-exact
  `wallet_address` compare against `admin_wallets`, the shape SEC-F1d removed from the deployed
  readers. The `build` script that bundled it to `dist/worker.js` is gone with it, and
  `tests/api/legacy-worker-tree.test.mjs` pins the non-reachability so it cannot come back
  silently (t_11023e45).

### Fixed
- `/api/subscribers` (SEC-F1d, PR #104 stack follow-up) read `admin_wallets` with a byte-exact
  `wallet_address = ?` while `login.js`, `functions/api/auth.js` and the `/api/social/*` gate all
  read it with `lower(wallet_address) = ?`. One live prod row is stored checksummed
  (`0xe7A3Ed04F24b6482b4490ae06641Be4e4305Df34`) and a session wallet is always lowercase, so that
  admin was admitted everywhere except this route. It now sends the same statement as the other
  three; `tests/api/subscribers-admin.test.js` drives the real handler over a real SQLite engine
  (a JS-side mock is case-insensitive for every SQL shape and cannot see this), pins the class
  (one statement for all four readers) and records that the legacy `src/worker.js` copy is on no
  deploy path.
- Social queue audit trail (SEC-F2, PR #62 review follow-up): `POST /api/social/queue/update`
  now rejects any `status` outside `draft | scheduled | posted | partial | failed | dry_run`
  with a `400` + the allowed list instead of writing the value verbatim, and
  `POST /api/social/publish` refuses (`409`) to re-dispatch an item that already posted unless
  the caller sends an explicit `force: true` — the same call used to go back out to every
  platform in the item, i.e. a real double-post the moment Farcaster/Bluesky credentials exist.
  `migrations/0010_social_queue_status_enum.sql` makes the enum a storage invariant as well
  (BEFORE INSERT/UPDATE triggers — additive and idempotent, no table rebuild), a dispatch that
  reached a live platform and failed is now recorded `failed` rather than a flattering
  `dry_run`, and `posted_at` is never erased by a forced re-dispatch. Both halves are covered
  by `tests/social/` in CI.
- CI: production Pages deploys are serialized per branch (`concurrency` on the
  `deploy` job, `cancel-in-progress: false`) and only the current tip of `main` may
  move the production alias. Two merges landing in the same minute used to deploy
  concurrently, and the deploy that finished **last** claimed the alias even when its
  commit was the older one — prod silently regressed to the previous build
  (t_7998fe88). Exported HTML now carries a `supercompute build <sha>` provenance
  comment, so the live body names the commit that produced it.
- CI: a `gate` job now elects which run may enter the deploy lane. It runs outside the
  deploy concurrency group on purpose: GitHub cancels a *pending* job when a newer
  arrival joins a group and it cannot see commit order, so a stale run's arrival could
  cancel the newest run's pending deploy. Only branch-tip commits get through, which
  keeps entrants in commit order (t_7998fe88).

## [1.1.0] — 2026-05-28

### Added
- `pages/_archive/` for parking off-style or off-domain pages so they can't deploy by
  accident. README in the archive explains why each page is there.
- Mainnet support and WalletConnect connector in `lib/web3.ts` (gated behind
  `NEXT_PUBLIC_WALLET_CONNECT_ID`).
- Admin wallet + projects migration: `migrations/0001_admin_wallets_and_projects.sql`.

### Changed
- Cloudflare Worker auth + session handling refactor (`src/api/auth.js`, `src/worker.js`).
- Sidebar nav cleaned up — admin role no longer links to archived dashboards.

### Removed (archived to `pages/_archive/`)
- `newsdesk/` and `knowledge-graph.tsx` — these belong to the Supercompute NewsDesk
  product (`supercompute.newsdesk.app`), which lives on `feat/supercompute-publishing`
  and deploys separately.
- `admin/`, `eddesk.tsx`, `tradedesk.tsx`, `dashboard.tsx`, `press.tsx` — off-style,
  early-iteration pages kept around for reference but not for production.

### Notes
- This is the first version where the main site and the publishing app are explicitly
  in separate lanes. Main = `supercompute.io`. Publishing = `supercompute.newsdesk.app`
  (branch: `feat/supercompute-publishing`).

## [1.0.0] — baseline

The state of the repo before this cleanup. Reference only — git history is the source
of truth.
