-- 0007_kg_nodes_and_edges.sql
-- Knowledge Graph storage on D1 (replaces the prior in-memory SEED_DATA
-- inside functions/api/kg/[[catchall]].js).
--
-- P0 task: `/knowledge-graph` shows "// loading graph…". The API catch-all
-- was returning a hardcoded 9-node demo per domain. This migration adds
-- the relational shape (kg_nodes + kg_edges) backed by D1 so the three
-- graphs (school, police, defi) can be queried, joined, and searched
-- against the same store that holds articles/projects/sessions.
--
-- Domain count target (per CLAUDE.md P0.3): > 9 entities per domain.
-- Seed script (scripts/seed-kg-data.mjs) loads 18 nodes / 22–25 edges per
-- domain. Schema permits arbitrarily more.
--
-- Idempotency: every CREATE uses IF NOT EXISTS. The seed script uses
-- INSERT OR IGNORE (id is PRIMARY KEY) so re-running it is a no-op.

CREATE TABLE IF NOT EXISTS kg_nodes (
  id TEXT PRIMARY KEY,
  graph TEXT NOT NULL,           -- 'school' | 'police' | 'defi'
  label TEXT NOT NULL,
  type TEXT NOT NULL,            -- 'module' | 'officer' | 'protocol' | 'token' | 'agent' | ...
  description TEXT DEFAULT '',
  level TEXT,                    -- 'beginner' | 'intermediate' | 'advanced' (school only)
  x REAL DEFAULT 0.5,            -- canvas position (0..1 normalized)
  y REAL DEFAULT 0.5,
  r REAL DEFAULT 0.05,           -- display radius hint
  metadata TEXT DEFAULT '{}',    -- JSON blob for graph-specific extras
  created_at INTEGER DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS kg_edges (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  graph TEXT NOT NULL,
  source TEXT NOT NULL,          -- kg_nodes.id
  target TEXT NOT NULL,
  label TEXT DEFAULT '',         -- 'prerequisite' | 'involved' | 'deployed_on' | ...
  created_at INTEGER DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_kg_nodes_graph ON kg_nodes(graph);
CREATE INDEX IF NOT EXISTS idx_kg_nodes_graph_type ON kg_nodes(graph, type);
CREATE INDEX IF NOT EXISTS idx_kg_nodes_label ON kg_nodes(graph, label);
CREATE INDEX IF NOT EXISTS idx_kg_edges_graph ON kg_edges(graph);
CREATE INDEX IF NOT EXISTS idx_kg_edges_source ON kg_edges(source);
CREATE INDEX IF NOT EXISTS idx_kg_edges_target ON kg_edges(target);
