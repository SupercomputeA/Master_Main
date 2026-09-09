import { http, createConfig } from "wagmi"
import { base, mainnet } from "wagmi/chains"
import { injected, coinbaseWallet } from "wagmi/connectors"

import { walletConnect } from "wagmi/connectors"

// WalletConnect project ID from cloud.walletconnect.com (public client ID, not a secret)
const WC_PROJECT_ID = "195c4b15eafe2c2f160bd7c1512ba93a"

const connectors = [
  injected(),
  coinbaseWallet({ appName: "Supercompute" }),
  walletConnect({ projectId: WC_PROJECT_ID }),
]

export const wagmiConfig = createConfig({
  ssr: false,
  chains: [base, mainnet],
  connectors,
  transports: {
    [base.id]: http(),
    [mainnet.id]: http(),
  },
})
