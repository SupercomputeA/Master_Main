// functions/api/projects.js — Projects CRUD API
import { verifySession, isAdmin } from './auth.js';

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

async function listProjects(env) {
  if (!env.DB) return json({ error: 'Database not configured' }, 503);
  const r = await env.DB.prepare('SELECT id, name, ticker, stack, description, status, created_at FROM projects ORDER BY created_at DESC').all();
  return json({ projects: r.results || [] });
}

async function createProject(env, body, authHeader) {
  const auth = await verifySession(env, authHeader);
  if (!auth.valid) return json({ error: 'Unauthorized' }, 401);
  if (!await isAdmin(env, auth.wallet)) return json({ error: 'Forbidden: admin access required' }, 403);
  const { name, ticker, stack, description, status } = body;
  if (!name) return json({ error: 'name required' }, 400);
  const id = generateId();
  const now = Math.floor(Date.now() / 1000);
  await env.DB.prepare('INSERT INTO projects (id, name, ticker, stack, description, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').bind(id, name, ticker || '', stack || '', description || '', status || 'active', now, now).run();
  return json({ success: true, id }, 201);
}

async function updateProject(env, id, body, authHeader) {
  const auth = await verifySession(env, authHeader);
  if (!auth.valid) return json({ error: 'Unauthorized' }, 401);
  if (!await isAdmin(env, auth.wallet)) return json({ error: 'Forbidden: admin access required' }, 403);
  const updates = [], bindings = [];
  for (const f of ['name', 'ticker', 'stack', 'description', 'status']) {
    if (body[f] !== undefined) { updates.push(`${f} = ?`); bindings.push(body[f]); }
  }
  if (!updates.length) return json({ error: 'No fields to update' }, 400);
  updates.push('updated_at = ?'); bindings.push(Math.floor(Date.now() / 1000)); bindings.push(id);
  await env.DB.prepare(`UPDATE projects SET ${updates.join(', ')} WHERE id = ?`).bind(...bindings).run();
  return json({ success: true });
}

async function deleteProject(env, id, authHeader) {
  const auth = await verifySession(env, authHeader);
  if (!auth.valid) return json({ error: 'Unauthorized' }, 401);
  if (!await isAdmin(env, auth.wallet)) return json({ error: 'Forbidden: admin access required' }, 403);
  await env.DB.prepare('DELETE FROM projects WHERE id = ?').bind(id).run();
  return json({ success: true });
}

export async function onRequest({ request, env }) {
  const url = new URL(request.url);
  const path = url.pathname.replace('/api/projects', '') || '/';
  const method = request.method;

  if (method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': 'https://supercompute.io',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  if (method === 'GET' && path === '/') return listProjects(env);
  if (method === 'POST' && path === '/') {
    const body = await request.json().catch(() => ({}));
    return createProject(env, body, request.headers.get('Authorization'));
  }
  if (method === 'PUT' && path.match(/^\/\w+$/)) {
    const body = await request.json().catch(() => ({}));
    return updateProject(env, path.slice(1), body, request.headers.get('Authorization'));
  }
  if (method === 'DELETE' && path.match(/^\/\w+$/)) {
    return deleteProject(env, path.slice(1), request.headers.get('Authorization'));
  }

  return json({ endpoints: ['GET /api/projects', 'POST /api/projects', 'PUT /api/projects/:id', 'DELETE /api/projects/:id'] });
}