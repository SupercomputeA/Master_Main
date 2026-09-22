#!/usr/bin/env node
/**
 * scripts/test-social-api.mjs — acceptance harness for the social command center API.
 *
 * Proves, against a real running instance (local `wrangler pages dev` or a deploy):
 *   1. GET  /api/social/accounts        → 401 with no session (unauthenticated denied)
 *   2. GET  /api/social/accounts        → 403 with a non-admin session (non-admin denied)
 *   3. GET  /api/social/accounts        → 200 with an admin session, every rail reports a status
 *   4. POST /api/social/queue           → 201, row persisted in D1, readable back
 *   5. POST /api/social/publish         → dry_run when credentials are absent (never faked)
 *   6. POST /api/social/queue/update    → status persisted
 *   7. POST /api/social/queue/delete    → row gone
 *   8. GET  /api/social/health          → telemetry + queue counts
 *
 * Usage:
 *   SITE=http://127.0.0.1:8899 ADMIN_SESSION=<session> USER_SESSION=<session> node scripts/test-social-api.mjs
 *   (USER_SESSION is optional — step 2 is skipped when it is absent.)
 */

const BASE = (process.env.SITE || 'http://127.0.0.1:8899').replace(/\/$/, '')
const ADMIN = process.env.ADMIN_SESSION || ''
const USER = process.env.USER_SESSION || ''

let pass = 0
let fail = 0
const failures = []

function ok(label, detail = '') {
  pass++
  console.log(`  ✅ ${label}${detail ? ` — ${detail}` : ''}`)
}
function bad(label, detail = '') {
  fail++
  failures.push(`${label}: ${detail}`)
  console.log(`  ❌ ${label}${detail ? ` — ${detail}` : ''}`)
}

async function req(path, { method = 'GET', session, body } = {}) {
  const headers = {}
  if (session) headers.Authorization = `Bearer ${session}`
  if (body) headers['Content-Type'] = 'application/json'
  const res = await fetch(`${BASE}${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined })
  const text = await res.text()
  let json = null
  try { json = JSON.parse(text) } catch { /* non-JSON (HTML error page) is itself a finding */ }
  return { status: res.status, json, text, contentType: res.headers.get('content-type') || '' }
}

function requireJson(r, label) {
  if (!r.json) {
    bad(label, `non-JSON response (${r.contentType || 'no content-type'}) HTTP ${r.status}: ${r.text.slice(0, 120)}`)
    return false
  }
  return true
}

console.log(`\nSocial command center API — ${BASE}\n`)
if (!ADMIN) {
  console.error('ADMIN_SESSION env var is required.')
  process.exit(2)
}

// 1 — unauthenticated
{
  const r = await req('/api/social/accounts')
  if (r.status === 401) ok('unauthenticated GET /accounts → 401', r.json?.error)
  else bad('unauthenticated GET /accounts → 401', `got HTTP ${r.status}`)
  requireJson(r, 'unauthenticated GET /accounts is JSON')
}

// 2 — non-admin session
if (USER) {
  const r = await req('/api/social/accounts', { session: USER })
  if (r.status === 403) ok('non-admin GET /accounts → 403', r.json?.error)
  else bad('non-admin GET /accounts → 403', `got HTTP ${r.status}`)
} else {
  console.log('  ⏭  non-admin check skipped (no USER_SESSION)')
}

// 3 — admin session, rail status
let railIds = []
{
  const r = await req('/api/social/accounts', { session: ADMIN })
  if (r.status !== 200) {
    bad('admin GET /accounts → 200', `got HTTP ${r.status}: ${r.json?.error || r.text.slice(0, 120)}`)
  } else {
    const accounts = r.json.accounts || []
    railIds = accounts.map((a) => a.id)
    const statuses = new Set(accounts.map((a) => a.status))
    const honest = accounts.every((a) => ['connected', 'needs_key', 'manual'].includes(a.status))
    const noSecrets = !JSON.stringify(accounts).match(/(secret|token|password|key)"\s*:\s*"[^"]/i)
    if (accounts.length >= 6 && honest) ok(`admin GET /accounts → 200 (${accounts.length} rails)`, [...statuses].join(', '))
    else bad('admin GET /accounts → 200 with honest per-rail status', `accounts=${accounts.length}`)
    if (noSecrets) ok('no credential values echoed in the payload')
    else bad('no credential values echoed in the payload', 'payload appears to contain secret values')
  }
}

// 4 — create a queue item
let itemId = null
{
  const r = await req('/api/social/queue', {
    method: 'POST',
    session: ADMIN,
    body: {
      body: `harness check ${new Date().toISOString()}`,
      platforms: ['farcaster', 'substack'],
      scheduled_at: Math.floor(Date.now() / 1000) + 3600,
    },
  })
  if (r.status === 201 && r.json?.item?.id) {
    itemId = r.json.item.id
    ok('POST /queue → 201 row created', `${itemId} status=${r.json.item.status}`)
  } else {
    bad('POST /queue → 201', `got HTTP ${r.status}: ${r.json?.error || r.text.slice(0, 120)}`)
  }
}

// 4b — read it back
if (itemId) {
  const r = await req('/api/social/queue', { session: ADMIN })
  const found = (r.json?.queue || []).find((q) => q.id === itemId)
  if (r.status === 200 && found) ok('GET /queue reads the row back from D1', `status=${found.status}`)
  else bad('GET /queue reads the row back from D1', `found=${Boolean(found)} HTTP ${r.status}`)
}

// 5 — dry-run dispatch (credentials are absent locally → must never claim a post)
if (itemId) {
  const r = await req('/api/social/publish', { method: 'POST', session: ADMIN, body: { id: itemId, dry_run: true } })
  const results = r.json?.results || []
  if (r.status === 200 && r.json?.status === 'dry_run' && results.length === 2) {
    ok('POST /publish (dry_run) → status dry_run', results.map((x) => `${x.platform}:${x.mode}`).join(' '))
  } else {
    bad('POST /publish (dry_run) → status dry_run', `HTTP ${r.status} status=${r.json?.status} results=${results.length}`)
  }
  const live = await req('/api/social/publish', { method: 'POST', session: ADMIN, body: { id: itemId } })
  const claimed = (live.json?.results || []).some((x) => x.ok === true && x.mode === 'live')
  const expectedModes = ['dry-run', 'manual', 'unsupported', 'live']
  const honest = (live.json?.results || []).every((x) => expectedModes.includes(x.mode))
  if (honest) ok('POST /publish (live path, no creds) reports honest modes', (live.json?.results || []).map((x) => `${x.platform}:${x.mode}`).join(' '))
  else bad('POST /publish (live path) reports honest modes', JSON.stringify(live.json?.results))
  if (!claimed) ok('no post claimed without credentials', `status=${live.json?.status}`)
  else bad('no post claimed without credentials', 'an adapter reported ok:true with mode live')
}

// 6 — update
if (itemId) {
  const r = await req('/api/social/queue/update', { method: 'POST', session: ADMIN, body: { id: itemId, status: 'draft', scheduled_at: null } })
  if (r.status === 200 && r.json?.item?.status === 'draft') ok('POST /queue/update → status persisted', 'draft')
  else bad('POST /queue/update → status persisted', `HTTP ${r.status} status=${r.json?.item?.status}`)
}

// 7 — delete
if (itemId) {
  const r = await req('/api/social/queue/delete', { method: 'POST', session: ADMIN, body: { id: itemId } })
  const after = await req('/api/social/queue', { session: ADMIN })
  const stillThere = (after.json?.queue || []).some((q) => q.id === itemId)
  if (r.status === 200 && !stillThere) ok('POST /queue/delete → row removed', itemId)
  else bad('POST /queue/delete → row removed', `HTTP ${r.status} stillThere=${stillThere}`)
}

// 8 — health / telemetry
{
  const r = await req('/api/social/health', { session: ADMIN })
  if (r.status === 200 && r.json?.telemetry && Array.isArray(r.json.queue_counts)) {
    ok('GET /health → telemetry', `rails=${r.json.telemetry.rails_total} connected=${r.json.telemetry.rails_connected} needs_key=${r.json.telemetry.rails_needs_key}`)
  } else {
    bad('GET /health → telemetry', `HTTP ${r.status}`)
  }
}

console.log(`\n${fail === 0 ? 'ALL PASS' : 'FAILURES'} — ${pass} passed, ${fail} failed\n`)
if (failures.length) {
  for (const f of failures) console.log(`  - ${f}`)
  process.exit(1)
}
