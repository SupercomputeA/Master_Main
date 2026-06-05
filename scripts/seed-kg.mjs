// scripts/seed-kg.mjs
// Seed Memgraph with multiple named knowledge graphs for SUPERCOMPUTE.
// Run: node scripts/seed-kg.mjs
// Requires Memgraph Bolt running on localhost:7687

import neo4j from 'neo4j-driver';

const driver = neo4j.driver('bolt://localhost:7687');
const session = driver.session();

async function run() {
  console.log('=== SUPERCOMPUTE KG Seed ===\n');

  // Clear existing data
  await session.run('MATCH (n) DETACH DELETE n');
  console.log('✅ Cleared existing data');

  // Create constraint for unique entity IDs across all graphs
  await session.run('CREATE CONSTRAINT ON (e:Entity) ASSERT e.id IS UNIQUE');

  // ── SCHOOL KG ──────────────────────────────────────────────────────────
  console.log('\n--- School KG ---');
  const schoolResult = await session.run(`
    CREATE (sc:Entity:School {id:'sc-01', graph:'school', label:'Sovereign Compute', type:'module',
      description:'Foundations of sovereign compute infrastructure on Base Chain',
      level:'beginner', duration:'45min', lessons:6, credentials:['SCT-101']})

    CREATE (ws:Entity:School {id:'ws-01', graph:'school', label:'Wallet Security', type:'module',
      description:'Create and secure your first crypto wallet. Seed phrases, hardware wallets, OpSec.',
      level:'beginner', duration:'30min', lessons:4, credentials:['WST-101']})

    CREATE (df:Entity:School {id:'df-01', graph:'school', label:'DeFi Fundamentals', type:'module',
      description:'Decentralized finance primitives: AMMs, lending pools, yield strategies.',
      level:'intermediate', duration:'60min', lessons:8, credentials:['DFT-201']})

    CREATE (tk:Entity:School {id:'tk-01', graph:'school', label:'Token Economics', type:'module',
      description:'Token design, distribution models, vesting schedules, and governance.',
      level:'intermediate', duration:'50min', lessons:6, credentials:['TKT-201']})

    CREATE (pg:Entity:School {id:'pg-01', graph:'school', label:'Protocol Governance', type:'module',
      description:'DAO structures, proposal frameworks, voting mechanisms, treasury management.',
      level:'advanced', duration:'70min', lessons:8, credentials:['PGT-301']})

    CREATE (lq:Entity:School {id:'lq-01', graph:'school', label:'Liquidity Pools', type:'module',
      description:'LP mechanics, impermanent loss, concentrated liquidity, yield farming.',
      level:'advanced', duration:'55min', lessons:6, credentials:['LQT-301']})

    CREATE (rf:Entity:School {id:'rf-01', graph:'school', label:'Refi & Regenerative Finance', type:'module',
      description:'Regenerative finance principles, impact measurement, community-owned liquidity.',
      level:'advanced', duration:'50min', lessons:5, credentials:['RFT-301']})

    CREATE (cv:Entity:School {id:'cv-01', graph:'school', label:'Community Building', type:'module',
      description:'Token-gated communities, DAO tooling, Guild.xyz roles, governance design.',
      level:'intermediate', duration:'40min', lessons:5, credentials:['CBT-201']})

    CREATE (as:Entity:School {id:'as-01', graph:'school', label:'Agent Systems', type:'module',
      description:'AI agent deployment, autonomous operations, agent coordination on-chain.',
      level:'advanced', duration:'65min', lessons:7, credentials:['AST-301']})

    // Prerequisites
    CREATE (sc)-[:PREREQUISITE_FOR]->(ws)
    CREATE (ws)-[:PREREQUISITE_FOR]->(df)
    CREATE (df)-[:PREREQUISITE_FOR]->(tk)
    CREATE (df)-[:PREREQUISITE_FOR]->(pg)
    CREATE (df)-[:PREREQUISITE_FOR]->(lq)
    CREATE (tk)-[:PREREQUISITE_FOR]->(rf)
    CREATE (pg)-[:PREREQUISITE_FOR]->(cv)
    CREATE (lq)-[:PREREQUISITE_FOR]->(rf)
    CREATE (df)-[:PREREQUISITE_FOR]->(as)

    // Credential paths
    CREATE (sc)-[:AWARDS_CREDENTIAL]->(:Credential {id:'SCT-101', graph:'school', name:'Sovereign Compute Technician', level:'beginner'})
    CREATE (ws)-[:AWARDS_CREDENTIAL]->(:Credential {id:'WST-101', graph:'school', name:'Wallet Security Technician', level:'beginner'})
    CREATE (df)-[:AWARDS_CREDENTIAL]->(:Credential {id:'DFT-201', graph:'school', name:'DeFi Practitioner', level:'intermediate'})
    CREATE (tk)-[:AWARDS_CREDENTIAL]->(:Credential {id:'TKT-201', graph:'school', name:'Token Economist', level:'intermediate'})
    CREATE (pg)-[:AWARDS_CREDENTIAL]->(:Credential {id:'PGT-301', graph:'school', name:'Governance Architect', level:'advanced'})
    CREATE (lq)-[:AWARDS_CREDENTIAL]->(:Credential {id:'LQT-301', graph:'school', name:'Liquidity Strategist', level:'advanced'})
    CREATE (cv)-[:AWARDS_CREDENTIAL]->(:Credential {id:'CBT-201', graph:'school', name:'Community Builder', level:'intermediate'})
    CREATE (rf)-[:AWARDS_CREDENTIAL]->(:Credential {id:'RFT-301', graph:'school', name:'Refi Analyst', level:'advanced'})
    CREATE (as)-[:AWARDS_CREDENTIAL]->(:Credential {id:'AST-301', graph:'school', name:'Agent Systems Architect', level:'advanced'})

    RETURN count(*) AS created
  `);
  console.log(`  ${schoolResult.records[0].get('created')} school entities created`);

  // ── POLICE DATA KG (NYPD Misconduct) ──────────────────────────────────
  console.log('\n--- Police Data KG ---');
  const policeResult = await session.run(`
    CREATE (a1:Entity:Police {id:'pol-officer-a', graph:'police', label:'Officer A', type:'officer',
      description:'Patrol officer, Brooklyn precinct, 8 years service'})
    CREATE (a2:Entity:Police {id:'pol-officer-b', graph:'police', label:'Officer B', type:'officer',
      description:'Patrol officer, Brooklyn precinct, 5 years service'})
    CREATE (a3:Entity:Police {id:'pol-officer-c', graph:'police', label:'Officer C', type:'officer',
      description:'Sergeant, Brooklyn precinct, 12 years service'})
    CREATE (inc1:Entity:Police {id:'pol-incident-1', graph:'police', label:'Stop 2023', type:'incident',
      description:'Traffic stop at Nostrand Ave & Atlantic Ave, June 2023'})
    CREATE (inc2:Entity:Police {id:'pol-incident-2', graph:'police', label:'Force 2022', type:'incident',
      description:'Use of force incident, Sept 2022'})
    CREATE (mis1:Entity:Police {id:'pol-misconduct-1', graph:'police', label:'False Statement', type:'misconduct',
      description:'Allegation of false statement in official report'})
    CREATE (mis2:Entity:Police {id:'pol-misconduct-2', graph:'police', label:'Excessive Force', type:'misconduct',
      description:'Allegation of excessive force during arrest'})
    CREATE (dept:Entity:Police {id:'pol-dept', graph:'police', label:'Brooklyn Precinct', type:'department',
      description:'NYPD Brooklyn precinct, serving 200k residents'})
    CREATE (comp:Entity:Police {id:'pol-complaint-1', graph:'police', label:'CCRB Case #2023-0451', type:'complaint',
      description:'Civilian Complaint Review Board case, filed Mar 2023', properties:{status:'investigating', filed:'2023-03-15'}})

    CREATE (a1)-[:INVOLVED_IN]->(inc1)
    CREATE (a3)-[:INVOLVED_IN]->(inc1)
    CREATE (a1)-[:INVOLVED_IN]->(inc2)
    CREATE (a2)-[:INVOLVED_IN]->(inc2)
    CREATE (inc1)-[:RESULTED_IN]->(mis1)
    CREATE (inc2)-[:RESULTED_IN]->(mis2)
    CREATE (mis1)-[:FILED_AS]->(comp)
    CREATE (a1)-[:ASSIGNED_TO]->(dept)
    CREATE (a2)-[:ASSIGNED_TO]->(dept)
    CREATE (a3)-[:ASSIGNED_TO]->(dept)

    RETURN count(*) AS created
  `);
  console.log(`  ${policeResult.records[0].get('created')} police entities created`);

  // ── DEFI / REFI KG ────────────────────────────────────────────────────
  console.log('\n--- DeFi/Refi KG ---');
  const defiResult = await session.run(`
    CREATE (base:Entity:Defi {id:'defi-base', graph:'defi', label:'Base Chain', type:'chain',
      description:'Coinbase L2 — fast, low-cost Ethereum rollup. Settlement layer for SUPERCOMPUTE.'})

    CREATE (aerodrome:Entity:Defi {id:'defi-aerodrome', graph:'defi', label:'Aerodrome', type:'protocol',
      description:'DEX on Base. Community-owned LP pools, vote-locked governance.'})

    CREATE (uniswap:Entity:Defi {id:'defi-uniswap', graph:'defi', label:'Uniswap', type:'protocol',
      description:'Decentralized exchange. AMM model with concentrated liquidity.'})

    CREATE (morpho:Entity:Defi {id:'defi-morpho', graph:'defi', label:'Morpho', type:'protocol',
      description:'Lending optimization protocol. Peer-to-peer matching layer over Aave/Compound pools.'})

    CREATE (aave:Entity:Defi {id:'defi-aave', graph:'defi', label:'Aave', type:'protocol',
      description:'Decentralized lending and borrowing. Variable + stable rate pools.'})

    CREATE (usdc:Entity:Defi {id:'defi-usdc', graph:'defi', label:'USDC', type:'token',
      description:'Circle-issued USD stablecoin. Native on Base. Programmable dollars.'})

    CREATE (scom:Entity:Defi {id:'defi-scom', graph:'defi', label:'$SCOM', type:'token',
      description:'SUPERCOMPUTE ecosystem token. Gates access, staked for security.'})

    CREATE (quanta:Entity:Defi {id:'defi-quanta', graph:'defi', label:'$QUANTA', type:'token',
      description:'Quanta S intelligence token. Governance rights in NewsDesk ecosystem.'})

    CREATE (splits:Entity:Defi {id:'defi-splits', graph:'defi', label:'0xSplits', type:'protocol',
      description:'Streaming revenue splits. Programmatic distribution to contributors and DAO.'})

    CREATE (tally:Entity:Defi {id:'defi-tally', graph:'defi', label:'Tally', type:'protocol',
      description:'DAO governance platform. Proposal creation, voting, delegation on-chain.'})

    CREATE (moonwell:Entity:Defi {id:'defi-moonwell', graph:'defi', label:'Moonwell', type:'protocol',
      description:'Lending market on Base. Supply USDC, borrow ETH, earn $WELL rewards.'})

    // Agent nodes
    CREATE (knight:Entity:Defi {id:'defi-knight', graph:'defi', label:'KNIGHT', type:'agent',
      description:'Trading agent. Monitors CDP positions, DEX liquidity, executes strategies.'})
    CREATE (quantaS:Entity:Defi {id:'defi-quantas', graph:'defi', label:'Quanta S', type:'agent',
      description:'Intelligence agent. NewsDesk content, school curriculum, protocol research.'})
    CREATE (hermes:Entity:Defi {id:'defi-hermes', graph:'defi', label:'Hermes', type:'agent',
      description:'Orchestration agent. Task dispatch, Kanban management, cross-agent coordination.'})

    // Edges
    CREATE (aerodrome)-[:RUNS_ON]->(base)
    CREATE (uniswap)-[:RUNS_ON]->(base)
    CREATE (morpho)-[:INTEGRATES]->(aave)
    CREATE (moonwell)-[:RUNS_ON]->(base)
    CREATE (splits)-[:RUNS_ON]->(base)
    CREATE (tally)-[:RUNS_ON]->(base)
    CREATE (usdc)-[:ISSUED_ON]->(base)
    CREATE (scom)-[:ISSUED_ON]->(base)
    CREATE (quanta)-[:ISSUED_ON]->(base)
    CREATE (knight)-[:OPERATES_ON]->(base)
    CREATE (quantaS)-[:OPERATES_ON]->(base)
    CREATE (hermes)-[:OPERATES_ON]->(base)
    CREATE (knight)-[:TRADES_ON]->(aerodrome)
    CREATE (knight)-[:USES]->(morpho)
    CREATE (scom)-[:STAKED_ON]->(aerodrome)
    CREATE (quantaS)-[:PUBLISHES_TO]->(tally)

    RETURN count(*) AS created
  `);
  console.log(`  ${defiResult.records[0].get('created')} defi/refi entities created`);

  // ── VERIFY ─────────────────────────────────────────────────────────────
  console.log('\n--- Verification ---');
  const graphs = await session.run(`
    MATCH (n) 
    RETURN n.graph AS graph, labels(n)[0] AS category, count(*) AS count
    ORDER BY graph, count DESC
  `);
  for (const row of graphs.records) {
    console.log(`  ${row.get('graph')}: ${row.get('count')} entities`);
  }

  const total = await session.run('MATCH (n) RETURN count(n) AS total');
  console.log(`\n✅ Total: ${total.records[0].get('total')} entities across all graphs`);

  await session.close();
  await driver.close();
}

run().catch(err => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
