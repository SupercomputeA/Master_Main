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
//
// SEC-F1b (card t_f750de01) adds two things at the bottom of this file:
//   3. item 2 — a D1 failure on the session read must answer JSON, not the HTML 500 the
//      Pages runtime renders from a throw (the "non-JSON 500" class), with a mutation
//      self-check that the guard is what does it;
//   4. item 1 — the option-(a) decision, executable: this gate does NOT resolve ENS, so an
//      ENS-named `admin_wallets` row grants nothing here; the grant for a name's owner is
//      its ADDRESS row, and `seed-admin.sql` is the audited backfill that carries them.

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
  SUPERCOMPUTE_ETH_ADDR, ORAMI_ETH_ADDR,
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

// ══════════════════════════════════════════════════════════════════════════
// SEC-F1b item 2 — a D1 failure on the SESSION read must answer JSON, never an
// HTML 500 page.
//
// `requireAdmin`'s session lookup is the first DB touch on every gated request and it
// used to be unguarded, unlike the canonical verifySession (functions/api/auth.js
// :147-154). A D1 error there escaped as a throw, and the Pages runtime renders a thrown
// Function as an HTML error page — so `res.json()` threw in every client and the operator
// saw a parse error instead of a denial. Reproduced against a D1 with no tables:
//   GET /api/social/health -H "Authorization: Bearer <bogus>"  →  500 HTML
// The assertions below fail on that page specifically, not merely on the status code:
// making it a JSON 500 is the fix, and 500-not-401 is deliberate — the session may be
// valid, we could not check it, and a 401 would log the operator out. Note the body shape
// differs by runtime and both are caught: in prod the Pages runtime renders a thrown
// Function as an HTML page, while `wrangler pages dev` answered `text/plain` with the D1
// error AND a full stack trace (verified on the pre-fix handler, 2026-09-14) — the
// content-type assertion and the `JSON.parse` below both reject it.
// ══════════════════════════════════════════════════════════════════════════

const CORS_IMPORT = 'from "../../_shared/cors-origins.js"';
const CORS_IMPORT_URL = `from "${pathToFileURL(path.resolve(HERE, '../../functions/_shared/cors-origins.js')).href}"`;

/** Run `fn` against a copy of the real handler with `replacements` applied, out of tree. */
async function withMutant(replacements, fn) {
  const src = readFileSync(HANDLER_PATH, 'utf8');
  let mutant = src.replace(CORS_IMPORT, CORS_IMPORT_URL);
  for (const [from, to] of replacements) mutant = mutant.replace(from, to);
  assert.notEqual(mutant, src, 'the mutation must apply — the source moved, so update this guard');
  const p = path.join(os.tmpdir(), `secf1b-mutant-${process.pid}-${Date.now()}-${Math.random().toString(36).slice(2)}.mjs`);
  writeFileSync(p, mutant);
  try {
    const { onRequest: mutantHandler } = await import(pathToFileURL(p).href);
    return await fn(mutantHandler);
  } finally {
    unlinkSync(p);
  }
}

/** Assert a response is a JSON fail-closed answer, not the HTML page from the finding. */
async function assertJsonFailClosed(res, { label = '' } = {}) {
  const raw = await res.text();
  assert.ok(
    !raw.trimStart().startsWith('<'),
    `${label}body must not be an HTML error page (a client's res.json() throws on it); got ${raw.slice(0, 120)}`,
  );
  assert.match(
    res.headers.get('content-type') || '',
    /application\/json/,
    `${label}a failed gate must still answer JSON`,
  );
  const body = JSON.parse(raw); // throws here if this is the HTML 500 page
  assert.ok(res.status >= 500, `${label}we could not verify the session, so say so; got ${res.status}`);
  assert.equal(body.wallet, undefined, `${label}a failed session check must not authorize anything`);
  assert.match(String(body.error || ''), /session/i, `${label}the body must name the failure`);
  return body;
}

test('SEC-F1b: a D1 failure on the session read ⇒ JSON fail-closed, not an HTML 500', async () => {
  const env = makeSocialEnv({
    failSessionLookup: true,
    admins: [{ wallet: ADMIN_ADDR, role: 'admin' }],
    sessions: new Map([[SESSION_ID, { wallet_address: ADMIN_ADDR, expires_at: future() }]]),
  });
  const res = await onRequest({ request: socialRequest(SESSION_ID), env });
  await assertJsonFailClosed(res, { label: 'session-read failure: ' });
  assert.equal(res.status, 500, 'the storage layer failed, so 500 — but a JSON one');
});

test('[real engine] the repro itself: a D1 with no tables answers JSON, not the HTML 500', async () => {
  // Exactly the card's repro — no schema applied, so the session query throws
  // `no such table: sessions` the way a broken/unmigrated D1 does — but through the REAL
  // handler rather than a mock, so the shape of the answer is the shipped one.
  const db = new DatabaseSync(':memory:');
  const res = await onRequest({ request: socialRequest('bogus-token'), env: envOver(db) });
  const body = await assertJsonFailClosed(res, { label: 'unmigrated D1: ' });
  assert.match(String(body.error), /unavailable/);
});

test('SEC-F1b MUTATION SELF-CHECK: with the guard removed the same failure escapes as a throw', async () => {
  // Both directions, in one test: the shipped handler converts the D1 error into a JSON
  // answer, the mutant lets it escape — and an escaping throw is precisely what the Pages
  // runtime renders as the HTML 500 in the finding. If the guard text moves, the mutation
  // stops applying and `withMutant` fails loudly instead of passing vacuously.
  const shipped = await onRequest({
    request: socialRequest(SESSION_ID),
    env: makeSocialEnv({ failSessionLookup: true }),
  });
  assert.equal(shipped.status, 500);
  assert.match(shipped.headers.get('content-type') || '', /application\/json/);

  await withMutant(
    [['return { error: "session check unavailable", status: 500 }', 'throw new Error("sec-f1b: session guard removed")']],
    async (mutantHandler) => {
      await assert.rejects(
        () => mutantHandler({ request: socialRequest(SESSION_ID), env: makeSocialEnv({ failSessionLookup: true }) }),
        /sec-f1b: session guard removed/,
        'without the guard the D1 error must escape the handler — that escape is the HTML 500 page',
      );
    },
  );
});

// ══════════════════════════════════════════════════════════════════════════
// SEC-F1b item 1 — ENS-named `admin_wallets` rows, decided as OPTION (a):
// address rows, not an ENS-aware gate.
//
// The finding: login.js's isAdmin() bridges an ADDRESS signer to an admin ENS row
// (ADMIN_ENS_NAMES = supercompute.eth / orami.eth), so that wallet gets role='admin' at
// login and the admin UI — while this gate, matching `lower(wallet_address) = ?` against a
// session wallet that is always a 0x address, denies it 403. Left alone, the ops room
// renders and every call inside it 403s.
//
// Why (a) and not (b) ("make the gate ENS-aware like login.js"):
//   * (b) puts 2–3 mainnet eth_calls on the DENY path — an amplifier any authenticated
//     non-admin can pull at will — and couples admin availability to third-party RPC
//     health: with the RPCs down, the very admins (b) protects get 403.
//   * (b) makes authorization follow mutable name ownership: whoever receives the name
//     becomes admin with no change to `admin_wallets`, which destroys the property SEC-F1
//     established (one table, fresh read, revocable by deleting a row).
//   * (a) keeps the gate strict and cheap, and does not widen the admin set: the ENS rows
//     ALREADY grant these addresses admin at login. It only makes the two gates agree.
// The tests below pin both halves: an ENS-named row alone grants nothing here, and the
// same owner is admitted the moment its address row exists. That address row is carried by
// `seed-admin.sql` (the audited backfill — see the last test), not by a migration: a grant
// that is re-applied on every deploy could not be revoked by deleting the row.
// ══════════════════════════════════════════════════════════════════════════

const SEED_SQL = readFileSync(path.join(REPO_ROOT, 'seed-admin.sql'), 'utf8');

// The live prod state this backfill has to be additive on top of, read from remote D1 on
// 2026-09-14 (implementer-verified with a D1-scoped token; see the card). Five rows: three
// ENS names, one checksummed address, one lowercase address.
const LIVE_ADMIN_WALLETS = [
  ['0b16f071533d382c6732b673d887d2d3', 'orami.eth'],
  ['2260fe92238038d828376a7f8ccfdf86', 'supercompute.eth'],
  ['41ffe0547bd35d5f42a8c3fc25fb6fc3', 'orami.base'],
  ['78b3030f87c5d4642cc063f9e0517231', MIXED_CASE_ADDR],
  ['admin_003', ADMIN_ADDR],
];

test('SEC-F1b [item 1 (a)]: an ENS-named admin_wallets row alone is NOT admin here', async () => {
  const env = makeSocialEnv({
    admins: [{ wallet: 'orami.eth', role: 'admin' }],
    sessions: new Map([[SESSION_ID, { wallet_address: ORAMI_ETH_ADDR, expires_at: future() }]]),
  });
  const { status } = await call(SESSION_ID, { env });
  assert.equal(status, 403, 'the gate resolves no ENS on the request path — that is the decision, not an oversight');
});

test('SEC-F1b [item 1 (a)]: the same owner IS admitted once admin_wallets carries its address row', async () => {
  for (const addr of [ORAMI_ETH_ADDR, SUPERCOMPUTE_ETH_ADDR]) {
    const env = makeSocialEnv({
      admins: [{ wallet: addr, role: 'admin' }],
      sessions: new Map([[SESSION_ID, { wallet_address: addr, expires_at: future() }]]),
    });
    const { status } = await call(SESSION_ID, { env });
    assert.equal(status, 200, `${addr} is login-bridged to an admin ENS row, so the gate must admit it once the row exists`);
  }
});

test('[real engine] seed-admin.sql gives every ENS-named admin row its address row, additively and idempotently', async () => {
  const db = realDb();
  for (const [id, wallet] of LIVE_ADMIN_WALLETS) {
    db.prepare('INSERT OR IGNORE INTO admin_wallets (id, wallet_address, role) VALUES (?, ?, ?)').run(id, wallet, 'admin');
  }
  const rows = () => db.prepare('SELECT wallet_address FROM admin_wallets ORDER BY wallet_address').all().map((r) => r.wallet_address);
  const before = rows();
  assert.ok(!before.includes(SUPERCOMPUTE_ETH_ADDR) && !before.includes(ORAMI_ETH_ADDR), 'precondition: the fixture starts uncovered');
  assert.equal(before.length, 5, 'precondition: the fixture is the 5 live rows');

  db.exec(SEED_SQL);
  const after = rows();
  for (const holder of [SUPERCOMPUTE_ETH_ADDR, ORAMI_ETH_ADDR]) {
    assert.ok(after.includes(holder), `the ENS holder ${holder} must have an address row after the backfill`);
  }
  assert.equal(after.length, 7, 'the backfill adds exactly the two address rows and rewrites nothing');
  for (const w of LIVE_ADMIN_WALLETS.map(([, w]) => w)) {
    assert.ok(after.includes(w), `the backfill must not drop the existing row ${w}`);
  }

  // Idempotent: the deploy lane re-runs seed files by hand and agents re-apply this file.
  db.exec(SEED_SQL);
  assert.deepEqual(rows(), after, 're-applying seed-admin.sql must be a no-op');

  // …and the gate now agrees with login.js's bridge, on the real engine, while still
  // denying a wallet that is not in admin_wallets at all.
  const env = envOver(db);
  for (const holder of [SUPERCOMPUTE_ETH_ADDR, ORAMI_ETH_ADDR]) {
    seedSession(db, `sess_${holder.slice(2, 8)}`, holder, future());
    const res = await call(`sess_${holder.slice(2, 8)}`, { env });
    assert.equal(res.status, 200, `${holder} is login-bridged to an admin ENS row; the gate must not lock it out`);
  }
  seedSession(db, 'sess_rando', RANDO_ADDR, future());
  const rando = await call('sess_rando', { env });
  assert.equal(rando.status, 403, 'the backfill must not widen the admin set');
});

// ══════════════════════════════════════════════════════════════════════════
// SEC-F1c (card t_df9c32a1) — the LOGIN reader: an ADDRESS row is the only grant.
//
// SEC-F1/F1b converged the /api/social/* gate on `lower(wallet_address) = ?` over ADDRESS
// rows and fixed the DATA (seed-admin.sql gives each ENS-named admin row its owner's address
// row). Neither closed the class, because login.js's isAdmin() still carried a bridge from an
// ADDRESS signer to an admin ENS row:
//
//   ADMIN_ENS_NAMES = ['supercompute.eth', 'orami.eth']   // resolved on every login
//   … signer address → resolve each name → if it matches, match the NAME row
//
// Written that way, ownership of a name is itself a standing admin grant: whoever holds the
// name at the moment of login gets role='admin' and the admin UI with no change to
// `admin_wallets` — and the only revocation this table has (DELETE the address row) does not
// reach a name the table does not own. Re-pointing a name would silently promote its new
// holder on their next sign-in. Decided as OPTION (a), the same decision as SEC-F1b, applied
// to the reader that was still name-aware:
//
//   * the principal is the ADDRESS ROW, one rule, the statement the gate already sends:
//     `SELECT role FROM admin_wallets WHERE lower(wallet_address) = ?` — and now the
//     statement functions/api/auth.js sends too, so three readers agree where four differed;
//   * name rows stay in `admin_wallets` as DOCUMENTATION (the audit trail: "this name is
//     administered by the address in its seed row"), never as a grant;
//   * no ENS resolution on any request path, and the auth lane no longer ships a resolver at
//     all. PR #103's reasons stand: 2–3 mainnet eth_calls on the DENY path is an amplifier any
//     authenticated non-admin can pull, it couples admin availability to third-party RPC
//     health, and it makes authorization follow mutable name ownership. The login path now
//     makes ZERO mainnet calls — asserted below.
//
// ── Correction recorded while proving this (2026-09-15, runtime evidence) ───
// The bridge was LATENT, NOT LIVE. The resolver the pre-fix login.js imported from
// '../auth.js' referenced `ADDR_SELECTOR` and `ENS_RESOLVER` without defining either (added
// in 897b0dc, "admin ENS login"—the constants exist only in the local copies in
// functions/api/web3/[[catchall]].js and functions/api/ens/[[action]].js), so it threw
// `ReferenceError: ADDR_SELECTOR is not defined` on every call and `isAdmin` swallowed it as
// `false`. Proved twice at runtime on 2026-09-15, before the fix:
//   * calling that resolver directly with a fetch stub installed threw before any fetch
//     (zero fetch calls); and
//   * a full signed login by a wallet with BOTH admin names re-pointed to it returned
//     role 'user' with zero mainnet calls.
// So no wallet was ever login-bridged by owning a name; the admin grant those owners have
// today came from the audited `seed-admin.sql` backfill (SEC-F1b). The decision is unchanged
// — the code removed here was the *only* thing that would have granted a name-holder admin
// had the two constants been defined, which is exactly the hazard: one line of glue away from
// a mutable authorization input. The mutant below makes that concrete: it restores the
// removed block WITH those constants, and grants admin.
//
// `functions/api/subscribers.js` is the fourth reader and is still byte-exact
// (`wallet_address = ?`), so the checksummed live row misses there. That is a case-handling
// difference on one route, not a name-grant path — tracked separately, not silently fixed.
//
// The tests below drive the REAL login handler over a REAL engine (`node:sqlite`, what D1
// runs) with a REAL signature, on the 5-row pre-backfill prod fixture from above.
// ══════════════════════════════════════════════════════════════════════════

const LOGIN_PATH = path.resolve(REPO_ROOT, 'functions/api/auth/login.js');
const AUTH_PATH = path.resolve(REPO_ROOT, 'functions/api/auth.js');
const LOGIN_SRC = readFileSync(LOGIN_PATH, 'utf8');
const AUTH_SRC = readFileSync(AUTH_PATH, 'utf8');
// The mutation below writes its mutant inside the tree, so it needs mkdir; the imports at the
// top of this file are left alone on purpose (appended-only hunks in a contended file).
import { mkdirSync } from 'node:fs';

const { onRequest: loginOnRequest } = await import(pathToFileURL(LOGIN_PATH).href);
const { isAdmin: canonicalIsAdmin } = await import(pathToFileURL(AUTH_PATH).href);
const { privateKeyToAccount } = await import('viem/accounts');
const { namehash: viemNamehash } = await import('viem/ens');

/**
 * A fresh wallet that holds NO admin_wallets row: "whoever now holds the name". It signs its
 * own logins, so the bridge is exercised for real instead of being talked about.
 */
const FRESH = privateKeyToAccount(`0x${'c1'.repeat(32)}`);
const FRESH_ADDR = FRESH.address.toLowerCase();

const countRows = (db, wallet) =>
  db.prepare('SELECT COUNT(*) AS c FROM admin_wallets WHERE lower(wallet_address) = ?').get(wallet).c;

/**
 * Assert on CODE, not on prose. The comments in these files legitimately NAME the removed
 * bridge (`ADMIN_ENS_NAMES`, `resolveENS`) to explain why it is gone — a raw-source assertion
 * would fire on the documentation and fail a correct file. This is the same reason the SQL
 * guards strip `--` comments.
 */
const codeOnly = (src) => src
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .split('\n')
  .filter((line) => !/^\s*\/\//.test(line))
  .join('\n');
const LOGIN_CODE = codeOnly(LOGIN_SRC);
const AUTH_CODE = codeOnly(AUTH_SRC);

/** The pre-backfill prod admin_wallets fixture: the rows read from remote D1 on 2026-09-14. */
function preBackfillDb() {
  const db = realDb();
  for (const [id, wallet] of LIVE_ADMIN_WALLETS) {
    db.prepare('INSERT OR IGNORE INTO admin_wallets (id, wallet_address, role) VALUES (?, ?, ?)').run(id, wallet, 'admin');
  }
  return db;
}

/** A real engine + a KV stand-in, in the shape login.js expects. */
function loginEnv(db, cache = new Map()) {
  return {
    ...envOver(db),
    CACHE: {
      get: async (k) => (cache.has(k) ? cache.get(k) : null),
      put: async (k, v) => { cache.set(k, v); },
      delete: async (k) => { cache.delete(k); },
    },
  };
}

/** The exact SIWE message /api/auth/message issues (login.js's content contract). */
function siweMessage(address, nonce) {
  return [
    'supercompute.io wants you to sign in with your Ethereum account.',
    '',
    'URI: https://supercompute.io',
    'Version: 1',
    'Chain ID: 8453',
    `Nonce: ${nonce}`,
    `Expiration Time: ${new Date(Date.now() + 10 * 60 * 1000).toISOString()}`,
    '',
    'Sign in to SUPERCOMPUTE Web3 Platform',
  ].join('\n');
}

/** The real login request, signed for real by `account`. */
async function signedLogin(handler, env, account, nonce) {
  const message = siweMessage(account.address, nonce);
  await env.CACHE.put(`siwe:msg:${nonce}`, message);
  const signature = await account.signMessage({ message });
  const res = await handler({
    request: new Request('https://supercompute.io/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Origin: 'https://supercompute.io' },
      body: JSON.stringify({ address: account.address, signature, nonce }),
    }),
    env,
  });
  return { status: res.status, body: await res.json().catch(() => null) };
}

/** A real signature over a real stored message, through the REAL login handler. */
const loginAs = (env, account, nonce) => signedLogin(loginOnRequest, env, account, nonce);

/**
 * Stand in for mainnet ENS: make `namesToAddresses` resolve as given, and count the eth_calls
 * it took. The eth_call `data` is `selector + namehash(name)`, so the answer is keyed on the
 * name the caller actually asked about — the same bytes a re-pointed name would answer with.
 */
async function withRepointedNames(namesToAddresses, fn) {
  const byNamehash = new Map(
    Object.entries(namesToAddresses).map(([name, addr]) => [viemNamehash(name).slice(2), addr]),
  );
  const origFetch = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (url, init) => {
    calls.push(String(url));
    const payload = JSON.parse(init?.body || '{}');
    const data = String(payload?.params?.[0]?.data || '');
    const owner = byNamehash.get(data.slice(10));
    return {
      ok: true,
      json: async () => (owner ? { result: `0x${'0'.repeat(24)}${owner.slice(2)}` } : { result: '0x' }),
    };
  };
  try {
    return await fn(calls);
  } finally {
    globalThis.fetch = origFetch;
  }
}

const ADMIN_NAMEHASH = {
  'supercompute.eth': viemNamehash('supercompute.eth').slice(2),
  'orami.eth': viemNamehash('orami.eth').slice(2),
};

/**
 * The removed grant path, restored in full: the pre-fix login.js block verbatim, plus the
 * resolver it imported — with the two constants ADDR_SELECTOR / ENS_RESOLVER that the shipped
 * copy never defined (which is why it never granted anything; see the header). "The block is
 * back AND works" is the mutation this suite has to catch.
 */
const WORKING_BRIDGE_BLOCK = `const ADMIN_QUERY = 'SELECT role FROM admin_wallets WHERE wallet_address = ? OR wallet_address = ?';
// ENS names seeded as admins. Resolving these to addresses lets a raw-address
// signer (e.g. wallet that owns supercompute.eth signing in with 0x5056...)
// still match the seed row.
const ADMIN_ENS_NAMES = ['supercompute.eth', 'orami.eth'];
const ENS_RESOLVER = '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e';
const ADDR_SELECTOR = '0178b8bf';
const NAMEHASH = ${JSON.stringify(ADMIN_NAMEHASH)};
async function resolveENS(addressOrName) {
  if (addressOrName.startsWith('0x') && addressOrName.length === 42) return addressOrName.toLowerCase();
  const data = '0x' + ADDR_SELECTOR + (NAMEHASH[addressOrName] || '');
  for (const rpc of ['https://ethereum-rpc.publicnode.com']) {
    try {
      const res = await fetch(rpc, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', method: 'eth_call', params: [{ to: ENS_RESOLVER, data }, 'latest'], id: 1 }),
      });
      const json = await res.json();
      const result = json.result || '0x';
      if (result !== '0x' && result.length === 66) return '0x' + result.slice(-40);
    } catch (e) { /* try next RPC */ }
  }
  return null;
}
async function isAdmin(env, wallet) {
  if (!env?.DB) return false;
  try {
    let resolved = wallet;
    if (!wallet.startsWith('0x')) {
      resolved = await resolveENS(wallet);
      if (!resolved) return false;
    } else {
      for (const ens of ADMIN_ENS_NAMES) {
        const addr = await resolveENS(ens).catch(() => null);
        if (addr && addr.toLowerCase() === wallet.toLowerCase()) {
          resolved = ens;
          break;
        }
      }
    }
    const r = await env.DB.prepare(ADMIN_QUERY)
      .bind(wallet.toLowerCase(), resolved.toLowerCase())
      .first();
    return r?.role === 'admin';
  } catch { return false; }
}`;

test('[real engine] SEC-F1c: the wallet an admin NAME resolves to is NOT admin at login — a name row is documentation, not a grant', async () => {
  const db = preBackfillDb();
  const env = loginEnv(db);
  // Preconditions: the name rows are there, the signer has no row of its own.
  assert.equal(countRows(db, 'supercompute.eth'), 1, 'fixture: the name row exists');
  assert.equal(countRows(db, FRESH_ADDR), 0, 'fixture: the signer holds no admin_wallets row');

  // The stale-grant setup in full: both admin names now resolve to this wallet, i.e. it holds
  // them. A bridge that honoured the name would return role='admin' here (the mutation test
  // below proves that is not a hypothetical).
  await withRepointedNames({ 'supercompute.eth': FRESH_ADDR, 'orami.eth': FRESH_ADDR }, async (rpcCalls) => {
    const { status, body } = await loginAs(env, FRESH, 'f1c1'.padEnd(64, '0'));
    assert.equal(status, 200, `login must still succeed (a non-admin can log in): ${JSON.stringify(body)}`);
    assert.equal(body.user.role, 'user', 'owning the name must not be an authorization input');
    assert.equal(
      rpcCalls.length, 0,
      `the login path must resolve nothing on any path; it made ${rpcCalls.length} mainnet call(s)`,
    );
  });
});

test('[real engine] SEC-F1c: that same wallet IS admin once its ADDRESS row exists, and DELETE revokes it', async () => {
  const db = preBackfillDb();
  const env = loginEnv(db);
  db.prepare('INSERT INTO admin_wallets (id, wallet_address, role) VALUES (?, ?, ?)').run('f1c_grant', FRESH_ADDR, 'admin');
  const granted = await loginAs(env, FRESH, 'f1c2'.padEnd(64, '0'));
  assert.equal(granted.status, 200, JSON.stringify(granted.body));
  assert.equal(granted.body.user.role, 'admin', 'the address row IS the grant');

  db.prepare('DELETE FROM admin_wallets WHERE wallet_address = ?').run(FRESH_ADDR);
  const revoked = await loginAs(env, FRESH, 'f1c3'.padEnd(64, '0'));
  assert.equal(revoked.status, 200, JSON.stringify(revoked.body));
  assert.equal(revoked.body.user.role, 'user', 'revocation is one DELETE, and it is sufficient: no name path routes around it');
});

test('SEC-F1c: the login reader sends the gate statement verbatim, and the auth lane ships no resolver at all', () => {
  assert.ok(LOGIN_CODE.includes(ADMIN_SQL), `login.js must send ${ADMIN_SQL}`);
  assert.ok(!LOGIN_CODE.includes('ADMIN_ENS_NAMES'), 'the ENS-grant bridge must not come back');
  assert.ok(!/\bresolveENS\s*\(/.test(LOGIN_CODE), 'no ENS resolution on the login path');
  assert.ok(AUTH_CODE.includes(ADMIN_SQL), 'auth.js must send the same statement');
  assert.ok(!AUTH_CODE.includes('ADMIN_ENS_NAMES'), 'auth.js must not carry the ENS bridge either');
  // The resolver the bridge depended on was removed from the auth lane outright, so restoring
  // the path takes a deliberate act, not a two-constant fix.
  assert.ok(!/resolveENS|namehash/.test(AUTH_CODE), 'the auth lane must not ship ENS resolution');
  // …and resolution itself is not gone from the repo: the two callers that resolve names on
  // purpose keep their own resolver with its own constants.
  for (const p of ['functions/api/ens/[[action]].js', 'functions/api/web3/[[catchall]].js']) {
    const src = readFileSync(path.join(REPO_ROOT, p), 'utf8');
    assert.match(src, /ADDR_SELECTOR\s*=/, `${p} keeps its own ADDR_SELECTOR definition`);
  }
});

test('[real engine] SEC-F1c MUTATION SELF-CHECK: restore the bridge (and the constants it assumed) and the SAME login is granted admin again', async () => {
  // Both directions in one test: the shipped handler denies, the mutant grants. If the bridge
  // text returns to login.js, the anchors below fail loudly instead of passing vacuously.
  const start = LOGIN_SRC.indexOf('// ── the admin principal');
  const end = LOGIN_SRC.indexOf('const RATE_LIMIT_MAX');
  assert.ok(start > 0 && end > start, 'the admin block anchors moved — update this guard');
  const shippedRegion = codeOnly(LOGIN_SRC.slice(start, end));
  assert.ok(shippedRegion.includes(ADMIN_SQL), 'the shipped block must be the address-only reader');
  assert.ok(!shippedRegion.includes('ADMIN_ENS_NAMES'), 'the shipped block must not carry the bridge');

  const mutantSrc = `${LOGIN_SRC.slice(0, start)}${WORKING_BRIDGE_BLOCK}${LOGIN_SRC.slice(end)}`
    .replace("from '../auth.js'", `from '${pathToFileURL(AUTH_PATH).href}'`);
  assert.notEqual(mutantSrc, LOGIN_SRC, 'the mutation must apply — the source moved, so update this guard');

  // The mutant has to live INSIDE the tree (a gitignored scratch dir): login.js imports
  // `viem/utils`, and a copy in os.tmpdir() cannot resolve a package import at all — the
  // sibling mutant in this file gets away with it because the social handler imports nothing
  // outside the tree. Removed in the `finally` below either way.
  const mutantDir = path.join(REPO_ROOT, '.wrangler', 'mutants');
  mkdirSync(mutantDir, { recursive: true });
  const mutantPath = path.join(mutantDir, `secf1c-mutant-${process.pid}-${Date.now()}.mjs`);
  writeFileSync(mutantPath, mutantSrc);
  try {
    const { onRequest: mutantLogin } = await import(pathToFileURL(mutantPath).href);
    await withRepointedNames({ 'supercompute.eth': FRESH_ADDR, 'orami.eth': FRESH_ADDR }, async (rpcCalls) => {
      const bridged = await signedLogin(mutantLogin, loginEnv(preBackfillDb()), FRESH, 'f1c4'.padEnd(64, '0'));
      assert.equal(bridged.status, 200, JSON.stringify(bridged.body));
      assert.equal(bridged.body?.user?.role, 'admin', 'without the fix the name bridge grants admin — that is the finding');
      assert.ok(rpcCalls.length > 0, 'the pre-fix path resolves mainnet ENS per login — the amplifier PR #103 rejected');
    });

    // …and the SHIPPED handler, same engine, same re-pointed names, same signature: no admin.
    await withRepointedNames({ 'supercompute.eth': FRESH_ADDR, 'orami.eth': FRESH_ADDR }, async (rpcCalls) => {
      const shipped = await loginAs(loginEnv(preBackfillDb()), FRESH, 'f1c5'.padEnd(64, '0'));
      assert.equal(shipped.body?.user?.role, 'user', 'the shipped handler must not bridge the name');
      assert.equal(rpcCalls.length, 0, 'and it must not go looking for one either');
    });
  } finally {
    unlinkSync(mutantPath);
  }
});

test('[real engine] SEC-F1c: the canonical reader (auth.js isAdmin) applies the same rule — checksummed row matches, a name is never a grant', async () => {
  const db = preBackfillDb();
  const env = envOver(db);
  // Converged with login and the gate: a row stored checksummed (the live 0xe7A3Ed04… row) is
  // found by the lowercase address every session carries. Byte-exact missed it.
  assert.equal(
    await canonicalIsAdmin(env, MIXED_CASE_ADDR.toLowerCase()), true,
    'lower(wallet_address) = ? must match the checksummed prod row — auth.js used to miss it while login and the gate matched',
  );
  assert.equal(await canonicalIsAdmin(env, FRESH_ADDR), false, 'not in the table ⇒ not an admin');
  db.prepare('INSERT INTO admin_wallets (id, wallet_address, role) VALUES (?, ?, ?)').run('f1c_name', 'repointed.eth', 'admin');
  await withRepointedNames({ 'repointed.eth': FRESH_ADDR }, async (rpcCalls) => {
    assert.equal(
      await canonicalIsAdmin(env, FRESH_ADDR), false,
      'a name row does not resolve its holder into admin in this reader either',
    );
    assert.equal(rpcCalls.length, 0, 'auth.js must not reach for ENS either');
  });
});

test('SEC-F1c: a NAME cannot reach any admin lookup at all — the login principal is validated as a 0x address first', async () => {
  // This is what makes a bare `lower(wallet_address) = ?` safe in all three readers: the
  // principal is ALWAYS a lowercase 0x address. `sessions.wallet_address` is written from the
  // validated address (login.js:120-121), so even a row whose TEXT is a name can never match a
  // session. (Control, not a detector: true before and after the fix — isValidAddress has
  // always run first. It is pinned so nobody "fixes" the lookup to accept a name later.)
  const db = preBackfillDb();
  const env = loginEnv(db);
  assert.equal(countRows(db, 'orami.eth'), 1, 'fixture: a row with that exact text exists');
  const nonce = 'f1c6'.padEnd(64, '0');
  const message = siweMessage('orami.eth', nonce);
  await env.CACHE.put(`siwe:msg:${nonce}`, message);
  const signature = await FRESH.signMessage({ message });
  const res = await loginOnRequest({
    request: new Request('https://supercompute.io/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Origin: 'https://supercompute.io' },
      body: JSON.stringify({ address: 'orami.eth', signature, nonce }),
    }),
    env,
  });
  assert.equal(res.status, 400, 'a name is not an address: refused before any admin_wallets lookup');
});
