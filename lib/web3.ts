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
} as const

export const wagmiConfig = createConfig({
  ssr: false,
  chains: [base, mainnet],
  connectors,
  transports: {
    [base.id]: http(RPC[base.id]),
    [mainnet.id]: http(RPC[mainnet.id]),
  },
})
