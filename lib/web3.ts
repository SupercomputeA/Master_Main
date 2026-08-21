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

export const wagmiConfig = createConfig({
  ssr: false,
  chains: [base, mainnet, robinhoodChain],
  connectors,
  transports: {
    [base.id]: http(),
    [mainnet.id]: http(),
    [robinhoodChain.id]: http("https://rpc.mainnet.chain.robinhood.com"),
  },
})
