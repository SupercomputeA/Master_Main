// tests/social/status-enum-migration.test.mjs — SEC-F2 storage-side guard.
//
// POST /api/social/queue/update validates the status enum in the handler, but the handler
// is not the only writer a D1 database ever gets: `wrangler d1 execute`, the dashboard
// console, and any future function all bypass it. migrations/0010 turns the enum into a
// storage invariant (BEFORE INSERT / BEFORE UPDATE triggers, since SQLite cannot ADD
// CONSTRAINT to an existing table), so the operator audit trail cannot be poisoned at the
// source. This test applies the real migration files to a real SQLite engine — the same
// engine D1 runs — and proves both halves: bad statuses abort, good ones land.
//
// Uses node:sqlite (bundled with Node 22.5+, stable enough for tests; CI pins Node 24).
//   node --test tests/social/status-enum-migration.test.mjs

import test from "node:test"
import assert from "node:assert/strict"
import { readFileSync, readdirSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { DatabaseSync } from "node:sqlite"

const HERE = path.dirname(fileURLToPath(import.meta.url))
const MIGRATIONS = path.resolve(HERE, "../../migrations")

const migrationFile = (prefix) => {
  const hit = readdirSync(MIGRATIONS).find((f) => f.startsWith(prefix))
  assert.ok(hit, `migrations/${prefix}* must exist`)
  return path.join(MIGRATIONS, hit)
}

const SCHEMA = readFileSync(migrationFile("0009_"), "utf8")
const ENUM_MIGRATION = readFileSync(migrationFile("0010_"), "utf8")
const ENUM = ["draft", "scheduled", "posted", "partial", "failed", "dry_run"]

function freshDb() {
  const db = new DatabaseSync(":memory:")
  db.exec(SCHEMA)
  db.exec(ENUM_MIGRATION)
  return db
}

const insert = (db, id, status) =>
  db.prepare("INSERT INTO social_queue (id, body, platforms, status) VALUES (?, ?, ?, ?)").run(id, "b", '["farcaster"]', status)

const statusOf = (db, id) => db.prepare("SELECT status FROM social_queue WHERE id = ?").get(id)?.status

test("0009 + 0010 apply cleanly and re-applying both is a no-op (idempotent)", () => {
  const db = freshDb()
  assert.doesNotThrow(() => { db.exec(SCHEMA); db.exec(ENUM_MIGRATION) })
  const triggers = db.prepare("SELECT name FROM sqlite_master WHERE type = 'trigger' ORDER BY name").all().map((r) => r.name)
  assert.deepEqual(triggers, ["trg_social_queue_status_insert", "trg_social_queue_status_update"])

  // 0009's seed is INSERT OR IGNORE, so the registry stays at 8 rows after a re-apply.
  const accounts = db.prepare("SELECT COUNT(*) AS n FROM social_accounts").get().n
  assert.equal(accounts, 8)
})

test("the migration is additive: no DROP, DELETE or ALTER TABLE in the executable SQL", () => {
  // Strip `--` comments first: the migration's own explanation cites the ALTER TABLE it
  // deliberately does not use, and prose must not trip the guard.
  const sql = ENUM_MIGRATION.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n").toUpperCase()
  for (const banned of ["DROP TABLE", "DROP TRIGGER", "DELETE FROM", "ALTER TABLE"]) {
    assert.equal(sql.includes(banned), false, `0010 must not use ${banned}`)
  }
})

test("INSERT of a status outside the enum aborts at the storage layer", () => {
  const db = freshDb()
  for (const bad of ["posted-evil", "dry-run", "PUBLISHED", ""]) {
    assert.throws(
      () => insert(db, `sq_bad_${bad}`, bad),
      /social_queue\.status must be one of/,
      `INSERT status='${bad}' must abort`
    )
  }
  assert.equal(db.prepare("SELECT COUNT(*) AS n FROM social_queue").get().n, 0, "no row survived a rejected insert")
})

test("UPDATE of status outside the enum aborts and leaves the stored value intact", () => {
  const db = freshDb()
  insert(db, "sq_1", "draft")

  assert.throws(
    () => db.prepare("UPDATE social_queue SET status = ? WHERE id = ?").run("pwned", "sq_1"),
    /social_queue\.status must be one of/
  )
  assert.equal(statusOf(db, "sq_1"), "draft", "the audit trail was not corrupted")
})

test("every enum member is accepted by INSERT and by UPDATE (the handler still controls it)", () => {
  const db = freshDb()
  ENUM.forEach((status, i) => {
    insert(db, `sq_ok_${i}`, status)
    assert.equal(statusOf(db, `sq_ok_${i}`), status)
  })
  // walk one row through the whole vocabulary, the way /publish does
  for (const status of ENUM) {
    db.prepare("UPDATE social_queue SET status = ? WHERE id = ?").run(status, "sq_ok_0")
    assert.equal(statusOf(db, "sq_ok_0"), status)
  }
})

test("the trigger only guards status — other columns update freely", () => {
  const db = freshDb()
  insert(db, "sq_2", "draft")
  db.prepare("UPDATE social_queue SET body = ?, updated_at = unixepoch() WHERE id = ?").run("edited", "sq_2")
  assert.equal(db.prepare("SELECT body FROM social_queue WHERE id = ?").get("sq_2").body, "edited")
  assert.equal(statusOf(db, "sq_2"), "draft")
})
