#!/usr/bin/env bash
# postbuild-static-pages.sh — Next.js `output: export` produces /demo.html but not /demo/index.html.
# Cloudflare Pages hits a redirect loop on /demo (auto-trailing-slash normalizer → 308 → 308).
# Fix: copy each named static page into its own subdirectory as index.html so CF's
# native directory resolution serves it without a redirect.
#
# Pages that need this treatment: any page that lives at out/<name>.html but is
# requested at /<name> (without .html). Add new entries below as we add new static pages.

set -euo pipefail

cd "$(dirname "$0")/../out"

STATIC_PAGES=("demo" "terms" "privacy")

for page in "${STATIC_PAGES[@]}"; do
  if [ -f "${page}.html" ]; then
    mkdir -p "${page}"
    cp "${page}.html" "${page}/index.html"
    echo "✅ ${page}/index.html (from ${page}.html)"
  else
    echo "⚠️  ${page}.html not found, skipping"
  fi
done
