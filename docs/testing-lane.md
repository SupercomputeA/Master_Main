# The testing lane — verify a build before it reaches main

**Status:** ready for review (branch `ci/preview-verify`, PR opened, not merged).
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
  ├── 1. build                        (static export)
  ├── 2. header invariants            source _headers  ==  built out/_headers
  ├── 3. CSP invariants               no executable inline script; report collector wired
  ├── 4. unit tests                   header assertions, CSP suites
  ├── 5. deploy THIS PR as a preview  → https://pr-<number>.supercompute.pages.dev
  ├── 6. smoke the PREVIEW            routes + surface markers + closed debug paths
  ├── 7. header drift vs the PREVIEW  what the preview actually serves
  └── 8. verdict comment on the PR    with the preview URL and repro commands
```

Nothing reaches `main` until that preview is green. `.github/workflows/preview-verify.yml` implements it.

## Run it yourself (same scripts, any URL)

```bash
node scripts/smoke-preview.mjs https://pr-123.supercompute.pages.dev        # routes + markers
node scripts/smoke-preview.mjs https://supercompute.io --json               # machine-readable
node scripts/assert-headers.mjs --url https://supercompute.io               # what prod serves
npm run check:headers && npm run check:inline-scripts && npm run test:csp   # local invariants
node scripts/test-auth-flow.mjs                                             # live SIWE end-to-end
```

## What each check would have caught

- **smoke-preview (markers, not just status)** — a `200` serving the *previous* page is the failure mode we keep hitting. `/staking` returning 200 with "awaiting liquidity" is a failure, and this flags it.
- **smoke-preview (closed surfaces)** — `/demo`, `/api/debug`, `/api/admin`, `/_debug` must stay `404`. A published debug route is a silent exposure.
- **assert-headers --url** — the only way to catch "the file is right but Pages did something else to it in transit".
- **check-inline-scripts** — keeps `script-src 'self'` truthful; the day an inline script appears, the strict CSP would break the page and this fails first.
- **test-auth-flow** — proves the SIWE backend end-to-end without a browser (used it to clear the "login is broken" report earlier).

## What is still needed to make this a hard gate

1. **Register the check as required on `main`** (branch protection, one call):
   ```bash
   gh api -X PATCH repos/SupercomputeA/Master_Main/branches/main/protection \
     -f 'required_status_checks[strict]=true' \
     -f 'required_status_checks[contexts][]=validate' \
     -f 'required_status_checks[contexts][]=preview' # name of the preview-verify job once it has run once
   ```
   Until then this is a **signal**, not a gate: a red preview can still be admin-merged.
2. **Pages-capable token in CI** — the preview deploy uses `secrets.CLOUDFLARE_API_TOKEN` (the same one `ci-cd.yml` deploys prod with). If that secret is ever narrowed, previews stop and the lane goes quiet — the workflow fails loudly rather than silently skipping.
3. **Second GitHub identity** — main currently requires 1 approving review and every agent shares `Orami`, so reviews cannot be recorded and merges need an admin override. A bot/App collaborator turns this lane's verdict into a reviewable approval instead of an override.

## Paused while this lands (Mone, 2026-09-15)

- **No further merges to `main`** from this profile until the lane is in place and the checks are green on the PRs below.
- Held: **#62** (social page + admin command center — needs the gate call), **#95** (beacon allowlist — closing as unused pending the Web Analytics toggle), **#91** (subscriber funnel — conflicting, needs a rebase; not this profile's lane).
- Merged and verified live before the pause: #94 (COOP), #93 (auth connectors), #96 (header assertions), #60 (staking + grid entry), #61 (auth error surfacing). #59 (CSP) merged earlier and re-verified live.
