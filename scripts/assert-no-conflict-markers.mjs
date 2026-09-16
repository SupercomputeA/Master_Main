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
//   node scripts/assert-no-conflict-markers.mjs --changed-only --base origin/main
//
// --changed-only is the right mode for a PR gate on a repo that already has
// pre-existing damage: fail on markers in files THIS change touches (the class
// we can actually prevent), and merely report pre-existing ones so they can be
// repaired on their own schedule instead of blocking every PR. Real example:
// main's `yarn.lock` carries 489 conflict blocks from a June develop merge —
// a tree-wide gate would go red on every PR until that was repaired; with
// --changed-only the gate is enforceable today AND the damage is still visible
// in the output. Use the plain tree scan as a drift/nightly check.
//
// A bare `=======` is NOT flagged on its own — it is a legitimate markdown
// setext underline. It only counts as a conflict marker alongside a
// `<<<<<<<`/`>>>>>>>` line in the same file (that pairing is what a conflict
// actually looks like), which keeps this check free of false positives.

import { execFileSync } from "node:child_process"
import { readFileSync } from "node:fs"

const argv = process.argv.slice(2)
const stagedOnly = argv.includes("--staged")
const changedOnly = argv.includes("--changed-only")
const baseIdx = argv.indexOf("--base")
const base = baseIdx >= 0 ? argv[baseIdx + 1] : "origin/main"
const SKIP = /(^|\/)(\.git|node_modules|out|\.next|\.wrangler|dist|coverage)\//
const BINARY = /\.(png|jpe?g|gif|webp|avif|ico|pdf|woff2?|ttf|eot|zip|gz|mp4|mov|sqlite)$/i

function git(args) {
  return execFileSync("git", args, { encoding: "utf8" }).split("\n").map((s) => s.trim()).filter(Boolean)
}

function trackedFiles() {
  const args = stagedOnly
    ? ["diff", "--cached", "--name-only", "--diff-filter=ACM"]
    : ["ls-files"]
  return git(args).filter((f) => !SKIP.test(f) && !BINARY.test(f))
}

// Files this change touches, measured against the merge base (so an in-flight
// base branch moving under us doesn't inflate the list).
function changedFiles() {
  try {
    const mb = git(["merge-base", "HEAD", base])[0]
    return new Set(git(["diff", "--name-only", `${mb}..HEAD`]).filter((f) => !SKIP.test(f) && !BINARY.test(f)))
  } catch {
    return null // base ref unavailable (shallow clone, missing ref) — fall back loudly
  }
}

const changed = changedOnly ? changedFiles() : null
if (changedOnly && !changed) {
  console.error(`changed-only mode requested but base '${base}' could not be resolved.`)
  console.error("Fetch it (git fetch origin <base> --depth=1) or run without --changed-only.")
  process.exit(2)
}

const START = /^<{7}( |$)/
const END = /^>{7}( |$)/
const MID = /^={7}$/

const offenders = []
const preexisting = []
let scanned = 0

for (const file of trackedFiles()) {
  if (changed && !changed.has(file)) continue
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
    if (START.test(lines[i]) || END.test(lines[i])) {
      hasStartOrEnd = true
      hits.push({ n: i + 1, kind: "marker", text: lines[i].slice(0, 60) })
    }
  }
  if (hasStartOrEnd) {
    for (let i = 0; i < lines.length; i++) {
      if (MID.test(lines[i])) hits.push({ n: i + 1, kind: "separator", text: "=======" })
    }
  }
  if (hits.length) offenders.push({ file, hits })
}

// Pre-existing damage, reported but not fatal in --changed-only mode.
if (changedOnly) {
  for (const file of trackedFiles()) {
    if (changed.has(file)) continue
    let text
    try {
      text = readFileSync(file, "utf8")
    } catch {
      continue
    }
    const n = text.split("\n").filter((l) => START.test(l) || END.test(l)).length
    if (n > 0) preexisting.push({ file, n })
  }
}

console.log(`conflict-marker scan: ${scanned} file(s) ${stagedOnly ? "staged" : changedOnly ? `changed vs ${base}` : "tracked"}`)
for (const o of offenders) for (const h of o.hits) console.log(`  ✗ ${o.file}:${h.n}  [${h.kind}] ${h.text}`)

if (preexisting.length) {
  console.log("\npre-existing markers outside this change (NOT failing this run, repair separately):")
  for (const p of preexisting) console.log(`  ! ${p.file} — ${p.n} marker line(s)`)
}

if (offenders.length) {
  console.log(`\nFAIL — ${offenders.length} file(s) in this change contain committed merge-conflict markers.`)
  console.log("Resolve every file the merge touched, then re-run before committing/pushing.")
  process.exit(1)
}
console.log("PASS — no committed merge-conflict markers in scope.")
