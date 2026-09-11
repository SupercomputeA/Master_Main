# CI: how a deploy reaches supercompute.io

Reference for the deploy gate in `.github/workflows/ci-cd.yml` (job `deploy`).
Established 2026-09-11 by `t_7998fe88` after two merges in the same minute left
production on the **older** commit.

## The gate, in order

1. `validate` — install, Tina build, `next build`, export checks. `deploy` has
   `needs: validate`, so a red validate means no deploy at all.
2. `concurrency: pages-deploy-${{ github.ref }}` with
   **`cancel-in-progress: false`**. Two deploys for the same branch can never
   overlap. `cancel-in-progress` must stay `false`: cancelling the *newer* run
   would leave the *older* build holding the alias. With it false, GitHub keeps a
   single run pending per group, and a third run displaces the *pending* one, so
   the newest commit always reaches the gate.
3. `Stamp build provenance into the exported HTML` — appends
   `<!-- supercompute build <sha> <branch> <UTC timestamp> -->` before `</body>`
   in every exported `.html` file. The live body therefore names the commit that
   produced it:
   `curl -s https://supercompute.io/ | grep -o 'supercompute build [0-9a-f]*'`
4. `Decide whether this run may move the production alias` — compares
   `$GITHUB_SHA` with `git ls-remote origin refs/heads/main` immediately before
   the deploy (the tip can move during the ~4 minute build). If the run has been
   superseded it sets `deploy=false` and the production deploy step is skipped, so
   an older commit can never be the last writer. A manual re-run
   (`github.run_attempt > 1`) bypasses the check — that is an operator asking for
   that specific commit. If the tip cannot be read the deploy proceeds with a
   `::warning::` rather than freezing production.
5. `Deploy to Cloudflare Pages (production)` — only on `refs/heads/main`, only when
   step 4 said `deploy=true`. The target is explicit: `--branch main`. Pages
   resolves the production alias from the branch, so an implicit target is how a
   build lands on the wrong alias.

## Two rules for operators

- **Do not set `cancel-in-progress: true`** on this group. It looks like a fix for
  queued runs and is the exact opposite: it cancels the newer run and leaves the
  older build live.
- **A red run is not always a build failure.** `Fail loudly if the schema step
  failed` re-raises a D1 migration failure *after* the deploy steps. The static
  site did ship; the D1 schema did not, so `/api/subscribers` and
  `/api/marketplace` will 500. That step exists so a Cloudflare token-scope problem
  can never silently freeze the site the way it did on 2026-09-11 (run
  `34647683246`).

## Verifying what is live

CI status is not evidence of what production serves — the 2026-09-11 regression
shipped under two green runs. Check the artifact:

```bash
curl -s https://supercompute.io/ | grep -o 'supercompute build [0-9a-f]*'
git rev-parse origin/main   # the two should agree after a merge
```
