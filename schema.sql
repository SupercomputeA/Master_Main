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
  published_at INTEGER,
  created_at INTEGER DEFAULT (unixepoch())
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