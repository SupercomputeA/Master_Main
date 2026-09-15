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
