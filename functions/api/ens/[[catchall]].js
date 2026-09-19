// functions/api/ens/[[catchall]].js — ENS resolver shim
//
// lib/ens.ts and other clients expect ENS resolution at /api/ens/*.
// The canonical on-chain implementation lives in /api/web3/* (resolve,
// lookup, profile). This shim proxies the ENS-specific paths to the web3
// handler so both URLs work without duplicating RPC logic.
//
// Supported:
//   POST /api/ens/resolve  { name }
//   POST /api/ens/reverse  { address }
//   GET  /api/ens/avatar?q=<nameOrAddress>

import { corsOrigin, FALLBACK_ORIGIN } from "../../_shared/cors.js";

function json(data, status = 200, origin = FALLBACK_ORIGIN) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": origin,
      "Vary": "Origin",
    },
  });
}

function notFound(origin) {
  return json({ error: "not_found", path: "ens" }, 404, origin);
}

export async function onRequest({ request, env }) {
  const url = new URL(request.url);
  const path = url.pathname.replace("/api/ens", "") || "/";
  const allowedOrigin = corsOrigin(request, env);

  if (request.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": allowedOrigin,
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Vary": "Origin",
      },
    });
  }

  const j = (data, status = 200) => json(data, status, allowedOrigin);

  // Forward resolve: name -> address
  if (path === "/resolve" || path === "/resolve/") {
    if (request.method !== "POST") return j({ error: "method_not_allowed" }, 405);
    const body = await request.json().catch(() => ({}));
    const name = body?.name ?? url.searchParams.get("q") ?? url.searchParams.get("name");
    if (!name) return j({ error: "name required" }, 400);
    const upstream = new URL("/api/web3/resolve", url.origin);
    upstream.searchParams.set("name", name);
    const res = await fetch(upstream.toString(), { headers: { Origin: allowedOrigin } });
    const data = await res.json().catch(() => ({ error: "upstream_failed" }));
    return j({
      name,
      address: data?.address ?? null,
      avatar: null,
      source: data?.address ? "rpc" : "unknown",
    }, res.status);
  }

  // Reverse resolve: address -> name
  if (path === "/reverse" || path === "/reverse/") {
    if (request.method !== "POST") return j({ error: "method_not_allowed" }, 405);
    const body = await request.json().catch(() => ({}));
    const address = body?.address ?? url.searchParams.get("q") ?? url.searchParams.get("address");
    if (!address) return j({ error: "address required" }, 400);
    const upstream = new URL("/api/web3/lookup", url.origin);
    upstream.searchParams.set("address", address);
    const res = await fetch(upstream.toString(), { headers: { Origin: allowedOrigin } });
    const data = await res.json().catch(() => ({ error: "upstream_failed" }));
    return j({
      name: data?.ens ?? null,
      address,
      avatar: null,
      source: data?.ens ? "rpc" : "unknown",
    }, res.status);
  }

  // Avatar: not implemented yet; return null cleanly
  if (path === "/avatar" || path === "/avatar/") {
    const q = url.searchParams.get("q");
    if (!q) return j({ error: "q required" }, 400);
    return j({ name: null, address: null, avatar: null, source: "unknown" });
  }

  return notFound(allowedOrigin);
}
