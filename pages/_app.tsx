import "../styles/globals.css"

import type { AppProps } from "next/app"
import Web3Provider from "../components/Web3Provider"
import { AuthProvider } from "../lib/auth"

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Web3Provider>
      <AuthProvider>
        <Component {...pageProps} />
      </AuthProvider>
    </Web3Provider>
  )
}
