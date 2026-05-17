# Marketing UI Kit

_Started 2026-05-08 03:51 UTC_

---

## User



## Assistant

_[tool: update_todos]_

_[tool: view_image]_

_[tool: image_metadata]_

_[tool: github_list_repos]_

_[tool: github_get_tree]_

_[tool: github_read_file]_

_[tool: github_read_file]_

_[tool: github_get_tree]_

_[tool: github_get_tree]_

_[tool: github_import_files]_

_[tool: list_files]_

_[tool: list_files]_

_[tool: read_file]_

_[tool: snip]_

_[tool: set_project_title]_

_[tool: read_file]_

_[tool: snip]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: snip]_

_[tool: read_file]_

_[tool: copy_files]_

_[tool: snip]_

_[tool: view_image]_

_[tool: image_metadata]_

_[tool: write_file]_

_[tool: write_file]_

Now I have enough context. Let me build out the design system rapidly.

_[tool: snip]_

Now let me build the design system preview cards. I'll create a shared CSS preview utility and individual specimen cards.

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: snip]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: snip]_

Now let me register all these design system cards:

_[tool: register_assets]_

_[tool: list_files]_

_[tool: list_files]_

_[tool: list_files]_

_[tool: read_file]_

_[tool: update_todos]_

_[tool: list_files]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: snip]_

_[tool: grep]_

_[tool: grep]_

I have a strong understanding from the README I wrote. Let me sample more of the source then build two UI kits: marketing and app.

_[tool: snip]_

_[tool: read_file]_

Now let me build the UI kits. The codebase is a single SPA with two main surfaces: the public landing/marketing view, and the member app.

_[tool: snip]_

_[tool: copy_files]_

_[tool: write_file]_

_[tool: snip]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: snip]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: snip]_

_[tool: register_assets]_

_[tool: write_file]_

_[tool: snip]_

_[tool: write_file]_

_[tool: snip]_

_[tool: snip]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: register_assets]_

_[tool: update_todos]_

_[tool: snip]_

_[tool: str_replace_edit]_

_[tool: done]_

_[tool: snip]_

_[tool: fork_verifier_agent]_

**Caveats**
- The hero's WebGL fluid-shader background is approximated with a layered radial-gradient backdrop — visually similar but non-interactive. If you want pixel parity, ship a port of the shader.
- **Inter** is substituted for the in-app system stack so type specimens render consistently. **Lucide** is the recommended icon-font fallback. Drop in the real brand typeface (and any branded icon set) and I'll re-tune.
- The app kit covers the highest-traffic surfaces (Dashboard, NewsDesk, Agent Chat, Web3 School, Auth). Many secondary pages (Profile, Assets, Token, Projects, NewsDesk CMS editor, API Status, Staking, Consulting Booking, Project Detail, Compose) are not yet rebuilt — same shell, more screens.
- No slide template was attached, so `slides/` was intentionally not created.

**Ask** — Open the **Design System** tab and review the 26 specimen cards plus the two UI kit previews. Tell me:
1. **Type** — keep Inter or swap to a brand face? Drop font files into `fonts/` if you have them.
2. **Pink shade** — `#E91E8C` is correct? The grainy logo skews softer; want me to retune the system pink to match the mark?
3. **Which app pages** to build out next (Profile / Assets / Token / NewsDesk CMS / Project Detail)?
4. Anything in the **agent fleet** that should be renamed or have its status changed — names beyond Quanta S, KNIGHT, OpenClaw, and Tutor S are inferred and worth your sanity check.

## User

Regenerate "Marketing UI kit".

## Assistant

_[tool: snip]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: register_assets]_

_[tool: show_to_user]_

_[tool: snip]_

Refreshed the Marketing UI kit with a punchier hero — the static gradient backdrop is now an animated multi-color blob field with a subtle grid grain overlay, and the "liberation" word in the headline now reads as a pink→gold gradient instead of flat pink. Tell me if you want it dialed up or back.

## User

Regenerate "Semantic colors".

## Assistant

_[tool: read_file]_

_[tool: read_file]_

_[tool: write_file]_

_[tool: show_to_user]_

_[tool: snip]_

Refreshed Semantic colors as a richer card — each row pairs the chip with its actual product treatment (badge, status dot with glow, and bar), plus the hex value, alpha tint, and where it's used in product. Let me know if you want a different framing or more swatches added.

## User

Regenerate "Marketing UI kit": this is actually my current page i like this style we should build on it

## Assistant

_[tool: list_files]_

_[tool: snip]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: snip]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: snip]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: write_file]_

Now let me rewrite the marketing UI kit to match the actual supercompute.io site:

_[tool: write_file]_

_[tool: write_file]_

_[tool: snip]_

_[tool: done]_

_[tool: fork_verifier_agent]_

Marketing UI kit rebuilt to match the live supercompute.io aesthetic — deep navy with dotted grid, brass-gold + cream + mono-blue palette, Phosphate-style display headline (substituted with Bowlby One SC), Caveat italic for the secondary CTAs, and HUD corner brackets.

**Caveats**
- **Phosphate** → **Bowlby One SC** (Google Fonts). Drop the real Phosphate file into `fonts/` and I'll swap.
- The italic CTA face is a guess (Caveat). If you have the actual font from the live site, share it.
- Down-page sections (TractionBar, Pillars, Quanta, Services, Fleet, Footer) are restyled into the same dark/gold/mono language to extend the hero — let me know if you want them to keep the cream-app palette instead, or if any sections shouldn't appear on this page at all.

## User

Verifier agent check completed

## Assistant

## User



## Assistant

## User

lets take a fresh look at the site. my agents are struggling to complete this project.

## Assistant

_[tool: questions_v2]_

_[tool: web_fetch]_

_[tool: web_search]_

_[tool: web_search]_

You're right — looking at what the live supercompute.io actually says, my earlier framing was off. The real site is positioned around six clear blocks, not the NewsDesk/TradeDesk story I led with:

1. Products, services, and project launches
2. Web3 consulting, agent dev, token launch strategy
3. All active and upcoming projects · Back builders, track progress, explore coins
4. The Supercompute builder coin · Staking, LP, and product coin ecosystem on Base
5. Free and premium courses on DeFi, NFTs, agents, on-chain ops, and token launches
6. Web3 consulting, community solutions, and the newsdesk platform

So the real positioning isn't "Cyborg Agency of 13 agents" — it's a **builder coin + project-launch platform + education + consulting** stack. The agents are infrastructure, not the headline.

Let me look at the current files and propose a clear cleanup plan before I build anything else. Where are your agents stuck — design fidelity, code structure, content, or scope? A couple of focused questions:

## User

getting the web3 features and CMS content in order has proven to be problematic

## Assistant

_[tool: update_todos]_

_[tool: write_file]_

Got it — Web3 + CMS, that I can help with directly. Your dev agents struggle there because both are state-heavy: every Web3 action has 4–6 visual states (idle/loading/signing/success/error/wrong-network) and CMS pieces are the same (draft/queued/published/failed/empty). When the spec is fuzzy on states, agents ship one happy path and stall on the rest.

Plan: build two focused **pattern sheets** with every state laid out as a tile. Agents can copy a tile straight into the app — no guessing.

_[tool: write_file]_

Now the Web3 patterns sheet — every wallet/auth/tx state laid out as a tile.

_[tool: write_file]_

_[tool: write_file]_

_[tool: register_assets]_

_[tool: snip]_

_[tool: done]_

_[tool: update_todos]_

All good — the work I did since your last note (the Web3 + CMS pattern sheets) addresses the actual pain you flagged, so the earlier questions were moot.

**What's new in the Design System tab:**

- **Web3 patterns** — 22 tiles across 7 surfaces: wallet pill (idle / connecting / connected / wrong-network), connect modal + no-wallet edge, SIWE 5-step (idle → signing → verified → rejected → server-fail), tx toasts (pending/success/error), tx modals, balance bar, staking (idle/valid/approve-first), project-back card (open/funded/claim).
- **CMS patterns** — 18 tiles across 6 surfaces: split-pane editor with AI sidebar, editor states (empty/AI-working/validation/conflict), schedule + cross-post pickers, library list with status filters, empty/loading/error trio, Web3 School module list (done/active/locked).

Each tile is one state. Head shows the human name + state chip; foot is a one-line spec (when to use, where it lives, what triggers it). Markup is intentionally lean so your agents can right-click → inspect → copy-paste straight into the SPA.

**For next:** point your agents at `patterns/web3-patterns.html` and `patterns/cms-patterns.html` first, then `ui_kits/app/` for shell + nav. The original `public/sc.css` is the source of truth where classes overlap — most pattern classes either match it or are documented as `NEW`.

Tell me which tile your agents are stuck on right now and I'll either drill in (more states, working code, edge cases) or expand the sheet.

## User

lets establish clear goals and expectations from this site that you are clear of and we will start there.

## Assistant

_[tool: snip]_

_[tool: questions_v2]_

Right. Goals first, then wireframes against them — otherwise we're just shipping pixels.

Here's how I want to do this: ask a focused round, then write up a one-page brief (objective, audience, primary action, success metric, scope, tone) for your sign-off. After you approve it, I'll generate 4–5 wireframe directions for the homepage that genuinely diverge — each optimizing for a different goal — and you pick one to take forward.

## User

Questions answered:
- primary_objective: Decide for me
- secondary_objectives: Consulting calls, Project backers, School students
- primary_audience: Web3-native founders launching a project
- first_minute: Decide for me
- success_metric_30d: Decide for me
- tone_voice: Pragmatic consulting firm (calm, expert, services-first)
- differentiator: we are hands on. our values are in order. pro expansion 
- must_have_pages: Home, $SCOM Token (tokenomics, staking, LP), Web3 School (course catalog + module pages), NewsDesk / Blog, Consulting / Services + book-a-call, About / Founder / Manifesto, Member dashboard (post-auth)
- trust_signals: Founder photo + bio
- what_works: the design aesthetic is dialed in. the terminal feel and blue look 
- what_doesnt: the agent keeps trying to make it into a trading platform placing a ticker at the top of the home page. 

no padding / margin so the content can breathe. 

nav bar font is too small 

the buttons should be on top of the CRT affect.

## Assistant

_[tool: snip]_

_[tool: write_file]_

_[tool: register_assets]_

_[tool: done]_

Got it. Synthesizing into a brief now, then wireframes against it.Brief is up — `brief/site-brief.html` in the Design System tab.

**The one-line takeaway:** the site is a **consulting practice** that happens to have a token, a school, and a NewsDesk — not the other way around. The primary objective is booking qualified strategy calls with Web3-native founders; everything else feeds that funnel.

I also explicitly captured the "do not" list (no ticker at top, no platform/agency framing in the hero, no token-led narrative, no burying the founder), the keep/fix list for the aesthetic, and a 30/90-day success metric.

Reply **approved** and I'll generate 4–5 distinct wireframe directions for the home page — each optimized for a different reading (founder-led / case-studies-led / terminal-dossier / progressive-scroll / services-menu). Reply **edits + notes** and I'll revise the brief first.

## User

approved

## Assistant

_[tool: snip]_

_[tool: write_file]_

_[tool: register_assets]_

_[tool: done]_

Five home directions live in the Design System tab — `brief/home-wireframes.html`. Tabs across the top to swap between them; margin notes on the right of each call out the design moves and where each one breaks.

| # | Direction | Best for | Risk |
|---|---|---|---|
| 01 | **Founder-first** — big photo, name, one-line positioning, services below | Trust through a real human | Conservative; depends on a strong photo |
| 02 | **Case-studies grid** — six project tiles ARE the hero | Proof-driven sales | Needs 5+ shippable case studies |
| 03 | **Terminal dossier** — mono everywhere, CTAs are shell commands | Differentiation by aesthetic | Most committed, narrowest filter |
| 04 | **Long scroll** — six bands stacked, sticky book button | Warming cold traffic | Risks reading like a SaaS landing |
| 05 | **Services menu** — four service cards, prices visible, per-card Book | Visitors ready to buy | Feels like an agency, less aspirational |

All five respect the brief: pragmatic consulting voice, founder visible, no ticker, generous padding, bigger nav type, CTAs above the CRT layer.

Reply with the number(s) you want me to take to hi-fi (one is ideal — two if you genuinely want to compare side-by-side at fidelity). I'll then build a working prototype in `ui_kits/marketing/` and update the kit's `README` so your dev agents have a single source of truth.

## User

03

## Assistant

_[tool: snip]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: register_assets]_

_[tool: done]_

_[tool: fork_verifier_agent]_

## User

Regenerate "Marketing UI kit": the grid in the background and the "screens" in front of them should not have the same tone. the foreground screens need to have the gold trim around them. the copy needs to be larger and have more tonal value from the background.

## Assistant

## User

Regenerate "CMS patterns": we are using the terminal look it uses these colors

## Assistant

_[tool: snip]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: show_to_user]_

_[tool: list_files]_

_[tool: read_file]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: copy_files]_

_[tool: write_file]_

_[tool: register_assets]_

_[tool: show_to_user]_

Phosphate Solid is in. `@font-face` registered in `colors_and_type.css`, `--font-display` swapped from the Bowlby One SC substitute to the real face, and the file copied into every subfolder that loads its own stylesheet (`ui_kits/marketing/`, `patterns/`, `brief/`, `preview/`) so it works offline.

Display preview card rebuilt on dark to show Phosphate at three scales (96 / 64 / 40) with the brand palette — cream body, gold accent, mono-blue caption. Everything else that uses `--font-display` (the marketing hero, brief title, wireframe headlines) picks it up automatically on reload.

