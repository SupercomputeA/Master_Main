// functions/api/token.js — $QUANTA token data from Base Chain
// Uses individual eth_call + eth_getCode against multiple public Base RPCs.
// On total RPC failure, returns { ok: false, error: "..." } — NEVER fabricated data.
//
// RPC endpoint order matters: Cloudflare Workers edge IPs are blocked by some
// public RPCs (llamarpc returns 525, blastapi times out). The ones that work
// from the CF edge are listed first. See references/browser-rpc-csp-origins.md
// for the measured host-behaviour matrix.

const RPC_ENDPOINTS = [
  "https://mainnet.base.org",
  "https://1rpc.io/base",
  "https://base-rpc.publicnode.com",
  "https://base.llamarpc.com",
  "https://base.public.blastapi.io",
]

const QUANTA_TOKEN = "0x5ACDC563450cC35055d7344287C327fafB2b371A"

const SELECTORS = {
  name: "0x06fdde03",
  symbol: "0x95d89b41",
  decimals: "0x313ce567",
  totalSupply: "0x18160ddd",
  owner: "0x8da5cb5b",
  balanceOf: "0x70a08231",
}

// ── RPC helpers ─────────────────────────────────────────────────────────────

async function rpcCall(rpcUrl, method, params) {
  try {
    const res = await fetch(rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", method, params, id: 1 }),
    })
    if (!res.ok) return null
    const json = await res.json()
    if (json.error) return null
    return json.result
  } catch {
    return null
  }
}

// Try every RPC endpoint until one returns a non-null result.
// Returns { result, endpoint } on success, { result: null, error } on total failure.
async function rpcCallAny(method, params) {
  let lastError = "all RPC endpoints failed"
  for (const rpc of RPC_ENDPOINTS) {
    const result = await rpcCall(rpc, method, params)
    if (result !== null && result !== undefined) {
      return { result, endpoint: rpc }
    }
    lastError = `last tried: ${rpc} returned null`
  }
  return { result: null, error: lastError }
}

// ── ABI decode helpers ───────────────────────────────────────────────────────

function decodeString(hexResult) {
  if (!hexResult || hexResult === "0x") return null
  const hex = hexResult.slice(2)
  if (hex.length < 128) {
    // Some tokens use non-standard encoding (short strings in single slot)
    if (hex.length >= 64) {
      const len = parseInt(hex.slice(0, 64), 16)
      if (len > 0 && len < 32 && hex.length >= 64 + len * 2) {
        try {
          return new TextDecoder().decode(
            new Uint8Array(hex.slice(64, 64 + len * 2).match(/.{2}/g).map(b => parseInt(b, 16)))
          )
        } catch {
          return null
        }
      }
    }
    return null
  }
  const strLen = parseInt(hex.slice(64, 128), 16)
  if (strLen <= 0 || strLen > 1024) return null // sanity guard
  const strHex = hex.slice(128, 128 + strLen * 2)
  try {
    return new TextDecoder().decode(
      new Uint8Array(strHex.match(/.{2}/g).map(b => parseInt(b, 16)))
    )
  } catch {
    return null
  }
}

function decodeUint(hexResult) {
  if (!hexResult || hexResult === "0x") return null
  try {
    return BigInt(hexResult)
  } catch {
    return null
  }
}

function decodeAddress(hexResult) {
  if (!hexResult || hexResult === "0x" || hexResult.length < 42) return null
  const addr = "0x" + hexResult.slice(-40).toLowerCase()
  // Filter out zero addresses (no owner set)
  if (addr === "0x0000000000000000000000000000000000000000") return null
  return addr
}

function formatUnits(value, decimals) {
  if (!value || value === 0n) return "0"
  const v = BigInt(value)
  const divisor = BigInt(10) ** BigInt(decimals)
  const intPart = v / divisor
  const fracPart = v % divisor
  const fracStr = fracPart.toString().padStart(Number(decimals), "0").slice(0, 6)
  return `${intPart}.${fracStr}`
}

// ── Handler ──────────────────────────────────────────────────────────────────

export async function onRequest({ request, env }) {
  const url = new URL(request.url)
  const reqOrigin = request.headers.get("Origin") || ""
  let allowedOrigin = "https://supercompute.io"
  if (reqOrigin) {
    try {
      const host = new URL(reqOrigin).hostname
      if (host === "supercompute.io" || host.endsWith(".pages.dev") || host === "localhost" || host === "127.0.0.1") {
        allowedOrigin = reqOrigin
      }
    } catch {}
  }

  if (request.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": allowedOrigin,
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    })
  }

  const j = (data, status = 200) => new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": allowedOrigin,
      "Cache-Control": "public, max-age=30",
    },
  })

  const tokenAddr = (env?.QUANTA_TOKEN || QUANTA_TOKEN).toLowerCase()
  const wallet = url.searchParams.get("wallet")

  // ── Step 1: eth_getCode — is the contract deployed? ─────────────────────
  const codeResult = await rpcCallAny("eth_getCode", [tokenAddr, "latest"])
  const codeRaw = codeResult.result

  if (codeRaw === null) {
    // Total RPC failure — we cannot determine deployment status, and we must
    // not fabricate "not deployed" (false) because the contract IS live.
    // Return an explicit error state so the caller knows the data is missing,
    // not zero.
    return j({
      ok: false,
      error: "rpc_unavailable",
      detail: "All Base RPC endpoints failed — cannot read on-chain token data.",
      address: tokenAddr,
      chain: "base",
      timestamp: new Date().toISOString(),
    }, 503)
  }

  const deployed = codeRaw !== "0x" && codeRaw.length > 4

  if (!deployed) {
    // Contract genuinely not deployed at this address — this is a real state,
    // not a fabrication. Return it honestly.
    return j({
      ok: true,
      deployed: false,
      address: tokenAddr,
      chain: "base",
      explorer: `https://basescan.org/token/${tokenAddr}`,
      timestamp: new Date().toISOString(),
    }, 200)
  }

  // ── Step 2: Read token metadata via individual eth_calls ─────────────────
  // We use individual calls rather than multicall3 because some RPCs
  // do not support multicall or return unexpected encoded results.
  // Each call is independent — a single field failing does not corrupt the rest.
  const readFields = [
    { key: "name", method: "eth_call", params: [{ to: tokenAddr, data: SELECTORS.name }, "latest"], decoder: decodeString },
    { key: "symbol", method: "eth_call", params: [{ to: tokenAddr, data: SELECTORS.symbol }, "latest"], decoder: decodeString },
    { key: "decimals", method: "eth_call", params: [{ to: tokenAddr, data: SELECTORS.decimals }, "latest"], decoder: decodeUint },
    { key: "totalSupply", method: "eth_call", params: [{ to: tokenAddr, data: SELECTORS.totalSupply }, "latest"], decoder: decodeUint },
    { key: "owner", method: "eth_call", params: [{ to: tokenAddr, data: SELECTORS.owner }, "latest"], decoder: decodeAddress },
  ]

  // If wallet is provided, also read its balance
  if (wallet) {
    const w = wallet.startsWith("0x") ? wallet.toLowerCase() : "0x" + wallet.toLowerCase()
    const balanceData = SELECTORS.balanceOf + "000000000000000000000000" + w.slice(2)
    readFields.push({ key: "walletBalance", method: "eth_call", params: [{ to: tokenAddr, data: balanceData }, "latest"], decoder: decodeUint })
  }

  const data = {
    ok: true,
    deployed: true,
    address: tokenAddr,
    chain: "base",
    explorer: `https://basescan.org/token/${tokenAddr}`,
    timestamp: new Date().toISOString(),
  }

  const failures = []
  for (const field of readFields) {
    const { result, error } = await rpcCallAny(field.method, field.params)
    if (result === null) {
      failures.push(field.key)
      // For optional fields, leave undefined rather than fabricating
      // For required fields, we still continue — partial data is better than none
      // and the caller can check `failures` to know what's missing.
      continue
    }
    const decoded = field.decoder(result)
    if (decoded !== null && decoded !== undefined) {
      data[field.key] = decoded
    }
  }

  // Format totalSupply as string for display
  if (data.totalSupply !== undefined && data.decimals !== undefined) {
    data.totalSupplyFormatted = formatUnits(data.totalSupply, data.decimals)
  } else if (data.totalSupply !== undefined) {
    data.totalSupplyFormatted = String(data.totalSupply)
  }

  // Format walletBalance
  if (data.walletBalance !== undefined && data.decimals !== undefined) {
    data.walletBalanceFormatted = formatUnits(data.walletBalance, data.decimals)
  } else if (data.walletBalance !== undefined) {
    data.walletBalanceFormatted = String(data.walletBalance)
  }

  // Convert BigInts to strings for JSON serialization
  if (data.totalSupply !== undefined) data.totalSupply = data.totalSupply.toString()
  if (data.walletBalance !== undefined) data.walletBalance = data.walletBalance.toString()
  if (data.decimals !== undefined) data.decimals = Number(data.decimals)

  if (failures.length > 0) {
    data.partial = true
    data.failedFields = failures
  }

  return j(data, 200)
}
