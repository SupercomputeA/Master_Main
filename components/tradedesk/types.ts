// components/tradedesk/types.ts
//
// Public type surface for the TradeDesk component. Anything not re-exported
// from `index.ts` is package-internal.
//
// HARD RULES (charter 2026-08-05):
//   1. No live swaps, no live writes, no live bridge txns from this surface.
//      Read-only + simulated UI is the only shipping shape. Live write paths
//      require explicit user sign-off on the tradedesk profile AND a Security
//      review per task t_117ac6c6.
//   2. Stock Tokens are NOT available in the US. The jurisdictional banner
//      must remain visible on every public surface that quotes tokenized
//      equities.
//   3. Do not fabricate chain data. If Alchemy / Chainlink RPCs are not
//      configured, render the empty/connect state — never invent balances
//      or quotes.
//   4. The component is consumed by supercompute.io at `/tradedesk` via the
//      website repo's project/tradedesk-page mount. This package MUST NOT
//      duplicate website shell / layout / nav.

/** Robinhood Chain mainnet (Arbitrum L2, chain id 4663). */
export const ROBINHOOD_CHAIN_ID = 4663 as const

/** Robinhood Chain testnet (chain id 46630). */
export const ROBINHOOD_TESTNET_CHAIN_ID = 46630 as const

/** Native gas token on Robinhood Chain (Arbitrum L2). */
export type RobinhoodGasToken = "ETH"

/** Public RPC endpoints surfaced to the component. */
export type RobinhoodRpcEndpoints = {
  /** Alchemy mainnet (recommended; falls back to public RPC if unset). */
  alchemyMainnet?: string
  /** Public mainnet fallback (no key required). */
  publicMainnet: string
  /** Alchemy testnet (recommended; falls back to public testnet if unset). */
  alchemyTestnet?: string
  /** Public testnet fallback (no key required). */
  publicTestnet: string
}

/** Operating posture for the public surface — read-only by default. */
export type TradeDeskMode = "read-only" | "simulated" | "live"

/**
 * Trading surface flags. Anything beyond `equities-info` is gated behind
 * user sign-off + Security review per Hard Rule #1.
 */
export type TradeDeskCapabilities = {
  /** Show RWA / Stock Token informational rows. Always allowed. */
  equitiesInfo: boolean
  /** Show simulated-only swap interface (no signing). Default false until approved. */
  simulatedSwap: boolean
  /** Live wallet reads (balance, holdings). Default true. */
  liveReads: boolean
  /** Live write paths. NEVER true without explicit approval + Security gate. */
  liveWrites: boolean
}

/** Jurisdictional availability for a given surface. */
export type TradeDeskJurisdiction =
  | "global"
  | "us-restricted"
  | "us-allowed"
  | "eu-allowed"

/** A single informational row in the Stock Tokens list. */
export type StockTokenInfo = {
  /** Ticker symbol, uppercase. */
  symbol: string
  /** Display name. */
  name: string
  /** Underlying issuer / chain of custody. */
  issuer: string
  /** Current price in USD, or null when the oracle is not configured. */
  priceUsd: number | null
  /** 24h change as a fraction (0.0125 == +1.25%). Null when unavailable. */
  change24h: number | null
  /** Whether this token is offered in the user's jurisdiction. */
  jurisdiction: TradeDeskJurisdiction
}

/** Connection-state hint for the wallet panel. */
export type TradeDeskConnectionState =
  | { status: "disconnected" }
  | { status: "connecting" }
  | { status: "wrong-network"; currentChainId: number }
  | { status: "connected"; address: `0x${string}`; chainId: number }
  | { status: "error"; message: string }

export type TradeDeskProps = {
  /** Operating posture. Defaults to `"read-only"`. */
  mode?: TradeDeskMode
  /** Capability flags. Defaults to a safe read-only shape. */
  capabilities?: Partial<TradeDeskCapabilities>
  /** RPC endpoints. Alchemy keys are read from the host site; the public fallbacks are required. */
  rpc?: Partial<RobinhoodRpcEndpoints>
  /** Stock Token informational rows. Empty array is fine — the component renders an empty state. */
  stockTokens?: StockTokenInfo[]
  /** Override the page title. */
  title?: string
}