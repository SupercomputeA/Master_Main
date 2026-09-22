// functions/api/social.js — Social media command center API (Cloudflare Pages Function)
//
// ADMIN ONLY. Every route below requires a valid session (Bearer) whose wallet holds
// the admin role in D1 (users.role = 'admin' or an admin_wallets row). Non-admin and
// unauthenticated callers get 403 / 401 with a JSON body — never an HTML error page.
//
//   GET  /api/social/accounts        → platform registry + live connection status from env
//   GET  /api/social/queue?status=   → queue items
//   POST /api/social/queue           → create draft/scheduled item { body, platforms[], scheduled_at? }
//   POST /api/social/queue/update    → { id, status?, scheduled_at?, body?, platforms? }
//   POST /api/social/queue/delete    → { id }
//   POST /api/social/publish         → { id, dry_run? } → dispatch adapters per platform
//   GET  /api/social/health          → rail health + queue counts (telemetry)
//
// Design rules (do not weaken these):
// - Never fake a post. An adapter without credentials returns mode "dry-run" and the
//   queue item is stored with the real per-platform detail. `dry_run: true` forces the
//   no-network path even when credentials exist.
// - Substack has no public write API: its adapter is "manual" and only ever exports text.
// - Credentials are read from Cloudflare env. This file never logs or returns a value —
//   only env var NAMES and which of them are present.
//
// Routing note: Cloudflare maps functions/api/social.js to EXACTLY /api/social, so the
// subpaths above are served by functions/api/social/[[catchall]].js re-exporting this
// handler (same trap as farcaster — see supercompute-site-ops skill).

import { verifySession, isAdmin } from './auth.js';
import { allowOrigin } from '../_shared/cors-origins.js';

function corsHeaders(request) {
  const origin = request?.headers?.get('Origin') || '';
  const allow = allowOrigin(origin, request.env);
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    Vary: 'Origin',
  };
}

function json(data, status = 200, request) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(request) },
  });
}

// ── rail spec ───────────────────────────────────────────────────────────────
// `env` lists the variables the adapter reads. `capability` describes what the
// shipped code actually does — kept honest so the UI can label it.
const RAILS = {
  farcaster: {
    adapter: 'farcaster',
    capability: 'read + write via Neynar (POST /v2/farcaster/cast)',
    env: ['NEYNAR_API_KEY', 'NEYNAR_SIGNER_UUID'],
  },
  bluesky: {
    adapter: 'bluesky',
    capability: 'read + write via AT Protocol (createSession → createRecord)',
    env: ['BLUESKY_HANDLE', 'BLUESKY_APP_PASSWORD'],
  },
  x: {
    adapter: 'x',
    capability: 'write via X API v2 (POST /2/tweets, OAuth 1.0a user context)',
    env: ['X_API_KEY', 'X_API_SECRET', 'X_ACCESS_TOKEN', 'X_ACCESS_SECRET'],
  },
  tiktok: {
    adapter: 'stub',
    capability: 'status only — video upload is not implemented',
    env: ['TIKTOK_ACCESS_TOKEN'],
  },
  substack: {
    adapter: 'manual',
    capability: 'manual — no public write API, export/copy only',
    env: [],
  },
  lens: { adapter: 'stub', capability: 'not implemented', env: ['LENS_API_KEY'] },
  nostr: { adapter: 'stub', capability: 'not implemented', env: ['NOSTR_NSEC'] },
  youtube: { adapter: 'stub', capability: 'not implemented', env: ['YOUTUBE_API_KEY'] },
};

// Live status is derived from env presence at request time. Never fabricated:
// 'connected' only when every write credential the adapter reads is present.
function railStatus(id, env) {
  const spec = RAILS[id] || { adapter: 'stub', capability: 'unknown platform', env: [] };
  const present = spec.env.filter((n) => Boolean(env[n]));
  const missing = spec.env.filter((n) => !env[n]);
  let status;
  if (spec.env.length === 0) status = 'manual';
  else if (missing.length === 0) status = 'connected';
  else status = 'needs_key';

  // Coverage = fraction of the adapter's credentials present (telemetry, 0..1).
  const coverage = spec.env.length === 0 ? 1 : present.length / spec.env.length;
  return {
    status,
    mode: spec.capability,
    adapter: spec.adapter,
    required_env: spec.env,
    present_env: present,
    missing_env: missing,
    coverage,
  };
}

// ── admin gate ──────────────────────────────────────────────────────────────
async function requireAdmin(request, env) {
  if (!env?.DB) return { error: 'Database not configured', status: 503 };
  const auth = await verifySession(env, request.headers.get('Authorization'));
  if (!auth.valid) return { error: 'Unauthorized — valid session required', status: 401 };
  if (!(await isAdmin(env, auth.wallet))) {
    return { error: 'Forbidden: admin access required', status: 403 };
  }
  return { wallet: String(auth.wallet || '').toLowerCase() };
}

// ── adapters ────────────────────────────────────────────────────────────────
// Each returns { platform, ok, mode, detail, url? }. mode: live | dry-run | manual | unsupported

async function publishFarcaster(item, env) {
  const apiKey = env.NEYNAR_API_KEY;
  const signer = env.NEYNAR_SIGNER_UUID;
  if (!apiKey || !signer) {
    return { platform: 'farcaster', ok: false, mode: 'dry-run', detail: 'NEYNAR_API_KEY + NEYNAR_SIGNER_UUID required to publish' };
  }
  try {
    const res = await fetch('https://api.neynar.com/v2/farcaster/cast', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', api_key: apiKey },
      body: JSON.stringify({ signer_uuid: signer, text: String(item.body || '').slice(0, 1024) }),
    });
    const data = await res.json().catch(() => ({}));
    const hash = data?.cast?.hash;
    return {
      platform: 'farcaster',
      ok: res.ok,
      mode: 'live',
      detail: res.ok ? `cast ${hash || 'submitted'}` : `neynar HTTP ${res.status}`,
      url: hash ? `https://warpcast.com/~/conversations/${hash}` : undefined,
    };
  } catch (e) {
    return { platform: 'farcaster', ok: false, mode: 'live', detail: `neynar request failed: ${e.message}` };
  }
}

async function publishBluesky(item, env) {
  const handle = env.BLUESKY_HANDLE;
  const password = env.BLUESKY_APP_PASSWORD;
  if (!handle || !password) {
    return { platform: 'bluesky', ok: false, mode: 'dry-run', detail: 'BLUESKY_HANDLE + BLUESKY_APP_PASSWORD required' };
  }
  try {
    const sessionRes = await fetch('https://bsky.social/xrpc/com.atproto.server.createSession', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: handle, password }),
    });
    if (!sessionRes.ok) {
      return { platform: 'bluesky', ok: false, mode: 'live', detail: `login failed HTTP ${sessionRes.status}` };
    }
    const session = await sessionRes.json();
    const postRes = await fetch('https://bsky.social/xrpc/com.atproto.repo.createRecord', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.accessJwt}` },
      body: JSON.stringify({
        repo: session.did,
        collection: 'app.bsky.feed.post',
        record: { text: String(item.body || '').slice(0, 300), createdAt: new Date().toISOString() },
      }),
    });
    const post = await postRes.json().catch(() => ({}));
    const rkey = post?.uri ? String(post.uri).split('/').pop() : null;
    return {
      platform: 'bluesky',
      ok: postRes.ok,
      mode: 'live',
      detail: postRes.ok ? `post ${post?.uri || 'created'}` : `bluesky HTTP ${postRes.status}`,
      url: postRes.ok && rkey ? `https://bsky.app/profile/${handle}/post/${rkey}` : undefined,
    };
  } catch (e) {
    return { platform: 'bluesky', ok: false, mode: 'live', detail: `bluesky request failed: ${e.message}` };
  }
}

// OAuth 1.0a percent-encoding (RFC 5849 §3.6) — encodeURIComponent plus the
// three characters it leaves alone that OAuth requires escaped.
function pct(s) {
  return encodeURIComponent(s).replace(/[!*'()]/g, (c) => '%' + c.charCodeAt(0).toString(16).toUpperCase());
}

async function hmacSha1Base64(key, base) {
  const enc = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey('raw', enc.encode(key), { name: 'HMAC', hash: 'SHA-1' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', cryptoKey, enc.encode(base));
  let bin = '';
  for (const b of new Uint8Array(sig)) bin += String.fromCharCode(b);
  return btoa(bin);
}

// X API v2 write — POST /2/tweets with OAuth 1.0a user context (HMAC-SHA1).
async function publishX(item, env) {
  const consumerKey = env.X_API_KEY;
  const consumerSecret = env.X_API_SECRET;
  const token = env.X_ACCESS_TOKEN;
  const tokenSecret = env.X_ACCESS_SECRET;
  if (!consumerKey || !consumerSecret || !token || !tokenSecret) {
    return {
      platform: 'x',
      ok: false,
      mode: 'dry-run',
      detail: 'X_API_KEY/X_API_SECRET/X_ACCESS_TOKEN/X_ACCESS_SECRET required (OAuth 1.0a user context)',
    };
  }

  const url = 'https://api.x.com/2/tweets';
  const nonceBytes = new Uint8Array(16);
  crypto.getRandomValues(nonceBytes);
  const oauth = {
    oauth_consumer_key: consumerKey,
    oauth_nonce: Array.from(nonceBytes, (b) => b.toString(16).padStart(2, '0')).join(''),
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: String(Math.floor(Date.now() / 1000)),
    oauth_token: token,
    oauth_version: '1.0',
  };
  const paramString = Object.keys(oauth)
    .sort()
    .map((k) => `${pct(k)}=${pct(oauth[k])}`)
    .join('&');
  const base = `POST&${pct(url)}&${pct(paramString)}`;
  const signingKey = `${pct(consumerSecret)}&${pct(tokenSecret)}`;

  try {
    const signature = await hmacSha1Base64(signingKey, base);
    const header = 'OAuth ' + Object.keys({ ...oauth, oauth_signature: signature })
      .sort()
      .map((k) => `${pct(k)}="${pct(k === 'oauth_signature' ? signature : oauth[k])}"`)
      .join(', ');

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: header },
      body: JSON.stringify({ text: String(item.body || '').slice(0, 280) }),
    });
    const data = await res.json().catch(() => ({}));
    const id = data?.data?.id;
    return {
      platform: 'x',
      ok: res.ok,
      mode: 'live',
      detail: res.ok ? `tweet ${id || 'created'}` : `x HTTP ${res.status}${data?.detail ? `: ${data.detail}` : ''}`,
      url: id ? `https://x.com/i/web/status/${id}` : undefined,
    };
  } catch (e) {
    return { platform: 'x', ok: false, mode: 'live', detail: `x request failed: ${e.message}` };
  }
}

async function dispatch(item, env, platforms, dryRun) {
  const out = [];
  for (const platform of platforms) {
    if (dryRun) {
      const spec = RAILS[platform] || {};
      out.push({
        platform,
        ok: false,
        mode: 'dry-run',
        detail: `dry-run requested — no network call${spec.env?.length ? ` (would use ${spec.env.join(', ')})` : ''}`,
      });
      continue;
    }
    switch (platform) {
      case 'farcaster':
        out.push(await publishFarcaster(item, env));
        break;
      case 'bluesky':
        out.push(await publishBluesky(item, env));
        break;
      case 'x':
        out.push(await publishX(item, env));
        break;
      case 'substack':
        out.push({ platform, ok: false, mode: 'manual', detail: 'no public write API — copy the text and publish manually' });
        break;
      case 'tiktok':
        out.push({
          platform,
          ok: false,
          mode: env.TIKTOK_ACCESS_TOKEN ? 'manual' : 'dry-run',
          detail: env.TIKTOK_ACCESS_TOKEN ? 'token present, but video upload is out of scope for v1' : 'TIKTOK_ACCESS_TOKEN missing',
        });
        break;
      case 'lens':
      case 'nostr':
      case 'youtube':
      default:
        out.push({ platform, ok: false, mode: 'unsupported', detail: 'adapter not implemented yet — see the credentials sheet' });
        break;
    }
  }
  return out;
}

function summarise(results) {
  const liveOk = results.filter((r) => r.mode === 'live' && r.ok).length;
  const liveAttempted = results.filter((r) => r.mode === 'live').length;
  if (liveAttempted === 0) return 'dry_run';
  if (liveOk === 0) return 'failed';
  if (liveOk === liveAttempted) return 'posted';
  return 'partial';
}

// ── routes ──────────────────────────────────────────────────────────────────
export async function onRequest({ request, env }) {
  const url = new URL(request.url);
  const path = url.pathname.replace('/api/social', '') || '/';

  if (request.method === 'OPTIONS') return new Response(null, { headers: corsHeaders(request) });

  const gate = await requireAdmin(request, env);
  if (gate.error) return json({ error: gate.error }, gate.status, request);

  try {
    // ── GET /accounts — registry + live env status ──────────────────────────
    if (path === '/accounts' && request.method === 'GET') {
      const rows = await env.DB.prepare('SELECT * FROM social_accounts ORDER BY tier DESC, id').all();
      const accounts = (rows.results || []).map((row) => ({ ...row, ...railStatus(row.id, env) }));
      return json({ accounts }, 200, request);
    }

    // ── GET /queue ──────────────────────────────────────────────────────────
    if (path === '/queue' && request.method === 'GET') {
      const status = url.searchParams.get('status');
      const stmt = status
        ? env.DB.prepare('SELECT * FROM social_queue WHERE status = ? ORDER BY COALESCE(scheduled_at, created_at) DESC LIMIT 100').bind(status)
        : env.DB.prepare('SELECT * FROM social_queue ORDER BY COALESCE(scheduled_at, created_at) DESC LIMIT 100');
      const rows = await stmt.all();
      return json({ queue: rows.results || [] }, 200, request);
    }

    // ── POST /queue — create ────────────────────────────────────────────────
    if (path === '/queue' && request.method === 'POST') {
      const payload = await request.json().catch(() => null);
      if (!payload?.body || !Array.isArray(payload.platforms) || payload.platforms.length === 0) {
        return json({ error: 'body and platforms[] required' }, 400, request);
      }
      const unknown = payload.platforms.filter((p) => !Object.prototype.hasOwnProperty.call(RAILS, p));
      if (unknown.length) return json({ error: `unknown platform(s): ${unknown.join(', ')}` }, 400, request);

      const id = `sq_${crypto.randomUUID().slice(0, 12)}`;
      const scheduledAt = payload.scheduled_at ? Number(payload.scheduled_at) : null;
      const status = payload.status === 'scheduled' || scheduledAt ? 'scheduled' : 'draft';
      await env.DB.prepare(
        'INSERT INTO social_queue (id, body, platforms, status, scheduled_at, created_by) VALUES (?, ?, ?, ?, ?, ?)'
      )
        .bind(id, String(payload.body).slice(0, 8000), JSON.stringify(payload.platforms), status, scheduledAt, gate.wallet)
        .run();
      const row = await env.DB.prepare('SELECT * FROM social_queue WHERE id = ?').bind(id).first();
      return json({ item: row }, 201, request);
    }

    // ── POST /queue/update ──────────────────────────────────────────────────
    if (path === '/queue/update' && request.method === 'POST') {
      const payload = await request.json().catch(() => null);
      if (!payload?.id) return json({ error: 'id required' }, 400, request);
      const fields = [];
      const values = [];
      if (payload.status) { fields.push('status = ?'); values.push(String(payload.status)); }
      if (payload.body) { fields.push('body = ?'); values.push(String(payload.body).slice(0, 8000)); }
      if (payload.platforms) { fields.push('platforms = ?'); values.push(JSON.stringify(payload.platforms)); }
      if (payload.scheduled_at !== undefined) {
        fields.push('scheduled_at = ?');
        values.push(payload.scheduled_at ? Number(payload.scheduled_at) : null);
      }
      if (fields.length === 0) return json({ error: 'nothing to update' }, 400, request);
      fields.push('updated_at = unixepoch()');
      values.push(payload.id);
      await env.DB.prepare(`UPDATE social_queue SET ${fields.join(', ')} WHERE id = ?`).bind(...values).run();
      const row = await env.DB.prepare('SELECT * FROM social_queue WHERE id = ?').bind(payload.id).first();
      if (!row) return json({ error: 'queue item not found' }, 404, request);
      return json({ item: row }, 200, request);
    }

    // ── POST /queue/delete ──────────────────────────────────────────────────
    if (path === '/queue/delete' && request.method === 'POST') {
      const payload = await request.json().catch(() => null);
      if (!payload?.id) return json({ error: 'id required' }, 400, request);
      const existing = await env.DB.prepare('SELECT id FROM social_queue WHERE id = ?').bind(payload.id).first();
      if (!existing) return json({ error: 'queue item not found' }, 404, request);
      await env.DB.prepare('DELETE FROM social_queue WHERE id = ?').bind(payload.id).run();
      return json({ deleted: payload.id }, 200, request);
    }

    // ── POST /publish — dispatch ────────────────────────────────────────────
    if (path === '/publish' && request.method === 'POST') {
      const payload = await request.json().catch(() => null);
      if (!payload?.id) return json({ error: 'id required' }, 400, request);
      const item = await env.DB.prepare('SELECT * FROM social_queue WHERE id = ?').bind(payload.id).first();
      if (!item) return json({ error: 'queue item not found' }, 404, request);

      let platforms = [];
      try { platforms = JSON.parse(item.platforms); } catch { platforms = []; }
      if (!Array.isArray(platforms) || platforms.length === 0) {
        return json({ error: 'queue item has no target platforms' }, 400, request);
      }

      const results = await dispatch(item, env, platforms, Boolean(payload.dry_run));
      const status = summarise(results);
      const postedAt = results.some((r) => r.mode === 'live' && r.ok) ? Math.floor(Date.now() / 1000) : null;

      await env.DB.prepare(
        'UPDATE social_queue SET status = ?, results = ?, posted_at = ?, updated_at = unixepoch() WHERE id = ?'
      )
        .bind(status, JSON.stringify(results), postedAt, item.id)
        .run();

      if (postedAt) {
        for (const platform of platforms) {
          await env.DB.prepare('UPDATE social_accounts SET last_post_at = unixepoch(), updated_at = unixepoch() WHERE id = ?')
            .bind(platform)
            .run();
        }
      }
      return json({ id: item.id, status, results }, 200, request);
    }

    // ── GET /health — telemetry ─────────────────────────────────────────────
    if (path === '/health' && request.method === 'GET') {
      const rows = await env.DB.prepare('SELECT id, platform, handle, tier, adapter, last_post_at FROM social_accounts ORDER BY tier DESC, id').all();
      const accounts = (rows.results || []).map((row) => ({ ...row, ...railStatus(row.id, env) }));
      const counts = await env.DB.prepare('SELECT status, COUNT(*) AS n FROM social_queue GROUP BY status').all();
      const connected = accounts.filter((a) => a.status === 'connected').length;
      return json(
        {
          accounts,
          queue_counts: counts.results || [],
          telemetry: {
            rails_total: accounts.length,
            rails_connected: connected,
            rails_needs_key: accounts.filter((a) => a.status === 'needs_key').length,
            rails_manual: accounts.filter((a) => a.status === 'manual').length,
          },
        },
        200,
        request
      );
    }

    return json(
      {
        endpoints: {
          'GET /api/social/accounts': 'platform registry + connection status from env',
          'GET /api/social/queue?status=': 'queue items',
          'POST /api/social/queue': 'create item { body, platforms[], scheduled_at? }',
          'POST /api/social/queue/update': 'update item { id, status?, body?, platforms?, scheduled_at? }',
          'POST /api/social/queue/delete': 'delete item { id }',
          'POST /api/social/publish': 'dispatch item { id, dry_run? } (dry-run without credentials)',
          'GET /api/social/health': 'rail health + queue counts',
        },
      },
      200,
      request
    );
  } catch (err) {
    // Never let a DB error become an HTML 500 — the client json()'s every response.
    return json({ error: 'social command center error', detail: String(err?.message || err) }, 500, request);
  }
}
