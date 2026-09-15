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
  ├── 7. smoke the PREVIEW            routes + surface markers + closed debug paths
  ├── 8. header drift vs the PREVIEW  what the preview actually serves
  └── 9. verdict comment on the PR    with the preview URL and repro commands
```

Nothing reaches `main` until that preview is green. `.github/workflows/preview-verify.yml`
implements it, and `build → deploy preview → verify` is now a **required** check on
`main` — a gate for any actor who cannot administer the repo. Today every identity on
this repo *is* an admin, so read the `enforce_admins` caveat under "The gate is
registered" before treating the check as binding: it is a speed bump, not an
enforcement, until #1 below lands.

## Run it yourself (same scripts, any URL)

```bash
node scripts/smoke-preview.mjs https://pr-123.supercompute.pages.dev        # routes + markers
node scripts/smoke-preview.mjs https://supercompute.io --json               # machine-readable
node scripts/assert-headers.mjs --url https://supercompute.io               # what prod serves
npm run check:headers && npm run check:inline-scripts && npm run test:csp   # local invariants
node scripts/test-auth-flow.mjs                                             # live SIWE end-to-end
```

## What each check would have caught

- **conflict-marker scan** — a committed `<<<<<<<`/`>>>>>>>` means the tree under review is not the tree anyone resolved. It earned its place before shipping: its first clean-tree run found **489 conflict blocks committed into `yarn.lock` on `main`** by a develop merge (fixed in its own PR, which must land before this lane can go green).
- **smoke-preview (markers, not just status)** — a `200` serving the *previous* page is the failure mode we keep hitting. `/staking` returning 200 with "awaiting liquidity" is a failure, and this flags it.
- **smoke-preview (closed surfaces)** — `/demo`, `/api/debug`, `/api/admin`, `/_debug` must stay `404`. A published debug route is a silent exposure.
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
- **`enforce_admins` is `false`, so the gate is a speed bump, not an enforcement.**
  Re-read from the API on 2026-09-15: `required_approving_review_count: 1`,
  `strict: true`, contexts `["validate", "build → deploy preview → verify"]`,
  `enforce_admins.enabled: false`, rulesets `[]`, and collaborators = exactly two,
  `Orami` (the identity every agent shares) and `QuantaSMolt`, **both `admin`**. With
  `enforce_admins` off, branch protection is not applied to admins at all, and the
  merge API takes an explicit admin override that any admin identity can pass. So an
  agent running as `Orami` can merge an unverified build with the same override Mone
  can use: **the gate stops accidents, not agents.** It binds only once the repo has a
  non-admin identity for agents *and* `enforce_admins=true` — both, and in that order
  (see "What is still needed" #1).
- A PR branched **before** this lane landed carries no such check run and will sit at
  "Expected". Rebase it onto `main` — or, while `enforce_admins` is still `false`,
  admin-merge it deliberately: #62 and #91 predate the lane.

## What is still needed

1. **A second GitHub identity, non-admin (write-only), plus `enforce_admins=true`** —
   `main` requires 1 approving review, and every agent shares `Orami`, which is an
   `admin`; with `enforce_admins=false` the platform does not apply the protection (or
   the required checks) to admins at all, so reviews cannot be recorded and merges go
   through on an admin override. PR #98 is blocked on exactly this and nothing else.
   Two changes, in this order:

   a. **Add the identity with `write` permission only — not `admin`.** A GitHub App
      installed on the repo or a machine user both work:
      `gh api -X PUT repos/SupercomputeA/Master_Main/collaborators/<app-or-user> -f permission=push`
      Then point the fleet's pushes and PRs at *that* identity so agents stop acting as
      `Orami`. An actor who cannot administer the repo cannot pass the admin-override
      flag, so the required check and the required review bind it.
      *The credential goes to the vault — never into a card, a comment, this repo, or chat.*
   b. **Only then set `enforce_admins=true`**:
      `gh api -X POST repos/SupercomputeA/Master_Main/branches/main/protection/enforce_admins`
      This is what binds the admin identities too. Order matters — flipped before (a) it
      buys nothing, since agents are admins today, and it removes the deliberate
      admin-merge path that the pre-lane PRs above are documented against.

   Target state once both land: agent PR → the lane verifies the preview → a **recorded
   approval** → merge, with no override anywhere. Residual, stated plainly: with two
   identities, an agent-authored PR needs an approval from the admin identity (that is
   Mone, which is the point), while a Mone-authored PR needs an approval from the agent
   identity — the platform records that as a review but it is not a human review. A
   third, human identity is the only thing that fixes that last case; it is a policy
   decision, not a platform guarantee, and nothing here should claim otherwise.

Verified working — needs no action:

- **Pages-capable token** — the preview deploy uses `secrets.CLOUDFLARE_API_TOKEN`
  (the same one `ci-cd.yml` deploys prod with) and deployed a real preview on the
  first run. If it is ever narrowed, previews stop; the workflow fails loudly rather
  than skipping silently, so the gate goes red instead of going quiet.

## Paused while this lands (Mone, 2026-09-15)

- **No further merges to `main`** from this profile until the lane is in place and the checks are green on the PRs below.
- Held: **#62** (social page + admin command center — needs the gate call), **#95** (beacon allowlist — closing as unused pending the Web Analytics toggle), **#91** (subscriber funnel — conflicting, needs a rebase; not this profile's lane).
- Merged and verified live before the pause: #94 (COOP), #93 (auth connectors), #96 (header assertions), #60 (staking + grid entry), #61 (auth error surfacing). #59 (CSP) merged earlier and re-verified live.
