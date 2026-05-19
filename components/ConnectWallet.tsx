"use client"

import { useConnect, useAccount, useDisconnect, useSignMessage } from "wagmi"
import { injected } from "wagmi/connectors"
import { useEffect, useState } from "react"
import { getNonce, getMessage, login, logout as apiLogout } from "../lib/siwe"

export default function ConnectWallet() {
  const { address, isConnected } = useAccount()
  const { connect } = useConnect()
  const { disconnect } = useDisconnect()
  const { signMessageAsync } = useSignMessage()
  const [mounted, setMounted] = useState(false)
  const [session, setSession] = useState<string | null>(null)
  const [profile, setProfile] = useState<{ name: string; role: string } | null>(null)
  const [authing, setAuthing] = useState(false)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    const s = localStorage.getItem("session")
    if (s) {
      setSession(s)
      ;(async () => {
        try {
          const r = await fetch(`/api/auth/profile`, { headers: { Authorization: `Bearer ${s}` } })
          const d = await r.json() as { user?: { name: string; role: string } }
          if (d.user) setProfile(d.user)
        } catch { localStorage.removeItem("session") }
      })()
    }
  }, [])

  async function handleConnect() {
    connect({ connector: injected() })
  }

  useEffect(() => {
    if (isConnected && address && !session) {
      signIn(address)
    }
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
        if (result.user) setProfile(result.user)
      }
    } catch (e) {
      console.error("SIWE auth failed", e)
      disconnect()
    }
    setAuthing(false)
  }

  async function handleDisconnect() {
    if (session) {
      await apiLogout(session)
      localStorage.removeItem("session")
    }
    setSession(null)
    setProfile(null)
    disconnect()
  }

  if (!mounted) {
    return <div className="btn-connect" style={{ opacity: 0.4 }}>// Connect</div>
  }

  if (authing) {
    return <div className="btn-connect" style={{ opacity: 0.5 }}>// Signing...</div>
  }

  if (session && profile) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          color: "var(--accent)",
          padding: "10px 14px",
          border: "1px solid var(--border-accent)",
          textAlign: "center",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}>
          {profile.role === "admin" && "⚡ "}
          {profile.name}
        </div>
        <button
          onClick={handleDisconnect}
          className="btn-connect"
          style={{ background: "transparent", color: "var(--muted)", borderColor: "var(--border)" }}
        >
          // Disconnect
        </button>
      </div>
    )
  }

  return (
    <button onClick={handleConnect} className="btn-connect">
      // Connect
    </button>
  )
}
