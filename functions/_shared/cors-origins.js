// functions/_shared/cors-origins.js
// Exact-origin CORS allowlist, shared by the Pages Functions that answer /api/*.
//
// Audit pattern: match the request's Origin against an exact-origin Set and never
// echo it back unless it is on the list. An unknown origin is answered with the
// production fallback, not with itself, so no origin can grant itself CORS.
//
// Environment gating (SEC-F3, card t_49b40e3c): the dev origins below are the ones
// `wrangler pages dev` and `next dev` listen on. They used to sit in the shipped
// allowlist, which meant every production deployment trusted localhost. They are now
// opt-in per deployment via the `ALLOW_DEV_ORIGINS` binding, so the production set
// contains production origins only:
//
//   npx wrangler pages dev out --binding ALLOW_DEV_ORIGINS=true   # local work
//   (production)                                                  # nothing to set
//
// This module exports no onRequest, so it is bundled as a helper and is NOT matched
// as a route (same as the other functions/_shared/* modules).

export const PROD_ORIGINS = Object.freeze([
  "https://supercompute.io",
  "https://staging.supercompute.io",
]);

/** Origins only a local dev server listens on. Never part of the prod allowlist. */
export const DEV_ORIGINS = Object.freeze([
  "http://127.0.0.1:8791", // wrangler pages dev (farcaster port)
  "http://127.0.0.1:8793", // wrangler pages dev (social port)
  "http://localhost:3000", // next dev
]);

/** Answered to any origin that is not on the list — never the requested origin. */
export const FALLBACK_ORIGIN = "https://supercompute.io";

/** True only when the deployment explicitly opts in. Absent means production. */
export function devOriginsEnabled(env) {
  const flag = env?.ALLOW_DEV_ORIGINS;
  return flag === true || flag === "true" || flag === "1";
}

/** The allowlist for this request: production origins, plus dev ones on opt-in. */
export function allowedOrigins(env) {
  const origins = new Set(PROD_ORIGINS);
  if (devOriginsEnabled(env)) for (const origin of DEV_ORIGINS) origins.add(origin);
  return origins;
}

/** The Origin to echo: an allowed origin, else the production fallback. */
export function allowOrigin(origin, env) {
  const requested = typeof origin === "string" ? origin : "";
  return allowedOrigins(env).has(requested) ? requested : FALLBACK_ORIGIN;
}
