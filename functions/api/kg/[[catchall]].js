// functions/api/kg/[[catchall]].js — Knowledge Graph API
// Cloudflare Pages Functions catch-all
// Supports multiple named graphs: school, police, defi
// Queries live Memgraph when MEMGRAPH_HTTP_URL is set, falls back to seed data

const SEED_DATA = {
  school: {
    nodes: [
      { id: 'sc-01', label: 'Sovereign Compute', type: 'module', graph: 'school', x: 0.2, y: 0.15, r: 0.06, description: 'Foundations of sovereign compute on Base Chain', level: 'beginner' },
      { id: 'ws-01', label: 'Wallet Security', type: 'module', graph: 'school', x: 0.35, y: 0.25, r: 0.06, description: 'Create and secure your first crypto wallet', level: 'beginner' },
      { id: 'df-01', label: 'DeFi Fundamentals', type: 'module', graph: 'school', x: 0.5, y: 0.35, r: 0.06, description: 'AMMs, lending pools, yield strategies', level: 'intermediate' },
      { id: 'tk-01', label: 'Token Economics', type: 'module', graph: 'school', x: 0.4, y: 0.5, r: 0.06, description: 'Token design, distribution, governance', level: 'intermediate' },
      { id: 'pg-01', label: 'Protocol Governance', type: 'module', graph: 'school', x: 0.6, y: 0.5, r: 0.06, description: 'DAO structures, proposal frameworks', level: 'advanced' },
      { id: 'lq-01', label: 'Liquidity Pools', type: 'module', graph: 'school', x: 0.7, y: 0.6, r: 0.06, description: 'LP mechanics, concentrated liquidity', level: 'advanced' },
      { id: 'rf-01', label: 'Refi & Regenerative Finance', type: 'module', graph: 'school', x: 0.3, y: 0.65, r: 0.06, description: 'Regenerative finance, impact measurement', level: 'advanced' },
      { id: 'cv-01', label: 'Community Building', type: 'module', graph: 'school', x: 0.6, y: 0.75, r: 0.06, description: 'Token-gated communities, DAO tooling', level: 'intermediate' },
      { id: 'as-01', label: 'Agent Systems', type: 'module', graph: 'school', x: 0.3, y: 0.8, r: 0.06, description: 'AI agent deployment, autonomous ops', level: 'advanced' },
    ],
    edges: [
      ['sc-01', 'ws-01'], ['ws-01', 'df-01'], ['df-01', 'tk-01'],
      ['df-01', 'pg-01'], ['df-01', 'lq-01'], ['tk-01', 'rf-01'],
      ['pg-01', 'cv-01'], ['lq-01', 'rf-01'], ['df-01', 'as-01'],
    ],
  },
  police: {
    nodes: [
      { id: 'pol-officer-a', label: 'Officer A', type: 'officer', graph: 'police', x: 0.25, y: 0.3, r: 0.05, description: 'Patrol officer, 8 years' },
      { id: 'pol-officer-b', label: 'Officer B', type: 'officer', graph: 'police', x: 0.4, y: 0.3, r: 0.05, description: 'Patrol officer, 5 years' },
      { id: 'pol-officer-c', label: 'Officer C', type: 'officer', graph: 'police', x: 0.55, y: 0.3, r: 0.05, description: 'Sergeant, 12 years' },
      { id: 'pol-incident-1', label: 'Stop 2023', type: 'incident', graph: 'police', x: 0.2, y: 0.5, r: 0.04, description: 'Traffic stop, June 2023' },
      { id: 'pol-incident-2', label: 'Force 2022', type: 'incident', graph: 'police', x: 0.6, y: 0.5, r: 0.04, description: 'Use of force incident, Sept 2022' },
      { id: 'pol-misconduct-1', label: 'False Statement', type: 'misconduct', graph: 'police', x: 0.15, y: 0.65, r: 0.04, description: 'False statement allegation' },
      { id: 'pol-misconduct-2', label: 'Excessive Force', type: 'misconduct', graph: 'police', x: 0.65, y: 0.65, r: 0.04, description: 'Excessive force allegation' },
      { id: 'pol-dept', label: 'Brooklyn Precinct', type: 'department', graph: 'police', x: 0.4, y: 0.15, r: 0.06, description: 'NYPD Brooklyn precinct' },
      { id: 'pol-complaint-1', label: 'CCRB Case', type: 'complaint', graph: 'police', x: 0.4, y: 0.8, r: 0.04, description: 'Civilian Complaint Review Board case' },
    ],
    edges: [
      ['pol-officer-a', 'pol-incident-1'], ['pol-officer-c', 'pol-incident-1'],
      ['pol-officer-a', 'pol-incident-2'], ['pol-officer-b', 'pol-incident-2'],
      ['pol-incident-1', 'pol-misconduct-1'], ['pol-incident-2', 'pol-misconduct-2'],
      ['pol-misconduct-1', 'pol-complaint-1'],
      ['pol-officer-a', 'pol-dept'], ['pol-officer-b', 'pol-dept'], ['pol-officer-c', 'pol-dept'],
    ],
  },
  defi: {
    nodes: [
      { id: 'defi-base', label: 'Base Chain', type: 'chain', graph: 'defi', x: 0.5, y: 0.5, r: 0.07, description: 'Coinbase L2 — settlement layer' },
      { id: 'defi-aerodrome', label: 'Aerodrome', type: 'protocol', graph: 'defi', x: 0.3, y: 0.3, r: 0.05, description: 'DEX on Base. Vote-locked governance.' },
      { id: 'defi-uniswap', label: 'Uniswap', type: 'protocol', graph: 'defi', x: 0.7, y: 0.3, r: 0.05, description: 'DEX with concentrated liquidity.' },
      { id: 'defi-morpho', label: 'Morpho', type: 'protocol', graph: 'defi', x: 0.25, y: 0.5, r: 0.05, description: 'Lending optimization protocol.' },
      { id: 'defi-aave', label: 'Aave', type: 'protocol', graph: 'defi', x: 0.4, y: 0.4, r: 0.05, description: 'Decentralized lending and borrowing.' },
      { id: 'defi-usdc', label: 'USDC', type: 'token', graph: 'defi', x: 0.6, y: 0.65, r: 0.05, description: 'USD stablecoin, native on Base.' },
      { id: 'defi-scom', label: '$SCOM', type: 'token', graph: 'defi', x: 0.45, y: 0.7, r: 0.05, description: 'SUPERCOMPUTE ecosystem token.' },
      { id: 'defi-quanta', label: '$QUANTA', type: 'token', graph: 'defi', x: 0.7, y: 0.7, r: 0.05, description: 'Quanta S intelligence token.' },
      { id: 'defi-splits', label: '0xSplits', type: 'protocol', graph: 'defi', x: 0.8, y: 0.5, r: 0.05, description: 'Streaming revenue splits.' },
      { id: 'defi-tally', label: 'Tally', type: 'protocol', graph: 'defi', x: 0.5, y: 0.8, r: 0.05, description: 'DAO governance platform.' },
      { id: 'defi-moonwell', label: 'Moonwell', type: 'protocol', graph: 'defi', x: 0.8, y: 0.35, r: 0.05, description: 'Lending market on Base.' },
      { id: 'defi-knight', label: 'KNIGHT', type: 'agent', graph: 'defi', x: 0.2, y: 0.2, r: 0.05, description: 'Trading agent.' },
      { id: 'defi-quantas', label: 'Quanta S', type: 'agent', graph: 'defi', x: 0.6, y: 0.2, r: 0.05, description: 'Intelligence agent.' },
      { id: 'defi-hermes', label: 'Hermes', type: 'agent', graph: 'defi', x: 0.4, y: 0.15, r: 0.05, description: 'Orchestration agent.' },
    ],
    edges: [
      ['defi-aerodrome', 'defi-base'], ['defi-uniswap', 'defi-base'],
      ['defi-morpho', 'defi-aave'], ['defi-moonwell', 'defi-base'],
      ['defi-splits', 'defi-base'], ['defi-tally', 'defi-base'],
      ['defi-usdc', 'defi-base'], ['defi-scom', 'defi-base'], ['defi-quanta', 'defi-base'],
      ['defi-knight', 'defi-base'], ['defi-quantas', 'defi-base'], ['defi-hermes', 'defi-base'],
      ['defi-knight', 'defi-aerodrome'], ['defi-knight', 'defi-morpho'],
      ['defi-scom', 'defi-aerodrome'], ['defi-quantas', 'defi-tally'],
    ],
  },
}

const GRAPH_META = {
  school: { label: 'Web3 School', icon: '📚', description: 'School module prerequisite chains and credential paths' },
  police: { label: 'Police Data', icon: '🚔', description: 'NYPD misconduct knowledge graph — officers, incidents, complaints' },
  defi: { label: 'DeFi / ReFi', icon: '🏦', description: 'DeFi protocols, tokens, agents, and their relationships on Base Chain' },
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  })
}

async function queryMemgraph(cypher, memgraphUrl) {
  if (!memgraphUrl) return null
  try {
    const res = await fetch(`${memgraphUrl}/cypher`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: cypher }),
    })
    if (!res.ok) return null
    const data = await res.json()
    return data.results || data
  } catch { return null }
}

export async function onRequest({ request, env }) {
  const url = new URL(request.url)
  const method = request.method
  const route = url.pathname.replace('/api/kg', '') || '/'
  const memgraphUrl = env.MEMGRAPH_HTTP_URL || null
  const graphName = url.searchParams.get('graph') || 'school'

  if (method === 'OPTIONS') {
    return new Response(null, {
      headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' },
    })
  }

  // GET /api/kg — list all available graphs
  if (method === 'GET' && route === '/') {
    const graphs = Object.entries(GRAPH_META).map(([id, meta]) => ({
      id,
      ...meta,
      nodeCount: SEED_DATA[id]?.nodes.length || 0,
      edgeCount: SEED_DATA[id]?.edges.length || 0,
    }))
    return json({ graphs })
  }

  // GET /api/kg/graph — get full graph data for a named graph
  if (method === 'GET' && route === '/graph') {
    // Try live Memgraph first
    if (memgraphUrl) {
      const results = await queryMemgraph(
        `MATCH (n:Entity {graph: '${graphName}'})
         OPTIONAL MATCH (n)-[r]->(m:Entity {graph: '${graphName}'})
         RETURN n, r, m`,
        memgraphUrl
      )
      if (results) {
        const nodes = [], edges = [], seen = new Set()
        for (const row of results) {
          for (const key of Object.keys(row)) {
            const val = row[key]
            if (val?.type && val?.id && !seen.has(val.id)) {
              nodes.push({
                id: val.id,
                label: val.properties?.label || val.id,
                type: val.properties?.type || val.type,
                graph: val.properties?.graph,
                x: Math.random(), y: Math.random(), r: 0.05,
                description: val.properties?.description || '',
              })
              seen.add(val.id)
            }
          }
        }
        return json({ graph: { nodes, edges, meta: GRAPH_META[graphName] }, mcp: true })
      }
    }

    // Fallback to seed data
    const seed = SEED_DATA[graphName]
    if (!seed) return json({ error: `Graph '${graphName}' not found. Available: ${Object.keys(SEED_DATA).join(', ')}` }, 404)
    return json({ graph: { ...seed, meta: GRAPH_META[graphName] }, mcp: false })
  }

  // GET /api/kg/search?q=term&graph=name
  if (method === 'GET' && route === '/search') {
    const q = url.searchParams.get('q') || ''
    if (!q) return json({ error: 'q required' }, 400)
    const lq = q.toLowerCase()
    const seed = SEED_DATA[graphName]
    if (!seed) return json({ error: `Graph '${graphName}' not found` }, 404)
    const matches = seed.nodes.filter(n =>
      n.label.toLowerCase().includes(lq) ||
      n.type.toLowerCase().includes(lq) ||
      (n.description || '').toLowerCase().includes(lq)
    )
    return json({ results: matches, total: matches.length })
  }

  return json({ error: 'Not found. Try GET /api/kg' }, 404)
}
