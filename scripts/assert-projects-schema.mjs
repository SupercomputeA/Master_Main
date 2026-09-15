#!/usr/bin/env node
// scripts/assert-projects-schema.mjs
//
// LIVE-drift sentinel for the D1 `projects` table.
//
// Why this exists: on 2026-09-15 `GET https://supercompute.io/api/projects` had been answering
// 500 `error code: 1101` with no monitoring watching it. The repo's declared `projects` schema
// (schema.sql / migrations/0001) and the LIVE production table had drifted apart — the handler
// selected `ticker`/`stack`, production has `tagline`/`repo`/`coin`/... — and nothing in CI could
// see it, because a repo-side test can only compare the repo against itself.
//
// `tests/projects/schema-contract.test.mjs` pins code <-> repo DDL and runs in `validate`.
// This script pins repo <-> LIVE D1 and runs on a schedule. Together they close the loop.
//
// Read-only. Dependency-free (no `npm ci`) so an install failure cannot knock the sentinel out.
//
// Usage:
//   CLOUDFLARE_API_TOKEN=<d1-scoped token> CLOUDFLARE_ACCOUNT_ID=<account id> \
//     node scripts/assert-projects-schema.mjs

import { readFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const HANDLER = path.join(ROOT, "functions", "api", "projects.js")
const WRANGLER = path.join(ROOT, "wrangler.toml")

function die(msg) {
  console.error(`::error::${msg}`)
  process.exit(1)
}

const token = process.env.CLOUDFLARE_API_TOKEN
const account = process.env.CLOUDFLARE_ACCOUNT_ID
if (!token) die("CLOUDFLARE_API_TOKEN is not set — cannot assert the live projects schema (needs D1 read scope)")
if (!account) die("CLOUDFLARE_ACCOUNT_ID is not set — cannot assert the live projects schema")

// Column contract, read from the handler itself so the sentinel cannot rot into a second
// hardcoded list that agrees with nothing.
const src = readFileSync(HANDLER, "utf8")
const columnsOf = (name) => {
  const m = src.match(new RegExp(`export const ${name} = \\[([\\s\\S]*?)\\n\\]`))
  if (!m) die(`could not find ${name} in ${path.relative(ROOT, HANDLER)} — did the contract move?`)
  return m[1].split(",").map((s) => s.trim().replace(/^['"]|['"]$/g, "")).filter(Boolean)
}
const expected = [...new Set([...columnsOf("PROJECT_LIST_COLUMNS"), ...columnsOf("PROJECT_WRITE_COLUMNS")])]

// database_id from the tracked wrangler.toml, so a renamed/recreated DB cannot be silently
// probed by a stale id baked into this script.
const dbId = (readFileSync(WRANGLER, "utf8").match(/^database_id\s*=\s*"([^"]+)"/m) || [])[1]
if (!dbId) die("no database_id found in wrangler.toml")

const query = async (sql) => {
  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${account}/d1/database/${dbId}/query`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ sql }),
    },
  )
  const body = await res.json().catch(() => null)
  if (!res.ok || !body?.success) {
    const err = body?.errors ? JSON.stringify(body.errors) : `HTTP ${res.status}`
    die(`D1 query failed (${err}) — check the token's D1 scope and the account id`)
  }
  return body.result?.[0]?.results ?? []
}

const live = (await query("SELECT name FROM pragma_table_info('projects')")).map((r) => r.name)
if (!live.length) die("live D1 has no `projects` table — the endpoint will 503 until migrations/0001 lands")

const missing = expected.filter((c) => !live.includes(c))
if (missing.length) {
  die(
    `projects schema DRIFT: live D1 is missing ${missing.join(", ")} which ${path.relative(ROOT, HANDLER)} reads. ` +
    `GET /api/projects will answer 503 (DB_UNAVAILABLE). Live columns: ${live.join(", ")}`,
  )
}

const [{ n }] = await query("SELECT COUNT(*) AS n FROM projects")
console.log(`projects schema OK — ${live.length} live columns cover all ${expected.length} the handler uses; ${n} row(s).`)
