// functions/api/farcaster.js — Neynar Farcaster API + Snapchain API proxy
// Requires NEYNAR_API_KEY env var in Cloudflare dashboard
// Subpaths are served by functions/api/farcaster/[[catchall]].js (re-export).

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

function json(data, status = 200, request, env) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders(request, env),
    },
  });
}

function cors(request, env) {
  return new Response(null, { headers: corsHeaders(request, env) });
}

export async function onRequest({ request, env }) {
  const url = new URL(request.url);
  const path = url.pathname.replace("/api/farcaster", "") || "/";

  if (request.method === "OPTIONS") return cors(request, env);

  const apiKey = env.NEYNAR_API_KEY;
  if (!apiKey) {
    return json({ error: "NEYNAR_API_KEY not configured", docs: "Set NEYNAR_API_KEY in Cloudflare dashboard" }, 503, request, env);
  }

  // ── Snapchain API proxy ─────────────────────────────────────────────────
  // GET /api/farcaster/snapchain/v1/*  →  https://snapchain-api.neynar.com/v1/*
  if (path.startsWith("/snapchain/")) {
    const snapPath = path.replace("/snapchain", "");
    try {
      const res = await fetch(`${SNAPCHAIN_BASE}${snapPath}${url.search}`, {
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
        },
      });
      const data = await res.json();
      return json(data, res.status);
    } catch (e) {
      return json({ error: "Snapchain API error", detail: e.message }, 502);
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
      return json(data);
    } catch (e) {
      return json({ error: "Failed to fetch Neynar info", detail: e.message }, 502);
    }
  }

  // GET /api/farcaster/casts?fid=X&limit=10
  if (path === "/casts") {
    const fid = url.searchParams.get("fid");
    const limit = url.searchParams.get("limit") || "10";
    if (!fid) return json({ error: "fid query param required" }, 400);

    try {
      const res = await fetch(`${NEYNAR_BASE}/feed?feed_type=filter&filter_type=fids&fid=${fid}&limit=${limit}`, { headers });
      const data = await res.json();
      return json(data);
    } catch (e) {
      return json({ error: "Failed to fetch Neynar feed", detail: e.message }, 502);
    }
  }

  // GET /api/farcaster/user?address=X — look up user by wallet address
  if (path === "/user") {
    const address = url.searchParams.get("address");
    if (!address) return json({ error: "address query param required" }, 400);

    try {
      const res = await fetch(`${NEYNAR_BASE}/user/bulk-by-address?addresses=${address}`, { headers });
      const data = await res.json();
      return json(data);
    } catch (e) {
      return json({ error: "Failed to fetch user", detail: e.message }, 502);
    }
  }

  // GET /api/farcaster/user-by-fid?fid=X — look up user by FID
  if (path === "/user-by-fid") {
    const fid = url.searchParams.get("fid");
    if (!fid) return json({ error: "fid query param required" }, 400);

    try {
      const res = await fetch(`${NEYNAR_BASE}/user/bulk?fids=${fid}`, { headers });
      const data = await res.json();
      return json(data);
    } catch (e) {
      return json({ error: "Failed to fetch user", detail: e.message }, 502);
    }
  }

  return json({
    endpoints: {
      "GET /api/farcaster/info": "Neynar API info",
      "GET /api/farcaster/casts?fid=X&limit=N": "Feed by FID",
      "GET /api/farcaster/user?address=X": "Lookup user by wallet",
      "GET /api/farcaster/user-by-fid?fid=X": "Lookup user by FID",
      "GET /api/farcaster/snapchain/v1/*": "Snapchain API proxy",
    },
  });
}
