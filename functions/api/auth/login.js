import { generateNonce, hexToBytes, isValidAddress, json } from '../auth.js';
const ADMIN_QUERY = 'SELECT role FROM admin_wallets WHERE wallet_address = ?';
async function isAdmin(env, wallet) {
  if (!env?.DB) return false;
  try {
    const r = await env.DB.prepare(ADMIN_QUERY).bind(wallet.toLowerCase()).first();
    return r?.role === 'admin';
  } catch { return false; }
}
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW = 900;
async function checkRateLimit(env, address) {
  const key = `ratelimit:${address.toLowerCase()}`;
  const data = await env.CACHE.get(key);
  if (!data) return { allowed: true, remaining: RATE_LIMIT_MAX };
  const { count, firstAttempt } = JSON.parse(data);
  const elapsed = Math.floor(Date.now() / 1000) - firstAttempt;
  if (elapsed > RATE_LIMIT_WINDOW) { await env.CACHE.delete(key); return { allowed: true, remaining: RATE_LIMIT_MAX }; }
  if (count >= RATE_LIMIT_MAX) return { allowed: false, remaining: 0, resetIn: RATE_LIMIT_WINDOW - elapsed };
  return { allowed: true, remaining: RATE_LIMIT_MAX - count };
}
async function recordFailedAttempt(env, address) {
  const key = `ratelimit:${address.toLowerCase()}`;
  const raw = await env.CACHE.get(key);
  let data = { count: 0, firstAttempt: Math.floor(Date.now() / 1000) };
  if (raw) {
    const p = JSON.parse(raw);
    data = Math.floor(Date.now() / 1000) - p.firstAttempt > RATE_LIMIT_WINDOW ? { count: 0, firstAttempt: Math.floor(Date.now() / 1000) } : p;
  }
  data.count++;
  await env.CACHE.put(key, JSON.stringify(data), { expirationTtl: RATE_LIMIT_WINDOW });
}
export async function onRequest({ request, env }) {
  try {
    const reqOrigin = request.headers.get('Origin') || '';
    const allowedOrigin = (!reqOrigin || reqOrigin.includes('supercompute.io') || reqOrigin.includes('localhost') || reqOrigin.includes('127.0.0.1') || reqOrigin.includes('pages.dev') || reqOrigin.includes('ngrok-free.app') || reqOrigin.includes('cloudflarestaging')) ? reqOrigin : 'https://supercompute.io';
    const cors = { 'Access-Control-Allow-Origin': allowedOrigin, 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, Authorization' };
    const j = (data, s = 200) => json(data, s, allowedOrigin);
    if (request.method === 'OPTIONS') return new Response(null, { headers: cors });
    if (request.method !== 'POST') return j({ error: 'POST required' }, 405);
    const body = await request.json().catch(() => ({}));
    const { address, signature, nonce } = body;
    if (!address || !signature) return j({ error: 'address and signature required' }, 400);
    const wallet = address.toLowerCase();
    if (!isValidAddress(wallet)) return j({ error: 'Invalid address' }, 400);
    if (env?.CACHE) {
      const rl = await checkRateLimit(env, wallet);
      if (!rl.allowed) return j({ error: 'Too many login attempts', retryAfter: rl.resetIn }, 429);
    }
    const sigBytes = typeof signature === 'string' ? hexToBytes(signature) : signature;
    if (!sigBytes || sigBytes.length !== 65) { if (env?.CACHE) await recordFailedAttempt(env, wallet); return j({ error: 'Invalid signature format' }, 400); }
    const v = sigBytes[64];
    if (v !== 27 && v !== 28 && v !== 31 && v !== 32) { if (env?.CACHE) await recordFailedAttempt(env, wallet); return j({ error: 'Invalid signature v value' }, 400); }
    if (env?.CACHE && nonce) await env.CACHE.delete(`siwe:nonce:${nonce}`);
    const sessionId = generateNonce();
    const sessionExpiry = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60;
    if (env?.DB) {
      await env.DB.prepare('INSERT OR REPLACE INTO sessions (id, wallet_address, expires_at) VALUES (?, ?, ?)').bind(sessionId, wallet, sessionExpiry).run();
    }
    const admin = await isAdmin(env, wallet);
    const formatAddr = (a) => a ? a.slice(0, 6) + '...' + a.slice(-4) : '';
    if (env?.DB) {
      const existing = await env.DB.prepare('SELECT id, role FROM users WHERE wallet_address = ?').bind(wallet).first();
      if (!existing) {
        await env.DB.prepare('INSERT INTO users (id, wallet_address, name, role) VALUES (?, ?, ?, ?)').bind(generateNonce(), wallet, formatAddr(wallet), admin ? 'admin' : 'user').run();
      } else if (existing.role !== (admin ? 'admin' : 'user')) {
        await env.DB.prepare('UPDATE users SET role = ? WHERE wallet_address = ?').bind(admin ? 'admin' : 'user', wallet).run();
      }
    }
    return j({ success: true, session: sessionId, user: { id: wallet, name: formatAddr(wallet), address: wallet, role: admin ? 'admin' : 'user' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Internal error', message: e instanceof Error ? e.message : String(e) }), { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } });
  }
}
