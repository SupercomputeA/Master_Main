#!/usr/bin/env node
// scripts/smoke-preview.mjs
//
// Route + content smoke test for a DEPLOYED build (preview or prod).
// Zero dependencies — global fetch, Node 20+.
//
//   node scripts/smoke-preview.mjs https://pr-123.supercompute.pages.dev
//   node scripts/smoke-preview.mjs https://supercompute.io --json
//   node scripts/smoke-preview.mjs https://supercompute.io --negative-control
//
// Why this exists: merging to main is the only way to see a build today, so a
// page that 404s or renders the wrong surface is discovered by whoever visits
// next. This asserts the routes and the SURFACE MARKERS (not just HTTP 200 — a
// 200 that renders the previous page is the failure mode we keep hitting), that
// the four never-published debug names stay 404, and — separately — that the
// surfaces which actually hold data (the /api/* gates) still refuse an
// unauthenticated request. Exit 1 on any mismatch.

const args = process.argv.slice(2)
const base = (args.find((a) => !a.startsWith("--")) || "").replace(/\/$/, "")
const asJson = args.includes("--json")
// --negative-control re-runs one gate assertion against a deliberately WRONG expected
// status and requires it to fail (see the runner at the bottom). A check that cannot fail
// is decoration; this makes "the trap bites" reproducible instead of a claim in a comment.
const wantNegativeControl = args.includes("--negative-control")
if (!base) {
  console.error("usage: node scripts/smoke-preview.mjs <base-url> [--json] [--negative-control]")
  process.exit(2)
}

// status:   expected HTTP status, EXACT. Use for surfaces that must serve.
// statusIn: allowed HTTP statuses, ANY of them is a pass. Use for CLOSED surfaces
//           (gates), where the exact code is the gate's business but any of them
//           means "still refusing an unauthenticated request".
// includes: substrings that MUST appear.
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
  // The /admin route set — real pages (pages/admin/*.tsx), and they DO answer an
  // unauthenticated GET with 200. That is what they are today: part of the static export,
  // with no server-side gate in front of the HTML (what is gated is the API they call —
  // asserted in the /api/* block below). 401/403 are accepted here so that ADDING a real
  // gate never breaks this lane; a 404 (route removed), a 5xx (surface broken) or a shell
  // that lost its marker (wrong surface served) still fails. Asserting these at all is the
  // point: the route set that renders admin chrome must not drift unwatched.
  { path: "/admin", statusIn: [200, 401, 403], includes: ["· Admin Dashboard"] },
  { path: "/admin/users", statusIn: [200, 401, 403], includes: ["· User Management"] },
  { path: "/admin/settings", statusIn: [200, 401, 403], includes: ["· Settings"] },
  { path: "/admin/analytics", statusIn: [200, 401, 403], includes: ["· Analytics"] },
  { path: "/admin/content", statusIn: [200, 401, 403], includes: ["· Content Moderation"] },
  // Names that must never be published by accident. Kept as the named-path tripwire they
  // are — note what they are NOT: none of these exists in the tree, so all four are 404 by
  // ABSENCE, and this block can only catch the day one of them appears. It is not a check
  // on the current closed surface; that is the /api/* block below.
  { path: "/demo", status: 404 },
  { path: "/api/debug", status: 404 },
  { path: "/api/admin", status: 404 },
  { path: "/_debug", status: 404 },
  // The surfaces that actually hold data, asserted by the status an UNauthenticated GET
  // gets — the regression trap that can fire. Unauthenticated status only: no credentials,
  // no auth bypass, no writes. Measured live 2026-09-15, prod and the pr-98 preview alike:
  //   401/403 = the handler refused before touching the store
  //   405     = method-intrinsic: that module exports POST only, so GET never enters it
  // A 200 here is a data leak, a 404 a vanished route, a 5xx a broken gate — all fail.
  // `gate: true` marks the entries the --negative-control run probes (it needs a route
  // that MUST NOT answer 200; the /admin block above is not one of those).
  { path: "/api/subscribers", gate: true, statusIn: [401, 403] },
  { path: "/api/subscribers/admin/expire-sweep", gate: true, statusIn: [401, 403, 405] },
  { path: "/api/investors/data-room", gate: true, statusIn: [401, 403] },
  { path: "/api/investors/file", gate: true, statusIn: [401, 403] },
  { path: "/api/marketplace/list", gate: true, statusIn: [401, 403, 405] },
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
    if (route.statusIn && !route.statusIn.includes(res.status)) {
      problems.push(`status ${res.status}, expected one of ${route.statusIn.join("/")}`)
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

// Negative control: re-check ONE gated surface with a deliberately wrong expectation (200
// for something that must refuse us). It has to FAIL — if a surface that leaks data still
// passes, these assertions are not testing anything, and that is a failure of the suite,
// not a pass. It probes the first `gate: true` entry, so it stays in sync with the table.
let negativeControl = null
if (wantNegativeControl) {
  const gated = ROUTES.find((r) => r.gate)
  const res = await check({ path: gated.path, statusIn: [200] })
  negativeControl = { path: gated.path, expected: 200, actual: res.status, expectedAny: gated.statusIn, bit: !res.ok }
}
const controlFailed = negativeControl !== null && !negativeControl.bit

if (asJson) {
  console.log(JSON.stringify({ base, checked: results.length, failed: failed.length, results, negativeControl }, null, 1))
} else {
  console.log(`smoke: ${base}`)
  for (const r of results) {
    const mark = r.ok ? "✓" : "✗"
    const detail = r.ok ? `${r.status} ${r.bytes}b` : `${r.status} — ${r.problems.join("; ")}`
    console.log(`  ${mark} ${r.path.padEnd(40)} ${detail}`)
  }
  console.log(failed.length === 0 ? `\nPASS — ${results.length}/${results.length} routes verified.` : `\nFAIL — ${failed.length}/${results.length} routes wrong.`)
  if (negativeControl) {
    const live = negativeControl.expectedAny.join("/")
    console.log(
      negativeControl.bit
        ? `negative control: ${negativeControl.path} expecting 200 (it must answer ${live}) → got ${negativeControl.actual} (trap fired ✓)`
        : `negative control: ${negativeControl.path} expecting 200 (it must answer ${live}) → got ${negativeControl.actual}, so the gate assertions DO NOT bite ✗`,
    )
  }
}

process.exit(failed.length === 0 && !controlFailed ? 0 : 1)
