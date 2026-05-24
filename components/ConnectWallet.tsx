"use client"

import { useEffect, useState } from "react"
import { useAuth } from "../lib/auth"

export default function ConnectWallet() {
  const { profile, authing, connect, disconnect } = useAuth()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) {
    return <div className="btn-connect" style={{ opacity: 0.4 }}>// Connect</div>
  }

  if (authing) {
    return <div className="btn-connect" style={{ opacity: 0.5 }}>// Signing...</div>
  }

  if (profile) {
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
          {profile.name}
        </div>
        <button
          onClick={disconnect}
          className="btn-connect"
          style={{ background: "transparent", color: "var(--muted)", borderColor: "var(--border)" }}
        >
          // Disconnect
        </button>
      </div>
    )
  }

  return (
    <button onClick={connect} className="btn-connect">
      // Connect
    </button>
  )
}
