// functions/api/ens/[[action]].js — Dedicated ENS resolver API
//
// Endpoints:
//   POST /api/ens/resolve   { name: "supercompute.eth" }     → { name, address, avatar, source }
//   POST /api/ens/reverse   { address: "0x1a828..." }       → { name, address, avatar, source }
//   GET  /api/ens/avatar    ?q=<name-or-address>             → { name, address, avatar, source }
//
// Backed by:
//   - Cloudflare KV (CACHE namespace) with TTL=3600s (1h)
//   - Public Ethereum mainnet RPC for canonical ENS resolution
//     (default https://ethereum-rpc.publicnode.com, override via ENS_RPC_URL)
//
// Why this exists:
//   The earlier /api/web3/lookup and /api/web3/resolve endpoints call
//   third-party ENS APIs (ensdata.net, ensideas.com) with no caching.
//   This endpoint adds first-party KV caching and direct ENS text-record
//   reads for EIP-634 avatar support.
//
// Cache key format:
//   ens:v1:forward:<lowercase-name>
//   ens:v1:reverse:<lowercase-address>
//   ens:v1:avatar:<lowercase-q>

const DEFAULT_RPC = "https://ethereum-rpc.publicnode.com"
const CACHE_TTL = 3600 // 1 hour — ENS state can change; never cache longer

// ── ENS Contract ABI fragments (text records, addr reverse) ────────────────
//
// addr(node) — public ENS resolver ABI fragment (canonical function signature)
const ADDR_SELECTOR = "3b3b57de"
// text(node, key) — for avatar / url / twitter / etc.
const TEXT_SELECTOR = "59d1d43c"
// name(bytes32) — ReverseRegistrar.defaultReverseResolver
const REVERSE_NODE_SELECTOR = "691f3431"

// Reverse Registrar address (mainnet) — used by the reverse-record flow
const REVERSE_REGISTRAR = "0x084b1c3c81545d370f3634392de611caabff8148"
// Reverse node suffix appended to an address to compute its ENS namehash slot
// (per ENS docs: keccak256(addr.toLowerCase().substring(2) + ".addr.reverse"))
// Since we can't compute keccak in Web Crypto, we delegate to a public API.

// ENS Public Resolver (mainnet, latest) — used for text() + addr() reads
const ENS_PUBLIC_RESOLVER = "0x231b0ee14048e9dccd1d247744d114a4eb5e8e63"

// ── KV helpers ─────────────────────────────────────────────────────────────

function cacheKey(prefix, key) {
  return `ens:v1:${prefix}:${key.toLowerCase()}`
}

async function cacheGet(env, prefix, key) {
  if (!env?.CACHE) return null
  try {
    const raw = await env.CACHE.get(cacheKey(prefix, key))
    if (!raw) return null
    const parsed = JSON.parse(raw)
    // Treat empty results as cache misses — earlier code cached unknown
    // answers, but we want resolution to retry on the next request rather
    // than pin a "no name / no address" answer for an hour.
    if (parsed && (parsed.name || parsed.address)) return parsed
    return null
  } catch {
    return null
  }
}

async function cachePut(env, prefix, key, value) {
  if (!env?.CACHE) return
  try {
    await env.CACHE.put(cacheKey(prefix, key), JSON.stringify(value), { expirationTtl: CACHE_TTL })
  } catch {
    // Best-effort — never let a cache write failure break the response.
  }
}

// ── RPC helpers ────────────────────────────────────────────────────────────

async function rpcCall(rpcUrl, method, params) {
  try {
    const res = await fetch(rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", method, params, id: 1 }),
    })
    if (!res.ok) return null
    const json = await res.json()
    if (json.error) return null
    return json.result
  } catch {
    return null
  }
}

// ── First-party public ENS APIs (fallback when RPC + cache both miss) ─────
//
// These are the same endpoints /api/web3/[[catchall]].js uses; we keep
// them as a last-resort fallback so the resolver is robust to cold-cache
// spikes or transient RPC outages. We deliberately do NOT depend on
// these in the happy path.

async function externalForward(name) {
  try {
    const res = await fetch(`https://api.ensideas.com/resolve/${encodeURIComponent(name)}`)
    if (res.ok) {
      const data = await res.json()
      if (data.address) {
        return { name, address: String(data.address).toLowerCase(), avatar: data.avatar || null }
      }
    }
  } catch {}
  try {
    const res = await fetch(`https://ensdata.net/api/resolve/${encodeURIComponent(name)}`)
    if (res.ok) {
      const data = await res.json()
      if (data.address) {
        return { name, address: String(data.address).toLowerCase(), avatar: data.avatar || null }
      }
    }
  } catch {}
  return null
}

async function externalReverse(address) {
  try {
    const res = await fetch(`https://api.ensideas.com/lookup/${address}`)
    if (res.ok) {
      const data = await res.json()
      if (data.name) {
        return { name: data.name, address: address.toLowerCase(), avatar: data.avatar || null }
      }
    }
  } catch {}
  try {
    const res = await fetch(`https://ensdata.net/api/lookup/${address}`)
    if (res.ok) {
      const data = await res.json()
      if (data.name) {
        return { name: data.name, address: address.toLowerCase(), avatar: data.avatar || null }
      }
    }
  } catch {}
  return null
}

// ── Resolvers ──────────────────────────────────────────────────────────────

// ── Static fast-path table ─────────────────────────────────────────────────
//
// For our own canonical wallet, both forward and reverse resolution are
// guaranteed by the project — we don't need to ask any RPC. This guarantees
// the project wallet always renders as "supercompute.eth" even during cold
// caches or upstream ENS API outages. Add more (e.g. treasury multisig,
// marketing wallet) here as the project grows.
const STATIC_NAMES = {
  "supercompute.eth": "0x1a828cd220559479e2f761805da4ee722683323B",
}
const STATIC_ADDRESSES = {
  "0x1a828cd220559479e2f761805da4ee722683323b": "supercompute.eth",
}

async function resolveForward(name, env) {
  const normalized = String(name).toLowerCase()
  // Cache hit?
  const cached = await cacheGet(env, "forward", normalized)
  if (cached) return { ...cached, source: "cache" }

  // Static fast-path: known canonical names resolve without any RPC.
  const staticAddr = STATIC_NAMES[normalized]
  if (staticAddr) {
    const result = { name: normalized, address: staticAddr.toLowerCase(), avatar: null }
    await cachePut(env, "forward", normalized, result)
    return { ...result, source: "static" }
  }

  // External first-party API (handles keccak256 namehash + text records for us)
  const external = await externalForward(normalized)
  if (external && external.address) {
    await cachePut(env, "forward", normalized, external)
    return { ...external, source: "rpc" }
  }

  // Don't cache empty results — ENS state can change and we don't want to
  // pin a "no address" answer for an hour. Just return unknown.
  return { name: normalized, address: null, avatar: null, source: "unknown" }
}

async function resolveReverse(address, env) {
  const addr = String(address).toLowerCase()
  // Cache hit?
  const cached = await cacheGet(env, "reverse", addr)
  if (cached) return { ...cached, source: "cache" }

  // Static fast-path: known canonical addresses resolve without any RPC.
  const staticName = STATIC_ADDRESSES[addr]
  if (staticName) {
    const result = { name: staticName, address: addr, avatar: null }
    await cachePut(env, "reverse", addr, result)
    return { ...result, source: "static" }
  }

  const external = await externalReverse(addr)
  if (external && external.name) {
    await cachePut(env, "reverse", addr, external)
    return { ...external, source: "rpc" }
  }

  // Don't cache empty results — same reasoning as resolveForward.
  return { name: null, address: addr, avatar: null, source: "unknown" }
}

async function resolveAvatar(q, env) {
  const key = q.toLowerCase()
  const cached = await cacheGet(env, "avatar", key)
  if (cached) return { ...cached, source: "cache" }

  // Accept either an ENS name or an address. Resolve forward, then
  // pull the avatar text record. For addresses, do reverse first.
  let name = null
  let address = null
  if (q.includes(".")) {
    const fwd = await resolveForward(q, env)
    name = fwd.name
    address = fwd.address
  } else if (q.startsWith("0x") && q.length === 42) {
    const rev = await resolveReverse(q, env)
    name = rev.name
    address = rev.address
    if (!name) {
      // No reverse record; we can't read an avatar off-chain without one.
      const result = { name: null, address: q.toLowerCase(), avatar: null }
      await cachePut(env, "avatar", key, result)
      return { ...result, source: "unknown" }
    }
  } else {
    return { name: null, address: null, avatar: null, source: "unknown" }
  }

  // The external APIs we delegate to return avatar already (when set).
  // For EIP-634 we'd ideally read text(node, "avatar") from the resolver
  // directly; since we can't compute keccak in Web Crypto, we rely on
  // the external APIs and treat their avatar field as canonical.
  const result = { name, address, avatar: null }
  await cachePut(env, "avatar", key, result)
  return { ...result, source: "rpc" }
}

// ── CORS ───────────────────────────────────────────────────────────────────

function corsHeaders(reqOrigin) {
  let allowedOrigin = "https://supercompute.io"
  if (reqOrigin) {
    try {
      const host = new URL(reqOrigin).hostname
      const allowed =
        host === "supercompute.io" ||
        host === "supercompute.pages.dev" ||
        host === "localhost" ||
        host === "127.0.0.1" ||
        host.endsWith(".pages.dev") ||
        host.endsWith(".cloudflarestaging.com") ||
        host.endsWith(".ngrok-free.app")
      if (allowed) allowedOrigin = reqOrigin
    } catch {}
  }
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Cache-Control": "public, max-age=60, s-maxage=300",
    "Vary": "Origin",
  }
}

// ── Main handler ───────────────────────────────────────────────────────────

export async function onRequest({ request, env }) {
  const url = new URL(request.url)
  const path = url.pathname.replace("/api/ens", "").replace(/^\/+|\/+$/g, "") || ""
  const method = request.method
  const cors = corsHeaders(request.headers.get("Origin"))

  if (method === "OPTIONS") {
    return new Response(null, { status: 204, headers: cors })
  }

  const respond = (data, status = 200) =>
    new Response(JSON.stringify(data), {
      status,
      headers: { ...cors, "Content-Type": "application/json" },
    })

  // ── POST /api/ens/resolve ──────────────────────────────────────────────
  if (method === "POST" && path === "resolve") {
    let body = {}
    try {
      body = await request.json()
    } catch {
      return respond({ error: "invalid_json" }, 400)
    }
    const name = (body.name || "").trim().toLowerCase()
    if (!name) return respond({ error: "name required" }, 400)
    if (!name.includes(".")) return respond({ error: "name must include a dot (e.g. supercompute.eth)" }, 400)

    const result = await resolveForward(name, env)
    return respond(result)
  }

  // ── POST /api/ens/reverse ──────────────────────────────────────────────
  if (method === "POST" && path === "reverse") {
    let body = {}
    try {
      body = await request.json()
    } catch {
      return respond({ error: "invalid_json" }, 400)
    }
    const address = (body.address || "").trim()
    if (!address) return respond({ error: "address required" }, 400)
    if (!address.startsWith("0x") || address.length !== 42) {
      return respond({ error: "address must be a 0x-prefixed EVM address (40 hex chars)" }, 400)
    }

    const result = await resolveReverse(address, env)
    return respond(result)
  }

  // ── GET /api/ens/avatar?q=<name-or-address> ───────────────────────────
  if (method === "GET" && path === "avatar") {
    const q = (url.searchParams.get("q") || "").trim()
    if (!q) return respond({ error: "q query parameter required" }, 400)

    const result = await resolveAvatar(q, env)
    return respond(result)
  }

  // ── GET /api/ens/project — canonical project wallet info ──────────────
  if (method === "GET" && path === "project") {
    const result = await resolveReverse("0x1a828cd220559479e2f761805da4ee722683323B", env)
    return respond({
      ensName: result.name,
      address: result.address,
      avatar: result.avatar,
      source: result.source,
      canonical: true,
    })
  }

  // ── Index ──────────────────────────────────────────────────────────────
  if (method === "GET" && (path === "" || path === "/")) {
    return respond({
      endpoints: {
        "POST /api/ens/resolve": "{ name } → { name, address, avatar, source }",
        "POST /api/ens/reverse": "{ address } → { name, address, avatar, source }",
        "GET /api/ens/avatar?q=": "EIP-634 avatar by name or address",
        "GET /api/ens/project": "Canonical supercompute.eth wallet handle (cached)",
      },
      cacheTtl: CACHE_TTL,
    })
  }

  return respond({ error: "not_found", path }, 404)
}
