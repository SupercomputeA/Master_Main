import { http, createConfig } from "wagmi"
import { base, mainnet } from "wagmi/chains"
import { injected, coinbaseWallet } from "wagmi/connectors"

import { walletConnect } from "wagmi/connectors"

// Robinhood Chain (Arbitrum L2) — chain ID 4663 mainnet / 46630 testnet.
// ETH gas token. Canonical def mirrored from supercompute-tradedesk
// components/tradedesk/lib/chain.ts (verified 2026-08-05, live RPC 8/21).
export const robinhoodChain = {
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
      url: "https://robinhoodchain.blockscout.com",
    },
  },
  testnet: false,
} as const

export const robinhoodTestnet = {
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
} as const

// WalletConnect project ID from cloud.walletconnect.com (public client ID, not a secret)
const WC_PROJECT_ID = "195c4b15eafe2c2f160bd7c1512ba93a"

const connectors = [
  injected(),
  coinbaseWallet({ appName: "Supercompute" }),
  walletConnect({ projectId: WC_PROJECT_ID }),
]
// Browser RPC endpoints are a CSP trust boundary. Every host used here MUST also
// appear in `connect-src` in public/_headers, or the browser blocks the read.
//
// Do NOT use a bare http() for these. http() with no argument resolves to
// chain.rpcUrls.default.http[0] at request time, so the effective endpoint is a
// property of the viem chain data and can move on a dependency bump with no
// visible change in this repo. Pinning both chains explicitly keeps the
// transport <-> policy mapping static and reviewable.
//
// Host choice for mainnet (measured, 2026-09-11): the viem default for chain 1 is
// https://eth.merkle.io, which 429s (Cloudflare error 1015) under ordinary use,
// and the mainnet RPCs the server-side Pages Functions fall back to are not
// usable from a browser at all — eth.llamarpc.com and
// ethereum-rpc.publicnode.com do not complete a TLS handshake, and
// cloudflare-eth.com fails eth_blockNumber/eth_getBalance. eth.drpc.org answered
// every read method with CORS `Access-Control-Allow-Origin: *`, so it is the
// browser transport. Changing it means changing connect-src in public/_headers in
// the same commit.
const RPC = {
  [base.id]: "https://mainnet.base.org",
  [mainnet.id]: "https://eth.drpc.org",
  [robinhoodChain.id]: "https://rpc.mainnet.chain.robinhood.com",
} as const

export const wagmiConfig = createConfig({
  ssr: false,
  chains: [base, mainnet, robinhoodChain],
  connectors,
  transports: {
    [base.id]: http(RPC[base.id]),
    [mainnet.id]: http(RPC[mainnet.id]),
    [robinhoodChain.id]: http(RPC[robinhoodChain.id]),
  },
})
