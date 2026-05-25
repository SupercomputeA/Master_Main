// pages/api/kg.js - Knowledge Graph API proxy
// Routes requests to Memgraph or returns demo data

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

const MEMGRAPH_HTTP_URL = process.env.MEMGRAPH_HTTP_URL || null

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

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { cypher } = req.body
    if (!cypher) return res.status(400).json({ error: 'cypher query required' })

    if (MEMGRAPH_HTTP_URL) {
      const results = await queryMemgraph(cypher)
      if (results) {
        return res.json({ result: memgraphToGraph(results) || results, cypher, mcp: true })
      }
    }

    // Return demo data as fallback
    return res.json({ result: DEMO_GRAPH, cypher, mcp: false })
  }

  return res.json({
    endpoints: ['POST /api/kg/query'],
  })
}