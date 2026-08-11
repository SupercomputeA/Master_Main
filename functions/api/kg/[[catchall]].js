// functions/api/kg/[[catchall]].js — Knowledge Graph API
// Cloudflare Pages Function (catch-all → /api/kg/*)
//
// Storage strategy (P0 resolution, 2026-08-07):
//   1. D1 is the primary store. Tables created by migration 0007:
//        - kg_nodes  (id, graph, label, type, description, level, x, y, r)
//        - kg_edges  (source, target, label) keyed by graph
//   2. If D1 is unavailable (env.DB missing, or query throws), fall back
//      to the static JSON in /public/data/kg/{index,school,police,defi}.json.
//      That JSON is the same data the seed script writes into D1, so the
//      fallback returns identical shapes.
//
// Routes:
//   GET /api/kg                       → list graphs (id, label, icon, counts)
//   GET /api/kg/graph?graph=<id>      → full graph (nodes + edges) for <id>
//   GET /api/kg/search?graph=<id>&q=  → search nodes for ?q
//
// Memgraph (legacy): the previous implementation tried Memgraph first via
// env.MEMGRAPH_HTTP_URL. We've retired that path — Memgraph is no longer
// part of the website's running infra. The hook stays in the code but is
// bypassed unless explicitly re-enabled.

const KG_DOMAINS = ['school', 'police', 'defi']

const KG_META = {
  school: { id: 'school', label: 'Web3 School', icon: '📚', description: 'School module prerequisite chains and credential paths on SUPERCOMPUTE' },
  police: { id: 'police', label: 'Police Data', icon: '🚔', description: 'NYPD misconduct knowledge graph — officers, incidents, complaints' },
  defi:   { id: 'defi',   label: 'DeFi / ReFi',  icon: '🏦', description: 'DeFi protocols, tokens, agents, and their relationships on Base Chain' },
}

function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=60',
      ...extraHeaders,
    },
  })
}

function notFound(msg = 'Not found') {
  return json({ error: msg }, 404)
}

function badRequest(msg) {
  return json({ error: msg }, 400)
}

// ─── D1 query helpers ──────────────────────────────────────────────────

async function safeDb(env) {
  return env && env.DB ? env.DB : null
}

async function d1ListGraphs(db) {
  const { results } = await db.prepare(
    `SELECT graph, COUNT(*) AS n, (SELECT COUNT(*) FROM kg_edges e WHERE e.graph = n.graph) AS e
       FROM kg_nodes n GROUP BY graph ORDER BY graph`
  ).all()
  return results.map(row => ({
    ...KG_META[row.graph],
    id: row.graph,
    nodeCount: row.n,
    edgeCount: row.e,
  })).filter(g => g.id)
}

async function d1GetGraph(db, graphId) {
  const nodesRes = await db.prepare(
    `SELECT id, graph, label, type, description, level, x, y, r
       FROM kg_nodes WHERE graph = ? ORDER BY id`
  ).bind(graphId).all()
  const edgesRes = await db.prepare(
    `SELECT source, target, label FROM kg_edges WHERE graph = ? ORDER BY id`
  ).bind(graphId).all()
  if (!nodesRes.results || nodesRes.results.length === 0) return null
  return {
    graph: graphId,
    nodes: nodesRes.results,
    edges: edgesRes.results.map(e => [e.source, e.target, e.label || '']),
    meta: KG_META[graphId],
  }
}

async function d1Search(db, graphId, q) {
  const like = `%${q.toLowerCase()}%`
  const { results } = await db.prepare(
    `SELECT id, graph, label, type, description, level, x, y, r
       FROM kg_nodes
      WHERE graph = ?
        AND (LOWER(label) LIKE ?
          OR LOWER(type) LIKE ?
          OR LOWER(COALESCE(description, '')) LIKE ?)
      ORDER BY label
      LIMIT 100`
  ).bind(graphId, like, like, like).all()
  return results
}

// ─── Static fallback fetchers ──────────────────────────────────────────
//
// We avoid `import` for /public assets because Pages Functions running in
// the Pages runtime can serve them via fetch(origin). In production the
// function and static assets are served by the same Pages project so the
// URL is relative.

function staticBase(request) {
  const u = new URL(request.url)
  return `${u.protocol}//${u.host}`
}

async function fetchStatic(request, relPath) {
  const base = staticBase(request)
  try {
    const res = await fetch(`${base}${relPath}`)
    if (!res.ok) return null
    return await res.json()
  } catch {
    // Network/DNS issues (e.g. local dev without a Pages origin) are
    // treated as "no fallback available" rather than a hard 5xx — D1 is
    // the primary store; static JSON is a graceful degradation only.
    return null
  }
}

async function staticListGraphs(request) {
  const data = await fetchStatic(request, '/data/kg/index.json')
  if (!data || !Array.isArray(data.graphs)) return null
  // Enrich with counts from per-graph JSON (best-effort).
  const out = []
  for (const meta of data.graphs) {
    const g = await fetchStatic(request, `/data/kg/${meta.id}.json`)
    if (!g) {
      out.push({ ...meta, nodeCount: 0, edgeCount: 0 })
      continue
    }
    out.push({
      ...meta,
      nodeCount: Array.isArray(g.nodes) ? g.nodes.length : 0,
      edgeCount: Array.isArray(g.edges) ? g.edges.length : 0,
    })
  }
  return out
}

async function staticGetGraph(request, graphId) {
  const data = await fetchStatic(request, `/data/kg/${graphId}.json`)
  if (!data || !Array.isArray(data.nodes)) return null
  // The static file stores edges as {source, target, label}; emit the
  // tuple shape that the front-end renders so D1 and static agree.
  return {
    graph: graphId,
    nodes: data.nodes,
    edges: (data.edges || []).map(e => [e.source, e.target, e.label || '']),
    meta: { ...KG_META[graphId], description: data.description || KG_META[graphId].description },
  }
}

function staticSearchLocal(graph, q) {
  if (!graph) return []
  const lq = q.toLowerCase()
  return (graph.nodes || []).filter(n =>
    (n.label || '').toLowerCase().includes(lq) ||
    (n.type || '').toLowerCase().includes(lq) ||
    (n.description || '').toLowerCase().includes(lq)
  )
}

// ─── Main handler ──────────────────────────────────────────────────────

export async function onRequest({ request, env }) {
  const url = new URL(request.url)
  const method = request.method
  const subPath = url.pathname.replace(/^\/api\/kg/, '') || '/'

  // CORS pre-flight.
  if (method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    })
  }

  if (method !== 'GET') return badRequest('GET only')

  // GET /api/kg — list graphs
  if (subPath === '/' || subPath === '') {
    const db = await safeDb(env)
    if (db) {
      try {
        const graphs = await d1ListGraphs(db)
        if (graphs.length > 0) return json({ graphs, source: 'd1' })
      } catch (e) {
        console.warn('[kg] D1 listGraphs failed, falling back to static:', e?.message || e)
      }
    }
    const graphs = await staticListGraphs(request)
    if (!graphs) return notFound('Could not list graphs')
    return json({ graphs, source: 'static' })
  }

  // GET /api/kg/graph
  if (subPath === '/graph') {
    const graphId = (url.searchParams.get('graph') || '').toLowerCase()
    if (!KG_DOMAINS.includes(graphId)) return notFound(`Graph '${graphId}' not found. Available: ${KG_DOMAINS.join(', ')}`)

    const db = await safeDb(env)
    if (db) {
      try {
        const data = await d1GetGraph(db, graphId)
        if (data && data.nodes && data.nodes.length > 0) return json({ graph: data, source: 'd1' })
      } catch (e) {
        console.warn(`[kg] D1 getGraph(${graphId}) failed, falling back to static:`, e?.message || e)
      }
    }
    const data = await staticGetGraph(request, graphId)
    if (!data) return notFound(`Graph '${graphId}' not found`)
    return json({ graph: data, source: 'static' })
  }

  // GET /api/kg/search
  if (subPath === '/search') {
    const graphId = (url.searchParams.get('graph') || '').toLowerCase()
    const q = (url.searchParams.get('q') || '').trim()
    if (!q) return badRequest('q required')
    if (!KG_DOMAINS.includes(graphId)) return notFound(`Graph '${graphId}' not found`)

    const db = await safeDb(env)
    if (db) {
      try {
        const results = await d1Search(db, graphId, q)
        return json({ results, total: results.length, graph: graphId, q, source: 'd1' })
      } catch (e) {
        console.warn(`[kg] D1 search(${graphId}) failed, falling back to static:`, e?.message || e)
      }
    }
    const data = await staticGetGraph(request, graphId)
    const results = staticSearchLocal(data, q)
    return json({ results, total: results.length, graph: graphId, q, source: 'static' })
  }

  return notFound('Try GET /api/kg, /api/kg/graph?graph=school, or /api/kg/search?graph=school&q=foo')
}
