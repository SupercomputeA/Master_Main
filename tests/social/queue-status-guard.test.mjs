// tests/social/queue-status-guard.test.mjs — SEC-F2 (PR #62 review, findings F2).
//
// Two integrity rules the admin Social Command Center depends on:
//   1. POST /queue/update only accepts the social_queue.status enum
//      (draft | scheduled | posted | partial | failed | dry_run).
//   2. POST /publish refuses to re-dispatch an item that is already `posted`
//      unless the caller sends an explicit boolean `force: true` — the guard that
//      stops a double-post the moment real Farcaster / Bluesky credentials exist.
// ...plus the two audit-trail honesty rules that live in the same statement:
// a live attempt that failed is recorded `failed` (not a flattering `dry_run`),
// and `posted_at` never moves backwards to NULL.
//
// Self-contained: a fake D1 + fake env, no network, no dependencies. Run with
//   node --test tests/social/queue-status-guard.test.mjs

import test from "node:test"
import assert from "node:assert/strict"
import path from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"

const HERE = path.dirname(fileURLToPath(import.meta.url))
const HANDLER = pathToFileURL(path.resolve(HERE, "../../functions/api/social/[[catchall]].js")).href
const { onRequest } = await import(HANDLER)

const ADMIN_WALLET = "0x1a828cd220559479e2f761805da4ee722683323b"
const SESSION = "session-valid"
const ENUM = ["draft", "scheduled", "posted", "partial", "failed", "dry_run"]

// ── fake Cloudflare Pages env (D1 + KV-free) ──────────────────────────────
function makeEnv({ items = [], extra = {} } = {}) {
  const store = new Map(items.map((i) => [i.id, { ...i }]))
  const writes = []

  const DB = {
    prepare(sql) {
      const normalized = sql.replace(/\s+/g, " ").trim()
      return {
        bind(...args) {
          return {
            async first() {
              if (normalized.startsWith("SELECT wallet_address FROM sessions")) {
                return args[0] === SESSION ? { wallet_address: ADMIN_WALLET } : null
              }
              if (normalized.startsWith("SELECT role FROM users")) return { role: "admin" }
              if (normalized.startsWith("SELECT role FROM admin_wallets")) return { role: "admin" }
              if (normalized.startsWith("SELECT * FROM social_queue WHERE id")) return store.get(args[0]) || null
              return null
            },
            async all() {
              return { results: [...store.values()] }
            },
            async run() {
              writes.push({ sql: normalized, args })
              if (normalized.startsWith("UPDATE social_queue SET")) {
                const row = store.get(args[args.length - 1])
                if (row) {
                  const setPart = normalized.slice(normalized.indexOf("SET ") + 4, normalized.indexOf(" WHERE "))
                  const cols = setPart.split(", ").map((f) => f.split(" = ")[0])
                  let i = 0
                  for (const col of cols) {
                    if (col === "updated_at") continue // literal unixepoch(), no placeholder
                    row[col] = args[i++]
                  }
                }
              }
              return { success: true }
            },
          }
        },
      }
    },
  }

  return { env: { DB, ...extra }, writes, store }
}

async function call(route, body, env) {
  const res = await onRequest({
    request: new Request(`https://supercompute.io/api/social/${route}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Origin: "https://supercompute.io", Authorization: `Bearer ${SESSION}` },
      body: JSON.stringify(body),
    }),
    env,
  })
  let parsed = null
  try { parsed = await res.json() } catch { parsed = null }
  return { status: res.status, body: parsed }
}

async function withFetchStub(stub, fn) {
  const original = globalThis.fetch
  globalThis.fetch = stub
  try { return await fn() } finally { globalThis.fetch = original }
}

const ITEM = {
  id: "sq_test0001",
  body: "sovereign compute rails",
  platforms: JSON.stringify(["farcaster"]),
  status: "draft",
  scheduled_at: null,
  posted_at: null,
  results: null,
  created_by: ADMIN_WALLET,
}

// ── 1. status enum on /queue/update ───────────────────────────────────────
test("queue/update rejects a status outside the enum with 400 + the allowed list", async () => {
  const { env, writes } = makeEnv({ items: [ITEM] })
  const res = await call("queue/update", { id: ITEM.id, status: "posted-evil" }, env)

  assert.equal(res.status, 400)
  assert.equal(res.body.error, "invalid status")
  assert.deepEqual(res.body.allowed, ENUM)
  assert.equal(writes.length, 0, "a rejected status must never reach the audit trail")
})

test("queue/update rejects non-string and empty status values", async () => {
  for (const bad of [null, "", 7, true, { status: "posted" }, ["posted"]]) {
    const { env, writes } = makeEnv({ items: [ITEM] })
    const res = await call("queue/update", { id: ITEM.id, status: bad }, env)
    assert.equal(res.status, 400, `status ${JSON.stringify(bad)} must be refused`)
    assert.equal(writes.length, 0)
  }
})

test("queue/update accepts every enum member and writes it verbatim", async () => {
  for (const status of ENUM) {
    const { env, writes, store } = makeEnv({ items: [ITEM] })
    const res = await call("queue/update", { id: ITEM.id, status }, env)
    assert.equal(res.status, 200, `${status} must be accepted`)
    assert.equal(res.body.item.status, status)
    assert.equal(store.get(ITEM.id).status, status)
    assert.equal(writes.length, 1)
    assert.equal(writes[0].args[0], status)
  }
})

test("queue/update still accepts a body-only update (status untouched)", async () => {
  const { env, writes, store } = makeEnv({ items: [ITEM] })
  const res = await call("queue/update", { id: ITEM.id, body: "edited" }, env)
  assert.equal(res.status, 200)
  assert.equal(store.get(ITEM.id).body, "edited")
  assert.equal(store.get(ITEM.id).status, "draft")
  assert.equal(writes.length, 1)
})

// ── 2. re-publish guard on /publish ───────────────────────────────────────
test("publish refuses to re-dispatch an item already status=posted (409, no adapter call)", async () => {
  const posted = { ...ITEM, status: "posted", posted_at: 1700000000, results: JSON.stringify([{ platform: "farcaster", ok: true, mode: "live", detail: "cast 0xdeadbeef" }]) }
  const { env, writes } = makeEnv({ items: [posted] })

  let dispatches = 0
  const res = await withFetchStub(async () => { dispatches++; return { ok: true, json: async () => ({}) } }, () =>
    call("publish", { id: ITEM.id }, env)
  )

  assert.equal(res.status, 409)
  assert.equal(res.body.status, "posted")
  assert.equal(res.body.posted_at, 1700000000)
  assert.match(res.body.error, /already posted/)
  assert.match(res.body.hint, /force: true/)
  assert.equal(dispatches, 0, "a refused re-dispatch must not touch a live platform")
  assert.equal(writes.length, 0, "a refused re-dispatch must not rewrite the audit trail")
})

test("publish refuses a truthy-but-not-boolean force (\"true\", 1) — force must be explicit", async () => {
  const posted = { ...ITEM, status: "posted", posted_at: 1700000000, results: "[]" }
  for (const force of ["true", 1, "yes"]) {
    const { env } = makeEnv({ items: [posted] })
    const res = await call("publish", { id: ITEM.id, force }, env)
    assert.equal(res.status, 409, `force: ${JSON.stringify(force)} must not unlock the guard`)
  }
})

test("publish with force: true re-dispatches a posted item and keeps posted_at", async () => {
  const posted = { ...ITEM, status: "posted", posted_at: 1700000000, results: "[]" }
  const { env, store } = makeEnv({ items: [posted] }) // no credentials → dry-run

  const res = await call("publish", { id: ITEM.id, force: true }, env)

  assert.equal(res.status, 200)
  assert.equal(res.body.forced, true)
  assert.equal(res.body.status, "dry_run", "nothing was sent, so the last attempt is a dry_run")
  assert.equal(store.get(ITEM.id).posted_at, 1700000000, "posted_at must never be erased by a forced re-dispatch")
})

// ── 3. normal publish still works, and its status tells the truth ─────────
test("publish of a draft with no credentials is a dry_run with per-platform detail", async () => {
  const item = { ...ITEM, platforms: JSON.stringify(["farcaster", "substack"]) }
  const { env, store } = makeEnv({ items: [item] })

  const res = await call("publish", { id: ITEM.id }, env)

  assert.equal(res.status, 200)
  assert.equal(res.body.status, "dry_run")
  assert.equal(res.body.results.length, 2)
  assert.equal(res.body.results.every((r) => r.mode !== "live"), true)
  assert.equal(store.get(ITEM.id).posted_at, null)
})

test("publish records `failed` — not dry_run — when a live attempt fails", async () => {
  const { env, store } = makeEnv({
    items: [ITEM],
    extra: { NEYNAR_API_KEY: "k", NEYNAR_SIGNER_UUID: "s" },
  })

  const res = await withFetchStub(
    async () => ({ ok: false, status: 401, json: async () => ({ message: "unauthorized" }) }),
    () => call("publish", { id: ITEM.id }, env)
  )

  assert.equal(res.status, 200)
  assert.equal(res.body.status, "failed")
  assert.equal(res.body.results[0].mode, "live")
  assert.equal(store.get(ITEM.id).status, "failed")
  assert.equal(store.get(ITEM.id).posted_at, null)
})

test("publish records `partial` when one rail posts and another fails", async () => {
  const { env, store } = makeEnv({
    items: [{ ...ITEM, platforms: JSON.stringify(["farcaster", "bluesky"]) }],
    extra: {
      NEYNAR_API_KEY: "k",
      NEYNAR_SIGNER_UUID: "s",
      BLUESKY_HANDLE: "supercompute.bsky.social",
      BLUESKY_APP_PASSWORD: "app-pw",
    },
  })

  const res = await withFetchStub(async (url) => {
    if (String(url).includes("api.neynar.com")) return { ok: true, status: 200, json: async () => ({ cast: { hash: "0xcast" } }) }
    if (String(url).includes("createSession")) return { ok: true, status: 200, json: async () => ({ accessJwt: "jwt", did: "did:plc:test" }) }
    return { ok: false, status: 500, json: async () => ({ error: "boom" }) }
  }, () => call("publish", { id: ITEM.id }, env))

  assert.equal(res.status, 200)
  assert.equal(res.body.status, "partial")
  assert.ok(store.get(ITEM.id).posted_at > 0, "a partial success stamped a real post")
})

test("publish records `posted` when every live rail succeeds, and stamps posted_at", async () => {
  const { env, store } = makeEnv({
    items: [ITEM],
    extra: { NEYNAR_API_KEY: "k", NEYNAR_SIGNER_UUID: "s" },
  })

  const res = await withFetchStub(
    async () => ({ ok: true, status: 200, json: async () => ({ cast: { hash: "0xcast" } }) }),
    () => call("publish", { id: ITEM.id }, env)
  )

  assert.equal(res.body.status, "posted")
  assert.ok(store.get(ITEM.id).posted_at > 0)

  // ...and now that it is posted, a second dispatch is refused.
  const again = await call("publish", { id: ITEM.id }, env)
  assert.equal(again.status, 409)
})
