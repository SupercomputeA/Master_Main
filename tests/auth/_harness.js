// tests/auth/_harness.js — shared mock environment for SIWE handler tests.
// Mirrors Cloudflare Pages runtime: env.{CACHE, DB} with the exact method shapes
// viem/utils + Cloudflare Pages Functions depend on.

export function makeEnv({
  cacheStore = new Map(),
  adminAddresses = [],
  existingUsers = new Map(),
} = {}) {
  return {
    CACHE: {
      async get(key) {
        return cacheStore.has(key) ? cacheStore.get(key) : null;
      },
      async put(key, value) {
        cacheStore.set(key, value);
      },
      async delete(key) {
        cacheStore.delete(key);
      },
    },
    DB: {
      prepare(sql) {
        const normalized = sql.replace(/\s+/g, ' ').trim();
        const stmts = {
          calls: [],
          bind(...args) {
            const stmt = { sql: normalized, args };
            return {
              async first() {
                stmt.firstCalled = true;
                if (normalized.includes('SELECT role FROM admin_wallets')) {
                  const wallet = String(args[0]).toLowerCase();
                  const hit = adminAddresses.find((a) => a.wallet.toLowerCase() === wallet);
                  return hit ? { role: hit.role } : null;
                }
                if (normalized.includes('SELECT id, role FROM users')) {
                  const wallet = String(args[0]).toLowerCase();
                  return existingUsers.get(wallet) || null;
                }
                if (normalized.includes('SELECT wallet_address FROM sessions')) {
                  const sessionId = args[0];
                  const now = args[1];
                  const sessions = cacheStore.get('__sessions__') || new Map();
                  const session = sessions.get(sessionId);
                  if (!session) return null;
                  if (session.expires_at <= now) return null;
                  if (session.revoked_at !== null && session.revoked_at !== undefined) return null;
                  return { wallet_address: session.wallet_address };
                }
                if (normalized.includes('SELECT id, name, wallet_address, role FROM users')) {
                  const wallet = String(args[0]).toLowerCase();
                  return existingUsers.get(wallet) || null;
                }
                return null;
              },
              async run() {
                stmt.runCalled = true;
                if (normalized.startsWith('INSERT OR REPLACE INTO sessions')) {
                  const sessions = cacheStore.get('__sessions__') || new Map();
                  sessions.set(args[0], { wallet_address: args[1], expires_at: args[2], revoked_at: null });
                  cacheStore.set('__sessions__', sessions);
                  return { success: true };
                }
                if (normalized.startsWith('UPDATE sessions SET revoked_at')) {
                  const sessions = cacheStore.get('__sessions__') || new Map();
                  const s = sessions.get(args[1]);
                  if (s) { s.revoked_at = args[0]; sessions.set(args[1], s); cacheStore.set('__sessions__', sessions); }
                  return { success: true };
                }
                if (normalized.startsWith('INSERT INTO users')) {
                  const wallet = String(args[1]).toLowerCase();
                  existingUsers.set(wallet, { id: args[0], wallet_address: wallet, email: args[2], name: args[3], role: args[4] });
                  return { success: true };
                }
                if (normalized.startsWith('UPDATE users SET role')) {
                  const wallet = String(args[1]).toLowerCase();
                  const u = existingUsers.get(wallet);
                  if (u) { u.role = args[0]; existingUsers.set(wallet, u); }
                  return { success: true };
                }
                return { success: true };
              },
            };
          },
        };
        return stmts;
      },
    },
    _cacheStore: cacheStore,
  };
}

export function makeRequest(url, body, { method = 'POST', origin = 'https://supercompute.io' } = {}) {
  return new Request(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Origin: origin,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
}

export async function callHandler(handler, { url = 'https://supercompute.io/api/auth/login', body, method = 'POST', origin = 'https://supercompute.io', env } = {}) {
  const request = makeRequest(url, body, { method, origin });
  const response = await handler({ request, env });
  let parsed = null;
  try { parsed = await response.json(); } catch { parsed = null; }
  return { status: response.status, body: parsed, raw: response };
}

// viem-friendly test wallet: deterministic private key 0xab...ab
// Pair with `personal_sign`-style signature generation.
import { createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base } from 'viem/chains';

export function makeTestWallet() {
  const account = privateKeyToAccount(`0x${'ab'.repeat(32)}`);
  const client = createWalletClient({ account, chain: base, transport: http() });
  return { account, client };
}

// Standard SIWE message format the handler builds. Exposed for tests so they
// can pre-populate CACHE with `siwe:msg:<nonce>` to exercise the happy path.
export function makeSiweMessage({ address, nonce, chainId = 8453, domain = 'supercompute.io', uri = 'https://supercompute.io', expirationMinutes = 10 }) {
  const expirationTime = new Date(Date.now() + expirationMinutes * 60 * 1000).toISOString();
  return [
    `${domain} wants you to sign in with your Ethereum account.`,
    '',
    `URI: ${uri}`,
    'Version: 1',
    `Chain ID: ${chainId}`,
    `Nonce: ${nonce}`,
    `Expiration Time: ${expirationTime}`,
    '',
    'Sign in to SUPERCOMPUTE Web3 Platform',
  ].join('\n');
}

// 65-byte all-zero signature with v=27 (valid format, invalid content).
export const ARBITRARY_SIGNATURE = `0x${'00'.repeat(64)}1b`;
// 65-byte with v=28.
export const ARBITRARY_SIGNATURE_V28 = `0x${'00'.repeat(64)}1c`;