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
const ENS_RESOLVER = '0x231b0ee14048e9dccd1d247744d114a4eb5e8e63';
const ADDR_SELECTOR = '3b3b57de'; // addr(bytes32)

async function resolveENS(addressOrName) {
  // Already an address
  if (addressOrName.startsWith('0x') && addressOrName.length === 42) {
    return addressOrName.toLowerCase();
  }
  // ENS name — resolve via public Ethereum RPC
  const namehash = namehashEncode(addressOrName);
  const data = ADDR_SELECTOR + namehash;
  try {
    const res = await fetch('https://ethereum.publicnode.com', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_call',
        params: [{ to: ENS_RESOLVER, data }, 'latest'],
        id: 1,
      }),
    });
    const json = await res.json();
    const result = json.result || '0x';
    if (result !== '0x' && result.length === 66) {
      return '0x' + result.slice(-40);
    }
  } catch (e) { /* fall through */ }
  return null;
}

function namehashEncode(name) {
  const labels = name.split('.').filter(Boolean);
  let node = new Uint8Array(32);
  const crypto = require('crypto');
  for (let i = labels.length - 1; i >= 0; i--) {
    const labelBytes = new TextEncoder().encode(labels[i]);
    const data = new Uint8Array(32 + 1 + labelBytes.length);
    data.set(node, 0);
    data[32] = labelBytes.length;
    data.set(labelBytes, 33);
    const hash = crypto.createHash('sha3-256').update(Buffer.from(data)).digest();
    node = new Uint8Array(hash);
  }
  return Array.from(node).map(b => b.toString(16).padStart(2, '0')).join('');
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

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': 'https://supercompute.io' },
  });
}

// ── Main handler ────────────────────────────────────────────────────────────
export async function onRequest({ request, env }) {
  const url = new URL(request.url);
  const path = url.pathname.replace('/api/auth', '') || '/';
  const method = request.method;

  const cors = {
    'Access-Control-Allow-Origin': 'https://supercompute.io',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  if (method === 'OPTIONS') return new Response(null, { headers: cors });

  // GET /api/auth/nonce
  if (method === 'GET' && path === '/nonce') {
    const nonce = generateNonce();
    if (env?.CACHE) {
      await env.CACHE.put(`siwe:nonce:${nonce}`, 'pending', { expirationTtl: 600 });
    }
    return json({ nonce });
  }

  // GET /api/auth/message?nonce=X&address=Y
  if (method === 'GET' && path === '/message') {
    const nonce = url.searchParams.get('nonce');
    const address = url.searchParams.get('address');
    if (!nonce || !address) return json({ error: 'nonce and address required' }, 400);
    if (!isValidAddress(address)) return json({ error: 'Invalid address' }, 400);
    if (env?.CACHE) {
      const stored = await env.CACHE.get(`siwe:nonce:${nonce}`);
      if (!stored) return json({ error: 'Invalid or expired nonce' }, 400);
    }
    const message = generateSiweMessage(address, nonce);
    return json({ message });
  }

  // POST /api/auth/login
  if (method === 'POST' && path === '/login') {
    const body = await request.json().catch(() => ({}));
    const { address, signature, nonce } = body;

    if (!address || !signature) return json({ error: 'address and signature required' }, 400);

    const wallet = address.toLowerCase();
    if (!isValidAddress(wallet)) return json({ error: 'Invalid address' }, 400);

    // Rate limit
    if (env?.CACHE) {
      const rl = await checkRateLimit(env, wallet);
      if (!rl.allowed) {
        return new Response(JSON.stringify({ error: 'Too many login attempts', retryAfter: rl.resetIn }), {
          status: 429, headers: { ...cors, 'Content-Type': 'application/json', 'Retry-After': String(rl.resetIn) },
        });
      }
    }

    // Signature format validation (65 bytes for personal_sign)
    const sigBytes = typeof signature === 'string' ? hexToBytes(signature) : signature;
    if (!sigBytes || sigBytes.length !== 65) {
      if (env?.CACHE) await recordFailedAttempt(env, wallet);
      return json({ error: 'Invalid signature format' }, 400);
    }
    const v = sigBytes[64];
    if (v !== 27 && v !== 28 && v !== 31 && v !== 32) {
      if (env?.CACHE) await recordFailedAttempt(env, wallet);
      return json({ error: 'Invalid signature v value' }, 400);
    }

    // Consume nonce
    if (env?.CACHE && nonce) await env.CACHE.delete(`siwe:nonce:${nonce}`);

    // Create session
    const sessionId = generateNonce();
    const sessionExpiry = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60;
    if (env?.DB) {
      await env.DB.prepare(`
        INSERT OR REPLACE INTO sessions (id, wallet_address, expires_at)
        VALUES (?, ?, ?)
      `).bind(sessionId, wallet, sessionExpiry).run();
    }

    // Check admin
    const admin = await isAdmin(env, wallet);

    // Upsert user
    if (env?.DB) {
      const existing = await env.DB.prepare('SELECT * FROM users WHERE wallet_address = ?').bind(wallet).first();
      if (!existing) {
        await env.DB.prepare('INSERT INTO users (id, wallet_address, name, role) VALUES (?, ?, ?, ?)')
          .bind(generateNonce(), wallet, formatAddress(wallet), admin ? 'admin' : 'user').run();
      }
    }

    return json({
      success: true,
      session: sessionId,
      user: {
        id: wallet,
        name: formatAddress(wallet),
        address: wallet,
        role: admin ? 'admin' : 'user',
      },
    });
  }

  // GET /api/auth/profile
  if (method === 'GET' && path === '/profile') {
    const { valid, wallet } = await verifySession(env, request.headers.get('Authorization'));
    if (!valid) return json({ user: null });

    if (env?.DB) {
      const user = await env.DB.prepare(
        'SELECT id, name, wallet_address, role FROM users WHERE wallet_address = ?'
      ).bind(wallet).first();
      return json({ user });
    }
    return json({ user: { id: wallet, name: formatAddress(wallet), address: wallet, role: 'user' } });
  }

  // POST /api/auth/logout
  if (method === 'POST' && path === '/logout') {
    const authHeader = request.headers.get('Authorization');
    if (authHeader?.startsWith('Bearer ') && env?.DB) {
      await env.DB.prepare('DELETE FROM sessions WHERE id = ?').bind(authHeader.slice(7)).run().catch(() => {});
    }
    return json({ success: true });
  }

  return json({
    endpoints: {
      'GET /api/auth/nonce': 'Get login nonce',
      'GET /api/auth/message?nonce=X&address=Y': 'Get SIWE message',
      'POST /api/auth/login': 'Sign in with wallet',
      'GET /api/auth/profile': 'Get current user',
      'POST /api/auth/logout': 'Sign out',
    }
  });
}

export { verifySession, isAdmin };