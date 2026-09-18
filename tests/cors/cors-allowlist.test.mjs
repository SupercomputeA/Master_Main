/**
 * tests/cors/cors-allowlist.test.mjs — SEC-F4 (card t_492fdb5b).
 *
 * Before this suite existed, 17 Pages Functions each carried their own copy of
 * `allowedOrigin()` / `corsHeaders()` and the copies had drifted into
 * "echo the request's own origin if its host ends with .pages.dev,
 *  .cloudflarestaging.com or .ngrok-free.app, or is localhost / 127.0.0.1".
 * Security measured it live against the mutating admin endpoint
 * /api/subscribers/admin/expire-sweep: every one of those attacker-registrable
 * origins came back verbatim in Access-Control-Allow-Origin.
 *
 * Three sections, because "fix every copy" needs all three:
 *
 *   1. BEHAVIOUR — the one resolver (functions/_shared/cors.js) must echo only an
 *      exact origin from env.CORS_ORIGIN and answer everything else with the
 *      production fallback. The origin table is the live-measured attack set from
 *      registry/pr98-preview-lane-review-2026-09-14.md §SEC-98-1, verbatim.
 *   2. EVERY ROUTE — all 17 handlers are imported and driven with the forged
 *      origins. A green resolver behind one un-migrated handler is the whole
 *      defect, so the migration is asserted per route, not per helper.
 *   3. SOURCE GUARD — the invariants that keep copy #18 from appearing. Each
 *      check is a pure function over a {path: source} map, so it can be run
 *      against the real tree AND against defect fixtures; a guard that cannot be
 *      shown to go red is not a guard (same discipline as
 *      tests/headers/assert-headers.test.mjs).
 *
 * Run:  node --test tests/cors/cors-allowlist.test.mjs
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  FALLBACK_ORIGIN,
  DEV_ORIGINS,
  allowedOrigins,
  corsHeaders,
  corsHeadersFor,
  corsOrigin,
  primaryOrigin,
} from '../../functions/_shared/cors.js';

const REPO = fileURLToPath(new URL('../../', import.meta.url));
const FUNCTIONS_DIR = join(REPO, 'functions');
const SHARED_MODULE = 'functions/_shared/cors.js';

/** Production is whatever wrangler.toml [vars] declares. */
const PROD_ENV = { CORS_ORIGIN: 'https://supercompute.io' };
const ALLOWED = 'https://supercompute.io';

/** The live-measured attack set (registry/pr98-preview-lane-review-2026-09-14.md §SEC-98-1). */
const FORGED_ORIGINS = [
  'https://definitely-not-ours-12345.pages.dev',
  'https://attacker.ngrok-free.app',
  'https://x.cloudflarestaging.com',
  'http://localhost:3000',
  'http://127.0.0.1:8080',
  'https://evil.example.com',
  // neighbours of the production origin that a prefix/suffix match would wave through
  'https://supercompute.pages.dev',
  'https://pr-98.supercompute.pages.dev',
  'https://supercompute.io.evil.com',
  'https://evil-supercompute.io',
  'https://staging.supercompute.io',
  'null',
];

/** Minimal request double: the resolver only ever calls request.headers.get('Origin'). */
const reqWith = (origin) => ({
  headers: { get: (name) => (String(name).toLowerCase() === 'origin' ? (origin ?? null) : null) },
});

// ─────────────────────────── 1. resolver behaviour ───────────────────────────

test('an exact CORS_ORIGIN origin is echoed', () => {
  assert.equal(corsOrigin(reqWith(ALLOWED), PROD_ENV), ALLOWED);
  assert.equal(corsOrigin(reqWith(ALLOWED.toUpperCase()), PROD_ENV), FALLBACK_ORIGIN, 'origin match is byte-exact, not case-folded');
});

test('a forged origin is never echoed — the 12-origin attack table', () => {
  for (const origin of FORGED_ORIGINS) {
    const got = corsOrigin(reqWith(origin), PROD_ENV);
    assert.notEqual(got, origin, `${origin} must not be reflected`);
    assert.equal(got, FALLBACK_ORIGIN, `${origin} must fall back to the production origin`);
  }
});

test('no origin containing pages.dev / ngrok / cloudflarestaging / localhost can ever be echoed', () => {
  const needles = ['pages.dev', 'ngrok-free.app', 'cloudflarestaging.com', 'localhost', '127.0.0.1'];
  for (const needle of needles) {
    for (const scheme of ['https://', 'http://']) {
      assert.equal(corsOrigin(reqWith(`${scheme}${needle}`), PROD_ENV), FALLBACK_ORIGIN, `${scheme}${needle} must not be reflected`);
      assert.equal(corsOrigin(reqWith(`${scheme}evil.${needle}`), PROD_ENV), FALLBACK_ORIGIN);
      assert.equal(corsOrigin(reqWith(`${scheme}evil-${needle}.x.com`), PROD_ENV), FALLBACK_ORIGIN);
    }
  }
});

test('a request with no Origin gets the primary origin, never an empty ACAO', () => {
  assert.equal(corsOrigin(reqWith(null), PROD_ENV), ALLOWED);
  assert.equal(corsOrigin(reqWith(''), PROD_ENV), ALLOWED);
  assert.equal(corsOrigin({}, PROD_ENV), ALLOWED, 'a request double with no headers must not throw');
  assert.equal(corsOrigin(undefined, PROD_ENV), ALLOWED);
});

test('CORS_ORIGIN is the source of truth: an override wins and the old origin no longer matches', () => {
  const staging = { CORS_ORIGIN: 'https://staging.supercompute.io' };
  assert.equal(corsOrigin(reqWith('https://staging.supercompute.io'), staging), 'https://staging.supercompute.io');
  assert.equal(corsOrigin(reqWith(ALLOWED), staging), 'https://staging.supercompute.io', 'the hardcoded default must not survive an override');
});

test('a comma-separated CORS_ORIGIN allowlists each origin exactly', () => {
  const env = { CORS_ORIGIN: 'https://supercompute.io, https://staging.supercompute.io' };
  assert.deepEqual([...allowedOrigins(env)].sort(), ['https://staging.supercompute.io', 'https://supercompute.io']);
  assert.equal(corsOrigin(reqWith('https://staging.supercompute.io'), env), 'https://staging.supercompute.io');
  assert.equal(corsOrigin(reqWith('https://pr-98.supercompute.pages.dev'), env), ALLOWED, 'fallback is the first configured origin');
  assert.equal(primaryOrigin(env), ALLOWED);
});

test('an unset/blank CORS_ORIGIN falls back to the production origin (never to a wildcard)', () => {
  for (const env of [{}, { CORS_ORIGIN: '' }, { CORS_ORIGIN: '   ' }, undefined]) {
    assert.deepEqual([...allowedOrigins(env)], [FALLBACK_ORIGIN]);
    assert.equal(corsOrigin(reqWith('https://anything.example'), env), FALLBACK_ORIGIN);
  }
});

test('dev origins are opt-in per deployment and are absent from the production set', () => {
  const prod = allowedOrigins(PROD_ENV);
  for (const dev of DEV_ORIGINS) {
    assert.equal(prod.has(dev), false, `${dev} must not be in the production allowlist`);
    assert.equal(corsOrigin(reqWith(dev), PROD_ENV), FALLBACK_ORIGIN);
  }
  for (const flag of [true, 'true', '1']) {
    const devEnv = { ...PROD_ENV, ALLOW_DEV_ORIGINS: flag };
    for (const dev of DEV_ORIGINS) assert.equal(corsOrigin(reqWith(dev), devEnv), dev, `${dev} must be echoable with ALLOW_DEV_ORIGINS=${flag}`);
    assert.equal(corsOrigin(reqWith(ALLOWED), devEnv), ALLOWED, 'production stays allowed in a dev deployment');
  }
  for (const flag of [false, 'false', '0', '', undefined]) {
    assert.equal(corsOrigin(reqWith(DEV_ORIGINS[0]), { ...PROD_ENV, ALLOW_DEV_ORIGINS: flag }), FALLBACK_ORIGIN, `ALLOW_DEV_ORIGINS=${flag} must stay opt-out`);
  }
});

test('corsHeaders always carries Vary: Origin (shared-cache poisoning guard)', () => {
  const direct = corsHeaders(ALLOWED);
  assert.equal(direct['Vary'], 'Origin');
  assert.equal(direct['Access-Control-Allow-Origin'], ALLOWED);
  assert.equal(direct['Access-Control-Allow-Methods'], 'GET, POST, OPTIONS');
  assert.equal(direct['Access-Control-Allow-Headers'], 'Content-Type, Authorization');

  const viaRequest = corsHeadersFor(reqWith('https://attacker.ngrok-free.app'), PROD_ENV, { methods: 'POST, OPTIONS' });
  assert.equal(viaRequest['Vary'], 'Origin');
  assert.equal(viaRequest['Access-Control-Allow-Origin'], FALLBACK_ORIGIN);
  assert.equal(viaRequest['Access-Control-Allow-Methods'], 'POST, OPTIONS', 'per-route method overrides are honoured');

  assert.equal(corsHeaders('')['Access-Control-Allow-Origin'], FALLBACK_ORIGIN, 'an empty resolved origin falls back, never blank');
  assert.equal(corsHeaders('')['Vary'], 'Origin');
  assert.equal(corsHeaders(undefined)['Access-Control-Allow-Origin'], FALLBACK_ORIGIN);
});

test('Access-Control-Allow-Credentials is never emitted (the reason this is MEDIUM, not CRITICAL)', () => {
  const headers = corsHeadersFor(reqWith(ALLOWED), PROD_ENV);
  assert.equal('Access-Control-Allow-Credentials' in headers, false);
  assert.equal(/Allow-Credentials/i.test(Object.keys(headers).join(',')), false);
});

// ─────────────────────────── 2. every route handler ──────────────────────────

/** The 17 handlers that used to each carry their own allowlist. */
const ROUTES = [
  ['functions/api/auth.js', '/api/auth'],
  ['functions/api/auth/login.js', '/api/auth/login'],
  ['functions/api/school.js', '/api/school'],
  ['functions/api/token.js', '/api/token'],
  ['functions/api/web3/[[catchall]].js', '/api/web3/balance'],
  ['functions/api/ens/[[action]].js', '/api/ens/resolve'],
  ['functions/api/subscribers.js', '/api/subscribers'],
  ['functions/api/subscribers/pay.js', '/api/subscribers/pay'],
  ['functions/api/subscribers/admin/expire-sweep.js', '/api/subscribers/admin/expire-sweep'],
  ['functions/api/marketplace.js', '/api/marketplace'],
  ['functions/api/marketplace/buy.js', '/api/marketplace/buy'],
  ['functions/api/marketplace/list.js', '/api/marketplace/list'],
  ['functions/api/marketplace/deliver/[id].js', '/api/marketplace/deliver/abc'],
  ['functions/api/investors/metrics.js', '/api/investors/metrics'],
  ['functions/api/investors/contact.js', '/api/investors/contact'],
  ['functions/api/investors/file.js', '/api/investors/file?key=investors/x'],
  ['functions/api/investors/data-room.js', '/api/investors/data-room'],
];

const optionsRequest = (path, origin) =>
  new Request(`https://supercompute.io${path}`, { method: 'OPTIONS', headers: origin ? { Origin: origin } : {} });

test('harness sanity: this runtime lets a Request carry an Origin header', () => {
  const r = optionsRequest('/api/x', ALLOWED);
  assert.equal(r.headers.get('Origin'), ALLOWED, 'if this ever fails, the route probes below would be testing nothing');
});

test('all 17 migrated handlers answer OPTIONS with the fallback for a forged origin and the exact origin for ours', async () => {
  assert.equal(ROUTES.length, 17, 'the migration covers 17 handlers — update this table with the code, not around it');
  for (const [rel, path] of ROUTES) {
    const mod = await import(new URL(`../../${rel}`, import.meta.url));
    assert.equal(typeof mod.onRequest, 'function', `${rel} must export onRequest`);

    for (const forged of ['https://definitely-not-ours-12345.pages.dev', 'https://attacker.ngrok-free.app', 'http://localhost:3000']) {
      const res = await mod.onRequest({ request: optionsRequest(path, forged), env: { ...PROD_ENV } });
      const acao = res.headers.get('Access-Control-Allow-Origin');
      assert.notEqual(acao, forged, `${rel} reflected ${forged}`);
      assert.equal(acao, FALLBACK_ORIGIN, `${rel} must answer ${forged} with the production origin`);
      assert.equal((res.headers.get('Vary') || '').toLowerCase().includes('origin'), true, `${rel} must send Vary: Origin`);
    }

    const ok = await mod.onRequest({ request: optionsRequest(path, ALLOWED), env: { ...PROD_ENV } });
    assert.equal(ok.headers.get('Access-Control-Allow-Origin'), ALLOWED, `${rel} must echo the configured origin`);
    assert.equal(ok.headers.get('Access-Control-Allow-Credentials'), null, `${rel} must not allow credentials`);
  }
});

// ─────────────────────────── 3. source guard ─────────────────────────────────

/** Every .js file under functions/, as a {repo-relative path: source} map. */
function filesFromDisk() {
  const out = new Map();
  (function walk(dir) {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      if (statSync(full).isDirectory()) walk(full);
      else if (entry.endsWith('.js')) out.set(relative(REPO, full), readFileSync(full, 'utf8'));
    }
  })(FUNCTIONS_DIR);
  return out;
}

const REAL_FILES = filesFromDisk();
const isComment = (line) => {
  const t = line.trim();
  return t.startsWith('//') || t.startsWith('/*') || t.startsWith('*') || t.startsWith('*/');
};
const codeLines = (src) => src.split('\n').filter((l) => !isComment(l));
const withoutShared = (files) => new Map([...files].filter(([rel]) => rel !== SHARED_MODULE));

/** `headers.get('Origin')` and `headers?.get?.('origin')` are both "reads the Origin". */
const ORIGIN_READ = /headers\s*\??\.\s*get\s*\??\.?\s*\(\s*['"`]origin['"`]/i;

/** Each check returns the offending paths (or "path: detail" strings). */
const CHECKS = {
  /** Only the shared module may read the Origin header. */
  originReaders: (files) =>
    [...files].filter(([, src]) => codeLines(src).some((l) => ORIGIN_READ.test(l))).map(([rel]) => rel),

  /** No host may be matched by TLD suffix — that is a wildcard in disguise. */
  suffixMatchers: (files) => {
    const out = [];
    for (const [rel, src] of withoutShared(files)) {
      codeLines(src).forEach((l) => {
        if (/\b(host|hostname)\s*\??\.\s*endsWith\s*\(/.test(l)) out.push(`${rel}: ${l.trim()}`);
      });
    }
    return out;
  },

  /** No shipped allowlist may name an attacker-registrable or dev host. */
  bannedHosts: (files) => {
    const banned = ['ngrok-free.app', 'cloudflarestaging.com', "'.pages.dev'", '".pages.dev"', "'localhost'", '"localhost"', '127.0.0.1'];
    const out = [];
    for (const [rel, src] of withoutShared(files)) {
      src.split('\n').forEach((line, i) => {
        if (isComment(line)) return;
        for (const needle of banned) if (line.includes(needle)) out.push(`${rel}:${i + 1} ${needle}`);
      });
    }
    return out;
  },

  /** Anything computing an ACAO from a variable must use the shared resolver. */
  dynamicAcaoWithoutShared: (files) => {
    const out = [];
    for (const [rel, src] of withoutShared(files)) {
      const emitsDynamicAcao = codeLines(src).some((l) => /Access-Control-Allow-Origin['"`]?\s*:\s*[A-Za-z_$]/.test(l));
      if (emitsDynamicAcao && !/_shared\/cors(?:-origins)?\.js/.test(src)) out.push(rel);
    }
    return out;
  },

  /** corsHeaders(origin, opts) takes a RESOLVED origin — never a request. */
  corsHeadersWithRequest: (files) => {
    const out = [];
    for (const [rel, src] of withoutShared(files)) {
      // a file with its own thin wrapper delegates to corsHeadersFor inside it
      if (/\bfunction\s+corsHeaders\s*\(/.test(src) || /\bconst\s+corsHeaders\s*=/.test(src)) continue;
      codeLines(src).forEach((l) => {
        if (/\bcorsHeaders\(\s*request\b/.test(l)) out.push(`${rel}: ${l.trim()}`);
      });
    }
    return out;
  },

  /** A relative import of _shared/cors.js must actually reach the module. */
  brokenSharedImports: (files, { repo = REPO } = {}) => {
    const out = [];
    for (const [rel, src] of files) {
      for (const [, spec] of src.matchAll(/from\s+['"]([^'"]*_shared\/cors\.js)['"]/g)) {
        const target = resolve(repo, dirname(rel), spec);
        if (target !== resolve(repo, SHARED_MODULE)) out.push(`${rel}: ${spec} -> ${relative(repo, target)}`);
      }
    }
    return out;
  },
};

test('the real tree is clean on every source invariant', () => {
  const expectations = {
    originReaders: [SHARED_MODULE, 'functions/api/farcaster.js', 'functions/api/social/[[catchall]].js', 'functions/api/social.js'],
    suffixMatchers: [],
    bannedHosts: [],
    dynamicAcaoWithoutShared: [],
    corsHeadersWithRequest: [],
    brokenSharedImports: [],
  };
  for (const [name, check] of Object.entries(CHECKS)) {
    assert.deepEqual(check(REAL_FILES), expectations[name], `source check "${name}" failed:\n  ${check(REAL_FILES).join('\n  ')}`);
  }
  assert.equal(REAL_FILES.size > 15, true, 'the guard scanned a suspiciously small tree');
});

test('the guard goes RED on the pre-fix defect, a fresh copy, and a wrong-depth import', () => {
  // M1 — the pre-fix shape, verbatim: a local allowlist that echoes any *.pages.dev host
  const legacy = new Map([
    ['functions/api/legacy.js', `
function allowedOrigin(reqOrigin) {
  let origin = 'https://supercompute.io';
  const host = new URL(reqOrigin).hostname;
  const ok = host === 'supercompute.io' || host.endsWith('.pages.dev') || host === 'localhost' || host === '127.0.0.1';
  if (ok) origin = reqOrigin;
  return origin;
}
export async function onRequest({ request }) {
  const origin = allowedOrigin(request.headers.get('Origin') || '');
  return new Response(null, { headers: { 'Access-Control-Allow-Origin': origin } });
}
`],
  ]);
  assert.deepEqual(CHECKS.originReaders(legacy), ['functions/api/legacy.js'], 'M1: direct Origin read must be caught');
  assert.equal(CHECKS.suffixMatchers(legacy).length, 1, 'M1: the suffix match must be caught');
  assert.equal(CHECKS.bannedHosts(legacy).length, 3, 'M1: .pages.dev + localhost + 127.0.0.1 must all be caught');
  assert.deepEqual(CHECKS.dynamicAcaoWithoutShared(legacy), ['functions/api/legacy.js'], 'M1: the un-shared variable ACAO must be caught');

  // M2 — a NEW handler that reads Origin through the shared module's *naming* but keeps its own logic
  const copy = new Map([
    ['functions/api/copy.js', `
const ALLOWED = new Set(['https://supercompute.io']);
export async function onRequest({ request }) {
  const o = request.headers.get('origin') || '';
  return new Response(null, { headers: { 'Access-Control-Allow-Origin': ALLOWED.has(o) ? o : ALLOWED } });
}
`],
  ]);
  assert.deepEqual(CHECKS.originReaders(copy), ['functions/api/copy.js'], 'M2: copy #18 must be caught even when it looks tidy');
  assert.deepEqual(CHECKS.dynamicAcaoWithoutShared(copy), ['functions/api/copy.js'], 'M2: no _shared import = red');

  // M3 — the arity mistake this suite actually caught once: corsHeaders(request, env)
  const arity = new Map([
    ['functions/api/whatever.js', `
import { corsOrigin, corsHeaders } from '../_shared/cors.js';
export async function onRequest({ request, env }) {
  const headers = corsHeaders(request, env);
  return new Response(null, { headers });
}
`],
  ]);
  assert.equal(CHECKS.corsHeadersWithRequest(arity).length, 1, 'M3: corsHeaders(request, …) must be caught');
  // …and the correct shared-aware shape is NOT flagged
  const arityOk = new Map([
    ['functions/api/whatever.js', `
import { corsOrigin, corsHeadersFor } from '../_shared/cors.js';
export async function onRequest({ request, env }) {
  const headers = corsHeadersFor(request, env);
  return new Response(null, { headers });
}
`],
  ]);
  assert.deepEqual(CHECKS.corsHeadersWithRequest(arityOk), [], 'the correct shape must pass');

  // M4 — wrong import depth (this one 500s the route at runtime; the suite caught it once)
  const depth = new Map([
    ['functions/api/subscribers/admin/sweep.js', `import { corsOrigin } from '../../_shared/cors.js';\n`],
  ]);
  assert.equal(CHECKS.brokenSharedImports(depth).length, 1, 'M4: an import that misses functions/_shared must be caught');
  const depthOk = new Map([
    ['functions/api/subscribers/admin/sweep.js', `import { corsOrigin } from '../../../_shared/cors.js';\n`],
  ]);
  assert.deepEqual(CHECKS.brokenSharedImports(depthOk), [], 'the correct depth must pass');
});

test('every handler that emits a request-derived ACAO imports the shared resolver', () => {
  const offenders = CHECKS.dynamicAcaoWithoutShared(REAL_FILES);
  assert.deepEqual(offenders, [],
    'these files compute Access-Control-Allow-Origin instead of importing functions/_shared/cors.js — ' +
    'do not add a second allowlist, extend the shared one:\n  ' + offenders.join('\n  '));
});

test('wrangler.toml still declares the production CORS_ORIGIN the resolver reads', () => {
  const toml = readFileSync(join(REPO, 'wrangler.toml'), 'utf8');
  assert.match(toml, /^\[vars\]$/m);
  assert.match(toml, /^CORS_ORIGIN\s*=\s*"https:\/\/supercompute\.io"$/m,
    'env.CORS_ORIGIN is the allowlist source; a deployment without it silently falls back to FALLBACK_ORIGIN');
  assert.match(toml, /ALLOW_DEV_ORIGINS/,
    'the dev-origin opt-in should be documented next to the var it complements');
  assert.equal(/^ALLOW_DEV_ORIGINS\s*=/m.test(toml), false,
    'ALLOW_DEV_ORIGINS must NOT be set in wrangler.toml — that would re-trust localhost in production');
});
