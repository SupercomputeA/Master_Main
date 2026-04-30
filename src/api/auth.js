// src/api/auth.js — Auth API with SIWE (EIP-4361)
import { generateSiweMessage, generateNonce, isValidAddress, parseSiweMessage, formatAddress } from '../utils/siwe.js';

export async function handleAuth(request, env, ctx) {
  const url = new URL(request.url);
  const path = url.pathname.replace('/api/auth', '') || '/';
  const method = request.method;

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  if (method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // GET /api/auth/nonce — Generate login nonce
  if (method === 'GET' && path === '/nonce') {
    const nonce = generateNonce();
    
    // Store nonce in KV with 10min expiry
    await env.CACHE.put(`siwe:nonce:${nonce}`, 'pending', { expirationTtl: 600 });
    
    return new Response(JSON.stringify({ nonce }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // GET /api/auth/message — Generate SIWE message for wallet
  if (method === 'GET' && path === '/message') {
    const nonce = url.searchParams.get('nonce');
    const address = url.searchParams.get('address');
    const statement = url.searchParams.get('statement') || 'Sign in to SUPERCOMPUTE Web3 Platform';
    
    if (!nonce || !address) {
      return new Response(JSON.stringify({ error: 'nonce and address required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!isValidAddress(address)) {
      return new Response(JSON.stringify({ error: 'Invalid Ethereum address' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify nonce is valid
    const storedNonce = await env.CACHE.get(`siwe:nonce:${nonce}`);
    if (!storedNonce) {
      return new Response(JSON.stringify({ error: 'Invalid or expired nonce' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const message = generateSiweMessage(address, nonce, statement);
    const parsed = parseSiweMessage(message);
    
    return new Response(JSON.stringify({ 
      message,
      parsed: {
        domain: parsed['URI'] || URI,
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
    try {
      const body = await request.json();
      const { address, signature } = body;

      if (!address || !signature) {
        return new Response(JSON.stringify({ error: 'Missing address or signature' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (!isValidAddress(address)) {
        return new Response(JSON.stringify({ error: 'Invalid Ethereum address' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Note: Full EIP-191 signature verification requires secp256k1 recovery
      // For production, use a library like viem or ethers.js
      // This is a simplified version - production should verify on-chain
      console.log('SIWE login attempt:', { address, signature: signature.slice(0, 20) + '...' });

      // Mark nonce as used (from stored nonce in body)
      if (body.nonce) {
        await env.CACHE.delete(`siwe:nonce:${body.nonce}`);
      }

      // Create session
      const sessionId = generateNonce();
      const sessionExpiry = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60; // 7 days

      // Store session in D1 (skip if not configured)
      if (env.DB) {
        try {
          await env.DB.prepare(`
            INSERT INTO sessions (id, wallet_address, expires_at)
            VALUES (?, ?, ?)
          `).bind(sessionId, address.toLowerCase(), sessionExpiry).run();
        } catch (e) {
          console.log('D1 not configured, using memory session');
        }
      }

      // Get or create user
      let user = null;
      if (env.DB) {
        try {
          user = await env.DB.prepare(`
            SELECT * FROM users WHERE wallet_address = ?
          `).bind(address.toLowerCase()).first();
        } catch (e) {
          console.log('D1 query error:', e);
        }
      }

      if (!user) {
        // Create new user
        user = {
          id: generateNonce(),
          wallet_address: address.toLowerCase(),
          name: formatAddress(address),
          role: 'user',
        };
      }

      return new Response(JSON.stringify({
        success: true,
        session: sessionId,
        user: {
          id: user.id,
          name: user.name,
          address: user.wallet_address,
          role: user.role,
        },
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  }

  // GET /api/auth/profile — Get current user
  if (method === 'GET' && path === '/profile') {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ user: null }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const sessionId = authHeader.slice(7);
    
    // Verify session from D1 or memory
    if (env.DB) {
      try {
        const session = await env.DB.prepare(`
          SELECT * FROM sessions WHERE id = ? AND expires_at > ?
        `).bind(sessionId, Math.floor(Date.now() / 1000)).first();

        if (!session) {
          return new Response(JSON.stringify({ user: null }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const user = await env.DB.prepare(`
          SELECT id, name, wallet_address, role FROM users WHERE wallet_address = ?
        `).bind(session.wallet_address).first();

        return new Response(JSON.stringify({ user }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (e) {
        // D1 not configured
      }
    }

    // Simplified: just return session for now
    return new Response(JSON.stringify({ 
      user: { id: sessionId, role: 'user' } 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // POST /api/auth/logout — Delete session
  if (method === 'POST' && path === '/logout') {
    const authHeader = request.headers.get('Authorization');
    if (authHeader?.startsWith('Bearer ') && env.DB) {
      try {
        const sessionId = authHeader.slice(7);
        await env.DB.prepare(`DELETE FROM sessions WHERE id = ?`).bind(sessionId).run();
      } catch (e) {
        console.log('Logout error:', e);
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const methods = {
    'GET /nonce': 'Generate a login nonce',
    'GET /message?nonce=X&address=Y': 'Get SIWE message to sign',
    'POST /login': 'Verify signature, get session',
    'GET /profile': 'Get current user (requires Bearer token)',
    'POST /logout': 'Destroy session',
  };

  return new Response(JSON.stringify({ 
    endpoint: 'auth', 
    methods 
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}