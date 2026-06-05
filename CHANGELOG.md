# Changelog

All notable changes to the Supercompute main site live here. Format loosely follows
[Keep a Changelog](https://keepachangelog.com/), versioning follows
[SemVer](https://semver.org/).

The publishing app ships independently on `feat/supercompute-publishing` and tracks
its own versions over there.

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
