// functions/api/farcaster.js — Neynar Farcaster API + Snapchain API proxy
// Requires NEYNAR_API_KEY env var in Cloudflare dashboard
// Subpaths are served by functions/api/farcaster/[[catchall]].js (re-export).
//
// Hardening (kanban t_34ed4a8b) — closes the findings raised against PR #63:
//   S-A  denial-of-wallet → per-IP fixed-window rate limit on the existing CACHE KV
//   S-B  path forwarding  → Snapchain restricted to an explicit read-only allowlist
//   S-C  method scope     → anything other than GET/OPTIONS is 405
//   S-D  no caching       → Cache-Control on /casts and /user
//
// CORS is *not* access control: it constrains browsers, not curl or bots. None
// of the controls below depend on it.
import { allowOrigin } from "../_shared/cors-origins.js";

const NEYNAR_BASE = "https://api.neynar.com/v2/farcaster";
const SNAPCHAIN_BASE = "https://snapchain-api.neynar.com";

// Exact-origin allowlist (audit pattern: never echo arbitrary origins). The list
// itself lives in functions/_shared/cors-origins.js — production origins always,
// dev origins (127.0.0.1 / localhost) only when the deployment sets
// ALLOW_DEV_ORIGINS (SEC-F3, card t_49b40e3c).
function corsHeaders(request, env) {
  const allow = allowOrigin(request?.headers?.get("Origin"), env);
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Vary": "Origin",
  };
}

// ── S-A: per-IP rate limit ──────────────────────────────────────────────────
// Mechanism: fixed-window counter in the CACHE KV namespace — the same
// namespace /api/auth/* already throttles login attempts on, so this needs no
// new binding and no new operational step.
//
// Limits of this mechanism, documented rather than hidden:
//   * KV is eventually consistent, so the counter is a throttle, not an exact
//     meter. A distributed attack is meant to be absorbed at the edge (see the
//     Cloudflare rate-limiting rule in the PR body), not here.
//   * One KV write per API request. Real volume is tiny (one call per /social
//     page load); `s-maxage` on /casts and /user (S-D) removes repeat hits
//     before they ever reach this counter.
const RL_WINDOW_SECONDS = 60;
const RL_MAX_REQUESTS = 30;
const RL_KEY_PREFIX = "rl:farcaster:";

function clientIp(request) {
  // CF-Connecting-IP is set by Cloudflare's edge and cannot be spoofed by the
  // caller, so it always wins. X-Forwarded-For is consulted only when it is
  // absent (local dev / `wrangler pages dev`) to keep the limiter testable.
  const cf = request.headers.get("CF-Connecting-IP");
  if (cf) return cf.trim();
  const xff = request.headers.get("X-Forwarded-For");
  if (xff) return xff.split(",")[0].trim();
  return "local";
}

async function rateLimit(env, ip) {
  const key = RL_KEY_PREFIX + ip;
  const now = Math.floor(Date.now() / 1000);
  const raw = await env.CACHE.get(key);
  let window = { count: 0, reset: now + RL_WINDOW_SECONDS };
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.count === "number" && parsed.reset > now) window = parsed;
    } catch {
      // Corrupt entry → treat as a fresh window rather than 500 the endpoint.
    }
  }
  window.count += 1;
  const resetIn = Math.max(1, window.reset - now);
  await env.CACHE.put(key, JSON.stringify(window), { expirationTtl: RL_WINDOW_SECONDS * 2 });
  return {
    allowed: window.count <= RL_MAX_REQUESTS,
    remaining: Math.max(0, RL_MAX_REQUESTS - window.count),
    resetIn,
  };
}

function rateHeaders(rl) {
  return {
    "X-RateLimit-Limit": String(RL_MAX_REQUESTS),
    "X-RateLimit-Remaining": String(rl.remaining),
    "X-RateLimit-Reset": String(rl.resetIn),
  };
}

// ── S-D: caching ────────────────────────────────────────────────────────────
// Feed and profile reads are identical for every caller and cheap to cache.
// Caching at the edge also means repeat reads never touch Neynar quota, which
// backs up S-A.
const PUBLIC_CACHE = "public, s-maxage=60, stale-while-revalidate=120";

// ── S-B: Snapchain read-only allowlist ──────────────────────────────────────
// Every entry below is a documented read endpoint of the Snapchain v1 HTTP API
// (https://snapchain.farcaster.xyz/reference/httpapi/httpapi). The write
// endpoints of that same API — submitMessage, submitBulkMessages,
// validateMessage — are deliberately ABSENT: this proxy is read-only.
//
// Membership is an exact string match against the raw pathname, so every
// non-member shape is 400 before any fetch():
//   /v1/info/            trailing slash
//   /v1//info            doubled slash
//   /v1/../v1/info       traversal
//   /v1/%2e%2e/info      percent-encoded traversal
//   /v1/anythingElse     undocumented or mutation endpoint
const SNAPCHAIN_ALLOWED_PATHS = new Set([
  "/v1/castById",
  "/v1/castsByFid",
  "/v1/castsByMention",
  "/v1/castsByParent",
  "/v1/eventById",
  "/v1/events",
  "/v1/fidAddressType",
  "/v1/fids",
  "/v1/info",
  "/v1/linkById",
  "/v1/linksByFid",
  "/v1/linksByTargetFid",
  "/v1/onChainEventsByFid",
  "/v1/onChainIdRegistryEventByAddress",
  "/v1/onChainSignersByFid",
  "/v1/reactionById",
  "/v1/reactionsByCast",
  "/v1/reactionsByFid",
  "/v1/reactionsByTarget",
  "/v1/storageLimitsByFid",
  "/v1/userDataByFid",
  "/v1/userNameProofByName",
  "/v1/userNameProofsByFid",
  "/v1/verificationsByFid",
]);

// ── S-C: method scope ───────────────────────────────────────────────────────
const ALLOWED_METHODS = "GET, OPTIONS";

function json(data, status = 200, request, env, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders(request, env),
      ...extraHeaders,
    },
  });
}

function cors(request, env) {
  return new Response(null, { headers: corsHeaders(request, env) });
}

export async function onRequest({ request, env }) {
  const url = new URL(request.url);
  const path = url.pathname.replace("/api/farcaster", "") || "/";

  // Preflight touches no state and must never be rate-limited or 405'd.
  if (request.method === "OPTIONS") return cors(request, env);

  // ── S-C: reject every verb the handler does not implement ────────────────
  if (request.method !== "GET") {
    return json(
      { error: "Method not allowed", allow: ALLOWED_METHODS },
      405,
      request,
      env,
      { Allow: ALLOWED_METHODS },
    );
  }

  // ── S-A: rate limit ──────────────────────────────────────────────────────
  // CACHE is mandatory. Without it there is no counter, and an endpoint that
  // silently serves unmetered requests is precisely the S-A exposure — so fail
  // closed, matching /api/auth/login.js.
  if (!env?.CACHE) {
    return json({ error: "Server misconfigured: CACHE binding missing" }, 503, request, env);
  }
  const rl = await rateLimit(env, clientIp(request));
  if (!rl.allowed) {
    return json(
      { error: "Rate limit exceeded", retry_after: rl.resetIn },
      429,
      request,
      env,
      { ...rateHeaders(rl), "Retry-After": String(rl.resetIn) },
    );
  }
  const rlHeaders = rateHeaders(rl);

  const apiKey = env.NEYNAR_API_KEY;
  if (!apiKey) {
    return json(
      { error: "NEYNAR_API_KEY not configured", docs: "Set NEYNAR_API_KEY in Cloudflare dashboard" },
      503,
      request,
      env,
      rlHeaders,
    );
  }

  // ── Snapchain API proxy ─────────────────────────────────────────────────
  // GET /api/farcaster/snapchain/v1/<allowlisted>?…  →  https://snapchain-api.neynar.com/v1/<allowlisted>?…
  if (path.startsWith("/snapchain/")) {
    const snapPath = path.replace("/snapchain", "");
    if (!SNAPCHAIN_ALLOWED_PATHS.has(snapPath)) {
      return json(
        {
          error: "Snapchain path not allowed",
          detail:
            "Path is not in the read-only allowlist. See functions/api/farcaster.js (SNAPCHAIN_ALLOWED_PATHS).",
        },
        400,
        request,
        env,
        rlHeaders,
      );
    }
    try {
      const res = await fetch(`${SNAPCHAIN_BASE}${snapPath}${url.search}`, {
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
        },
      });
      const data = await res.json();
      return json(data, res.status, request, env, rlHeaders);
    } catch (e) {
      return json({ error: "Snapchain API error", detail: e.message }, 502, request, env, rlHeaders);
    }
  }

  // ── Standard Neynar v2 API ──────────────────────────────────────────────
  const headers = {
    "accept": "application/json",
    "api_key": apiKey,
  };

  // GET /api/farcaster/info — proxy to /v2/farcaster/info
  if (path === "/info") {
    try {
      const res = await fetch(`${NEYNAR_BASE}/info`, { headers });
      const data = await res.json();
      return json(data, res.status, request, env, rlHeaders);
    } catch (e) {
      return json({ error: "Failed to fetch Neynar info", detail: e.message }, 502, request, env, rlHeaders);
    }
  }

  // GET /api/farcaster/casts?fid=X&limit=10
  if (path === "/casts") {
    const fid = url.searchParams.get("fid");
    const limit = url.searchParams.get("limit") || "10";
    if (!fid) return json({ error: "fid query param required" }, 400, request, env, rlHeaders);

    try {
      const res = await fetch(`${NEYNAR_BASE}/feed?feed_type=filter&filter_type=fids&fid=${fid}&limit=${limit}`, { headers });
      const data = await res.json();
      // ── S-D ── cache only real payloads: never cache an upstream error, or a
      // 60s TTL turns a transient Neynar failure into a minute-long one.
      return json(data, res.status, request, env, res.ok ? { ...rlHeaders, "Cache-Control": PUBLIC_CACHE } : rlHeaders);
    } catch (e) {
      return json({ error: "Failed to fetch Neynar feed", detail: e.message }, 502, request, env, rlHeaders);
    }
  }

  // GET /api/farcaster/user?address=X — look up user by wallet address
  if (path === "/user") {
    const address = url.searchParams.get("address");
    if (!address) return json({ error: "address query param required" }, 400, request, env, rlHeaders);

    try {
      const res = await fetch(`${NEYNAR_BASE}/user/bulk-by-address?addresses=${address}`, { headers });
      const data = await res.json();
      // ── S-D ── cache only real payloads (see /casts).
      return json(data, res.status, request, env, res.ok ? { ...rlHeaders, "Cache-Control": PUBLIC_CACHE } : rlHeaders);
    } catch (e) {
      return json({ error: "Failed to fetch user", detail: e.message }, 502, request, env, rlHeaders);
    }
  }

  // GET /api/farcaster/user-by-fid?fid=X — look up user by FID
  if (path === "/user-by-fid") {
    const fid = url.searchParams.get("fid");
    if (!fid) return json({ error: "fid query param required" }, 400, request, env, rlHeaders);

    try {
      const res = await fetch(`${NEYNAR_BASE}/user/bulk?fids=${fid}`, { headers });
      const data = await res.json();
      return json(data, res.status, request, env, rlHeaders);
    } catch (e) {
      return json({ error: "Failed to fetch user", detail: e.message }, 502, request, env, rlHeaders);
    }
  }

  return json(
    {
      endpoints: {
        "GET /api/farcaster/info": "Neynar API info",
        "GET /api/farcaster/casts?fid=X&limit=N": "Feed by FID (cached 60s)",
        "GET /api/farcaster/user?address=X": "Lookup user by wallet (cached 60s)",
        "GET /api/farcaster/user-by-fid?fid=X": "Lookup user by FID",
        "GET /api/farcaster/snapchain/v1/<allowlisted>": "Snapchain read-only proxy",
      },
      limits: { method: ALLOWED_METHODS, rate_limit: `${RL_MAX_REQUESTS} req / ${RL_WINDOW_SECONDS}s per IP` },
    },
    200,
    request,
    env,
    rlHeaders,
  );
}