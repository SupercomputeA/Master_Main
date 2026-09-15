// functions/api/investors/file.js
// GET /api/investors/file?key=investors/pitch-deck.pdf
//
// Streams a document from the R2 bucket bound as INVESTOR_DOCS. Auth-gated:
// same tier rule as /api/investors/data-room (investor or admin).
//
// This proxy exists so we never have to ship presigned S3-style URLs. The
// handler checks session, looks up the user's role, and streams the object
// if permitted.

import { verifySession } from '../auth.js';
import { corsHeadersFor } from '../../_shared/cors.js';

const ALLOWED_PREFIX = 'investors/';

// Exact-origin allowlist — functions/_shared/cors.js (SEC-F4), sourced from
// env.CORS_ORIGIN. No *.pages.dev / *.ngrok-free.app / localhost echo, and the
// shared helper adds Vary: Origin.
function corsHeaders(request, env) {
  return corsHeadersFor(request, env, { methods: 'GET, OPTIONS', headers: 'Content-Type, Authorization' });
}

export async function onRequest({ request, env }) {
  const cors = corsHeaders(request, env);
  const respond = (data, status = 200) =>
    new Response(JSON.stringify(data), {
      status,
      headers: { ...cors, 'Content-Type': 'application/json' },
    });

  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
  if (request.method !== 'GET') return respond({ ok: false, error: 'method_not_allowed' }, 405);

  const { valid, wallet } = await verifySession(env, request.headers.get('Authorization'));
  if (!valid) return respond({ ok: false, error: 'unauthenticated' }, 401);

  const url = new URL(request.url);
  const key = url.searchParams.get('key') || '';
  if (!key || !key.startsWith(ALLOWED_PREFIX) || key.includes('..')) {
    return respond({ ok: false, error: 'invalid_key' }, 400);
  }

  if (!env?.INVESTOR_DOCS) {
    return respond({ ok: false, error: 'storage_not_configured' }, 503);
  }

  let role = 'user';
  try {
    const row = await env.DB.prepare(
      'SELECT role FROM users WHERE wallet_address = ?',
    ).bind(wallet.toLowerCase()).first();
    role = row?.role ?? 'user';
  } catch {}
  if (role !== 'investor' && role !== 'admin') {
    return respond({ ok: false, error: 'investor_tier_required' }, 403);
  }

  try {
    const obj = await env.INVESTOR_DOCS.get(key);
    if (!obj) return respond({ ok: false, error: 'not_found' }, 404);
    const headers = new Headers(cors);
    headers.set('Content-Type', obj.httpMetadata?.contentType ?? 'application/octet-stream');
    headers.set('Cache-Control', 'private, max-age=60');
    headers.set('Content-Disposition', `inline; filename="${key.split('/').pop()}"`);
    return new Response(obj.body, { status: 200, headers });
  } catch (err) {
    return respond({ ok: false, error: 'fetch_failed', message: err?.message }, 502);
  }
}