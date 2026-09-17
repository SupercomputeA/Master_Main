// functions/api/token.js — $QUANTA token data from Base Chain
// Uses multicall3 to batch all ERC-20 reads into a single RPC request.
// Multicall3 on Base: 0xcA11bde05977b3631167028862bE2a173976CA11

const RPC_ENDPOINTS = [
  "https://base.llamarpc.com",
  "https://base.public.blastapi.io",
  "https://1rpc.io/base",
  "https://mainnet.base.org",
]

const MULTICALL3 = "0xcA11bde05977b3631167028862bE2a173976CA11"
const QUANTA_TOKEN = "0x5ACDC563450cC35055d7344287C327fafB2b371A"

const SELECTORS = {
  name: "0x06fdde03",
  symbol: "0x95d89b41",
  decimals: "0x313ce567",
  totalSupply: "0x18160ddd",
  owner: "0x8da5cb5b",
  balanceOf: "0x70a08231",
}

// Encode a single eth_call to multicall3.aggregate3
// aggregate3(bool requireSuccess, Call[] calls)
// Call = (address target, bytes callData)
function encodeMulticall(calls) {
  // selector
  let hex = "0x82ad56cb"
  // requireSuccess = true (1)
  hex += "0000000000000000000000000000000000000000000000000000000000000001"
  // offset to calls array (0x60 = 96 bytes from start = after selector + 2 words)
  hex += "0000000000000000000000000000000000000000000000000000000000000060"
  // array length
  hex += calls.length.toString(16).padStart(64, "0")

  // For each call, encode (address, bytes)
  // Each Call struct = 2 dynamic-ish fields:
  //   word 0: target (address, left-padded to 32)
  //   word 1: offset to callData (relative to start of this struct)
  //   word 2: callData length
  //   word 3+: callData (padded to 32)
  //
  // But the offset is relative to the start of the struct's data area.
  // For a (address, bytes) tuple:
  //   offset = 0x40 (64 bytes) — points past the two fixed words
  // So each struct is:
  //   [target][0x40][len][data...]

  let allStructs = ""
  for (let i = 0; i < calls.length; i++) {
    const target = calls[i].target.toLowerCase().slice(2).padStart(64, "0")
    const cd = calls[i].data.slice(2)
    // Offset to bytes data: 0x40 (2 words after target+offset)
    allStructs += target
    allStructs += "0000000000000000000000000000000000000000000000000000000000000040"
    // Length of callData
    allStructs += (cd.length / 2).toString(16).padStart(64, "0")
    // callData padded to 32-byte boundary
    const paddedCd = cd.padEnd(Math.ceil(cd.length / 64) * 64, "0")
    allStructs += paddedCd
  }

  hex += allStructs
  return hex
}

// Decode multicall3 aggregate3 return: (bool[] success, bytes[] returnData)
function decodeMulticallResult(hexResult) {
  if (!hexResult || hexResult === "0x") return []
  const hex = hexResult.slice(2)

  // First word: offset to success array
  const successOffset = parseInt(hex.slice(0, 64), 16) * 2
  // success array length
  const successLen = parseInt(hex.slice(successOffset, successOffset + 64), 16)
  // success array values (each 1 bool, padded to 32)
  const successes = []
  for (let i = 0; i < successLen; i++) {
    const s = parseInt(hex.slice(successOffset + 64 + i * 64, successOffset + 64 + i * 64 + 64), 16)
    successes.push(s === 1)
  }

  // Second word: offset to returnData array
  const returnDataOffset = parseInt(hex.slice(64, 128), 16) * 2
  // returnData array length
  const returnDataLen = parseInt(hex.slice(returnDataOffset, returnDataOffset + 64), 16)

  const returnDatas = []
  let pos = returnDataOffset + 64
  for (let i = 0; i < returnDataLen; i++) {
    // Offset to this bytes element (relative to start of returnData array)
    const elemOffset = parseInt(hex.slice(pos, pos + 64), 16) * 2
    const dataStart = returnDataOffset + elemOffset + 64 // skip offset to length
    const dataLen = parseInt(hex.slice(dataStart, dataStart + 64), 16) * 2
    const data = "0x" + hex.slice(dataStart + 64, dataStart + 64 + dataLen)
    returnDatas.push(data)
    pos += 64 // move to next offset
  }

  return returnDatas
}

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

async function rpcCallAny(method, params) {
  for (const rpc of RPC_ENDPOINTS) {
    const result = await rpcCall(rpc, method, params)
    if (result !== null) return result
  }
  return null
}

function decodeString(hexResult) {
  if (!hexResult || hexResult === "0x") return ""
  const hex = hexResult.slice(2)
  if (hex.length < 128) {
    // Some tokens use non-standard encoding (short strings in single slot)
    // Try to decode as packed string
    if (hex.length >= 64) {
      // If the first word is small, it might be a string stored directly
      const len = parseInt(hex.slice(0, 64), 16)
      if (len > 0 && len < 32 && hex.length >= 64 + len * 2) {
        try {
          return new TextDecoder().decode(
            new Uint8Array(hex.slice(64, 64 + len * 2).match(/.{2}/g).map(b => parseInt(b, 16)))
          )
        } catch {}
      }
    }
    return ""
  }
  const strLen = parseInt(hex.slice(64, 128), 16)
  const strHex = hex.slice(128, 128 + strLen * 2)
  try {
    return new TextDecoder().decode(
      new Uint8Array(strHex.match(/.{2}/g).map(b => parseInt(b, 16)))
    )
  } catch {
    return ""
  }
}

function decodeUint(hexResult) {
  if (!hexResult || hexResult === "0x") return 0
  return Number(BigInt(hexResult))
}

function decodeAddress(hexResult) {
  if (!hexResult || hexResult === "0x" || hexResult.length < 42) return null
  return "0x" + hexResult.slice(-40)
}

function formatUnits(value, decimals) {
  if (!value || value === "0") return "0"
  const v = BigInt(value)
  const divisor = BigInt(10) ** BigInt(decimals)
  const intPart = v / divisor
  const fracPart = v % divisor
  const fracStr = fracPart.toString().padStart(decimals, "0").slice(0, 6)
  return `${intPart}.${fracStr}`
}

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

  const tokenAddr = env?.QUANTA_TOKEN || QUANTA_TOKEN
  const wallet = url.searchParams.get("wallet")

  // Build multicall calls array
  const calls = [
    { target: tokenAddr, data: SELECTORS.name },
    { target: tokenAddr, data: SELECTORS.symbol },
    { target: tokenAddr, data: SELECTORS.decimals },
    { target: tokenAddr, data: SELECTORS.totalSupply },
    { target: tokenAddr, data: SELECTORS.owner },
  ]

  if (wallet) {
    const balanceData = SELECTORS.balanceOf + "000000000000000000000000" + wallet.slice(2).toLowerCase()
    calls.push({ target: tokenAddr, data: balanceData })
  }

  // Single multicall3 request — one RPC round-trip
  const mcData = encodeMulticall(calls)
  const mcResult = await rpcCallAny("eth_call", [{ to: MULTICALL3, data: mcData }, "latest"])

  // Also get code in a separate call (can't easily multicall eth_getCode)
  const codeRaw = await rpcCallAny("eth_getCode", [tokenAddr, "latest"])

  const deployed = codeRaw && codeRaw !== "0x" && codeRaw.length > 4

  // Parse multicall results
  let name = ""
  let symbol = ""
  let decimals = 18
  let totalSupply = 0
  let owner = null
  let walletBalance = null

  if (mcResult) {
    const results = decodeMulticallResult(mcResult)
    if (results.length >= 5) {
      name = decodeString(results[0]) || "Quanta Sovereigna"
      symbol = decodeString(results[1]) || "QUANTA"
      decimals = decodeUint(results[2]) || 18
      totalSupply = decodeUint(results[3])
      owner = decodeAddress(results[4])
      if (wallet && results.length >= 6) {
        walletBalance = decodeUint(results[5])
      }
    }
  }

  // Fallback to hardcoded name/symbol if RPC failed
  if (!name) name = "Quanta Sovereigna"
  if (!symbol) symbol = "QUANTA"

  const data = {
    address: tokenAddr,
    deployed,
    chain: "base",
    name,
    symbol,
    decimals,
    totalSupply,
    totalSupplyFormatted: totalSupply ? formatUnits(String(totalSupply), decimals) : "0",
    owner,
    explorer: `https://basescan.org/token/${tokenAddr}`,
    timestamp: new Date().toISOString(),
  }

  if (wallet) {
    data.walletBalance = walletBalance || 0
    data.walletBalanceFormatted = formatUnits(String(walletBalance || 0), decimals)
  }

  return j(data)
}
