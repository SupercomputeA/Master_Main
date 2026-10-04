// components/tradedesk/lib/chain.ts
//
// Robinhood Chain (Arbitrum L2) definitions for viem/wagmi. Mirrors the
// fleet's stack: viem 2.x chain objects, ETH gas token, EVM-compatible.
//
// Sources (live-checked before scaffold, 2026-08-05):
//   - chainlist.org / chainlist pending entry 4663
//   - https://rpc.mainnet.chain.robinhood.com (public RPC, no key)
//
// Do not hard-code Alchemy URLs here — those are environment-bound and must
// be supplied by the host site (supercompute.io) at runtime. The public RPC
// fallback lives in `types.ts` as required.

import { defineChain } from "viem"

/** Robinhood Chain mainnet — Arbitrum L2, chain id 4663, ETH gas. */
export const robinhoodChain = defineChain({
  id: 4663,
  name: "Robinhood Chain",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.mainnet.chain.robinhood.com"] },
    public: { http: ["https://rpc.mainnet.chain.robinhood.com"] },
  },
  blockExplorers: {
    default: {
      name: "Robinhood Explorer",
      url: "https://explorer.chain.robinhood.com",
    },
  },
  testnet: false,
})

/** Robinhood Chain testnet — chain id 46630. */
export const robinhoodTestnet = defineChain({
  id: 46630,
  name: "Robinhood Chain Testnet",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.testnet.chain.robinhood.com"] },
    public: { http: ["https://rpc.testnet.chain.robinhood.com"] },
  },
  blockExplorers: {
    default: {
      name: "Robinhood Testnet Explorer",
      url: "https://explorer.testnet.chain.robinhood.com",
    },
  },
  testnet: true,
})

/** True when the given chainId is the Robinhood Chain mainnet. */
export function isRobinhoodMainnet(chainId: number | undefined): boolean {
  return chainId === 4663
}

/** True when the given chainId is any flavor of Robinhood Chain. */
export function isRobinhoodChain(chainId: number | undefined): boolean {
  return chainId === 4663 || chainId === 46630
}

/** Human-readable label for the chain, used by the chain-status row. */
export function describeChain(chainId: number | undefined): string {
  switch (chainId) {
    case 4663:
      return "Robinhood Chain (Arbitrum L2, mainnet)"
    case 46630:
      return "Robinhood Chain Testnet"
    default:
      return `Unknown chain (${chainId ?? "—"})`
  }
}