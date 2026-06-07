# DESIGN.md — SUPERCOMPUTE Design System
> Locked. Read before touching any frontend file. This is law.

## Identity
**SUPERCOMPUTE** — Hermes Terminal Aesthetic  
Sovereign AI-native platform. Liberation technology. Not extraction machinery.  
Visual identity: **operator terminal meets Solarpunk resistance**.  
Every page should feel like a command interface built for a just future.

## Core Aesthetic: Hermes Terminal
- Dark navy backgrounds. Gold signal. Teal environment.
- Fine 1px lines. Phosphate Solid for display. Monospace for data.
- Controlled density — no empty decorative space, no clutter.
- Every element earns its place.

---

## Color Palette

```css
:root {
  /* Primary */
  --color-bg-primary:    #0a0f1e;   /* Deep navy — page background */
  --color-bg-secondary:  #111827;   /* Slightly lighter — card backgrounds */
  --color-bg-tertiary:   #1a2235;   /* Elevated surfaces */

  /* Signal (Gold) */
  --color-gold:          #e8c87a;   /* Primary CTA, headings, key data */
  --color-gold-dim:      #b89a4a;   /* Secondary gold, borders */
  --color-gold-glow:     rgba(232, 200, 122, 0.15); /* Glow effects */

  /* Environment (Teal) */
  --color-teal:          #00d4b8;   /* Links, active states, KG nodes */
  --color-teal-dim:      #007a6b;   /* Secondary teal */
  --color-teal-glow:     rgba(0, 212, 184, 0.12);

  /* Text */
  --color-text-primary:  #f0ebe0;   /* Body copy — warm white, not pure white */
  --color-text-secondary:#9ca3af;   /* Secondary text, metadata */
  --color-text-muted:    #4b5563;   /* Disabled, placeholders */

  /* Accent */
  --color-sienna:        #c4622d;   /* Warnings, alerts */
  --color-sage:          #6b8f71;   /* Success states */

  /* Borders & Lines */
  --color-border:        rgba(232, 200, 122, 0.2);  /* Gold hairline — default border */
  --color-border-teal:   rgba(0, 212, 184, 0.2);    /* Teal hairline */
  --color-border-subtle: rgba(255, 255, 255, 0.06); /* Subtle panel borders */
}
```

---

## Typography

```css
/* Display — Headings, hero text, nav brand */
font-family: 'Phosphate Solid', 'Phosphate', impact, sans-serif;
letter-spacing: 0.05em;
text-transform: uppercase;

/* Body — Paragraphs, descriptions */
font-family: 'IBM Plex Sans', 'Space Grotesk', system-ui, sans-serif;
font-weight: 400;
line-height: 1.6;

/* Data / Code — Metrics, addresses, timestamps, terminal output */
font-family: 'IBM Plex Mono', 'JetBrains Mono', monospace;
font-size: 0.85em;

/* Scale */
--text-xs:   0.75rem;   /* 12px — labels, badges */
--text-sm:   0.875rem;  /* 14px — metadata, captions */
--text-base: 1rem;      /* 16px — body */
--text-lg:   1.125rem;  /* 18px — lead text */
--text-xl:   1.25rem;   /* 20px — card titles */
--text-2xl:  1.5rem;    /* 24px — section headers */
--text-3xl:  1.875rem;  /* 30px — page headers */
--text-4xl:  2.25rem;   /* 36px — hero text */
```

---

## Spacing Grid
**Base unit: 8px.** All spacing is multiples of 8.

```css
--space-1:  4px;
--space-2:  8px;
--space-3:  12px;
--space-4:  16px;
--space-5:  24px;
--space-6:  32px;
--space-7:  48px;
--space-8:  64px;
--space-9:  96px;
--space-10: 128px;
```

---

## Component Patterns

### Cards (DATACENTER aesthetic)
```css
.card {
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: 2px;           /* Sharp corners — not rounded pill */
  padding: var(--space-5);
  position: relative;
}
/* Top-left corner accent */
.card::before {
  content: '';
  position: absolute;
  top: -1px; left: -1px;
  width: 12px; height: 12px;
  border-top: 2px solid var(--color-gold);
  border-left: 2px solid var(--color-gold);
}
```

### Buttons
```css
/* Primary */
.btn-primary {
  background: transparent;
  border: 1px solid var(--color-gold);
  color: var(--color-gold);
  font-family: 'Phosphate Solid', impact, sans-serif;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: var(--space-2) var(--space-5);
  transition: background 0.15s, box-shadow 0.15s;
}
.btn-primary:hover {
  background: var(--color-gold-glow);
  box-shadow: 0 0 12px var(--color-gold-glow);
}

/* Secondary */
.btn-secondary {
  border-color: var(--color-teal);
  color: var(--color-teal);
}
.btn-secondary:hover {
  background: var(--color-teal-glow);
}
```

### Terminal Comment Prefix
Section labels use `//` prefix in gold monospace — this is the voice of the interface.
```html
<span class="section-label">// knowledge graph</span>
```

### Status Indicators
```css
.status-live    { color: var(--color-teal); }
.status-pending { color: var(--color-gold); }
.status-offline { color: var(--color-text-muted); }
/* Pulse dot for live */
.pulse::before {
  content: '●';
  animation: pulse 2s infinite;
}
```

---

## Knowledge Graph Visual Language
KG nodes and edges follow the Hermes Terminal palette:
- **Nodes:** teal fill `var(--color-teal)`, 1px gold border on hover
- **Edges:** `var(--color-border)` at rest, `var(--color-teal-dim)` on active path
- **Labels:** IBM Plex Mono, `--text-xs`, `var(--color-text-secondary)`
- **Selected node:** gold border `var(--color-gold)`, gold glow
- **Background:** `var(--color-bg-primary)` — never white, never grey

---

## Page Layout
```
Max content width: 1280px
Sidebar (nav): 220px fixed left
Main content: fluid, padding 32px
Mobile breakpoint: 768px — sidebar collapses to top nav
```

---

## Canonical Links
These are real. Wire them. Do not use `#`.

| Label | URL |
|---|---|
| X / Twitter | https://twitter.com/supercompute_io |
| Farcaster | https://warpcast.com/supercompute |
| Calendly | https://calendly.com/ora_mi |
| ENS | https://app.ens.domains/supercompute.eth |
| GitHub | https://github.com/SupercomputeA |
| NewsDesk | https://supercompute.newsdesk.app |

---

## What Is Forbidden
- ❌ Purple gradients on white backgrounds
- ❌ Inter, Roboto, Arial as display fonts
- ❌ Rounded corners > 4px on cards
- ❌ Generic hero sections with stock illustration style
- ❌ Light mode (this platform is dark-native)
- ❌ Any new color not in this palette without filing a design issue first
- ❌ Spinner placeholders in production (`// loading...` is a dev state, not a shipped state)

---

## Voice & Microcopy
- Section labels: `// lowercase monospace` in gold
- Status: `LIVE`, `PENDING`, `ARCHIVED` — uppercase, no punctuation
- Dates: ISO-adjacent `2026-06-07` or `Jun 07` — never `June 7th, 2026`
- Addresses: truncated `0x89ac...d0c0` — never full hash in UI
- Version: `v1.1.0` — always lowercase v

---

## Lucid Origin (Editorial / Article Visual Style)
For article headers, POAP designs, and editorial imagery:
- Warm gouache aesthetic — painterly, not photorealistic, not cartoon
- African diaspora visual identity + Solarpunk optimism
- Palette: warm gold, ochre, sienna against deep indigo/navy
- Human scale — people present in scene, not abstract geometry
- Architecture: organic, terraced, portal-framed compositions
- Atmosphere: dramatic volumetric clouds, golden hour or deep dusk

This style is used by Quanta Sovereigna for all NewsDesk article headers.  
Generation target: fal.ai with sakuga prompt framework.

---

*Last updated: 2026-06-07*  
*Owner: Orami / Hermes*  
*Do not edit without Orami approval.*
