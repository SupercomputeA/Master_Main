// functions/api/kg/[[catchall]].js — Knowledge Graph API
// Cloudflare Pages Functions catch-all — handles /api/kg, /api/kg/graph, etc.
// Connects to Memgraph when MEMGRAPH_HTTP_URL is set, falls back to demo data

const DEMO_POLICING_GRAPH = {
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
    ["Officer-A", "Incident-1"], ["Officer-A", "Incident-2"], ["Officer-B", "Incident-2"],
    ["Officer-C", "Incident-1"], ["Incident-1", "Misconduct-1"], ["Incident-2", "Misconduct-2"],
    ["Misconduct-1", "Complaint-1"], ["Officer-A", "Dept-1"], ["Officer-B", "Dept-1"], ["Officer-C", "Dept-1"],
  ],
}

const SUPERCOMPUTE_GRAPH = {
  nodes: [
    { id: "SC", label: "SUPERCOMPUTE", type: "org", x: 0.5, y: 0.5, r: 0.08 },
    { id: "QUANTA", label: "Quanta S", type: "agent", x: 0.3, y: 0.3, r: 0.06 },
    { id: "KNIGHT", label: "KNIGHT", type: "agent", x: 0.7, y: 0.3, r: 0.06 },
    { id: "HERMES", label: "Hermes", type: "agent", x: 0.5, y: 0.15, r: 0.06 },
    { id: "NewsDesk", label: "NewsDesk", type: "product", x: 0.2, y: 0.6, r: 0.05 },
    { id: "TradeDesk", label: "TradeDesk", type: "product", x: 0.8, y: 0.6, r: 0.05 },
    { id: "Web3School", label: "Web3 School", type: "product", x: 0.5, y: 0.8, r: 0.05 },
    { id: "SCOM", label: "$SCOM", type: "token", x: 0.35, y: 0.7, r: 0.05 },
    { id: "QUANTA-tok", label: "$QUANTA", type: "token", x: 0.65, y: 0.7, r: 0.05 },
    { id: "Base", label: "Base Chain", type: "chain", x: 0.5, y: 0.9, r: 0.05 },
  ],
  edges: [
    ["SC", "QUANTA"], ["SC", "KNIGHT"], ["SC", "HERMES"],
    ["QUANTA", "NewsDesk"], ["QUANTA", "QUANTA-tok"],
    ["KNIGHT", "TradeDesk"], ["SC", "SCOM"],
    ["NewsDesk", "Base"], ["TradeDesk", "Base"],
    ["Web3School", "Base"], ["SC", "Web3School"],
    ["SCOM", "Base"],
  ],
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
  })
}

async function queryMemgraph(cypher, memgraphUrl) {
  if (!memgraphUrl) return null
  try {
    const response = await fetch(`${memgraphUrl}/db/data/cypher`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ query: cypher }),
    })
    if (!response.ok) return null
    const data = await response.json()
    return data.results || data
  } catch { return null }
}

function memgraphToGraph(results) {
  if (!results || !results.length) return null
  const nodes = [], edges = [], seen = new Set()
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

export async function onRequest(context) {
  const { request, env } = context
  const url = new URL(request.url)
  const method = request.method
  const route = url.pathname.replace("/api/kg", "") || "/"
  const memgraphUrl = env.MEMGRAPH_HTTP_URL || null
  const domain = url.searchParams.get("domain") || "supercompute"

  // GET /api/kg
  if (method === "GET" && route === "/") {
    return json({
      endpoints: {
        "GET /api/kg/graph?domain=supercompute|policing": "Get full knowledge graph",
        "GET /api/kg/stats?domain=supercompute|policing": "Get node/edge counts",
        "POST /api/kg/query": "Run Cypher query (Memgraph MCP)",
        "GET /api/kg/search?q=term&domain=supercompute|policing": "Search nodes",
      },
    })
  }

  // GET /api/kg/graph — frontend expects: { graph: { nodes, edges }, mcp: bool }
  if (method === "GET" && route === "/graph") {
    if (domain === "supercompute") {
      return json({ graph: SUPERCOMPUTE_GRAPH, domain, mcp: false })
    }
    if (memgraphUrl) {
      try {
        // Query all nodes
        const nodeRes = await fetch(`${memgraphUrl}/db/data/cypher`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: "MATCH (n) RETURN n" }),
        })
        const nodeData = await nodeRes.json()
        // Query all relationships
        const edgeRes = await fetch(`${memgraphUrl}/db/data/cypher`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: "MATCH (n)-[r]->(m) RETURN r, n, m" }),
        })
        const edgeData = await edgeRes.json()

        if (nodeData?.results && edgeData?.results) {
          const seen = new Set()
          const nodes = []
          for (const row of nodeData.results) {
            const n = row.n
            if (n && n.id && !seen.has(n.id)) {
              seen.add(n.id)
              nodes.push({
                id: n.id,
                label: n.name || n.properties?.name || n.type,
                type: (n.type || "").toLowerCase(),
                description: n.properties?.description || "",
                properties: n.properties || {},
              })
            }
          }
          const edges = []
          for (const row of edgeData.results) {
            const r = row.r
            if (r) {
              edges.push([r.properties?.from || r.start?.toString() || "", r.properties?.to || r.end?.toString() || "", r.type || ""])
            }
            // Also extract nodes from relationships that aren't in the node list
            for (const key of ["n", "m"]) {
              const relNode = row[key]
              if (relNode && relNode.id && !seen.has(relNode.id)) {
                seen.add(relNode.id)
                nodes.push({
                  id: relNode.id,
                  label: relNode.name || relNode.properties?.name || relNode.type || "node",
                  type: (relNode.type || "").toLowerCase(),
                  description: relNode.properties?.description || "",
                  properties: relNode.properties || {},
                })
              }
            }
          }
          return json({ graph: { nodes, edges }, domain, mcp: true })
        }
      } catch (e) {
        // Fall through to demo
      }
    }
    return json({ graph: DEMO_POLICING_GRAPH, domain, mcp: false })
  }

  // GET /api/kg/stats
  if (method === "GET" && route === "/stats") {
    const g = domain === "supercompute" ? SUPERCOMPUTE_GRAPH : DEMO_POLICING_GRAPH
    const nodeTypes = {}
    g.nodes.forEach(n => { nodeTypes[n.type] = (nodeTypes[n.type] || 0) + 1 })
    return json({
      stats: [
        { label: "Nodes", value: g.nodes.length },
        { label: "Edges", value: g.edges.length },
        ...Object.entries(nodeTypes).map(([type, count]) => ({ label: type.toUpperCase() + "s", value: count })),
      ],
      domain,
    })
  }

  // POST /api/kg/query
  if (method === "POST" && route === "/query") {
    const body = await request.json().catch(() => ({}))
    const { cypher } = body
    if (!cypher) return json({ error: "cypher query required" }, 400)
    if (memgraphUrl) {
      const results = await queryMemgraph(cypher, memgraphUrl)
      if (results) return json({ graph: memgraphToGraph(results) || results, cypher, mcp: true })
    }
    const g = domain === "supercompute" ? SUPERCOMPUTE_GRAPH : DEMO_POLICING_GRAPH
    return json({ graph: { nodes: g.nodes, edges: g.edges }, cypher, mcp: false })
  }

  // GET /api/kg/search
  if (method === "GET" && route === "/search") {
    const q = url.searchParams.get("q") || ""
    const g = domain === "supercompute" ? SUPERCOMPUTE_GRAPH : DEMO_POLICING_GRAPH
    const matches = g.nodes.filter(n =>
      n.label.toLowerCase().includes(q.toLowerCase()) || n.type.toLowerCase().includes(q.toLowerCase())
    )
    return json({ results: matches, query: q })
  }

  return json({ error: "Not found" }, 404)
}