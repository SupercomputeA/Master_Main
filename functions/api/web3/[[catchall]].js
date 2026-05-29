// functions/api/web3.js — Web3 API (ENS, Balances, Staking, Swap)
// Cloudflare Pages Function with direct RPC calls

const ETH_RPC = "https://ethereum.publicnode.com"
const BASE_RPC = "https://mainnet.base.org"

const ENS_RESOLVER = "0x231b0ee14048e9dccd1d247744d114a4eb5e8e63"
const ADDR_SELECTOR = "3b3b57de"

function hexToBytes(hex) {
  const h = hex.replace("0x", "")
  return new Uint8Array(h.length / 2).map((_, i) => parseInt(h.substr(i * 2, 2), 16))
}

function bytesToHex(bytes) {
  return Array.from(bytes).map(b => b.toString(16).padStart(2, "0")).join("")
}

async function rpcCall(rpcUrl, method, params) {
  const res = await fetch(rpcUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", method, params, id: 1 }),
  })
  const json = await res.json()
  return json.result
}

// ── ENS Resolution ────────────────────────────────────────────────────────────

function namehashEncode(name) {
  const crypto = require("crypto")
  const labels = name.split(".").filter(Boolean)
  let node = new Uint8Array(32)
  for (let i = labels.length - 1; i >= 0; i--) {
    const labelBytes = new TextEncoder().encode(labels[i])
    const data = new Uint8Array(32 + 1 + labelBytes.length)
    data.set(node, 0)
    data[32] = labelBytes.length
    data.set(labelBytes, 33)
    const hash = crypto.createHash("sha3-256").update(Buffer.from(data)).digest()
    node = new Uint8Array(hash)
  }
  return bytesToHex(node)
}

async function resolveENS(name) {
  if (name.startsWith("0x") && name.length === 42) return name.toLowerCase()
  if (!name.includes(".")) return null
  const nh = namehashEncode(name)
  const data = ADDR_SELECTOR + nh
  try {
    const result = await rpcCall(ETH_RPC, "eth_call", [{ to: ENS_RESOLVER, data }, "latest"])
    if (result && result !== "0x" && result.length === 66) {
      return "0x" + result.slice(-40)
    }
  } catch {}
  return null
}

async function lookupENS(address) {
  const REGISTRY = "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e"
  try {
    const resolverData = "0178b8bf" + "0000000000000000000000000000000000000000000000000000000000000000"
    const resolverRes = await rpcCall(ETH_RPC, "eth_call", [{ to: REGISTRY, data: resolverData }, "latest"])
    if (!resolverRes || resolverRes === "0x") return null
    const resolverAddr = "0x" + resolverRes.slice(-40)
    const nameData = "691f3431" + "000000000000000000000000" + address.slice(2).toLowerCase()
    const nameRes = await rpcCall(ETH_RPC, "eth_call", [{ to: resolverAddr, data: nameData }, "latest"])
    if (nameRes && nameRes !== "0x") {
      const hexStr = nameRes.slice(2)
      const chars = []
      for (let i = 0; i < hexStr.length; i += 2) {
        const code = parseInt(hexStr.substr(i, 2), 16)
        if (code === 0) break
        chars.push(String.fromCharCode(code))
      }
      const name = chars.join("")
      if (name.includes(".")) return name
    }
  } catch {}
  return null
}

// ── Balance ───────────────────────────────────────────────────────────────────

async function erc20Balance(token, wallet) {
  const data = "70a08231" + "000000000000000000000000" + wallet.slice(2).toLowerCase()
  const result = await rpcCall(BASE_RPC, "eth_call", [{ to: token.toLowerCase(), data }, "latest"])
  if (!result || result === "0x") return "0"
  return String(BigInt(result))
}

async function erc20Decimals(token) {
  const data = "313ce567"
  const result = await rpcCall(BASE_RPC, "eth_call", [{ to: token.toLowerCase(), data }, "latest"])
  return result ? Number(BigInt(result)) : 18
}

async function erc20Symbol(token) {
  const data = "95d89b41"
  const result = await rpcCall(BASE_RPC, "eth_call", [{ to: token.toLowerCase(), data }, "latest"])
  if (!result || result === "0x") return "UNK"
  const hex = result.slice(2).replace(/00+$/, "")
  try {
    return new TextDecoder().decode(hexToBytes(hex))
  } catch {
    return "UNK"
  }
}

function formatUnits(value, decimals) {
  const v = BigInt(value)
  const divisor = BigInt(10) ** BigInt(decimals)
  const intPart = v / divisor
  const fracPart = v % divisor
  const fracStr = fracPart.toString().padStart(decimals, "0").slice(0, 6)
  return `${intPart}.${fracStr}`
}

// ── Token Gating ──────────────────────────────────────────────────────────────

async function checkTokenGate(wallet, token, minBalance) {
  const balance = await erc20Balance(token, wallet)
  const decimals = await erc20Decimals(token)
  const symbol = await erc20Symbol(token)
  const passed = BigInt(balance) >= BigInt(minBalance)
  return { label: `${symbol} ≥ ${formatUnits(minBalance, decimals)}`, passed }
}

async function checkEnsGate(wallet, ens) {
  const resolved = await resolveENS(ens)
  const passed = resolved?.toLowerCase() === wallet.toLowerCase()
  return { label: `ENS: ${ens}`, passed }
}

// ── Staking ───────────────────────────────────────────────────────────────────

async function getStakingStats(env) {
  const stakingAddr = env?.SCOM_STAKING ?? "0x0000000000000000000000000000000000000000"
  if (stakingAddr === "0x0000000000000000000000000000000000000000") {
    return { apy: 0, tvl: 0, stakers: 0, rewardsDistributed: 0 }
  }
  try {
    const [totalStaked, rewardRate, stakers, totalDistributed] = await Promise.all([
      rpcCall(BASE_RPC, "eth_call", [{ to: stakingAddr, data: "817b1cd2" }, "latest"]),
      rpcCall(BASE_RPC, "eth_call", [{ to: stakingAddr, data: "7b0a47ee" }, "latest"]),
      rpcCall(BASE_RPC, "eth_call", [{ to: stakingAddr, data: "b0af3080" }, "latest"]),
      rpcCall(BASE_RPC, "eth_call", [{ to: stakingAddr, data: "e8d4e4c2" }, "latest"]),
    ])

    const total = totalStaked ? Number(BigInt(totalStaked)) / 1e18 : 0
    const rate = rewardRate ? Number(BigInt(rewardRate)) / 1e18 : 0
    const yearlyRewards = rate * 365 * 86400
    const apy = total > 0 ? (yearlyRewards / total) * 100 : 0

    return {
      apy: Math.round(apy * 100) / 100,
      tvl: total,
      stakers: stakers ? Number(BigInt(stakers)) : 0,
      rewardsDistributed: totalDistributed ? Number(BigInt(totalDistributed)) / 1e18 : 0,
    }
  } catch {
    return { apy: 12.0, tvl: 0, stakers: 0, rewardsDistributed: 0 }
  }
}

async function getStakingPosition(wallet, env) {
  const stakingAddr = env?.SCOM_STAKING ?? "0x0000000000000000000000000000000000000000"
  if (stakingAddr === "0x0000000000000000000000000000000000000000") {
    return { stakedAmount: "0", pendingRewards: "0", lastClaim: null }
  }
  try {
    const balanceData = "70a08231" + "000000000000000000000000" + wallet.slice(2).toLowerCase()
    const [staked, rewards] = await Promise.all([
      rpcCall(BASE_RPC, "eth_call", [{ to: stakingAddr, data: balanceData }, "latest"]),
      rpcCall(BASE_RPC, "eth_call", [{ to: stakingAddr, data: "e8d4e4c2" + "000000000000000000000000" + wallet.slice(2).toLowerCase() }, "latest"]),
    ])
    return {
      stakedAmount: staked ? formatUnits(staked, 18) : "0",
      pendingRewards: rewards ? formatUnits(rewards, 18) : "0",
      lastClaim: null,
    }
  } catch {
    return { stakedAmount: "0", pendingRewards: "0", lastClaim: null }
  }
}

// ── Swap Quote ────────────────────────────────────────────────────────────────

async function getSwapQuote(fromToken, toToken, amount, env) {
  const QUOTER = env?.UNISWAP_QUOTER ?? "0x0000000000000000000000000000000000000000"
  if (QUOTER === "0x0000000000000000000000000000000000000000") {
    const decimals = await erc20Decimals(fromToken)
    const amountWei = BigInt(Math.floor(Number(amount) * (10 ** decimals)))
    const rawQuote = amountWei * BigInt(98) / BigInt(100)
    return {
      fromAmount: amount,
      toAmount: formatUnits(rawQuote.toString(), 18),
      price: "~simulated",
      route: `${fromToken.slice(0, 6)} → ${toToken.slice(0, 6)} (Base)`,
    }
  }
  try {
    const quoteData = "cdca1753" + fromToken.slice(2).toLowerCase() + toToken.slice(2).toLowerCase() + "0000000000000000000000000000000000000000000000000000000000000001"
    const result = await rpcCall(BASE_RPC, "eth_call", [{ to: QUOTER, data: quoteData }, "latest"])
    if (!result || result === "0x") return null
    return {
      fromAmount: amount,
      toAmount: formatUnits(result, 18),
      price: "—",
      route: "Uniswap V4 (Base)",
    }
  } catch {
    return null
  }
}

function json(data, status = 200, origin = "https://supercompute.io") {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": origin },
  })
}

// ── Main Handler ──────────────────────────────────────────────────────────────

export async function onRequest({ request, env }) {
  const url = new URL(request.url)
  const path = url.pathname.replace("/api/web3", "") || "/"
  const method = request.method
  const reqOrigin = request.headers.get("Origin") || ""
  const allowedOrigin = (!reqOrigin || reqOrigin.includes("supercompute.io") || reqOrigin.includes("localhost") || reqOrigin.includes("127.0.0.1") || reqOrigin.includes("pages.dev"))
    ? reqOrigin
    : "https://supercompute.io"

  if (method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": allowedOrigin,
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    })
  }

  const j = (data, status = 200) => json(data, status, allowedOrigin)

  if (method === "GET" && path === "/resolve") {
    const name = url.searchParams.get("name")
    if (!name) return j({ error: "name required" }, 400)
    const address = await resolveENS(name)
    return j({ address })
  }

  if (method === "GET" && path === "/lookup") {
    const address = url.searchParams.get("address")
    if (!address) return j({ error: "address required" }, 400)
    const ens = await lookupENS(address)
    return j({ ens })
  }

  if (method === "GET" && path === "/balance") {
    const token = url.searchParams.get("token")
    const wallet = url.searchParams.get("wallet")
    if (!token || !wallet) return j({ error: "token and wallet required" }, 400)
    const [balance, decimals, symbol] = await Promise.all([
      erc20Balance(token, wallet),
      erc20Decimals(token),
      erc20Symbol(token),
    ])
    return j({ balance: formatUnits(balance, decimals), decimals, symbol })
  }

  if (method === "POST" && path === "/gate") {
    const body = await request.json().catch(() => ({}))
    const { wallet, requirements } = body
    if (!wallet || !requirements) return j({ error: "wallet and requirements required" }, 400)
    const results = await Promise.all(
      requirements.map(async (req) => {
        if (req.token && req.minBalance) return checkTokenGate(wallet, req.token, req.minBalance)
        if (req.ens) return checkEnsGate(wallet, req.ens)
        return { label: "unknown", passed: false }
      }),
    )
    return j({ passed: results.every(r => r.passed), gates: results })
  }

  if (method === "GET" && path === "/staking") {
    const stats = await getStakingStats(env)
    return j(stats)
  }

  if (method === "GET" && path === "/staking/position") {
    const wallet = url.searchParams.get("wallet")
    if (!wallet) return j({ error: "wallet required" }, 400)
    const position = await getStakingPosition(wallet, env)
    return j(position)
  }

  if (method === "GET" && path === "/swap/quote") {
    const from = url.searchParams.get("from")
    const to = url.searchParams.get("to")
    const amount = url.searchParams.get("amount")
    if (!from || !to || !amount) return j({ error: "from, to, and amount required" }, 400)
    const quote = await getSwapQuote(from, to, amount, env)
    return j(quote)
  }

  return j({
    endpoints: {
      "GET /api/web3/resolve": "ENS name → address",
      "GET /api/web3/lookup": "address → ENS name",
      "GET /api/web3/balance": "ERC20 token balance",
      "POST /api/web3/gate": "Check token/ENS gating",
      "GET /api/web3/staking": "Staking pool stats",
      "GET /api/web3/staking/position": "User staking position",
      "GET /api/web3/swap/quote": "Swap quote from DEX",
    },
  })
}
