// components/tradedesk/index.ts — public API barrel
//
// Re-exports the TradeDesk component surface so the host site can do:
//
//   import TradeDesk, {
//     ROBINHOOD_CHAIN_ID,
//     ROBINHOOD_TESTNET_CHAIN_ID,
//     robinhoodChain,
//     robinhoodTestnet,
//     DEFAULT_CAPABILITIES,
//     resolveCapabilities,
//     isRobinhoodChain,
//     isRobinhoodMainnet,
//     describeChain,
//   } from '@supercompute/tradedesk'
//
// Anything not re-exported here is internal to the package.

export { default as TradeDesk, default } from "./TradeDesk"

export {
  ROBINHOOD_CHAIN_ID,
  ROBINHOOD_TESTNET_CHAIN_ID,
  type RobinhoodGasToken,
  type RobinhoodRpcEndpoints,
  type TradeDeskMode,
  type TradeDeskCapabilities,
  type TradeDeskJurisdiction,
  type TradeDeskConnectionState,
  type TradeDeskProps,
  type StockTokenInfo,
} from "./types"

export {
  robinhoodChain,
  robinhoodTestnet,
  isRobinhoodMainnet,
  isRobinhoodChain,
  describeChain,
} from "./lib/chain"

export { DEFAULT_CAPABILITIES, resolveCapabilities } from "./lib/capabilities"

// Chain read path: the single decision point for the upstream RPC URL.
// See the module header for why a keyless Alchemy base must never be used
// as a request-ready endpoint (HTTP 401).
export {
  ROBINHOOD_MAINNET_CHAIN_ID,
  ROBINHOOD_ALCHEMY_NETWORKS,
  RpcUpstreamUnconfiguredError,
  buildAlchemyEndpoint,
  describeRpcUpstream,
  isKeyedAlchemyUpstream,
  isKeylessAlchemyUrl,
  redactRpcUrl,
  resolveRobinhoodRpcUpstream,
  type ResolvedRpcUpstream,
  type RpcUpstreamEnv,
  type RpcUpstreamProvider,
  type RpcUpstreamReason,
} from "./lib/rpc-upstream"
