// tests/api/farcaster.test.js — hardening regression suite for
// functions/api/farcaster.js (kanban t_34ed4a8b).
//
// Covers findings S-A..S-D from the PR #63 review. The curl transcript in the PR
// proves the live-local behaviour against the real Neynar/Snapchain upstreams;
// this suite covers the paths a transcript cannot reach with an invalid key:
//   * the 2xx branch (Cache-Control on success, and its deliberate absence on
//     upstream errors)
//   * exact per-IP isolation, which localhost cannot demonstrate because every
//     local request shares CF-Connecting-IP = 127.0.0.1
//
// Run: node --test tests/api/farcaster.test.js

import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { onRequest } from '../../functions/api/farcaster.js';
import { makeEnv } from '../auth/_harness.js';

const API_KEY = 'test-key-do-not-log';
const BASE = 'https://supercompute.io/api/farcaster';

// ── helpers ─────────────────────────────────────────────────────────────────

function makeRequest(
  pathAndQuery,
  { method = 'GET', origin = 'https://supercompute.io', ip = '203.0.113.7', xff } = {},
) {
  const headers = { Origin: origin };
  if (ip) headers['CF-Connecting-IP'] = ip;
  if (xff) headers['X-Forwarded-For'] = xff;
  return new Request(`${BASE}${pathAndQuery}`, { method, headers });
}

// tests/auth/_harness.js makeEnv() returns only { CACHE, DB, _cacheStore }, so
// the Neynar key has to be attached by hand.
function keyed(cacheStore) {
  const env = makeEnv(cacheStore ? { cacheStore } : {});
  env.NEYNAR_API_KEY = API_KEY;
  return env;
}

async function call(pathAndQuery, opts = {}, env = keyed()) {
  const request = makeRequest(pathAndQuery, opts);
  const response = await onRequest({ request, env });
  let body = null;
  try { body = await response.clone().json(); } catch { body = null; }
  return { status: response.status, headers: response.headers, body, env };
}

// Replaces global fetch with a recording stub. Returns { calls, restore }.
function stubFetch(impl) {
  const calls = [];
  const original = globalThis.fetch;
  globalThis.fetch = async (url, init = {}) => {
    calls.push({ url: String(url), init });
    if (impl) return impl(String(url), init);
    return jsonResponse({ ok: true }, 200);
  };
  return {
    calls,
    restore() { globalThis.fetch = original; },
  };
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

// Wraps a test body so global fetch is always restored.
async function withFetchStub(impl, fn) {
  const stub = stubFetch(impl);
  try {
    return await fn(stub);
  } finally {
    stub.restore();
  }
}

// ════════════════════════════════════════════════════════════════════════════
// S-C — method scope
// ════════════════════════════════════════════════════════════════════════════

test('S-C: POST/PUT/PATCH/DELETE/HEAD are all 405 and never reach the upstream', async () => {
  await withFetchStub(null, async (stub) => {
    for (const method of ['POST', 'PUT', 'PATCH', 'DELETE', 'HEAD']) {
      const { status, headers } = await call('/info', { method });
      assert.equal(status, 405, `${method} must be 405, got ${status}`);
      assert.equal(headers.get('allow'), 'GET, OPTIONS', `${method} must advertise Allow`);
    }
    assert.equal(stub.calls.length, 0, 'no upstream request may be made for a rejected verb');
  });
});

test('S-C: OPTIONS preflight succeeds and is never counted against the limit', async () => {
  await withFetchStub(null, async (stub) => {
    const env = keyed();
    // Burn the entire window from one IP.
    for (let i = 0; i < 30; i++) await call('', {}, env);
    const blocked = await call('', {}, env);
    assert.equal(blocked.status, 429, 'window must be exhausted first');

    // Preflight from the same IP must still pass.
    const preflight = await call('/casts?fid=3', { method: 'OPTIONS' }, env);
    assert.equal(preflight.status, 200, 'OPTIONS must not be rate-limited');
    assert.equal(
      preflight.headers.get('access-control-allow-origin'),
      'https://supercompute.io',
    );
    assert.equal(stub.calls.length, 0);
  });
});

test('S-C: GET is still allowed and forwards to Neynar', async () => {
  await withFetchStub(() => jsonResponse({ casts: [] }, 200), async (stub) => {
    const { status } = await call('/casts?fid=3');
    assert.equal(status, 200);
    assert.equal(stub.calls.length, 1);
    assert.ok(stub.calls[0].url.startsWith('https://api.neynar.com/v2/farcaster/feed'));
  });
});

// ════════════════════════════════════════════════════════════════════════════
// S-A — per-IP rate limit
// ════════════════════════════════════════════════════════════════════════════

test('S-A: 30 requests pass, the 31st is 429 with Retry-After', async () => {
  await withFetchStub(null, async (stub) => {
    const env = keyed();
    for (let i = 1; i <= 30; i++) {
      const { status, headers } = await call('', {}, env);
      assert.equal(status, 200, `request ${i} must pass, got ${status}`);
      assert.equal(headers.get('x-ratelimit-remaining'), String(30 - i));
    }
    const { status, headers, body } = await call('', {}, env);
    assert.equal(status, 429, 'request 31 must be rejected');
    assert.equal(headers.get('x-ratelimit-remaining'), '0');
    assert.ok(Number(headers.get('retry-after')) > 0, 'Retry-After must be a positive number');
    assert.equal(body.error, 'Rate limit exceeded');
    assert.equal(stub.calls.length, 0, 'the doc endpoint makes no upstream call');
  });
});

test('S-A: the limit holds BEFORE the API key check (protects a misconfigured deploy)', async () => {
  const env = makeEnv({}); // no NEYNAR_API_KEY
  for (let i = 0; i < 30; i++) await call('', {}, env);
  const { status } = await call('', {}, env);
  assert.equal(status, 429, 'the limiter must count even while the key is unset');
});

test('S-A: each IP gets its own budget', async () => {
  const env = keyed();
  for (let i = 0; i < 30; i++) await call('', { ip: '198.51.100.1' }, env);
  assert.equal((await call('', { ip: '198.51.100.1' }, env)).status, 429, 'IP A exhausted');

  const other = await call('', { ip: '198.51.100.2' }, env);
  assert.equal(other.status, 200, 'IP B must be unaffected by IP A');
  assert.equal(other.headers.get('x-ratelimit-remaining'), '29');
});

test('S-A: X-Forwarded-For cannot be used to evade the limit', async () => {
  const env = keyed();
  for (let i = 0; i < 30; i++) {
    await call('', { ip: '203.0.113.9', xff: `10.0.0.${i}` }, env);
  }
  const { status } = await call('', { ip: '203.0.113.9', xff: '10.0.0.250' }, env);
  assert.equal(status, 429, 'rotating X-Forwarded-For must not reset the budget');
});

test('S-A: the window rolls over once it has expired', async () => {
  const env = keyed();
  for (let i = 0; i < 30; i++) await call('', {}, env);
  assert.equal((await call('', {}, env)).status, 429);

  // Die the window off by rewriting its reset into the past.
  const key = [...env._cacheStore.keys()].find((k) => k.startsWith('rl:farcaster:'));
  assert.ok(key, 'a rate-limit key must exist');
  const parsed = JSON.parse(env._cacheStore.get(key));
  parsed.reset = Math.floor(Date.now() / 1000) - 5;
  env._cacheStore.set(key, JSON.stringify(parsed));

  const { status } = await call('', {}, env);
  assert.equal(status, 200, 'an expired window must start over');
});

test('S-A: a missing CACHE binding fails closed (503), never silently unmetered', async () => {
  await withFetchStub(null, async (stub) => {
    const env = { NEYNAR_API_KEY: API_KEY }; // no CACHE
    const { status, body } = await call('/casts?fid=3', {}, env);
    assert.equal(status, 503);
    assert.match(body.error, /CACHE binding missing/);
    assert.equal(stub.calls.length, 0, 'must not proxy an unmetered request');
  });
});

test('S-A: a corrupt counter entry degrades to a fresh window, not a 500', async () => {
  const env = keyed();
  env._cacheStore.set('rl:farcaster:203.0.113.7', 'not-json{');
  const { status } = await call('', {}, env);
  assert.equal(status, 200);
});

// ════════════════════════════════════════════════════════════════════════════
// S-B — Snapchain allowlist
// ════════════════════════════════════════════════════════════════════════════

const ALLOWLISTED = [
  '/v1/castById', '/v1/castsByFid', '/v1/castsByMention', '/v1/castsByParent',
  '/v1/eventById', '/v1/events', '/v1/fidAddressType', '/v1/fids', '/v1/info',
  '/v1/linkById', '/v1/linksByFid', '/v1/linksByTargetFid', '/v1/onChainEventsByFid',
  '/v1/onChainIdRegistryEventByAddress', '/v1/onChainSignersByFid', '/v1/reactionById',
  '/v1/reactionsByCast', '/v1/reactionsByFid', '/v1/reactionsByTarget',
  '/v1/storageLimitsByFid', '/v1/userDataByFid', '/v1/userNameProofByName',
  '/v1/userNameProofsByFid', '/v1/verificationsByFid',
];

test('S-B: every allowlisted path forwards to snapchain-api.neynar.com with x-api-key', async () => {
  await withFetchStub(() => jsonResponse({ messages: [] }, 200), async (stub) => {
    for (const p of ALLOWLISTED) {
      const { status } = await call(`/snapchain${p}?fid=3`);
      assert.equal(status, 200, `${p} must forward, got ${status}`);
    }
    assert.equal(stub.calls.length, ALLOWLISTED.length);
    for (const [i, c] of stub.calls.entries()) {
      assert.equal(c.url, `https://snapchain-api.neynar.com${ALLOWLISTED[i]}?fid=3`);
      assert.equal(c.init.headers['x-api-key'], API_KEY);
    }
  });
});

test('S-B: mutation endpoints are NOT on the allowlist and never reach the upstream', async () => {
  await withFetchStub(null, async (stub) => {
    for (const p of ['/v1/submitMessage', '/v1/submitBulkMessages', '/v1/validateMessage']) {
      const { status, body } = await call(`/snapchain${p}`);
      assert.equal(status, 400, `${p} must be 400, got ${status}`);
      assert.equal(body.error, 'Snapchain path not allowed');
    }
    assert.equal(stub.calls.length, 0, 'no mutation endpoint may ever be forwarded');
  });
});

test('S-B: traversal, encoding and shape tricks never produce a non-allowlisted upstream URL', async () => {
  await withFetchStub(() => jsonResponse({ messages: [] }, 200), async (stub) => {
    // Two distinct classes, asserted separately because the URL parser — not
    // the handler — decides which is which:
    //  (a) rejected outright by the allowlist;
    //  (b) dot-segments collapsed by `new URL()` BEFORE the handler runs, so the
    //      request is indistinguishable from the allowlisted path it normalises
    //      to. It therefore resolves to an allowlisted upstream, and cannot
    //      escape the allowlist — there is no raw form left to inspect.
    const rejected = [
      '/v1/%2e%2e/info',   // percent-encoded traversal survives as %2e%2e → not a member
      '/v1//info',
      '/v1/info/',
      '/v1/info%2f',
      '/v1/nonsensePath',
      '/v2/info',
    ];
    for (const p of rejected) {
      const { status } = await call(`/snapchain${p}`);
      assert.equal(status, 400, `/snapchain${p} must be 400, got ${status}`);
    }
    assert.equal(stub.calls.length, 0, 'no rejected path may reach the upstream');

    const normalised = ['/v1/../v1/info', '/v1/./info'];
    for (const p of normalised) {
      const { status } = await call(`/snapchain${p}`);
      assert.equal(status, 200, `/snapchain${p} normalises onto an allowlisted path`);
    }
    for (const c of stub.calls) {
      assert.ok(
        ALLOWLISTED.includes(new URL(c.url).pathname),
        `normalised request must land on an allowlisted upstream, got ${c.url}`,
      );
    }
  });
});

test('S-B: the allowlist is the ONLY gate — every hostile shape is audited end to end', async () => {
  await withFetchStub(() => jsonResponse({ messages: [] }, 200), async (stub) => {
    const hostile = [
      '/v1/../v1/info', '/v1/%2e%2e/info', '/v1//info', '/v1/info/', '/v1/info%2f',
      '/v1/./info', '/../../../../etc/passwd', '/v1/nonsensePath', '/v2/info',
      '/v1/submitMessage', '/v1/submitBulkMessages', '/v1/validateMessage', '',
    ];
    for (const p of hostile) await call(`/snapchain${p}`);

    for (const c of stub.calls) {
      const upstreamPath = new URL(c.url).pathname;
      assert.ok(
        ALLOWLISTED.includes(upstreamPath),
        `path escaping the allowlist: ${c.url}`,
      );
      assert.ok(
        !c.url.includes('..') && !c.url.includes('%2e') && !c.url.includes('//v1'),
        `hostile shape forwarded upstream: ${c.url}`,
      );
    }
  });
});

test('S-B: an allowlisted path with arbitrary query params is still forwarded', async () => {
  await withFetchStub(() => jsonResponse({ ok: true }, 200), async (stub) => {
    await call('/snapchain/v1/castsByFid?fid=3&pageSize=10&reverse=true');
    assert.equal(
      stub.calls[0].url,
      'https://snapchain-api.neynar.com/v1/castsByFid?fid=3&pageSize=10&reverse=true',
    );
  });
});

// ════════════════════════════════════════════════════════════════════════════
// S-D — caching
// ════════════════════════════════════════════════════════════════════════════

test('S-D: /casts and /user carry Cache-Control on success', async () => {
  await withFetchStub(() => jsonResponse({ casts: [] }, 200), async () => {
    const casts = await call('/casts?fid=3');
    assert.equal(casts.status, 200);
    assert.equal(
      casts.headers.get('cache-control'),
      'public, s-maxage=60, stale-while-revalidate=120',
    );

    const user = await call('/user?address=0xabc');
    assert.equal(user.status, 200);
    assert.equal(
      user.headers.get('cache-control'),
      'public, s-maxage=60, stale-while-revalidate=120',
    );
  });
});

test('S-D: an upstream error is NOT cached, and its status is passed through', async () => {
  await withFetchStub(
    () => jsonResponse({ message: 'Incorrect or missing API key' }, 401),
    async () => {
      const { status, headers, body } = await call('/casts?fid=3');
      assert.equal(status, 401, 'upstream status must not be masked as 200');
      assert.equal(headers.get('cache-control'), null, 'never cache an upstream error');
      assert.equal(body.message, 'Incorrect or missing API key');
    },
  );
});

test('S-D: a mid-range upstream status is passed through verbatim', async () => {
  await withFetchStub(() => jsonResponse({ error: 'rate limited upstream' }, 429), async () => {
    const { status } = await call('/casts?fid=3');
    assert.equal(status, 429);
  });
});

test('an unreachable upstream becomes 502, not a hang or a 200', async () => {
  await withFetchStub(() => { throw new Error('connect ECONNREFUSED'); }, async () => {
    const { status, body } = await call('/casts?fid=3');
    assert.equal(status, 502);
    assert.match(body.error, /Failed to fetch Neynar feed/);
  });
});

// ════════════════════════════════════════════════════════════════════════════
// CORS + secret hygiene
// ════════════════════════════════════════════════════════════════════════════

test('CORS: only exact owned origins are reflected, and Vary: Origin is always set', async () => {
  const owned = await call('/casts?fid=3', { origin: 'https://staging.supercompute.io', method: 'OPTIONS' });
  assert.equal(owned.headers.get('access-control-allow-origin'), 'https://staging.supercompute.io');
  assert.equal(owned.headers.get('vary'), 'Origin');

  for (const origin of ['https://evil.com', 'http://supercompute.io', 'https://supercompute.io:444', 'https://attacker.pages.dev']) {
    const { headers } = await call('/casts?fid=3', { origin, method: 'OPTIONS' });
    assert.notEqual(headers.get('access-control-allow-origin'), origin, `must not reflect ${origin}`);
  }
});

test('the API key never appears in a response body or header', async () => {
  await withFetchStub(() => jsonResponse({ message: 'Incorrect or missing API key' }, 401), async () => {
    const { body, headers } = await call('/casts?fid=3');
    const headerDump = [...headers.entries()].map(([k, v]) => `${k}: ${v}`).join('\n');
    assert.ok(!JSON.stringify(body).includes(API_KEY), 'key must not leak in the body');
    assert.ok(!headerDump.includes(API_KEY), 'key must not leak in headers');
  });
});

test('the root index advertises the enforced limits', async () => {
  const { status, body } = await call('');
  assert.equal(status, 200);
  assert.equal(body.limits.method, 'GET, OPTIONS');
  assert.equal(body.limits.rate_limit, '30 req / 60s per IP');
});
