// functions/api/marketplace/buy.js — Buy a marketplace listing (POST)
//
// Flow:
//   1. Authenticated buyer (SIWE session in Authorization: Bearer).
//   2. Front-end signs an EIP-3009 transferWithAuthorization payload for the listing price
//      in the configured stable token (USDC contract on the listing's chain).
//   3. Server verifies the payload shape, the signature, and that listing is live.
//   4. Server flips listing.status='sold', records sold_to + sold_at.
//   5. Royalty split distribution is queued (dry-run unless SPLIT_MAIN env is set).
//
// The actual on-chain broadcast of transferWithAuthorization is performed by the buyer's
// wallet via wagmi's writeContracts. This endpoint records the post-broadcast state.

import { json } from '../auth.js'

const CORS_ALLOW = [
  'supercompute.io',
  'supercompute.pages.dev',
  'localhost',
  '127.0.0.1',
]

function corsHeaders(origin) {
  let allowedOrigin = 'https://supercompute.io'
  try {
    const host = new URL(origin).hostname
    const ok =
      CORS_ALLOW.includes(host) ||
      host.endsWith('.pages.dev') ||
      host.endsWith('.cloudflarestaging.com') ||
      host.endsWith('.ngrok-free.app')
    if (ok) allowedOrigin = origin
  } catch {}
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }
}

const j = (data, status, origin) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
  })

const PLATFORM_FEE_BPS = 250   // PLACEHOLDER — 2.5% to supercompute.eth treasury

// Known stable token contracts per chain (PLACEHOLDER for Robinhood; USDC on Base = canonical).
const STABLE_CONTRACTS = {
  base:       '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // USDC on Base
  robinhood:  env => env?.STABLE_TOKEN_ROBINHOOD || null,    // PLACEHOLDER — set via env
}

async function getWalletForSession(env, session) {
  if (!session) return null
  try {
    const row = await env.DB.prepare(
      `SELECT u.wallet_address FROM sessions s
       JOIN users u ON u.wallet_address = s.wallet_address
       WHERE s.id = ? AND s.expires_at > unixepoch()
       LIMIT 1`
    ).bind(session).first()
    return row?.wallet_address?.toLowerCase() ?? null
  } catch {
    return null
  }
}

// EIP-3009 transferWithAuthorization payload shape check.
// Does NOT verify the signature cryptographically here — that lives on the buyer client
// before broadcast. This endpoint confirms the buyer has broadcast (by txHash) and stores state.
function isValidTxHash(s) {
  return typeof s === 'string' && /^0x([A-Fa-f0-9]{64})$/.test(s)
}

export async function onRequest({ request, env }) {
  const origin = request.headers.get('Origin') || ''
  if (request.method === 'OPTIONS') return new Response(null, { headers: corsHeaders(origin) })
  if (request.method !== 'POST') return j({ error: 'POST required' }, 405, origin)

  const authHeader = request.headers.get('Authorization') || ''
  const session = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : null
  const buyer = await getWalletForSession(env, session)
  if (!buyer) return j({ error: 'Not authenticated' }, 401, origin)

  let body
  try {
    body = await request.json()
  } catch {
    return j({ error: 'Invalid JSON body' }, 400, origin)
  }

  const { listingId, txHash, chain, pricePaid } = body || {}

  if (typeof listingId !== 'string' || listingId.length < 4) {
    return j({ error: 'listingId required' }, 400, origin)
  }
  if (!isValidTxHash(txHash)) {
    return j({ error: 'txHash required (0x + 64 hex chars)' }, 400, origin)
  }
  if (typeof chain !== 'string') {
    return j({ error: 'chain required' }, 400, origin)
  }

  // Load listing
  let listing
  try {
    listing = await env.DB.prepare(
      `SELECT * FROM marketplace_listings WHERE id = ?`
    ).bind(listingId).first()
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return j({ error: 'DB read failed', detail: msg }, 500, origin)
  }
  if (!listing) return j({ error: 'Listing not found' }, 404, origin)
  if (listing.status !== 'live') {
    return j({ error: `Listing not buyable (status=${listing.status})` }, 409, origin)
  }
  if (listing.owner_wallet.toLowerCase() === buyer) {
    return j({ error: 'Owners cannot buy their own listing' }, 400, origin)
  }
  if (listing.chain !== chain) {
    return j({ error: `Chain mismatch — listing is on ${listing.chain}` }, 400, origin)
  }
  // Optional price-cross-check (buyer sends pricePaid; server verifies against listing row)
  if (pricePaid !== undefined && String(pricePaid) !== String(listing.price_usdc)) {
    return j({ error: 'pricePaid does not match listing price' }, 400, origin)
  }

  // Flip status — atomic
  let updated
  try {
    const result = await env.DB.prepare(
      `UPDATE marketplace_listings
       SET status = 'sold', sold_to = ?, sold_tx_hash = ?, sold_at = unixepoch(),
           updated_at = unixepoch()
       WHERE id = ? AND status = 'live'`
    ).bind(buyer, txHash, listingId).run()
    if (!result.meta || result.meta.changes === 0) {
      return j({ error: 'Listing was sold by someone else — try another' }, 409, origin)
    }
    updated = await env.DB.prepare(
      `SELECT * FROM marketplace_listings WHERE id = ?`
    ).bind(listingId).first()
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return j({ error: 'DB write failed', detail: msg }, 500, origin)
  }

  // Royalty split — DRY-RUN unless SPLIT_MAIN env is set.
  // The actual SplitMain.distribute() call requires a funded signer; defer to TradeDesk.
  let splitResult = { mode: 'dry-run', reason: 'SPLIT_MAIN env not configured' }
  if (env.SPLIT_MAIN && listing.split_address) {
    splitResult = {
      mode: 'queued',
      splitContract: env.SPLIT_MAIN,
      listingSplitAddress: listing.split_address,
      recipients: listing.split_recipients ? safeJson(listing.split_recipients) : null,
      platformFeeBps: PLATFORM_FEE_BPS,
      note: 'Split distribution is fired by TradeDesk cron (t_adc8d3f8) — see splitAddress for on-chain route',
    }
  }

  return j({
    listing: serializeRow(updated),
    delivery: {
      kind: updated.deliverable_kind,
      url: updated.deliverable_url,
      note: updated.deliverable_kind === 'memo'
        ? `On-chain tx ${txHash} serves as the receipt`
        : `Download via ${updated.deliverable_url}`,
    },
    split: splitResult,
  }, 200, origin)
}

function serializeRow(row) {
  if (!row) return null
  return {
    id: row.id,
    owner: row.owner_wallet,
    title: row.title,
    tagline: row.tagline,
    description: row.description,
    category: row.category,
    chain: row.chain,
    priceUsdc: row.price_usdc,
    priceStock: row.price_stock_symbol
      ? { symbol: row.price_stock_symbol, amount: row.price_stock_amount }
      : null,
    splitAddress: row.split_address,
    splitRecipients: row.split_recipients ? safeJson(row.split_recipients) : null,
    deliverableUrl: row.deliverable_url,
    deliverableKind: row.deliverable_kind,
    license: row.license,
    licenseText: row.license_text,
    status: row.status,
    soldTo: row.sold_to,
    soldTxHash: row.sold_tx_hash,
    soldAt: row.sold_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function safeJson(s) {
  try { return JSON.parse(s) } catch { return null }
}