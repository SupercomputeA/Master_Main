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
//
// Two layers:
//   1. the mock suite above (fast, no engine) — authorization shape, session gate, route
//      coverage;
//   2. the real-engine suite at the bottom of this file — the REAL handler over a REAL
//      SQLite engine (`node:sqlite`, what D1 runs) and the REAL production DDL
//      (schema.sql), which is the only layer that can assert the case-insensitivity of
//      `lower(wallet_address) = ?`. That comparison is an explicit non-regression from
//      the PR #62 review, and a JS-side mock cannot see it: matching rows in JS makes the
//      mock insensitive for every SQL shape, so reverting the gate to the case-sensitive
//      query stayed green (round 1). These tests fail if the `lower(` is lost.
//
// `node:sqlite` needs Node 22.5+; CI pins Node 24 (as does status-enum-migration.test.mjs).

import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { readFileSync, writeFileSync, unlinkSync, readdirSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { DatabaseSync } from 'node:sqlite';
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

// ── the lower() non-regression, proved against a REAL SQLite engine ────────
//
// The mock above answers admin_wallets lookups from a JS array, so it can only ever prove
// what the JS comparison does — never what the handler's SQL TEXT does. These tests drive
// the REAL handler over a REAL engine (`node:sqlite`, the engine D1 runs) and the REAL
// production DDL (schema.sql). That is the only layer that can detect a regression to
// `wallet_address = ?`: drop the `lower(` from the gate and these go RED.
//
// Why it matters: a live prod `admin_wallets` row is stored checksummed
// (0xe7A3Ed04F24b6482b4490ae06641Be4e4305Df34) while `sessions.wallet_address` is always
// lowercased, so a case-sensitive comparison silently 403s a legitimate admin.

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(HERE, '../..');
const SCHEMA_SQL = readFileSync(path.join(REPO_ROOT, 'schema.sql'), 'utf8');
const MIGRATION_FILES = readdirSync(path.join(REPO_ROOT, 'migrations'))
  .filter((f) => f.endsWith('.sql'))
  .sort()
  .map((f) => readFileSync(path.join(REPO_ROOT, 'migrations', f), 'utf8'));
const HANDLER_PATH = path.resolve(HERE, '../../functions/api/social/[[catchall]].js');
const ADMIN_SQL = 'SELECT role FROM admin_wallets WHERE lower(wallet_address) = ?';

/** A real engine carrying the real production schema: schema.sql plus every migration. */
function realDb() {
  const db = new DatabaseSync(':memory:');
  db.exec(SCHEMA_SQL);
  for (const sql of MIGRATION_FILES) db.exec(sql);
  return db;
}

/** D1's statement shape over that engine, so the real handler runs unmodified. */
function envOver(db) {
  const prepare = (sql) => {
    const stmt = db.prepare(sql);
    const wrap = (bound) => ({
      first: async () => (bound === undefined ? stmt.get() : stmt.get(...bound)) ?? null,
      all: async () => ({ results: bound === undefined ? stmt.all() : stmt.all(...bound) }),
      run: async () => { (bound === undefined ? stmt.run() : stmt.run(...bound)); return { success: true }; },
    });
    return Object.assign(wrap(undefined), { bind: (...args) => wrap(args) });
  };
  return { DB: { prepare } };
}

const seedAdmin = (db, wallet) =>
  db.prepare('INSERT INTO admin_wallets (id, wallet_address, role) VALUES (?, ?, ?)').run('aw_1', wallet, 'admin');
const seedSession = (db, id, wallet, expiresAt) =>
  db.prepare('INSERT INTO sessions (id, wallet_address, expires_at) VALUES (?, ?, ?)').run(id, wallet, expiresAt);

/** Mixed-case admin_wallets row + a lowercased session wallet, on a real engine. */
function mixedCaseEngine() {
  const db = realDb();
  seedAdmin(db, MIXED_CASE_ADDR);
  seedSession(db, SESSION_ID, MIXED_CASE_ADDR.toLowerCase(), future());
  return { db, env: envOver(db) };
}

test('[real engine] mixed-case admin_wallets row matches a lowercased session wallet ⇒ 200', async () => {
  const { env } = mixedCaseEngine();
  const { status, body } = await call(SESSION_ID, { env });
  assert.equal(status, 200, `lower(wallet_address) = ? must match the checksummed row; got ${status} ${JSON.stringify(body)}`);
});

test('[real engine] the case-sensitive form of that lookup MISSES the row, so the assertion above is load-bearing', async () => {
  const { db } = mixedCaseEngine();
  const lowercased = MIXED_CASE_ADDR.toLowerCase();
  const insensitive = db.prepare('SELECT role FROM admin_wallets WHERE lower(wallet_address) = ?').get(lowercased);
  const sensitive = db.prepare('SELECT role FROM admin_wallets WHERE wallet_address = ?').get(lowercased);
  assert.equal(insensitive?.role, 'admin', 'the lower() form is the one that matches');
  assert.equal(sensitive, undefined, 'plain wallet_address = ? misses it — this is the property the gate must keep');
});

test('[real engine] revoked admin (stale users.role, no admin_wallets row) ⇒ 403', async () => {
  const db = realDb();
  seedSession(db, SESSION_ID, RANDO_ADDR, future());
  db.prepare('INSERT INTO users (id, wallet_address, role) VALUES (?, ?, ?)').run('u_1', RANDO_ADDR, 'admin');
  const { status } = await call(SESSION_ID, { env: envOver(db) });
  assert.equal(status, 403, 'the users.role cache must not authorize on a real engine either');
});

test('[real engine] MUTATION SELF-CHECK: reverting the gate to case-sensitive must DENY that admin', async () => {
  // Flipping the guard on itself: this fails if a reverted gate is admitted, and fails if
  // the mutation stops applying (i.e. the SQL text moved and this guard needs updating).
  // The mutant is written out of tree, with its relative import rewritten to an absolute URL.
  const src = readFileSync(HANDLER_PATH, 'utf8');
  const sharedUrl = pathToFileURL(path.resolve(HERE, '../../functions/_shared/cors-origins.js')).href;
  const mutant = src
    .replace('from "../../_shared/cors-origins.js"', `from "${sharedUrl}"`)
    .replace(ADMIN_SQL, 'SELECT role FROM admin_wallets WHERE wallet_address = ?');
  assert.notEqual(mutant, src, 'the mutation must apply — the gate SQL text changed, so update this guard');

  const mutantPath = path.join(os.tmpdir(), `secf1-mutant-${process.pid}-${Date.now()}.mjs`);
  writeFileSync(mutantPath, mutant);
  try {
    const { onRequest: mutantHandler } = await import(pathToFileURL(mutantPath).href);
    const { env } = mixedCaseEngine();
    const res = await mutantHandler({ request: socialRequest(SESSION_ID), env });
    const body = await res.json().catch(() => null);
    assert.equal(res.status, 403, `a case-sensitive gate must deny the checksummed admin; got ${res.status} ${JSON.stringify(body)}`);

    // …and the shipped handler still admits that same admin through the same engine.
    const shipped = await call(SESSION_ID, { env: mixedCaseEngine().env });
    assert.equal(shipped.status, 200, 'the shipped handler must keep admitting that admin');
  } finally {
    unlinkSync(mutantPath);
  }
});
