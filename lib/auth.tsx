"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { useAccount, useSignMessage, useDisconnect } from "wagmi"
import { useConnect } from "wagmi"
import { getNonce, getMessage, login, logout as apiLogout } from "./siwe"

type Profile = { name: string; role: string; address?: string; wallet_address?: string } | null

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
          const d = (await r.json()) as { user?: { name: string; role: string } }
          if (d.user) setProfile(d.user)
          else localStorage.removeItem("session")
        } catch { localStorage.removeItem("session") }
      })()
    }
  }, [])

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
        if (result.user) setProfile(result.user as { name: string; role: string })
      }
    } catch { wagmiDisconnect() }
    setAuthing(false)
  }

  const connect = useCallback(() => {
    const injectedConn = connectors.find(c => c.id === "injected")
    if (injectedConn) wagmiConnect({ connector: injectedConn })
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
