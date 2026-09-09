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

  // ── ARTICLES KG (Knowledge Graph Article #1 — Self-Custody & the Sovereignty Stack) ──
  console.log('\n--- Articles KG ---');
  const articlesResult = await session.run(`
    // The article itself + related articles
    CREATE (art:Entity:Article {id:'art-01', graph:'articles', label:'Self-Custody & the Sovereignty Stack', type:'article',
      description:'Knowledge Graph article, Series 03, Entry 4 of 7. Self-custody becomes a composable layer across the metaverse toolset.', slug:'app/article/1', date:'2026-06-28'})
    CREATE (artRel1:Entity:Article {id:'art-02', graph:'articles', label:'Sovereignty Stack', type:'article',
      description:'Companion article on the full sovereignty stack architecture.'})
    CREATE (artRel2:Entity:Article {id:'art-03', graph:'articles', label:'Key Management', type:'article',
      description:'Companion article on key lifecycle, rotation, and recovery planning.'})

    // Concepts — SVG hub + connected concepts
    CREATE (hub:Entity:Article {id:'ac-sc', graph:'articles', label:'SELF-CUSTODY', type:'concept',
      description:'The core thesis: control of keys and assets without a custodian.', level:'core'})
    CREATE (ac1:Entity:Article {id:'ac-keys', graph:'articles', label:'Keys', type:'concept',
      description:'Private/public keypair as the unit of ownership.'})
    CREATE (ac2:Entity:Article {id:'ac-custody', graph:'articles', label:'Custody', type:'concept',
      description:'Who holds the keys — self, institution, or hybrid.'})
    CREATE (ac3:Entity:Article {id:'ac-wallets', graph:'articles', label:'Wallets', type:'concept',
      description:'Software and hardware interfaces for key management.'})
    CREATE (ac4:Entity:Article {id:'ac-recovery', graph:'articles', label:'Recovery', type:'concept',
      description:'Phrases, guardians, and social recovery paths.'})
    CREATE (ac5:Entity:Article {id:'ac-risk', graph:'articles', label:'Risk', type:'concept',
      description:'Counterparty risk, loss risk, and threat models.'})
    CREATE (ac6:Entity:Article {id:'ac-private-keys', graph:'articles', label:'Private Keys', type:'concept',
      description:'The secret material that signs transactions.'})
    CREATE (ac7:Entity:Article {id:'ac-hardware-wallets', graph:'articles', label:'Hardware Wallets', type:'concept',
      description:'Cold storage devices; recovery phrases enter mainstream vocabulary.'})
    CREATE (ac8:Entity:Article {id:'ac-social-recovery', graph:'articles', label:'Social Recovery', type:'concept',
      description:'Smart accounts distribute trust across guardians, reducing single points of failure.'})
    CREATE (ac9:Entity:Article {id:'ac-risk-models', graph:'articles', label:'Risk Models', type:'concept',
      description:'Frameworks for weighing custody tradeoffs.'})

    // Release path — Series 03, 7 entries
    CREATE (rl1:Entity:Article {id:'rl-01', graph:'articles', label:'Foundations', type:'release', num:'01', status:'Published'})
    CREATE (rl2:Entity:Article {id:'rl-02', graph:'articles', label:'Data Consumption', type:'release', num:'02', status:'Published'})
    CREATE (rl3:Entity:Article {id:'rl-03', graph:'articles', label:'The Vocabulary', type:'release', num:'03', status:'Published'})
    CREATE (rl4:Entity:Article {id:'rl-04', graph:'articles', label:'Self-Custody', type:'release', num:'04', status:'Reading Now'})
    CREATE (rl5:Entity:Article {id:'rl-05', graph:'articles', label:'Smart Connections', type:'release', num:'05', status:'Jul 5'})
    CREATE (rl6:Entity:Article {id:'rl-06', graph:'articles', label:'Embeddings', type:'release', num:'06', status:'Jul 12'})
    CREATE (rl7:Entity:Article {id:'rl-07', graph:'articles', label:'Synthesis', type:'release', num:'07', status:'Jul 19'})

    // Story timeline milestones
    CREATE (tl1:Entity:Article {id:'tl-2013', graph:'articles', label:'The Custody Problem', type:'milestone', datetime:'2013-01-01',
      description:'2013 · Origin. Early Base Chain operators confront the tradeoff between convenience and control.'})
    CREATE (tl2:Entity:Article {id:'tl-2019', graph:'articles', label:'Hardware Wallet Era', type:'milestone', datetime:'2019-01-01',
      description:'2019 · Shift. Cold storage becomes standard; recovery phrases enter the mainstream vocabulary.'})
    CREATE (tl3:Entity:Article {id:'tl-2023', graph:'articles', label:'Social Recovery', type:'milestone', datetime:'2023-01-01',
      description:'2023 · Evolution. Smart accounts distribute trust across guardians, reducing single points of failure.'})
    CREATE (tl4:Entity:Article {id:'tl-2026', graph:'articles', label:'The Sovereignty Stack', type:'milestone', datetime:'2026-01-01',
      description:'2026 · Now. Self-custody becomes a composable layer across the metaverse toolset.'})

    // People
    CREATE (p1:Entity:Article {id:'p-quanta', graph:'articles', label:'quanta_s', type:'person', role:'Author · NewsDesk intelligence'})
    CREATE (p2:Entity:Article {id:'p-knight', graph:'articles', label:'knight', type:'person', role:'Contributor · TradeDesk treasury ops'})
    CREATE (p3:Entity:Article {id:'p-sarah', graph:'articles', label:'Sarah Chen', type:'person', role:'Reviewer · Security research'})
    CREATE (p4:Entity:Article {id:'p-james', graph:'articles', label:'James Rivera', type:'person', role:'Cited · Governance framework'})
    CREATE (p5:Entity:Article {id:'p-morgan', graph:'articles', label:'Morgan Lee', type:'person', role:'Debate · Against'})
    CREATE (p6:Entity:Article {id:'p-alex', graph:'articles', label:'alex_t', type:'person', role:'Debate · Against'})

    // Debate arguments
    CREATE (arg1:Entity:Article {id:'arg-for-1', graph:'articles', label:'Self-custody is the only way to guarantee true ownership', type:'argument', stance:'for',
      description:'Not your keys, not your coins.', author:'knight @tradedesk'})
    CREATE (arg2:Entity:Article {id:'arg-for-2', graph:'articles', label:'Social recovery solves the usability problem', type:'argument', stance:'for',
      description:'Without reintroducing custodians.', author:'Sarah Chen'})
    CREATE (arg3:Entity:Article {id:'arg-for-3', graph:'articles', label:'Every custodial failure proves counterparty risk is real', type:'argument', stance:'for',
      description:'History is the evidence.', author:'quanta_s'})
    CREATE (arg4:Entity:Article {id:'arg-against-1', graph:'articles', label:'Mainstream adoption needs abstraction', type:'argument', stance:'against',
      description:'Most users cannot safely manage keys.', author:'Morgan Lee'})
    CREATE (arg5:Entity:Article {id:'arg-against-2', graph:'articles', label:'Institutional custody has regulatory protections', type:'argument', stance:'against',
      description:'Protections self-custody cannot match.', author:'James Rivera'})
    CREATE (arg6:Entity:Article {id:'arg-against-3', graph:'articles', label:'Recovery guardians just move the trust problem', type:'argument', stance:'against',
      description:'They do not eliminate it.', author:'alex_t'})

    // Comments
    CREATE (cmt1:Entity:Article {id:'cmt-1', graph:'articles', label:'Sovereignty stack framing finally makes this click', type:'comment',
      description:'Comment by knight: the risk node maps exactly to treasury ops.', up:24})
    CREATE (cmt2:Entity:Article {id:'cmt-2', graph:'articles', label:'Deeper node on threshold signatures', type:'comment',
      description:'Comment by Sarah Chen: the missing edge between Recovery and Risk.', up:18})
    CREATE (cmt3:Entity:Article {id:'cmt-3', graph:'articles', label:'Counterpoint holds up — usability is the blocker', type:'comment',
      description:'Comment by alex_t: moved from 30% to maybe 50% For.', up:11})

    // Article → concepts (COVERS)
    CREATE (art)-[:COVERS]->(hub)
    CREATE (art)-[:COVERS]->(ac1)
    CREATE (art)-[:COVERS]->(ac2)
    CREATE (art)-[:COVERS]->(ac3)
    CREATE (art)-[:COVERS]->(ac4)
    CREATE (art)-[:COVERS]->(ac5)
    CREATE (art)-[:COVERS]->(ac6)
    CREATE (art)-[:COVERS]->(ac7)
    CREATE (art)-[:COVERS]->(ac8)
    CREATE (art)-[:COVERS]->(ac9)

    // Related articles
    CREATE (art)-[:RELATED_TO]->(artRel1)
    CREATE (art)-[:RELATED_TO]->(artRel2)

    // Release path — sequential + article is entry 04
    CREATE (rl1)-[:NEXT]->(rl2)
    CREATE (rl2)-[:NEXT]->(rl3)
    CREATE (rl3)-[:NEXT]->(rl4)
    CREATE (rl4)-[:NEXT]->(rl5)
    CREATE (rl5)-[:NEXT]->(rl6)
    CREATE (rl6)-[:NEXT]->(rl7)
    CREATE (art)-[:IS_ENTRY]->(rl4)

    // Timeline — sequential + owned by article
    CREATE (tl1)-[:NEXT]->(tl2)
    CREATE (tl2)-[:NEXT]->(tl3)
    CREATE (tl3)-[:NEXT]->(tl4)
    CREATE (art)-[:TIMELINE]->(tl1)
    CREATE (art)-[:TIMELINE]->(tl2)
    CREATE (art)-[:TIMELINE]->(tl3)
    CREATE (art)-[:TIMELINE]->(tl4)

    // People → article
    CREATE (p1)-[:AUTHORED]->(art)
    CREATE (p2)-[:CONTRIBUTED]->(art)
    CREATE (p3)-[:REVIEWED]->(art)
    CREATE (p4)-[:CITED]->(art)

    // Debate: article debates all six; people argue
    CREATE (art)-[:DEBATES]->(arg1)
    CREATE (art)-[:DEBATES]->(arg2)
    CREATE (art)-[:DEBATES]->(arg3)
    CREATE (art)-[:DEBATES]->(arg4)
    CREATE (art)-[:DEBATES]->(arg5)
    CREATE (art)-[:DEBATES]->(arg6)
    CREATE (p1)-[:ARGUED_FOR]->(arg3)
    CREATE (p2)-[:ARGUED_FOR]->(arg1)
    CREATE (p3)-[:ARGUED_FOR]->(arg2)
    CREATE (p5)-[:ARGUED_AGAINST]->(arg4)
    CREATE (p4)-[:ARGUED_AGAINST]->(arg5)
    CREATE (p6)-[:ARGUED_AGAINST]->(arg6)

    // Comments
    CREATE (art)-[:HAS_COMMENT]->(cmt1)
    CREATE (art)-[:HAS_COMMENT]->(cmt2)
    CREATE (art)-[:HAS_COMMENT]->(cmt3)
    CREATE (p2)-[:COMMENTED]->(cmt1)
    CREATE (p3)-[:COMMENTED]->(cmt2)
    CREATE (p6)-[:COMMENTED]->(cmt3)

    // Concept web — hub connects to all, plus derived-concept links
    CREATE (hub)-[:RELATED_TO]->(ac1)
    CREATE (hub)-[:RELATED_TO]->(ac2)
    CREATE (hub)-[:RELATED_TO]->(ac3)
    CREATE (hub)-[:RELATED_TO]->(ac4)
    CREATE (hub)-[:RELATED_TO]->(ac5)
    CREATE (ac1)-[:RELATED_TO]->(ac6)
    CREATE (ac3)-[:RELATED_TO]->(ac7)
    CREATE (ac4)-[:RELATED_TO]->(ac8)
    CREATE (ac5)-[:RELATED_TO]->(ac9)
    CREATE (ac2)-[:RELATED_TO]->(ac1)
    CREATE (ac4)-[:RELATED_TO]->(ac3)

    RETURN count(*) AS created
  `);
  console.log(`  ${articlesResult.records[0].get('created')} articles entities created`);

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
