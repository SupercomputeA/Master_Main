# NFT Surface Audit — supercompute.io

**Audit date:** 2026-08-01
**Auditor:** website profile (kanban t_aa8a8e8b)
**Goal:** enumerate every NFT-touching surface on `supercompute.io`, document its current chrome, and map where it must read the SOLAR tokens instead of the legacy Terminal Dossier palette.

---

## Visual identity — current state

The website is on a single, locked token layer:

- **Source of truth:** `styles/colors_and_type.css` (X-MEN / BLUE & GOLD).
- **Token vocabulary:** `--site-bg`, `--gold-warm`, `--cream`, `--mono-blue`, `--hud-yellow`, `--surface-1`, `--border`, `--font-mono`, `--font-display` (Phosphate specimen-only).
- **Layout chrome:** `components/PublicLayout.tsx` (horizontal nav, public surfaces) and `components/MemberLayout.tsx` (vertical sidebar, `/app/*` and `/admin/*`).
- **CSS entrypoint:** `styles/globals.css` imports `colors_and_type.css` at the top of the cascade. Body has `overflow: hidden` + CRT scanlines + fixed HUD corners — the full "Terminal Dossier" reading applies to every route today, including NFT listings.

The SOLAR design system (`/Users/mone/Projects/open-design/design-systems/solar/`) ships a **completely different** palette and typo stack:

- Colors: `--cast-black` (#0B0B0D), `--gold-24k` (#C9A24A), `--gold-deep` (#8C6A28), `--gold-leaf` (#E8C97A), `--bone` (#F1ECDF), `--linen` (#E7DEC8), `--bronze` (#7A5A2A), `--ink` (#141317), `--ash` (#3A3A3F).
- Type: `--font-display` Fraunces (serif), `--font-body` Inter, `--font-archive` EB Garamond, `--font-label` JetBrains Mono.
- Component classes: `.solar-card`, `.bianco-card`, `.gold-stamp`, `.ivory-mark`, `.archive-strip`, `.hairline-divider`, `.bronze-edge`, `.gold-leaf-link`, `.trait-mat` (240×240 ivory specimen mat).

These two systems share zero token names. A page that mixes both will either render bare unstyled gray (when Terminal Dossier references land on undefined SOLAR vars) or get blasted with the wrong visual identity (cast-black backgrounds where SOLAR expects `--bone` cells). They must be **scoped** — never blended.

---

## Routes audited

### 1. `/projects` — `pages/projects.tsx`

| Field | Value |
|---|---|
| **NFT-relevant?** | Yes — lists every project that may have a token/NFT drop. The "America NFT" and "Word NFT" cards live here. |
| **Current chrome** | `PublicLayout` (horizontal nav + HUD corners + CRT scanlines via `globals.css`). Terminal Dossier palette. |
| **Visual identity source** | `colors_and_type.css` via `--bg`, `--accent`, `--border`, `--surface`. |
| **Rendered content** | Three category sections (Core Infrastructure, Community & Engagement, Web3 & Ecosystem). 14 project cards. |
| **Storybook story** | None. |
| **Component source** | In-repo (`pages/projects.tsx` hardcoded array, not yet reading `content/projects/*.json`). |
| **SOLAR migration path** | Mount SOLAR `.trait-mat` specimens inside each project card, scoped to a `.solar-scope` wrapper that re-defines the project-card chrome on SOLAR tokens. The page chrome (nav, footer, HUD corners) stays Terminal Dossier. Card body uses SOLAR gold-leaf typography. |

### 2. `/projects/[id]` — `pages/projects/[id].tsx`

| Field | Value |
|---|---|
| **NFT-relevant?** | Yes — per-project detail. Reads `content/projects/*.json` (currently `quanta-s.json`, `tradedesk.json`, `openclaw.json`; `openclaw` is suppressed from `/token` registry per the comment on `pages/token.tsx`). |
| **Current chrome** | `PublicLayout` + Terminal Dossier. |
| **Visual identity source** | `colors_and_type.css` (`--bg`, `--surface`, `--accent`, `--muted`). |
| **Rendered content** | Hero with token symbol, metadata grid, updates timeline, token details. |
| **Storybook story** | None. |
| **Component source** | In-repo page + `lib/content.ts` reader. |
| **SOLAR migration path** | Hero card uses SOLAR `.solar-card` (cast-black + gold-leaf). Updates timeline and metadata grid stay Terminal Dossier (data-heavy, chrome-appropriate). The token-symbol stamp becomes a SOLAR `.gold-stamp`. |

### 3. `/projects/solar-punk` — `pages/projects/solar-punk.tsx` ⚠️ FULL SOLAR

| Field | Value |
|---|---|
| **NFT-relevant?** | Yes — the Solar Punk project surface. The "NFT" item is the first row on the funding timeline (`NFT · Profile Photo · Conviction Raise`). This is the NFT surface. |
| **Current chrome** | `PublicLayout` (Terminal Dossier). Page body uses inline styles referencing `--accent`, `--bg`, `--border`, `--font-display` — all Terminal Dossier. |
| **Visual identity source** | `colors_and_type.css` only. **Conflict:** the page text still references "Solar Punk · proposal" content but reads on the wrong palette. |
| **Rendered content** | Hero (SOLAR PUNK), 8 features (token, DAO, staking, Virtuals, 0xSplits, Farcaster, Base rail, liquidity), roadmap (5 milestones), funding timeline (8 raises including NFT), Farcaster feed, ecosystem links. |
| **Storybook story** | None. |
| **Component source** | In-repo page (placeholder style; solar-punk profile owns the real component). |
| **SOLAR migration path** | **This is the canonical mount point.** Wrap the body in `<SolarThemeProvider>` (the proposed Option B). Replace the funding-timeline row, the "NFT" entry, and the roadmap with SOLAR `.trait-mat` specimens inside the SOLAR scope. The `PublicLayout` chrome (nav, HUD corners, footer) stays Terminal Dossier. |

### 4. `/projects/guide` — `pages/projects/guide.tsx`

| Field | Value |
|---|---|
| **NFT-relevant?** | Indirect — explains how to launch a project (which in turn can launch a token/NFT). It documents the NFT-launch flow. |
| **Current chrome** | `PublicLayout` + Terminal Dossier. |
| **Visual identity source** | `colors_and_type.css`. |
| **Storybook story** | None. |
| **SOLAR migration path** | No full re-skin. Add a single SOLAR-themed "Specimen" callout block for the NFT-preview example, scoped to a `.solar-scope` wrapper. |

### 5. `/projects/browse` — `pages/projects/browse.tsx`

| Field | Value |
|---|---|
| **NFT-relevant?** | Yes — browse-by-category view of all NFT-touching projects. |
| **Current chrome** | `PublicLayout` + Terminal Dossier. |
| **SOLAR migration path** | Same as `/projects` — wrap the card grid in `.solar-scope` so the project cards render on SOLAR tokens (cast-black mat, gold-leaf title, ivory-mark tagline). |

### 6. `/projects/builder` — `pages/projects/builder.tsx`

| Field | Value |
|---|---|
| **NFT-relevant?** | Indirect — project creation flow. The new project can have a token/NFT. |
| **Current chrome** | `PublicLayout` + Terminal Dossier. |
| **SOLAR migration path** | No change. The form chrome is data-entry; Terminal Dossier is correct. |

### 7. `/projects/solar-punk` (placeholder) — referenced in AGENTS.md

| Field | Value |
|---|---|
| **NFT-relevant?** | Yes — same as #3. |
| **Status** | The site already has a placeholder page at this route (See #3). The real component is owned by the **solar-punk** profile, not the website. Per AGENTS.md §1, solar-punk ships `Master_Main/components/solar-punk/` (default export + named exports + Storybook + README). |
| **SOLAR migration path** | When the solar-punk component lands, the website's mount job is to wrap it in `<PublicLayout>` AND in `<SolarThemeProvider>` (the chosen approach). The website does **not** edit the component source. |

### 8. `/character` — NOT BUILT

| Field | Value |
|---|---|
| **NFT-relevant?** | Yes — referenced in the kanban scope as an NFT character surface. |
| **Status** | **No `pages/character.tsx` exists in the codebase.** Searched `pages/`, all components, all content. The AGENTS.md mount registry does not list this route. |
| **SOLAR migration path** | When the solar-punk profile ships a character component, the mount will follow the same contract as `/projects/solar-punk` — the website wraps the project component in `PublicLayout` + `SolarThemeProvider`. Nothing to migrate today; the pattern is documented in `solar-theme-integration.md`. |

### 9. `/token` — `pages/token.tsx`

| Field | Value |
|---|---|
| **NFT-relevant?** | Yes — token hub. $QUANTA, ecosystem stats, sub-tokens table, staking CTA. |
| **Current chrome** | `PublicLayout` + Terminal Dossier. All chrome hardcoded to `--bg`, `--accent`, `--border`, `--muted`. |
| **Visual identity source** | `colors_and_type.css`. |
| **Storybook story** | None. |
| **SOLAR migration path** | The sub-tokens table should use SOLAR `.gold-stamp` for the token symbol column and ivory-mark for the project tagline. Stats tiles stay Terminal Dossier (numeric data heavy). Wrap the table body in `.solar-scope`. |

### 10. `/staking` — `pages/staking.tsx`

| Field | Value |
|---|---|
| **NFT-relevant?** | Indirect — staking might gate on an NFT position in the future. Currently a "coming after TGE" placeholder. |
| **Current chrome** | `PublicLayout` + Terminal Dossier. |
| **SOLAR migration path** | No change today. When staking goes live and reads NFT positions, the NFT row will use `.solar-card` inside a `.solar-scope`. |

### 11. `/app/*` — Member area: `pages/app/*`

| Field | Value |
|---|---|
| **NFT-relevant?** | Yes — member dashboard (Home, Projects, Staking, Publishing, School, Token Tracker), each potentially displays NFT positions. |
| **Current chrome** | `MemberLayout` (vertical sidebar, Terminal Dossier). |
| **Visual identity source** | `colors_and_type.css`. |
| **SOLAR migration path** | Member-chrome tokens stay Terminal Dossier (admin-tools aesthetic). The NFT-position tiles inside `/app/projects`, `/app/staking`, `/app/token` use SOLAR `.solar-card` inside a `.solar-scope` so the membership shell does not flip. |

### 12. `/admin/*` — `pages/admin/*`

| Field | Value |
|---|---|
| **NFT-relevant?** | Indirect — admin manages NFT/token projects. |
| **Current chrome** | `MemberLayout variant="admin"` (Terminal Dossier). |
| **SOLAR migration path** | No change. Admin is a control surface; Terminal Dossier is correct. |

### 13. `/school/*` — `pages/school.tsx`, `pages/school/`

| Field | Value |
|---|---|
| **NFT-relevant?** | Indirect — school modules may reference NFTs as credentials. |
| **Current chrome** | `PublicLayout` + Terminal Dossier. |
| **SOLAR migration path** | No change. School chrome is data dense; keep Terminal Dossier. |

### 14. `/social/*` — `pages/social.tsx`, `pages/social/livestreaming.tsx`

| Field | Value |
|---|
| **NFT-relevant?** | Indirect. |
| **Current chrome** | `PublicLayout` + Terminal Dossier. |
| **SOLAR migration path** | No change. |

### 15. `/tradedesk` — `pages/tradedesk.tsx`

| Field | Value |
|---|---|
| **NFT-relevant?** | Possible — tradedesk may handle NFT liquidity. Owned by the **tradedesk** profile. |
| **Current chrome** | `PublicLayout` + Terminal Dossier (placeholder until tradedesk ships). |
| **SOLAR migration path** | Out of scope — tradedesk profile owns its visual identity. |

### 16. `/projects` footer — `components/Footer.tsx`

| Field | Value |
|---|---|
| **NFT-relevant?** | Indirect — footer shows canonical links. |
| **SOLAR migration path** | No change. Footer is platform chrome. |

---

## Summary table

| # | Route | Owning profile | NFT-touches | SOLAR migration |
|---|-------|----------------|-------------|------------------|
| 1 | `/projects` | website | yes | card grid → `.solar-scope` |
| 2 | `/projects/[id]` | website | yes | hero → `.solar-card` + `.gold-stamp` |
| 3 | `/projects/solar-punk` | solar-punk (placeholder) | **YES — canonical** | full body → `SolarThemeProvider` |
| 4 | `/projects/guide` | website | indirect | one callout → `.solar-scope` |
| 5 | `/projects/browse` | website | yes | card grid → `.solar-scope` |
| 6 | `/projects/builder` | website | indirect | none |
| 7 | `/projects/solar-punk` (future) | solar-punk | yes | `<SolarThemeProvider>` wrapper |
| 8 | `/character` (future) | solar-punk | yes | `<SolarThemeProvider>` wrapper |
| 9 | `/token` | website | yes | sub-tokens table → `.solar-scope` |
| 10 | `/staking` | website | indirect | none today |
| 11 | `/app/*` | website | yes | NFT tiles → `.solar-scope` |
| 12 | `/admin/*` | website | indirect | none |
| 13 | `/school/*` | school | indirect | none |
| 14 | `/social/*` | website | indirect | none |
| 15 | `/tradedesk` | tradedesk | indirect | tradedesk profile owns |
| 16 | `Footer` | website | indirect | none |

**Routes that read SOLAR tokens today:** 0.
**Routes that must read SOLAR tokens after this work:** at minimum #3, #7, #8, #9, #11 (NFT-position tiles). #1, #2, #5 should adopt SOLAR for the parts that display NFTs/images.

---

## Anti-patterns to avoid

1. **Never redefine `--site-bg` / `--gold-warm` / `--cream` globally.** Terminal Dossier uses these for header, footer, and nav. Replacing them would re-skin the platform chrome — forbidden by AGENTS.md §3.
2. **Never add SOLAR tokens to `colors_and_type.css`.** SOLAR is a published design system owned by the solar-punk + design profiles. Importing its `tokens.css` wholesale would force every page to compute both stacks. Keep them separate.
3. **Never import `tokens.css` from `globals.css` at the top level.** That would put SOLAR vars on `:root` for the whole document and let any component reach in. Use scoped wrapper.
4. **Never inline SOLAR hex values in component styles.** That bypasses the token system and locks the design in component local CSS. Use `var(--cast-black)` etc. via the scoped provider.
