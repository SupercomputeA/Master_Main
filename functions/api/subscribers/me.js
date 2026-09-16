// functions/api/subscribers/me.js — GET /api/subscribers/me
//
// WHY THIS FILE EXISTS (fix 2026-09-11):
// The /me endpoint used to be a sub-path branch *inside* functions/api/subscribers.js:
//
//     const subPath = url.pathname.replace('/api/subscribers', '') || '/'
//     if (request.method === 'GET' && subPath === '/me') { ... }
//
// That branch was dead code. Cloudflare Pages Functions route by FILE, not by
// in-handler path parsing: `functions/api/subscribers.js` only ever receives the
// exact path `/api/subscribers`, so nothing was mounted at `/api/subscribers/me`
// and the live URL returned the site's static 404 (verified on supercompute.io:
// GET /api/subscribers/me -> 404 `404: This page could not be found`).
//
// Impact: /dashboard fetches this endpoint immediately after SIWE login to render
// the member's row. With the 404, the funnel dead-ended — wallet could connect,
// pick a tier, pay, and still land on an empty dashboard. This is the member-view
// half of the funnel, so it must be a real route.
//
// Precedent that nested files route correctly in this project:
// functions/api/subscribers/pay.js — GET /api/subscribers/pay returns that file's
// own 405 `{"error":"method not allowed"}`, not the static 404.
//
// Auth: Bearer session id (same contract as verifySession in functions/api/auth.js
// and getSessionWallet in functions/api/subscribers.js). No cookie fallback exists
// anywhere in this codebase — do not add one here.

import { json } from "../auth.js";
import { corsOrigin, corsHeadersFor } from "../../_shared/cors.js";

async function sessionWallet(env, request) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ") || !env?.DB) return null;
  try {
    const row = await env.DB.prepare(
      "SELECT wallet_address FROM sessions WHERE id = ? AND expires_at > ?"
    )
      .bind(authHeader.slice(7), Math.floor(Date.now() / 1000))
      .first();
    return row?.wallet_address?.toLowerCase() || null;
  } catch {
    return null;
  }
}

export async function onRequest({ request, env }) {
  const origin = corsOrigin(request, env);
  const j = (data, status = 200) => json(data, status, origin);

  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeadersFor(request, env, { "Access-Control-Allow-Methods": "GET, OPTIONS" }),
    });
  }

  if (request.method !== "GET") {
    return j({ error: "method not allowed" }, 405);
  }

  // Signed out (or no DB bound): a well-formed empty answer, never a 404/500 —
  // /dashboard treats `subscriber: null` as "show the connect-wallet lock panel".
  const wallet = await sessionWallet(env, request);
  if (!wallet || !env?.DB) return j({ subscriber: null }, 200);

  try {
    const row = await env.DB.prepare(
      "SELECT * FROM subscribers WHERE wallet_address = ? ORDER BY joined_at DESC LIMIT 1"
    )
      .bind(wallet)
      .first();
    return j({ subscriber: row || null });
  } catch (e) {
    return j({ subscriber: null, error: "db_error", message: String(e) }, 500);
  }
}
