// functions/api/auth.js — SIWE Auth + EIP-191 Verification
// Shared: verifySession, isAdmin, handleAuth

// ── Helpers ──────────────────────────────────────────────────────────────────
function hexToBytes(hex) {
  const h = hex.replace('0x', '');
  return new Uint8Array(h.length / 2).map((_, i) => parseInt(h.substr(i * 2, 2), 16));
}

function generateNonce() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
}

function isValidAddress(address) {
  if (!address || !address.startsWith('0x')) return false;
  if (address.length !== 42) return false;
  return /^0x[0-9a-fA-F]{40}$/.test(address);
}

function formatAddress(address) {
  if (!address) return '';
  return address.slice(0, 6) + '...' + address.slice(-4);
}

// ── SIWE Message Generator ───────────────────────────────────────────────────
function generateSiweMessage(address, nonce) {
  const now = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 min expiry
  return [
    'supercompute.io wants you to sign in with your Ethereum account.',
    '',
    'URI: https://supercompute.io',
    'Version: 1',
    'Chain ID: 8453',
    `Nonce: ${nonce}`,
    `Expiration Time: ${now}`,
    '',
    'Sign in to SUPERCOMPUTE Web3 Platform',
  ].join('\n');
}

// ── Rate Limiting ───────────────────────────────────────────────────────────
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW = 900; // 15 min

async function checkRateLimit(env, address) {
  const key = `ratelimit:${address.toLowerCase()}`;
  const data = await env.CACHE.get(key);
  if (!data) return { allowed: true, remaining: RATE_LIMIT_MAX };

  const { count, firstAttempt } = JSON.parse(data);
  const elapsed = Math.floor(Date.now() / 1000) - firstAttempt;
  if (elapsed > RATE_LIMIT_WINDOW) {
    await env.CACHE.delete(key);
    return { allowed: true, remaining: RATE_LIMIT_MAX };
  }
  if (count >= RATE_LIMIT_MAX) {
    return { allowed: false, remaining: 0, resetIn: RATE_LIMIT_WINDOW - elapsed };
  }
  return { allowed: true, remaining: RATE_LIMIT_MAX - count };
}

async function recordFailedAttempt(env, address) {
  const key = `ratelimit:${address.toLowerCase()}`;
  const raw = await env.CACHE.get(key);
  let data = { count: 0, firstAttempt: Math.floor(Date.now() / 1000) };
  if (raw) {
    const p = JSON.parse(raw);
    data = Math.floor(Date.now() / 1000) - p.firstAttempt > RATE_LIMIT_WINDOW
      ? { count: 0, firstAttempt: Math.floor(Date.now() / 1000) }
      : p;
  }
  data.count++;
  await env.CACHE.put(key, JSON.stringify(data), { expirationTtl: RATE_LIMIT_WINDOW });
}

// ── ENS Resolution ───────────────────────────────────────────────────────────
// Direct RPC namehash requires keccak-256, which Web Crypto API doesn't support.
// Use public ENS resolution APIs instead (works in Cloudflare Workers).

async function resolveENS(addressOrName) {
  // Already an address
  if (addressOrName.startsWith('0x') && addressOrName.length === 42) {
    return addressOrName.toLowerCase();
  }
  // ENS name — resolve via public API
  try {
    const res = await fetch(`https://api.ensideas.com/resolve/${encodeURIComponent(addressOrName)}`);
    if (res.ok) {
      const data = await res.json();
      if (data.address) return data.address.toLowerCase();
    }
  } catch {}
  try {
    const res = await fetch(`https://ensdata.net/api/resolve/${encodeURIComponent(addressOrName)}`);
    if (res.ok) {
      const data = await res.json();
      if (data.address) return data.address.toLowerCase();
    }
  } catch {}
  return null;
}

// ── Auth checks ─────────────────────────────────────────────────────────────
async function isAdmin(env, wallet) {
  if (!env?.DB) return false;
  try {
    // Direct address check
    let resolved = wallet;
    if (!wallet.startsWith('0x')) {
      resolved = await resolveENS(wallet);
      if (!resolved) return false;
    }
    const r = await env.DB.prepare(
      'SELECT role FROM admin_wallets WHERE wallet_address = ? OR wallet_address = ?'
    ).bind(wallet.toLowerCase(), resolved.toLowerCase()).first();
    return r?.role === 'admin';
  } catch { return false; }
}

async function verifySession(env, authHeader) {
  if (!authHeader?.startsWith('Bearer ')) return { valid: false, wallet: null };
  const sessionId = authHeader.slice(7);
  if (!env?.DB) return { valid: false, wallet: null };

  try {
    const session = await env.DB.prepare(
      'SELECT wallet_address FROM sessions WHERE id = ? AND expires_at > ?'
    ).bind(sessionId, Math.floor(Date.now() / 1000)).first();
    if (!session) return { valid: false, wallet: null };
    return { valid: true, wallet: session.wallet_address };
  } catch { return { valid: false, wallet: null }; }
}

function json(data, status = 200, origin = 'https://supercompute.io') {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': origin },
  });
}

// ── Main handler ────────────────────────────────────────────────────────────
export async function onRequest({ request, env }) {
  const url = new URL(request.url);
  const path = url.pathname.replace('/api/auth', '') || '/';
  const method = request.method;
  const reqOrigin = request.headers.get('Origin') || '';
  let allowedOrigin = 'https://supercompute.io';
  if (reqOrigin) {
    try {
      const host = new URL(reqOrigin).hostname;
      const allowed = host === 'supercompute.io' || host === 'supercompute.pages.dev' || host === 'localhost' || host === '127.0.0.1' || host.endsWith('.pages.dev') || host.endsWith('.cloudflarestaging.com') || host.endsWith('.ngrok-free.app');
      if (allowed) allowedOrigin = reqOrigin;
    } catch {}
  }

  const cors = {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  if (method === 'OPTIONS') return new Response(null, { headers: cors });
  const j = (data, status = 200) => json(data, status, allowedOrigin);

  // GET /api/auth/nonce
  if (method === 'GET' && path === '/nonce') {
    const nonce = generateNonce();
    if (env?.CACHE) {
      await env.CACHE.put(`siwe:nonce:${nonce}`, 'pending', { expirationTtl: 600 });
    }
    return j({ nonce });
  }

  // GET /api/auth/message?nonce=X&address=Y
  if (method === 'GET' && path === '/message') {
    const nonce = url.searchParams.get('nonce');
    const address = url.searchParams.get('address');
    if (!nonce || !address) return j({ error: 'nonce and address required' }, 400);
    if (!isValidAddress(address)) return j({ error: 'Invalid address' }, 400);
    if (env?.CACHE) {
      const stored = await env.CACHE.get(`siwe:nonce:${nonce}`);
      if (!stored) return j({ error: 'Invalid or expired nonce' }, 400);
    }
    const message = generateSiweMessage(address, nonce);
    return j({ message });
  }

  // POST /api/auth/login — handled by auth/login.js (directory file takes priority)
  // The catchall below is dead code kept only for reference; it will never run
  // because Cloudflare Pages routes /api/auth/login to auth/login.js.

  // GET /api/auth/profile — handled by auth/profile.js
  if (method === 'GET' && path === '/profile') {
    const { valid, wallet } = await verifySession(env, request.headers.get('Authorization'));
    if (!valid) return j({ user: null });

    if (env?.DB) {
      const user = await env.DB.prepare(
        'SELECT id, name, wallet_address, role FROM users WHERE wallet_address = ?'
      ).bind(wallet).first();
      return j({ user });
    }
    return j({ user: { id: wallet, name: formatAddress(wallet), address: wallet, role: 'user' } });
  }

  // POST /api/auth/logout
  if (method === 'POST' && path === '/logout') {
    const authHeader = request.headers.get('Authorization');
    if (authHeader?.startsWith('Bearer ') && env?.DB) {
      await env.DB.prepare('DELETE FROM sessions WHERE id = ?').bind(authHeader.slice(7)).run().catch(() => {});
    }
    return j({ success: true });
  }

  return j({
    endpoints: {
      'GET /api/auth/nonce': 'Get login nonce',
      'GET /api/auth/message?nonce=X&address=Y': 'Get SIWE message',
      'POST /api/auth/login': 'Sign in with wallet',
      'GET /api/auth/profile': 'Get current user',
      'POST /api/auth/logout': 'Sign out',
    }
  });
}

export { verifySession, isAdmin, generateNonce, json, hexToBytes, isValidAddress };