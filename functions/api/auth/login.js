import { generateNonce, hexToBytes, isValidAddress, json } from '../auth.js';
import { recoverMessageAddress } from 'viem/utils';

// ── SIWE message-content contract (nonce-omission fix, t_09e0dbd1) ─────────
// The only messages accepted are ones matching what /api/auth/message issues.
// This blocks forged CACHE entries (evil domain/URI/chain, wrong nonce binding)
// even when the signature itself is valid.
const SIWE_DOMAIN = 'supercompute.io';
const SIWE_URI = 'https://supercompute.io';
const SIWE_VERSION = '1';
const SIWE_CHAIN_ID = '8453';

// Parses the canonical SIWE header block and returns null if valid,
// otherwise a human-readable reason string.
function validateSiweMessage(message, nonce) {
  if (typeof message !== 'string') return 'Message must be a string';
  const lines = message.split('\n');
  const domainLine = (lines[0] || '').trim();
  if (domainLine !== `${SIWE_DOMAIN} wants you to sign in with your Ethereum account.`) {
    return 'Wrong SIWE domain';
  }
  const fields = {};
  for (const line of lines) {
    const m = line.match(/^([A-Za-z ]+): (.*)$/);
    if (m) fields[m[1].trim()] = m[2].trim();
  }
  if (fields['URI'] !== SIWE_URI) return 'Wrong SIWE URI';
  if (fields['Version'] !== SIWE_VERSION) return 'Wrong SIWE version';
  if (fields['Chain ID'] !== SIWE_CHAIN_ID) return 'Wrong SIWE chain';
  if (fields['Nonce'] !== nonce) return 'Nonce mismatch in SIWE message';
  const expRaw = fields['Expiration Time'];
  if (!expRaw) return 'Missing Expiration Time';
  const exp = new Date(expRaw).getTime();
  if (Number.isNaN(exp)) return 'Invalid Expiration Time';
  if (exp <= Date.now()) return 'SIWE message expired';
  return null;
}

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
  const reqOrigin = request.headers.get('Origin') || '';
  let allowedOrigin = 'https://supercompute.io';
  if (reqOrigin) {
    try {
      const u = new URL(reqOrigin);
      const host = u.hostname;
      const devHost = host === 'localhost' || host === '127.0.0.1';
      // Only exact owned HTTPS origins are reflected; no wildcard *.pages.dev
      // (would reflect attacker.pages.dev). Preview branches are
      // <branch>.supercompute.pages.dev, covered by the owned suffix below.
      const httpsOk = u.protocol === 'https:' && (u.port === '' || u.port === '443');
      const allowed =
        (httpsOk && (host === 'supercompute.io' || host === 'staging.supercompute.io' || host === 'supercompute.pages.dev' || host.endsWith('.supercompute.pages.dev') || host.endsWith('.cloudflarestaging.com') || host.endsWith('.ngrok-free.app'))) ||
        devHost; // local dev servers run over http on arbitrary ports
      if (allowed) allowedOrigin = reqOrigin;
    } catch {}
  }
  const cors = { 'Access-Control-Allow-Origin': allowedOrigin, 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, Authorization' };
  const j = (data, s = 200) => json(data, s, allowedOrigin);
  try {
    if (request.method === 'OPTIONS') return new Response(null, { headers: cors });
    if (request.method !== 'POST') return j({ error: 'POST required' }, 405);
    const body = await request.json().catch(() => ({}));
    const { address, signature, nonce } = body;
    // Security contract (t_09e0dbd1): nonce is REQUIRED. Omitting it used to
    // skip verification entirely and mint a session — the critical bypass.
    if (!address || !signature || !nonce) return j({ error: 'address, signature and nonce are required' }, 400);
    const wallet = address.toLowerCase();
    if (!isValidAddress(wallet)) return j({ error: 'Invalid address' }, 400);
    // CACHE binding is mandatory — without it there is no stored-message
    // contract to verify against, so login must fail closed.
    if (!env?.CACHE) return j({ error: 'Server misconfigured: CACHE binding missing' }, 500);
    const rl = await checkRateLimit(env, wallet);
    if (!rl.allowed) return j({ error: 'Too many login attempts', retryAfter: rl.resetIn }, 429);
    const sigBytes = typeof signature === 'string' ? hexToBytes(signature) : signature;
    if (!sigBytes || sigBytes.length !== 65) { await recordFailedAttempt(env, wallet); return j({ error: 'Invalid signature format' }, 400); }
    const v = sigBytes[64];
    // Normalize EIP-155 v values (chain_id * 2 + 35/36) to 27/28
    const normalizedV = v >= 35 ? (v % 2 === 0 ? 28 : 27) : v;
    if (normalizedV !== 27 && normalizedV !== 28 && normalizedV !== 31 && normalizedV !== 32) { await recordFailedAttempt(env, wallet); return j({ error: 'Invalid signature v value' }, 400); }
    // Stored-message contract: retrieve the exact SIWE message that was issued.
    // This branch is unconditional — no nonce, no message, no login.
    const storedMessage = await env.CACHE.get(`siwe:msg:${nonce}`);
    if (!storedMessage) { await recordFailedAttempt(env, wallet); return j({ error: 'Expired or invalid session. Request a new nonce.' }, 400); }
    // Content validation: reject forged messages (evil domain/URI/chain, wrong
    // nonce binding, expired) even when the signature recovers correctly.
    const contentError = validateSiweMessage(storedMessage, nonce);
    if (contentError) { await recordFailedAttempt(env, wallet); return j({ error: `Invalid SIWE message: ${contentError}` }, 401); }
    // Verify the signature by recovering the address from the stored message
    try {
      const recoveredAddress = await recoverMessageAddress({
        message: storedMessage,
        signature,
      });
      if (recoveredAddress.toLowerCase() !== wallet) {
        await recordFailedAttempt(env, wallet);
        return j({ error: 'Signature does not match address' }, 401);
      }
    } catch (verifyErr) {
      const errMsg = verifyErr instanceof Error ? verifyErr.message : String(verifyErr);
      await recordFailedAttempt(env, wallet);
      return j({ error: 'Signature verification failed', detail: errMsg }, 401);
    }
    // Clean up (single-use nonce + message)
    await env.CACHE.delete(`siwe:msg:${nonce}`);
    await env.CACHE.delete(`siwe:nonce:${nonce}`);
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
        // email uses wallet-derived placeholder to avoid UNIQUE collisions
        // on live D1 where users.email is NOT NULL + UNIQUE.
        // Fix: run schema migration to make it nullable + remove unique.
        const placeholderEmail = `${wallet}@placeholder.supercompute`;
        await env.DB.prepare('INSERT INTO users (id, wallet_address, email, name, role) VALUES (?, ?, ?, ?, ?)').bind(generateNonce(), wallet, placeholderEmail, formatAddr(wallet), admin ? 'admin' : 'user').run();
      } else if (existing.role !== (admin ? 'admin' : 'user')) {
        await env.DB.prepare('UPDATE users SET role = ? WHERE wallet_address = ?').bind(admin ? 'admin' : 'user', wallet).run();
      }
    }
    return j({ success: true, session: sessionId, user: { id: wallet, name: formatAddr(wallet), address: wallet, role: admin ? 'admin' : 'user' } });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return j({ error: 'Internal error', message }, 500);
  }
}
