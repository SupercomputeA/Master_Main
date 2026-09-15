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

## A preview is not a sandbox — it runs against production data (SEC-98-6)

The lane verifies **rendering**. It does not isolate **data**, and the name "preview" invites the
wrong assumption, so here is exactly what a preview can reach. A preview is a deployment of the
*same* Pages project (`supercompute`), which means the bindings `wrangler.toml` declares are the
bindings it gets — `DB` → `supercompute-db` (**production** D1), `CACHE` → `031b7cbb…`
(**production** KV) — and its Functions are real, not a static bundle. Measured on
`https://pr-98.supercompute.pages.dev`, 2026-09-15, unauthenticated:

| Path | Status |
|---|---|
| `/api/investors/metrics`, `/api/articles` | 200 |
| `/api/subscribers` | 403 |
| `/api/subscribers/admin/expire-sweep`, `/api/marketplace/list` | 405 |
| `/api/csp-report` — `GET` / `POST` | 405 / **204** — the write is refused, see below |

**That 204 used to be a production write** — proven, not inferred. A `POST` from this preview carrying
a made-up violation (`document-uri: https://pr-98.supercompute.pages.dev/probe`) showed up in the
production table within the second (measured 2026-09-15, before the guard below):

```bash
npx wrangler d1 execute supercompute-db --remote --command \
  "SELECT bucket_key, hits, datetime(first_seen,'unixepoch') FROM csp_reports WHERE violated_directive='probe-…'"
# 2026-09-15|probe-…|https://example.com|https://pr-98.supercompute.pages.dev/probe|enforce | 1 | 2026-09-15 04:18:36
```

**It is a refusal now (SEC-F6b, code half — card `t_92c5b532`).** `api/csp-report.js` gates the write
on the deployment's own branch: the platform sets `CF_PAGES_BRANCH` in the deployment's `env_vars`,
which apply to Pages Functions (and `wrangler pages dev` injects the same four variables for
dev/prod parity — verified locally: `env.CF_PAGES_BRANCH ("<git branch>")` in the bindings table).

```js
if (isNonProductionDeployment(env)) return noContent();  // branch present && branch !== "main"
```

`ci-cd.yml` deploys production with an explicit `--branch main`; the lane above deploys
`--branch pr-<n>`, so a preview's own Function drops every report while prod's keeps writing. It
**fails open on purpose**: a missing, empty, renamed or platform-broken variable keeps production
telemetry writing — silently killing prod telemetry is a worse failure than a preview's noise, and a
refused report is loud (`console.error` → `wrangler pages deployment tail`) rather than a silent
swallow.

The writes that remain from a preview are the ones the browser sends to the *absolute* endpoint, and
those are the next bullet.

So every writing route **except `csp_reports`** is a production write reachable from a public URL that
any PR mints:

| Data | Written by |
|---|---|
| `csp_reports` | `api/csp-report.js` — **refused from any non-`main` deployment** (SEC-F6b) |
| `users`, `sessions` | `api/auth.js`, `api/auth/login.js`, `api/auth/logout.js` |
| `subscribers` | `api/subscribers.js`, `api/subscribers/pay.js`, `api/subscribers/admin/expire-sweep.js` |
| `articles` | `api/articles.js`, `api/tina/webhook.js` |
| `projects` | `api/projects.js` |
| `marketplace_listings` | `api/marketplace/list.js`, `api/marketplace/buy.js` |
| `investor_contacts` | `api/investors/contact.js` |
| KV `CACHE` | SIWE nonce/message stores, auth rate-limit keys, investors-metrics and ENS caches |

Two consequences worth stating rather than discovering later:

- **Preview telemetry is still production telemetry — through the absolute path only.** The policy
  carries *both* `report-uri /api/csp-report` (document-relative — a preview POSTs to the preview's
  own Function, which now **refuses** the write: SEC-F6b) and `Reporting-Endpoints`/`Report-To` at
  the absolute `https://supercompute.io/api/csp-report`, which the browser sends to *prod's* Function
  — where `CF_PAGES_BRANCH` **is** `main`, so it is written. A violation on a preview therefore still
  reaches prod's `csp_reports` rollup by that second path, and prod's collector stays a public,
  unauthenticated ingest (capped and PII-free by design). What stopped is the path a PR preview
  itself could exercise against the shared production D1 — the preview-origin write.
- **A preview can write identity rows.** `api/auth/login.js` inserts/updates `users` and upserts
  `sessions`, and the SIWE nonce + rate-limit state live in the shared KV namespace.

**Rule of thumb: treat a preview as production for data purposes, and as a *candidate* for
rendering purposes.** The lane's guarantee stays the narrow one — the right surface is served for
the routes it checks — and a green lane is never "this code is contained".

### Real isolation — available, not done, and what it needs

The environment mechanism exists: for Pages, `production` and `preview` are the only named
environments, they are honoured **per deployment** (`wrangler pages deploy` resolves the block from
the branch — `readPagesConfig({ …env: isProduction ? "production" : "preview" })`), and
`d1_databases` / `kv_namespaces` are legal per-environment keys. So previews *can* be pointed at
their own D1/KV. It was deliberately kept out of this PR because the card's own constraint —
*prove it does not break the preview before it lands* — cannot be met from the fleet today:

- it needs a second D1 (and KV) **with `migrations/*.sql` applied**, or every `/api/*` route on a
  preview starts 500ing — the "verify" half of the lane included;
- the change only takes effect at deploy time, so it can only be proven against a real preview, and
  the credentials in play here are refused for Pages work port-wide: the ambient
  `CLOUDFLARE_API_TOKEN` returns `Authentication error [code: 10000]`, and the OAuth token in
  `~/.wrangler/config/default.toml` fails to refresh non-interactively
  (`Failed to fetch auth token: 400`). Creating the second database and reading the project's
  `deployment_configs` both need dashboard/Pages access.

When someone with that access is in the room: create `supercompute-db-preview` (+ a preview KV),
apply `migrations/*.sql` to it, add `[[env.preview.d1_databases]]` / `[[env.preview.kv_namespaces]]`
to `wrangler.toml` with the production values left at the top level, push to a branch, then prove it
on the deployed preview — a write through one of the tables below must leave **no** new row in the
production database, and the smoke must stay green. (The `csp_reports` probe is spent as an isolation
test: SEC-F6b already refuses it from a non-`main` deployment, so it would pass for the wrong
reason.)

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
- A **fork** PR is the other permanently-"Expected"/red case, and it is *not* fixable by
  rebasing. It can never satisfy this context — that is the intended behaviour, and the
  next section is the policy for it.

## Fork PRs can never satisfy the required check — and that is the policy (SEC-98-5)

**Decision (2026-09-15, from the PR #98 security review §SEC-98-5): the lane stays
fork-hostile by design. An external PR is *re-landed inside the repo by a maintainer*
after review, the internal PR is the one that goes green and merges, and the fork PR is
closed with a pointer to it.** Do not make a fork PR green — not by widening the trigger,
not by an admin override on the fork PR itself. The trigger stays `on: pull_request`.

`SupercomputeA/Master_Main` is **public** (`private: false`), and nothing in the tree
invites patches (no `CONTRIBUTING.md`; the README's only related heading is `## License`)
— the repo is public for transparency, not as an open-contribution project, so a fork PR
is a rare, deliberate event rather than a queue to optimise for. The trigger
`on: pull_request` deliberately runs the fork's copy of the workflow **without repository
secrets**: *"With the exception of `GITHUB_TOKEN`, secrets are not passed to the runner
when a workflow is triggered from a forked repository"*
([GitHub docs](https://docs.github.com/en/actions/how-tos/write-workflows/choose-what-workflows-do/use-secrets)).
That is the property worth keeping — it is what stops a fork from reaching the prod deploy
token this lane holds (see "Verified working" under "What is still needed"). The
consequence is mechanical:

    fork PR
      └── build → deploy preview → verify    FAILS at "Deploy preview"
          secrets.CLOUDFLARE_API_TOKEN and secrets.CLOUDFLARE_ACCOUNT_ID are empty,
          so wrangler cannot authenticate and the step exits 1.

Reproduced locally on 2026-09-15 by running the step's own command with both env vars
set-but-empty and `CI=true`:

```bash
CLOUDFLARE_API_TOKEN= CLOUDFLARE_ACCOUNT_ID= CI=true \
  npx wrangler pages deploy out --project-name=supercompute --branch pr-99999 --commit-dirty=true
# ✘ [ERROR] In a non-interactive environment, it's necessary to set a
#   CLOUDFLARE_API_TOKEN environment variable for wrangler to work.     (exit 1)
```

No preview is deployed, so with `strict: true` the context reports failure on every push
to that PR and it cannot go green. Two platform facts that shape what you will actually
see on a fork PR:

- A run from a first-time contributor can sit at **"Awaiting approval"** until a maintainer
  with write access clicks *Approve workflows to run*; a run left awaiting approval for 30
  days is **deleted** ([docs](https://docs.github.com/en/actions/how-tos/manage-workflow-runs/approve-runs-from-forks)).
  So the check may read "Expected — Waiting for status to be reported" rather than plain
  "failure" until someone approves the run.
- The verdict-comment step is `if: always()`, so it may still run on a failed fork job —
  with an empty `steps.deploy.outputs.url` it reports `Preview: (no preview deployed)`.
  Do not read that comment as a deploy problem to debug; and do not wait for it, post the
  policy note yourself.

### The re-land procedure (what a maintainer actually does)

1. **Review the diff as code, before anything runs with secrets.** A re-landed branch is a
   *same-repo* branch, so the lane runs **that branch's** workflow file and its `npm ci`
   dependency tree inside the step that holds `secrets.CLOUDFLARE_API_TOKEN` — the same
   token `ci-cd.yml` deploys prod with. Read the PR for `.github/workflows/**`,
   `package.json` scripts, `postinstall`/install-time hooks, and anything that executes at
   build time. Handling that diff deliberately is the entire reason this policy is
   "maintainer re-lands after review" instead of "let forks run".
2. **If the diff touches CI or install-time code, do not re-land the branch.** Port the
   non-CI files onto a fresh branch off `main` (cherry-pick) so the lane runs *our*
   workflow file, not theirs.
3. **Otherwise, lift the fork's head into an in-repo branch and continue as a normal PR:**

   ```bash
   gh pr checkout <N>                      # the fork head, as a local branch
   git push origin HEAD:rel/fork-<N>       # in-repo now: this is what makes the lane run with secrets
   gh pr create --base main --head rel/fork-<N> \
     --title "<original title> (#<N> by @<author>)" \
     --body "Re-land of #<N>. Original work by @<author>; preview verified by this lane before main."
   ```

   Preserve authorship if you squash or cherry-pick by hand: `git commit --author="Name <email>"`.
4. **The internal PR is the one that merges** — lane green, one approving review, current
   with `main` (the `strict` requirement). Then close the fork PR: *"Landed internally as
   #NN — external PRs cannot carry this repo's preview secrets by design; see
   `docs/testing-lane.md`."*

### Considered and explicitly NOT the policy

- **`pull_request_target`, or any second workflow on that trigger, to make fork PRs green.**
  **Prohibited.** `pull_request_target` runs in the base repository's context *with* its
  secrets and a write `GITHUB_TOKEN`; combine that with checking out the PR's head and
  fork-controlled code executes in the token's step. The "safe" variant (comment on the PR,
  never check out the head) buys nothing either: the lane's value *is* deploying and smoking
  the PR's build, which is precisely the part that must not run on a fork's say-so.
- **A separate, non-required build/test job for forks.** Deferred, not rejected: with no
  secrets it can only run the network-free tier (build + header/CSP/unit checks), cannot
  deploy a preview, and therefore cannot make the *required* context pass — it changes
  nothing about mergeability, which is what this section settles. Add it if fork volume ever
  justifies the feedback; it is a readable additive job, never a trigger change.
- **"External PRs are not accepted; close on sight."** Rejected: the re-land path costs one
  branch push, and discarding a real patch to avoid it is worse. If fork volume ever becomes
  a problem, this is the documented fallback — but change this section first, do not decide
  it in the moment.

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
