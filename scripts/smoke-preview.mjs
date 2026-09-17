#!/usr/bin/env node
// scripts/smoke-preview.mjs
//
// Route + content smoke test for a DEPLOYED build (preview or prod).
// Zero dependencies — global fetch, Node 20+.
//
//   node scripts/smoke-preview.mjs https://pr-123.supercompute.pages.dev
//   node scripts/smoke-preview.mjs https://supercompute.io --json
//
// Why this exists: merging to main is the only way to see a build today, so a
// page that 404s or renders the wrong surface is discovered by whoever visits
// next. This asserts the routes and the SURFACE MARKERS (not just HTTP 200 — a
// 200 that renders the previous page is the failure mode we keep hitting),
// plus that debug/admin surfaces stay closed. Exit 1 on any mismatch.

const args = process.argv.slice(2)
const base = (args.find((a) => !a.startsWith("--")) || "").replace(/\/$/, "")
const asJson = args.includes("--json")
if (!base) {
  console.error("usage: node scripts/smoke-preview.mjs <base-url> [--json]")
  process.exit(2)
}

// status: expected HTTP status. includes: substrings that MUST appear.
// excludes: substrings that must NOT appear (catches "wrong surface served").
const ROUTES = [
  { path: "/", status: 200, includes: ["SUPERCOMPUTE"] },
  { path: "/auth", status: 200, includes: ["Enter Supercompute"] },
  { path: "/staking", status: 200, includes: ["STAKING AT"] },
  { path: "/projects/staking", status: 200, includes: ["Staking at Supercompute"] },
  { path: "/tradedesk", status: 200, includes: ["TRADEDESK"] },
  { path: "/terms", status: 200, includes: ["TERMS"] },
  { path: "/privacy", status: 200, includes: ["PRIVACY"] },
  { path: "/dao", status: 200, includes: ["DAO"] },
  { path: "/token", status: 200, includes: ["TOKEN"] },
  { path: "/projects", status: 200 },
  { path: "/fleet", status: 200 },
  { path: "/community", status: 200 },
  { path: "/social", status: 200 },
  { path: "/school", status: 200 },
  // Surfaces that must stay closed / never published by accident.
  { path: "/demo", status: 404 },
  { path: "/api/debug", status: 404 },
  { path: "/api/admin", status: 404 },
  { path: "/_debug", status: 404 },
]

const TIMEOUT_MS = 15000

async function check(route) {
  const url = `${base}${route.path}`
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    const res = await fetch(url, { redirect: "follow", signal: controller.signal })
    const body = await res.text()
    // Case-insensitive marker matching: the served surface is what matters, and
    // a marker that only differs by case ("TRADEDESK" vs "TradeDesk") is a bug
    // in this file, not in the page.
    const hay = body.toLowerCase()
    const problems = []
    if (route.status && res.status !== route.status) {
      problems.push(`status ${res.status}, expected ${route.status}`)
    }
    for (const needle of route.includes || []) {
      if (!hay.includes(needle.toLowerCase())) problems.push(`missing marker ${JSON.stringify(needle)}`)
    }
    for (const needle of route.excludes || []) {
      if (hay.includes(needle.toLowerCase())) problems.push(`unexpected ${JSON.stringify(needle)}`)
    }
    return { path: route.path, status: res.status, ok: problems.length === 0, problems, bytes: body.length }
  } catch (err) {
    return { path: route.path, status: 0, ok: false, problems: [`fetch failed: ${err?.message || err}`], bytes: 0 }
  } finally {
    clearTimeout(timer)
  }
}

const results = []
for (const route of ROUTES) results.push(await check(route))

const failed = results.filter((r) => !r.ok)

if (asJson) {
  console.log(JSON.stringify({ base, checked: results.length, failed: failed.length, results }, null, 1))
} else {
  console.log(`smoke: ${base}`)
  for (const r of results) {
    const mark = r.ok ? "✓" : "✗"
    const detail = r.ok ? `${r.status} ${r.bytes}b` : `${r.status} — ${r.problems.join("; ")}`
    console.log(`  ${mark} ${r.path.padEnd(22)} ${detail}`)
  }
  console.log(failed.length === 0 ? `\nPASS — ${results.length}/${results.length} routes verified.` : `\nFAIL — ${failed.length}/${results.length} routes wrong.`)
}

process.exit(failed.length === 0 ? 0 : 1)
