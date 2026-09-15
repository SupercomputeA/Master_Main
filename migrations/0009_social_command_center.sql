-- 0009_social_command_center.sql
-- Social media command center: platform registry + publish queue.
-- Apply: wrangler d1 execute supercompute-db --remote --file=./migrations/0009_social_command_center.sql
-- (idempotent — safe to re-run)

CREATE TABLE IF NOT EXISTS social_accounts (
  id           TEXT PRIMARY KEY,          -- platform slug: farcaster | bluesky | x | tiktok | substack | lens | nostr | youtube
  platform     TEXT NOT NULL,
  tier         TEXT NOT NULL DEFAULT 'web2',   -- 'protocol' | 'web2'
  handle       TEXT,                      -- account handle on that rail ('' = not claimed yet)
  adapter      TEXT NOT NULL DEFAULT 'stub',   -- farcaster | bluesky | x | manual | stub
  status       TEXT NOT NULL DEFAULT 'needs_key', -- connected | needs_key | manual | unsupported
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

-- Platform registry seed — rail-ordered (protocol first, mirrors second).
INSERT OR IGNORE INTO social_accounts (id, platform, tier, handle, adapter, status, notes) VALUES
  ('farcaster', 'Warpcast / Farcaster', 'protocol', 'supercompute', 'farcaster', 'needs_key', 'Read: NEYNAR_API_KEY + NEXT_PUBLIC_FARCASTER_FID. Write: NEYNAR_SIGNER_UUID.'),
  ('lens',      'Lens',                 'protocol', '',            'stub',      'needs_key', 'Handle unclaimed. [PLACEHOLDER: lens handle]'),
  ('nostr',     'Nostr',                'protocol', '',            'stub',      'needs_key', 'Write requires NOSTR_NSEC. [PLACEHOLDER: npub]'),
  ('bluesky',   'Bluesky',              'protocol', '',            'bluesky',   'needs_key', 'BLUESKY_HANDLE + BLUESKY_APP_PASSWORD (app password, not the account password).'),
  ('x',         'X / Twitter',          'web2',     'supercompute_io', 'x',      'needs_key', 'X_ACCESS_TOKEN + X_ACCESS_SECRET (+ X_API_KEY/X_API_SECRET) for writes.'),
  ('tiktok',    'TikTok',               'web2',     '',            'stub',      'needs_key', 'TIKTOK_ACCESS_TOKEN. Video uploads are out of scope for v1 (status only).'),
  ('substack',  'Substack',             'web2',     '',            'manual',    'manual',    'No public write API — export/copy only, publish manually.'),
  ('youtube',   'YouTube',              'web2',     '',            'stub',      'needs_key', 'YOUTUBE_API_KEY (read) + OAuth for uploads. [PLACEHOLDER: channel]');
