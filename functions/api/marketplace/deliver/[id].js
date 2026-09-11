// functions/api/marketplace/deliver/[id].js — Post-purchase delivery
//
// Only the buyer (the wallet in the listing's sold_to column) can fetch the
// deliverable. Returns either a signed R2 URL or a memo of the on-chain tx hash.

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
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }
}

const j = (data, status, origin) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
  })

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

// Sign a short-lived (5 min) presigned R2 URL. R2 supports S3-compatible presigning;
// this is a dry-run placeholder — wire up when R2 binding is added to wrangler.toml.
async function presignR2(env, key) {
  if (!env.R2) {
    return { mode: 'r2-not-bound', key, note: 'R2 binding missing — return raw key for client fetch' }
  }
  // Real implementation (when R2 is bound): use S3 presigner against the R2 endpoint.
  return {
    mode: 'r2-presigned',
    url: `https://r2.supercompute.io/${encodeURIComponent(key)}?X-Amz-Expires=300`,
    expiresInSeconds: 300,
  }
}

export async function onRequest({ context, request, env }) {
  const origin = request.headers.get('Origin') || ''
  if (request.method === 'OPTIONS') return new Response(null, { headers: corsHeaders(origin) })
  if (request.method !== 'GET') return j({ error: 'GET required' }, 405, origin)

  const id = context.params.id
  if (!id) return j({ error: 'listing id required' }, 400, origin)

  const authHeader = request.headers.get('Authorization') || ''
  const session = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : null
  const buyer = await getWalletForSession(env, session)
  if (!buyer) return j({ error: 'Not authenticated' }, 401, origin)

  let listing
  try {
    listing = await env.DB.prepare(
      `SELECT * FROM marketplace_listings WHERE id = ?`
    ).bind(id).first()
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return j({ error: 'DB read failed', detail: msg }, 500, origin)
  }
  if (!listing) return j({ error: 'Listing not found' }, 404, origin)
  if (listing.status !== 'sold') {
    return j({ error: 'Listing has not been purchased yet' }, 403, origin)
  }
  if (listing.sold_to?.toLowerCase() !== buyer) {
    return j({ error: 'Only the buyer can fetch the deliverable' }, 403, origin)
  }

  const receipt = {
    listingId: listing.id,
    title: listing.title,
    license: listing.license,
    licenseText: listing.license_text,
    txHash: listing.sold_tx_hash,
    purchasedAt: listing.sold_at,
    deliveredAt: Math.floor(Date.now() / 1000),
  }

  switch (listing.deliverable_kind) {
    case 'memo': {
      return j({
        ...receipt,
        kind: 'memo',
        receipt: `On-chain transferWithAuthorization tx ${listing.sold_tx_hash} serves as proof of purchase. No file delivery.`,
      }, 200, origin)
    }
    case 'link': {
      return j({
        ...receipt,
        kind: 'link',
        url: listing.deliverable_url,
      }, 200, origin)
    }
    case 'file':
    default: {
      const signed = await presignR2(env, listing.deliverable_url)
      return j({
        ...receipt,
        kind: 'file',
        ...signed,
      }, 200, origin)
    }
  }
}