-- 0001_admin_wallets_and_projects.sql
-- Idempotent migration: safe to run against fresh or already-migrated D1.

CREATE TABLE IF NOT EXISTS admin_wallets (
  id TEXT PRIMARY KEY,
  wallet_address TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'admin',
  created_at INTEGER DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  ticker TEXT,
  stack TEXT,
  description TEXT,
  status TEXT DEFAULT 'active',
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_admin_wallets_address ON admin_wallets(wallet_address);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
