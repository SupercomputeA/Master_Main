#!/usr/bin/env node
// scripts/assert-no-conflict-markers.mjs
//
// Fails if a committed merge-conflict marker reached the tree.
//
// Why this exists (2026-09-15, real incident): absorbing two stacked security
// branches into `feature/social-rails-clean` resolved the conflicts in
// `functions/api/social/[[catchall]].js` and MISSED the ones in
// `.github/workflows/ci-cd.yml` — the marker check had been run before that
// second merge, and the post-merge check was scoped to the one file being
// resolved. `ci-cd.yml` was then committed with `<<<<<<<`/`=======`/`>>>>>>>`
// in it, making the workflow file unparseable. Nothing caught it locally.
//
// Absorbing stacked branches is now a normal pattern here, so the failure is
// structural, not a one-off. This is the cheap always-on guard.
//
//   node scripts/assert-no-conflict-markers.mjs            # scan the working tree
//   node scripts/assert-no-conflict-markers.mjs --staged    # only files staged for commit
//
// A bare `=======` is NOT flagged on its own — it is a legitimate markdown
// setext underline. It only counts as a conflict marker alongside a
// `<<<<<<<`/`>>>>>>>` line in the same file (that pairing is what a conflict
// actually looks like), which keeps this check free of false positives.

import { execFileSync } from "node:child_process"
import { readFileSync } from "node:fs"

const stagedOnly = process.argv.includes("--staged")
const SKIP = /(^|\/)(\.git|node_modules|out|\.next|\.wrangler|dist|coverage)\//
const BINARY = /\.(png|jpe?g|gif|webp|avif|ico|pdf|woff2?|ttf|eot|zip|gz|mp4|mov|sqlite)$/i

function trackedFiles() {
  const args = stagedOnly
    ? ["diff", "--cached", "--name-only", "--diff-filter=ACM"]
    : ["ls-files"]
  return execFileSync("git", args, { encoding: "utf8" })
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean)
    .filter((f) => !SKIP.test(f) && !BINARY.test(f))
}

const START = /^<{7}( |$)/
const END = /^>{7}( |$)/
const MID = /^={7}$/

const offenders = []
let scanned = 0

for (const file of trackedFiles()) {
  let text
  try {
    text = readFileSync(file, "utf8")
  } catch {
    continue // deleted in this commit, or unreadable — not our failure mode
  }
  scanned++
  const lines = text.split("\n")
  const hits = []
  let hasStartOrEnd = false
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (START.test(line) || END.test(line)) {
      hasStartOrEnd = true
      hits.push({ n: i + 1, kind: "marker", text: line.slice(0, 60) })
    }
  }
  if (hasStartOrEnd) {
    for (let i = 0; i < lines.length; i++) {
      if (MID.test(lines[i])) hits.push({ n: i + 1, kind: "separator", text: "=======" })
    }
  }
  if (hits.length) offenders.push({ file, hits })
}

console.log(`conflict-marker scan: ${scanned} file(s) ${stagedOnly ? "staged" : "tracked"}`)
for (const o of offenders) {
  for (const h of o.hits) console.log(`  ✗ ${o.file}:${h.n}  [${h.kind}] ${h.text}`)
}
if (offenders.length) {
  console.log(`\nFAIL — ${offenders.length} file(s) contain committed merge-conflict markers.`)
  console.log("Resolve every file the merge touched, then re-run before committing/pushing.")
  process.exit(1)
}
console.log("PASS — no committed merge-conflict markers.")
