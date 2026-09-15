// functions/api/subscribers.js — Subscriber onboarding funnel backend.
// POST /api/subscribers        — create or update a subscriber (idempotent on wallet+email)
// GET  /api/subscribers/me     — get current subscriber (auth required, by wallet)
// GET  /api/subscribers?tier=X — admin-only tier stats

import { json } from './auth.js';
import { TIERS, isValidTier, defaultExpirySeconds } from '../../lib/tiers.js';
import { corsOrigin, corsHeadersFor } from '../_shared/cors.js';

const VALID_TIERS = ['free', 'builder', 'operator', 'syndicate', 'lead'];

function generateId() {
  const a = new Uint8Array(16);
  crypto.getRandomValues(a);
  return Array.from(a, b => b.toString(16).padStart(2, '0')).join('');
}

function isValidAddress(address) {
  return /^0x[0-9a-fA-F]{40}$/.test(address || '');
}

function isValidEmail(email) {
  return typeof email === 'string' && email.length <= 320 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function getSessionWallet(env, request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ') || !env?.DB) return null;
  const sid = authHeader.slice(7);
  try {
    const row = await env.DB.prepare(
      'SELECT wallet_address FROM sessions WHERE id = ? AND expires_at > ?'
    ).bind(sid, Math.floor(Date.now() / 1000)).first();
    return row?.wallet_address?.toLowerCase() || null;
  } catch { return null; }
}

export async function onRequest({ request, env }) {
  // Exact-origin allowlist — functions/_shared/cors.js (SEC-F4). The resolved
  // origin never echoes a *.pages.dev / ngrok / localhost host that is not on
  // env.CORS_ORIGIN, and the headers carry Vary: Origin.
  const origin = corsOrigin(request, env);
  const j = (data, status = 200) => json(data, status, origin);
  const headers = corsHeadersFor(request, env);

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers });
  }

  const url = new URL(request.url);
  const subPath = url.pathname.replace('/api/subscribers', '') || '/';

  // GET /api/subscribers/me — current subscriber by session wallet
  if (request.method === 'GET' && subPath === '/me') {
    const wallet = await getSessionWallet(env, request);
    if (!wallet) return j({ subscriber: null }, 200);
    if (!env?.DB) return j({ subscriber: null }, 200);
    try {
      const row = await env.DB.prepare(
        'SELECT * FROM subscribers WHERE wallet_address = ? ORDER BY joined_at DESC LIMIT 1'
      ).bind(wallet).first();
      return j({ subscriber: row || null });
    } catch (e) {
      return j({ subscriber: null, error: 'db_error', message: String(e) }, 500);
    }
  }

  // GET /api/subscribers?tier=X — admin-only tier stats
  if (request.method === 'GET' && subPath === '/') {
    // Admin check via session
    const wallet = await getSessionWallet(env, request);
    let isAdmin = false;
    if (wallet && env?.DB) {
      try {
        const r = await env.DB.prepare(
          'SELECT role FROM admin_wallets WHERE wallet_address = ?'
        ).bind(wallet).first();
        isAdmin = r?.role === 'admin';
      } catch {}
    }
    if (!isAdmin) return j({ error: 'admin only' }, 403);

    if (!env?.DB) return j({ tiers: {}, total: 0 }, 200);
    try {
      const rows = await env.DB.prepare(
        'SELECT tier, status, COUNT(*) as count FROM subscribers GROUP BY tier, status'
      ).all();
      const tiers = {};
      let total = 0;
      for (const r of (rows.results || [])) {
        if (!tiers[r.tier]) tiers[r.tier] = { active: 0, pending: 0, expired: 0, cancelled: 0, total: 0 };
        tiers[r.tier][r.status] = (tiers[r.tier][r.status] || 0) + r.count;
        tiers[r.tier].total += r.count;
        total += r.count;
      }
      return j({ tiers, total });
    } catch (e) {
      return j({ error: 'db_error', message: String(e) }, 500);
    }
  }

  // POST /api/subscribers — create or update a subscriber
  if (request.method === 'POST' && (subPath === '/' || subPath === '')) {
    let body;
    try { body = await request.json(); } catch { return j({ error: 'invalid JSON' }, 400); }

    const { wallet: rawWallet, email, tier, source, tx_hash, metadata } = body || {};

    if (!isValidTier(tier || '')) return j({ error: 'invalid tier', valid: VALID_TIERS }, 400);

    const wallet = rawWallet ? rawWallet.toLowerCase() : null;
    if (wallet && !isValidAddress(wallet)) return j({ error: 'invalid wallet address' }, 400);
    if (!wallet && !email) return j({ error: 'wallet or email required' }, 400);
    if (email && !isValidEmail(email)) return j({ error: 'invalid email' }, 400);

    if (!env?.DB) {
      // No DB → echo what we'd write, so the funnel still works in dry-runs
      return j({
        ok: true,
        subscriber: {
          id: generateId(),
          wallet_address: wallet,
          email: email || null,
          tier,
          status: tier === 'lead' ? 'active' : 'pending',
          joined_at: Math.floor(Date.now() / 1000),
          expires_at: defaultExpirySeconds(tier),
          source: source || 'web',
          tx_hash: tx_hash || null,
          metadata: metadata ? JSON.stringify(metadata) : null,
        },
        dry_run: true,
      }, 200);
    }

    try {
      // Look up existing by wallet (priority) or email
      let existing = null;
      if (wallet) {
        existing = await env.DB.prepare(
          'SELECT * FROM subscribers WHERE wallet_address = ? LIMIT 1'
        ).bind(wallet).first();
      } else if (email) {
        existing = await env.DB.prepare(
          'SELECT * FROM subscribers WHERE email = ? LIMIT 1'
        ).bind(email.toLowerCase()).first();
      }

      const id = existing?.id || generateId();
      const joinedAt = existing?.joined_at || Math.floor(Date.now() / 1000);
      const expiresAt = defaultExpirySeconds(tier);
      // Lead tier for email-only capture — auto-activates (no payment).
      // Paid tiers stay 'pending' until payment rails confirm.
      const status = tier === 'lead' ? 'active' : 'pending';
      const metaJson = metadata ? JSON.stringify(metadata) : null;

      if (existing) {
        await env.DB.prepare(
          `UPDATE subscribers SET
             tier = ?, status = ?, expires_at = ?, source = COALESCE(?, source),
             tx_hash = COALESCE(?, tx_hash), metadata = COALESCE(?, metadata),
             updated_at = ?
           WHERE id = ?`
        ).bind(tier, status, expiresAt, source || null, tx_hash || null, metaJson, Math.floor(Date.now() / 1000), id).run();
      } else {
        await env.DB.prepare(
          `INSERT INTO subscribers
             (id, wallet_address, email, tier, status, joined_at, expires_at, source, tx_hash, metadata, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        ).bind(
          id,
          wallet,
          email ? email.toLowerCase() : null,
          tier,
          status,
          joinedAt,
          expiresAt,
          source || 'web',
          tx_hash || null,
          metaJson,
          Math.floor(Date.now() / 1000)
        ).run();
      }

      const row = await env.DB.prepare(
        'SELECT * FROM subscribers WHERE id = ?'
      ).bind(id).first();

      return j({ ok: true, subscriber: row }, 200);
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      // UNIQUE constraint collision on email — try update path
      if (message.includes('UNIQUE constraint failed') && email) {
        try {
          await env.DB.prepare(
            `UPDATE subscribers SET tier = ?, status = ?, expires_at = ?, updated_at = ? WHERE email = ?`
          ).bind(tier, tier === 'lead' ? 'active' : 'pending', defaultExpirySeconds(tier), Math.floor(Date.now() / 1000), email.toLowerCase()).run();
          const row = await env.DB.prepare('SELECT * FROM subscribers WHERE email = ?').bind(email.toLowerCase()).first();
          return j({ ok: true, subscriber: row }, 200);
        } catch {}
      }
      return j({ error: 'db_error', message }, 500);
    }
  }

  return j({
    endpoints: {
      'POST /api/subscribers': 'create or update subscriber (wallet|email, tier)',
      'GET /api/subscribers/me': 'current subscriber by session',
      'GET /api/subscribers': 'admin-only tier stats',
    },
    tiers: TIERS.map(t => ({ id: t.id, name: t.name, price: t.priceLabel })),
  }, 200);
}