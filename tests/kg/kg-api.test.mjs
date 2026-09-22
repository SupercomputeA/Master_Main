// Tests for functions/api/kg/[[catchall]].js
// Fake D1 + stubbed fetch, zero external dependencies, runs in node --test.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { pathToFileURL } from 'node:url'
import { resolve, dirname } from 'node:path'
import { readFileSync } from 'node:fs'

const __dirname = dirname(new URL(import.meta.url).pathname)
const HANDLER_PATH = resolve(__dirname, '../../functions/api/kg/[[catchall]].js')

function fakeDb(rowsBySql = {}) {
  return {
    prepare(sql) {
      const normalized = sql.replace(/\s+/g, ' ').trim()
      const handler = rowsBySql[normalized]
      const baseRow = handler?.all ? { all: handler.all, first: handler.first, run: handler.run } : handler
      const boundRow = handler?.bind ? handler : baseRow
      return {
        bind(...args) {
          return {
            first: async () => boundRow?.first?.(args) ?? null,
            all: async () => boundRow?.all?.(args) ?? { results: [] },
            run: async () => boundRow?.run?.(args) ?? { success: true },
          }
        },
        first: async () => baseRow?.first?.() ?? null,
        all: async () => baseRow?.all?.() ?? { results: [] },
        run: async () => baseRow?.run?.() ?? { success: true },
      }
    },
  }
}

function d1Rows(results) {
  return { all: async () => ({ results }) }
}

function envFor({ db, staticGraphs = null }) {
  const savedFetch = globalThis.fetch
  globalThis.fetch = async (url) => {
    const u = new URL(url)
    const m = u.pathname.match(/^\/data\/kg\/(.*)\.json$/)
    if (!m) throw new Error(`unexpected fetch: ${url}`)
    const [, name] = m
    if (name === 'index') {
      return new Response(JSON.stringify(staticGraphs.index), { status: 200 })
    }
    if (staticGraphs[name]) {
      return new Response(JSON.stringify(staticGraphs[name]), { status: 200 })
    }
    return new Response('not found', { status: 404 })
  }
  return {
    env: { DB: db },
    restore() { globalThis.fetch = savedFetch },
  }
}

async function loadHandler() {
  const mod = await import(pathToFileURL(HANDLER_PATH).href + `?t=${Date.now()}`)
  return mod.onRequest
}

function req(path, method = 'GET') {
  return new Request(`https://supercompute.io/api/kg${path}`, { method })
}

test('GET /api/kg lists graphs from D1 with source d1', async () => {
  const db = fakeDb({
    'SELECT graph, COUNT(*) AS n, (SELECT COUNT(*) FROM kg_edges e WHERE e.graph = n.graph) AS e FROM kg_nodes n GROUP BY graph ORDER BY graph': {
      all: () => ({ results: [
        { graph: 'school', n: 18, e: 22 },
        { graph: 'articles', n: 39, e: 59 },
      ] }),
    },
  })
  const { env, restore } = envFor({ db, staticGraphs: null })
  const onRequest = await loadHandler()
  const res = await onRequest({ request: req('/'), env })
  restore()
  assert.equal(res.status, 200)
  const body = await res.json()
  assert.equal(body.source, 'd1')
  assert.equal(body.graphs.length, 2)
  assert.ok(body.graphs.some(g => g.id === 'articles'))
})

test('GET /api/kg/graph returns D1 graph with source d1', async () => {
  const db = fakeDb({
    "SELECT id, graph, label, type, description, level, x, y, r, metadata FROM kg_nodes WHERE graph = ? ORDER BY id": d1Rows([{ id: 'sc-01', graph: 'school', label: 'Sovereign Compute', type: 'module', description: '', level: 'beginner', x: 0.2, y: 0.15, r: 0.06, metadata: '{}' }]),
    "SELECT source, target, label FROM kg_edges WHERE graph = ? ORDER BY id": d1Rows([{ source: 'sc-01', target: 'ws-01', label: 'prerequisite' }]),
  })
  const { env, restore } = envFor({ db, staticGraphs: null })
  const onRequest = await loadHandler()
  const res = await onRequest({ request: req('/graph?graph=school'), env })
  restore()
  assert.equal(res.status, 200)
  const body = await res.json()
  assert.equal(body.source, 'd1')
  assert.equal(body.graph.nodes[0].id, 'sc-01')
  assert.deepEqual(body.graph.edges[0], ['sc-01', 'ws-01', 'prerequisite'])
})

test('GET /api/kg/graph falls back to static JSON when D1 is missing', async () => {
  const { env, restore } = envFor({
    db: null,
    staticGraphs: {
      index: { graphs: [{ id: 'articles', label: 'Knowledge Graph Articles', icon: '📄', description: '' }] },
      articles: JSON.parse(readFileSync(resolve(__dirname, '../../public/data/kg/articles.json'), 'utf8')),
    },
  })
  const onRequest = await loadHandler()
  const res = await onRequest({ request: req('/graph?graph=articles'), env })
  restore()
  assert.equal(res.status, 200)
  const body = await res.json()
  assert.equal(body.source, 'static')
  assert.equal(body.graph.nodes.length, 39)
})

test('GET /api/kg/search queries D1 and returns source d1', async () => {
  const db = fakeDb({
    "SELECT id, graph, label, type, description, level, x, y, r FROM kg_nodes WHERE graph = ? AND (LOWER(label) LIKE ? OR LOWER(type) LIKE ? OR LOWER(COALESCE(description, '')) LIKE ?) ORDER BY label LIMIT 100": d1Rows([{ id: 'art-01', graph: 'articles', label: 'Self-Custody', type: 'article', description: '', level: null, x: 0.5, y: 0.3, r: 0.08 }]),
  })
  const { env, restore } = envFor({ db, staticGraphs: { index: { graphs: [] } } })
  const onRequest = await loadHandler()
  const res = await onRequest({ request: req('/search?graph=articles&q=sovereignty'), env })
  restore()
  assert.equal(res.status, 200)
  const body = await res.json()
  assert.equal(body.source, 'd1')
  assert.equal(body.results.length, 1)
})

test('unknown graph returns 404', async () => {
  const { env, restore } = envFor({ db: null, staticGraphs: { index: { graphs: [] } } })
  const onRequest = await loadHandler()
  const res = await onRequest({ request: req('/graph?graph=unknown'), env })
  restore()
  assert.equal(res.status, 404)
})

test('OPTIONS returns CORS preflight', async () => {
  const onRequest = await loadHandler()
  const res = await onRequest({ request: req('/', 'OPTIONS'), env: {} })
  assert.equal(res.status, 200)
  assert.equal(res.headers.get('Access-Control-Allow-Origin'), '*')
})
