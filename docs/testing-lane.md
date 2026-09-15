# The testing lane — verify a build before it reaches main

**Status:** ready for review (branch `ci/preview-verify`, PR #98, not merged). The
required-status-check half of the gate is **already registered on `main`** — see
"The gate is registered" below.
**Directive:** Mone, 2026-09-15 — stop publishing straight to main; have a testing solution ready.

## Why this exists

Every defect we shipped recently was found by a human looking at production afterwards:

| What shipped | How it was found |
|---|---|
| `public/_headers` applied **nothing** (header blocks without path sections) | someone curled prod |
| `X-Frame-Options: DENY` contradicted `frame-ancestors 'self'` | someone curled prod |
| `COOP: same-origin` severed `window.opener` for the Coinbase Wallet popup | someone curled prod |
| The `/auth` MetaMask button threw `Provider not found` | Mone tried to log in |
| The new `/staking` surface and `/projects/staking` not live while CI read "success" | this lane's first smoke run |

The common cause is structural: **merging to `main` was the only way to see a build.** CI proved "it compiles", never "the deployed thing works".

## The lane

```
PR opened
  ├── 1. conflict-marker scan       the tree under review is the tree that was resolved
  ├── 2. build                        (static export)
  ├── 3. header invariants            source _headers  ==  built out/_headers
  ├── 4. CSP invariants               no executable inline script; report collector wired
  ├── 5. unit tests                   header assertions, CSP suites
  ├── 6. deploy THIS PR as a preview  → https://pr-<number>.supercompute.pages.dev
  ├── 7. smoke the PREVIEW            routes + surface markers + closed debug paths + the /api/* gates
  ├── 8. header drift vs the PREVIEW  what the preview actually serves
  └── 9. verdict comment on the PR    with the preview URL and repro commands
```

Nothing reaches `main` until that preview is green. `.github/workflows/preview-verify.yml`
implements it, and `build → deploy preview → verify` is now a **required** check on
`main` — the lane is a gate, not a suggestion.

## Run it yourself (same scripts, any URL)

```bash
node scripts/smoke-preview.mjs https://pr-123.supercompute.pages.dev        # routes + markers
node scripts/smoke-preview.mjs https://supercompute.io --json               # machine-readable
node scripts/smoke-preview.mjs https://supercompute.io --negative-control   # prove the gate traps bite
node scripts/assert-headers.mjs --url https://supercompute.io               # what prod serves
npm run check:headers && npm run check:inline-scripts && npm run test:csp   # local invariants
node scripts/test-auth-flow.mjs                                             # live SIWE end-to-end
```

## What each check would have caught

- **conflict-marker scan** — a committed `<<<<<<<`/`>>>>>>>` means the tree under review is not the tree anyone resolved. It earned its place before shipping: its first clean-tree run found **489 conflict blocks committed into `yarn.lock` on `main`** by a develop merge (fixed in its own PR, which must land before this lane can go green).
- **smoke-preview (markers, not just status)** — a `200` serving the *previous* page is the failure mode we keep hitting. `/staking` returning 200 with "awaiting liquidity" is a failure, and this flags it.
- **smoke-preview (closed surfaces)** — `/demo`, `/api/debug`, `/api/admin`, `/_debug` must stay `404`. A published debug route is a silent exposure. Worth knowing what this block is *not*: none of those four paths exists in the tree, so all four are `404` **by absence** — it is a tripwire for the day one of them appears, not a check on the surface that is closed today.
- **smoke-preview (the gates that hold data)** — `/api/subscribers`, `/api/subscribers/admin/expire-sweep`, `/api/investors/data-room`, `/api/investors/file`, `/api/marketplace/list` must answer an **unauthenticated GET** with `401`/`403`/`405`. That is the assertion that can actually fire: a gate regressing to `200` (leak), `404` (route gone) or `5xx` (broken) fails the lane, on the preview as much as on prod — so a preview that stops enforcing a gate is caught before it reaches `main`. Unauthenticated status only: no credentials, no writes. `--negative-control` re-runs one gate against a deliberately *wrong* expectation and fails the run if that wrong expectation passes, so "the trap bites" is reproducible instead of claimed.
- **smoke-preview (/admin route set)** — `/admin`, `/admin/users`, `/admin/settings`, `/admin/analytics`, `/admin/content` are asserted as well. They answer `200` today and that is recorded, not blessed: they are static-export pages with no server-side gate in front of the HTML (`401`/`403` accepted too, so *adding* a gate does not fail the lane). The admin **chrome** is public; what is closed is the API behind it.
- **assert-headers --url** — the only way to catch "the file is right but Pages did something else to it in transit".
- **check-inline-scripts** — keeps `script-src 'self'` truthful; the day an inline script appears, the strict CSP would break the page and this fails first.
- **test-auth-flow** — proves the SIWE backend end-to-end without a browser (used it to clear the "login is broken" report earlier).

## The gate is registered (2026-09-15)

`main` requires **two** contexts, both pinned to GitHub Actions (app `15368`):

    validate                            (already required before this lane)
    build → deploy preview → verify     (this lane)

```bash
# read what main requires right now:
gh api repos/SupercomputeA/Master_Main/branches/main/protection/required_status_checks --jq .contexts

# how it was set — re-run this if it is ever unset:
cat > /tmp/required-checks.json <<'JSON'
{ "strict": true,
  "checks": [ { "context": "validate", "app_id": 15368 },
              { "context": "build → deploy preview → verify", "app_id": 15368 } ] }
JSON
gh api -X PATCH \
  repos/SupercomputeA/Master_Main/branches/main/protection/required_status_checks \
  --input /tmp/required-checks.json
```

Three things worth knowing before you trust the gate:

- **The context must be the job's `name:` character for character.** `preview` is the
  job *id*; it never reports, and a required context that never reports blocks *every*
  future PR to `main` with "Expected — Waiting for status to be reported". That is the
  exact trap this section exists to prevent.
- **`enforce_admins` is `false`**, so an admin can still push a merge through. The gate
  stops an *agent* from merging an unverified build; it does not lock Mone out.
- A PR branched **before** this lane landed carries no such check run and will sit at
  "Expected". Rebase it onto `main` (or admin-merge it deliberately): #62 and #91
  predate the lane.

## What is still needed

1. **A second GitHub identity** — `main` requires 1 approving review and every agent
   shares `Orami`, so reviews cannot be recorded and merges need an admin override.
   PR #98 is blocked on exactly this and nothing else. A bot/App collaborator turns
   this lane's verdict into a reviewable approval instead of an override.

Verified working — needs no action:

- **Pages-capable token** — the preview deploy uses `secrets.CLOUDFLARE_API_TOKEN`
  (the same one `ci-cd.yml` deploys prod with) and deployed a real preview on the
  first run. If it is ever narrowed, previews stop; the workflow fails loudly rather
  than skipping silently, so the gate goes red instead of going quiet.

## Paused while this lands (Mone, 2026-09-15)

- **No further merges to `main`** from this profile until the lane is in place and the checks are green on the PRs below.
- Held: **#62** (social page + admin command center — needs the gate call), **#95** (beacon allowlist — closing as unused pending the Web Analytics toggle), **#91** (subscriber funnel — conflicting, needs a rebase; not this profile's lane).
- Merged and verified live before the pause: #94 (COOP), #93 (auth connectors), #96 (header assertions), #60 (staking + grid entry), #61 (auth error surfacing). #59 (CSP) merged earlier and re-verified live.
