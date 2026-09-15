// functions/api/marketplace/list.js — Create a marketplace listing (POST)
//
// Auth: SIWE bearer session token (Authorization: Bearer <session>).
// The session must resolve to a user whose wallet matches `owner_wallet`.
// Anyone authenticated can list — no subscription gate (admin override placeholder kept).

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

const ALLOWED_LICENSES = ['cc-by', 'cc0', 'commercial', 'custom']
const ALLOWED_CATEGORIES = ['app', 'agent', 'data', 'course', 'design', 'service']
const ALLOWED_CHAINS = ['base', 'robinhood']

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

function makeId() {
  // Short, URL-safe random id. crypto.randomUUID is fine in Pages Functions (Workers runtime).
  return (typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36)
  ).replace(/-/g, '').slice(0, 16)
}

export async function onRequest({ request, env }) {
  const origin = request.headers.get('Origin') || ''
  if (request.method === 'OPTIONS') return new Response(null, { headers: corsHeaders(origin) })
  if (request.method !== 'POST') return j({ error: 'POST required' }, 405, origin)

  // Auth
  const authHeader = request.headers.get('Authorization') || ''
  const session = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : null
  const wallet = await getWalletForSession(env, session)
  if (!wallet) return j({ error: 'Not authenticated' }, 401, origin)

  // Body
  let body
  try {
    body = await request.json()
  } catch {
    return j({ error: 'Invalid JSON body' }, 400, origin)
  }

  const {
    title,
    tagline = null,
    description,
    category = null,
    chain = 'base',
    priceUsdc,
    priceStock = null,
    splitAddress = null,
    splitRecipients = null,
    deliverableUrl = null,
    deliverableKind = 'file',
    license = 'commercial',
    licenseText = null,
    status = 'live',
  } = body || {}

  // Validation
  if (typeof title !== 'string' || title.trim().length < 3) {
    return j({ error: 'title is required (min 3 chars)' }, 400, origin)
  }
  if (typeof description !== 'string' || description.trim().length < 10) {
    return j({ error: 'description is required (min 10 chars)' }, 400, origin)
  }
  if (!ALLOWED_LICENSES.includes(license)) {
    return j({ error: `license must be one of: ${ALLOWED_LICENSES.join(', ')}` }, 400, origin)
  }
  if (license === 'custom' && (typeof licenseText !== 'string' || licenseText.trim().length < 5)) {
    return j({ error: 'licenseText is required when license=custom' }, 400, origin)
  }
  if (category && !ALLOWED_CATEGORIES.includes(category)) {
    return j({ error: `category must be one of: ${ALLOWED_CATEGORIES.join(', ')}` }, 400, origin)
  }
  if (!ALLOWED_CHAINS.includes(chain)) {
    return j({ error: `chain must be one of: ${ALLOWED_CHAINS.join(', ')}` }, 400, origin)
  }
  if (typeof priceUsdc !== 'string' || !/^\d{1,12}$/.test(priceUsdc)) {
    return j({ error: 'priceUsdc must be a numeric string (USDC = 6 decimals, e.g. "25000000" = $25)' }, 400, origin)
  }
  if (!['file', 'link', 'memo'].includes(deliverableKind)) {
    return j({ error: 'deliverableKind must be file|link|memo' }, 400, origin)
  }
  if (deliverableKind === 'file' && !deliverableUrl) {
    return j({ error: 'deliverableUrl is required when deliverableKind=file' }, 400, origin)
  }
  if (splitRecipients && !Array.isArray(splitRecipients)) {
    return j({ error: 'splitRecipients must be an array of {address, percentBps}' }, 400, origin)
  }

  const id = makeId()
  const owner = wallet

  try {
    await env.DB.prepare(
      `INSERT INTO marketplace_listings
        (id, owner_wallet, title, tagline, description, category, chain,
         price_usdc, price_stock_symbol, price_stock_amount,
         split_address, split_recipients,
         deliverable_url, deliverable_kind,
         license, license_text, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      id,
      owner,
      title.trim(),
      tagline?.trim() ?? null,
      description.trim(),
      category,
      chain,
      priceUsdc,
      priceStock?.symbol ?? null,
      priceStock?.amount ?? null,
      splitAddress ?? env.SPLIT_MAIN ?? null,
      splitRecipients ? JSON.stringify(splitRecipients) : null,
      deliverableUrl,
      deliverableKind,
      license,
      licenseText,
      status,
    ).run()

    const row = await env.DB.prepare(
      `SELECT * FROM marketplace_listings WHERE id = ?`
    ).bind(id).first()

    return j({ listing: serializeRow(row) }, 201, origin)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    if (/no such table/i.test(msg)) {
      return j({
        error: 'marketplace_listings table not provisioned',
        fix: 'Run migrations/0002_marketplace.sql against D1',
      }, 503, origin)
    }
    return j({ error: 'DB write failed', detail: msg }, 500, origin)
  }
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