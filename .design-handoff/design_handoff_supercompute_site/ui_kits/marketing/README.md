# Marketing UI Kit — Direction 03 · Terminal Dossier

The approved home direction from `brief/home-wireframes.html`. Hi-fi prototype, ready to lift.

## Premise

The site is a **consulting practice**. Not a launchpad, not a Cyborg Agency, not a manifesto. Every section answers the question: *do I trust this person to do hands-on Web3 work for me?*

## Page structure (top to bottom)

| Section | Purpose | Component |
|---|---|---|
| TopNav | Mono link nav (`//services` etc.) + primary book CTA | `<TopNav />` |
| Hero | `// whoami` output — name, since, stack, status + two command-style CTAs | `<Hero />` |
| Services | `// ./services --list` — four shell-script-named services with prices | `<Services />` |
| Recent work | `// ./projects --recent | head -4` — 2×2 grid with status dot + outcomes | `<RecentProjects />` |
| Founder | `// cat ./operator.md` — photo, bio, three principles | `<FounderStrip />` |
| NewsDesk | `// ./newsdesk --latest` — three articles + subscribe | `<NewsDeskFeed />` |
| School | `// ./school --curriculum` — four module rows with prices | `<SchoolTeaser />` |
| Closing CTA | Final book button | `<ClosingCTA />` |
| Footer | Practice / Publishing / Connect columns | `<Footer />` |

## Design moves locked in

- **No ticker.** Removed entirely — does not belong on a consulting site.
- **Generous padding.** Section padding 96px vertical, 72px horizontal wrap. Hero 80/120. Content breathes.
- **Nav font bumped to 14px** (was 11px in earlier iterations). Mono, letter-spacing 1px.
- **CTAs always above the CRT layer.** `body::before` (dot grid) is z:0, `body::after` (scanlines) is z:1, all content z:2, nav links + buttons z:3+. No interactive element can be obscured by the effect.
- **Mono everywhere.** JetBrains Mono is the only font. No display face. No italics. The aesthetic IS the brand.
- **All CTAs are shell commands.** `// book --strategy-call`, `// ls ./work`, `// subscribe --newsdesk`. Diegetic UI.
- **Status dots** on project cells signal "live / shipped / ops" without needing a paragraph.

## Files

- `index.html` — composition; mounts Sections.jsx via Babel
- `Sections.jsx` — every section as a React component, exported to `window`
- `styles.css` — design-tokens import + Direction 03 styles
- `tokens.css` — symlink-ish copy of `colors_and_type.css` (kept in sync manually)
- `sc-logo.jpg` — brand mark

## Building on this

Want a hi-fi second direction? Open `brief/home-wireframes.html`, pick another tab, and tell me to build it.

Want this in production HTML/CSS (no React)? It compiles trivially — every component is presentational, no state beyond the active-nav highlight.

## Substitutions still flagged

- **Founder photo** is a placeholder gradient box. Drop a 360×360 portrait at `sc-logo-founder.jpg` and swap the `.founder-photo` block.
- **Project case studies** — copy is invented. Replace `PROJECTS` in `Sections.jsx` with the real four when you have them, or strip the section until you do.
- **NewsDesk headlines + School modules** — invented; replace with real titles when the CMS is wired up.
