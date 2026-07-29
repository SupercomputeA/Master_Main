"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { useAccount, useSignMessage, useDisconnect } from "wagmi"
import { useConnect } from "wagmi"
import { useEnsName } from "wagmi"
import { mainnet } from "wagmi/chains"
import { getNonce, getMessage, login, logout as apiLogout } from "./siwe"
import { formatAddress } from "./ens"

type Profile = { name: string; role: string; address?: string; wallet_address?: string; ensName?: string } | null

type AuthContextType = {
  session: string | null
  profile: Profile
  authing: boolean
  connect: () => void
  disconnect: () => void
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  profile: null,
  authing: false,
  connect: () => {},
  disconnect: () => {},
  isAdmin: false,
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const { address, isConnected } = useAccount()
  const { connect: wagmiConnect, connectors } = useConnect()
  const { disconnect: wagmiDisconnect } = useDisconnect()
  const { signMessageAsync } = useSignMessage()
  const { data: ensName } = useEnsName({ address, chainId: mainnet.id })

  const [session, setSession] = useState<string | null>(null)
  const [profile, setProfile] = useState<Profile>(null)
  const [authing, setAuthing] = useState(false)

  useEffect(() => {
    const s = localStorage.getItem("session")
    if (s) {
      setSession(s)
      ;(async () => {
        try {
          const r = await fetch(`/api/auth/profile`, { headers: { Authorization: `Bearer ${s}` } })
          const d = (await r.json()) as { user?: { name: string; role: string; address?: string; wallet_address?: string } }
          if (d.user) {
            // The server stores the canonical shortened 0x as `name`; on
            // rehydrate we prefer the resolved ENS (set below in the
            // ensName effect) and fall back to the server-provided name.
            // Keep this effect idempotent — only run once on mount.
            setProfile({ ...d.user, address: d.user.address || d.user.wallet_address, ensName: ensName || undefined })
          }
          else localStorage.removeItem("session")
        } catch { localStorage.removeItem("session") }
      })()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Once wagmi resolves the user's ENS (or refines it after reconnection),
  // re-format the stored profile.name so the UI shows ENS-first.
  useEffect(() => {
    setProfile((prev) => prev ? { ...prev, ensName: ensName || undefined, name: formatAddress(prev.address, ensName) || prev.name } : prev)
  }, [ensName])

  useEffect(() => {
    if (isConnected && address && !session) signIn(address)
  }, [isConnected, address])

  async function signIn(addr: string) {
    setAuthing(true)
    try {
      const nonce = await getNonce()
      const message = await getMessage(addr, nonce)
      const signature = await signMessageAsync({ message })
      const result = await login(addr, signature, nonce)
      if (result.session) {
        setSession(result.session)
        localStorage.setItem("session", result.session)
        if (result.user) {
          // ENS-aware display: prefer resolved ENS, fall back to shortened 0x.
          // For the canonical supercompute.eth wallet, this guarantees the
          // project handle is shown everywhere the profile is rendered.
          const displayName = formatAddress(addr, ensName)
          setProfile({ ...result.user as { name: string; role: string }, name: displayName, address: addr, ensName: ensName || undefined })
        }
      }
    } catch { wagmiDisconnect() }
    setAuthing(false)
  }

  const connect = useCallback(() => {
    // Try injected first, fall back to first available connector
    const injectedConn = connectors.find(c => c.id === "injected")
    const target = injectedConn || connectors[0]
    if (target) wagmiConnect({ connector: target })
  }, [wagmiConnect, connectors])

  const disconnect = useCallback(() => {
    if (session) apiLogout(session).catch(() => {})
    localStorage.removeItem("session")
    setSession(null)
    setProfile(null)
    wagmiDisconnect()
  }, [session, wagmiDisconnect])

  return (
    <AuthContext.Provider value={{ session, profile, authing, connect, disconnect, isAdmin: profile?.role === "admin" }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
