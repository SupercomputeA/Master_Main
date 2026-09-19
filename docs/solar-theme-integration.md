# SOLAR Theme Integration — Contract

**Decision:** **Option B** — React context provider that swaps tokens at the route boundary.
**Date:** 2026-08-01
**Author:** website profile (kanban t_aa8a8e8b)
**Status:** proposed → awaiting Mone yes/no before staging deploy

---

## Why Option B

Two ways to combine the SOLAR tokens with the Terminal Dossier chrome:

- **Option A** — Terminal Dossier chrome imports `tokens.css` from the SOLAR system and conditionally overrides its own palette for SOLAR-mounted routes. Implemented as router-aware CSS class injection on the body or layout root.
- **Option B** — Terminal Dossier chrome is untouched. Routes that should be SOLAR-themed wrap their content in `<SolarThemeProvider>`, which renders a scoped `<style>` tag that re-defines the SOLAR CSS custom properties on a `.solar-scope` container. The Component subtree below `SolarThemeProvider` reads SOLAR tokens; everything else reads Terminal Dossier.

**Option B wins on three counts:**

1. **Zero coupling to the router.** No `pathname.startsWith("/projects/solar-punk")` style branching. The provider is just a context wrapper. Any component, anywhere, can opt in.
2. **No body-level mutations.** Option A would have to set a class on `<body>` or override `:root` for the chrome tokens. Body mutations interact with the CRT scanlines and fixed HUD corners (which are wired to specific Terminal Dossier values). Option B keeps the chrome entirely inert.
3. **Cheaper to ship.** The provider is ~30 lines of React + a single `<style>` block. No CSS-side rewrites of `globals.css`, no risk of bleeding into admin routes, no path-aware media-query work.

The cost of Option B: the SOLAR tokens must be **re-declared** on the `.solar-scope` selector (they cannot reference the SOLAR `:root` because the website's `:root` is Terminal Dossier). This is mechanical — copy the SOLAR `:root` block into the scoped selector.

---

## The contract

### 1. What the website provides

**Module path:** `components/SolarThemeProvider.tsx`

```tsx
import React, { type ReactNode } from "react"

/* SOLAR tokens — copied verbatim from
   /Users/mone/Projects/open-design/design-systems/solar/tokens.css.
   We re-declare them on .solar-scope rather than @import, because the
   website's :root holds Terminal Dossier tokens and the two stacks share
   no variable names. Do NOT add site-bg overrides here. */
const SOLAR_SCOPE = `
.solar-scope {
  --cast-black: #0B0B0D;
  --ink: #141317;
  --gold-24k: #C9A24A;
  --gold-deep: #8C6A28;
  --gold-leaf: #E8C97A;
  --bone: #F1ECDF;
  --linen: #E7DEC8;
  --bronze: #7A5A2A;
  --ash: #3A3A3F;
  --font-display: "Fraunces", "Times New Roman", serif;
  --font-body: "Inter", "Helvetica Neue", sans-serif;
  --font-archive: "EB Garamond", "Times New Roman", serif;
  --font-label: "JetBrains Mono", ui-monospace, "SFMono-Regular", monospace;
  --radius-sm: 2px;
  --radius-md: 4px;
  --radius-lg: 8px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 40px;
  --gold-rule-width: 1px;
  --gold-rule: var(--gold-rule-width) solid var(--gold-deep);
  --specimen-size: 240px;
  --specimen-mat: var(--bone);
  --specimen-rule: var(--gold-rule);
}

.solar-scope {
  background-color: var(--cast-black);
  color: var(--gold-leaf);
  font-family: var(--font-body);
  min-height: 100%;
}
`

export default function SolarThemeProvider({ children }: { children: ReactNode }) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: SOLAR_SCOPE }} />
      <div className="solar-scope">{children}</div>
    </>
  )
}
```

### 2. What the website does NOT do

- Does **not** import `tokens.css` from the SOLAR design system repo at the global level.
- Does **not** redefine Terminal Dossier tokens (`--site-bg`, `--gold-warm`, `--cream`, `--mono-blue`, `--font-mono`).
- Does **not** modify `colors_and_type.css` or `globals.css`.
- Does **not** touch the CRT scanlines or fixed HUD corners on the SOLAR page — they stay Terminal Dossier platform chrome.
- Does **not** edit `components/SolarThemeProvider.tsx` for routes that don't need it.

### 3. What project components get

A project component shipped by solar-punk (or any project) can use the .solar-card / .bianco-card / .gold-stamp / .ivory-mark / .archive-strip / .hairline-divider / .bronze-edge / .gold-leaf-link / .trait-mat classes anywhere inside `.solar-scope`. They will resolve to the SOLAR tokens. Outside `.solar-scope` (e.g. on `/admin`, `/app`, `/`, `/token`), the same class names will resolve to **undefined** (since SOLAR tokens are only declared on `.solar-scope`), which is safe — the components will fall back to neutral defaults or fail loud-and-early, never to the wrong identity.

### 4. Mount example for `/projects/solar-punk`

```tsx
// pages/projects/solar-punk.tsx
import SolarThemeProvider from "../../components/SolarThemeProvider"

export default function SolarPunk() {
  return (
    <PublicLayout title="SUPERCOMPUTE · Solar Punk">
      <SolarThemeProvider>
        <section className="solar-card">
          <h2 style={{ fontFamily: "var(--font-display)", color: "var(--gold-leaf)" }}>
            SOLAR PUNK
          </h2>
          <p style={{ color: "var(--cream)" /* note: cream does not exist in SOLAR */ }}>
            {/* ⚠️ Use --gold-leaf or --bone, not --cream. */}
          </p>
        </section>
      </SolarThemeProvider>
    </PublicLayout>
  )
}
```

The page chrome (horizontal nav, HUD corners, footer) stays Terminal Dossier; the inner content re-skins.

### 5. Acceptance criteria

- `SolarThemeProvider` is a leaf-of-architecture component; no other file depends on it.
- A route that wraps its content in `<SolarThemeProvider>` shows SOLAR tokens inside and Terminal Dossier outside.
- The CRT scanlines + HUD corners + nav brand continue to render on Terminal Dossier on every page, including SOLAR-themed ones.
- No console errors when navigating from a SOLAR-themed route to a non-SOLAR route.
- Token names do not collide. If the SOLAR system later adds a `--site-bg` (name collision with Terminal Dossier), the SOLAR version wins inside `.solar-scope` and the Terminal Dossier version wins outside. This is the intended behavior; both definitions are correct in their own scope.

### 6. How to test

1. `npm run next:build` (builds the static export).
2. `npm run deploy:staging` (deploys to `staging.supercompute.io`).
3. Manual checks on staging:
   - `/projects/solar-punk` — SOLAR-themed body, Terminal Dossier chrome.
   - `/projects` — Terminal Dossier throughout (unchanged).
   - `/token` — Terminal Dossier throughout (unchanged).
   - `/` — Terminal Dossier landing (unchanged).
   - Chromium DevTools → inspect a SOLAR element → confirm `var(--cast-black)` and `var(--gold-leaf)` resolve at `.solar-scope`.
   - Confirm no console errors on any route.

### 7. What the project (solar-punk) needs to do

- Publish its component (default export + named exports + Storybook + README) per `AGENTS.md §1`.
- Use SOLAR token names (`--cast-black`, `--gold-leaf`, `--bone`, etc.) in its CSS, not hardcoded hex.
- Place SOLAR-themed markup inside the page's `.solar-scope` boundary (the `.solar-scope` wrapper is provided by the website's `SolarThemeProvider`).
- Do not assume the SOLAR tokens exist on `:root` — they only exist on `.solar-scope`. If the project ships a Storybook, that Storybook must either apply the same scope or import SOLAR tokens.css at the top of `.storybook/preview.tsx`.

### 8. Out of scope

- Re-skinning existing public pages (`/`, `/about`, `/community`) to SOLAR.
- Adding SOLAR tokens to `colors_and_type.css`.
- Editing `components/SolarThemeProvider.tsx` for routes that don't need SOLAR.
- Implementing the actual solar-punk component (that's the solar-punk profile's task).
- Removing the Terminal Dossier palette anywhere.
- Theme-switching (light/dark mode, user pickable) — not part of this work.

---

## Sign-off

This proposal is on the website repo at `docs/solar-theme-integration.md`. For deployment to production, Mone signs off in the kanban comment thread and the website promotes `staging` → `main`.
