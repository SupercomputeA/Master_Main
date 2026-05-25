"use client"

import { useEffect, useState } from "react"
import { useAuth } from "../lib/auth"
import { lookupAddress, shortenAddress } from "../lib/web3-utils"

export default function ConnectWallet() {
  const { profile, authing, connect, disconnect } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [ensName, setEnsName] = useState<string | null>(null)

  const walletAddress = profile?.address || profile?.wallet_address || (profile?.name?.startsWith("0x") ? profile.name : null)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (walletAddress) {
      lookupAddress(walletAddress).then(setEnsName).catch(() => {})
    } else {
      setEnsName(null)
    }
  }, [walletAddress])

  if (!mounted) {
    return <div className="btn-connect" style={{ opacity: 0.4 }}>// Connect</div>
  }

  if (authing) {
    return <div className="btn-connect" style={{ opacity: 0.5 }}>// Signing...</div>
  }

  if (profile) {
    const displayName = ensName || profile.name
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {ensName && (
          <div style={{
            fontFamily: "var(--font-mono)", fontSize: 8, color: "var(--teal)",
            textAlign: "center", letterSpacing: "0.1em", textTransform: "uppercase",
          }}>
            ● ENS resolved
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
          {displayName}
          {ensName && walletAddress && (
            <div style={{ fontSize: 8, color: "var(--muted)", marginTop: 2 }}>
              {shortenAddress(walletAddress)}
            </div>
          )}
        </div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: "var(--muted)", textAlign: "center" }}>
          {profile.role === "admin" ? "● ADMIN" : "● MEMBER"}
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
