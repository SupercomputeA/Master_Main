# AGENTS.md — supercompute-website

The website repo (`supercompute-website`, hosted on Cloudflare Pages at `supercompute.io`) is the **public face and platform shell** for the Supercompute ecosystem. It is no longer "just marketing" — it is a **platform service that mounts project components** shipped by other profiles (solar-punk, school, tradedesk, future projects). This file is the contract between the website profile and those project profiles.

If you are an agent acting on behalf of this repo, read this file before touching anything.

---

## Role

- Owns `supercompute.io` (production) and `staging.supercompute.io`.
- Owns the Terminal Dossier chrome (header, footer, theme tokens, nav).
- Owns the master CDN/DNS/edge layer via Cloudflare.
- **Mounts** project components submitted by other profiles — it does not author them.
- Owns the marketing surface (landing, about, consulting, community, social, knowledge graph viewer, NewsDesk reader, storefront).

It does **not** own:
- TradeDesk business logic (tradedesk profile).
- Solar-punk character / world building (solar-punk profile).
- School curriculum content (school profile).
- DevOps runtime / agent fleet internals (devops profile).
- Knowledge graph ontology (knowledge-graph profile).
- Publishing pipeline (publishing profile).

---

## Platform Service: Component Mount Points

This section is the contract that project profiles read when they want their UI surface to ship under `supercompute.io`. It is intentionally short — enough to define responsibilities on both sides, and not so much that it becomes a UI framework.

### 1. Mount Contract — what the website expects from a project component

A project component delivered to this repo **must**:

- Be a self-contained React/Next component (or whatever framework-of-record the project uses; the project profile is the source of truth on framework choice).
- Accept an **identity prop** — at minimum a wallet address; profile-specific extras (ENS, FID, userId) are fine — and render the project's UI surface from that identity.
- Render **no chrome** — no header, no footer, no theme wrapper, no global nav. The website wraps the component in Terminal Dossier chrome at the route layer. Components that bake in their own chrome will conflict with the platform shell.
- Live under `Master_Main/components/<project-name>/` (relative to the project repo; the project's PR is the source of truth on exact subpath).
- Export a **default mount** for the website to import, plus **named exports** for unit tests (e.g. `MyProject`, `MyProjectHeader`, `useMyProjectData`).
- Ship a **Storybook story** documenting every prop, every state, and at least one failure mode (empty identity, rejected wallet, network down).
- Ship a **component README** covering: props, state, dependencies (chains, RPCs, external APIs), ownership (who maintains), and a "how to test locally" recipe.

A project profile that submits a component without these is bounced before review.

### 2. Website Responsibilities — what this profile does when a project submits a component

When a project's PR lands on the website repo with a new mount:

- Add a route under `pages/` that imports the project's default mount and passes through the route's identity prop (typically `router.query.wallet` or a session-resolved wallet).
- Wrap the mounted component in Terminal Dossier chrome — `<PublicLayout>` (header/footer/theme) for public surfaces, `<MemberLayout>` for gated surfaces.
- Add a nav entry pointing at the new route.
- Deploy to **staging** (`staging.supercompute.io/<route>`) and tag the project profile for review.
- **Wait for Mone's explicit approval** before merging to `main` and shipping to production. No autonomous prod deploy for a new project mount — autonomy applies to existing surfaces, not to first-time mount points.
- Operations handle DNS, Cloudflare routing, cache rules, and access policies when the project surface needs them. The website profile coordinates with `supercompute-devops` for that.

### 3. Anti-Patterns — what the website does **not** do

The website profile will refuse, on principle:

- **Write project business logic.** If the TradeDesk needs a new order type, that PR comes from the tradedesk profile. The website mounts; it does not invent.
- **Touch external API integrations owned by a project.** If solar-punk talks to a specific NFT contract or a specific RPC, the website does not add fallback RPCs, retries, or schema mappings around it. The project owns that surface end-to-end.
- **Modify components inside `components/<project-name>/` without the project's PR.** Even a typo fix goes back to the project profile. The website imports and wraps; it does not edit the child's source.
- **Deploy a project component to production without Mone's approval.** Staging is autonomous; prod is gated. This applies to first-time mounts, major version bumps, and any change that touches identity, money, or chain calls.
- **Re-skin or re-theme a project component to match the platform.** The project owns its visual identity. If the project's chrome doesn't match Terminal Dossier, the answer is a thinner chrome in the project, not a forced re-theme in the website.

### 4. Current Mount Points (registry)

Start of a registry. Maintained as new project components ship. Each entry: route → owning profile → status.

| Route                         | Owning Profile      | Component                       | Status                                   |
| ----------------------------- | ------------------- | ------------------------------- | ---------------------------------------- |
| `/`                           | website             | (landing)                       | live — production                        |
| `/knowledge-graph`            | website             | `KnowledgeGraph`                | live — production                        |
| `/newsdesk`                   | website             | (NewsDesk reader)               | live — production                        |
| `/newsdesk/[slug]`            | website             | `KnowledgeGraph` (section)      | live — production & staging verified     |
| `/fleet`                      | website / devops    | `AgentFleet`                    | live — production                        |
| `/projects`                   | website             | (project directory)             | live — production                        |
| `/projects/solar-punk`        | solar-punk          | (placeholder; component inbound) | staging placeholder — awaiting mount     |
| `/projects/guide`             | website             | (guide placeholder)             | live — production                        |
| `/tradedesk`                  | tradedesk           | (placeholder; real build in tradedesk profile) | live placeholder — awaiting mount |
| `/school`                     | school              | (placeholder; component inbound) | staging placeholder — awaiting mount     |
| `/admin/*`                    | website             | `MemberLayout` chrome           | gated — internal                          |
| `/app/*`                      | website             | `MemberLayout` chrome           | gated — internal                          |

**Convention for project-mounted routes:**
- Public surfaces mount under `/` or `/projects/<project-name>/` and wrap in `<PublicLayout>`.
- Gated surfaces mount under `/app/<project-name>/` and wrap in `<MemberLayout>`.
- Component source stays in the project's own repo; the website imports it via package reference or symlink at build time, not by copying source into `components/`.

---

## Operating Notes

- **Live branch:** `staging` is the current production-line branch (per `STAGING.md`); verify with `wrangler pages deployment list --project-name=supercompute` before assuming prod.
- **Staging deploy:** push to `staging` triggers Cloudflare Pages preview at `staging.supercompute.io`.
- **Prod deploy:** merge `staging` → `main` after Mone approval; never merge a first-time project mount without an explicit "ship it".
- **Identity:** `0x1a828cd220559479e2f761805da4ee722683323B` (supercompute.eth) is the platform wallet; project components should not assume it — pass the session wallet as the identity prop.
- **Edge:** Cloudflare Pages + 1 D1 (`supercompute-db`) + 1 KV (`CACHE`) + 0 R2. If a project needs more edge surface, the request goes to `supercompute-devops`.

When in doubt: the website is a host, not an author. Mount, wrap, ship.

---

## Knowledge Graph Store (P0 resolution, 2026-08-07)

`/knowledge-graph` is built directly on D1; the legacy in-function `SEED_DATA`
constant and Memgraph hook are gone.

- **Schema:** `migrations/0007_kg_nodes_and_edges.sql` creates `kg_nodes` and `kg_edges`
  with `(graph, label, type, ...)` indexes. Schema-only — no data in the migration
  per the project's data/code separation convention.
- **Source of truth:** `public/data/kg/{school,police,defi}.json` (also exposes an
  `index.json` enumerating the three graphs). This is the same JSON the static
  fallback serves and the seed script reads from.
- **Seed:** `scripts/seed-kg-data.mjs` ingests the JSON and prints a SQL script
  on stdout. Pipe to `wrangler d1 execute supercompute-db --remote --file=-`
  after deploying migration 0007. 18 nodes / 22–25 edges per domain — every
  domain exceeds the legacy "9 nodes" cap.
- **API:** `functions/api/kg/[[catchall]].js` serves
  `/api/kg` (list), `/api/kg/graph?graph=<id>`, `/api/kg/search?graph=<id>&q=<term>`.
  D1 is primary; static JSON in `public/data/kg/` is the graceful fallback.
  Every response includes a `source: "d1" | "static"` field so the page (and
  any operator) can confirm where data came from without opening devtools.
- **Page:** `pages/knowledge-graph.tsx` reads the response, calls
  `/api/kg/search?graph=...&q=...` (debounced 200 ms) for server-side search,
  and surfaces the data source in both the search caption and the stats footer.
- **Memgraph:** retired. The prior `env.MEMGRAPH_HTTP_URL` hook was removed;
  do not reintroduce it without a /knowledge-graph re-architecture plan.

Acceptance status:
- Three distinct graphs render with different data: ✓ (school=18/22, police=18/24, defi=18/25).
- Search filters real entities: ✓ (server-side against D1, with static fallback).
- Entity count > 9 per domain: ✓.
- D1-backed, not static JSON: ✓ (primary store; static is a graceful fallback).
