// functions/api/tina/webhook.js — Tina CMS → D1 sync webhook
// When Tina saves an article, it fires a webhook. This handler parses the
// markdown frontmatter + body and upserts into the D1 articles table so
// NewsDesk pages (which read from D1) reflect the change immediately.
//
// D1 articles schema (production):
//   id, title, content, author, category, published_at (TEXT ISO),
//   created_at (TEXT datetime), updated_at (TEXT), excerpt, status,
//   icon, views, slug, published (INTEGER 0/1), comments

function generateId() {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function onRequest({ request, env }) {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  if (request.method !== 'POST') {
    return json({ error: 'POST only' }, 405);
  }

  if (!env?.DB) {
    return json({ error: 'Database not configured' }, 503);
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }

  // Only handle post collection saves
  if (payload.collection && payload.collection !== 'post') {
    return json({ skipped: true, reason: `collection ${payload.collection} not handled` });
  }

  if (payload.type && !payload.type.startsWith('content:')) {
    return json({ skipped: true, reason: `type ${payload.type} not handled` });
  }

  const data = payload.data || {};
  const slug = data.slug || payload.slug || (payload.path ? payload.path.replace(/^.*\/|\.[^.]+$/g, '') : null);

  if (!slug) {
    return json({ error: 'No slug found in payload' }, 400);
  }

  const title = data.title || 'Untitled';
  const excerpt = data.excerpt || '';
  const content = data.body || '';
  const category = (data.category || 'SIGNAL').toLowerCase();
  const author = data.author || 'Quanta S';
  const icon = data.icon || '◎';
  const status = data.status || 'published';
  const isPublished = status === 'published' ? 1 : 0;
  const publishedAt = data.date || new Date().toISOString();
  const updatedAt = new Date().toISOString();

  try {
    // Check if article already exists (by slug)
    const existing = await env.DB.prepare('SELECT id FROM articles WHERE slug = ?').bind(slug).first();

    if (existing) {
      await env.DB.prepare(`
        UPDATE articles SET
          title = ?, excerpt = ?, content = ?, category = ?, author = ?, icon = ?,
          published_at = ?, status = ?, published = ?, updated_at = ?
        WHERE slug = ?
      `).bind(
        title, excerpt, content, category, author, icon,
        publishedAt, status, isPublished, updatedAt, slug
      ).run();

      return json({ success: true, action: 'updated', slug, id: existing.id });
    } else {
      const id = generateId();
      const createdAt = new Date().toISOString().replace('T', ' ').replace(/\.\d+Z$/, '');

      await env.DB.prepare(`
        INSERT INTO articles (id, title, slug, excerpt, content, category, author, icon, published_at, status, published, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        id, title, slug, excerpt, content, category, author, icon,
        publishedAt, status, isPublished, createdAt, updatedAt
      ).run();

      return json({ success: true, action: 'created', slug, id });
    }
  } catch (err) {
    return json({ error: 'DB sync failed', detail: String(err) }, 500);
  }
}
