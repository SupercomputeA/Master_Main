-- schema.sql — D1 Database Schema for Supercompute

-- Users table
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  wallet_address TEXT UNIQUE NOT NULL,
  email TEXT,
  name TEXT,
  role TEXT DEFAULT 'user', -- user, admin
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch())
);

-- Articles table
CREATE TABLE articles (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT,
  category TEXT, -- intelligence, sovereignty, dispatch, signal
  author TEXT,
  icon TEXT,
  views INTEGER DEFAULT 0,
  status TEXT DEFAULT 'published', -- draft, review, published
  published_at INTEGER,
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch())
);

-- Staking positions
CREATE TABLE staking_positions (
  id TEXT PRIMARY KEY,
  wallet_address TEXT NOT NULL,
  staked_amount REAL DEFAULT 0,
  pending_rewards REAL DEFAULT 0,
  last_claim_at INTEGER,
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch())
);

-- Agent logs
CREATE TABLE agent_logs (
  id TEXT PRIMARY KEY,
  agent_id TEXT NOT NULL,
  message TEXT,
  status TEXT, -- active, idle, error
  created_at INTEGER DEFAULT (unixepoch())
);

-- Sessions (for auth)
CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  wallet_address TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  created_at INTEGER DEFAULT (unixepoch())
);

-- Indexes
CREATE INDEX idx_users_wallet ON users(wallet_address);
CREATE INDEX idx_articles_category ON articles(category);
CREATE INDEX idx_articles_published ON articles(published_at);
CREATE INDEX idx_staking_wallet ON staking_positions(wallet_address);
CREATE INDEX idx_agent_logs_agent ON agent_logs(agent_id);
CREATE INDEX idx_sessions_wallet ON sessions(wallet_address);

-- Admin wallets allowlist
CREATE TABLE admin_wallets (
  id TEXT PRIMARY KEY,
  wallet_address TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'admin',
  created_at INTEGER DEFAULT (unixepoch())
);

-- Projects
CREATE TABLE projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  ticker TEXT,
  stack TEXT,
  description TEXT,
  status TEXT DEFAULT 'active',
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch())
);

CREATE INDEX idx_admin_wallets_address ON admin_wallets(wallet_address);
CREATE INDEX idx_projects_status ON projects(status);

-- Subscribers (tier-based membership — funnel: /subscribe → /dashboard)
CREATE TABLE subscribers (
  id TEXT PRIMARY KEY,
  wallet_address TEXT UNIQUE,        -- nullable for email-only leads
  email TEXT UNIQUE,                 -- nullable for wallet-only subs
  tier TEXT NOT NULL DEFAULT 'free', -- free | builder | operator | syndicate | lead
  status TEXT NOT NULL DEFAULT 'pending', -- pending | active | expired | cancelled
  joined_at INTEGER DEFAULT (unixepoch()),
  expires_at INTEGER,                -- unix epoch seconds; null = no expiry (free)
  source TEXT DEFAULT 'web',         -- web | trade_desk | import
  tx_hash TEXT,                      -- optional on-chain payment receipt
  metadata TEXT,                     -- JSON: notes, referral, etc.
  updated_at INTEGER DEFAULT (unixepoch())
);

CREATE INDEX idx_subscribers_wallet ON subscribers(wallet_address);
CREATE INDEX idx_subscribers_email ON subscribers(email);
CREATE INDEX idx_subscribers_tier ON subscribers(tier);
CREATE INDEX idx_subscribers_status ON subscribers(status);
CREATE INDEX idx_subscribers_expires ON subscribers(expires_at);