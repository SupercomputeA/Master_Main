// functions/api/articles.js — NewsDesk Articles API (Cloudflare Pages Function)
import { verifySession, isAdmin } from './auth.js';

function generateId() {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
}

// GET /api/articles — List published articles
// Query params:
//   ?include=content  → include the full body (markdown) in each row
//   ?slug=<slug>       → filter to a single article matching this slug
//   ?status=<status>   → filter by status (default: published only via published_at)
async function listArticles(env, url) {
  if (!env.DB) return json({ error: 'Database not configured' }, 503);

  const includeContent = url.searchParams.get('include') === 'content';
  const slugFilter = url.searchParams.get('slug');

  const cols = includeContent
    ? 'id, title, slug, excerpt, content, category, author, icon, views, status, published_at, created_at, updated_at'
    : 'id, title, slug, excerpt, category, author, icon, views, published_at, created_at';

  let where = 'WHERE published_at IS NOT NULL';
  const binds = [];
  if (slugFilter) {
    where += ' AND slug = ?';
    binds.push(slugFilter);
  }

  const sql = `SELECT ${cols} FROM articles ${where} ORDER BY published_at DESC LIMIT 50`;
  try {
    const stmt = binds.length
      ? env.DB.prepare(sql).bind(...binds)
      : env.DB.prepare(sql);
    const articles = await stmt.all();
    return json({ articles: articles.results || [] });
  } catch (err) {
    // Never let a DB error bubble into an unhandled 500 (which returns HTML and
    // breaks the client's r.json()). Return an empty feed with a 500 status so
    // the page degrades gracefully and the error is still observable.
    return json({ articles: [], error: 'Failed to load articles' }, 500);
  }
}

// GET /api/articles/:id — single article by ID
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

  const { title, excerpt, content, category, author, icon, slug } = body;
  if (!title) return json({ error: 'title required' }, 400);

  const id = generateId();
  const now = Math.floor(Date.now() / 1000);
  await env.DB.prepare(`
    INSERT INTO articles (id, title, slug, excerpt, content, category, author, icon, published_at, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    id,
    title,
    slug || null,
    excerpt || '',
    content || '',
    category || 'signal',
    author || 'Quanta S',
    icon || '◎',
    body.published_at || now,
    now
  ).run();

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
  for (const field of ['title', 'slug', 'excerpt', 'content', 'category', 'author', 'icon', 'published_at', 'status']) {
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
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function onRequest({ request, env, ctx }) {
  const url = new URL(request.url);
  const path = url.pathname.replace('/api/articles', '') || '/';
  const method = request.method;

  if (method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  if (method === 'GET' && path === '/') return listArticles(env, url);
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

  return json({ endpoints: [
    'GET /api/articles',
    'GET /api/articles?include=content',
    'GET /api/articles?slug=<slug>',
    'GET /api/articles?include=content&slug=<slug>',
    'GET /api/articles/:id',
    'POST /api/articles',
    'PUT /api/articles/:id',
    'DELETE /api/articles/:id',
  ]});
}
