"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { useAccount, useSignMessage, useDisconnect } from "wagmi"
import { useConnect } from "wagmi"
import { injected } from "wagmi/connectors"
import { getNonce, getMessage, login, logout as apiLogout } from "./siwe"

type Profile = { name: string; role: string } | null

type AuthContextType = {
  session: string | null
  profile: Profile
  authing: boolean
  connect: () => void
  disconnect: () => void
  isAdmin: boolean
  devMode: boolean
  loginAs: (name: string, role: string) => void
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  profile: null,
  authing: false,
  connect: () => {},
  disconnect: () => {},
  isAdmin: false,
  devMode: false,
  loginAs: () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [devMode, setDevMode] = useState(false)
  const { address, isConnected } = useAccount()
  const { connect: wagmiConnect } = useConnect()
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

  const connect = useCallback(() => wagmiConnect({ connector: injected() }), [wagmiConnect])

  const disconnect = useCallback(() => {
    if (session) apiLogout(session).catch(() => {})
    localStorage.removeItem("session")
    setSession(null)
    setProfile(null)
    wagmiDisconnect()
  }, [session, wagmiDisconnect])

  const loginAs = useCallback((name: string, role: string) => {
    const fakeSession = `dev_${name}_${role}_${Date.now()}`
    const fakeProfile = { name, role }
    localStorage.setItem("session", fakeSession)
    localStorage.setItem("dev_profile", JSON.stringify(fakeProfile))
    setSession(fakeSession)
    setProfile(fakeProfile)
    setDevMode(true)
  }, [])

  return (
    <AuthContext.Provider value={{ session, profile, authing, connect, disconnect, isAdmin: profile?.role === "admin", devMode, loginAs }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
