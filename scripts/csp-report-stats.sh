#!/usr/bin/env bash
# csp-report-stats.sh — read the CSP violation rollup (D1 table csp_reports).
#
# The one-line answer to "how many CSP violations in the last 24h, by directive":
#   SELECT violated_directive, SUM(hits) AS hits, COUNT(*) AS groups
#   FROM csp_reports WHERE last_seen >= unixepoch()-86400 GROUP BY 1 ORDER BY hits DESC;
#
# Usage:
#   ./scripts/csp-report-stats.sh                 # last 24h, by directive
#   ./scripts/csp-report-stats.sh --days 7        # last 7 days
#   ./scripts/csp-report-stats.sh --by-host       # directive + blocked host + page path
#   ./scripts/csp-report-stats.sh --local         # local miniflare D1 instead of --remote
#   ./scripts/csp-report-stats.sh --prune         # delete rows older than 90 days
#
# Requires: npx wrangler (remote queries need wrangler auth; --local does not).
set -euo pipefail

DB="${CSP_DB:-supercompute-db}"
TARGET="--remote"
DAYS=1
GROUP_BY="directive"
PRUNE=0

while [ $# -gt 0 ]; do
  case "$1" in
    --days) DAYS="${2:?--days needs a number}"; shift 2 ;;
    --local) TARGET="--local"; shift ;;
    --remote) TARGET="--remote"; shift ;;
    --by-host) GROUP_BY="host"; shift ;;
    --prune) PRUNE=1; shift ;;
    -h|--help) sed -n '2,20p' "$0"; exit 0 ;;
    *) echo "unknown argument: $1" >&2; exit 2 ;;
  esac
done

case "$DAYS" in
  ''|*[!0-9]*) echo "--days must be a positive integer" >&2; exit 2 ;;
esac

if [ "$PRUNE" = "1" ]; then
  SQL="DELETE FROM csp_reports WHERE day < date('now','-90 day');"
  echo "pruning csp_reports rows older than 90 days ($TARGET)"
else
  WINDOW=$(( DAYS * 86400 ))
  if [ "$GROUP_BY" = "host" ]; then
    SQL="SELECT violated_directive, blocked_origin, document_path, SUM(hits) AS hits, MAX(datetime(last_seen,'unixepoch')) AS last_seen FROM csp_reports WHERE last_seen >= unixepoch()-${WINDOW} GROUP BY 1,2,3 ORDER BY hits DESC LIMIT 100;"
  else
    SQL="SELECT violated_directive, SUM(hits) AS hits, COUNT(*) AS groups, MAX(datetime(last_seen,'unixepoch')) AS last_seen FROM csp_reports WHERE last_seen >= unixepoch()-${WINDOW} GROUP BY 1 ORDER BY hits DESC;"
  fi
fi

echo "== $DB ($TARGET) =="
echo "$SQL"
npx wrangler d1 execute "$DB" "$TARGET" --command "$SQL"
