import { http, createConfig } from "wagmi"
import { base, mainnet } from "wagmi/chains"
import { injected, coinbaseWallet, walletConnect } from "wagmi/connectors"

export const wagmiConfig = createConfig({
  ssr: false,
  chains: [base, mainnet],
  connectors: [
    injected(),
    coinbaseWallet({ appName: "Supercompute" }),
    walletConnect({ projectId: "supercompute" }),
  ],
  transports: {
    [base.id]: http(),
    [mainnet.id]: http(),
  },
})
