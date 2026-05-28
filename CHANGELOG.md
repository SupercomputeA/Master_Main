# Supercompute Publishing — Changelog

The publishing app is its own product on its own branch (`feat/supercompute-publishing`),
deploying to `supercompute.newsdesk.app`. It does not share a release cadence with the
main site (`supercompute.io`), which tracks `main` and has its own CHANGELOG over there.

Format loosely follows [Keep a Changelog](https://keepachangelog.com/), versioning
follows [SemVer](https://semver.org/). Pre-1.0 while we shape the surface area.

## [0.2.0] — 2026-05-28

### Added
- Guild access surface: `pages/guild.tsx`, `GuildMembershipBadge` in the sidebar.
- Sidebar secondary nav for `apps` (StoreFront, Guild) alongside the primary
  publish nav.

### Changed
- Package renamed to `supercompute-publishing` to keep deploys from cross-pollinating
  with the main site's Cloudflare project.
- Bumped to 0.2.0 to mark the post-fork iteration.

## [0.1.0] — 2026-05-25 (fork point)

### Added
- Fork of `main` at commit `58bd83a` (post Entity Map v0.0.1) into a publishing-only app.
- `pages/compose.tsx` — split-panel editor + real-time export preview.
- `lib/export/` — per-platform formatters with auto-threading, markdown handling,
  hashtag generation. Targets: X/Twitter (280 chars), Farcaster (1024), Lens
  (full markdown), Mirror (long-form).
- New landing page (`pages/index.tsx`) — hero, platform targets, article feed.
- Rebranded sidebar/layout/footer for "Supercompute Publishing".

### Removed
- 28 non-publishing pages stripped (staking, token, fleet, tradedesk, school,
  social, projects, dashboards, etc.) so the app surface area is just publishing.

### Notes
- First version where this lane is its own product. Entity Map ships with this app.
