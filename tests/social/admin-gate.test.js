// tests/social/admin-gate.test.js — SEC-F1 regression (PR #62 review).
//
// The /api/social/* gate used to read `users.role` FIRST and treat it as an
// authorization input, with `admin_wallets` only as a fallback. `users.role` is a
// DERIVED CACHE: login.js writes it from the admin_wallets-derived boolean and
// nothing else ever writes it. So a wallet REMOVED from admin_wallets kept admin on
// /api/social/* until its session expired, while the canonical gates
// (functions/api/auth.js, login.js) already denied it.
//
// These tests are RED on the pre-fix handler and GREEN after it: authorization is
// derived from `admin_wallets` and only `admin_wallets`.

import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { onRequest } from '../../functions/api/social/[[catchall]].js';
import {
  makeSocialEnv, socialRequest,
  ADMIN_ADDR, MIXED_CASE_ADDR, RANDO_ADDR,
  SESSION_ID, EXPIRED_SESSION_ID, future,
} from './_harness.js';

async function call(sessionId, { env, path, method } = {}) {
  const res = await onRequest({ request: socialRequest(sessionId, { path, method }), env });
  const body = await res.json().catch(() => null);
  return { status: res.status, body };
}

const userRow = (role) => ({ id: 'u_1', wallet_address: ADMIN_ADDR, role });

// ── the finding itself ─────────────────────────────────────────────────────

test('SEC-F1: revoked admin — stale users.role must NOT keep /api/social/* open', async () => {
  // Wallet was removed from admin_wallets; the cache still says admin and the
  // session is still valid. Canonical endpoints deny this wallet; so must we.
  const env = makeSocialEnv({
    admins: [],
    users: new Map([[ADMIN_ADDR, userRow('admin')]]),
    sessions: new Map([[SESSION_ID, { wallet_address: ADMIN_ADDR, expires_at: future() }]]),
  });
  const { status, body } = await call(SESSION_ID, { env });
  assert.equal(status, 403, `stale users.role='admin' must not authorize; got ${status} ${JSON.stringify(body)}`);
  assert.match(String(body?.error || ''), /admin/);
});

test('SEC-F1: admin_wallets unreadable ⇒ deny (fail closed, never fall back to the cache)', async () => {
  const env = makeSocialEnv({
    failAdminLookup: true,
    users: new Map([[ADMIN_ADDR, userRow('admin')]]),
    sessions: new Map([[SESSION_ID, { wallet_address: ADMIN_ADDR, expires_at: future() }]]),
  });
  const { status } = await call(SESSION_ID, { env });
  assert.equal(status, 403, 'a D1 error on the admin lookup must deny, not grant');
});

test('SEC-F1: users.role is not an authorization input — admin_wallets grants instead', async () => {
  // The mirror image: cache says "user", admin_wallets says admin. The ledger wins.
  const env = makeSocialEnv({
    admins: [{ wallet: ADMIN_ADDR, role: 'admin' }],
    users: new Map([[ADMIN_ADDR, userRow('user')]]),
    sessions: new Map([[SESSION_ID, { wallet_address: ADMIN_ADDR, expires_at: future() }]]),
  });
  const { status } = await call(SESSION_ID, { env });
  assert.equal(status, 200, 'admin_wallets is authoritative in both directions');
});

// ── kept from the review: do not regress the lower() comparison ────────────

test('admin_wallets row stored mixed-case still matches a lowercased session wallet', async () => {
  const env = makeSocialEnv({
    admins: [{ wallet: MIXED_CASE_ADDR, role: 'admin' }],
    sessions: new Map([[SESSION_ID, { wallet_address: MIXED_CASE_ADDR.toLowerCase(), expires_at: future() }]]),
  });
  const { status } = await call(SESSION_ID, { env });
  assert.equal(status, 200, 'lower(wallet_address) = ? must keep matching the checksummed row');
});

test('a wallet simply in admin_wallets is allowed (no users row at all)', async () => {
  const env = makeSocialEnv({
    admins: [{ wallet: ADMIN_ADDR, role: 'admin' }],
    sessions: new Map([[SESSION_ID, { wallet_address: ADMIN_ADDR, expires_at: future() }]]),
  });
  const { status } = await call(SESSION_ID, { env });
  assert.equal(status, 200);
});

test('admin_wallets row whose role is not admin denies', async () => {
  const env = makeSocialEnv({
    admins: [{ wallet: ADMIN_ADDR, role: 'user' }],
    sessions: new Map([[SESSION_ID, { wallet_address: ADMIN_ADDR, expires_at: future() }]]),
  });
  const { status } = await call(SESSION_ID, { env });
  assert.equal(status, 403);
});

// ── session gate invariants (must not be loosened by this change) ──────────

test('no Authorization header ⇒ 401', async () => {
  const env = makeSocialEnv({ admins: [{ wallet: ADMIN_ADDR, role: 'admin' }] });
  const { status } = await call(null, { env });
  assert.equal(status, 401);
});

test('malformed Authorization header ⇒ 401', async () => {
  const env = makeSocialEnv({ admins: [{ wallet: ADMIN_ADDR, role: 'admin' }] });
  const res = await onRequest({
    request: new Request('https://supercompute.io/api/social/health', {
      headers: { Origin: 'https://supercompute.io', Authorization: SESSION_ID },
    }),
    env,
  });
  assert.equal(res.status, 401);
});

test('unknown session id ⇒ 401', async () => {
  const env = makeSocialEnv({ admins: [{ wallet: ADMIN_ADDR, role: 'admin' }] });
  const { status } = await call('sess_does_not_exist', { env });
  assert.equal(status, 401);
});

test('expired session ⇒ 401 even though the wallet is an admin', async () => {
  const env = makeSocialEnv({
    admins: [{ wallet: ADMIN_ADDR, role: 'admin' }],
    sessions: new Map([[EXPIRED_SESSION_ID, { wallet_address: ADMIN_ADDR, expires_at: future() - 7200 }]]),
  });
  const { status } = await call(EXPIRED_SESSION_ID, { env });
  assert.equal(status, 401);
});

test('valid session + non-admin wallet ⇒ 403', async () => {
  const env = makeSocialEnv({
    admins: [{ wallet: ADMIN_ADDR, role: 'admin' }],
    sessions: new Map([[SESSION_ID, { wallet_address: RANDO_ADDR, expires_at: future() }]]),
  });
  const { status } = await call(SESSION_ID, { env });
  assert.equal(status, 403);
});

// ── the gate sits in front of EVERY route, not just the ones we test ───────

for (const [method, path] of [
  ['GET', '/api/social/accounts'],
  ['GET', '/api/social/queue'],
  ['GET', '/api/social/health'],
  ['POST', '/api/social/queue'],
  ['POST', '/api/social/queue/update'],
  ['POST', '/api/social/publish'],
]) {
  test(`${method} ${path} is gated before dispatch (stale admin ⇒ 403)`, async () => {
    const env = makeSocialEnv({
      admins: [],
      users: new Map([[ADMIN_ADDR, userRow('admin')]]),
      sessions: new Map([[SESSION_ID, { wallet_address: ADMIN_ADDR, expires_at: future() }]]),
    });
    const { status } = await call(SESSION_ID, { env, path, method });
    assert.equal(status, 403, `${method} ${path} must not be reachable on a revoked admin`);
  });
}

test('OPTIONS preflight is not gated (CORS requires it to answer)', async () => {
  const env = makeSocialEnv({});
  const res = await onRequest({
    request: new Request('https://supercompute.io/api/social/health', {
      method: 'OPTIONS',
      headers: { Origin: 'https://supercompute.io' },
    }),
    env,
  });
  assert.ok(res.status < 400, `preflight must not be blocked; got ${res.status}`);
});
