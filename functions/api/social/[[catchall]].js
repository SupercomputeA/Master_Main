// functions/api/social/[[catchall]].js
// Social media command center API — ADMIN ONLY.
//
// Endpoints (all require Bearer session + admin role):
//   GET  /api/social/accounts        → platform registry + live connection status from env
//   GET  /api/social/queue?status=   → queue items
//   POST /api/social/queue           → create draft/scheduled item  { body, platforms[], scheduled_at? }
//   POST /api/social/queue/update    → { id, status?, scheduled_at?, body?, platforms? }
//   POST /api/social/publish         → { id } → dispatch adapters (dry-run when creds are absent)
//   GET  /api/social/health          → rail health summary
//
// Design rules:
// - Never fake a post. An adapter with no credentials returns mode "dry-run" and
//   the queue item is marked dry_run with per-platform detail.
// - Substack has no public write API: its adapter is "manual" and only ever exports.
// - Credentials are read from Cloudflare env; this file never logs or returns them.

const ALLOWED_ORIGINS = new Set([
  "https://supercompute.io",
  "https://staging.supercompute.io",
  "http://127.0.0.1:8793",
  "http://localhost:3000",
])

function corsHeaders(request) {
  const origin = request?.headers?.get("Origin") || ""
  const allow = ALLOWED_ORIGINS.has(origin) ? origin : "https://supercompute.io"
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Vary": "Origin",
  }
}

function json(data, status = 200, request) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders(request) },
  })
}

// ── admin gate ────────────────────────────────────────────────────────────
// SOURCE OF TRUTH: `admin_wallets` — and only `admin_wallets`.
//
// This is the same table the canonical gates derive admin from
// (functions/api/auth.js isAdmin, functions/api/auth/login.js ADMIN_QUERY).
// login.js:166-176 writes `users.role` as a DERIVED CACHE of that decision; it is
// never an input to it. Reading `users.role` first — as this file used to — made
// `users` a second source of authorization truth, so a wallet removed from
// `admin_wallets` kept admin on /api/social/* for the rest of its session while
// every canonical endpoint already denied it (SEC-F1, PR #62 review).
//
// Fix: drop the cache read instead of merely reordering it. A fallback ("admin_wallets
// miss ⇒ consult users.role") would reintroduce exactly the same revocation lag, so
// there is no fallback: a wallet not in `admin_wallets` is not an admin here.
//
// The comparison stays `lower(wallet_address) = ?` — case-insensitive on the stored
// column, which is strictly MORE robust than the canonical `wallet_address = ?`. Live
// D1 carries a mixed-case row (0xe7A3Ed04F24b6482b4490ae06641Be4e4305Df34) that the
// canonical case-sensitive query misses and this one matches. Do not regress it.
//
// Fail closed: if `admin_wallets` cannot be read (missing table, DB error), we cannot
// prove admin, so the request is denied rather than granted from a cache.
async function requireAdmin(request, env) {
  const authHeader = request.headers.get("Authorization")
  if (!authHeader?.startsWith("Bearer ")) return { error: "missing session", status: 401 }
  if (!env?.DB) return { error: "DB not bound", status: 500 }
  const sessionId = authHeader.slice(7)
  const session = await env.DB.prepare(
    "SELECT wallet_address FROM sessions WHERE id = ? AND expires_at > ?"
  ).bind(sessionId, Math.floor(Date.now() / 1000)).first()
  if (!session) return { error: "session expired", status: 401 }

  const wallet = String(session.wallet_address || "").toLowerCase()
  let isAdmin = false
  try {
    const allow = await env.DB.prepare(
      "SELECT role FROM admin_wallets WHERE lower(wallet_address) = ?"
    ).bind(wallet).first()
    isAdmin = allow?.role === "admin"
  } catch {
    isAdmin = false
  }
  if (!isAdmin) return { error: "admin role required", status: 403 }
  return { wallet }
}

// ── adapters ──────────────────────────────────────────────────────────────
// Each adapter returns { platform, ok, mode, detail }. mode: live | dry-run | manual | unsupported
async function publishFarcaster(item, env) {
  const apiKey = env.NEYNAR_API_KEY
  const signer = env.NEYNAR_SIGNER_UUID
  if (!apiKey || !signer) {
    return { platform: "farcaster", ok: false, mode: "dry-run", detail: "NEYNAR_API_KEY + NEYNAR_SIGNER_UUID required to publish" }
  }
  const res = await fetch("https://api.neynar.com/v2/farcaster/cast", {
    method: "POST",
    headers: { "Content-Type": "application/json", api_key: apiKey },
    body: JSON.stringify({ signer_uuid: signer, text: item.body }),
  })
  const data = await res.json().catch(() => ({}))
  return {
    platform: "farcaster",
    ok: res.ok,
    mode: "live",
    detail: res.ok ? `cast ${data?.cast?.hash || "submitted"}` : `neynar ${res.status}`,
  }
}

async function publishBluesky(item, env) {
  const handle = env.BLUESKY_HANDLE
  const password = env.BLUESKY_APP_PASSWORD
  if (!handle || !password) {
    return { platform: "bluesky", ok: false, mode: "dry-run", detail: "BLUESKY_HANDLE + BLUESKY_APP_PASSWORD required" }
  }
  const sessionRes = await fetch("https://bsky.social/xrpc/com.atproto.server.createSession", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier: handle, password }),
  })
  if (!sessionRes.ok) {
    return { platform: "bluesky", ok: false, mode: "live", detail: `login failed ${sessionRes.status}` }
  }
  const session = await sessionRes.json()
  const postRes = await fetch("https://bsky.social/xrpc/com.atproto.repo.createRecord", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.accessJwt}` },
    body: JSON.stringify({
      repo: session.did,
      collection: "app.bsky.feed.post",
      record: { text: item.body, createdAt: new Date().toISOString() },
    }),
  })
  const post = await postRes.json().catch(() => ({}))
  return {
    platform: "bluesky",
    ok: postRes.ok,
    mode: "live",
    detail: postRes.ok ? `post ${post?.uri || "created"}` : `bluesky ${postRes.status}`,
  }
}

async function publishX(item, env) {
  const token = env.X_ACCESS_TOKEN
  const secret = env.X_ACCESS_SECRET
  const key = env.X_API_KEY
  const keySecret = env.X_API_SECRET
  if (!token || !secret || !key || !keySecret) {
    return { platform: "x", ok: false, mode: "dry-run", detail: "X_API_KEY/X_API_SECRET/X_ACCESS_TOKEN/X_ACCESS_SECRET required (OAuth 1.0a user context)" }
  }
  // OAuth 1.0a signing is intentionally not hand-rolled here — see follow-up.
  return { platform: "x", ok: false, mode: "unsupported", detail: "credentials present; OAuth 1.0a signer not implemented yet — see card follow-up" }
}

async function publishManual(label, detail) {
  return { platform: label, ok: false, mode: "manual", detail }
}

async function dispatch(item, env, platforms) {
  const out = []
  for (const platform of platforms) {
    switch (platform) {
      case "farcaster":
        out.push(await publishFarcaster(item, env))
        break
      case "bluesky":
        out.push(await publishBluesky(item, env))
        break
      case "x":
        out.push(await publishX(item, env))
        break
      case "substack":
        out.push(await publishManual("substack", "no public write API — export and publish manually"))
        break
      case "tiktok":
        out.push(await publishManual("tiktok", env.TIKTOK_ACCESS_TOKEN ? "video upload out of scope for v1" : "TIKTOK_ACCESS_TOKEN required"))
        break
      case "lens":
      case "nostr":
      case "youtube":
      default:
        out.push(await publishManual(platform, "adapter not implemented yet — see command center credentials sheet"))
        break
    }
  }
  return out
}

// ── status from env (never fabricates) ────────────────────────────────────
function connectionStatus(id, env) {
  const has = (...names) => names.every((n) => Boolean(env[n]))
  switch (id) {
    case "farcaster":
      if (has("NEYNAR_API_KEY", "NEYNAR_SIGNER_UUID")) return { status: "connected", mode: "read+write" }
      if (has("NEYNAR_API_KEY")) return { status: "needs_key", mode: "read-only (signer missing)" }
      return { status: "needs_key", mode: "NEYNAR_API_KEY missing" }
    case "bluesky":
      return has("BLUESKY_HANDLE", "BLUESKY_APP_PASSWORD") ? { status: "connected", mode: "read+write" } : { status: "needs_key", mode: "app password missing" }
    case "x":
      if (has("X_API_KEY", "X_API_SECRET", "X_ACCESS_TOKEN", "X_ACCESS_SECRET")) return { status: "connected", mode: "credentials present (signer pending)" }
      return { status: "needs_key", mode: "OAuth 1.0a tokens missing" }
    case "substack":
      return { status: "manual", mode: "no write API" }
    case "tiktok":
      return has("TIKTOK_ACCESS_TOKEN") ? { status: "connected", mode: "status-only" } : { status: "needs_key", mode: "access token missing" }
    case "youtube":
      return has("YOUTUBE_API_KEY") ? { status: "connected", mode: "read-only" } : { status: "needs_key", mode: "api key missing" }
    case "lens":
      return has("LENS_API_KEY") ? { status: "connected", mode: "read-only" } : { status: "needs_key", mode: "handle + key pending" }
    case "nostr":
      return has("NOSTR_NSEC") ? { status: "connected", mode: "write" } : { status: "needs_key", mode: "NSEC missing" }
    default:
      return { status: "needs_key", mode: "unknown platform" }
  }
}

export async function onRequest({ request, env }) {
  const url = new URL(request.url)
  const path = url.pathname.replace("/api/social", "") || "/"
  if (request.method === "OPTIONS") return new Response(null, { headers: corsHeaders(request) })

  const gate = await requireAdmin(request, env)
  if (gate.error) return json({ error: gate.error }, gate.status, request)

  // ── GET /accounts ───────────────────────────────────────────────────────
  if (path === "/accounts" && request.method === "GET") {
    const rows = await env.DB.prepare("SELECT * FROM social_accounts ORDER BY tier DESC, id").all()
    const accounts = (rows.results || []).map((row) => {
      const live = connectionStatus(row.id, env)
      return { ...row, env_status: live.status, env_mode: live.mode }
    })
    return json({ accounts }, 200, request)
  }

  // ── GET /queue ──────────────────────────────────────────────────────────
  if (path === "/queue" && request.method === "GET") {
    const status = url.searchParams.get("status")
    const stmt = status
      ? env.DB.prepare("SELECT * FROM social_queue WHERE status = ? ORDER BY COALESCE(scheduled_at, created_at) DESC LIMIT 100").bind(status)
      : env.DB.prepare("SELECT * FROM social_queue ORDER BY COALESCE(scheduled_at, created_at) DESC LIMIT 100")
    const rows = await stmt.all()
    return json({ queue: rows.results || [] }, 200, request)
  }

  // ── POST /queue ─────────────────────────────────────────────────────────
  if (path === "/queue" && request.method === "POST") {
    const payload = await request.json().catch(() => null)
    if (!payload?.body || !Array.isArray(payload.platforms) || payload.platforms.length === 0) {
      return json({ error: "body and platforms[] required" }, 400, request)
    }
    const id = `sq_${crypto.randomUUID().slice(0, 12)}`
    const scheduledAt = payload.scheduled_at ? Number(payload.scheduled_at) : null
    await env.DB.prepare(
      "INSERT INTO social_queue (id, body, platforms, status, scheduled_at, created_by) VALUES (?, ?, ?, ?, ?, ?)"
    ).bind(
      id,
      String(payload.body).slice(0, 8000),
      JSON.stringify(payload.platforms),
      scheduledAt ? "scheduled" : "draft",
      scheduledAt,
      gate.wallet
    ).run()
    const row = await env.DB.prepare("SELECT * FROM social_queue WHERE id = ?").bind(id).first()
    return json({ item: row }, 201, request)
  }

  // ── POST /queue/update ──────────────────────────────────────────────────
  if (path === "/queue/update" && request.method === "POST") {
    const payload = await request.json().catch(() => null)
    if (!payload?.id) return json({ error: "id required" }, 400, request)
    const fields = []
    const values = []
    if (payload.status) { fields.push("status = ?"); values.push(payload.status) }
    if (payload.body) { fields.push("body = ?"); values.push(String(payload.body).slice(0, 8000)) }
    if (payload.platforms) { fields.push("platforms = ?"); values.push(JSON.stringify(payload.platforms)) }
    if (payload.scheduled_at !== undefined) { fields.push("scheduled_at = ?"); values.push(payload.scheduled_at ? Number(payload.scheduled_at) : null) }
    if (fields.length === 0) return json({ error: "nothing to update" }, 400, request)
    fields.push("updated_at = unixepoch()")
    values.push(payload.id)
    await env.DB.prepare(`UPDATE social_queue SET ${fields.join(", ")} WHERE id = ?`).bind(...values).run()
    const row = await env.DB.prepare("SELECT * FROM social_queue WHERE id = ?").bind(payload.id).first()
    return json({ item: row }, 200, request)
  }

  // ── POST /publish ───────────────────────────────────────────────────────
  if (path === "/publish" && request.method === "POST") {
    const payload = await request.json().catch(() => null)
    if (!payload?.id) return json({ error: "id required" }, 400, request)
    const item = await env.DB.prepare("SELECT * FROM social_queue WHERE id = ?").bind(payload.id).first()
    if (!item) return json({ error: "queue item not found" }, 404, request)
    let platforms = []
    try { platforms = JSON.parse(item.platforms) } catch { platforms = [] }

    const results = await dispatch(item, env, platforms)
    const live = results.filter((r) => r.mode === "live" && r.ok).length
    const attempted = results.filter((r) => r.mode === "live").length
    const status = live > 0 && live === attempted ? "posted" : live > 0 ? "partial" : "dry_run"

    await env.DB.prepare(
      "UPDATE social_queue SET status = ?, results = ?, posted_at = ?, updated_at = unixepoch() WHERE id = ?"
    ).bind(status, JSON.stringify(results), live > 0 ? Math.floor(Date.now() / 1000) : null, item.id).run()

    if (live > 0) {
      for (const platform of platforms) {
        await env.DB.prepare("UPDATE social_accounts SET last_post_at = unixepoch(), updated_at = unixepoch() WHERE id = ?")
          .bind(platform).run()
      }
    }
    return json({ id: item.id, status, results }, 200, request)
  }

  // ── GET /health ─────────────────────────────────────────────────────────
  if (path === "/health" && request.method === "GET") {
    const rows = await env.DB.prepare("SELECT id, platform, handle, tier, status, last_post_at FROM social_accounts ORDER BY tier DESC, id").all()
    const accounts = (rows.results || []).map((row) => ({
      id: row.id,
      platform: row.platform,
      tier: row.tier,
      handle: row.handle,
      last_post_at: row.last_post_at,
      ...connectionStatus(row.id, env),
    }))
    const counts = await env.DB.prepare(
      "SELECT status, COUNT(*) AS n FROM social_queue GROUP BY status"
    ).all()
    return json({ accounts, queue_counts: counts.results || [] }, 200, request)
  }

  return json({
    endpoints: {
      "GET /api/social/accounts": "platform registry + connection status",
      "GET /api/social/queue?status=": "queue items",
      "POST /api/social/queue": "create item { body, platforms[], scheduled_at? }",
      "POST /api/social/queue/update": "update item { id, status?, body?, platforms?, scheduled_at? }",
      "POST /api/social/publish": "dispatch item { id } (dry-run without credentials)",
      "GET /api/social/health": "rail health + queue counts",
    },
  }, 200, request)
}
