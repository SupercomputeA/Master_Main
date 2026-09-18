/**
 * SEC-F3 (card t_49b40e3c) — the /api/* CORS allowlist must not ship dev origins
 * to production.
 *
 * Two things are asserted, and both matter:
 *
 *  1. behaviour — drive the real handlers' onRequest() with real Request objects and
 *     read Access-Control-Allow-Origin off the response. A production deployment
 *     (no ALLOW_DEV_ORIGINS binding) must answer a localhost Origin with the
 *     production fallback, and must echo it only when the deployment opts in.
 *  2. shape — the allowlist lives in exactly ONE module and neither handler may
 *     re-inline a dev origin. Without this, the next handler added to /api/* is free
 *     to reintroduce the leak that the behaviour tests above would not see.
 *
 * Run:  node --test tests/security/cors-origins.test.mjs
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import {
  DEV_ORIGINS,
  FALLBACK_ORIGIN,
  PROD_ORIGINS,
  allowOrigin,
  allowedOrigins,
  devOriginsEnabled,
} from "../../functions/_shared/cors-origins.js";

import { onRequest as farcasterHandler } from "../../functions/api/farcaster.js";
import { onRequest as socialHandler } from "../../functions/api/social/[[catchall]].js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const HANDLERS = {
  "functions/api/farcaster.js": farcasterHandler,
  "functions/api/social/[[catchall]].js": socialHandler,
};

/** A production deployment as Pages sees it: no ALLOW_DEV_ORIGINS binding. */
const PROD_ENV = { DB: undefined };

const preflight = (origin) =>
  new Request("https://supercompute.io/api/x", {
    method: "OPTIONS",
    headers: origin === null ? {} : { Origin: origin },
  });

const acao = (res) => res.headers.get("Access-Control-Allow-Origin");

// ── the allowlist itself ───────────────────────────────────────────────────

test("the shipped allowlist is production-only", () => {
  assert.deepEqual(
    [...PROD_ORIGINS],
    ["https://supercompute.io", "https://staging.supercompute.io"],
  );
  for (const dev of DEV_ORIGINS) {
    assert.ok(
      !allowedOrigins(PROD_ENV).has(dev),
      `${dev} must not be in the production allowlist`,
    );
  }
});

test("dev origins are opt-in, and only for an explicit true", () => {
  for (const env of [undefined, {}, { ALLOW_DEV_ORIGINS: "" }, { ALLOW_DEV_ORIGINS: "false" }, { ALLOW_DEV_ORIGINS: "no" }]) {
    assert.equal(devOriginsEnabled(env), false, `${JSON.stringify(env)} must not enable dev origins`);
  }
  for (const env of [{ ALLOW_DEV_ORIGINS: true }, { ALLOW_DEV_ORIGINS: "true" }, { ALLOW_DEV_ORIGINS: "1" }]) {
    assert.equal(devOriginsEnabled(env), true, `${JSON.stringify(env)} must enable dev origins`);
    for (const dev of DEV_ORIGINS) assert.ok(allowedOrigins(env).has(dev));
  }
});

test("an unknown origin is answered with the fallback, never echoed", () => {
  assert.equal(allowOrigin("https://evil.example", PROD_ENV), FALLBACK_ORIGIN);
  assert.equal(allowOrigin("https://evil.example", { ALLOW_DEV_ORIGINS: "true" }), FALLBACK_ORIGIN);
  assert.equal(allowOrigin("https://supercompute.io.evil.example", PROD_ENV), FALLBACK_ORIGIN);
  assert.equal(allowOrigin("null", PROD_ENV), FALLBACK_ORIGIN);
  assert.equal(allowOrigin(undefined, PROD_ENV), FALLBACK_ORIGIN);
});

// ── the real handlers ──────────────────────────────────────────────────────

test("every handler returns Vary: Origin, so a cached ACAO cannot leak across origins", async () => {
  for (const [file, handler] of Object.entries(HANDLERS)) {
    const res = await handler({ request: preflight(PROD_ORIGINS[0]), env: PROD_ENV });
    assert.match(res.headers.get("Vary") || "", /Origin/, `${file} must send Vary: Origin`);
  }
});

test("production preflight does not echo a dev origin", async () => {
  for (const [file, handler] of Object.entries(HANDLERS)) {
    for (const dev of DEV_ORIGINS) {
      const res = await handler({ request: preflight(dev), env: PROD_ENV });
      assert.equal(
        acao(res),
        FALLBACK_ORIGIN,
        `${file} echoed ${dev} for a production deployment`,
      );
    }
  }
});

test("production preflight still echoes the production origins", async () => {
  for (const [file, handler] of Object.entries(HANDLERS)) {
    for (const prod of PROD_ORIGINS) {
      const res = await handler({ request: preflight(prod), env: PROD_ENV });
      assert.equal(acao(res), prod, `${file} did not echo ${prod}`);
    }
  }
});

test("a dev origin is echoed only when the deployment opts in", async () => {
  const env = { ...PROD_ENV, ALLOW_DEV_ORIGINS: "true" };
  for (const [file, handler] of Object.entries(HANDLERS)) {
    for (const dev of DEV_ORIGINS) {
      const res = await handler({ request: preflight(dev), env });
      assert.equal(acao(res), dev, `${file} did not echo ${dev} with ALLOW_DEV_ORIGINS=true`);
    }
  }
});

test("non-preflight responses carry the same allowlist", async () => {
  // farcaster: no NEYNAR_API_KEY bound -> 503; social: no DB bound -> 500.
  // Both go through json() -> corsHeaders(), i.e. the path the leak used.
  const farcaster = await farcasterHandler({
    request: new Request("https://supercompute.io/api/farcaster/info", {
      headers: { Origin: "http://localhost:3000" },
    }),
    env: PROD_ENV,
  });
  assert.equal(farcaster.status, 503);
  assert.equal(acao(farcaster), FALLBACK_ORIGIN);

  const social = await socialHandler({
    request: new Request("https://supercompute.io/api/social/accounts", {
      headers: { Origin: "http://localhost:3000" },
    }),
    env: PROD_ENV,
  });
  // 401 "missing session" — the bearer check runs before the DB check, so this needs
  // no Authorization header and no D1 binding to exercise the json()/CORS path.
  assert.equal(social.status, 401);
  assert.equal(acao(social), FALLBACK_ORIGIN);
});

// ── shape: one source of truth for the list ───────────────────────────────

test("neither handler re-inlines a dev origin", () => {
  for (const file of Object.keys(HANDLERS)) {
    const source = readFileSync(join(ROOT, file), "utf8");
    // A dev origin has to appear as an origin LITERAL (scheme + host) — prose in a
    // comment is fine, a value the code could answer with is not.
    assert.doesNotMatch(
      source,
      /["'`]https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?["'`]/,
      `${file} contains a hardcoded dev origin literal`,
    );
    assert.doesNotMatch(source, /ALLOWED_ORIGINS\s*=\s*new Set/, `${file} re-declares an allowlist`);
    assert.match(
      source,
      /from "\.\.\/_shared\/cors-origins\.js"|from "\.\.\/\.\.\/_shared\/cors-origins\.js"/,
      `${file} must take the allowlist from the shared module`,
    );
  }
});

test("the dev origins exist only in the gated shared module, which is not a route", () => {
  const shared = readFileSync(join(ROOT, "functions/_shared/cors-origins.js"), "utf8");
  assert.match(shared, /export const DEV_ORIGINS = Object\.freeze\(\[/);
  assert.doesNotMatch(shared, /export (async )?function onRequest/, "a helper must not become a route");
});
