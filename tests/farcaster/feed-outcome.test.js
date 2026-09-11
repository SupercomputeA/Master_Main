// tests/farcaster/feed-outcome.test.js — the UI half of the residual from
// kanban t_34ed4a8b. Closes card t_2b6083b9.
//
// The bug: components/FarcasterFeed.tsx read only the JSON body, so an upstream
// Neynar failure — `{"message":"…"}`, neither `casts` nor `error` — fell through
// to the empty branch and a PUBLIC page rendered "No recent casts." for a rail
// that was down (quota-exhausted `429`, revoked key `401`).
//
// This suite pins the decision table that the component now goes through. The
// global invariant at the bottom is the actual acceptance criterion: no status
// other than a successful, cast-carrying 2xx may ever produce an empty feed.
//
// Run: node --test tests/farcaster/feed-outcome.test.js

import { test } from 'node:test'
import { strict as assert } from 'node:assert'
import { readFileSync } from 'node:fs'
import { classifyFeedResponse, COPY_UNCONFIGURED } from '../../lib/farcaster-feed.js'

const CASTS = [
  { hash: '0xaa', text: 'one', author: { username: 'supercompute' } },
  { hash: '0xbb', text: 'two', author: { username: 'supercompute' } },
]

// ── the happy path, and the truthful empty state ────────────────────────────

test('200 with casts → renders the feed', () => {
  const r = classifyFeedResponse(200, { casts: CASTS })
  assert.equal(r.kind, 'casts')
  assert.equal(r.casts.length, 2)
})

test('200 with casts: [] → the honest empty state, NOT a degraded rail', () => {
  // Acceptance criterion 2. `[]` is truthy in JS, but it is a legitimate quiet
  // account, and "No recent casts." is the copy reserved for exactly this.
  const r = classifyFeedResponse(200, { casts: [] })
  assert.equal(r.kind, 'casts')
  assert.deepEqual(r.casts, [])
  assert.equal(r.message, undefined, 'an empty feed must not carry degraded copy')
})

// ── the failures that used to render as "No recent casts." ──────────────────

test('upstream 429 quota body → degraded, names quota + 429', () => {
  // Real Neynar quota-exhaustion shape: no `casts`, no `error`.
  const r = classifyFeedResponse(429, { message: 'Rate limit exceeded. Try again later.' })
  assert.equal(r.kind, 'degraded')
  assert.match(r.message, /HTTP 429/)
  assert.match(r.message, /quota exhausted/)
  assert.match(r.message, /degraded feed, not an idle account/)
  assert.doesNotMatch(r.message, /No recent casts/)
})

test('upstream 401 bad key body → degraded, names the credential', () => {
  // Verbatim body returned by api.neynar.com for an invalid key.
  const r = classifyFeedResponse(401, { message: 'Incorrect or missing API key' })
  assert.equal(r.kind, 'degraded')
  assert.match(r.message, /HTTP 401/)
  assert.match(r.message, /NEYNAR_API_KEY is invalid or revoked/)
  assert.match(r.message, /Incorrect or missing API key/)
  assert.doesNotMatch(r.message, /No recent casts/)
})

test('403 is treated as a rejected key too', () => {
  const r = classifyFeedResponse(403, { message: 'Forbidden' })
  assert.equal(r.kind, 'degraded')
  assert.match(r.message, /HTTP 403/)
  assert.match(r.message, /key rejected/)
})

test('upstream 5xx → degraded fault', () => {
  for (const status of [500, 502, 503, 504]) {
    // 503 here carries a NON-key body, so it must not claim the key is missing.
    const r = classifyFeedResponse(status, { message: 'upstream exploded' })
    assert.equal(r.kind, 'degraded', `status ${status}`)
    assert.match(r.message, new RegExp(`HTTP ${status}`))
    assert.match(r.message, /rail fault/)
  }
})

test('a 2xx with no cast list → degraded, never empty', () => {
  // The pre-#66 proxy hard-coded 200 over an upstream failure. That shape is
  // the historical mask of this exact bug; it must not become an empty feed.
  const r = classifyFeedResponse(200, { message: 'Incorrect or missing API key' })
  assert.equal(r.kind, 'degraded')
  assert.match(r.message, /no cast list/)
  assert.doesNotMatch(r.message, /No recent casts/)
})

test('non-JSON body degrades on the status alone', () => {
  // An edge error page (HTML) that failed to parse reaches here as null.
  const r = classifyFeedResponse(502, null)
  assert.equal(r.kind, 'degraded')
  assert.match(r.message, /HTTP 502/)
})

test('casts present but not an array → degraded, never a crash', () => {
  for (const casts of [null, 'nope', {}, 7]) {
    const r = classifyFeedResponse(200, { casts })
    assert.equal(r.kind, 'degraded', `casts: ${JSON.stringify(casts)}`)
  }
})

// ── our own handler's states, which must stay distinct ──────────────────────

test('503 NEYNAR_API_KEY not configured → the preserved "rail wired" copy', () => {
  const r = classifyFeedResponse(503, {
    error: 'NEYNAR_API_KEY not configured',
    docs: 'Set NEYNAR_API_KEY in Cloudflare dashboard',
  })
  assert.equal(r.kind, 'unconfigured')
  assert.equal(r.message, COPY_UNCONFIGURED)
  assert.match(r.message, /rail wired/)
})

test('503 from a missing CACHE binding does NOT claim the key is missing', () => {
  const r = classifyFeedResponse(503, { error: 'Server misconfigured: CACHE binding missing' })
  assert.equal(r.kind, 'degraded')
  assert.doesNotMatch(r.message, /NEYNAR_API_KEY not yet provisioned/)
  assert.match(r.message, /CACHE binding missing/)
})

test('our own limiter 429 carries the retry window', () => {
  const r = classifyFeedResponse(429, { error: 'Rate limit exceeded', retry_after: 58 })
  assert.equal(r.kind, 'degraded')
  assert.match(r.message, /retry in ~58s/)
})

test('an unknown status still degrades honestly', () => {
  const r = classifyFeedResponse(418, { message: 'teapot' })
  assert.equal(r.kind, 'degraded')
  assert.match(r.message, /HTTP 418/)
})

// ── operator detail stays a line, never a stack trace ───────────────────────

test('detail is flattened and capped', () => {
  const r = classifyFeedResponse(500, {
    message: `boom\n    at Object.<anonymous> ${'x'.repeat(400)}`,
  })
  assert.equal(r.kind, 'degraded')
  assert.ok(!r.message.includes('\n'), 'no newlines in the rendered line')
  // headline + hint + detail + tail; the detail segment is the capped one.
  const detailSegment = r.message.split(' · ').find((s) => s.startsWith('detail: '))
  assert.ok(detailSegment, 'detail segment present')
  assert.ok(detailSegment.length <= 'detail: '.length + 120, 'detail capped at 120 chars')
  assert.ok(detailSegment.endsWith('...'), 'truncation is visible')
})

test('non-string / nested detail bodies are ignored', () => {
  for (const body of [undefined, null, {}, { message: 42 }, { message: { a: 1 } }]) {
    const r = classifyFeedResponse(500, body)
    assert.equal(r.kind, 'degraded')
    assert.doesNotMatch(r.message, /detail:/)
  }
})

// ── the global invariant: a failure can never render as an empty feed ───────

test('INVARIANT: no non-2xx and no casts-less 2xx ever yields kind "casts"', () => {
  const bodies = [
    undefined,
    null,
    {},
    { message: 'Incorrect or missing API key' },
    { error: 'Rate limit exceeded' },
    { detail: 'nope' },
    { casts: null },
    { casts: 'not-an-array' },
    'a bare string body',
    42,
  ]
  for (let status = 200; status < 600; status++) {
    for (const body of bodies) {
      const r = classifyFeedResponse(status, body)
      const carriesCasts = body && typeof body === 'object' && Array.isArray(body.casts)
      const is2xx = status >= 200 && status < 300
      if (r.kind === 'casts') {
        assert.ok(
          is2xx && carriesCasts,
          `status ${status} + ${JSON.stringify(body)} classified as a feed`,
        )
      }
    }
  }
})

test('INVARIANT: every degraded/unconfigured line is non-empty mono copy', () => {
  for (const status of [400, 401, 403, 405, 429, 500, 502, 503, 504]) {
    const r = classifyFeedResponse(status, { message: 'x' })
    assert.ok(r.kind === 'degraded' || r.kind === 'unconfigured', `status ${status}`)
    assert.equal(typeof r.message, 'string')
    assert.ok(r.message.length > 20, `status ${status} copy too short`)
    assert.notEqual(r.message, 'No recent casts.')
  }
})

// ── the component is actually wired to the status ───────────────────────────

test('FarcasterFeed routes the response through the classifier', () => {
  // Static assertion, deliberately. The residual was "the component ignores
  // status"; a future edit that drops the status read or reintroduces the
  // `else setCasts([])` fallthrough has to delete this line to pass, which is
  // the signal we want. Behaviour is covered by the table above and by the
  // browser run against `wrangler pages dev` (PR evidence).
  const src = readFileSync(new URL('../../components/FarcasterFeed.tsx', import.meta.url), 'utf8')
  assert.match(src, /classifyFeedResponse\(r\.status, body\)/)
  assert.match(src, /const r = await fetch\(`\/api\/farcaster\/casts\?fid=\$\{fid\}&limit=5`\)/)
  assert.doesNotMatch(src, /else setCasts\(\[\]\)/, 'the old body-only fallthrough is gone')
  assert.doesNotMatch(src, /\.then\(r => r\.json\(\)\)/, 'the old status-blind chain is gone')
  assert.doesNotMatch(src, /setInterval|setTimeout\(/, 'no polling')
})
