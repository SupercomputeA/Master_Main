import React, { type ReactNode } from "react"

/* SolarThemeProvider — Option B from docs/solar-theme-integration.md.
 *
 * Wraps a subtree in a `.solar-scope` element whose CSS custom properties
 * are the SOLAR design tokens. The wrapper renders a single inline <style>
 * tag that RE-DECLARES the SOLAR tokens on `.solar-scope` (we don't
 * @import the system file because the website's :root is Terminal Dossier
 * and the two stacks share no variable names).
 *
 * What it does NOT do:
 *   - Touch Terminal Dossier tokens (--site-bg, --gold-warm, --cream, etc.)
 *   - Mutate <body> or global styles
 *   - Apply CRT scanlines / HUD corners to the SOLAR subtree
 *   - Override route chrome (header, footer, nav live in the parent layout)
 *
 * Usage:
 *   <SolarThemeProvider>
 *     <section className="solar-card">...</section>
 *   </SolarThemeProvider>
 *
 * Children can use any SOLAR class (.solar-card, .bianco-card, .gold-stamp,
 * .ivory-mark, .archive-strip, .hairline-divider, .bronze-edge, .gold-leaf-link,
 * .trait-mat) — these resolve via the scoped token declarations below.
 */

const SOLAR_SCOPE_CSS = `
.solar-scope {
  /* Color tokens — cast-black + gold + ivory */
  --cast-black: #0B0B0D;
  --ink: #141317;
  --gold-24k: #C9A24A;
  --gold-deep: #8C6A28;
  --gold-leaf: #E8C97A;
  --bone: #F1ECDF;
  --linen: #E7DEC8;
  --bronze: #7A5A2A;
  --ash: #3A3A3F;

  /* Typography */
  --font-display: "Fraunces", "Times New Roman", serif;
  --font-body: "Inter", "Helvetica Neue", sans-serif;
  --font-archive: "EB Garamond", "Times New Roman", serif;
  --font-label: "JetBrains Mono", ui-monospace, "SFMono-Regular", monospace;

  /* Geometry */
  --radius-hairline: 1px;
  --radius-sm: 2px;
  --radius-md: 4px;
  --radius-lg: 8px;
  --radius-medallion: 999px;

  /* Spacing */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 40px;
  --space-2xl: 64px;

  /* The Gold Rule — every layout split gets this 1px hairline. */
  --gold-rule-width: 1px;
  --gold-rule: var(--gold-rule-width) solid var(--gold-deep);

  /* Trait specimen cell — 240x240 mat, ivory-mark surface, gold-deep inner hairline. */
  --specimen-size: 240px;
  --specimen-mat: var(--bone);
  --specimen-rule: var(--gold-rule);

  /* SOLAR component classes — duplicated from the SOLAR tokens.css so we
     don't need to import that file. Each class sets the SOLAR-tokenized
     chrome for the corresponding card / stamp / mark. */
}

.solar-scope .solar-card {
  background-color: var(--cast-black);
  color: var(--gold-leaf);
  border-radius: var(--radius-md);
  padding: var(--space-md);
  border: var(--gold-rule);
}
.solar-scope .bianco-card {
  background-color: var(--linen);
  color: var(--ink);
  border-radius: var(--radius-md);
  padding: var(--space-md);
  border: var(--gold-rule);
}
.solar-scope .gold-stamp {
  background-color: var(--cast-black);
  color: var(--gold-leaf);
  font-family: var(--font-label);
  font-size: 0.75rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  border-radius: var(--radius-sm);
  padding: var(--space-sm);
  display: inline-block;
}
.solar-scope .ivory-mark {
  background-color: var(--bone);
  color: var(--ink);
  font-family: var(--font-archive);
  border-radius: var(--radius-md);
  padding: var(--space-md);
}
.solar-scope .archive-strip {
  background-color: var(--ash);
  color: var(--bone);
  font-family: var(--font-label);
  border-radius: var(--radius-sm);
  padding: var(--space-sm);
  border-right: var(--gold-rule);
}
.solar-scope .hairline-divider {
  background-color: var(--gold-deep);
  height: 1px;
  width: 100%;
}
.solar-scope .bronze-edge {
  background-color: var(--bronze);
  color: var(--gold-leaf);
  font-family: var(--font-label);
  border-radius: var(--radius-sm);
  padding: var(--space-sm);
}
.solar-scope .gold-leaf-link {
  background-color: var(--gold-24k);
  color: var(--cast-black);
  font-family: var(--font-label);
  border-radius: var(--radius-sm);
  padding: var(--space-sm);
  text-decoration: none;
}
.solar-scope .trait-mat {
  width: var(--specimen-size);
  height: var(--specimen-size);
  background-color: var(--specimen-mat);
  border: var(--specimen-rule);
  border-radius: 0;
  display: inline-block;
  vertical-align: top;
}

.solar-scope {
  background-color: var(--cast-black);
  color: var(--gold-leaf);
  font-family: var(--font-body);
  padding: var(--space-xl);
  border: var(--gold-rule);
  border-radius: var(--radius-md);
  margin: var(--space-md) 0;
}
`

export default function SolarThemeProvider({ children }: { children: ReactNode }) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: SOLAR_SCOPE_CSS }} />
      <div className="solar-scope">{children}</div>
    </>
  )
}
