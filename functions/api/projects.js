// functions/api/projects.js — Projects CRUD API
//
// COLUMN CONTRACT — the two column lists below are the exact set this handler reads and
// writes. They MUST be a subset of the `projects` table declared by `schema.sql` and
// `migrations/0001_admin_wallets_and_projects.sql`, and of the live production table.
// `tests/projects/schema-contract.test.mjs` applies the real DDL to a real SQLite engine and
// reddens CI when the handler and the schema disagree.
//
// 2026-09-15 production incident (the reason this contract exists): this file selected
// `ticker, stack, description` while the live `projects` table carries
// `tagline, repo, coin, sort_order, featured, ...` and has never had `ticker`/`stack`. D1
// raised `no such column: ticker`, the exception escaped `onRequest`, and Cloudflare Pages
// answered `GET /api/projects` with a bare `error code: 1101` (uncaught Worker exception)
// and no JSON body — /projects data was dead on prod. Two guards now cover that class:
//   1. CI: the schema-contract test above fails before a deploy can ship the drift.
//   2. Runtime: every DB call goes through `dbCall`, so a storage/schema failure answers
//      503 JSON with a stable `code` instead of throwing out of the Function.
import { verifySession, isAdmin } from './auth.js';

// Read shape returned by GET /api/projects. Ordered explicitly so a future schema addition
// cannot silently change the public JSON — drift shows up in the contract test instead.
export const PROJECT_LIST_COLUMNS = [
  'id', 'name', 'tagline', 'description', 'status',
  'repo', 'coin', 'chain', 'contract_address',
  'featured', 'sort_order', 'funding_goal_usd', 'cover_image_url',
  'website_url', 'github_url', 'twitter_url', 'creator_name',
  'created_at', 'updated_at',
];

// Admin-writable columns. `id` is generated and the timestamps come from the table defaults,
// so neither is accepted from a request body.
export const PROJECT_WRITE_COLUMNS = [
  'name', 'tagline', 'description', 'status',
  'repo', 'coin', 'chain', 'contract_address',
  'featured', 'sort_order', 'funding_goal_usd', 'cover_image_url',
  'website_url', 'github_url', 'twitter_url', 'creator_name',
];

function generateId() {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': 'https://supercompute.io' },
  });
}

// Every storage call funnels through here. A throw from D1 must never escape the Function:
// Pages turns it into a bodyless `error code: 1101`, which tells an operator nothing.
async function dbCall(label, fn, onOk) {
  try {
    return onOk(await fn());
  } catch (err) {
    const detail = err && err.message ? err.message : String(err);
    // Full detail goes to the Worker log (wrangler tail / CF dashboard); the response stays
    // generic so a schema error cannot leak table structure to the public internet.
    console.error(`[api/projects] ${label} failed: ${detail}`);
    return json({ error: 'Projects store unavailable', code: 'DB_UNAVAILABLE' }, 503);
  }
}

async function listProjects(env) {
  if (!env.DB) return json({ error: 'Database not configured', code: 'DB_NOT_CONFIGURED' }, 503);
  return dbCall(
    'listProjects',
    () => env.DB.prepare(
      `SELECT ${PROJECT_LIST_COLUMNS.join(', ')} FROM projects ` +
      'ORDER BY sort_order ASC, created_at DESC, id ASC'
    ).all(),
    (r) => json({ projects: r.results || [] }),
  );
}

async function createProject(env, body, authHeader) {
  const auth = await verifySession(env, authHeader);
  if (!auth.valid) return json({ error: 'Unauthorized' }, 401);
  if (!await isAdmin(env, auth.wallet)) return json({ error: 'Forbidden: admin access required' }, 403);
  if (!env.DB) return json({ error: 'Database not configured', code: 'DB_NOT_CONFIGURED' }, 503);
  if (typeof body.name !== 'string' || !body.name.trim()) return json({ error: 'name required' }, 400);

  const provided = PROJECT_WRITE_COLUMNS.filter((c) => body[c] !== undefined);
  const id = generateId();
  const columns = ['id', ...provided];
  const placeholders = columns.map(() => '?');
  const bindings = [id, ...provided.map((c) => body[c])];

  return dbCall(
    'createProject',
    () => env.DB.prepare(
      `INSERT INTO projects (${columns.join(', ')}) VALUES (${placeholders.join(', ')})`
    ).bind(...bindings).run(),
    () => json({ success: true, id }, 201),
  );
}

async function updateProject(env, id, body, authHeader) {
  const auth = await verifySession(env, authHeader);
  if (!auth.valid) return json({ error: 'Unauthorized' }, 401);
  if (!await isAdmin(env, auth.wallet)) return json({ error: 'Forbidden: admin access required' }, 403);
  if (!env.DB) return json({ error: 'Database not configured', code: 'DB_NOT_CONFIGURED' }, 503);

  const updates = [];
  const bindings = [];
  for (const field of PROJECT_WRITE_COLUMNS) {
    if (body[field] !== undefined) { updates.push(`${field} = ?`); bindings.push(body[field]); }
  }
  if (!updates.length) return json({ error: 'No fields to update' }, 400);
  // `updated_at` is a DATETIME column with a CURRENT_TIMESTAMP default — write it as a
  // timestamp, not the unix-seconds integer this used to bind into it.
  updates.push('updated_at = CURRENT_TIMESTAMP');
  bindings.push(id);

  return dbCall(
    'updateProject',
    () => env.DB.prepare(`UPDATE projects SET ${updates.join(', ')} WHERE id = ?`).bind(...bindings).run(),
    () => json({ success: true }),
  );
}

async function deleteProject(env, id, authHeader) {
  const auth = await verifySession(env, authHeader);
  if (!auth.valid) return json({ error: 'Unauthorized' }, 401);
  if (!await isAdmin(env, auth.wallet)) return json({ error: 'Forbidden: admin access required' }, 403);
  if (!env.DB) return json({ error: 'Database not configured', code: 'DB_NOT_CONFIGURED' }, 503);

  return dbCall(
    'deleteProject',
    () => env.DB.prepare('DELETE FROM projects WHERE id = ?').bind(id).run(),
    () => json({ success: true }),
  );
}

export async function onRequest({ request, env }) {
  const url = new URL(request.url);
  const path = url.pathname.replace('/api/projects', '') || '/';
  const method = request.method;

  try {
    if (method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': 'https://supercompute.io',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }

    if (method === 'GET' && path === '/') return await listProjects(env);
    if (method === 'POST' && path === '/') {
      const body = await request.json().catch(() => ({}));
      return await createProject(env, body, request.headers.get('Authorization'));
    }
    if (method === 'PUT' && path.match(/^\/\w+$/)) {
      const body = await request.json().catch(() => ({}));
      return await updateProject(env, path.slice(1), body, request.headers.get('Authorization'));
    }
    if (method === 'DELETE' && path.match(/^\/\w+$/)) {
      return await deleteProject(env, path.slice(1), request.headers.get('Authorization'));
    }

    return json({ endpoints: ['GET /api/projects', 'POST /api/projects', 'PUT /api/projects/:id', 'DELETE /api/projects/:id'] });
  } catch (err) {
    // Last-resort net for anything the per-call wrappers do not cover (session store, JSON
    // parsing, an unexpected bug): answer 500 JSON rather than a bodyless CF error 1101.
    console.error('[api/projects] unhandled:', err && err.message ? err.message : err);
    return json({ error: 'Internal Server Error', code: 'UNHANDLED' }, 500);
  }
}
