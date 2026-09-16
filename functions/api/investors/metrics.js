// functions/api/investors/metrics.js
// GET /api/investors/metrics — public, ungated traction mirror.
//
// Returns live on-chain signals for supercompute.eth against Robinhood Chain
// mainnet + the existing /api/web3/chain health payload. Cache-friendly via
// the CACHE KV (60s TTL). No PII, no auth required.
//
// Every numeric field is either a real read from a public RPC, a count of
// rows in our own D1, or `null` when the source was unavailable. We do NOT
// invent metrics.

const ROBINHOOD_PUBLIC_RPC = 'https://rpc.mainnet.chain.robinhood.com';
const ROBINHOOD_CHAIN_ID = 4663;
const SUPERCOMPUTE_ETH = '0x1a828cd220559479e2f761805da4ee722683323B';

const CACHE_KEY = 'investors:metrics:v1';
const CACHE_TTL = 60; // seconds

async function rpcCall(rpcUrl, method, params) {
  const res = await fetch(rpcUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', method, params, id: 1 }),
  });
  if (!res.ok) return null;
  const json = await res.json();
  return json.result ?? null;
}

function hexToBigInt(hex) {
  if (!hex || typeof hex !== 'string' || !hex.startsWith('0x')) return null;
  try { return BigInt(hex); } catch { return null; }
}

async function readChainHealth() {
  try {
    const [chainIdHex, blockHex, gasHex] = await Promise.all([
      rpcCall(ROBINHOOD_PUBLIC_RPC, 'eth_chainId', []),
      rpcCall(ROBINHOOD_PUBLIC_RPC, 'eth_blockNumber', []),
      rpcCall(ROBINHOOD_PUBLIC_RPC, 'eth_gasPrice', []),
    ]);
    const chainId = chainIdHex ? parseInt(chainIdHex, 16) : null;
    const blockNumber = blockHex ? parseInt(blockHex, 16) : null;
    const gasWei = hexToBigInt(gasHex);
    return {
      provider: 'robinhood-public-rpc',
      chainId,
      expectedChainId: ROBINHOOD_CHAIN_ID,
      chainIdMatch: chainId === ROBINHOOD_CHAIN_ID,
      blockNumber,
      gasPriceWei: gasWei ? gasWei.toString() : null,
      gasPriceGwei: gasWei ? Number(gasWei / 1_000_000_000n) / 1e9 : null,
      available: chainId !== null,
    };
  } catch (err) {
    return {
      provider: 'robinhood-public-rpc',
      available: false,
      error: 'chain_health_unavailable',
      message: err?.message ?? 'unknown',
    };
  }
}

async function readWalletSignals() {
  const [txCountHex, balanceHex] = await Promise.all([
    rpcCall(ROBINHOOD_PUBLIC_RPC, 'eth_getTransactionCount', [SUPERCOMPUTE_ETH, 'latest']),
    rpcCall(ROBINHOOD_PUBLIC_RPC, 'eth_getBalance', [SUPERCOMPUTE_ETH, 'latest']),
  ]);
  const txCount = txCountHex ? parseInt(txCountHex, 16) : null;
  const balanceWei = hexToBigInt(balanceHex);
  const balanceEth = balanceWei !== null ? Number(balanceWei) / 1e18 : null;
  return {
    address: SUPERCOMPUTE_ETH,
    explorer: 'https://robinhoodchain.blockscout.com/address/' + SUPERCOMPUTE_ETH,
    txCount,
    txCountLabel: txCount === null ? null : txCount.toLocaleString(),
    balanceEth: balanceEth === null ? null : Number(balanceEth.toFixed(6)),
  };
}

async function readD1Counts(env) {
  if (!env?.DB) return { articles: null, sessionsActive: null, investorsContacted: null };
  const out = {};
  try {
    const r = await env.DB.prepare('SELECT COUNT(*) AS c FROM articles').first();
    out.articles = r?.c ?? 0;
  } catch { out.articles = null; }
  try {
    const r = await env.DB.prepare(
      'SELECT COUNT(*) AS c FROM sessions WHERE expires_at > ?',
    ).bind(Math.floor(Date.now() / 1000)).first();
    out.sessionsActive = r?.c ?? 0;
  } catch { out.sessionsActive = null; }
  try {
    const r = await env.DB.prepare('SELECT COUNT(*) AS c FROM investor_contacts').first();
    out.investorsContacted = r?.c ?? 0;
  } catch { out.investorsContacted = null; }
  return out;
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
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

export async function onRequest({ request, env }) {
  const cors = corsHeaders(request.headers.get('Origin'));
  const respond = (data, status = 200) =>
    new Response(JSON.stringify(data), {
      status,
      headers: { ...cors, 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=30' },
    });

  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
  if (request.method !== 'GET') return respond({ ok: false, error: 'method_not_allowed' }, 405);

  // Cache hit?
  if (env?.CACHE) {
    const cached = await env.CACHE.get(CACHE_KEY);
    if (cached) {
      try {
        return new Response(cached, {
          status: 200,
          headers: { ...cors, 'Content-Type': 'application/json', 'X-Cache': 'HIT' },
        });
      } catch {}
    }
  }

  const [chain, wallet, dbCounts] = await Promise.all([
    readChainHealth(),
    readWalletSignals(),
    readD1Counts(env),
  ]);

  const payload = {
    ok: true,
    fetchedAt: new Date().toISOString(),
    chain,
    supercomputeWallet: wallet,
    supercompute: {
      ...dbCounts,
    },
    disclaimer:
      'All numbers are live on-chain or live database reads. Fields that could not be fetched are reported as null — we never fabricate values.',
  };

  const body = JSON.stringify(payload);
  if (env?.CACHE) {
    // Best-effort cache write — never blocks the response.
    env.CACHE.put(CACHE_KEY, body, { expirationTtl: CACHE_TTL }).catch(() => {});
  }
  return new Response(body, {
    status: 200,
    headers: { ...cors, 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=30', 'X-Cache': 'MISS' },
  });
}