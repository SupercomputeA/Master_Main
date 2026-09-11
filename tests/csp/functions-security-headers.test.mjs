/**
 * Tests for the Pages Functions security-header middleware (card t_58f99396):
 *   functions/_middleware.js
 *   functions/_shared/security-headers.js
 *
 * Run: node --test tests/csp/functions-security-headers.test.mjs
 *
 * These are unit tests over the real modules — no network, no wrangler. The
 * live end-to-end proof (wrangler pages dev over the export, real Functions,
 * real D1/KV bindings) is recorded on the kanban card; this file is the
 * regression net that runs in a second.
 */
import test from "node:test";
import assert from "node:assert/strict";

import {
  SECURITY_HEADERS,
  CONTENT_SECURITY_POLICY,
  isDocumentResponse,
  withSecurityHeaders,
} from "../../functions/_shared/security-headers.js";
import { onRequest } from "../../functions/_middleware.js";

const NOUVEAU = { "Content-Type": "application/json; charset=utf-8" };

function jsonResponse(body = { ok: true }, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { ...NOUVEAU, ...extraHeaders },
  });
}

function assertBaseHeaders(res) {
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
    assert.equal(res.headers.get(name), value, `missing/incorrect ${name}`);
  }
}

test("every declared header has a non-empty value", () => {
  const entries = Object.entries(SECURITY_HEADERS);
  assert.ok(entries.length >= 5, "expected at least the 5 static-asset headers");
  for (const [name, value] of entries) {
    assert.ok(value.length > 0, `${name} has an empty value`);
  }
});

test("JSON response: base headers added, CSP intentionally NOT added", async () => {
  const res = withSecurityHeaders(jsonResponse({ count: 3 }));
  assertBaseHeaders(res);
  assert.equal(res.headers.get("Content-Security-Policy"), null);
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { count: 3 });
});

test("HTML response: gets the document CSP", () => {
  const res = withSecurityHeaders(
    new Response("<html><body>hi</body></html>", {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    }),
  );
  assertBaseHeaders(res);
  assert.equal(res.headers.get("Content-Security-Policy"), CONTENT_SECURITY_POLICY);
  assert.ok(CONTENT_SECURITY_POLICY.includes("script-src 'self'"));
  assert.ok(!CONTENT_SECURITY_POLICY.includes("unsafe-eval"));
});

test("response with no Content-Type is treated as a document (fail safe)", () => {
  // `new Response("<html>")` gets `text/plain;charset=UTF-8` auto-applied by the
  // runtime, so the header has to be removed explicitly to exercise the branch.
  const bare = new Response("<html></html>");
  bare.headers.delete("Content-Type");
  assert.equal(bare.headers.get("Content-Type"), null);
  const res = withSecurityHeaders(bare);
  assert.equal(res.headers.get("Content-Security-Policy"), CONTENT_SECURITY_POLICY);
});

test("only html/xhtml counts as a document", () => {
  const withType = (ct) => isDocumentResponse(new Response("x", { headers: { "Content-Type": ct } }));
  assert.equal(withType(""), true);
  assert.equal(withType("text/html; charset=utf-8"), true);
  assert.equal(withType("application/xhtml+xml"), true);
  assert.equal(withType("APPLICATION/JSON"), false);
  assert.equal(withType("application/json; charset=utf-8"), false);
  assert.equal(withType("text/plain"), false);
  assert.equal(withType("image/svg+xml"), false);
});

test("per-route CORS headers survive untouched", () => {
  const res = withSecurityHeaders(
    jsonResponse({ ok: true }, {
      "Access-Control-Allow-Origin": "https://supercompute.io",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    }),
  );
  assert.equal(res.headers.get("Access-Control-Allow-Origin"), "https://supercompute.io");
  assert.equal(res.headers.get("Access-Control-Allow-Methods"), "POST, OPTIONS");
  assert.equal(res.headers.get("Access-Control-Allow-Headers"), "Content-Type, Authorization");
  assert.equal(res.headers.get("Content-Type"), NOUVEAU["Content-Type"]);
});

test("a route-supplied CSP is respected, not overwritten", () => {
  const res = withSecurityHeaders(
    new Response("<html></html>", {
      headers: { "Content-Type": "text/html", "Content-Security-Policy": "default-src 'none'" },
    }),
  );
  assert.equal(res.headers.get("Content-Security-Policy"), "default-src 'none'");
});

test("the original response is not mutated (Functions responses are immutable)", async () => {
  const original = jsonResponse({ ok: true });
  const decorated = withSecurityHeaders(original);
  // Headers of the input are rewritten into a NEW object, never in place...
  assert.equal(original.headers.get("X-Content-Type-Options"), null);
  assert.notEqual(decorated, original);
  assert.deepEqual(await decorated.json(), { ok: true });
  // ...and the body stream is transferred to the clone (this is why the card
  // mandates `new Response(res.body, res)`: the caller's original is discarded).
  assert.equal(original.bodyUsed, true);
});

test("body-less statuses clone without throwing", () => {
  for (const status of [204, 205, 304]) {
    const res = withSecurityHeaders(new Response(null, { status }));
    assert.equal(res.status, status);
    assertBaseHeaders(res);
    assert.equal(res.body, null);
  }
});

test("body-less 200 (CORS preflight) gets base headers but NOT the CSP", () => {
  // Every /api/* route answers OPTIONS with `new Response(null, { headers: cors })`
  // (functions/api/auth.js). Live-run regression: keying on Content-Type alone
  // put the 700-byte document policy on every preflight.
  const preflight = new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "https://supercompute.io",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
    },
  });
  assert.equal(preflight.headers.get("Content-Type"), null);
  const res = withSecurityHeaders(preflight);
  assert.equal(res.status, 200);
  assertBaseHeaders(res);
  assert.equal(res.headers.get("Content-Security-Policy"), null);
  assert.equal(res.headers.get("Access-Control-Allow-Origin"), "https://supercompute.io");
});

test("non-200 statuses keep their status code", () => {
  const res = withSecurityHeaders(
    new Response(JSON.stringify({ error: "Nope" }), {
      status: 405,
      headers: NOUVEAU,
    }),
  );
  assert.equal(res.status, 405);
  assertBaseHeaders(res);
});

test("onRequest decorates whatever the route returned", async () => {
  const context = {
    request: new Request("https://supercompute.io/api/school"),
    next: async () => jsonResponse({ modules: [] }),
  };
  const res = await onRequest(context);
  assert.equal(res.status, 200);
  assertBaseHeaders(res);
  assert.deepEqual(await res.json(), { modules: [] });
});

test("a thrown route error becomes a decorated, non-reflective 500 (JSON for /api/*)", async () => {
  const secrets = "D1_ERROR: UNIQUE constraint failed: users.email";
  const context = {
    request: new Request("https://supercompute.io/api/auth/login", { method: "POST" }),
    next: async () => {
      throw new Error(secrets);
    },
  };
  const res = await onRequest(context);
  assert.equal(res.status, 500);
  assertBaseHeaders(res);
  assert.equal(res.headers.get("Content-Type"), "application/json; charset=utf-8");
  const body = await res.text();
  assert.ok(!body.includes(secrets), "internal error text must not be reflected");
  assert.deepEqual(JSON.parse(body), { error: "Internal error" });
});

test("static/SPA routes pass through untouched — _headers owns them", async () => {
  const original = new Response("<html></html>", {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
  const context = {
    request: new Request("https://supercompute.io/terms"),
    next: async () => original,
  };
  const res = await onRequest(context);
  // Same object: no clone, no header rewrite, no CSP on the static path.
  assert.equal(res, original);
  assert.equal(res.headers.get("Content-Security-Policy"), null);
  assert.equal(res.headers.get("X-Content-Type-Options"), null);
});

test("a thrown error on a static path is not swallowed", async () => {
  await assert.rejects(
    onRequest({
      request: new Request("https://supercompute.io/terms"),
      next: async () => {
        throw new Error("boom");
      },
    }),
    /boom/,
  );
});
