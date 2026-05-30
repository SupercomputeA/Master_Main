import { http, createConfig } from "wagmi"
import { base } from "wagmi/chains"
import { injected, walletConnect } from "wagmi/connectors"

export const WALLET_CONNECT_ID = process.env.NEXT_PUBLIC_WALLET_CONNECT_ID || ""

const connectors = [
  injected(),
  ...(WALLET_CONNECT_ID
    ? [
        walletConnect({
          projectId: WALLET_CONNECT_ID,
          metadata: {
            name: "Supercompute",
            description: "Supercompute — Web3 agent newsdesk",
            url: "https://supercompute.io",
            icons: ["https://supercompute.io/icon.png"],
          },
          showQrModal: true,
        }),
      ]
    : []),
]

export const wagmiConfig = createConfig({
  chains: [base],
  connectors,
  transports: {
    [base.id]: http(),
  },
})
