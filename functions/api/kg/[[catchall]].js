// functions/api/kg/[[catchall]].js — Knowledge Graph API
// Cloudflare Pages Function (catch-all → /api/kg/*)
//
// Storage strategy:
//   1. D1 is the primary store. Tables created by migration 0007:
//        - kg_nodes  (id, graph, label, type, description, level, x, y, r, metadata)
//        - kg_edges  (source, target, label) keyed by graph
//   2. If D1 is unavailable (env.DB missing, or query throws), fall back
//      to the static JSON in /public/data/kg/{index,school,police,defi,articles}.json.
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
// part of the website's running infra.

const KG_DOMAINS = ['school', 'police', 'defi', 'articles']

const KG_META = {
  school:   { id: 'school',   label: 'Web3 School',             icon: '📚', description: 'School module prerequisite chains and credential paths on SUPERCOMPUTE' },
  police:   { id: 'police',   label: 'Police Data',             icon: '🚔', description: 'NYPD misconduct knowledge graph — officers, incidents, complaints' },
  defi:     { id: 'defi',     label: 'DeFi / ReFi',             icon: '🏦', description: 'DeFi protocols, tokens, agents, and their relationships on Base Chain' },
  articles: { id: 'articles', label: 'Knowledge Graph Articles', icon: '📄', description: 'Published KG articles — concepts, people, timeline, debate, comments' },
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

function corsPreflight() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}

// ─── D1 query helpers ──────────────────────────────────────────────────

function safeDb(env) {
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
    `SELECT id, graph, label, type, description, level, x, y, r, metadata
       FROM kg_nodes WHERE graph = ? ORDER BY id`
  ).bind(graphId).all()
  const edgesRes = await db.prepare(
    `SELECT source, target, label FROM kg_edges WHERE graph = ? ORDER BY id`
  ).bind(graphId).all()
  if (!nodesRes.results || nodesRes.results.length === 0) return null
  return {
    graph: graphId,
    nodes: nodesRes.results.map(n => ({ ...n, metadata: n.metadata || '{}' })),
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
// Pages Functions can fetch static assets from the same origin. In local
// dev the function may be invoked without a Pages origin; in that case the
// static fallback fails gracefully and the API returns an empty graph or
// 404 rather than a 5xx.

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
    return null
  }
}

async function staticListGraphs(request) {
  const data = await fetchStatic(request, '/data/kg/index.json')
  if (!data || !Array.isArray(data.graphs)) return null
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
  return {
    graph: graphId,
    nodes: data.nodes,
    edges: (data.edges || []).map(e => [e.source, e.target, e.label || '']),
    meta: { ...KG_META[graphId], description: data.description || KG_META[graphId]?.description },
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

  if (method === 'OPTIONS') return corsPreflight()
  if (method !== 'GET') return badRequest('GET only')

  const db = safeDb(env)

  // GET /api/kg — list graphs
  if (subPath === '/' || subPath === '') {
    if (db) {
      try {
        const graphs = await d1ListGraphs(db)
        if (graphs.length > 0) return json({ graphs, source: 'd1' })
      } catch (e) {
        console.warn('[kg] D1 listGraphs failed, falling back to static:', e?.message || e)
      }
    }
    const graphs = await staticListGraphs(request)
    if (graphs) return json({ graphs, source: 'static' })
    return json({ graphs: [], source: null })
  }

  // GET /api/kg/graph?graph=<id>
  if (subPath === '/graph') {
    const graphId = url.searchParams.get('graph') || 'school'
    if (!KG_DOMAINS.includes(graphId)) return notFound(`Unknown graph '${graphId}'`)

    if (db) {
      try {
        const graph = await d1GetGraph(db, graphId)
        if (graph) return json({ graph, source: 'd1' })
      } catch (e) {
        console.warn('[kg] D1 getGraph failed, falling back to static:', e?.message || e)
      }
    }

    const graph = await staticGetGraph(request, graphId)
    if (graph) return json({ graph, source: 'static' })
    return notFound(`Graph '${graphId}' unavailable`)
  }

  // GET /api/kg/search?graph=<id>&q=<term>
  if (subPath === '/search') {
    const graphId = url.searchParams.get('graph') || 'school'
    const q = url.searchParams.get('q') || ''
    if (!KG_DOMAINS.includes(graphId)) return notFound(`Unknown graph '${graphId}'`)
    if (!q.trim()) return badRequest('q required')

    if (db) {
      try {
        const results = await d1Search(db, graphId, q.trim())
        return json({ results, total: results.length, source: 'd1' })
      } catch (e) {
        console.warn('[kg] D1 search failed, falling back to static:', e?.message || e)
      }
    }

    const graph = await staticGetGraph(request, graphId)
    if (graph) {
      const results = staticSearchLocal(graph, q.trim())
      return json({ results, total: results.length, source: 'static' })
    }
    return json({ results: [], total: 0, source: null })
  }

  return notFound('Not found. Try GET /api/kg')
}
