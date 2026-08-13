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
  articles: {
    nodes: [
      { id: 'art-01', label: 'Self-Custody & the Sovereignty Stack', type: 'article', graph: 'articles', x: 0.5, y: 0.3, r: 0.08, description: 'Knowledge Graph article, Series 03, Entry 4 of 7. Self-custody becomes a composable layer across the metaverse toolset.', slug: 'app/article/1', date: '2026-06-28' },
      { id: 'art-02', label: 'Sovereignty Stack', type: 'article', graph: 'articles', x: 0.18, y: 0.2, r: 0.045, description: 'Companion article on the full sovereignty stack architecture.' },
      { id: 'art-03', label: 'Key Management', type: 'article', graph: 'articles', x: 0.82, y: 0.2, r: 0.045, description: 'Companion article on key lifecycle, rotation, and recovery planning.' },
      { id: 'ac-sc', label: 'SELF-CUSTODY', type: 'concept', graph: 'articles', x: 0.5, y: 0.55, r: 0.07, description: 'The core thesis: control of keys and assets without a custodian.', level: 'core' },
      { id: 'ac-keys', label: 'Keys', type: 'concept', graph: 'articles', x: 0.22, y: 0.42, r: 0.05, description: 'Private/public keypair as the unit of ownership.' },
      { id: 'ac-custody', label: 'Custody', type: 'concept', graph: 'articles', x: 0.78, y: 0.42, r: 0.05, description: 'Who holds the keys — self, institution, or hybrid.' },
      { id: 'ac-wallets', label: 'Wallets', type: 'concept', graph: 'articles', x: 0.15, y: 0.68, r: 0.05, description: 'Software and hardware interfaces for key management.' },
      { id: 'ac-recovery', label: 'Recovery', type: 'concept', graph: 'articles', x: 0.85, y: 0.68, r: 0.05, description: 'Phrases, guardians, and social recovery paths.' },
      { id: 'ac-risk', label: 'Risk', type: 'concept', graph: 'articles', x: 0.5, y: 0.85, r: 0.05, description: 'Counterparty risk, loss risk, and threat models.' },
      { id: 'ac-private-keys', label: 'Private Keys', type: 'concept', graph: 'articles', x: 0.12, y: 0.3, r: 0.04, description: 'The secret material that signs transactions.' },
      { id: 'ac-hardware-wallets', label: 'Hardware Wallets', type: 'concept', graph: 'articles', x: 0.88, y: 0.3, r: 0.04, description: 'Cold storage devices; recovery phrases enter mainstream vocabulary.' },
      { id: 'ac-social-recovery', label: 'Social Recovery', type: 'concept', graph: 'articles', x: 0.9, y: 0.85, r: 0.04, description: 'Smart accounts distribute trust across guardians, reducing single points of failure.' },
      { id: 'ac-risk-models', label: 'Risk Models', type: 'concept', graph: 'articles', x: 0.1, y: 0.85, r: 0.04, description: 'Frameworks for weighing custody tradeoffs.' },
      { id: 'rl-01', label: 'Foundations', type: 'release', graph: 'articles', x: 0.12, y: 0.1, r: 0.03, description: 'Series 03 · Entry 01. Published.', num: '01' },
      { id: 'rl-02', label: 'Data Consumption', type: 'release', graph: 'articles', x: 0.3, y: 0.08, r: 0.03, description: 'Series 03 · Entry 02. Published.', num: '02' },
      { id: 'rl-03', label: 'The Vocabulary', type: 'release', graph: 'articles', x: 0.48, y: 0.07, r: 0.03, description: 'Series 03 · Entry 03. Published.', num: '03' },
      { id: 'rl-04', label: 'Self-Custody', type: 'release', graph: 'articles', x: 0.66, y: 0.08, r: 0.03, description: 'Series 03 · Entry 04. Reading Now.', num: '04' },
      { id: 'rl-05', label: 'Smart Connections', type: 'release', graph: 'articles', x: 0.84, y: 0.1, r: 0.03, description: 'Series 03 · Entry 05. Jul 5.', num: '05' },
      { id: 'rl-06', label: 'Embeddings', type: 'release', graph: 'articles', x: 0.93, y: 0.22, r: 0.03, description: 'Series 03 · Entry 06. Jul 12.', num: '06' },
      { id: 'rl-07', label: 'Synthesis', type: 'release', graph: 'articles', x: 0.95, y: 0.4, r: 0.03, description: 'Series 03 · Entry 07. Jul 19.', num: '07' },
      { id: 'tl-2013', label: 'The Custody Problem', type: 'milestone', graph: 'articles', x: 0.2, y: 0.15, r: 0.035, description: '2013 · Origin. Early Base Chain operators confront the tradeoff between convenience and control.' },
      { id: 'tl-2019', label: 'Hardware Wallet Era', type: 'milestone', graph: 'articles', x: 0.4, y: 0.13, r: 0.035, description: '2019 · Shift. Cold storage becomes standard; recovery phrases enter the mainstream vocabulary.' },
      { id: 'tl-2023', label: 'Social Recovery', type: 'milestone', graph: 'articles', x: 0.6, y: 0.13, r: 0.035, description: '2023 · Evolution. Smart accounts distribute trust across guardians, reducing single points of failure.' },
      { id: 'tl-2026', label: 'The Sovereignty Stack', type: 'milestone', graph: 'articles', x: 0.8, y: 0.15, r: 0.035, description: '2026 · Now. Self-custody becomes a composable layer across the metaverse toolset.' },
      { id: 'p-quanta', label: 'quanta_s', type: 'person', graph: 'articles', x: 0.3, y: 0.3, r: 0.04, description: 'Author · NewsDesk intelligence', role: 'Author · NewsDesk intelligence' },
      { id: 'p-knight', label: 'knight', type: 'person', graph: 'articles', x: 0.7, y: 0.3, r: 0.04, description: 'Contributor · TradeDesk treasury ops', role: 'Contributor · TradeDesk treasury ops' },
      { id: 'p-sarah', label: 'Sarah Chen', type: 'person', graph: 'articles', x: 0.25, y: 0.95, r: 0.04, description: 'Reviewer · Security research', role: 'Reviewer · Security research' },
      { id: 'p-james', label: 'James Rivera', type: 'person', graph: 'articles', x: 0.5, y: 0.97, r: 0.04, description: 'Cited · Governance framework', role: 'Cited · Governance framework' },
      { id: 'p-morgan', label: 'Morgan Lee', type: 'person', graph: 'articles', x: 0.75, y: 0.95, r: 0.04, description: 'Debate · Against', role: 'Debate · Against' },
      { id: 'p-alex', label: 'alex_t', type: 'person', graph: 'articles', x: 0.95, y: 0.95, r: 0.04, description: 'Debate · Against', role: 'Debate · Against' },
      { id: 'arg-for-1', label: 'Self-custody is the only way to guarantee true ownership', type: 'argument', graph: 'articles', x: 0.08, y: 0.5, r: 0.035, description: 'Not your keys, not your coins.', stance: 'for', author: 'knight @tradedesk' },
      { id: 'arg-for-2', label: 'Social recovery solves the usability problem', type: 'argument', graph: 'articles', x: 0.08, y: 0.62, r: 0.035, description: 'Without reintroducing custodians.', stance: 'for', author: 'Sarah Chen' },
      { id: 'arg-for-3', label: 'Every custodial failure proves counterparty risk is real', type: 'argument', graph: 'articles', x: 0.08, y: 0.74, r: 0.035, description: 'History is the evidence.', stance: 'for', author: 'quanta_s' },
      { id: 'arg-against-1', label: 'Mainstream adoption needs abstraction', type: 'argument', graph: 'articles', x: 0.92, y: 0.5, r: 0.035, description: 'Most users cannot safely manage keys.', stance: 'against', author: 'Morgan Lee' },
      { id: 'arg-against-2', label: 'Institutional custody has regulatory protections', type: 'argument', graph: 'articles', x: 0.92, y: 0.62, r: 0.035, description: 'Protections self-custody cannot match.', stance: 'against', author: 'James Rivera' },
      { id: 'arg-against-3', label: 'Recovery guardians just move the trust problem', type: 'argument', graph: 'articles', x: 0.92, y: 0.74, r: 0.035, description: 'They do not eliminate it.', stance: 'against', author: 'alex_t' },
      { id: 'cmt-1', label: 'Sovereignty stack framing finally makes this click', type: 'comment', graph: 'articles', x: 0.35, y: 0.75, r: 0.03, description: 'knight: the risk node maps exactly to treasury ops.', up: 24 },
      { id: 'cmt-2', label: 'Deeper node on threshold signatures', type: 'comment', graph: 'articles', x: 0.65, y: 0.75, r: 0.03, description: 'Sarah Chen: the missing edge between Recovery and Risk.', up: 18 },
      { id: 'cmt-3', label: 'Counterpoint holds up — usability is the blocker', type: 'comment', graph: 'articles', x: 0.5, y: 0.65, r: 0.03, description: 'alex_t: moved from 30% to maybe 50% For.', up: 11 },
    ],
    edges: [
      ['art-01', 'ac-sc'], ['art-01', 'ac-keys'], ['art-01', 'ac-custody'], ['art-01', 'ac-wallets'], ['art-01', 'ac-recovery'], ['art-01', 'ac-risk'], ['art-01', 'ac-private-keys'], ['art-01', 'ac-hardware-wallets'], ['art-01', 'ac-social-recovery'], ['art-01', 'ac-risk-models'],
      ['art-01', 'art-02'], ['art-01', 'art-03'],
      ['rl-01', 'rl-02'], ['rl-02', 'rl-03'], ['rl-03', 'rl-04'], ['rl-04', 'rl-05'], ['rl-05', 'rl-06'], ['rl-06', 'rl-07'],
      ['art-01', 'rl-04'],
      ['tl-2013', 'tl-2019'], ['tl-2019', 'tl-2023'], ['tl-2023', 'tl-2026'],
      ['art-01', 'tl-2013'], ['art-01', 'tl-2019'], ['art-01', 'tl-2023'], ['art-01', 'tl-2026'],
      ['p-quanta', 'art-01'], ['p-knight', 'art-01'], ['p-sarah', 'art-01'], ['p-james', 'art-01'],
      ['art-01', 'arg-for-1'], ['art-01', 'arg-for-2'], ['art-01', 'arg-for-3'], ['art-01', 'arg-against-1'], ['art-01', 'arg-against-2'], ['art-01', 'arg-against-3'],
      ['p-quanta', 'arg-for-3'], ['p-knight', 'arg-for-1'], ['p-sarah', 'arg-for-2'], ['p-morgan', 'arg-against-1'], ['p-james', 'arg-against-2'], ['p-alex', 'arg-against-3'],
      ['art-01', 'cmt-1'], ['art-01', 'cmt-2'], ['art-01', 'cmt-3'],
      ['p-knight', 'cmt-1'], ['p-sarah', 'cmt-2'], ['p-alex', 'cmt-3'],
      ['ac-sc', 'ac-keys'], ['ac-sc', 'ac-custody'], ['ac-sc', 'ac-wallets'], ['ac-sc', 'ac-recovery'], ['ac-sc', 'ac-risk'],
      ['ac-keys', 'ac-private-keys'], ['ac-wallets', 'ac-hardware-wallets'], ['ac-recovery', 'ac-social-recovery'], ['ac-risk', 'ac-risk-models'],
      ['ac-custody', 'ac-keys'], ['ac-recovery', 'ac-wallets'],
    ],
  },
}

const GRAPH_META = {
  school: { label: 'Web3 School', icon: '📚', description: 'School module prerequisite chains and credential paths' },
  police: { label: 'Police Data', icon: '🚔', description: 'NYPD misconduct knowledge graph — officers, incidents, complaints' },
  defi: { label: 'DeFi / ReFi', icon: '🏦', description: 'DeFi protocols, tokens, agents, and their relationships on Base Chain' },
  articles: { label: 'Knowledge Graph Articles', icon: '📄', description: 'Published KG articles — concepts, people, timeline, debate, comments' },
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
        const nodes = [], edges = [], seenNodes = new Set(), seenEdges = new Set()
        const rows = Array.isArray(results) ? results : (results.results || [])
        for (const row of rows) {
          for (const key of Object.keys(row)) {
            const val = row[key]
            if (!val || typeof val !== 'object') continue
            // Node row (Memgraph bridge: type='node', id, labels, properties)
            if (val.type === 'node' && val.id && !seenNodes.has(val.id)) {
              const props = val.properties || {}
              nodes.push({
                id: val.id,
                label: props.label || val.id,
                type: props.type || (val.labels && val.labels[0]) || 'entity',
                graph: props.graph,
                x: 0.5 + (Math.random() - 0.5) * 0.4,
                y: 0.5 + (Math.random() - 0.5) * 0.4,
                r: 0.05,
                description: props.description || '',
              })
              seenNodes.add(val.id)
            }
          }
          // Parse the {n, r, m} triple explicitly (our query's return shape)
          const n = row.n, m = row.m, r = row.r
          if (n?.id && m?.id) {
            let label = ''
            if (r?.type && r.type !== 'relationship') label = r.type
            else if (r?.label) label = r.label
            else if (r?.labels && r.labels[0]) label = r.labels[0]
            else if (typeof r === 'string') label = r
            const ek = `${n.id}|${label}|${m.id}`
            if (!seenEdges.has(ek)) {
              edges.push([n.id, m.id, label || undefined])
              seenEdges.add(ek)
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
