// tests/api/subscribers-admin.test.js — SEC-F1d (card t_30f803f0).
//
// `admin_wallets` has FOUR deployed readers that authorize. SEC-F1c converged three of them
// on one statement:
//
//     SELECT role FROM admin_wallets WHERE lower(wallet_address) = ?
//
//     functions/api/auth/login.js           ✅
//     functions/api/auth.js                 ✅
//     functions/api/social/[[catchall]].js  ✅
//     functions/api/subscribers.js          ❌ this card — it still sent `wallet_address = ?`
//
// Why the difference is a defect and not a style choice: a LIVE prod `admin_wallets` row is
// stored checksummed (0xe7A3Ed04F24b6482b4490ae06641Be4e4305Df34) while
// `sessions.wallet_address` is always a lowercase 0x address (login.js lowercases before the
// session INSERT and `getSessionWallet` lowercases on read). A byte-exact comparison
// therefore misses that admin on THIS route while the other three readers admit them — the
// same row, two different answers, depending on which route you hit.
//
// WHY THESE TESTS DRIVE A REAL ENGINE
// -----------------------------------
// A JS-side mock resolves rows itself, so it compares case-insensitively for EVERY SQL shape
// the handler sends: reverting this route to `wallet_address = ?` leaves a mock-driven suite
// fully green (that is exactly how the divergence survived SEC-F1b and SEC-F1c). The guard
// has to be the SQL text against a real engine, so these tests drive the REAL handler over
// `node:sqlite` (the engine D1 runs) with the REAL production DDL — `schema.sql` plus every
// `migrations/*.sql`, because `schema.sql` alone lacks tables the sibling suites need.
// `node:sqlite` needs Node 22.5+; CI pins Node 24 (same as status-enum-migration.test.mjs).
//
// The last test is the executable half of this card's decision record: the legacy standalone
// worker copy (`src/api/auth.js` / `src/worker.js`) is NOT on any deploy path, so it is left
// byte-exact on purpose, and the test fails loudly if anyone ever wires it into a deploy
// without re-deciding that. See the card comment / PR body for the full rationale.

import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { readFileSync, writeFileSync, unlinkSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { DatabaseSync } from 'node:sqlite';
import { onRequest } from '../../functions/api/subscribers.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(HERE, '../..');
const HANDLER_PATH = path.join(REPO_ROOT, 'functions/api/subscribers.js');

// The one statement every authorizing reader of `admin_wallets` sends.
const ADMIN_SQL = 'SELECT role FROM admin_wallets WHERE lower(wallet_address) = ?';

// The live prod row, stored checksummed (SEC-F1b receipt; absent from seed-admin.sql, which
// is a backfill and not a picture of the table).
const MIXED_CASE_ADDR = '0xe7A3Ed04F24b6482b4490ae06641Be4e4305Df34';
// A lowercase address row, as seed-admin.sql writes them.
const ADMIN_ADDR = '0x1a828cd220559479e2f761805da4ee722683323b';
const RANDO_ADDR = '0x9999999999999999999999999999999999999999';

const SESSION_ID = 'sess_subscribers_f1d';
const EXPIRED_SESSION_ID = 'sess_subscribers_f1d_expired';
const future = () => Math.floor(Date.now() / 1000) + 3600;

// ── real engine over the real production DDL ──────────────────────────────

const SCHEMA_SQL = readFileSync(path.join(REPO_ROOT, 'schema.sql'), 'utf8');
const MIGRATION_FILES = readdirSync(path.join(REPO_ROOT, 'migrations'))
  .filter((f) => f.endsWith('.sql'))
  .sort()
  .map((f) => readFileSync(path.join(REPO_ROOT, 'migrations', f), 'utf8'));

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
  db.prepare('INSERT INTO admin_wallets (id, wallet_address, role) VALUES (?, ?, ?)')
    .run(`aw_${wallet.slice(-6)}`, wallet, 'admin');
const seedSession = (db, id, wallet, expiresAt) =>
  db.prepare('INSERT INTO sessions (id, wallet_address, expires_at) VALUES (?, ?, ?)')
    .run(id, wallet, expiresAt);

/** The checksummed admin row + the lowercase session wallet that names it. */
function mixedCaseEngine() {
  const db = realDb();
  seedAdmin(db, MIXED_CASE_ADDR);
  seedSession(db, SESSION_ID, MIXED_CASE_ADDR.toLowerCase(), future());
  return { db, env: envOver(db) };
}

async function call(env, sessionId, { pathname = '/api/subscribers', method = 'GET' } = {}) {
  const headers = { Origin: 'https://supercompute.io' };
  if (sessionId) headers.Authorization = `Bearer ${sessionId}`;
  const res = await onRequest({
    request: new Request(`https://supercompute.io${pathname}`, { method, headers }),
    env,
  });
  const body = await res.json().catch(() => null);
  return { status: res.status, body };
}

// ── the fix: the checksummed admin row is admitted here too ───────────────

test('[real engine] /api/subscribers admits an admin whose row is stored checksummed', async () => {
  const { db, env } = mixedCaseEngine();
  // The property the whole card rests on: the session carries the lowercase form.
  const sessionWallet = db.prepare('SELECT wallet_address FROM sessions WHERE id = ?').get(SESSION_ID).wallet_address;
  assert.equal(sessionWallet, MIXED_CASE_ADDR.toLowerCase(), 'sessions.wallet_address is always lowercase — that is why the compare must be too');

  const { status, body } = await call(env, SESSION_ID);
  assert.equal(
    status, 200,
    `lower(wallet_address) = ? must match the checksummed row; got ${status} ${JSON.stringify(body)}`,
  );
  assert.ok(body && typeof body.tiers === 'object', `the stats payload must come back; got ${JSON.stringify(body)}`);
  assert.equal(body.error, undefined, 'no admin-only denial');
});

test('[real engine] the byte-exact form of that lookup MISSES the row — so the test above is load-bearing', async () => {
  const { db } = mixedCaseEngine();
  const lowercased = MIXED_CASE_ADDR.toLowerCase();
  const insensitive = db.prepare('SELECT role FROM admin_wallets WHERE lower(wallet_address) = ?').get(lowercased);
  const sensitive = db.prepare('SELECT role FROM admin_wallets WHERE wallet_address = ?').get(lowercased);
  assert.equal(insensitive?.role, 'admin', 'the lower() form matches');
  assert.equal(sensitive, undefined, 'plain wallet_address = ? misses it — the property this route must keep');
});

test('[real engine] the change is not a loosening: a non-admin session still gets 403', async () => {
  const db = realDb();
  seedAdmin(db, MIXED_CASE_ADDR);
  seedSession(db, SESSION_ID, RANDO_ADDR, future());
  const { status, body } = await call(envOver(db), SESSION_ID);
  assert.equal(status, 403, `a wallet with no admin_wallets row must stay denied; got ${status} ${JSON.stringify(body)}`);
  assert.match(String(body?.error || ''), /admin/);
});

test('[real engine] no session, and an expired session, are denied', async () => {
  const db = realDb();
  seedAdmin(db, MIXED_CASE_ADDR);
  seedSession(db, EXPIRED_SESSION_ID, MIXED_CASE_ADDR.toLowerCase(), Math.floor(Date.now() / 1000) - 60);

  const anon = await call(envOver(db), null);
  assert.equal(anon.status, 403, 'no Authorization header ⇒ denied');

  const expired = await call(envOver(db), EXPIRED_SESSION_ID);
  assert.equal(expired.status, 403, 'an expired session for a real admin row ⇒ denied');
});

test('[real engine] a lowercase admin row keeps working (the seed-admin.sql form)', async () => {
  const db = realDb();
  seedAdmin(db, ADMIN_ADDR);
  seedSession(db, SESSION_ID, ADMIN_ADDR, future());
  const { status } = await call(envOver(db), SESSION_ID);
  assert.equal(status, 200, 'the convergence must not break the ordinary lowercase row');
});

// ── mutation self-check: the guard bites in both directions ──────────────

test('[real engine] MUTATION SELF-CHECK: reverting this route to byte-exact 403s that admin again', async () => {
  // Fails if the mutation stops applying (the SQL text moved and this guard needs updating)
  // and fails if a reverted route is admitted. The mutant is written OUT of tree, with its
  // three relative imports rewritten to absolute file URLs so it resolves from os.tmpdir().
  const src = readFileSync(HANDLER_PATH, 'utf8');
  const authUrl = pathToFileURL(path.join(REPO_ROOT, 'functions/api/auth.js')).href;
  const tiersUrl = pathToFileURL(path.join(REPO_ROOT, 'lib/tiers.js')).href;
  const corsUrl = pathToFileURL(path.join(REPO_ROOT, 'functions/_shared/cors.js')).href;
  const mutant = src
    .replace("from './auth.js'", `from '${authUrl}'`)
    .replace("from '../../lib/tiers.js'", `from '${tiersUrl}'`)
    .replace("from '../_shared/cors.js'", `from '${corsUrl}'`)
    .replace(ADMIN_SQL, 'SELECT role FROM admin_wallets WHERE wallet_address = ?');

  assert.notEqual(mutant, src, 'the mutation must apply — the handler imports or the admin SQL text changed');
  assert.ok(mutant.includes('SELECT role FROM admin_wallets WHERE wallet_address = ?'), 'the mutant must carry the byte-exact form');
  assert.ok(!mutant.includes(ADMIN_SQL), 'the mutant must not keep the converged statement');

  const mutantPath = path.join(os.tmpdir(), `secf1d-mutant-${process.pid}-${Date.now()}.mjs`);
  writeFileSync(mutantPath, mutant);
  try {
    const { onRequest: mutantHandler } = await import(pathToFileURL(mutantPath).href);
    const { env } = mixedCaseEngine();
    const res = await mutantHandler({
      request: new Request('https://supercompute.io/api/subscribers', {
        headers: { Origin: 'https://supercompute.io', Authorization: `Bearer ${SESSION_ID}` },
      }),
      env,
    });
    const body = await res.json().catch(() => null);
    assert.equal(
      res.status, 403,
      `a byte-exact read must deny the checksummed admin; got ${res.status} ${JSON.stringify(body)}`,
    );

    // …and the shipped handler still admits that same admin through the same engine.
    const shipped = await call(mixedCaseEngine().env, SESSION_ID);
    assert.equal(shipped.status, 200, 'the shipped handler must keep admitting that admin');
  } finally {
    unlinkSync(mutantPath);
  }
});

// ── the class, not the instance: every reader sends one statement ────────

test('every deployed reader of admin_wallets that authorizes sends the SAME statement', () => {
  // Discovered by walking `functions/`, not from a hardcoded list: a NEW reader that sends
  // its own shape fails here, which is the class that produced SEC-F1b, SEC-F1c and this card.
  const readers = [];
  const walk = (dir) => {
    for (const entry of readdirSync(dir)) {
      const full = path.join(dir, entry);
      if (statSync(full).isDirectory()) { walk(full); continue; }
      if (!entry.endsWith('.js')) continue;
      const code = readFileSync(full, 'utf8');
      for (const m of code.match(/SELECT role FROM admin_wallets[^'"`\n]*/g) || []) {
        readers.push({ file: path.relative(REPO_ROOT, full), sql: m.trim() });
      }
    }
  };
  walk(path.join(REPO_ROOT, 'functions'));

  const files = readers.map((r) => r.file).sort();
  assert.deepEqual(
    files,
    [
      'functions/api/auth.js',
      'functions/api/auth/login.js',
      'functions/api/social/[[catchall]].js',
      'functions/api/subscribers.js',
    ],
    'exactly these four deployed readers authorize from admin_wallets — a new/changed reader must be reviewed here',
  );
  for (const r of readers) {
    assert.equal(r.sql, ADMIN_SQL, `${r.file} must send the converged statement, not its own shape`);
  }
  assert.equal(
    readers.filter((r) => /wallet_address\s*=/.test(r.sql)).length, 0,
    'no deployed reader may authorize with a byte-exact wallet_address compare',
  );
});

// ── the decision record: the legacy worker copy is dead, and stays dead ───

test('the legacy standalone worker (src/worker.js + src/api/auth.js) is on NO deploy path', () => {
  const workflows = readdirSync(path.join(REPO_ROOT, '.github/workflows'))
    .filter((f) => f.endsWith('.yml') || f.endsWith('.yaml'))
    .map((f) => ({ file: f, body: readFileSync(path.join(REPO_ROOT, '.github/workflows', f), 'utf8') }));

  for (const { file, body } of workflows) {
    // Comments stripped first: the SEC-F1d step's own prose names `src/worker.js` to record
    // why it is dead, and a guard that fires on the explanation is a guard nobody can keep.
    const code = body.split('\n').map((line) => line.replace(/#.*$/, '')).join('\n');
    assert.ok(
      !/src\/worker\.js|src\/api\/|dist\/worker\.js|npm run build/.test(code),
      `.github/workflows/${file} would put the legacy worker on a deploy path — re-decide src/api/auth.js (it authorizes byte-exact) before wiring it up`,
    );
  }

  // What actually ships: Pages Functions (copied into the deploy root) and the static export.
  const ci = workflows.find((w) => w.file === 'ci-cd.yml');
  assert.ok(ci, 'ci-cd.yml must exist');
  assert.match(ci.body, /cp -r functions/, 'the deploy lane ships `functions/` — that is the live API surface');

  // `wrangler deploy` publishes a Worker only when the config names a `main`; the Pages
  // config has none, so the esbuild bundle in package.json's `build` script goes nowhere.
  const wrangler = readFileSync(path.join(REPO_ROOT, 'wrangler.toml'), 'utf8');
  assert.match(wrangler, /pages_build_output_dir\s*=\s*"out"/, 'this project is a Pages project');
  assert.ok(!/^\s*main\s*=/m.test(wrangler), 'no `main` in wrangler.toml — nothing bundles src/worker.js into a deploy');

  // First-party confirmation of the same claim: live /api/auth answers with the Pages
  // Function's endpoint list, not the legacy worker's. Recorded, not asserted (no network
  // in this suite): functions/api/auth.js:218 says 'POST /api/auth/login': 'Sign in with
  // wallet'; src/api/auth.js:342 says 'Verify signature, get session token'.
  const legacy = readFileSync(path.join(REPO_ROOT, 'src/api/auth.js'), 'utf8');
  assert.match(legacy, /Verify signature, get session token/, 'the legacy copy still carries its own endpoint string');
});
