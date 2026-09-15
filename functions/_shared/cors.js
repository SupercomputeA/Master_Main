// functions/_shared/cors.js
// THE CORS origin resolver for every Pages Function that answers /api/*.
//
// One copy of the allowlist logic, in one file. Before this existed, 17 handlers
// each carried their own `allowedOrigin()` / `corsHeaders()` copy, and they had
// drifted into "echo any origin whose host ends with .pages.dev / .ngrok-free.app
// / .cloudflarestaging.com, or is localhost / 127.0.0.1" (SEC-F4, card t_492fdb5b).
// That is not an allowlist: anyone can deploy a free <anything>.pages.dev site or
// register a free *.ngrok-free.app tunnel, and every PR on this project minted a
// fresh `pr-<n>.supercompute.pages.dev` that the API then trusted. So the rule is
// now the one wrangler.toml always declared and the handlers ignored:
//
//   * The allowlist is EXACT ORIGIN and comes from `env.CORS_ORIGIN`
//     (`[vars] CORS_ORIGIN = "https://supercompute.io"`). Comma-separate it for the
//     rare deployment that needs more than one. An origin is echoed back only when
//     it is byte-identical to an entry; nothing else is ever reflected.
//   * No TLD / suffix matching. `.pages.dev`, `.cloudflarestaging.com` and
//     `.ngrok-free.app` are attacker-registrable, so a suffix match is a wildcard.
//   * Dev origins (localhost / 127.0.0.1) are opt-in per deployment via the
//     `ALLOW_DEV_ORIGINS` binding, so production trusts production origins only:
//         npx wrangler pages dev out --binding ALLOW_DEV_ORIGINS=true
//   * Anything that emits an Access-Control-Allow-Origin derived from the request
//     also emits `Vary: Origin` — without it a shared cache can pin one origin's
//     response and serve it to another.
//
// The wildcard set was never load-bearing: a preview deployment
// (`pr-98.supercompute.pages.dev`) serves its app and its /api/* from the same
// origin, and same-origin requests are not subject to CORS at all.
//
// This module exports no `onRequest`, so Pages bundles it as a helper and does not
// route it (same as the other functions/_shared/* modules).
//
// Read the Origin header ONLY here — that single-reader invariant is what
// tests/cors/cors-allowlist.test.mjs enforces.

/** Answered to any origin that is not on the allowlist — never the requested one. */
export const FALLBACK_ORIGIN = 'https://supercompute.io';

/**
 * Defaults. Every preflight in this repo answers with these unless it overrides
 * them; kept here so a handler cannot invent a wider method/header set by accident.
 */
export const DEFAULT_ALLOW_METHODS = 'GET, POST, OPTIONS';
export const DEFAULT_ALLOW_HEADERS = 'Content-Type, Authorization';

/** Origins only a local dev server listens on. Never part of the prod set. */
export const DEV_ORIGINS = Object.freeze([
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:8080',
  'http://127.0.0.1:8080',
  'http://localhost:8788',
  'http://127.0.0.1:8788',
  'http://localhost:8791',
  'http://127.0.0.1:8791',
  'http://localhost:8793',
  'http://127.0.0.1:8793',
]);

/** True only when the deployment explicitly opts in. Absent means production. */
export function devOriginsEnabled(env) {
  const flag = env?.ALLOW_DEV_ORIGINS;
  return flag === true || flag === 'true' || flag === '1';
}

/** The exact-origin allowlist for this request: env.CORS_ORIGIN only, plus dev on opt-in. */
export function allowedOrigins(env) {
  const declared = String(env?.CORS_ORIGIN ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const origins = new Set(declared.length ? declared : [FALLBACK_ORIGIN]);
  if (devOriginsEnabled(env)) for (const origin of DEV_ORIGINS) origins.add(origin);
  return origins;
}

/** The first configured origin — what an unlisted (or absent) Origin is answered with. */
export function primaryOrigin(env) {
  const declared = String(env?.CORS_ORIGIN ?? '')
    .split(',')[0]
    ?.trim();
  return declared || FALLBACK_ORIGIN;
}

/**
 * The Origin to send back: the request's own origin only when it is literally on
 * the allowlist, otherwise the configured primary origin. Never a suffix match,
 * never a wildcard, never the requested origin on a miss.
 */
export function corsOrigin(request, env) {
  const requested = request?.headers?.get?.('Origin') || '';
  if (!requested) return primaryOrigin(env);
  return allowedOrigins(env).has(requested) ? requested : primaryOrigin(env);
}

/** Headers for an already-resolved origin (see corsOrigin). */
export function corsHeaders(origin, opts = {}) {
  return {
    'Access-Control-Allow-Origin': origin || FALLBACK_ORIGIN,
    'Access-Control-Allow-Methods': opts.methods || DEFAULT_ALLOW_METHODS,
    'Access-Control-Allow-Headers': opts.headers || DEFAULT_ALLOW_HEADERS,
    'Vary': 'Origin',
  };
}

/** Resolve the request's origin and return the CORS headers in one step. */
export function corsHeadersFor(request, env, opts = {}) {
  return corsHeaders(corsOrigin(request, env), opts);
}
