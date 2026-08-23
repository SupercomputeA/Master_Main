# AGENTS.md — Master_Main

Fleet repo. Read `supercompute-devops/docs/branch-strategy.md` before branching.

## Branch Strategy (fleet doctrine)

Canonical source: `supercompute-devops/docs/branch-strategy.md` — read it before branching.

This repo follows the SUPERCOMPUTE fleet branch model. The trunk is protected:

- `main` — production. PR-only. Never push directly.
- `develop` — integration trunk. PR-only. All work lands here first.
- Work branches (base = `develop`):
  - `feature/<scope>-<desc>` — new capability / revenue surface
  - `design/<scope>-<desc>` — visual/UX work (Mone design gate)
  - `project/<name>-<desc>` — project-scoped work (solar-punk, school, kg…)
  - `test/<scope>-<desc>` — test-only work (harness, fixtures, QA)
  - `security/<scope>-<desc>` — security fix (security review + Mario go/no-go if funds/auth touched)
  - `hotfix/<desc>` — emergency prod fix (base = `main`)
  - `fix/`, `docs/`, `ci/`, `chore/`, `refactor/` — standard lanes

Rules (no exceptions):

1. Never commit to `main` or `develop` directly.
2. Branch from `develop` (hotfix from `main`):
   `git fetch origin && git checkout develop && git pull && git checkout -b <type>/<scope>-<desc>`.
3. Conventional commits (`feat:`, `fix:`, `test:`, `security:`, `chore:`, `docs:`, `refactor:`). One logical change per PR.
4. Open a PR with the fleet template (summary, test plan, kanban card link). Never merge your own PR.
5. CI must pass before merge — verify the response body, not the badge.
6. Squash merge into the target. Delete the branch after merge.
7. Sync `develop` after merge before starting the next card.
8. Security work is never merged by the author: security review + Mario go/no-go.
9. Prod is gated: staging is autonomous, `main` requires Mone approval.

Local guard: the pre-push hook (`.githooks/pre-push`) blocks direct pushes to
`main`/`develop` and rejects non-conforming branch names. Install once:
`ln -sf ../../.githooks/pre-push .git/hooks/pre-push`
