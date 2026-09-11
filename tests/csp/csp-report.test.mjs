// tests/csp/csp-report.test.mjs — unit tests for the CSP violation collector.
//
// Runs on plain `node --test` (no wrangler, no Cloudflare auth): the D1 binding
// is replaced by the in-memory fake below, which emulates the two statements the
// collector issues. SQL *validity* is covered by the local `wrangler pages dev`
// end-to-end run documented in docs/csp-telemetry.md, not by these tests.
//
// Run: node --test tests/csp/   (or: npm run test:csp)

import { test } from "node:test";
import assert from "node:assert/strict";

import {
  cap,
  sanitizeUrl,
  sanitizeDocument,
  normalizeDirective,
  parseReports,
  readCappedBody,
  storeReport,
  onRequest,
} from "../../functions/api/csp-report.js";

const ORIGIN = "http://127.0.0.1:8795";
const ENDPOINT = `${ORIGIN}/api/csp-report`;

// ---------------------------------------------------------------- fake D1 ----

class FakeStatement {
  constructor(db, sql) {
    this.db = db;
    this.sql = sql;
    this.params = [];
  }
  bind(...params) {
    this.params = params;
    return this;
  }
  async run() {
    this.db.calls.push({ sql: this.sql, params: this.params });

    // The cap-guarded aggregate upsert: emulates the WHERE (SELECT COUNT ...).
    if (this.sql.includes("WHERE (SELECT COUNT(*) FROM csp_reports WHERE day = ?) < ?")) {
      const isOverflowRow =
        this.params[0] === `${this.params[1]}|__overflow__` || this.params[2] === "__overflow__";
      if (!isOverflowRow && this.db.dayCount >= this.params.at(-1)) {
        return { meta: { changes: 0 } };
      }
      const key = this.params[0];
      const existing = this.db.rows.get(key);
      if (existing) {
        existing.hits += 1;
        existing.last_seen = this.params[9];
      } else {
        this.db.rows.set(key, {
          bucket_key: key,
          day: this.params[1],
          violated_directive: this.params[2],
          blocked_origin: this.params[3],
          blocked_path: this.params[4],
          document_path: this.params[5],
          disposition: this.params[6],
          source: this.params[7],
          hits: 1,
          first_seen: this.params[8],
          last_seen: this.params[9],
        });
      }
      return { meta: { changes: 1 } };
    }

    // The overflow row upsert.
    const key = this.params[0];
    const existing = this.db.rows.get(key);
    if (existing) {
      existing.hits += 1;
    } else {
      this.db.rows.set(key, {
        bucket_key: key,
        day: this.params[1],
        violated_directive: this.params[2],
        blocked_origin: this.params[3],
        blocked_path: "",
        document_path: this.params[4],
        disposition: "",
        source: this.params[5],
        hits: 1,
        first_seen: this.params[6],
        last_seen: this.params[7],
      });
    }
    return { meta: { changes: 1 } };
  }
}

class FakeD1 {
  constructor() {
    this.calls = [];
    this.rows = new Map();
    this.dayCount = 0;
  }
  prepare(sql) {
    return new FakeStatement(this, sql);
  }
}

function post(body, contentType, extraHeaders = {}) {
  return new Request(ENDPOINT, {
    method: "POST",
    headers: { "content-type": contentType, ...extraHeaders },
    body,
  });
}

const LEGACY = JSON.stringify({
  "csp-report": {
    "document-uri": `https://supercompute.io/dao?tab=holdings#token`,
    referrer: "",
    "violated-directive": "script-src 'self'",
    "effective-directive": "script-src",
    "original-policy": "default-src 'self'; script-src 'self'",
    disposition: "enforce",
    "blocked-uri": "https://evil.example/inject.js?token=0xDEADBEEF",
    "status-code": 200,
    "script-sample": "const secret = 'should-never-be-stored'",
  },
});

const MODERN = JSON.stringify([
  {
    type: "csp-violation",
    age: 0,
    url: `https://supercompute.io/staking`,
    user_agent: "Mozilla/5.0",
    body: {
      documentURL: `https://supercompute.io/staking?utm_source=x`,
      blockedURL: "https://cdn.example.net/app.js?access_token=SUPERSECRET",
      effectiveDirective: "script-src-elem",
      disposition: "enforce",
    },
  },
  { type: "deprecation", body: { id: "something-else" } },
]);

// ------------------------------------------------------------- sanitizers ----

test("cap truncates and never turns a non-string into text", () => {
  assert.equal(cap("abcdef", 3), "abc");
  assert.equal(cap(undefined), "");
  assert.equal(cap({ a: 1 }), "");
});

test("sanitizeUrl drops the query string so a token cannot be stored", () => {
  const { origin, url } = sanitizeUrl("https://evil.example/inject.js?token=0xDEADBEEF#frag");
  assert.equal(origin, "https://evil.example");
  assert.equal(url, "https://evil.example/inject.js");
  assert.ok(!url.includes("0xDEADBEEF"));
  assert.ok(!url.includes("?"));
});

test("sanitizeUrl keeps only the origin, never the full URL", () => {
  assert.equal(sanitizeUrl("https://cdn.example.net/deep/path/app.js").origin, "https://cdn.example.net");
  assert.equal(sanitizeUrl("http://127.0.0.1:8795/x").origin, "http://127.0.0.1:8795");
});

test("sanitizeUrl maps keyword values to keyword origins", () => {
  for (const keyword of ["inline", "eval", "data:", "blob", "self", "about"]) {
    const expected = keyword.endsWith(":") ? keyword.slice(0, -1) : keyword;
    assert.equal(sanitizeUrl(keyword).origin, expected, keyword);
    assert.equal(sanitizeUrl(keyword).url, "", keyword);
  }
});

test("sanitizeUrl survives junk without throwing", () => {
  assert.equal(sanitizeUrl(undefined).origin, "(unknown)");
  assert.equal(sanitizeUrl("   ").origin, "(unknown)");
  assert.equal(sanitizeUrl("not a url at all").origin, "not a url at all");
});

test("sanitizeDocument stores the path for our own origin, origin+path otherwise", () => {
  assert.equal(sanitizeDocument("https://supercompute.io/dao?tab=holdings#x"), "/dao");
  assert.equal(sanitizeDocument("https://supercompute.io/"), "/");
  assert.equal(
    sanitizeDocument("https://evil.example/fake?token=abc"),
    "https://evil.example/fake",
  );
  assert.equal(sanitizeDocument(""), "(unknown)");
});

test("normalizeDirective prefers effective-directive and strips the policy value", () => {
  assert.equal(normalizeDirective({ "effective-directive": "script-src-elem" }), "script-src-elem");
  assert.equal(normalizeDirective({ "violated-directive": "script-src 'self'" }), "script-src");
  assert.equal(normalizeDirective({ effectiveDirective: "Img-Src" }), "img-src");
  assert.equal(normalizeDirective({}), "(unknown)");
});

// ------------------------------------------------------------- body parse ----

test("parseReports normalizes the legacy application/csp-report body", () => {
  const records = parseReports(LEGACY, "application/csp-report");
  assert.equal(records.length, 1);
  const [r] = records;
  assert.equal(r.directive, "script-src");
  assert.equal(r.blockedOrigin, "https://evil.example");
  assert.equal(r.blockedUrl, "https://evil.example/inject.js");
  assert.equal(r.documentPath, "/dao");
  assert.equal(r.disposition, "enforce");
  assert.equal(r.source, "report-uri");
  // script-sample is inline source code — it must never reach storage.
  assert.ok(!JSON.stringify(r).includes("should-never-be-stored"));
});

test("parseReports normalizes the modern application/reports+json body", () => {
  const records = parseReports(MODERN, "application/reports+json");
  assert.equal(records.length, 1, "only csp-violation entries are collected");
  const [r] = records;
  assert.equal(r.directive, "script-src-elem");
  assert.equal(r.blockedOrigin, "https://cdn.example.net");
  assert.equal(r.blockedUrl, "https://cdn.example.net/app.js");
  assert.equal(r.documentPath, "/staking");
  assert.equal(r.source, "reports+json");
  assert.ok(!JSON.stringify(r).includes("SUPERSECRET"));
});

test("parseReports accepts a bare modern Report object", () => {
  const single = JSON.stringify({
    type: "csp-violation",
    body: {
      documentURL: `https://supercompute.io/terms`,
      blockedURL: "inline",
      effectiveDirective: "script-src",
    },
  });
  const records = parseReports(single, "application/reports+json");
  assert.equal(records.length, 1);
  assert.equal(records[0].blockedOrigin, "inline");
  assert.equal(records[0].documentPath, "/terms");
});

test("parseReports keeps the origin of a non-production document", () => {
  // A local/staging run (or a forged report) must be distinguishable from a
  // production document, so the origin is kept instead of being stripped.
  const local = JSON.stringify({
    type: "csp-violation",
    body: {
      documentURL: `${ORIGIN}/dao?tab=x`,
      blockedURL: "https://evil.example/a.js",
      effectiveDirective: "script-src",
    },
  });
  const records = parseReports(local, "application/reports+json");
  assert.equal(records[0].documentPath, `${ORIGIN}/dao`);
  assert.ok(!records[0].documentPath.includes("?"));
});

test("parseReports returns [] for junk instead of throwing", () => {
  assert.deepEqual(parseReports("not json", "application/csp-report"), []);
  assert.deepEqual(parseReports("", "application/csp-report"), []);
  assert.deepEqual(parseReports("{}", "application/csp-report"), []);
  assert.deepEqual(parseReports('{"csp-report": "nope"}', "application/csp-report"), []);
  assert.deepEqual(parseReports("[]", "application/reports+json"), []);
});

// -------------------------------------------------------------- body cap ----

test("readCappedBody rejects an over-cap body from its declared length", async () => {
  const req = post("x".repeat(9000), "application/csp-report");
  assert.equal(await readCappedBody(req), null);
});

test("readCappedBody rejects an over-cap streamed body with no content-length", async () => {
  const stream = new ReadableStream({
    start(controller) {
      const chunk = new TextEncoder().encode("y".repeat(4096));
      controller.enqueue(chunk);
      controller.enqueue(chunk);
      controller.enqueue(chunk);
      controller.close();
    },
  });
  const req = new Request(ENDPOINT, {
    method: "POST",
    headers: { "content-type": "application/csp-report" },
    body: stream,
    duplex: "half",
  });
  assert.equal(req.headers.get("content-length"), null);
  assert.equal(await readCappedBody(req), null);
});

test("readCappedBody returns the text for a normal body", async () => {
  assert.equal(await readCappedBody(post("hello", "application/csp-report")), "hello");
});

// -------------------------------------------------------------- handler ----

test("onRequest stores an aggregate row and answers 204 without echoing", async () => {
  const db = new FakeD1();
  const res = await onRequest({ request: post(LEGACY, "application/csp-report"), env: { DB: db } });
  assert.equal(res.status, 204);
  assert.equal(await res.text(), "", "the body must never be reflected");
  assert.equal(db.rows.size, 1);
  const row = [...db.rows.values()][0];
  assert.equal(row.violated_directive, "script-src");
  assert.equal(row.blocked_origin, "https://evil.example");
  assert.equal(row.document_path, "/dao");
  assert.equal(row.hits, 1);
});

test("onRequest increments hits for a repeated identical violation", async () => {
  const db = new FakeD1();
  for (let i = 0; i < 3; i += 1) {
    await onRequest({ request: post(LEGACY, "application/csp-report"), env: { DB: db } });
  }
  assert.equal(db.rows.size, 1, "same key must roll up, not fan out");
  assert.equal([...db.rows.values()][0].hits, 3);
});

test("onRequest rejects non-POST with 405 and touches no storage", async () => {
  const db = new FakeD1();
  for (const method of ["GET", "HEAD", "PUT", "OPTIONS"]) {
    const res = await onRequest({ request: new Request(ENDPOINT, { method }), env: { DB: db } });
    assert.equal(res.status, 405, method);
  }
  assert.equal(db.calls.length, 0);
});

test("onRequest drops an oversized report without writing", async () => {
  const db = new FakeD1();
  const res = await onRequest({
    request: post(JSON.stringify({ "csp-report": { "blocked-uri": "x".repeat(9000) } }), "application/csp-report"),
    env: { DB: db },
  });
  assert.equal(res.status, 204);
  assert.equal(db.calls.length, 0);
});

test("onRequest drops unparseable bodies without writing", async () => {
  const db = new FakeD1();
  const res = await onRequest({ request: post("<html>nope</html>", "text/html"), env: { DB: db } });
  assert.equal(res.status, 204);
  assert.equal(db.calls.length, 0);
});

test("onRequest refuses to touch the DB when there are reports but no binding", async () => {
  const res = await onRequest({ request: post(LEGACY, "application/csp-report"), env: {} });
  assert.equal(res.status, 204, "still 204 — a browser must never get an error page");
});

test("storeReport collapses new keys into one overflow row past the daily cap", async () => {
  const db = new FakeD1();
  const now = 1_800_000_000;
  const record = {
    directive: "script-src",
    blockedOrigin: "https://evil.example",
    blockedUrl: "https://evil.example/a.js",
    documentPath: "/dao",
    disposition: "enforce",
    source: "report-uri",
  };

  db.dayCount = 499;
  assert.equal(await storeReport(db, record, now), "aggregated");

  // Day is now at the ceiling: a NEW key must land in the overflow bucket...
  db.dayCount = 500;
  const other = { ...record, documentPath: "/token" };
  assert.equal(await storeReport(db, other, now), "overflow");
  const day = new Date(now * 1000).toISOString().slice(0, 10);
  const overflow = db.rows.get(`${day}|__overflow__`);
  assert.ok(overflow, "an overflow row must exist");
  assert.equal(overflow.violated_directive, "__overflow__");
  assert.equal(overflow.hits, 1);
  assert.equal(db.rows.size, 2, "the overflow bucket must not grow per report");

  // ...and a repeat of the same new key keeps collapsing into it.
  await storeReport(db, { ...other, documentPath: "/privacy" }, now);
  assert.equal(db.rows.size, 2);
  assert.equal(db.rows.get(`${day}|__overflow__`).hits, 2);
});

test("the stored row never contains a secret from a query string", async () => {
  const db = new FakeD1();
  await onRequest({ request: post(MODERN, "application/reports+json"), env: { DB: db } });
  const dump = JSON.stringify([...db.rows.values()]);
  assert.ok(!dump.includes("SUPERSECRET"));
  assert.ok(!dump.includes("utm_source"));
  assert.equal([...db.rows.values()][0].blocked_origin, "https://cdn.example.net");
});
