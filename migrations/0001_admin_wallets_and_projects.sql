-- 0001_admin_wallets_and_projects.sql
-- Idempotent migration: safe to run against fresh or already-migrated D1.
--
-- `projects` here declares the LIVE production shape (verified against the remote D1 on
-- 2026-09-15: 21 columns, 14 rows, indexes idx_projects_status + idx_projects_featured).
-- The earlier revision of this file declared a `ticker`/`stack` shape that production never
-- had and that `functions/api/projects.js` selected from — D1 raised
-- `no such column: ticker`, the exception escaped the Function, and Pages served a bare
-- `error code: 1101` for GET /api/projects. `tests/projects/schema-contract.test.mjs` now
-- asserts the handler's column list against this DDL so the two cannot drift again.
--
-- `CREATE TABLE IF NOT EXISTS` makes this a no-op on production (the table exists) and
-- correct on a fresh database. A database created from the OLD revision of this file would
-- keep the stale `ticker`/`stack` shape; none is known to exist (this file was never wired
-- into the deploy lane before, which is how the drift survived). Recreate rather than
-- ALTER if one turns up.

CREATE TABLE IF NOT EXISTS admin_wallets (
  id TEXT PRIMARY KEY,
  wallet_address TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'admin',
  created_at INTEGER DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  tagline TEXT,
  repo TEXT DEFAULT '',
  coin TEXT DEFAULT '',
  status TEXT DEFAULT 'Coming Soon',
  sort_order INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  featured INTEGER DEFAULT 0,
  description TEXT,
  funding_goal_usd REAL DEFAULT 0,
  cover_image_url TEXT,
  website_url TEXT,
  github_url TEXT,
  twitter_url TEXT,
  chain TEXT,
  contract_address TEXT,
  creator_name TEXT,
  risks TEXT,
  milestones TEXT
);

CREATE INDEX IF NOT EXISTS idx_admin_wallets_address ON admin_wallets(wallet_address);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_featured ON projects(featured);
