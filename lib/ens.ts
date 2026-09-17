// lib/ens.ts — ENS resolution client (server + browser safe)
//
// Provides:
//  - useENSName(address) / useENSAddress(name)        React hooks (wagmi-backed)
//  - formatAddress(address, ensName?)                  Display helper with ENS-first fallback
//  - resolveForward(name) / resolveReverse(address)    Server-side helpers (KV-cached)
//  - resolveAvatar(name|address)                       EIP-634 avatar text record
//  - ENS canonical handles (supercompute.eth, etc.)
//
// SSR / RSC note: ENS lookups are RPC-dependent and async. Always render
// formatAddress() on first paint, hydrate with the resolved ENS name once
// it arrives. Never render an ENS name before resolution.
import { useEnsName, useEnsAddress } from "wagmi"
import { mainnet } from "wagmi/chains"

// ────────────────────────────────────────────────────────────────────────────
// Constants
// ────────────────────────────────────────────────────────────────────────────

export const SUPERCOMPUTE_WALLET = "0x1a828cd220559479e2f761805da4ee722683323B" as const
export const SUPERCOMPUTE_ENS = "supercompute.eth" as const
export const ENS_RESOLVER_ENDPOINT = "/api/ens" as const
export const ENS_CACHE_TTL_SECONDS = 3600 as const
export const ENS_CACHE_PREFIX = "ens:v1" as const

// ────────────────────────────────────────────────────────────────────────────
// React hooks (browser-side, wagmi)
// ────────────────────────────────────────────────────────────────────────────

export function useENSName(address: string | undefined) {
  return useEnsName({
    address: address as `0x${string}` | undefined,
    // ENS lives on mainnet (chainId 1). Use the mainnet Universal Resolver
    // contract regardless of the wallet's connected chain (e.g. Base).
    chainId: mainnet.id,
  })
}

export function useENSAddress(name: string | undefined) {
  return useEnsAddress({
    name,
    chainId: mainnet.id,
  })
}

// ────────────────────────────────────────────────────────────────────────────
// Display helpers
// ────────────────────────────────────────────────────────────────────────────

/**
 * Render an address with ENS-first fallback. Always safe to call —
 * will never throw, never render a blank, and never show more
 * characters than the contract allows.
 */
export function formatAddress(address: string | null | undefined, ensName?: string | null): string {
  if (ensName && ensName.length > 0) return ensName
  if (!address) return ""
  if (address.endsWith(".eth")) return address
  // ENS-aware 0x fallback — first 6 + … + last 4 (e.g. 0x1a82…323B)
  if (address.startsWith("0x") && address.length === 42) {
    return `${address.slice(0, 6)}…${address.slice(-4)}`
  }
  return address
}

/**
 * True if the given address is the canonical supercompute.eth wallet.
 * Use this anywhere the UI hard-codes a project-wallet reference.
 */
export function isSupercomputeWallet(address: string | null | undefined): boolean {
  if (!address) return false
  return address.toLowerCase() === SUPERCOMPUTE_WALLET.toLowerCase()
}

/**
 * The canonical display handle for the project wallet — always
 * "supercompute.eth" when ENS is healthy, else the shortened 0x.
 */
export function formatSupercomputeWallet(ensName?: string | null): string {
  return formatAddress(SUPERCOMPUTE_WALLET, ensName ?? SUPERCOMPUTE_ENS)
}

// ────────────────────────────────────────────────────────────────────────────
// Server-side fetch helpers (Cloudflare Pages Functions / RSC)
//
// Backed by /api/ens/* which itself caches via KV. Always use these
// helpers on the server — never call public RPCs directly from a page.
// ────────────────────────────────────────────────────────────────────────────

export interface ENSResolveResult {
  name: string | null
  address: string | null
  avatar: string | null
  source: "cache" | "rpc" | "static" | "unknown"
}

async function fetchENS(action: string, payload: Record<string, string>): Promise<ENSResolveResult | null> {
  try {
    const url = action === "avatar"
      ? `${ENS_RESOLVER_ENDPOINT}/${action}?q=${encodeURIComponent(payload.q || "")}`
      : `${ENS_RESOLVER_ENDPOINT}/${action}`
    const res = await fetch(url, {
      method: action === "avatar" ? "GET" : "POST",
      headers: { "Content-Type": "application/json" },
      body: action === "avatar" ? undefined : JSON.stringify(payload),
    })
    if (!res.ok) return null
    return (await res.json()) as ENSResolveResult
  } catch {
    return null
  }
}

/**
 * Forward resolve: name → { address, avatar }
 * `name` should be a fully-qualified ENS name (e.g. "supercompute.eth").
 */
export async function resolveForward(name: string): Promise<ENSResolveResult | null> {
  if (!name) return null
  return fetchENS("resolve", { name })
}

/**
 * Reverse resolve: address → { name, avatar }
 * `address` must be a 0x-prefixed EVM address.
 */
export async function resolveReverse(address: string): Promise<ENSResolveResult | null> {
  if (!address) return null
  return fetchENS("reverse", { address })
}

/**
 * Avatar lookup (EIP-634) by either ENS name OR 0x address.
 */
export async function resolveAvatar(nameOrAddress: string): Promise<string | null> {
  if (!nameOrAddress) return null
  const result = await fetchENS("avatar", { q: nameOrAddress })
  return result?.avatar ?? null
}
