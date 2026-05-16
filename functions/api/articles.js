// functions/api/articles.js — NewsDesk Articles API (Cloudflare Pages Function)
import { verifySession, isAdmin } from './auth.js';

function generateId() {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
}

// GET /api/articles — List published articles
async function listArticles(env) {
  if (!env.DB) return json({ error: 'Database not configured' }, 503);

  const articles = await env.DB.prepare(`
    SELECT id, title, excerpt, category, author, icon, views, published_at, created_at
    FROM articles WHERE published_at IS NOT NULL
    ORDER BY published_at DESC LIMIT 50
  `).all();

  return json({ articles: articles.results || [] });
}

// GET /api/articles/:id
async function getArticle(env, id) {
  if (!env.DB) return json({ error: 'Database not configured' }, 503);

  const article = await env.DB.prepare('SELECT * FROM articles WHERE id = ?').bind(id).first();
  if (!article) return json({ error: 'Not found' }, 404);

  env.DB.prepare('UPDATE articles SET views = views + 1 WHERE id = ?').bind(id).run().catch(() => {});
  return json({ article });
}

// POST /api/articles — Create (admin only)
async function createArticle(env, body, authHeader) {
  const auth = await verifySession(env, authHeader);
  if (!auth.valid) return json({ error: 'Unauthorized' }, 401);
  if (!await isAdmin(env, auth.wallet)) return json({ error: 'Forbidden: admin access required' }, 403);

  const { title, excerpt, content, category, author, icon } = body;
  if (!title) return json({ error: 'title required' }, 400);

  const id = generateId();
  const now = Math.floor(Date.now() / 1000);
  await env.DB.prepare(`
    INSERT INTO articles (id, title, excerpt, content, category, author, icon, published_at, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(id, title, excerpt || '', content || '', category || 'signal', author || 'Quanta S', icon || '📰', body.published_at || now, now).run();

  return json({ success: true, id }, 201);
}

// PUT /api/articles/:id — Update (admin only)
async function updateArticle(env, id, body, authHeader) {
  const auth = await verifySession(env, authHeader);
  if (!auth.valid) return json({ error: 'Unauthorized' }, 401);
  if (!await isAdmin(env, auth.wallet)) return json({ error: 'Forbidden: admin access required' }, 403);

  const existing = await env.DB.prepare('SELECT id FROM articles WHERE id = ?').bind(id).first();
  if (!existing) return json({ error: 'Not found' }, 404);

  const updates = [];
  const bindings = [];
  for (const field of ['title', 'excerpt', 'content', 'category', 'author', 'icon', 'published_at']) {
    if (body[field] !== undefined) {
      updates.push(`${field} = ?`);
      bindings.push(body[field]);
    }
  }
  if (updates.length === 0) return json({ error: 'No fields to update' }, 400);
  bindings.push(id);
  await env.DB.prepare(`UPDATE articles SET ${updates.join(', ')} WHERE id = ?`).bind(...bindings).run();
  return json({ success: true });
}

// DELETE /api/articles/:id — Delete (admin only)
async function deleteArticle(env, id, authHeader) {
  const auth = await verifySession(env, authHeader);
  if (!auth.valid) return json({ error: 'Unauthorized' }, 401);
  if (!await isAdmin(env, auth.wallet)) return json({ error: 'Forbidden: admin access required' }, 403);
  await env.DB.prepare('DELETE FROM articles WHERE id = ?').bind(id).run();
  return json({ success: true });
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': 'https://supercompute.io' },
  });
}

export async function onRequest({ request, env, ctx }) {
  const url = new URL(request.url);
  const path = url.pathname.replace('/api/articles', '') || '/';
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

  if (method === 'GET' && path === '/') return listArticles(env);
  if (method === 'GET' && path.match(/^\/\w+$/)) return getArticle(env, path.slice(1));
  if (method === 'POST' && path === '/') {
    const body = await request.json().catch(() => ({}));
    return createArticle(env, body, request.headers.get('Authorization'));
  }
  if (method === 'PUT' && path.match(/^\/\w+$/)) {
    const body = await request.json().catch(() => ({}));
    return updateArticle(env, path.slice(1), body, request.headers.get('Authorization'));
  }
  if (method === 'DELETE' && path.match(/^\/\w+$/)) {
    return deleteArticle(env, path.slice(1), request.headers.get('Authorization'));
  }

  return json({ endpoints: ['GET /api/articles', 'GET /api/articles/:id', 'POST /api/articles', 'PUT /api/articles/:id', 'DELETE /api/articles/:id'] });
}