#!/usr/bin/env bash
#
# Trunk push check — "did this commit reach main/develop through a merged PR?"
#
# WHY THIS EXISTS
#   The fleet rule is "never commit to main/develop directly"
#   (supercompute-devops/docs/branch-strategy.md). The naive way to enforce it is a
#   push-triggered guard that always fails — but a merged PR *lands as a push event*
#   on the trunk, so that guard fails on exactly the event it exists to permit.
#   Result before this script: every merge to main carried 1–2 permanently red
#   `branch-guard` runs, and "is main green?" became unanswerable (t_424dc0c3 /
#   t_f1050fbf — 60 red runs, 2 per merge).
#
# HOW IT DECIDES
#   Ask the API which pull requests the commit belongs to and require at least one
#   with `merged_at` set. Commit *shape* cannot be used instead: squash and rebase
#   merges both produce single-parent commits that are indistinguishable from a
#   workstation `git push origin main` by `git rev-list --parents` alone.
#
# FAILS CLOSED
#   A non-200 from the API (expired token, rate limit, outage) exits 1 rather than
#   waving the push through — the guard's job is to block unreviewed trunk pushes,
#   so an unverifiable push is treated as an unreviewed one.
#
# USAGE
#   trunk-push-check.sh <sha> <ref> [repo]        # repo defaults to $GITHUB_REPOSITORY
#   GITHUB_TOKEN / GH_TOKEN must be set to a token with pull-requests: read.
#
set -uo pipefail

sha="${1:?usage: trunk-push-check.sh <sha> <ref> [repo]}"
ref="${2:?usage: trunk-push-check.sh <sha> <ref> [repo]}"
repo="${3:-${GITHUB_REPOSITORY:-}}"
token="${GH_TOKEN:-${GITHUB_TOKEN:-}}"

if [ -z "$repo" ]; then
  echo "✗ no repository given and GITHUB_REPOSITORY is unset — failing closed."
  exit 1
fi
if [ -z "$token" ]; then
  echo "✗ no API token (GH_TOKEN/GITHUB_TOKEN unset) — failing closed."
  exit 1
fi

api="https://api.github.com/repos/${repo}/commits/${sha}/pulls"
body="$(mktemp)"
trap 'rm -f "$body"' EXIT

http_code="$(curl -sS -o "$body" -w '%{http_code}' \
  -H "Authorization: Bearer ${token}" \
  -H 'Accept: application/vnd.github+json' \
  -H 'X-GitHub-Api-Version: 2022-11-28' \
  "$api" 2>/dev/null)" || http_code="000"

if [ "$http_code" != "200" ]; then
  echo "✗ could not confirm a merged PR for ${sha} (GitHub API returned HTTP ${http_code}) — failing closed."
  echo "  If this is transient (rate limit / outage), re-run the workflow."
  sed -n '1,3p' "$body" 2>/dev/null || true
  exit 1
fi

report="$(python3 - "$body" <<'PY'
import json, sys

with open(sys.argv[1]) as fh:
    prs = json.load(fh)

landed = [p for p in prs if p.get("merged_at")]
for p in landed:
    title = (p.get("title") or "")[:60]
    print(f"  PR #{p['number']} merged {p['merged_at']}: {title}")
print(f"MERGED_COUNT={len(landed)}")
PY
)"

printf '%s\n' "$report" | grep -v '^MERGED_COUNT=' || true
count="$(printf '%s\n' "$report" | sed -n 's/^MERGED_COUNT=//p')"

if [ "${count:-0}" -ge 1 ]; then
  echo "✓ ${sha} reached '${ref}' through a merged pull request — trunk lane respected."
  exit 0
fi

echo "✗ Direct push to '${ref}' is not allowed — PR-only lane."
echo "  Commit ${sha} belongs to no merged pull request."
echo "  See supercompute-devops/docs/branch-strategy.md"
exit 1
