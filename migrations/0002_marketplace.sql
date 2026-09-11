-- migrations/0002_marketplace.sql
-- Marketplace listings surface — /marketplace + /sell + /project/[id]
-- Project owners (gated by wallet-match) list deliverables for sale in USDC-equivalent stable.
-- Buyers pay with EIP-3009 transferWithAuthorization. Royalty splits run via 0xSplits.

CREATE TABLE IF NOT EXISTS marketplace_listings (
  id TEXT PRIMARY KEY,
  owner_wallet TEXT NOT NULL,
  title TEXT NOT NULL,
  tagline TEXT,
  description TEXT NOT NULL,
  category TEXT,                 -- app, agent, data, course, design
  chain TEXT DEFAULT 'base',     -- 'base' or 'robinhood' — surfaced for filtering
  price_usdc TEXT NOT NULL,      -- store as string (BigInt-safe)
  price_stock_symbol TEXT,       -- optional stock-token symbol (TradeDesk)
  price_stock_amount TEXT,       -- optional stock-token amount
  split_address TEXT,            -- 0xSplits SplitMain address (env SPLIT_MAIN fallback)
  split_recipients TEXT,         -- JSON: [{ address, percentBps }, ...] — for display
  deliverable_url TEXT,          -- gated R2 URL or external link
  deliverable_kind TEXT,         -- 'file' | 'link' | 'memo'
  license TEXT,                  -- 'cc-by' | 'cc0' | 'commercial' | 'custom'
  license_text TEXT,             -- free-form when license = 'custom'
  status TEXT DEFAULT 'live',    -- 'live' | 'sold' | 'coming-soon' | 'removed'
  sold_to TEXT,
  sold_tx_hash TEXT,
  sold_at INTEGER,
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_marketplace_status   ON marketplace_listings(status);
CREATE INDEX IF NOT EXISTS idx_marketplace_owner    ON marketplace_listings(owner_wallet);
CREATE INDEX IF NOT EXISTS idx_marketplace_chain    ON marketplace_listings(chain);
CREATE INDEX IF NOT EXISTS idx_marketplace_category ON marketplace_listings(category);
CREATE INDEX IF NOT EXISTS idx_marketplace_created  ON marketplace_listings(created_at DESC);