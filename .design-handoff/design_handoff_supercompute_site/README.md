# Handoff: Supercompute Full Website (Marketing Site + Member App)

> **Audience:** a developer (using Claude Code or equivalent) implementing supercompute.io as a real, production website on Base Chain / Cloudflare Pages.
> **Date:** May 2026

---

## 1. Overview

Supercompute is a **hands-on Web3 consulting practice** that ships its own builder token, publishes a NewsDesk, and runs a school. The website's primary job in the next 6 months is **booking qualified strategy calls** with Web3-native founders. Everything else (token, school, NewsDesk, member dashboard) feeds that funnel.

This handoff covers two products, both shipping as a single SPA:

1. **Marketing site** (public) — landing, services, projects, founder, NewsDesk, School, Token, About.
2. **Member app** (post-auth, SIWE) — dashboard, NewsDesk reader, agent chat, school, token page, agent fleet admin, profile.

---

## 2. About the design files

The files in this bundle are **design references created in HTML/CSS/JSX** — hi-fi prototypes showing the intended look, layout, copy, and behavior. They are **not production code to ship as-is**.

Your job is to **recreate these designs in the target codebase's existing environment** (the live repo at `github.com/SupercomputeA/Master_Main` uses React + Babel-in-browser + Cloudflare Pages; you may choose to keep that, migrate to Next.js/Vite/Astro, or another framework appropriate to the team) using established patterns and libraries. The prototypes are presentational only — no real state management, no real wallet integration, no real CMS, no real auth. You are responsible for:

- Wiring real **SIWE** (Sign-In With Ethereum) auth.
- Wiring **Calendly** + **Stripe** for the strategy-call booking funnel (primary conversion).
- Wiring a real **CMS** for NewsDesk (markdown or headless CMS — team's call).
- Wiring real **Base Chain** RPC for $SCOM token page (price, allocation, on-chain activity).
- Wiring real **chat** for Agent Chat (LLM/agent backend).
- Choosing a framework, build tool, test harness, and deployment pipeline.

---

## 3. Fidelity

**Hi-fi.** Final colors, typography, spacing, copy, and component shapes are locked in. Recreate pixel-perfectly against the design tokens in `colors_and_type.css`.

The one exception is **wireframe-fi**: the `brief/home-wireframes.html` document contains five low-fi home-page directions. **Only Direction 03 ("Terminal Dossier") is approved** — that's what was built out in `ui_kits/marketing/`. The other four wireframe directions are kept in the brief for context but are not the spec.

---

## 4. Strategic brief (read this first)

See `brief/site-brief.html` for the full one-page strategy brief. The short version:

- **Primary objective (6 months):** Book qualified strategy calls with Web3-native founders. Anything that doesn't serve this is decoration.
- **Audience:** Web3-native founders launching a project (token / agent / community / L2). They already have wallets. **Decline** retail / DeFi yield-tourists.
- **Differentiation, in one line:** *Hands-on. Values in order. Pro expansion.* The founder personally executes — this is not a platform with 47 anonymous consultants.
- **Anti-positioning:** Not a launchpad. Not a fund. Not a DAO. Not a trading desk. **A practice.**
- **Voice:** Pragmatic consulting firm — calm, expert, services-first. *"We've shipped 14 of these. Here's the playbook."* — NOT *"Stop manually managing your Web3 community — hire a Cyborg Agency!"*

### Forbidden
- Do **not** put a price ticker at the top of the home page.
- Do **not** lead with the token.
- Do **not** call it a "platform" or "Cyborg Agency" in the hero.
- Do **not** bury the founder behind anonymous "13 agents" branding.

### Funnel
1. **Land** → stranger sees hands-on operator, services-first.
2. **Engage** → books a call, OR subscribes to NewsDesk, OR backs a project (three valid micro-conversions).
3. **Convert** → booked strategy call. Calendly fires. Stripe holds the deposit. Calendar invite sent.

### Success metrics
- **30 days:** 5 paid strategy calls booked through the site.
- **90 days:** 20 paid calls, 1 retainer from a call, 500 NewsDesk subscribers.
- Wallet connects, traffic, staking — measured, but not the scoreboard.

---

## 5. Pages — priorities and scope

### Marketing site

| Path | Priority | Purpose | Reference file |
|---|---|---|---|
| `/` Home | **P0** | Founder + services + projects + book CTA. The whole funnel on one page. | `ui_kits/marketing/index.html` |
| `/consulting` Services | **P0** | Services menu, packages, pricing, book-a-call. | derive from Home `<Services />` |
| `/about` Founder | **P0** | Photo, bio, principles, contact. | derive from Home `<FounderStrip />` |
| `/school` Web3 School | P1 | Catalog + module pages. Funds the practice; warms cold leads. | `ui_kits/app/` school view |
| `/news` NewsDesk | P1 | Article library + posts. Proof of expertise. | `ui_kits/app/` newsdesk view |
| `/token` $SCOM | P2 | Tokenomics, staking, LP. Loyalty layer, not the hook. | `ui_kits/app/` token page |
| `/app/*` Member dashboard | P2 | Post-auth: bookings, school progress, staking. | `ui_kits/app/index.html` |

The current placeholder/holding page is `index.html` at project root ("rebuilding in public"). It can stay live while you build the real pages, then be retired.

### Member app (post-auth, P2)

| Page | Component reference |
|---|---|
| Dashboard (admin overview, 4 stat tiles + agent sheet) | `ui_kits/app/Components.jsx` → `Dashboard` |
| NewsDesk reader (file-listing feed) | `ui_kits/app/Components.jsx` → `NewsDesk` |
| Agent Chat (terminal transcript) | `ui_kits/app/Components.jsx` → `AgentChat` |
| Web3 School (progress banner + module rows) | `ui_kits/app/Components.jsx` → `School` |
| $SCOM Token (token hero + allocation + activity) | `ui_kits/app/Components2.jsx` → `TokenPage` |
| Agent Fleet — admin (13-agent list + kill switch) | `ui_kits/app/Components2.jsx` → `AgentFleet` |
| Auth Overlay (SIWE modal) | `ui_kits/app/Components.jsx` → `AuthOverlay` |

---

## 6. Visual foundations — read `colors_and_type.css` for tokens

The full token layer lives in `colors_and_type.css` (color, type, spacing, radii, shadows, motion, gradients, on-dark alphas, semantic vars). **Treat that file as the source of truth.** What follows is the human-readable summary.

### 6a. Two palettes — the site has TWO surfaces

Read this carefully. Supercompute's design language has two distinct surfaces, governed by two related-but-different palettes:

#### "Terminal Dossier" palette — marketing site + member app surface

This is what's built out in `ui_kits/marketing/` and `ui_kits/app/`. **Use this for everything on supercompute.io.**

| Token | Hex | Use |
|---|---|---|
| `--site-bg` | `#0a1330` | Page background — deep navy with slight blue cast |
| `--gold-warm` | `#C9A33A` | Brass-gold — primary heading accent + primary CTA |
| `--gold-warm-2` | `#b8902c` | Brass-gold pressed |
| `--cream` | `#F4ECD8` | Off-white display text |
| `--mono-blue` | `#6FA3E5` | Body monospace, secondary text |
| `--hud-yellow` | `#E0BE3F` | HUD corner brackets |

#### "Web3 Identity" palette — reserved for logo, gradients, identity moments

The original codebase shipped a saturated pink/gold/cyan palette over deep navy. These colors are kept in `colors_and_type.css` because **the logo gradient (pink → gold), the auth overlay accent, and the "school progress / progress-bar fill" gradient still use them.** They are NOT used as page backgrounds, body text, or default CTA colors on the live site.

| Token | Hex | Use |
|---|---|---|
| `--pink` | `#E91E8C` | Logo gradient stop, progress-bar fill |
| `--gold` | `#FFB800` | Logo gradient stop, progress-bar fill |
| `--cyan` | `#00D4FF` | (legacy data-signal — avoid in new work) |
| `--violet` | `#7c3aed` | Logo ring |

If you find yourself using pink/cyan as a section background, you're in the wrong palette — switch back to Terminal Dossier.

#### Semantic
| Token | Hex |
|---|---|
| `--success` | `#16a34a` |
| `--warning` | `#b45309` |
| `--danger` | `#dc2626` |
| `--green` (on-dark status dot) | `#4ade80` |

### 6b. Type

The brand voice is mono. **JetBrains Mono** is the only font on the marketing site and member app. No sans, no serif, no italics, no display face on those surfaces. Inter and Phosphate are loaded in `colors_and_type.css` for design-system specimen artifacts only — **do not introduce them into shipped pages.**

- `--font-mono`: `'JetBrains Mono', ui-monospace, 'SF Mono', Menlo, Consolas, monospace` — body, nav, headings, CTAs, everything.
- Body: 14px / line-height 1.7.
- Nav links: 14px, letter-spacing 1px (the brief explicitly upgrades this from the older 11px).
- Eyebrows: 10–11px, letter-spacing 2–2.5px, uppercase, brass-gold.
- Hero headline: `clamp(28px, 5vw, 44px)`, weight 600, letter-spacing -0.2px.
- Prefer `letter-spacing: .3–.5px` on body for the terminal feel.

### 6c. Spacing

4px base scale (`--s-1` through `--s-12`). Section padding on the marketing site is **96px vertical / 72px horizontal wrap**; hero is **80/120**. Content needs to breathe — the previous iteration was cramped, this one is generous.

Sidebar (member app): exactly **220px** (`--nav-w`). Topbar: **52px** (`--topbar-h`).

### 6d. Radii — flat by default

Terminal Dossier surfaces are **flat sheets** — no rounded corners, no shadows. Cards are `rgba(255,255,255,.02)` over a `1px solid rgba(201,163,58,.30)` brass hairline. Use radii only when explicitly called out in a component (e.g. the logo is a circle).

The full radius scale exists in tokens (`--r-xs` 6px → `--r-3xl` 20px → `--r-pill` 999px) for any one-off identity moments (the round avatar/logo, the auth modal). Do not apply them site-wide.

### 6e. Shadows — restrained

Only used on identity moments (e.g. the logo `drop-shadow(0 0 16px rgba(201,163,58,.30))`). The page itself is flat. Hover lift is mostly **border-color shift** and a 1–2px translate, NOT a drop shadow.

### 6f. Motion

- All transitions `.15–.20s ease` (`--t-fast`, `--t-base`).
- Caret blink on the terminal prompt: 1.1s steps(1) infinite.
- Progress-bar fill (school): springy `cubic-bezier(.34, 1.56, .64, 1)` over 1.2s.
- Hover: `transform: translateY(-1px or -2px)` + border-color → brass-gold.
- **No** parallax, **no** scroll-jacking, **no** flashy entrance animations on the marketing site. Keep it calm.

### 6g. The CRT effect (signature)

Three fixed full-viewport layers behind page content:
- `body::before` → dot-grid at 56×56px, white at 3% opacity (`z-index: 0`).
- `body::after` → repeating scanlines (1px on / 2px off), `rgba(0,0,0,.18)`, mix-blend-mode `multiply`, opacity 0.55 (`z-index: 1`).
- `.vignette` → radial gradient darkening at the edges (`z-index: 1`).

**All interactive UI lives at `z-index: 2+`.** Buttons, nav links, inputs are at `z: 3+`. This is non-negotiable — the brief explicitly calls out *"Interactive controls sit above the CRT effect, never inside or behind it."*

### 6h. HUD corners (signature)

Four 28×28px brackets pinned to viewport corners, 2px brass-yellow (`--hud-yellow`), `border-right: none; border-bottom: none;` (and rotated equivalents per corner). On mobile they shrink to 22px and tuck to 10px from the edge.

In the **member app**, HUD corners bracket the **main content area** (where it meets the sidebar), not the whole viewport.

---

## 7. Components — per-page detail

Rather than reproducing every pixel here, read the prototype source. Each component file is small and self-documenting. The mapping:

### Marketing site → `ui_kits/marketing/`

- `index.html` — page shell, mounts `Sections.jsx` via Babel.
- `Sections.jsx` — every section component, exported to `window`. Sections in order:
  1. `<TopNav active onNav />` — mono link nav (`//`, `//services`, `//work`, `//school`, `//news`, `//about`) + primary "// book --call" CTA, top-right.
  2. `<Hero />` — `// whoami` output: name, since-2013, stack, status, plus two command-style CTAs (`// book --strategy-call`, `// ls ./work`).
  3. `<Services />` — `// ./services --list`: four services with shell-script-named keys and starting prices.
     - DeFi Onboarding · from $200
     - Agent Build-out · from $500
     - Token Launch · from $3.5K
     - Treasury / OpSec retainer · monthly
  4. `<RecentProjects />` — `// ./projects --recent | head -4`: 2×2 grid of project cells, each with status dot (`● live` / `◇ shipped` / `◆ ops`) + outcome line.
  5. `<FounderStrip />` — `// cat ./operator.md`: 360×360 founder photo + bio + three principles (Hands-on / Values in order / Pro expansion).
  6. `<NewsDeskFeed />` — `// ./newsdesk --latest`: three article cells + subscribe input.
  7. `<SchoolTeaser />` — `// ./school --curriculum`: four module rows with prices and "n/7" progress hints.
  8. `<ClosingCTA />` — final `// book --strategy-call` button on its own.
  9. `<Footer />` — three columns: Practice / Publishing / Connect.

- `styles.css` — all component styles. Imports `tokens.css` (a copy of root `colors_and_type.css`).

### Member app → `ui_kits/app/`

- `index.html` — app shell with sidebar + topbar. Routes between dashboard / newsdesk / chat / school / token / agent-fleet via internal state.
- `Components.jsx` — `HudFrame`, `Sidebar`, `Topbar`, `Dashboard`, `NewsDesk`, `AgentChat`, `School`, `AuthOverlay`.
- `Components2.jsx` — `TokenPage`, `AgentFleet` (admin).
- `styles.css` — Terminal-Blue app rules. Key rules (also stated in `ui_kits/app/README.md`):
  1. Background `var(--site-bg)` — never `#F8F4F0` (legacy from earlier design language).
  2. Primary accent `var(--gold-warm)` `#C9A33A`. Pink/cyan/violet **not used** in the app surface — they are marketing identity-moment colors only.
  3. All type is mono.
  4. Cards are flat sheets (white at 2% alpha over a brass hairline). No rounded corners. No shadows.
  5. Active nav: 2px brass left bar + `// path` label.
  6. Locked nav items: dim to 30% opacity + `[lock]` tag.
  7. Status dots: green (active) / brass (idle/observer) / mono-blue (dev).
  8. Progress bars: thin brass-gold fill for banners; inline ASCII (`██████░░░░░░░░░░░░░░`) for module rows.
  9. Buttons are command-line styled: `// verb --flag`, lowercase, brass border/fill. `$` is reserved exclusively for token tickers (`$SCOM`, `$KNIGHT`) — never a CLI prompt.
  10. HUD corners (10×10, 1px brass at 45% alpha) bracket the **main content area**, not the viewport.

### Patterns library → `patterns/`

- `cms-patterns.html` — patterns for the NewsDesk CMS (article rows, category chips, tabular dates, `*.md` filename treatment).
- `web3-patterns.html` — patterns for wallet connect, token-ticker chips ($SCOM), SIWE button, signing states.
- `_chrome.css` — shared chrome styles for the pattern sheets.

These are reference sheets — pull individual patterns out as you build.

### Design-system specimen cards → `preview/`

Static HTML cards documenting each token / component family. Use them when you need to look up a single color, a single radius, a single button state, etc. Not navigated by users; design reference only.

---

## 8. Voice & copy rules

Read `brief/site-brief.html` for the full voice spec. The short version:

- **Pragmatic consulting firm.** Calm. Expert. Services-first.
- **Casing:** Brand wordmark `SUPERCOMPUTE` (all-caps, letter-spaced). Eyebrows ALL-CAPS, 10px, tracked +1.5–2.5px. Headlines sentence case with one accent phrase in brass-gold.
- **Numbers as proof.** Be specific. `13 years` not `over a decade`. `$200` not `affordable`.
- **CTAs are shell commands.** `// book --call`, `// ls ./work`, `// subscribe --newsdesk`. Diegetic UI is part of the brand.
- **Emoji:** Functional emoji (`🔒 🎓 ⚠️ ✅ 📰 📈 📊`) allowed in **product UI activity** only. **Never** in marketing headlines. Prefer geometric unicode glyphs (`◎ ◈ ◐ ◑ ◧ ◉ ◆ ▣ ▤`) for nav.
- **Forbidden phrases on marketing surfaces:** "Cyborg Agency", "platform", "13 autonomous agents" (as a marketing hook — fine in the product/admin where it's literal).

---

## 9. Interactions & behavior

### Marketing site

- **Nav active state:** brass-gold color + brass underline. Click → smooth scroll to section (or `<a href>` to route page).
- **Book CTA:** opens Calendly inline (or modal) → on confirmation, Stripe deposit hold → calendar invite. This is the **primary conversion**; instrument it (analytics event `book_call_confirmed`).
- **NewsDesk subscribe:** email → mailing-list service → ack toast. No double opt-in unless legally required.
- **Hover states across the board:** border-color → brass-gold; small `translateY(-1px)`; no shadow.

### Member app

- **Auth:** SIWE overlay shown if `signedIn === false`. Connect-wallet button → sign nonce → exchange for session JWT. Admin role check separately (e.g. address allowlist).
- **Sidebar nav:** active item gets 2px brass left bar + `// path` label. Locked items dim 30% with `[lock]` tag and are unclickable.
- **Agent Chat:** terminal transcript with `[SPEAKER › HH:MM]` headers. Input prompt is `›`. On submit → stream tokens from agent backend. Auto-scroll to bottom unless user scrolled up.
- **School progress:** `n/7` ratio + ASCII fill-bar (`██████░░░░░░░░░░░░░░`) per module. Banner progress fills with springy easing on mount.
- **Token page:** $SCOM hero (symbol / price / contract address with copy / actions). Allocation bars. Recent on-chain activity table.
- **Agent Fleet (admin only):** 13-agent list with `pause / logs / prompt / kill` controls. Destructive **"pause all agents"** kill-switch at top-right — gated behind a confirm modal.

---

## 10. State management requirements

- **Auth session** — wallet address, SIWE nonce, JWT, role (user / admin).
- **Active nav / route** — URL-driven.
- **NewsDesk feed** — fetched from CMS; cache aggressively.
- **Agent Chat transcript** — per-conversation, stream-appended; persist for session, optional cloud sync.
- **School progress** — per-user, persisted server-side (and locally as a cache).
- **Token page data** — price + on-chain activity polled from Base RPC + an indexer; cache 30s.
- **Agent Fleet state** — only fetched in admin role; long-poll or websocket for live state.

---

## 11. Responsive behavior

- Marketing site is **single-column at <900px**; grids collapse 4 → 2 → 1.
- App sidebar collapses to a hamburger sheet below 900px.
- HUD corners shrink 28 → 22px and re-anchor to 10px from edges (already in `index.html` mobile media query).
- All hit targets ≥ 44px on touch.

---

## 12. Assets

| Path | Description |
|---|---|
| `assets/SupercomputeLogo.png` | Primary mark — grainy pink→gold gradient "S" inside violet ring. Use anywhere transparency matters. |
| `assets/sc-logo.jpg` | JPG variant of the same mark. Use in sidebars/avatars where the gradient logo wouldn't be legible. |
| `fonts/PhosphateSolid.ttf` | Phosphate Solid display face. **Specimen-only** — not used on shipped marketing/app surfaces; kept for design-system artifacts. |

**Substitution flags** (still open — confirm with the brand owner):

- **No brand-owned typeface beyond Phosphate.** JetBrains Mono is loaded via Google Fonts CDN as the shipped face. Self-host if needed for performance/privacy.
- **No icon set.** The system uses geometric unicode glyphs (`◎ ◈ ◐ ◑ ◧ ◉ ◆ ▣ ▤`) inline. Lucide (`stroke-width: 2`, `16–20px`, `currentColor`) is the recommended CDN fallback when a glyph can't carry the meaning (e.g. an explicit "wallet" icon in a long form).
- **Founder photo is a placeholder.** Drop a 360×360 portrait at `assets/sc-founder.jpg` and swap the `.founder-photo` block in `FounderStrip`.
- **Project case studies** — copy is invented. Replace `PROJECTS` in `Sections.jsx` with real ones, or strip the section until you have them.
- **NewsDesk + School module copy** — invented; replace when the CMS is wired up.

---

## 13. Files in this bundle

```
design_handoff_supercompute_site/
├── README.md                         ← you are here
├── colors_and_type.css               ← source of truth for tokens
├── brief/
│   ├── site-brief.html               ← one-page strategy brief — READ FIRST
│   └── home-wireframes.html          ← five home directions; only D03 is approved
├── ui_kits/
│   ├── marketing/                    ← Direction 03 hi-fi prototype — marketing site
│   │   ├── index.html
│   │   ├── Sections.jsx
│   │   ├── styles.css
│   │   ├── tokens.css                ← mirror of colors_and_type.css
│   │   ├── sc-logo.jpg
│   │   └── README.md
│   └── app/                          ← Member app hi-fi prototype
│       ├── index.html
│       ├── Components.jsx
│       ├── Components2.jsx
│       ├── styles.css
│       ├── tokens.css
│       ├── sc-logo.jpg
│       └── README.md
├── patterns/
│   ├── cms-patterns.html             ← NewsDesk CMS patterns
│   ├── web3-patterns.html            ← wallet, SIWE, token-ticker patterns
│   └── _chrome.css
├── preview/                          ← per-token / per-component specimen cards
│   ├── colors-*.html
│   ├── type-*.html
│   ├── buttons.html, inputs.html, badges.html, …
│   └── (~25 cards total)
├── assets/
│   ├── SupercomputeLogo.png
│   └── sc-logo.jpg
└── fonts/
    └── PhosphateSolid.ttf
```

---

## 14. Recommended build order

1. **Scaffold** — pick framework (recommend Next.js or Vite + React if keeping React; Astro if static-first is preferred for the marketing site), wire `colors_and_type.css` into the global styles entry point, set up JetBrains Mono.
2. **Layout shell + HUD corners + CRT layers** — these are the brand. Get them right first.
3. **Marketing site, top to bottom** — `<TopNav />` → `<Hero />` → `<Services />` → `<RecentProjects />` → `<FounderStrip />` → `<NewsDeskFeed />` → `<SchoolTeaser />` → `<ClosingCTA />` → `<Footer />`. Ship the marketing site **first** — it's the primary conversion surface.
4. **Calendly + Stripe** — wire the booking funnel. This is what the site exists for; nothing else matters until it works.
5. **NewsDesk** (CMS, public reader pages) — proof of expertise, slow-burn lead-gen.
6. **Auth (SIWE)** — gate the member app.
7. **Member app surfaces** — Dashboard → NewsDesk reader → School → Agent Chat → Token page → Agent Fleet admin.
8. **Polish, analytics, perf, error states, empty states.**

---

## 15. Open questions for the team

- Framework decision: keep Babel-in-browser + Cloudflare Pages, or migrate?
- CMS choice for NewsDesk (markdown in repo? Sanity? Contentlayer?).
- SIWE library (`viem` + custom, `siwe-rfc4361`, RainbowKit?).
- Calendly vs. Cal.com (self-hostable, brand-controllable).
- Stripe deposit flow: full payment or hold-and-capture?
- Agent backend: which provider runs `KNIGHT`, `Quanta S`, etc. on-chain?
- Real founder photo + bio copy.
- Real project case studies.

When in doubt, default to **the simplest thing that ships the booking funnel.**

---

*Generated from `Supercompute Design System` project · v1 · May 2026.*
