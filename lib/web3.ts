import { http, createConfig } from "wagmi"
import { base, mainnet } from "wagmi/chains"
import { injected, coinbaseWallet } from "wagmi/connectors"

// WalletConnect requires a real project ID from cloud.walletconnect.com
// If not configured, we skip it — MetaMask and Coinbase Wallet still work
const WC_PROJECT_ID = process.env.NEXT_PUBLIC_WC_PROJECT_ID || ""
const connectors = [injected(), coinbaseWallet({ appName: "Supercompute" })]
if (WC_PROJECT_ID) {
  const { walletConnect } = require("wagmi/connectors")
  connectors.push(walletConnect({ projectId: WC_PROJECT_ID }))
}

export const wagmiConfig = createConfig({
  ssr: false,
  chains: [base, mainnet],
  connectors,
  transports: {
    [base.id]: http(),
    [mainnet.id]: http(),
  },
})
