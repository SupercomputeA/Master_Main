// src/api/articles.js — NewsDesk Articles API (D1-backed)
import { verifySession, isAdmin } from './auth.js';

function generateId() {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
}

// GET /api/articles — List published articles
async function listArticles(env) {
  if (!env.DB) {
    return new Response(JSON.stringify({ error: 'Database not configured' }), {
      status: 503, headers: { 'Content-Type': 'application/json' },
    });
  }

  const articles = await env.DB.prepare(`
    SELECT id, title, excerpt, category, author, icon, views, published_at, created_at
    FROM articles
    WHERE published_at IS NOT NULL
    ORDER BY published_at DESC
    LIMIT 50
  `).all();

  return new Response(JSON.stringify({ articles: articles.results || [] }), {
    headers: { 'Content-Type': 'application/json' },
  });
}

// GET /api/articles/:id — Single article
async function getArticle(env, id) {
  if (!env.DB) {
    return new Response(JSON.stringify({ error: 'Database not configured' }), {
      status: 503, headers: { 'Content-Type': 'application/json' },
    });
  }

  const article = await env.DB.prepare(
    'SELECT * FROM articles WHERE id = ?'
  ).bind(id).first();

  if (!article) {
    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404, headers: { 'Content-Type': 'application/json' },
    });
  }

  // Increment view count (fire-and-forget)
  env.DB.prepare('UPDATE articles SET views = views + 1 WHERE id = ?').bind(id).run()
    .catch(() => {});

  return new Response(JSON.stringify({ article }), {
    headers: { 'Content-Type': 'application/json' },
  });
}

// POST /api/articles — Create (admin only)
async function createArticle(env, body, authHeader) {
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

  const { title, excerpt, content, category, author, icon } = body;
  if (!title) {
    return new Response(JSON.stringify({ error: 'title required' }), {
      status: 400, headers: { 'Content-Type': 'application/json' },
    });
  }

  const id = generateId();
  const now = Math.floor(Date.now() / 1000);
  const publishedAt = body.published_at || now;

  await env.DB.prepare(`
    INSERT INTO articles (id, title, excerpt, content, category, author, icon, published_at, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(id, title, excerpt || '', content || '', category || 'signal', author || 'Quanta S', icon || '📰', publishedAt, now).run();

  return new Response(JSON.stringify({ success: true, id }), {
    status: 201, headers: { 'Content-Type': 'application/json' },
  });
}

// PUT /api/articles/:id — Update (admin only)
async function updateArticle(env, id, body, authHeader) {
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

  const existing = await env.DB.prepare('SELECT id FROM articles WHERE id = ?').bind(id).first();
  if (!existing) {
    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404, headers: { 'Content-Type': 'application/json' },
    });
  }

  const updates = [];
  const bindings = [];
  const allowed = ['title', 'excerpt', 'content', 'category', 'author', 'icon', 'published_at'];

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

  bindings.push(id);
  await env.DB.prepare(`UPDATE articles SET ${updates.join(', ')} WHERE id = ?`).bind(...bindings).run();

  return new Response(JSON.stringify({ success: true }));
}

// DELETE /api/articles/:id — Delete (admin only)
async function deleteArticle(env, id, authHeader) {
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

  await env.DB.prepare('DELETE FROM articles WHERE id = ?').bind(id).run();
  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
}

// ── Route dispatcher ────────────────────────────────────────────────────────
export async function handleArticles(request, env, ctx) {
  const url = new URL(request.url);
  const path = url.pathname.replace('/api/articles', '') || '/';
  const method = request.method;

  const corsHeaders = {
    'Access-Control-Allow-Origin': 'https://supercompute.io',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  if (method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // GET /api/articles — list
  if (method === 'GET' && path === '/') {
    return listArticles(env);
  }

  // GET /api/articles/:id
  if (method === 'GET' && path.match(/^\/\w+$/)) {
    return getArticle(env, path.slice(1));
  }

  // POST /api/articles — create
  if (method === 'POST' && path === '/') {
    const body = await request.json().catch(() => ({}));
    return createArticle(env, body, request.headers.get('Authorization'));
  }

  // PUT /api/articles/:id
  if (method === 'PUT' && path.match(/^\/\w+$/)) {
    const body = await request.json().catch(() => ({}));
    return updateArticle(env, path.slice(1), body, request.headers.get('Authorization'));
  }

  // DELETE /api/articles/:id
  if (method === 'DELETE' && path.match(/^\/\w+$/)) {
    return deleteArticle(env, path.slice(1), request.headers.get('Authorization'));
  }

  return new Response(JSON.stringify({
    endpoints: {
      'GET /api/articles': 'List articles (public)',
      'GET /api/articles/:id': 'Get article (public)',
      'POST /api/articles': 'Create article (admin)',
      'PUT /api/articles/:id': 'Update article (admin)',
      'DELETE /api/articles/:id': 'Delete article (admin)',
    }
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}