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

// ── ENS Resolution ────────────────────────────────────────────────────────────

// Web Crypto API (works in Cloudflare Workers — require("crypto") does NOT)
async function sha3_256(data) {
  const hashBuf = await crypto.subtle.digest("SHA-256", data)
  // Note: Web Crypto doesn't support SHA3-256 directly. ENS namehash
  // requires keccak-256, not SHA3-256. We implement keccak-256 manually
  // since Web Crypto only provides SHA-1, SHA-256, SHA-384, SHA-512.
  // For now, use a simplified approach: call the ENS resolver with the
  // raw namehash computed via keccak. Since we can't do keccak in Web Crypto,
  // we delegate ENS resolution to an external API.
  return new Uint8Array(hashBuf)
}

// ENS namehash requires keccak-256, which Web Crypto API does not support.
// Instead of computing namehash in-worker, we use the public ENS API
// (https://ensdata.net or direct RPC with pre-computed namehash).
// For name → address: use ethers-style resolution via public ENS RPC endpoint.
async function resolveENS(name) {
  if (name.startsWith("0x") && name.length === 42) return name.toLowerCase()
  if (!name.includes(".")) return null

  // Use Cloudflare's ENS resolver via public Ethereum RPC
  // eth_call to ENS resolver with addr(namehash) selector
  // Since we can't compute keccak256 in-worker, use an external ENS API
  try {
    const res = await fetch(`https://ensdata.net/api/resolve/${encodeURIComponent(name)}`, {
      headers: { "Accept": "application/json" },
    })
    if (res.ok) {
      const data = await res.json()
      if (data.address) return data.address.toLowerCase()
    }
  } catch {}

  // Fallback: try public ENS resolver API
  try {
    const res = await fetch(`https://api.ensideas.com/resolve/${encodeURIComponent(name)}`)
    if (res.ok) {
      const data = await res.json()
      if (data.address) return data.address.toLowerCase()
    }
  } catch {}

  return null
}

// Old resolveENS removed — replaced by the API-based version above

async function lookupENS(address) {
  // Use public ENS API for reverse lookup (address → name)
  // Direct RPC requires keccak-256 which Web Crypto doesn't support
  try {
    const res = await fetch(`https://api.ensideas.com/lookup/${address}`)
    if (res.ok) {
      const data = await res.json()
      if (data.name) return data.name
    }
  } catch {}

  // Fallback: enstable API
  try {
    const res = await fetch(`https://ensdata.net/api/lookup/${address}`)
    if (res.ok) {
      const data = await res.json()
      if (data.name) return data.name
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
  let allowedOrigin = "https://supercompute.io"
  if (reqOrigin) {
    try {
      const host = new URL(reqOrigin).hostname
      const allowed = host === "supercompute.io" || host === "supercompute.pages.dev" || host === "localhost" || host === "127.0.0.1" || host.endsWith(".pages.dev") || host.endsWith(".cloudflarestaging.com") || host.endsWith(".ngrok-free.app")
      if (allowed) allowedOrigin = reqOrigin
    } catch {}
  }

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

    // Resolve token symbol to contract address
    const TOKEN_MAP = {
      "QUANTA": env?.QUANTA_TOKEN || "0x5ACDC563450cC35055d7344287C327fafB2b371A",
      "$QUANTA": env?.QUANTA_TOKEN || "0x5ACDC563450cC35055d7344287C327fafB2b371A",
      "SCOM": env?.SCOM_TOKEN || env?.QUANTA_TOKEN || "0x5ACDC563450cC35055d7344287C327fafB2b371A",
      "$SCOM": env?.SCOM_TOKEN || env?.QUANTA_TOKEN || "0x5ACDC563450cC35055d7344287C327fafB2b371A",
    }
    let tokenAddr = token
    if (!token.startsWith("0x")) {
      tokenAddr = TOKEN_MAP[token.toUpperCase()] || TOKEN_MAP[token] || token
    }

    const [balance, decimals, symbol] = await Promise.all([
      erc20Balance(tokenAddr, wallet),
      erc20Decimals(tokenAddr),
      erc20Symbol(tokenAddr),
    ])
    return j({ balance: formatUnits(balance, decimals), decimals, symbol })
  }

  if (method === "POST" && path === "/gate") {
    const body = await request.json().catch(() => ({}))
    const { wallet, requirements } = body
    if (!wallet || !requirements) return j({ error: "wallet and requirements required" }, 400)

    // Resolve token symbols to contract addresses via env vars
    const TOKEN_MAP = {
      "QUANTA": env?.QUANTA_TOKEN || "0x5ACDC563450cC35055d7344287C327fafB2b371A",
      "$QUANTA": env?.QUANTA_TOKEN || "0x5ACDC563450cC35055d7344287C327fafB2b371A",
      "SCOM": env?.SCOM_TOKEN || env?.QUANTA_TOKEN || "0x5ACDC563450cC35055d7344287C327fafB2b371A",
      "$SCOM": env?.SCOM_TOKEN || env?.QUANTA_TOKEN || "0x5ACDC563450cC35055d7344287C327fafB2b371A",
    }

    const results = await Promise.all(
      requirements.map(async (req) => {
        let tokenAddr = req.token
        // If token is a symbol (not 0x...), resolve from map
        if (tokenAddr && !tokenAddr.startsWith("0x")) {
          tokenAddr = TOKEN_MAP[tokenAddr.toUpperCase()] || TOKEN_MAP[tokenAddr] || tokenAddr
        }
        if (tokenAddr && req.minBalance) return checkTokenGate(wallet, tokenAddr, req.minBalance)
        if (req.ens) return checkEnsGate(wallet, req.ens)
        return { label: "unknown", passed: false }
      }),
    )
    return j({ passed: results.every(r => r.passed), gates: results })
  }

  if (method === "GET" && path === "/profile") {
    const wallet = url.searchParams.get("wallet")
    if (!wallet) return j({ error: "wallet required" }, 400)

    const quantaToken = env?.QUANTA_TOKEN || "0x5ACDC563450cC35055d7344287C327fafB2b371A"
    const [ens, balanceResult] = await Promise.all([
      lookupENS(wallet),
      (async () => {
        try {
          const [bal, dec, sym] = await Promise.all([
            erc20Balance(quantaToken, wallet),
            erc20Decimals(quantaToken),
            erc20Symbol(quantaToken),
          ])
          // If symbol is UNK, token is not deployed yet — return pre-TGE state
          if (sym === "UNK" && bal === "0") {
            return { balance: "0", symbol: "QUANTA", deployed: false }
          }
          return { balance: formatUnits(bal, dec), symbol: sym, deployed: true }
        } catch {
          return { balance: "0", symbol: "QUANTA", deployed: false }
        }
      })(),
    ])

    return j({ ens, ...balanceResult })
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
      "GET /api/web3/balance": "ERC20 token balance (accepts symbol or address)",
      "POST /api/web3/gate": "Check token/ENS gating (accepts symbol or address)",
      "GET /api/web3/profile": "Wallet profile — ENS name + QUANTA balance",
      "GET /api/web3/staking": "Staking pool stats",
      "GET /api/web3/staking/position": "User staking position",
      "GET /api/web3/swap/quote": "Swap quote from DEX",
    },
  })
}
