# Memgraph MCP Deployment Plan

## Memgraph Repos
- **Main DB**: https://github.com/memgraph/memgraph (C++, 4.1k stars)
- **AI Toolkit**: https://github.com/memgraph/ai-toolkit (MCP server, LangChain, GraphRAG)
- **MCP Server**: `memgraph/mcp-memgraph` package via Docker

## Local Development

### 1. Start Memgraph
```bash
memgraph --bolt-port=7687
# Or with Docker:
docker run -p 7687:7687 -p 7444:7444 memgraph/memgraph-mage:latest
```

### 2. Start Memgraph MCP Server
```bash
# HTTP mode (recommended for opencode)
docker run --rm -p 8000:8000 memgraph/mcp-memgraph:latest

# Or via npm for stdio mode
npx -y @memgraph/mcp
```

### 3. Load Police Accountability Data
```cypher
// Example: Load officer incident data
LOAD CSV FROM '/data/officers.csv' AS row
CREATE (:Officer {
  badge: row.badge,
  name: row.name,
  department: row.department
});
```

### 4. Verify MCP Connection
Tools available via `memgraph_query()`:
- `run_query` — Execute Cypher queries
- `get_schema` — Fetch graph ontology
- `get_page_rank` — Compute PageRank
- `get_node_neighborhood` — k-hop traversals
- `search_node_vectors` — Vector similarity search

## Production Cloud Options

### Option A: Memgraph Cloud
- Managed Memgraph on AWS, 6 regions
- Connection via WebSocket (not local command)
- Update `opencode.jsonc` with remote MCP server

```json
"memgraph": {
  "type": "remote",
  "url": "wss://cloud.memgraph.io/<project-id>",
  "headers": {
    "Authorization": "Bearer ${MEMGRAPH_API_KEY}"
  }
}
```

### Option B: Self-Hosted on Cloudflare
- Memgraph in a container on Cloudflare Workers
- Use Memgraph's HTTP endpoint for serverless functions

### Option C: Docker + MCP on cloud VM
- Run `memgraph/mcp-memgraph:latest` on a cloud host
- Connect via remote URL in opencode

## Live Data Sources

### NYCLU GitHub (302K complaints)
```bash
curl -sL https://github.com/new-york-civil-liberties-union/NYPD-Misconduct-Complaint-Database-Updated/archive/refs/heads/main.zip -o nyclu.zip
unzip -p nyclu.zip "*/ccrb*.csv" | head -1000 > data/officers.csv
```
Load via: `LOAD CSV FROM 'data/officers.csv' AS row CREATE (:Complaint {caseNumber: row.case_number, ...})`

### 50-a.org API
```
GET https://www.50-a.org/api/officers?limit=100
GET https://www.50-a.org/api/complaints?officer_id=X
```

### NYC Open Data (Official)
```
https://a860-gpp.nyc.gov/ — Download XLS files for CCRB misconduct matters
```

## Load Script

```bash
cd Master_Main
USE_HTTP=true node scripts/load-kg-data.js
```

## Environment Variables

| Variable | Local | Production |
|----------|-------|------------|
| `MEMGRAPH_HTTP_URL` | http://localhost:7444 | (cloud Memgraph) |
| `USE_HTTP` | true | true |