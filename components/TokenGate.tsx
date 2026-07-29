"use client"

import { useEffect, useState, type ReactNode } from "react"
import { useAuth } from "../lib/auth"
import { checkGate } from "../lib/web3-utils"

type GateRequirement = { token?: string; minBalance?: string; ens?: string; label: string }

export default function TokenGate({
  children,
  requirements,
  fallback,
}: {
  children: ReactNode
  requirements: GateRequirement[]
  fallback?: ReactNode
}) {
  const { profile } = useAuth()
  const [status, setStatus] = useState<"loading" | "passed" | "failed">("loading")
  const [gates, setGates] = useState<{ label: string; passed: boolean }[]>([])

  const walletAddress = profile?.address || profile?.wallet_address || (profile?.name?.startsWith("0x") && profile.name.length === 42 ? profile.name : null)

  useEffect(() => {
    if (!walletAddress) {
      setStatus("failed")
      return
    }
    setStatus("loading")
    checkGate(walletAddress, requirements.map(r => ({ token: r.token, minBalance: r.minBalance, ens: r.ens })))
      .then((result) => {
        setGates(result.gates)
        setStatus(result.passed ? "passed" : "failed")
      })
      .catch(() => setStatus("failed"))
  }, [walletAddress, requirements])

  if (status === "loading") {
    return (
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "40px 24px", textAlign: "center" }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--muted)" }}>Checking access...</div>
      </div>
    )
  }

  if (status === "failed") {
    if (fallback) return <>{fallback}</>
    return (
      <div style={{ background: "var(--surface)", border: "1px solid var(--border-accent)", padding: "40px 24px", textAlign: "center" }}>
        <div style={{ fontSize: 14, color: "var(--accent)", marginBottom: 12 }}>🔒 Access Required</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, maxWidth: 300, margin: "0 auto" }}>
          {gates.map((g, i) => (
            <div key={i} style={{
              fontFamily: "var(--font-mono)", fontSize: 9,
              padding: "6px 12px", border: `1px solid ${g.passed ? "var(--teal)" : "var(--border)"}`,
              color: g.passed ? "var(--teal)" : "var(--muted)",
            }}>
              {g.passed ? "●" : "○"} {g.label}
            </div>
          ))}
          {gates.length === 0 && (
            <p style={{ fontSize: 12, color: "var(--muted)" }}>
              Connect your wallet to check access.
            </p>
          )}
        </div>
      </div>
    )
  }

  return <>{children}</>
}
