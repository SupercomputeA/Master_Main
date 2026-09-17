-- 0008_csp_reports.sql
-- CSP violation telemetry (card t_38a77267, follow-up to the strict CSP in #59).
--
-- Idempotent: safe to re-run against an already-migrated database.
--
-- One row per (UTC day, violated directive, blocked origin, document path,
-- disposition) with a hit counter -- the signal is a count, not a firehose.
-- Written by functions/api/csp-report.js; read with scripts/csp-report-stats.sh.
--
-- Privacy invariant: blocked/document URLs are stored with the query string and
-- fragment REMOVED (they can carry session tokens) and are length-capped.

CREATE TABLE IF NOT EXISTS csp_reports (
  -- day|directive|blocked_origin|document_path|disposition  (rollup identity)
  bucket_key          TEXT PRIMARY KEY,
  day                 TEXT    NOT NULL,          -- UTC YYYY-MM-DD
  violated_directive  TEXT    NOT NULL,          -- e.g. script-src, connect-src, img-src
  blocked_origin      TEXT    NOT NULL,          -- scheme://host[:port] ONLY (group key)
  blocked_path        TEXT,                      -- origin + path, no query/fragment, <=200 chars
  document_path       TEXT    NOT NULL,          -- path of the reporting document
  disposition         TEXT,                      -- enforce | report
  source              TEXT,                      -- report-uri | reports+json | unknown
  hits                INTEGER NOT NULL DEFAULT 1,
  first_seen          INTEGER NOT NULL,          -- unix seconds
  last_seen           INTEGER NOT NULL           -- unix seconds
);

CREATE INDEX IF NOT EXISTS idx_csp_reports_day       ON csp_reports(day);
CREATE INDEX IF NOT EXISTS idx_csp_reports_directive ON csp_reports(violated_directive);
CREATE INDEX IF NOT EXISTS idx_csp_reports_last_seen ON csp_reports(last_seen);
