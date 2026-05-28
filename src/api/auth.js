// src/api/auth.js — Auth API with SIWE (EIP-4361) + EIP-191 Verification
import { verifyMessage } from 'viem';
import { generateSiweMessage, generateNonce, isValidAddress, parseSiweMessage, formatAddress } from '../utils/siwe.js';

const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW = 900; // 15 minutes in seconds

// ── Rate limiting via KV ────────────────────────────────────────────────────
async function checkRateLimit(env, address) {
  const key = `ratelimit:${address.toLowerCase()}`;
  const data = await env.CACHE.get(key);
  if (!data) return { allowed: true, remaining: RATE_LIMIT_MAX };

  const { count, firstAttempt } = JSON.parse(data);
  const elapsed = Math.floor(Date.now() / 1000) - firstAttempt;

  if (elapsed > RATE_LIMIT_WINDOW) {
    // Window expired, reset
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
  const existing = await env.CACHE.get(key);
  let data = { count: 0, firstAttempt: Math.floor(Date.now() / 1000) };

  if (existing) {
    const parsed = JSON.parse(existing);
    const elapsed = Math.floor(Date.now() / 1000) - parsed.firstAttempt;
    if (elapsed > RATE_LIMIT_WINDOW) {
      data = { count: 0, firstAttempt: Math.floor(Date.now() / 1000) };
    } else {
      data = parsed;
    }
  }

  data.count++;
  await env.CACHE.put(key, JSON.stringify(data), { expirationTtl: RATE_LIMIT_WINDOW });
}

// ── Admin allowlist check ────────────────────────────────────────────────────
async function isAdmin(env, walletAddress) {
  if (!env.DB) return false;
  try {
    const result = await env.DB.prepare(
      'SELECT role FROM admin_wallets WHERE wallet_address = ?'
    ).bind(walletAddress.toLowerCase()).first();
    return result?.role === 'admin';
  } catch (e) {
    console.log('Admin check error:', e);
    return false;
  }
}

// ── Session verification ────────────────────────────────────────────────────
async function verifySession(env, authHeader) {
  if (!authHeader?.startsWith('Bearer ')) return { valid: false, wallet: null };
  const sessionId = authHeader.slice(7);

  try {
    if (env.DB) {
      const session = await env.DB.prepare(
        'SELECT wallet_address FROM sessions WHERE id = ? AND expires_at > ?'
      ).bind(sessionId, Math.floor(Date.now() / 1000)).first();

      if (!session) return { valid: false, wallet: null };
      return { valid: true, wallet: session.wallet_address };
    }
  } catch (e) {
    console.log('Session verify error:', e);
  }

  return { valid: false, wallet: null };
}

// ── Auth handler ────────────────────────────────────────────────────────────
export async function handleAuth(request, env, ctx) {
  const url = new URL(request.url);
  const path = url.pathname.replace('/api/auth', '') || '/';
  const method = request.method;

  const corsHeaders = {
    'Access-Control-Allow-Origin': 'https://supercompute.io',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  // Add secure flags in production
  if (url.hostname !== 'localhost' && !url.hostname.includes('localhost')) {
    corsHeaders['Access-Control-Allow-Credentials'] = 'true';
  }

  if (method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // GET /api/auth/nonce — Generate login nonce
  if (method === 'GET' && path === '/nonce') {
    const nonce = generateNonce();
    await env.CACHE.put(`siwe:nonce:${nonce}`, JSON.stringify({ status: 'pending' }), { expirationTtl: 600 });

    return new Response(JSON.stringify({ nonce }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // GET /api/auth/message — Generate SIWE message for wallet
  if (method === 'GET' && path === '/message') {
    const nonce = url.searchParams.get('nonce');
    const address = url.searchParams.get('address');

    if (!nonce || !address) {
      return new Response(JSON.stringify({ error: 'nonce and address required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!isValidAddress(address)) {
      return new Response(JSON.stringify({ error: 'Invalid Ethereum address' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const storedRaw = await env.CACHE.get(`siwe:nonce:${nonce}`);
    if (!storedRaw) {
      return new Response(JSON.stringify({ error: 'Invalid or expired nonce' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const message = generateSiweMessage(address, nonce);
    const parsed = parseSiweMessage(message);

    // Persist the exact message under the nonce so /login can verify against it
    await env.CACHE.put(
      `siwe:nonce:${nonce}`,
      JSON.stringify({ status: 'issued', address: address.toLowerCase(), message }),
      { expirationTtl: 600 },
    );

    return new Response(JSON.stringify({
      message,
      parsed: {
        domain: parsed['URI'],
        nonce: parsed.Nonce,
        chainId: parsed['Chain ID'],
        expirationTime: parsed['Expiration Time'],
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // POST /api/auth/login — Verify SIWE signature + create session
  if (method === 'POST' && path === '/login') {
    // Rate limit check
    try {
      const body = await request.json();
      const { address } = body || {};
      if (address) {
        const rateCheck = await checkRateLimit(env, address);
        if (!rateCheck.allowed) {
          return new Response(JSON.stringify({
            error: 'Too many login attempts',
            retryAfter: rateCheck.resetIn
          }), {
            status: 429,
            headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Retry-After': String(rateCheck.resetIn) },
          });
        }
      }

      if (!address || !body.signature || !body.nonce) {
        return new Response(JSON.stringify({ error: 'Missing address, signature, or nonce' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const wallet = address.toLowerCase();

      if (!isValidAddress(wallet)) {
        return new Response(JSON.stringify({ error: 'Invalid Ethereum address' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Fetch the SIWE message that was issued under this nonce
      const storedRaw = await env.CACHE.get(`siwe:nonce:${body.nonce}`);
      if (!storedRaw) {
        await recordFailedAttempt(env, wallet);
        return new Response(JSON.stringify({ error: 'Invalid or expired nonce' }), {
          status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      let stored;
      try { stored = JSON.parse(storedRaw); } catch { stored = null; }
      if (!stored || stored.status !== 'issued' || !stored.message) {
        await recordFailedAttempt(env, wallet);
        return new Response(JSON.stringify({ error: 'Nonce not bound to a message — call /api/auth/message first' }), {
          status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (stored.address && stored.address !== wallet) {
        await recordFailedAttempt(env, wallet);
        return new Response(JSON.stringify({ error: 'Address does not match issued message' }), {
          status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Real EIP-191 verification via viem
      const signature = body.signature.startsWith('0x') ? body.signature : `0x${body.signature}`;
      let valid = false;
      try {
        valid = await verifyMessage({ address: wallet, message: stored.message, signature });
      } catch (e) {
        console.error('verifyMessage threw:', e);
        valid = false;
      }

      if (!valid) {
        await recordFailedAttempt(env, wallet);
        return new Response(JSON.stringify({ error: 'Signature verification failed' }), {
          status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Single-use nonce: delete on success
      await env.CACHE.delete(`siwe:nonce:${body.nonce}`);

      // Create session
      const sessionId = generateNonce();
      const sessionExpiry = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60;

      if (env.DB) {
        await env.DB.prepare(`
          INSERT OR REPLACE INTO sessions (id, wallet_address, expires_at)
          VALUES (?, ?, ?)
        `).bind(sessionId, wallet, sessionExpiry).run();
      }

      // Check admin allowlist
      const admin = await isAdmin(env, wallet);
      const role = admin ? 'admin' : 'user';

      // Get or create user
      let user = { id: generateNonce(), wallet_address: wallet, name: formatAddress(wallet), role };
      if (env.DB) {
        try {
          const existing = await env.DB.prepare(
            'SELECT * FROM users WHERE wallet_address = ?'
          ).bind(wallet).first();
          if (existing) {
            user = existing;
            user.role = role; // override with current admin status
          } else {
            await env.DB.prepare(`
              INSERT INTO users (id, wallet_address, name, role)
              VALUES (?, ?, ?, ?)
            `).bind(user.id, wallet, user.name, role).run();
          }
        } catch (e) {
          console.log('User create error:', e);
        }
      }

      return new Response(JSON.stringify({
        success: true,
        session: sessionId,
        user: {
          id: user.id,
          name: user.name,
          address: wallet,
          role: user.role,
        },
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } catch (err) {
      console.error('Login error:', err);
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  }

  // GET /api/auth/profile — Get current user
  if (method === 'GET' && path === '/profile') {
    const { valid, wallet } = await verifySession(env, request.headers.get('Authorization'));

    if (!valid || !wallet) {
      return new Response(JSON.stringify({ user: null }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (env.DB) {
      const user = await env.DB.prepare(
        'SELECT id, name, wallet_address, role FROM users WHERE wallet_address = ?'
      ).bind(wallet).first();
      return new Response(JSON.stringify({ user }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({
      user: { id: wallet, name: formatAddress(wallet), address: wallet, role: 'user' }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // POST /api/auth/logout — Delete session
  if (method === 'POST' && path === '/logout') {
    const authHeader = request.headers.get('Authorization');
    if (authHeader?.startsWith('Bearer ') && env.DB) {
      try {
        await env.DB.prepare('DELETE FROM sessions WHERE id = ?')
          .bind(authHeader.slice(7)).run();
      } catch (e) {
        console.log('Logout error:', e);
      }
    }
    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const methods = {
    'GET /api/auth/nonce': 'Get login nonce',
    'GET /api/auth/message?nonce=X&address=Y': 'Get SIWE message to sign',
    'POST /api/auth/login': 'Verify signature, get session token',
    'GET /api/auth/profile': 'Get current user (Bearer token required)',
    'POST /api/auth/logout': 'Destroy session',
  };

  return new Response(JSON.stringify({ endpoint: 'auth', methods }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

export { verifySession, isAdmin };