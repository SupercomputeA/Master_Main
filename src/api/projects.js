// src/api/projects.js — Projects CRUD API
import { verifySession, isAdmin } from './auth.js';

function generateId() {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
}

// GET /api/projects — List all (public)
async function listProjects(env) {
  if (!env.DB) {
    return new Response(JSON.stringify({ error: 'Database not configured' }), {
      status: 503, headers: { 'Content-Type': 'application/json' },
    });
  }

  const projects = await env.DB.prepare(`
    SELECT id, name, ticker, stack, description, status, created_at
    FROM projects
    ORDER BY created_at DESC
  `).all();

  return new Response(JSON.stringify({ projects: projects.results || [] }), {
    headers: { 'Content-Type': 'application/json' },
  });
}

// POST /api/projects — Create (admin only)
async function createProject(env, body, authHeader) {
  const { valid, wallet } = await verifySession(env, authHeader);
  if (!valid) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401, headers: { 'Content-Type': 'application/json' },
    });
  }

  const admin = await isAdmin(env, wallet);
  if (!admin) {
    return new Response(JSON.stringify({ error: 'Forbidden: admin access required' }), {
      status: 403, headers: { 'Content-Type': 'application/json' },
    });
  }

  const { name, ticker, stack, description, status } = body;
  if (!name) {
    return new Response(JSON.stringify({ error: 'name required' }), {
      status: 400, headers: { 'Content-Type': 'application/json' },
    });
  }

  const id = generateId();
  const now = Math.floor(Date.now() / 1000);

  await env.DB.prepare(`
    INSERT INTO projects (id, name, ticker, stack, description, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(id, name, ticker || '', stack || '', description || '', status || 'active', now, now).run();

  return new Response(JSON.stringify({ success: true, id }), {
    status: 201, headers: { 'Content-Type': 'application/json' },
  });
}

// PUT /api/projects/:id — Update (admin only)
async function updateProject(env, id, body, authHeader) {
  const { valid, wallet } = await verifySession(env, authHeader);
  if (!valid) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401, headers: { 'Content-Type': 'application/json' },
    });
  }

  const admin = await isAdmin(env, wallet);
  if (!admin) {
    return new Response(JSON.stringify({ error: 'Forbidden: admin access required' }), {
      status: 403, headers: { 'Content-Type': 'application/json' },
    });
  }

  const updates = [];
  const bindings = [];
  const allowed = ['name', 'ticker', 'stack', 'description', 'status'];

  for (const field of allowed) {
    if (body[field] !== undefined) {
      updates.push(`${field} = ?`);
      bindings.push(body[field]);
    }
  }

  if (updates.length === 0) {
    return new Response(JSON.stringify({ error: 'No fields to update' }), {
      status: 400, headers: { 'Content-Type': 'application/json' },
    });
  }

  updates.push('updated_at = ?');
  bindings.push(Math.floor(Date.now() / 1000));
  bindings.push(id);

  await env.DB.prepare(`UPDATE projects SET ${updates.join(', ')} WHERE id = ?`).bind(...bindings).run();

  return new Response(JSON.stringify({ success: true }));
}

// DELETE /api/projects/:id — Delete (admin only)
async function deleteProject(env, id, authHeader) {
  const { valid, wallet } = await verifySession(env, authHeader);
  if (!valid) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401, headers: { 'Content-Type': 'application/json' },
    });
  }

  const admin = await isAdmin(env, wallet);
  if (!admin) {
    return new Response(JSON.stringify({ error: 'Forbidden: admin access required' }), {
      status: 403, headers: { 'Content-Type': 'application/json' },
    });
  }

  await env.DB.prepare('DELETE FROM projects WHERE id = ?').bind(id).run();
  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function handleProjects(request, env, ctx) {
  const url = new URL(request.url);
  const path = url.pathname.replace('/api/projects', '') || '/';
  const method = request.method;

  const corsHeaders = {
    'Access-Control-Allow-Origin': 'https://supercompute.io',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  if (method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (method === 'GET' && path === '/') {
    return listProjects(env);
  }

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

  return new Response(JSON.stringify({
    endpoints: {
      'GET /api/projects': 'List projects (public)',
      'POST /api/projects': 'Create project (admin)',
      'PUT /api/projects/:id': 'Update project (admin)',
      'DELETE /api/projects/:id': 'Delete project (admin)',
    }
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}