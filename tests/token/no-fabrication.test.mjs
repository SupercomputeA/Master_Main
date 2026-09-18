// Local test for functions/api/token.js — verifies the decode helpers
// and the no-fabrication contract: RPC failure produces { ok: false }, not zeros.

import { pathToFileURL } from "node:url"
import { resolve, dirname } from "node:path"
import { fileURLToPath } from "node:url"

const __filename2 = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename2)
const HERE = resolve(__dirname)
const tokenPath = resolve(HERE, "../../functions/api/token.js")

// Stub fetch BEFORE importing the module
const originalFetch = globalThis.fetch

function makeRequest(url, method = "GET", origin = null) {
  const headers = new Headers()
  if (origin) headers.set("Origin", origin)
  return new Request(`https://supercompute.io${url}`, { method, headers })
}

// All RPCs fail
globalThis.fetch = async () => { throw new Error("Network error") }

const { onRequest } = await import(pathToFileURL(tokenPath).href)

// Test 1: all RPCs fail → should return { ok: false, error: "rpc_unavailable" }, 503
const res1 = await onRequest({ request: makeRequest("/api/token"), env: {} })
const body1 = await res1.json()
console.log("Test 1: all RPCs fail")
console.log("  status:", res1.status)
console.log("  ok:", body1.ok)
console.log("  error:", body1.error)
console.assert(res1.status === 503, "  EXPECTED 503, got " + res1.status)
console.assert(body1.ok === false, "  EXPECTED ok=false")
console.assert(body1.name === undefined, "  EXPECTED no fabricated name")
console.assert(body1.totalSupply === undefined, "  EXPECTED no fabricated supply")
console.log("  PASS")

// Test 2: RPC succeeds with real data
let callCount = 0
const ethCallResults = [
  // name() — "fun Quanta Sovereigna"
  "0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000001566756e205175616e746120536f7665726569676e610000000000000000000000",
  // symbol() — "QUANTA"
  "0x000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000065155414e544100000000000000000000000000000000000000000000000000",
  // decimals() — 18
  "0x0000000000000000000000000000000000000000000000000000000000000012",
  // totalSupply() — 1e27
  "0x0000000000000000000000000000000000000000033b2e3c9fd0803ce8000000",
  // owner() — 0xf66dea7b3e897cd44a5a231c61b6b4423d613259
  "0x000000000000000000000000f66dea7b3e897cd44a5a231c61b6b4423d613259",
]

globalThis.fetch = async (url, opts) => {
  const body = JSON.parse(opts.body)
  if (body.method === "eth_getCode") {
    return new Response(JSON.stringify({
      jsonrpc: "2.0", id: 1,
      result: "0x60806040" + "00".repeat(100)
    }), { status: 200, headers: { "Content-Type": "application/json" } })
  }
  if (body.method === "eth_call") {
    const idx = callCount % ethCallResults.length
    callCount++
    return new Response(JSON.stringify({
      jsonrpc: "2.0", id: 1,
      result: ethCallResults[idx]
    }), { status: 200, headers: { "Content-Type": "application/json" } })
  }
  return new Response(JSON.stringify({
    jsonrpc: "2.0", id: 1,
    error: { code: -32601, message: "Method not found" }
  }), { status: 200, headers: { "Content-Type": "application/json" } })
}

callCount = 0
const res2 = await onRequest({ request: makeRequest("/api/token"), env: {} })
const body2 = await res2.json()
console.log("\nTest 2: RPC succeeds with real data")
console.log("  status:", res2.status)
console.log("  ok:", body2.ok)
console.log("  deployed:", body2.deployed)
console.log("  name:", JSON.stringify(body2.name))
console.log("  symbol:", JSON.stringify(body2.symbol))
console.log("  decimals:", body2.decimals)
console.log("  totalSupply:", body2.totalSupply)
console.log("  totalSupplyFormatted:", body2.totalSupplyFormatted)
console.log("  owner:", body2.owner)
console.assert(res2.status === 200, "  EXPECTED 200, got " + res2.status)
console.assert(body2.ok === true, "  EXPECTED ok=true")
console.assert(body2.deployed === true, "  EXPECTED deployed=true")
console.assert(body2.name === "fun Quanta Sovereigna", `  EXPECTED name='fun Quanta Sovereigna', got '${body2.name}'`)
console.assert(body2.symbol === "QUANTA", `  EXPECTED symbol='QUANTA', got '${body2.symbol}'`)
console.assert(body2.decimals === 18, `  EXPECTED decimals=18, got ${body2.decimals}`)
console.assert(body2.owner === "0xf66dea7b3e897cd44a5a231c61b6b4423d613259", `  EXPECTED owner, got ${body2.owner}`)
console.log("  PASS")

// Test 3: Contract not deployed (eth_getCode returns "0x")
globalThis.fetch = async (url, opts) => {
  const body = JSON.parse(opts.body)
  if (body.method === "eth_getCode") {
    return new Response(JSON.stringify({
      jsonrpc: "2.0", id: 1,
      result: "0x"
    }), { status: 200, headers: { "Content-Type": "application/json" } })
  }
  return new Response(JSON.stringify({
    jsonrpc: "2.0", id: 1,
    result: "0x"
  }), { status: 200, headers: { "Content-Type": "application/json" } })
}

const res3 = await onRequest({ request: makeRequest("/api/token"), env: {} })
const body3 = await res3.json()
console.log("\nTest 3: Contract not deployed")
console.log("  status:", res3.status)
console.log("  ok:", body3.ok)
console.log("  deployed:", body3.deployed)
console.assert(res3.status === 200, "  EXPECTED 200, got " + res3.status)
console.assert(body3.ok === true, "  EXPECTED ok=true")
console.assert(body3.deployed === false, "  EXPECTED deployed=false")
console.log("  PASS")

// Restore
globalThis.fetch = originalFetch

console.log("\n=== ALL TESTS PASSED ===")
