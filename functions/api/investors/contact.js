// functions/api/investors/contact.js
// POST /api/investors/contact — public intake for the /investors page.
//
// Body: { name, email, org?, ticket_size?, message? }
//   - name + email + message are required, others optional.
//   - All freeform text fields are length-capped server-side.
//   - Stores the row in D1 (supercompute-db.investor_contacts).
//   - If ZAPIER_INVESTORS_HOOK is set as a Pages secret/variable, fires the
//     payload to Zapier asynchronously. Failures are recorded against the row
//     so Mone can retry from the admin dashboard.
//
// Hard rules (from the kanban card):
//   - Never store or forward raw IP. SHA-256 hash only, for spam correlation.
//   - Never invent financial claims. There is no "ticket size bucket" math,
//     just a freeform text field Mone reads.
//   - Do NOT write a securities disclaimer here. That's counsel's job.

import { json, verifySession } from '../auth.js';

// Tunables — keep these in this file rather than env so the limits are
// obvious to anyone reading the code.
const MAX_NAME = 120;
const MAX_EMAIL = 200;
const MAX_ORG = 200;
const MAX_TICKET = 60;
const MAX_MESSAGE = 4000;
const ZAPIER_TIMEOUT_MS = 4000;

// Best-effort SHA-256 for IP hashing. Falls back to a constant when the
// runtime doesn't expose crypto.subtle (Cloudflare Workers does, but if a
// Pages preview environment is somehow stripped we still degrade safely).
async function sha256Hex(input) {
  try {
    if (typeof crypto !== 'undefined' && crypto.subtle) {
      const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
      return Array.from(new Uint8Array(buf))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
    }
  } catch { /* fall through */ }
  return 'unavailable';
}

function trim(value, max) {
  if (typeof value !== 'string') return '';
  const t = value.trim();
  if (t.length <= max) return t;
  return t.slice(0, max);
}

function corsHeaders(reqOrigin) {
  let allowedOrigin = 'https://supercompute.io';
  if (reqOrigin) {
    try {
      const host = new URL(reqOrigin).hostname;
      const allowed =
        host === 'supercompute.io' ||
        host === 'supercompute.pages.dev' ||
        host === 'localhost' ||
        host === '127.0.0.1' ||
        host.endsWith('.pages.dev') ||
        host.endsWith('.cloudflarestaging.com') ||
        host.endsWith('.ngrok-free.app');
      if (allowed) allowedOrigin = reqOrigin;
    } catch {}
  }
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

// Lightweight email regex — full RFC validation belongs upstream. This is
// just to catch obvious typos before we hit D1.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function fireZapier(webhookUrl, payload) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ZAPIER_TIMEOUT_MS);
  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: ctrl.signal,
    });
    return { ok: res.ok, status: res.status };
  } catch (err) {
    return { ok: false, status: 0, error: err?.message ?? 'fetch_failed' };
  } finally {
    clearTimeout(timer);
  }
}

export async function onRequest({ request, env }) {
  const cors = corsHeaders(request.headers.get('Origin'));
  const respond = (data, status = 200) =>
    new Response(JSON.stringify(data), {
      status,
      headers: { ...cors, 'Content-Type': 'application/json' },
    });

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: cors });
  }
  if (request.method === 'GET') {
    return respond({
      ok: true,
      endpoint: 'POST /api/investors/contact',
      fields: ['name', 'email', 'org', 'ticket_size', 'message'],
    });
  }
  if (request.method !== 'POST') {
    return respond({ ok: false, error: 'method_not_allowed' }, 405);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return respond({ ok: false, error: 'invalid_json' }, 400);
  }
  if (!body || typeof body !== 'object') {
    return respond({ ok: false, error: 'invalid_body' }, 400);
  }

  const name = trim(body.name, MAX_NAME);
  const email = trim(body.email, MAX_EMAIL).toLowerCase();
  const org = trim(body.org, MAX_ORG);
  const ticket_size = trim(body.ticket_size, MAX_TICKET);
  const message = trim(body.message, MAX_MESSAGE);

  if (!name) return respond({ ok: false, error: 'name_required' }, 400);
  if (!email) return respond({ ok: false, error: 'email_required' }, 400);
  if (!EMAIL_RE.test(email)) return respond({ ok: false, error: 'email_invalid' }, 400);
  if (!message) return respond({ ok: false, error: 'message_required' }, 400);

  // Optional: if the caller is logged in, stamp the row with their wallet so
  // the admin dashboard can join contacts → users. Never required.
  let wallet = null;
  try {
    const { valid, wallet: w } = await verifySession(env, request.headers.get('Authorization'));
    if (valid && w) wallet = w.toLowerCase();
  } catch {}

  // Hash IP for spam correlation. Raw IP is never stored or forwarded.
  const ipHash = await sha256Hex(
    request.headers.get('CF-Connecting-IP') ||
      request.headers.get('X-Forwarded-For') ||
      'unknown',
  );
  const userAgent = (request.headers.get('User-Agent') || '').slice(0, 500);

  const id = crypto.randomUUID
    ? crypto.randomUUID()
    : `inv_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

  let zapierStatus = 'skipped';
  if (!env?.ZAPIER_INVESTORS_HOOK) {
    zapierStatus = 'skipped';
  } else if (!env?.DB) {
    zapierStatus = 'skipped';
  } else {
    // We attempt to write to D1 first; if D1 fails we still try to forward
    // to Zapier (Mone would rather get the lead than lose it to a transient
    // DB blip). Best-effort ordering.
    let dbOk = false;
    try {
      await env.DB.prepare(
        `INSERT INTO investor_contacts
           (id, name, email, org, ticket_size, message, ip_hash, user_agent, zapier_status, contacted_back)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
      )
        .bind(id, name, email, org, ticket_size, message, ipHash, userAgent, 'pending')
        .run();
      dbOk = true;
    } catch (err) {
      console.error('investor_contacts insert failed', err);
    }

    const zapPayload = {
      id,
      name,
      email,
      org,
      ticket_size,
      message,
      wallet,
      source: 'supercompute.io/investors',
      received_at: new Date().toISOString(),
      db_written: dbOk,
    };
    const zap = await fireZapier(env.ZAPIER_INVESTORS_HOOK, zapPayload);
    zapierStatus = zap.ok ? 'sent' : 'failed';

    if (dbOk) {
      try {
        await env.DB.prepare(
          'UPDATE investor_contacts SET zapier_status = ?, updated_at = unixepoch() WHERE id = ?',
        )
          .bind(zapierStatus, id)
          .run();
      } catch (err) {
        console.error('investor_contacts status update failed', err);
      }
    }
    return respond({ ok: true, id, zapier_status: zapierStatus });
  }

  // No Zapier hook configured — write to D1 only, status stays 'skipped'.
  if (env?.DB) {
    try {
      await env.DB.prepare(
        `INSERT INTO investor_contacts
           (id, name, email, org, ticket_size, message, ip_hash, user_agent, zapier_status, contacted_back)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
      )
        .bind(id, name, email, org, ticket_size, message, ipHash, userAgent, zapierStatus)
        .run();
    } catch (err) {
      console.error('investor_contacts insert failed', err);
      return respond({ ok: false, error: 'storage_unavailable' }, 503);
    }
  } else {
    // No D1 in this environment either — log to console so we don't lose the
    // lead entirely. In production env.DB is always bound.
    console.log('investor_contact (no storage)', { id, name, email, org, ticket_size, message });
  }

  return respond({ ok: true, id, zapier_status: zapierStatus });
}

export { corsHeaders, sha256Hex };