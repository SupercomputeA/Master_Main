#!/bin/bash
# pr-rebase.sh — Rebase an open PR onto its target branch and force-push safely.
# Usage: ./pr-rebase.sh <pr-number> [repo-slug]
#
# Defaults:
#   repo  = SupercomputeA/Master_Main
#   trunk = inferred from PR baseRefName (env override: TRUNK_BRANCH)
#
# Safety:
#   * Requires gh CLI, git ≥ 2.13, and a clean working tree.
#   * Uses --force-with-lease (never bare --force).
#   * Creates a fresh local scratch branch from origin/<head>; never trusts
#     the local copy of the PR branch.
#   * Verifies the local repo origin matches the requested repo slug.
#   * Exits with a clear message on conflict instead of leaving a mess.
#
# Exit codes:
#   0  success
#   1  usage / environment error
#   2  rebase conflict (manual resolution required)
#   3  push rejected (lease failed)
#   4  PR is not mergeable / blocked
set -euo pipefail

REPO_SLUG="${2:-SupercomputeA/Master_Main}"
PR_NUM="${1:-}"

if [[ -z "$PR_NUM" ]]; then
    echo "Usage: $0 <pr-number> [repo-slug]" >&2
    echo "Example: $0 118" >&2
    echo "Override rebase target: TRUNK_BRANCH=main $0 118" >&2
    exit 1
fi

if ! command -v gh >/dev/null 2>&1; then
    echo "ERROR: gh CLI is required. Install: https://cli.github.com/" >&2
    exit 1
fi

if ! git --version >/dev/null 2>&1; then
    echo "ERROR: git is required." >&2
    exit 1
fi

# Resolve repo root from the script location or cwd.
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="${SCRIPT_DIR%/scripts}"
if [[ ! -d "$REPO_ROOT/.git" ]]; then
    REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || true)"
    if [[ -z "$REPO_ROOT" ]]; then
        echo "ERROR: not inside a git repo and no repo found next to this script." >&2
        exit 1
    fi
fi
cd "$REPO_ROOT"

# Confirm remote matches expected slug (defense against running in wrong clone).
REMOTE_URL="$(git remote get-url origin 2>/dev/null || true)"
if [[ -n "$REMOTE_URL" && "$REMOTE_URL" != *"$REPO_SLUG"* ]]; then
    echo "WARNING: origin remote ($REMOTE_URL) does not look like $REPO_SLUG." >&2
    if [[ -t 0 ]]; then
        read -r -p "Continue anyway? [y/N] " reply || true
        [[ "$reply" =~ ^[Yy]$ ]] || exit 1
    else
        echo "Non-interactive shell: aborting. Run with matching repo or unset stdin." >&2
        exit 1
    fi
fi

# Working tree must be clean so we don't stash/lose local changes.
if ! git diff --quiet || ! git diff --cached --quiet; then
    echo "ERROR: working tree is not clean. Commit or stash changes first." >&2
    git status --short >&2
    exit 1
fi

echo "==> Fetching PR metadata from $REPO_SLUG ..."

PR_JSON="$(gh pr view "$PR_NUM" --repo "$REPO_SLUG" --json headRefName,state,title,baseRefName,mergeStateStatus,isDraft)" || {
    echo "ERROR: could not fetch PR #$PR_NUM from $REPO_SLUG." >&2
    exit 1
}

# Parse the JSON once. Prefer jq if installed, fall back to Python (always on macOS).
if command -v jq >/dev/null 2>&1; then
    BRANCH="$(echo "$PR_JSON" | jq -r '.headRefName')"
    STATE="$(echo "$PR_JSON" | jq -r '.state')"
    BASE="$(echo "$PR_JSON" | jq -r '.baseRefName')"
    MERGE_STATE="$(echo "$PR_JSON" | jq -r '.mergeStateStatus // "UNKNOWN"')"
    IS_DRAFT="$(echo "$PR_JSON" | jq -r '.isDraft // false')"
else
    BRANCH="$(python3 -c "import json,sys; print(json.load(sys.stdin)['headRefName'])" <<< "$PR_JSON")"
    STATE="$(python3 -c "import json,sys; print(json.load(sys.stdin)['state'])" <<< "$PR_JSON")"
    BASE="$(python3 -c "import json,sys; print(json.load(sys.stdin)['baseRefName'])" <<< "$PR_JSON")"
    MERGE_STATE="$(python3 -c "import json,sys; print(json.load(sys.stdin).get('mergeStateStatus','UNKNOWN'))" <<< "$PR_JSON")"
    IS_DRAFT="$(python3 -c "import json,sys; print(json.load(sys.stdin).get('isDraft',False))" <<< "$PR_JSON")"
fi

if [[ "$STATE" != "OPEN" ]]; then
    echo "ERROR: PR #$PR_NUM is $STATE (expected OPEN)." >&2
    exit 1
fi

if [[ "$IS_DRAFT" == "true" ]]; then
    echo "WARNING: PR #$PR_NUM is a draft." >&2
fi

if [[ "$MERGE_STATE" == "DIRTY" ]]; then
    echo "ERROR: PR #$PR_NUM has merge conflicts (mergeStateStatus=DIRTY). Resolve on GitHub first." >&2
    exit 4
fi

TRUNK_BRANCH="${TRUNK_BRANCH:-$BASE}"
echo "==> Rebase target: origin/$TRUNK_BRANCH (PR base is $BASE) ..."
git fetch origin "$TRUNK_BRANCH"
git fetch origin "$BRANCH"

if [[ "$BASE" != "$TRUNK_BRANCH" ]]; then
    echo "WARNING: PR #$PR_NUM targets '$BASE'; rebasing onto '$TRUNK_BRANCH' instead." >&2
    if [[ -t 0 ]]; then
        read -r -p "Continue? [y/N] " reply || true
        [[ "$reply" =~ ^[Yy]$ ]] || exit 1
    else
        echo "Non-interactive shell: aborting. Set TRUNK_BRANCH=$BASE to rebase onto the PR base." >&2
        exit 1
    fi
fi

echo "==> Rebase PR #$PR_NUM (branch $BRANCH) onto origin/$TRUNK_BRANCH ..."

# Create a fresh local tracking branch from the remote PR head. This avoids
# stale local state and dirty merges.
LOCAL_BRANCH="pr-rebase-${PR_NUM}-${BRANCH}"
git branch -D "$LOCAL_BRANCH" 2>/dev/null || true
git checkout -b "$LOCAL_BRANCH" "origin/$BRANCH"

cleanup() {
    # Return to trunk and delete the temporary branch on exit.
    git checkout "$TRUNK_BRANCH" 2>/dev/null || true
    git branch -D "$LOCAL_BRANCH" 2>/dev/null || true
}
trap cleanup EXIT

if ! git rebase "origin/$TRUNK_BRANCH"; then
    echo ""
    echo "ERROR: rebase conflict. Resolve manually, then:" >&2
    echo "  git rebase --continue" >&2
    echo "  git push origin $LOCAL_BRANCH:$BRANCH --force-with-lease" >&2
    echo "Then run this script again to verify a clean rebase." >&2
    exit 2
fi

echo "==> Pushing rebased branch (force-with-lease) ..."
if ! git push origin "$LOCAL_BRANCH:$BRANCH" --force-with-lease; then
    echo "ERROR: push rejected. The remote branch changed during rebase. Re-run." >&2
    exit 3
fi

echo ""
echo "✓ PR #$PR_NUM ($BRANCH) rebased onto $TRUNK_BRANCH and pushed to origin."
