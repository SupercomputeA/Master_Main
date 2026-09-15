-- Migration 0006 — add subscribers table for tier-based membership funnel
-- Idempotent: CREATE TABLE IF NOT EXISTS is safe to re-run.

CREATE TABLE IF NOT EXISTS subscribers (
  id TEXT PRIMARY KEY,
  wallet_address TEXT UNIQUE,
  email TEXT UNIQUE,
  tier TEXT NOT NULL DEFAULT 'free',
  status TEXT NOT NULL DEFAULT 'pending',
  joined_at INTEGER DEFAULT (unixepoch()),
  expires_at INTEGER,
  source TEXT DEFAULT 'web',
  tx_hash TEXT,
  metadata TEXT,
  updated_at INTEGER DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_subscribers_wallet ON subscribers(wallet_address);
CREATE INDEX IF NOT EXISTS idx_subscribers_email ON subscribers(email);
CREATE INDEX IF NOT EXISTS idx_subscribers_tier ON subscribers(tier);
CREATE INDEX IF NOT EXISTS idx_subscribers_status ON subscribers(status);
CREATE INDEX IF NOT EXISTS idx_subscribers_expires ON subscribers(expires_at);