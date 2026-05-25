// scripts/load-kg-data.js
// Run via: node scripts/load-kg-data.js
// Requires Memgraph running at localhost:7687 (Bolt)

async function queryViaDocker(cypher) {
  const { execSync } = require('child_process')
  const escaped = cypher.replace(/"/g, '\\"').replace(/\n/g, ' ')
  const cmd = `echo "${escaped}" | docker exec -i \$(docker ps --filter "ancestor=memgraph/memgraph-mage" --format "{{.Names}}" | head -1) mgconsole`
  try {
    const output = execSync(cmd, { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 })
    return output
  } catch (e) {
    return e.stdout || e.message
  }
}

async function queryViaHTTP(cypher) {
  const res = await fetch("http://localhost:7444/db/data/cypher", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Accept": "application/json" },
    body: JSON.stringify({ query: cypher }),
  })
  return res.json()
}

const USE_DOCKER = process.env.USE_DOCKER === "true"
const USE_HTTP = process.env.USE_HTTP === "true"
const MEMGRAPH_HTTP = process.env.MEMGRAPH_HTTP_URL || "http://localhost:7444"

async function runQuery(cypher) {
  if (USE_DOCKER) return queryViaDocker(cypher)
  if (USE_HTTP) {
    try {
      return await queryViaHTTP(cypher)
    } catch (e) {
      console.log("HTTP failed, trying docker...")
      return queryViaDocker(cypher)
    }
  }
  return queryViaDocker(cypher)
}

const LOAD_SCRIPT = `MATCH (n) DETACH DELETE n;
CREATE (:Department {id: 'dept-1', name: 'Precinct 14', borough: 'Brooklyn'});
CREATE (:Department {id: 'dept-2', name: 'Precinct 75', borough: 'Brooklyn'});
CREATE (:Department {id: 'dept-3', name: 'Patrol Borough Bronx', borough: 'Bronx'});
CREATE (:Officer {id: 'off-1', badge: '12458', name: 'Officer A', rank: 'PO'});
CREATE (:Officer {id: 'off-2', badge: '8934', name: 'Officer B', rank: 'PO'});
CREATE (:Officer {id: 'off-3', badge: '11023', name: 'Officer C', rank: 'SGT'});
CREATE (:Officer {id: 'off-4', badge: '7721', name: 'Officer D', rank: 'PO'});
CREATE (:Incident {id: 'inc-1', type: 'stop_and_frisk', date: date('2023-06-15'), location: 'Nostrand Ave & Atlantic Ave'});
CREATE (:Incident {id: 'inc-2', type: 'use_of_force', date: date('2022-11-20'), location: 'Bedford-Stuyvesant'});
CREATE (:Incident {id: 'inc-3', type: 'stop_and_frisk', date: date('2024-02-10'), location: 'Saratoga Ave & President St'});
CREATE (:Incident {id: 'inc-4', type: 'use_of_force', date: date('2023-08-05'), location: 'Sutter Ave & Saratoga Ave'});
CREATE (:Complaint {id: 'comp-1', caseNumber: 'CCRB-2023-0892', status: 'sustained', allegation: 'excessive_force', outcome: '16-day suspension'});
CREATE (:Complaint {id: 'comp-2', caseNumber: 'CCRB-2022-0451', status: 'sustained', allegation: 'false_arrest', outcome: 'termination'});
CREATE (:Complaint {id: 'comp-3', caseNumber: 'CCRB-2024-0115', status: 'unsubstantiated', allegation: 'improper_search', outcome: 'no discipline'});
CREATE (:Complaint {id: 'comp-4', caseNumber: 'CCRB-2023-1203', status: 'pending', allegation: 'force_and_threats', outcome: 'under investigation'});
CREATE (:Misconduct {id: 'mis-1', type: 'unjustified_force', settlement: 45000});
CREATE (:Misconduct {id: 'mis-2', type: 'false_statement', settlement: 0});
CREATE (:Misconduct {id: 'mis-3', type: 'wrongful_termination', settlement: 125000});
MATCH (o:Officer {id: 'off-1'}), (i:Incident {id: 'inc-1'}) CREATE (o)-[:INVOLVED_IN]->(i);
MATCH (o:Officer {id: 'off-1'}), (i:Incident {id: 'inc-2'}) CREATE (o)-[:INVOLVED_IN]->(i);
MATCH (o:Officer {id: 'off-2'}), (i:Incident {id: 'inc-2'}) CREATE (o)-[:INVOLVED_IN]->(i);
MATCH (o:Officer {id: 'off-3'}), (i:Incident {id: 'inc-3'}) CREATE (o)-[:INVOLVED_IN]->(i);
MATCH (o:Officer {id: 'off-4'}), (i:Incident {id: 'inc-4'}) CREATE (o)-[:INVOLVED_IN]->(i);
MATCH (o:Officer {id: 'off-1'}), (c:Complaint {id: 'comp-1'}) CREATE (o)-[:HAS_COMPLAINT]->(c);
MATCH (o:Officer {id: 'off-1'}), (c:Complaint {id: 'comp-4'}) CREATE (o)-[:HAS_COMPLAINT]->(c);
MATCH (o:Officer {id: 'off-2'}), (c:Complaint {id: 'comp-2'}) CREATE (o)-[:HAS_COMPLAINT]->(c);
MATCH (o:Officer {id: 'off-3'}), (c:Complaint {id: 'comp-3'}) CREATE (o)-[:HAS_COMPLAINT]->(c);
MATCH (i:Incident {id: 'inc-1'}), (m:Misconduct {id: 'mis-2'}) CREATE (i)-[:ALLEGED]->(m);
MATCH (i:Incident {id: 'inc-2'}), (m:Misconduct {id: 'mis-1'}) CREATE (i)-[:ALLEGED]->(m);
MATCH (i:Incident {id: 'inc-4'}), (m:Misconduct {id: 'mis-3'}) CREATE (i)-[:ALLEGED]->(m);
MATCH (o:Officer), (d:Department) WHERE o.id CONTAINS 'off' CREATE (o)-[:ASSIGNED_TO]->(d);
MATCH (c:Complaint)-[:AGAINST]->(o:Officer) RETURN count(c) as complaintCount;
MATCH (n) RETURN count(n) as totalNodes;
`

async function main() {
  console.log(`Loading KG data via ${USE_DOCKER ? 'Docker' : USE_HTTP ? 'HTTP' : 'Docker'}...`)
  const result = await runQuery(LOAD_SCRIPT)
  console.log("Result:", JSON.stringify(result, null, 2))
  console.log("Done. Run: MATCH (n) RETURN n LIMIT 10 to verify.")
}

main().catch(console.error)