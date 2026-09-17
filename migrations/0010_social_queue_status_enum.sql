-- 0010_social_queue_status_enum.sql
-- SEC-F2 (PR #62 review): make the social_queue.status enum a storage invariant, not a
-- convention the API happens to honour.
--
-- social_queue.status / results are the operator's audit trail ("what did we actually
-- publish, and when"). 0009 declared the vocabulary in a comment only, so any writer —
-- the handler, a future handler, `wrangler d1 execute`, the D1 console — could store
-- `posted` on an item that was never dispatched, or a typo like `dry-run`.
--
-- SQLite cannot `ALTER TABLE ... ADD CONSTRAINT`, and a table rebuild (DROP + rename) is
-- exactly the kind of non-additive migration 0009 deliberately avoided on prod. So the
-- enum is expressed as BEFORE INSERT / BEFORE UPDATE triggers — additive, and idempotent
-- via CREATE TRIGGER IF NOT EXISTS, so re-applying is a no-op.
--
-- This is a backstop, not the primary gate: POST /api/social/queue/update validates the
-- same vocabulary in the handler and answers 400 with the allowed list. The trigger only
-- fires on writes that bypassed the handler.
--
-- Apply: wrangler d1 execute supercompute-db --remote --file=./migrations/0010_social_queue_status_enum.sql
-- (idempotent — safe to re-run)

CREATE TRIGGER IF NOT EXISTS trg_social_queue_status_insert
BEFORE INSERT ON social_queue
WHEN NEW.status IS NULL
  OR NEW.status NOT IN ('draft', 'scheduled', 'posted', 'partial', 'failed', 'dry_run')
BEGIN
  SELECT RAISE(ABORT, 'social_queue.status must be one of draft|scheduled|posted|partial|failed|dry_run');
END;

CREATE TRIGGER IF NOT EXISTS trg_social_queue_status_update
BEFORE UPDATE OF status ON social_queue
WHEN NEW.status IS NULL
  OR NEW.status NOT IN ('draft', 'scheduled', 'posted', 'partial', 'failed', 'dry_run')
BEGIN
  SELECT RAISE(ABORT, 'social_queue.status must be one of draft|scheduled|posted|partial|failed|dry_run');
END;
