import { getAddress } from "viem"

const API = "/api/web3"

export async function resolveENS(name: string): Promise<string | null> {
  try {
    const res = await fetch(`${API}/resolve?name=${encodeURIComponent(name)}`)
    const data = await res.json() as { address?: string }
    return data.address ?? null
  } catch {
    return null
  }
}

export async function lookupAddress(address: string): Promise<string | null> {
  try {
    const res = await fetch(`${API}/lookup?address=${encodeURIComponent(address)}`)
    const data = await res.json() as { ens?: string }
    return data.ens ?? null
  } catch {
    return null
  }
}

export async function getTokenBalance(
  tokenAddress: string,
  walletAddress: string,
): Promise<{ balance: string; decimals: number; symbol: string } | null> {
  try {
    const res = await fetch(
      `${API}/balance?token=${encodeURIComponent(tokenAddress)}&wallet=${encodeURIComponent(walletAddress)}`,
    )
    return await res.json() as { balance: string; decimals: number; symbol: string }
  } catch {
    return null
  }
}

export async function checkGate(
  walletAddress: string,
  requirements: { token?: string; minBalance?: string; ens?: string }[],
): Promise<{ passed: boolean; gates: { label: string; passed: boolean }[] }> {
  try {
    const res = await fetch(`${API}/gate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wallet: walletAddress, requirements }),
    })
    return await res.json() as { passed: boolean; gates: { label: string; passed: boolean }[] }
  } catch {
    return { passed: false, gates: [] }
  }
}

export async function getWalletProfile(
  walletAddress: string,
): Promise<{ ens: string | null; balance: string; symbol: string }> {
  try {
    const res = await fetch(`${API}/profile?wallet=${encodeURIComponent(walletAddress)}`)
    const data = await res.json() as { ens?: string; balance?: string; symbol?: string }
    return {
      ens: data.ens ?? null,
      balance: data.balance ?? "0",
      symbol: data.symbol ?? "QUANTA",
    }
  } catch {
    return { ens: null, balance: "0", symbol: "QUANTA" }
  }
}

export async function getStakingStats(): Promise<{
  apy: number
  tvl: number
  stakers: number
  rewardsDistributed: number
}> {
  try {
    const res = await fetch(`${API}/staking`)
    return await res.json()
  } catch {
    return { apy: 0, tvl: 0, stakers: 0, rewardsDistributed: 0 }
  }
}

export async function getStakingPosition(
  walletAddress: string,
): Promise<{ stakedAmount: string; pendingRewards: string; lastClaim: string | null }> {
  try {
    const res = await fetch(`${API}/staking/position?wallet=${encodeURIComponent(walletAddress)}`)
    return await res.json()
  } catch {
    return { stakedAmount: "0", pendingRewards: "0", lastClaim: null }
  }
}

export async function getSwapQuote(
  fromToken: string,
  toToken: string,
  amount: string,
): Promise<{ fromAmount: string; toAmount: string; price: string; route: string } | null> {
  try {
    const res = await fetch(
      `${API}/swap/quote?from=${encodeURIComponent(fromToken)}&to=${encodeURIComponent(toToken)}&amount=${encodeURIComponent(amount)}`,
    )
    return await res.json()
  } catch {
    return null
  }
}

export function shortenAddress(address: string, chars = 4): string {
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`
}

export function isValidAddress(address: string): boolean {
  try {
    getAddress(address)
    return true
  } catch {
    return false
  }
}
