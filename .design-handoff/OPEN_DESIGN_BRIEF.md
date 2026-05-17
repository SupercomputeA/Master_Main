# OPEN DESIGN BRIEF — Supercompute Terminal Dossier

> **Audience:** any qualified agent — Claude Code subagent, Hermes (via Kanban), Quanta S (Virtuals), or a future human contractor — who can pick up a task unit and execute it without further instruction.
>
> **Authority:** this brief is the highest-authority source for design decisions on the Supercompute migration. When the handoff README (§N) and the live `sc.css` disagree, this brief tells you which wins.
>
> **Version:** v1 · 2026-05-16 · authored alongside the `design-system` branch of `SupercomputeA/Master_Main`.

---

## §0 — Read this before you touch any pixel

1. The locked direction is **Terminal Dossier (Direction 03)**. Not Cyborg Agency. Not pink-and-cream. Not Inter. Not white cards. If you see those in any reference file, you are reading a stale source — re-author in Terminal Dossier rules from this brief.
2. The primary 6-month objective is **booking qualified strategy calls**. Every page decision feeds that funnel. If a thing doesn't help convert a Web3-native founder to a booked call, it has to justify its existence on a different ledger (school enrollment, NewsDesk subscribe, project back) or be cut.
3. **Stale reference files** (do NOT copy verbatim, read for state-shape + copy only):
   - `.design-handoff/design_handoff_supercompute_site/patterns/web3-patterns.html` — wallet pill, SIWE auth, tx lifecycle, balance bar, staking, project back. *Visuals are Cyborg-Agency.*
   - `.design-handoff/design_handoff_supercompute_site/patterns/cms-patterns.html` — NewsDesk patterns. *Visuals are Cyborg-Agency.*
   - `.design-handoff/_archive/SKILL_v1.md` (if extracted) — old skill manifest, do not install verbatim.
4. The version badge bottom-right of every page (`BUILD · design-system @ <sha> · <time>`) is ground truth. If your commit shipped but the badge SHA didn't change, you forgot `npm run sync`. Run it.
5. **You are not the only agent.** Hermes coordinates milestones (tracks status), Quanta supplies content (NewsDesk, school copy, case studies), and a local Claude Code (or a designer subagent) implements. Stay in your lane (§4 — Agent roster).

---

## §1 — Voice & non-negotiables

### Voice
- **Pragmatic consulting firm.** Calm, expert, services-first.
- *"We've shipped 14 of these. Here's the playbook."* — NOT *"Stop manually managing your Web3 community — hire a Cyborg Agency!"*
- "We" = the company. "You" = the reader. First-person for an agent speaking ("KNIGHT online. I monitor positions…").
- Numbers as proof. `13 years` not `over a decade`. `$200` not `affordable`. `0 incidents` not `secure`.

### Forbidden phrases (anywhere on shipped surfaces)
- "Cyborg Agency"
- "platform" (as a self-description — fine when referring to Base or others)
- "Stop manually managing…" or any retail/yield-tourist framing
- Pricing claims dressed as guaranteed returns

### Forbidden visuals
- Price ticker at top of home page (handoff brief §4)
- Quanta orb hero (replaced by FounderStrip — handoff §7)
- Protocol-logo soup as a hero proof element
- Italic serif h1 over a pill-chip uppercase eyebrow (impeccable.style anti-slop)
- Purple gradients anywhere (impeccable.style anti-slop)
- Gradient-filled text
- White card backgrounds over the body
- Nested cards (card-inside-card "cardocalypse")
- Pink `#E91E8C` as a primary CTA color (use only for identity moments — see §2)
- Inter, Phosphate, Caveat, or any non-mono font on shipped pages

### Forbidden patterns (Emil's hit list)
- `transition: all` — always specify properties
- `ease-in` on UI animations — feels sluggish
- `scale(0)` entry — start at `scale(0.95)`
- Animating `padding`/`margin`/`height`/`width` — transform + opacity only
- Bare `:hover` without `@media (hover: hover) and (pointer: fine)` gate
- Animation > 300ms on UI
- Same enter/exit speed (exits should be faster)
- Missing `prefers-reduced-motion` override

### Casing
- **SUPERCOMPUTE** wordmark — all caps, letter-spaced.
- Eyebrows — `// path` or `// command --flag` lowercase mono with brass caret.
- Headlines — sentence case, mono, single accent phrase in `--gold-warm`.
- Body — sentence case mono.

---

## §2 — System primitives

### Palette (Terminal Dossier, locked)
```
--site-bg     #0a1330   deep navy ground (every page)
--gold-warm   #C9A33A   brass — primary heading accent + primary CTA
--gold-warm-2 #b8902c   brass pressed
--cream       #F4ECD8   off-white display text
--mono-blue   #6FA3E5   body, secondary text, annotations
--hud-yellow  #E0BE3F   HUD corner brackets, status pill borders
```

### Palette — identity-moments-only (handoff §6a — gradient/legacy)
```
--pink    #F472B6   logo gradient stop, AuthOverlay accent ring, school progress fill
--gold    (legacy)  logo gradient stop (kept for the SC mark)
--cyan    (legacy)  avoid in new work
--violet  #7c3aed   logo ring
```

These are **only** used for: the SC logo gradient, the AuthOverlay's accent ring on its avatar, the school-progress bar fill. Never page background, body text, default CTA, or section accent.

### Type
**JetBrains Mono only on shipped surfaces.** Body 14px / 1.7 line-height / `.3px` letter-spacing. Section eyebrows 13px mono blue with brass caret. Hero k/v block 32px desktop / 24px mobile.

Load via Google Fonts CDN today (`@import` at top of `sc.css`); self-host in Phase E for perf/privacy.

### Spacing — 4px scale
```
--s-1: 4   --s-2: 8    --s-3: 12   --s-4: 16
--s-5: 20  --s-6: 24   --s-8: 32   --s-10: 40   --s-12: 48
```
Section padding `96px 0`. Hero padding `80px 0 120px`. Sidebar 220px (`--nav-w`). Topbar 52px (`--topbar-h`).

### Radii — flat by default
**No radius on Terminal Dossier surfaces.** Cards are flat sheets:
```css
background: rgba(255, 255, 255, .02);
border: 1px solid rgba(244, 236, 216, .10);  /* or .30 for the brass hairline */
```
Radii only for the SC logo (50%), AuthOverlay modal (`--r-3xl 20px`), pill chips (`--r-pill 999px`).

### Shadows — restrained
No shadows on body content. Only the SC logo gets a `drop-shadow(0 0 16px rgba(201,163,58,.30))` glow. Hover lift = border-color shift + `translateY(-1px)`, NOT shadow.

### Motion
| Token | Value |
|---|---|
| `--t-fast` | `.15s ease` |
| `--t-base` | `.20s ease` |
| `--t-slow` | `.60s ease` |
| `--t-spring` | `1.2s cubic-bezier(.34, 1.56, .64, 1)` |

Strong ease-out: `cubic-bezier(0.23, 1, 0.32, 1)` — use for button hovers, page mounts, scaling.
Strong ease-in-out: `cubic-bezier(0.77, 0, 0.175, 1)` — use for on-screen movement.
iOS drawer: `cubic-bezier(0.32, 0.72, 0, 1)` — use for slide-in panels.

Durations: button press `100–160ms`, tooltip `125–200ms`, dropdown `150–250ms`, modal `200–500ms`. Hard cap on UI: 300ms.

### Z-index floor
```
0     CRT body::before dot-grid
1     CRT body::after scanlines, .vignette
2     .ts-page (content)
3     .cmd-btn, nav-item, interactive controls
4     (reserved)
100   nav#appNav sidebar
250   .hud-corner brackets
260   .version-tag build badge
300+  .auth-overlay, .modal-overlay, .welcome-overlay, #articleModal, #commentsModal
```

### Reusable component classes (all scoped under `.ts-page` or `.ts-landing` to avoid SPA-shell collisions)
- `.prompt-line` — eyebrow with `// command --flag` and brass blink caret
- `.hero` + `.hero-output` — 140px / 1fr k/v grid
- `.hero-body` — paragraph, mono-blue with cream `<strong>`
- `.hero-ctas` — flex row of `.cmd-btn`
- `.cmd-btn.solid` / `.cmd-btn.ghost` — command-line buttons, lowercase, brass border/fill
- `.sheet` + `.sheet-row` — flat-sheet dossier table (num / body / price)
- `.proj-grid` + `.proj-cell` — 1px brass-grid 2-col cells with status dots
- `.feed-row` — eyebrow / title / meta 3-col for news, school, etc.
- `.founder` + `.founder-photo` + `.founder-meta` + `.principles` — 3-col founder strip
- `.section.closing` + `.closing-headline` + `.closing-body` + `.closing-btn` — centered CTA section
- `.ls-footer` — 4-col landing footer
- `.shop-grid` / `.shop-cell` / `.shop-thumb` / `.shop-price-row` — storefront product cells
- `.consulting-row` + `.consulting-price` — sheet-row variant with inline `// book` button
- `.hud-corner.{tl,tr,bl,br}` — viewport HUD brackets (28×28, brass-yellow)
- `.vignette` — radial edge darkening

### Signature treatment (handoff §6g/§6h)
- `body::before` — 56×56 dot-grid at 3% white, `z:0`
- `body::after` — 1px/3px scanlines `rgba(0,0,0,.18)`, `mix-blend-mode: multiply`, opacity `.55`, `z:1`
- `.vignette` — `radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,.35) 100%)`, `z:1`
- Four `.hud-corner` brackets pinned to viewport corners, `z:250`

---

## §3 — Page roster + task units

Each task unit is self-contained. Pick the highest-priority unblocked unit. Implement. Run `npm run sync`. Commit. Record `shipped_sha`.

```yaml
# Phase B — Page work
- id: B1-agent-fleet
  page: "#page-agent-fleet (NEW — to be created)"
  assignee: subagent:designer  (with Quanta for agent copy)
  status: pending
  blocked_by: []   # A1 already shipped
  references:
    - .design-handoff/.../ui_kits/app/Components2.jsx → AgentFleet
    - This brief §1 (voice — must avoid "Cyborg Agency" framing)
    - sc-flows.js (read for existing agent data structures)
  dod:
    - New sidebar nav item "Agent Fleet" under PUBLIC section.
    - Hero with // ./agents --fleet prompt + /whoami-style metadata.
    - .sheet of 13 agents — each row: status dot, name (e.g. HERMES, QUANTA S, KNIGHT), role, current task, last-seen timestamp.
    - 4 status-grouping stat tiles above the sheet (Active / Observer / Dev / Offline counts).
    - Closing CTA: // talk --to-agent → /agent-chat (member-gated).
    - Mobile collapse to single column under 900px.
    - Hover gated under @media (hover: hover) and (pointer: fine).
    - Reduced-motion respected.
    - All 13 agent names + roles + descriptions supplied by Quanta (file a Hermes Kanban issue to her if not already in the repo).
  verification:
    - Click sidebar "Agent Fleet" → page mounts with 220ms slide-up + fade.
    - All 13 agents visible. No "Cyborg Agency" copy anywhere.
    - Version badge SHA updates.
  shipped_sha: null

- id: B2-about
  page: "#page-about"
  assignee: subagent:designer  (Hermes supplies operator bio)
  status: pending
  blocked_by: []
  references:
    - .design-handoff/.../ui_kits/marketing/Sections.jsx → FounderStrip (same pattern)
    - Existing page-home FounderStrip block in Supercompute.html for visual reference
  dod:
    - // cat ./operator.md prompt-line hero.
    - 360x360 founder photo (use placeholder div until Hermes supplies real image).
    - Bio paragraph: 13 years operating, Occupy LA → Base L2, 14 projects shipped.
    - Three principles cards: Hands-on / Values in order / Pro expansion.
    - "What I work on" sheet — same as services list but with /// next to each, no prices.
    - Contact closing CTA: // book --intro-call routing to consulting.
  verification:
    - Page mounts smooth, mono throughout, no white cards.
  shipped_sha: null

- id: B3-blog-newsdesk
  page: "#page-blog"
  assignee: subagent:designer  +  kanban:quanta (article content)
  blocked_by: []
  references:
    - .design-handoff/.../ui_kits/app/Components.jsx → NewsDesk
    - patterns/cms-patterns.html — STATE-SHAPE AND COPY ONLY, ignore visuals
    - sc-flows.js — articles likely already wired to D1 via fetch
  dod:
    - // ./newsdesk --latest hero.
    - .feed-row list pulled from /api/articles (existing D1 endpoint per repo CLAUDE.md).
    - Each row: category eyebrow (e.g. [ sovereignty ]) / title / date · read-time.
    - Hover title turns brass-gold.
    - Subscribe input + // subscribe --newsdesk button at bottom.
    - Empty state if no articles: "// no articles yet · check back".
  verification:
    - Articles render from D1, not mock data.
    - Clicking a row opens existing articleModal.
  shipped_sha: null

- id: B4-projects
  page: "#page-pub-projects"
  assignee: subagent:designer  +  kanban:quanta (case-study copy)
  blocked_by: []
  references:
    - .design-handoff/.../ui_kits/marketing/Sections.jsx → RecentProjects (the 2x2 grid I already shipped on home page)
    - patterns/web3-patterns.html (states only — stale visuals)
  dod:
    - // ./projects --all hero.
    - .proj-grid expanded to multi-row (all current/past projects, not just 4).
    - Each cell: status dot (live/shipped/ops), tag, title, meta (raised/backers/incidents), cat ./case-study link.
    - Filter chips at top: all / live / shipped / ops.
    - For "Back a project" CTA: brass cmd-btn → opens project-invest page.
  verification:
    - Real case-study copy from Quanta (not Glyph Foundry placeholders).
    - Filter chips work via existing DOM toggles.
  shipped_sha: null

- id: B5-token
  page: "#page-token"
  assignee: subagent:designer
  blocked_by: []
  references:
    - .design-handoff/.../ui_kits/app/Components2.jsx → TokenPage
    - patterns/web3-patterns.html state-shape for token chip + copy address
  dod:
    - $SCOM hero with token logo (legitimate identity gradient OK on logo).
    - Copy-address row: 0x… with // copy --address ghost cmd-btn.
    - 4 stat tiles: price, supply, holders, 24h volume (TBA placeholders until D2).
    - Allocation sheet: team / treasury / community / liquidity / advisors with ASCII bar fills.
    - On-chain activity feed (TBA until D2).
    - Disclaimer: not financial advice etc.
  verification:
    - No pink/cyan as primary accent — brass-gold throughout.
    - Bars use ASCII (██████░░░░░░), not gradient fills.
  shipped_sha: null

- id: B6-staking
  page: "#page-staking"
  assignee: subagent:designer
  blocked_by: [B5-token]
  references:
    - patterns/web3-patterns.html → Stake idle / valid / approve-first STATES ONLY
    - Re-author all card visuals: navy + flat sheet + brass-gold input focus, NOT pink
  dod:
    - // ./staking --pool hero.
    - Stake input flat sheet (no white background) with brass-gold focus border.
    - Wallet balance + already-staked rows beneath input.
    - Projected APR pill: brass-yellow border, transparent fill.
    - Two states: idle (disabled cmd-btn until amount > 0) → valid (// stake brass-solid).
    - Approve-first variant when allowance insufficient: // approve --scom step 1/2.
    - Status row: ACTION_REJECTED / nonce_expired error pills if applicable.
  verification:
    - NO white card. NO pink CTA. NO green Continue. All brass.
    - Mobile: input column-stacks.
  shipped_sha: null

# Phase B7+ — Member surfaces (post-auth, gated by authGate)
- id: B7-dashboard
  page: "#page-dashboard"
  assignee: subagent:designer
  blocked_by: []
  references:
    - .design-handoff/.../ui_kits/app/Components.jsx → Dashboard
    - sc-flows.js renderDash()
  dod: [ topbar with // path prompt, 4 StatTiles, agent sheet, recent activity feed ]
  shipped_sha: null

- id: B8-agent-chat
  page: "#page-agentchat"
  assignee: subagent:designer
  blocked_by: []
  references: [ Components.jsx → AgentChat ]
  dod: [ terminal transcript with [SPEAKER › HH:MM], › input prompt, agent picker, streaming response, auto-scroll ]
  shipped_sha: null

- id: B9-web3school
  page: "#page-web3school"
  assignee: subagent:designer
  blocked_by: []
  references: [ Components.jsx → School, asciiBar helper ]
  dod: [ progress banner with springy fill, module rows with ASCII progress bars, n/7 ratio ]
  shipped_sha: null

# Remaining member/admin pages — same pattern, dispatch as bandwidth allows
- B10 Assets · B11 Social Feed · B12 Alerts · B13 Profile · B14 TradeDesk · B15 Community · B16 NewsDesk CMS · B17 API Status

# Phase C — Conversion infra
- id: C1-calendly
  assignee: subagent:designer (or me)
  blocked_by: [B1-agent-fleet]  # not literally; just sequence after at least one page proves the loop
  dod:
    - Calendly inline embed in consulting page (replaces openCalendly() popup)
    - book_call_confirmed analytics event fires on Calendly event_scheduled
    - Mobile: Calendly iframe responsive

- id: C2-stripe
  blocked_by: [C1-calendly]
  dod: [ Stripe deposit Payment Intent on Calendly webhook, hold-and-capture pattern ]

# Phase D — Wallet + on-chain
- id: D1-siwe
  assignee: subagent:designer (UI) + me (backend)
  blocked_by: [C1-calendly]
  references:
    - patterns/web3-patterns.html — STATE-SHAPE + COPY ONLY (5 states: idle, awaiting sig, verified, user rejected, server fail)
    - Re-author every visual: navy + flat sheet + brass cmd-btn // sign --message, brass-yellow status pill borders, never pink/green/white
    - viem^2.48.11 already in package.json
    - /api/auth/nonce + /api/auth/login already scaffolded per repo CLAUDE.md
  dod: [ real SIWE flow end-to-end with a real wallet; admin allowlist gates Fleet admin ]

- id: D2-token-wired
  blocked_by: [D1-siwe]
  dod: [ B5-token hooked to Base RPC for price/supply/activity ]

- id: D3-fleet-admin
  blocked_by: [D1-siwe]
  dod: [ admin-only AgentFleet at /admin with pause/logs/prompt/kill per agent + pause-all kill switch behind confirm ]

# Phase E — Polish
- E1 131-hex sweep · E2 focus rings + empty states + a11y · E3 Lighthouse + dead JSX delete
```

---

## §4 — Agent roster + scope of authority

(Locked 2026-05-16 per the user: *"Hermes coordinates only, I implement."*)

| Agent | Type | Authority | What it does | What it does NOT do |
|---|---|---|---|---|
| **Hermes** | Local agent in Hermes Workspace, surfaced via the Kanban board | Coordinator / status tracker | Receives milestone-summary cards on the Hermes Kanban board with SHA + diff. Surfaces status in the Hermes dashboard. Tracks which milestones are open vs done. | **Does not write code. Does not dispatch work to other agents on its own.** |
| **Quanta S** | Virtuals agent, surfaced via Hermes Kanban | Content owner | NewsDesk articles, Web3 School module copy, project case-study copy, agent fleet bios. Engaged by creating a Kanban card and assigning it to her when content (not layout) is the bottleneck. | **Does not implement HTML/CSS.** |
| **Claude Code (me, Opus 4.7)** | Local Claude Code session | Sole implementer | All HTML/CSS/JS writing, all `npm run sync`, all git commits, browser verification. May spawn local subagents at my discretion. | Does not bypass milestone sign-offs without operator approval. |
| **designer (Claude Code subagent)** | Local | UI/UX implementer on demand | Per-page CSS + HTML port when fresh context helps (e.g. big page rewrites). | Does not commit autonomously — passes work back to me for commit. |
| **pm (Claude Code subagent)** | Local | Milestone summarizer | Drafts the milestone status update I file to Hermes. | Does not pick work — I do. |
| **Explore (Claude Code subagent)** | Local | Read-only recon | Codebase searches when I need a fast map. | Never writes. |
| **Plan (Claude Code subagent)** | Local | Architecture | Long-range planning when a phase needs structural rethink. | Never writes. |
| **Human (operator)** | Self | Final approval + push | Reviews each milestone via version-badge SHA, pushes `design-system → main`, approves cost-incurring upstream calls. | Should not be asked per-commit; milestones only. |

---

## §5 — Execution protocol

### The loop
1. **Wake.** I read this brief, pick the highest-priority unblocked task unit. (PM subagent may help if there are many to triage.)
2. **Implement.** I (or a local designer subagent if scope warrants) write the code. Pure HTML + CSS, no JSX runtime. Reuse the system primitives in §2. Respect every rule in §1.
3. **Verify.** Open `http://localhost:8765/?v=<random>` (the static server already runs on port 8765). Walk the page. Check the DoD checklist. Confirm console clean. Test reduced-motion in DevTools. Resize <900px.
4. **Sync + commit.** `npm run sync` (auto-injects version badge SHA). `git add … && git commit -m "feat(design-system): B{n}-{slug} — {short desc}"`. Then `npm run sync` again so the badge reflects the new HEAD.
5. **Record.** Update this brief in place — set `shipped_sha: <sha>` on the task unit.

### Milestone reporting
At the end of each milestone (M1, M2, …):
1. PM subagent (or me) drafts a summary: which task units completed, diff stats, the badge SHA at HEAD, one-sentence per page screenshot description, any drift discovered.
2. Create a card on the Hermes Kanban board (column: "Done — M{n}") with body:
   ```
   M{n} complete · SHA <sha> · {what shipped}
   ```
   Assign to Hermes so it surfaces in the operator's Hermes dashboard.
3. Post the same summary in chat to the operator. Operator reads the version badge in localhost, hard-refreshes, signs off.
4. If kicked back, move the card back to "In Review" and reopen the relevant task unit; do NOT proceed to the next milestone.

### Quanta engagement
When a task DoD requires content (e.g. NewsDesk articles, case-study copy, agent bios):
1. Create a Hermes Kanban card with the content brief — voice rules (§1), specific copy required, character limits, references. Assign to Quanta S.
2. Quanta delivers her copy as a card comment (or attached markdown).
3. I paste her copy into the corresponding HTML and commit. Commit-message attribution: `Content: Quanta S via Hermes Kanban card #<id>`.

### Cost discipline
- Hermes Kanban calls: free (local).
- Quanta runtime: costs money per Virtuals execution. Engage only when content is the bottleneck — do not loop her in for layout/CSS questions.
- Stripe live keys / Cloudflare deploy: human approves before any production touch.

### Paperclip deprecation note
The Paperclip skill (`~/.claude/skills/paperclip/SKILL.md`) is still installed on this machine but is **deprecated** per operator decision 2026-05-16. Do NOT file Paperclip issues or invoke that skill for this project. All coordination flows through the Hermes Kanban board.

---

## §6 — Drift annex (patterns folder is stale)

Both `.design-handoff/design_handoff_supercompute_site/patterns/cms-patterns.html` and `.../patterns/web3-patterns.html` were authored BEFORE Direction 03 (Terminal Dossier) was locked. They show the older Cyborg-Agency aesthetic: **white cards, pink CTAs, green Continue buttons, soft 12px radii, pink focus borders on inputs**. They are visually wrong.

| Pattern element | Stale (what you'll see) | Terminal Dossier (what to ship) |
|---|---|---|
| Card substrate | white `#fff` + 10–12px radius + soft shadow | `rgba(255,255,255,.02)` flat sheet + 1px brass hairline + **0 radius** + **no shadow** |
| Primary action button | dark solid `#000` or pink solid `#E91E8C` or green solid `#4ade80` | `.cmd-btn.solid` — brass-gold (`--gold-warm`) background, dark text, command-line label (`// sign --message`, `// stake`) |
| Input focus border | pink 1.5px solid | brass-gold (`--gold-warm`) 1px solid |
| Annotation copy | medium grey on white | `--mono-blue` on flat sheet |
| Status pill | pink/green/red solid fill on white | brass-yellow / success / danger 1px border, transparent fill, mono label |
| Avatar / SC logo | (correct) pink→gold gradient ring | Keep — this is a legitimate identity moment per §1 |
| State logic / copy | (correct, USE THIS) | (use as-is — that's why we read the patterns at all) |

**Rule:** read `patterns/*.html` only for state inventories ("idle → awaiting sig → verified → rejected → server fail") and exact copy strings ("Verify your wallet", "Check your wallet", "ACTION_REJECTED · User rejected the request"). Implement every visual in Terminal Dossier.

If a future revision of the patterns sheets ships in Terminal Dossier, this annex gets deleted. Until then, the annex is law.

---

## §7 — Verification template

Every task unit closes with this checklist. Copy-paste into the commit body or PR description.

```
[ ] DoD line items all satisfied
[ ] No console errors after navigate
[ ] Hard-refresh of http://localhost:8765/?v=<random> shows the change
[ ] Version badge SHA in bottom-right matches HEAD
[ ] Hover behavior gated under @media (hover: hover) and (pointer: fine)
[ ] prefers-reduced-motion override present for any animation > 0ms
[ ] No hard-coded hex values introduced (use var(--…))
[ ] Mobile <900px: layout collapses single-column without overflow
[ ] No forbidden phrases (Cyborg Agency, platform, etc.) in copy
[ ] No forbidden visuals (white cards, pink as primary CTA, etc.)
[ ] Z-index respected (modals ≥300, HUD 250, content 2–3)
```

---

## §8 — How to update this brief

This file is the single source of truth. When a task ships:
1. Set its `shipped_sha:` in §3.
2. If drift was discovered, add to §6.
3. If a new primitive was added to `sc.css`, list it in §2.
4. If a milestone closed, file the Hermes Kanban status to Hermes per §5.

When a NEW task is needed:
1. Add it to §3 with a unique `id` (Bn / Cn / Dn / En), `assignee`, `blocked_by`, `references`, `dod`, `verification`.
2. Commit the brief change in the same commit as the task code, OR in a separate `docs(design-system): add task B-{slug} to OPEN brief` commit.

---

*This brief is part of the `design-system` branch on `SupercomputeA/Master_Main`. The plan that authored it lives at `/Users/QSMolt/.claude/plans/we-have-a-style-curious-micali.md`. The session memories that informed it: `feedback_design_taste_skills.md`, `feedback_execute_when_spec_is_clear.md`, `feedback_dont_race_frame_first.md`, `project_supercompute_handoff_drift.md`.*
