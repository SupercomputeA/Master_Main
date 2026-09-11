-- 0002_social_command_center.sql
-- Social media command center: platform registry + publish queue.
-- Apply: npx wrangler d1 execute supercompute-db --remote --file=./migrations/0002_social_command_center.sql
-- (idempotent — safe to re-run)

CREATE TABLE IF NOT EXISTS social_accounts (
  id           TEXT PRIMARY KEY,          -- platform slug: farcaster | bluesky | x | tiktok | substack | lens | nostr | youtube
  platform     TEXT NOT NULL,
  tier         TEXT NOT NULL DEFAULT 'web2',   -- 'protocol' | 'web2'
  handle       TEXT,                      -- account handle on that rail ('' = not claimed yet)
  adapter      TEXT NOT NULL DEFAULT 'stub',   -- farcaster | bluesky | x | manual | stub
  status       TEXT NOT NULL DEFAULT 'needs_key', -- baseline only; live status is computed from env at read time
  last_post_at INTEGER,
  notes        TEXT,
  updated_at   INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS social_queue (
  id           TEXT PRIMARY KEY,
  body         TEXT NOT NULL,
  platforms    TEXT NOT NULL,             -- JSON array of platform slugs
  status       TEXT NOT NULL DEFAULT 'draft', -- draft | scheduled | posted | partial | failed | dry_run
  scheduled_at INTEGER,                   -- unix seconds; NULL = hold as draft
  posted_at    INTEGER,
  results      TEXT,                      -- JSON: [{platform, ok, mode, detail}]
  created_by   TEXT,                      -- admin wallet
  created_at   INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at   INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_social_queue_status ON social_queue(status, scheduled_at);
CREATE INDEX IF NOT EXISTS idx_social_accounts_tier ON social_accounts(tier, id);

-- Platform registry seed — rail-ordered (protocol first, mirrors second).
INSERT OR IGNORE INTO social_accounts (id, platform, tier, handle, adapter, status, notes) VALUES
  ('farcaster', 'Warpcast / Farcaster', 'protocol', 'supercompute',   'farcaster', 'needs_key', 'Read: NEYNAR_API_KEY + NEXT_PUBLIC_FARCASTER_FID. Write: NEYNAR_SIGNER_UUID.'),
  ('lens',      'Lens',                 'protocol', '',               'stub',      'needs_key', 'Handle unclaimed. [PLACEHOLDER: lens handle]. LENS_API_KEY enables read-only.'),
  ('nostr',     'Nostr',                'protocol', '',               'stub',      'needs_key', 'Write requires NOSTR_NSEC. [PLACEHOLDER: npub]'),
  ('bluesky',   'Bluesky',              'protocol', 'supercompute.bsky.social', 'bluesky', 'needs_key', 'BLUESKY_HANDLE + BLUESKY_APP_PASSWORD (app password, not the account password).'),
  ('x',         'X / Twitter',          'web2',     'supercompute_io', 'x',        'needs_key', 'X_API_KEY/X_API_SECRET/X_ACCESS_TOKEN/X_ACCESS_SECRET — OAuth 1.0a user context against POST /2/tweets.'),
  ('tiktok',    'TikTok',               'web2',     '',               'stub',      'needs_key', 'TIKTOK_ACCESS_TOKEN. Video uploads are out of scope for v1 (status only). [PLACEHOLDER: tiktok handle]'),
  ('substack',  'Substack',             'web2',     '',               'manual',    'manual',    'No public write API — export/copy only, publish manually. [PLACEHOLDER: substack domain]'),
  ('youtube',   'YouTube',              'web2',     '',               'stub',      'needs_key', 'YOUTUBE_API_KEY (read) + OAuth for uploads. [PLACEHOLDER: channel]');
