"use client"

import { useEffect, useState } from "react"
import { useAuth } from "../lib/auth"

export default function ConnectWallet() {
  const { profile, devMode, authing, connect, disconnect, loginAs } = useAuth()
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
        {devMode && (
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: "#888", textAlign: "center", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Dev Mode
          </div>
        )}
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
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <button onClick={connect} className="btn-connect">
        // Connect
      </button>
      <button
        onClick={() => loginAs("Dev Admin", "admin")}
        className="btn-connect"
        style={{ fontSize: 9, padding: "4px 10px", background: "transparent", color: "#666", borderColor: "#333" }}
      >
        :: Dev Admin
      </button>
    </div>
  )
}
