# App UI Kit — Supercompute Member App · Terminal Blue

The logged-in surface, in the approved **Direction 03 · Terminal Dossier** style — mono everywhere, deep navy, brass-gold accents, mono-blue body. Matches `ui_kits/marketing/` and the `patterns/` sheets.

## Pages included
- **Dashboard** — admin overview: 4 stat tiles + sheet of active agents with `online / observer / dev` states
- **NewsDesk** — file-listing feed (`[ category ]` chip + `*.md` filename + tabular date/read time)
- **Agent Chat** — terminal transcript with `[SPEAKER › HH:MM]` headers and `›` input prompt
- **Web3 School** — progress banner with `n/7` ratio + ASCII fill-bar (`██████░░░░░░░░░░░░░░`) per module
- **$SCOM Token** — token hero (symbol / price / contract / actions) + allocation bars + recent on-chain activity
- **Agent Fleet (admin)** — full 13-agent list with `pause / logs / prompt / kill` controls + a destructive "pause all agents" kill-switch
- **Auth Overlay** — `// login --supercompute` modal with brass-gold HUD corners and SIWE button

## Files
- `index.html` — App shell that swaps pages from the sidebar
- `Components.jsx` — HudFrame, Sidebar, Topbar, Dashboard, NewsDesk, AgentChat, School, AuthOverlay
- `Components2.jsx` — TokenPage, AgentFleet (admin)
- `styles.css` — Terminal-Blue rules (CRT grid + scanlines, sheets, ASCII bars, mono buttons)
- `tokens.css` — re-exports `colors_and_type.css` (uses `--site-bg`, `--gold-warm`, `--cream`, `--mono-blue`, `--hud-yellow`)
- `sc-logo.jpg`

## Style rules (this kit)
1. Background: `var(--site-bg)` deep navy `#0a1330` with dot-grid + scanline overlays. Never `#F8F4F0`.
2. Primary accent: `var(--gold-warm)` `#C9A33A` (brass). Pink/cyan/violet identity colors are reserved for the marketing kit's "moment" gradients — **not used in the app surface.**
3. All type is `var(--font-mono)` (JetBrains Mono). No sans.
4. Cards are flat **sheets**: `rgba(255,255,255,.02)` over a `1px solid rgba(201,163,58,.30)` brass hairline. No rounded corners. No drop shadows.
5. Active nav items get a 2px brass left bar and `// path` labels; locked items dim to 30% opacity with a `[lock]` tag.
6. Status dots: green (active), brass (idle/observer), mono-blue (dev). All on dark.
7. Progress bars exist in two forms: a thin brass-gold fill bar for banners, and inline ASCII (`█░`) for module rows.
8. Buttons use the marketing kit's command-line styling — `// verb --flag`, lowercase, brass-gold border/fill. The `$` glyph is reserved exclusively for token tickers ($SCOM, $KNIGHT, etc) — never use it as a CLI prompt.
9. HUD corners (10×10, 1px brass at 45% alpha) are pinned to the **main content** corners — they bracket the page surface where it meets the sidebar, instead of framing the whole viewport.

## Notes
- The real app has many more pages (Profile, Assets, $SCOM Token, Projects, NewsDesk CMS editor, API Status, etc). This kit covers the highest-traffic + most-distinctive surfaces; lift the same Sidebar/Topbar shell to add more.
- Click the demo links on the Auth Overlay (visible when `signedIn=false`) to swap between user and admin roles.
