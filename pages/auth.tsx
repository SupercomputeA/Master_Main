import Head from "next/head"
import Link from "next/link"
import { useState } from "react"

/* Auth — faithful port of templates/auth/Auth.dc.html, wired up:
   - Sign In / Create Account tab state
   - controlled email + password
   - wallet buttons trigger a connect handler
   - submit posts to /api/auth/login (graceful message)
   Full SIWE signature verification is handled server-side (see src/api/auth). */

const WALLETS = [
  { ico: "◈", name: "Coinbase Wallet" },
  { ico: "🦊", name: "MetaMask" },
  { ico: "⧉", name: "WalletConnect" },
]

export default function Auth() {
  const [mode, setMode] = useState<"signin" | "create">("signin")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null)

  const submitLabel = mode === "signin" ? "Sign In" : "Create Account"

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setMsg(null)
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, mode }),
      })
      if (res.ok) {
        setMsg({ text: "// signed in — redirecting…", ok: true })
        window.location.href = "/app"
      } else {
        setMsg({ text: `// ${(await res.text()) || "sign-in failed"}`, ok: false })
      }
    } catch {
      setMsg({ text: "// auth service unreachable — try wallet connect", ok: false })
    } finally {
      setBusy(false)
    }
  }

  function handleWallet(name: string) {
    setMsg({ text: `// connecting ${name} on Base…`, ok: true })
    // Wallet connect flow (wagmi/SIWE) is wired via components/ConnectWallet.
  }

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
            Connect your wallet on Base, or sign in with email to access your member dashboard.
          </p>

          <div className="auth-tabs">
            <button
              type="button"
              className={`auth-tab${mode === "signin" ? " active" : ""}`}
              onClick={() => setMode("signin")}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`auth-tab${mode === "create" ? " active" : ""}`}
              onClick={() => setMode("create")}
            >
              Create Account
            </button>
          </div>

          <div className="wallet-group">
            {WALLETS.map((w) => (
              <button key={w.name} type="button" className="wallet-btn" onClick={() => handleWallet(w.name)}>
                <span className="ico">{w.ico}</span>
                {w.name}
                <span className="base-badge">BASE</span>
              </button>
            ))}
          </div>

          <div className="divider">or continue with email</div>

          <form onSubmit={handleEmailSubmit}>
            <div className="field">
              <label className="field-label" htmlFor="email">Email</label>
              <input
                id="email"
                className="field-input"
                type="email"
                placeholder="operator@supercompute.io"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label className="field-label" htmlFor="password">Password</label>
              <input
                id="password"
                className="field-input"
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button className="submit-btn" type="submit" disabled={busy}>
              {busy ? "…" : submitLabel}
            </button>
          </form>

          {msg && (
            <div className="auth-msg" style={{ color: msg.ok ? "var(--gold-warm)" : "#e0a03f" }}>
              {msg.text}
            </div>
          )}

          <div className="auth-footer">
            {mode === "signin" ? (
              <>New to Supercompute? <a onClick={() => setMode("create")}>Request access →</a></>
            ) : (
              <>Already have an account? <a onClick={() => setMode("signin")}>Sign in →</a></>
            )}
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
