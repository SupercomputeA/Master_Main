// functions/api/marketplace.js — Public marketplace index + detail (GET)
//
// GET /api/marketplace                       — list all live listings
// GET /api/marketplace?id=<listing-id>       — single listing detail
// GET /api/marketplace?owner=<wallet>        — list owner's listings
//
// Returns 0+ listings; consumers render an empty state when none.
// All monetary fields are returned as strings to preserve precision (USDC = 6 decimals).

import { corsOrigin, corsHeaders as corsHeadersShared } from '../_shared/cors.js'

// CORS: exact-origin allowlist only. The list and the resolver live in
// functions/_shared/cors.js (SEC-F4) — `origin` here is already resolved by
// corsOrigin(), so this cannot echo a host that is not on env.CORS_ORIGIN.
const corsHeaders = (origin) => corsHeadersShared(origin, { methods: 'GET, OPTIONS', headers: 'Content-Type' })

const j = (data, status, origin) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
  })

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
  try {
    return JSON.parse(s)
  } catch {
    return null
  }
}

export async function onRequest({ request, env }) {
  const origin = corsOrigin(request, env)
  if (request.method === 'OPTIONS') return new Response(null, { headers: corsHeaders(origin) })
  if (request.method !== 'GET') return j({ error: 'GET required' }, 405, origin)

  const url = new URL(request.url)
  const id = url.searchParams.get('id')
  const owner = url.searchParams.get('owner')

  // Single-listing detail
  if (id) {
    try {
      const row = await env.DB.prepare(
        `SELECT * FROM marketplace_listings WHERE id = ?`
      ).bind(id).first()
      if (!row) return j({ error: 'Listing not found' }, 404, origin)
      return j({ listing: serializeRow(row) }, 200, origin)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      return j({ error: 'DB read failed', detail: msg }, 500, origin)
    }
  }

  // Owner filter (for /sell dashboard reuse)
  if (owner) {
    try {
      const { results } = await env.DB.prepare(
        `SELECT * FROM marketplace_listings
         WHERE owner_wallet = ?
         ORDER BY created_at DESC`
      ).bind(owner.toLowerCase()).all()
      return j({ listings: results.map(serializeRow) }, 200, origin)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      return j({ error: 'DB read failed', detail: msg }, 500, origin)
    }
  }

  // Public index — live + coming-soon only. Sold listings still appear with status='sold'.
  try {
    const { results } = await env.DB.prepare(
      `SELECT * FROM marketplace_listings
       WHERE status IN ('live', 'sold', 'coming-soon')
       ORDER BY created_at DESC
       LIMIT 200`
    ).all()
    return j({ listings: results.map(serializeRow) }, 200, origin)
  } catch (err) {
    // Table missing — return empty list so the page renders its empty-state CTA
    const msg = err instanceof Error ? err.message : String(err)
    if (/no such table/i.test(msg)) {
      return j({ listings: [], note: 'marketplace_listings table not yet provisioned' }, 200, origin)
    }
    return j({ error: 'DB read failed', detail: msg }, 500, origin)
  }
}