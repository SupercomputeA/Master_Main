// tests/projects/schema-contract.test.mjs
//
// Regression guard for the 2026-09-15 production outage: GET https://supercompute.io/api/projects
// answered 500 `error code: 1101` (uncaught Worker exception) because
// `functions/api/projects.js` selected `ticker, stack` while the live D1 `projects` table
// carries `tagline, repo, coin, ...` and has never had `ticker`/`stack`. D1 raised
// `no such column: ticker`; the exception escaped `onRequest` and Pages replied with no JSON
// body at all.
//
// This suite drives the REAL handler over a REAL SQLite engine (`node:sqlite`, what D1 runs)
// loaded with the REAL DDL (`schema.sql` + every `migrations/*.sql`, in sorted order), so a
// future code/schema drift fails `validate` before it can reach a deploy.
//
// Node 22.5+/24 required for `node:sqlite` (unflagged). CI pins Node 24.

import { test } from "node:test"
import assert from "node:assert/strict"
import { DatabaseSync } from "node:sqlite"
import { readFileSync, readdirSync, writeFileSync, unlinkSync } from "node:fs"
import os from "node:os"
import path from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"

const HERE = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(HERE, "..", "..")
const HANDLER = path.join(ROOT, "functions", "api", "projects.js")

// The pre-fix column list, kept verbatim so the mutation test below can restore it.
const PREFIX_ON_BROKEN_COLUMNS = ["id", "name", "ticker", "stack", "description", "status", "created_at"]

const ddlFiles = () => [
  path.join(ROOT, "schema.sql"),
  ...readdirSync(path.join(ROOT, "migrations"))
    .filter((f) => f.endsWith(".sql"))
    .sort()
    .map((f) => path.join(ROOT, "migrations", f)),
]

/** A D1-shaped `env` over a real SQLite engine (same wrapper shape D1 exposes). */
function envOver(db) {
  const prepare = (sql) => {
    const stmt = db.prepare(sql)
    const wrap = (bound) => ({
      first: async () => (bound === undefined ? stmt.get() : stmt.get(...bound)) ?? null,
      all: async () => ({ results: bound === undefined ? stmt.all() : stmt.all(...bound) }),
      run: async () => { (bound === undefined ? stmt.run() : stmt.run(...bound)); return { success: true } },
    })
    return Object.assign(wrap(undefined), { bind: (...args) => wrap(args) })
  }
  return { DB: { prepare } }
}

/** Fresh in-memory database with the repo's real DDL applied, schema.sql first. */
function freshDb() {
  const db = new DatabaseSync(":memory:")
  for (const f of ddlFiles()) db.exec(readFileSync(f, "utf8"))
  return db
}

const shipped = await import(pathToFileURL(HANDLER).href)
const { onRequest, PROJECT_LIST_COLUMNS, PROJECT_WRITE_COLUMNS } = shipped

const get = (env) =>
  onRequest({ request: new Request("https://supercompute.io/api/projects"), env })

test("every column the handler reads or writes exists in the migration-declared schema", () => {
  const db = freshDb()
  const declared = new Set(db.prepare("PRAGMA table_info(projects)").all().map((r) => r.name))
  assert.ok(declared.size > 0, "projects table did not come from the repo DDL")

  for (const col of [...PROJECT_LIST_COLUMNS, ...PROJECT_WRITE_COLUMNS]) {
    assert.ok(
      declared.has(col),
      `handler uses projects.${col} but the DDL does not declare it — this is the exact shape of the 2026-09-15 CF 1101 outage (declared: ${[...declared].join(", ")})`,
    )
  }
})

test("schema.sql and migrations/0001 declare the same projects columns", () => {
  const colsOf = (file) => {
    const sql = readFileSync(file, "utf8").replace(/--[^\n]*/g, "")
    const m = sql.match(/CREATE TABLE (?:IF NOT EXISTS )?projects\s*\(([\s\S]*?)\n\);/)
    assert.ok(m, `${path.basename(file)}: no projects CREATE TABLE found`)
    return m[1]
      .split("\n")
      .map((l) => l.trim().replace(/,$/, ""))
      .filter((l) => l && !/^(PRIMARY KEY|UNIQUE|CHECK|FOREIGN)\b/i.test(l))
      .map((l) => l.split(/\s+/)[0])
  }
  assert.deepEqual(colsOf(path.join(ROOT, "migrations", "0001_admin_wallets_and_projects.sql")), colsOf(path.join(ROOT, "schema.sql")))
})

test("GET /api/projects returns 200 with a projects array over the real DDL", async () => {
  const db = freshDb()
  db.exec(`
    INSERT INTO projects (id, name, tagline, status, sort_order, featured, repo, coin) VALUES
      ('proj_newsdesk', 'NewsDesk', 'On-chain news and AI-powered content platform.', 'Live', 1, 0, 'newsdesk-cf', '$QUANTA'),
      ('proj_nodewaste', 'Nodewaste', 'SocialFi for Environmental Action.', 'active', 2, 1, 'https://github.com/supercompute/nodewaste', '');
  `)

  const res = await get(envOver(db))
  assert.equal(res.status, 200)
  const body = await res.json()
  assert.ok(Array.isArray(body.projects), "body.projects must be an array")
  assert.equal(body.projects.length, 2)
  // Ordered by sort_order ASC, so the live table's curated order is what the page gets.
  assert.deepEqual(body.projects.map((p) => p.name), ["NewsDesk", "Nodewaste"])
  assert.equal(body.projects[0].tagline, "On-chain news and AI-powered content platform.")
  assert.equal(body.projects[1].featured, 1)
  assert.ok("ticker" in body.projects[0] === false, "the dead ticker column must not be resurrected")
})

test("GET /api/projects answers 503 JSON — never an uncaught throw — when the table is absent", async () => {
  // This reproduces the deployed failure mode: the storage layer rejects the statement. The
  // pre-fix handler let that exception escape and Pages served a bodyless `error code: 1101`.
  const empty = new DatabaseSync(":memory:")
  const res = await get(envOver(empty))
  assert.equal(res.status, 503)
  const body = await res.json()
  assert.equal(body.code, "DB_UNAVAILABLE")
  assert.match(body.error, /unavailable/i)
})

test("GET /api/projects answers 503 JSON when the DB binding is missing", async () => {
  const res = await get({})
  assert.equal(res.status, 503)
  assert.equal((await res.json()).code, "DB_NOT_CONFIGURED")
})

test("the contract guard is load-bearing: the pre-fix column list fails it", async () => {
  const src = readFileSync(HANDLER, "utf8")
  // Swap the shipped column list for the list that caused the outage.
  const mutantSrc = src.replace(
    /export const PROJECT_LIST_COLUMNS = \[[\s\S]*?\n\]/,
    `export const PROJECT_LIST_COLUMNS = ${JSON.stringify(PREFIX_ON_BROKEN_COLUMNS, null, 2)}`,
  )
  assert.notEqual(mutantSrc, src, "the mutation could not apply — PROJECT_LIST_COLUMNS moved")
  // Out-of-tree mutants need absolute specifiers: this handler imports './auth.js'.
  const rewritten = mutantSrc.replace(
    /from '\.\/auth\.js'/,
    `from '${pathToFileURL(path.join(ROOT, "functions", "api", "auth.js")).href}'`,
  )

  const tmp = path.join(os.tmpdir(), `projects-mutant-${process.pid}.mjs`)
  writeFileSync(tmp, rewritten)
  try {
    const mutant = await import(pathToFileURL(tmp).href)
    const declared = new Set(freshDb().prepare("PRAGMA table_info(projects)").all().map((r) => r.name))
    const missing = mutant.PROJECT_LIST_COLUMNS.filter((c) => !declared.has(c))
    // The shipped handler passes this predicate; the mutant must not.
    assert.deepEqual(missing, ["ticker", "stack"])
    assert.deepEqual(PROJECT_LIST_COLUMNS.filter((c) => !declared.has(c)), [])
  } finally {
    unlinkSync(tmp)
  }
})
