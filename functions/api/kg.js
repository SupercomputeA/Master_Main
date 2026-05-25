// functions/api/kg.js — Knowledge Graph API
// Connects to Memgraph via HTTP (port 7444) when MEMGRAPH_HTTP_URL is set
// Falls back to demo data when Memgraph is unavailable

const MEMGRAPH_HTTP_URL = (typeof env !== 'undefined' && env.MEMGRAPH_HTTP_URL)
  ? env.MEMGRAPH_HTTP_URL
  : (typeof process !== 'undefined' && process.env.MEMGRAPH_HTTP_URL)
    ? process.env.MEMGRAPH_HTTP_URL
    : null; // Set to "http://localhost:7444" for local dev

// Demo graph data (matches the police accountability demo)
const DEMO_GRAPH = {
  nodes: [
    { id: "Officer-A", label: "Officer A", type: "officer", x: 0.3, y: 0.3, r: 0.06 },
    { id: "Officer-B", label: "Officer B", type: "officer", x: 0.7, y: 0.3, r: 0.06 },
    { id: "Officer-C", label: "Officer C", type: "officer", x: 0.5, y: 0.7, r: 0.06 },
    { id: "Incident-1", label: "Stop 2023", type: "incident", x: 0.2, y: 0.5, r: 0.05 },
    { id: "Incident-2", label: "Force 2022", type: "incident", x: 0.8, y: 0.5, r: 0.05 },
    { id: "Misconduct-1", label: "Complaint", type: "misconduct", x: 0.15, y: 0.7, r: 0.05 },
    { id: "Misconduct-2", label: "Allegation", type: "misconduct", x: 0.85, y: 0.7, r: 0.05 },
    { id: "Dept-1", label: "Department", type: "department", x: 0.5, y: 0.15, r: 0.07 },
    { id: "Complaint-1", label: "CCRB Case", type: "complaint", x: 0.35, y: 0.85, r: 0.05 },
  ],
  edges: [
    ["Officer-A", "Incident-1"],
    ["Officer-A", "Incident-2"],
    ["Officer-B", "Incident-2"],
    ["Officer-C", "Incident-1"],
    ["Incident-1", "Misconduct-1"],
    ["Incident-2", "Misconduct-2"],
    ["Misconduct-1", "Complaint-1"],
    ["Officer-A", "Dept-1"],
    ["Officer-B", "Dept-1"],
    ["Officer-C", "Dept-1"],
  ],
}

// Supercompute domain graph (nodes relevant to our platform)
const SUPERCOMPUTE_GRAPH = {
  nodes: [
    { id: "Hermes", label: "HERMES", type: "agent", x: 0.5, y: 0.15, r: 0.06 },
    { id: "vQuanta", label: "vQuanta", type: "agent", x: 0.3, y: 0.35, r: 0.055 },
    { id: "Condor", label: "Condor", type: "agent", x: 0.7, y: 0.35, r: 0.055 },
    { id: "NewsDesk", label: "NewsDesk", type: "protocol", x: 0.15, y: 0.5, r: 0.05 },
    { id: "TradeDesk", label: "TradeDesk", type: "protocol", x: 0.85, y: 0.5, r: 0.05 },
    { id: "School", label: "School", type: "protocol", x: 0.5, y: 0.55, r: 0.05 },
    { id: "$SCOM", label: "$SCOM", type: "token", x: 0.25, y: 0.7, r: 0.05 },
    { id: "$QUANTA", label: "$QUANTA", type: "token", x: 0.75, y: 0.7, r: 0.05 },
    { id: "FeeRouter", label: "FeeRouter", type: "protocol", x: 0.5, y: 0.85, r: 0.05 },
    { id: "Supercompute", label: "Supercompute", type: "project", x: 0.5, y: 0.35, r: 0.06 },
  ],
  edges: [
    ["Hermes", "Supercompute"],
    ["vQuanta", "NewsDesk"],
    ["Condor", "TradeDesk"],
    ["NewsDesk", "Supercompute"],
    ["TradeDesk", "Supercompute"],
    ["School", "Supercompute"],
    ["$SCOM", "FeeRouter"],
    ["$QUANTA", "School"],
    ["FeeRouter", "$SCOM"],
    ["Supercompute", "$QUANTA"],
  ],
}

async function queryMemgraph(cypher) {
  if (!MEMGRAPH_HTTP_URL) return null
  try {
    const response = await fetch(`${MEMGRAPH_HTTP_URL}/db/data/cypher`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ query: cypher }),
    })
    if (!response.ok) return null
    const data = await response.json()
    return data.results || data
  } catch {
    return null
  }
}

function memgraphToGraph(results) {
  if (!results || !results.length) return null
  const nodes = []
  const edges = []
  const seen = new Set()
  results.forEach(row => {
    Object.values(row).forEach(val => {
      if (val && val.type && val.id) {
        const n = { id: val.id, label: val.properties?.name || val.id, type: val.type, x: Math.random(), y: Math.random(), r: 0.05 }
        if (!seen.has(n.id)) { nodes.push(n); seen.add(n.id) }
      }
    })
  })
  return { nodes, edges }
}

function json(data, status = 200, origin = "*") {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": origin },
  })
}

export async function onRequest({ request, env }) {
  const url = new URL(request.url)
  const path = url.pathname.replace("/api/kg", "") || "/"
  const method = request.method

  const reqOrigin = request.headers.get("Origin") || ""
  const allowedOrigin = (!reqOrigin || reqOrigin.includes("supercompute") || reqOrigin.includes("localhost"))
    ? reqOrigin : "*"
  const j = (data, status = 200) => json(data, status, allowedOrigin)

  // GET /api/kg/graph?domain=supercompute|policing
  if (method === "GET" && path === "/graph") {
    const domain = url.searchParams.get("domain") || "supercompute"
    let graph = domain === "policing" ? DEMO_GRAPH : SUPERCOMPUTE_GRAPH
    const mcpEnabled = !!MEMGRAPH_HTTP_URL

    if (domain === "policing" && MEMGRAPH_HTTP_URL) {
      const results = await queryMemgraph("MATCH (n) RETURN n, labels(n) LIMIT 100")
      if (results) {
        const mg = memgraphToGraph(results)
        if (mg && mg.nodes.length) graph = mg
      }
    }

    return j({ graph, domain, mcp: mcpEnabled })
  }

  // GET /api/kg/stats?domain=supercompute|policing
  if (method === "GET" && path === "/stats") {
    const domain = url.searchParams.get("domain") || "supercompute"
    let graph = domain === "policing" ? DEMO_GRAPH : SUPERCOMPUTE_GRAPH

    if (domain === "policing" && MEMGRAPH_HTTP_URL) {
      const results = await queryMemgraph("MATCH (n) RETURN count(n) as total")
      if (results && results[0]?.total !== undefined) {
        const count = results[0].total
        return j({ stats: [{ label: "Nodes", value: count }, { label: "Edges", value: "—" }], domain, mcp: true })
      }
    }

    const nodeTypes = {}
    graph.nodes.forEach(n => {
      nodeTypes[n.type] = (nodeTypes[n.type] || 0) + 1
    })
    const stats = [
      { label: "Nodes", value: graph.nodes.length },
      { label: "Edges", value: graph.edges.length },
      ...Object.entries(nodeTypes).map(([type, count]) => ({
        label: type.toUpperCase() + "s",
        value: count,
      })),
    ]
    return j({ stats, domain })
  }

  // POST /api/kg/query — run a Cypher query via Memgraph
  if (method === "POST" && path === "/query") {
    const body = await request.json().catch(() => ({}))
    const { cypher, domain } = body

    if (!cypher) return j({ error: "cypher query required" }, 400)

    if (MEMGRAPH_HTTP_URL) {
      const results = await queryMemgraph(cypher)
      if (results) {
        return j({ result: memgraphToGraph(results) || results, cypher, mcp: true })
      }
    }

    // Demo fallback
    let result = { nodes: DEMO_GRAPH.nodes, edges: DEMO_GRAPH.edges }
    return j({ result, cypher, mcp: false })
  }

  // GET /api/kg/search?q=term
  if (method === "GET" && path === "/search") {
    const q = url.searchParams.get("q") || ""
    const domain = url.searchParams.get("domain") || "supercompute"
    let graph = domain === "policing" ? DEMO_GRAPH : SUPERCOMPUTE_GRAPH

    if (domain === "policing" && MEMGRAPH_HTTP_URL) {
      const results = await queryMemgraph(`MATCH (n) WHERE n.name CONTAINS '${q}' OR n.badge CONTAINS '${q}' RETURN n, labels(n) LIMIT 20`)
      if (results) {
        const mg = memgraphToGraph(results)
        if (mg) return j({ results: mg.nodes, query: q })
      }
    }

    const matches = graph.nodes.filter(n =>
      n.label.toLowerCase().includes(q.toLowerCase()) ||
      n.type.toLowerCase().includes(q.toLowerCase())
    )
    return j({ results: matches, query: q })
  }

  return j({
    endpoints: {
      "GET /api/kg/graph?domain=supercompute|policing": "Get full knowledge graph",
      "GET /api/kg/stats?domain=supercompute|policing": "Get node/edge counts",
      "POST /api/kg/query": "Run Cypher query (Memgraph MCP)",
      "GET /api/kg/search?q=term&domain=supercompute|policing": "Search nodes",
    },
  })
}