import Head from "next/head"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useConnect } from "wagmi"
import { useAuth } from "../lib/auth"

/* Auth — SIWE (Sign In with Ethereum) on Base.
   Wallet buttons trigger wagmi connect → AuthProvider detects
   isConnected → fires nonce/message/sign/verify flow server-side.
   Email/password removed for v0.1 — wallet-first auth only. */

const WALLETS = [
  { id: "injected", ico: "🦊", name: "MetaMask" },
  { id: "coinbaseWallet", ico: "◈", name: "Coinbase Wallet" },
  // WalletConnect removed — needs real projectId from cloud.walletconnect.com
  // Will be re-enabled when NEXT_PUBLIC_WC_PROJECT_ID is configured
]

export default function Auth() {
  const { authing, session, profile } = useAuth()
  const { connect, connectors, isPending, error } = useConnect()
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null)

  // Redirect to /app when session is established
  useEffect(() => {
    if (session) {
      window.location.href = "/app"
    }
  }, [session])

  // Surface wagmi errors
  useEffect(() => {
    if (error) {
      setMsg({ text: `// ${error.message}`, ok: false })
    }
  }, [error])

  function handleWallet(walletId: string) {
    const connector = connectors.find(c => c.id === walletId)
    if (!connector) {
      setMsg({ text: `// wallet not available — try MetaMask`, ok: false })
      return
    }
    setMsg({ text: `// connecting ${walletId} on Base…`, ok: true })
    connect({ connector })
  }

  const busy = authing || isPending

  return (
    <>
      <Head>
        <title>SUPERCOMPUTE · Sign in</title>
      </Head>

      <div className="hud-corner tl" />
      <div className="hud-corner tr" />
      <div className="hud-corner bl" />
      <div className="hud-corner br" />

      <div className="tpl-auth">
        <div className="auth-card">
          <div className="eyebrow">./auth --connect<span className="caret" /></div>
          <h1 className="auth-title">Enter Supercompute</h1>
          <p className="auth-sub">
            Connect your wallet on Base to access your member dashboard.
          </p>

          <div className="wallet-group">
            {WALLETS.map((w) => (
              <button
                key={w.id}
                type="button"
                className="wallet-btn"
                disabled={busy}
                onClick={() => handleWallet(w.id)}
              >
                <span className="ico">{w.ico}</span>
                {w.name}
                <span className="base-badge">BASE</span>
              </button>
            ))}
          </div>

          {busy && (
            <div className="auth-msg" style={{ color: "var(--gold-warm)" }}>
              {authing ? "// signing SIWE message…" : "// awaiting wallet…"}
            </div>
          )}

          {msg && !busy && (
            <div className="auth-msg" style={{ color: msg.ok ? "var(--gold-warm)" : "var(--danger)" }}>
              {msg.text}
            </div>
          )}

          <div className="auth-footer">
            New to Supercompute? <a href="/community">Request access →</a>
          </div>

          <div className="auth-footer" style={{ borderTop: "none", paddingTop: 8, marginTop: 4 }}>
            <Link href="/" style={{ color: "var(--mono-blue)" }}>← back to site</Link>
          </div>
        </div>
      </div>

      <div className="vignette" />
    </>
  )
}
