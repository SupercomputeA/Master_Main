import Head from "next/head"
import Link from "next/link"
import { useState, useEffect, useMemo } from "react"
import { useConnect } from "wagmi"
import { useAccount } from "wagmi"
import { useAuth } from "../lib/auth"
import { formatAddress, useENSName } from "../lib/ens"

/* Auth — SIWE (Sign In with Ethereum) on Base.
   Wallet buttons trigger wagmi connect → AuthProvider detects
   isConnected → fires nonce/message/sign/verify flow server-side.
   Email/password removed for v0.1 — wallet-first auth only. */

/* Wallet options are derived from wagmi's LIVE connector list, not a hardcoded
   id list. Wallets that announce over EIP-6963 register themselves as their own
   connectors with reverse-DNS ids (io.metamask, com.coinbase.wallet, …).
   Rendering only the legacy ids hid those wallets and sent every click to the
   legacy window.ethereum shim, which throws
   "Provider not found ... @wagmi/core" when no injected provider exists. */

const KNOWN_WALLETS: Record<string, { name: string; ico: string }> = {
  "io.metamask": { name: "MetaMask", ico: "🦊" },
  metamask: { name: "MetaMask", ico: "🦊" },
  injected: { name: "Browser Wallet", ico: "🦊" },
  "com.coinbase.wallet": { name: "Coinbase Wallet", ico: "◈" },
  coinbaseWallet: { name: "Coinbase Wallet", ico: "◈" },
  walletConnect: { name: "WalletConnect", ico: "⧉" },
}

function walletFamily(id: string): string {
  const k = id.toLowerCase()
  if (k.includes("metamask")) return "metamask"
  if (k.includes("coinbase")) return "coinbase"
  if (k.includes("walletconnect")) return "walletconnect"
  return k
}

function walletRank(id: string): number {
  const k = id.toLowerCase()
  const isEip6963 = k.includes(".") && !KNOWN_WALLETS[id]
  if (isEip6963 && k.includes("metamask")) return 0
  if (k === "injected") return 1
  if (isEip6963) return 2
  if (k === "coinbasewallet") return 3
  if (k === "walletconnect") return 9
  return 5
}

export default function Auth() {
  const { authing, session, profile, authError } = useAuth()
  const { connect, connectors, isPending, error } = useConnect()
  const { address: wagmiAddress } = useAccount()
  const { data: ensName } = useENSName(wagmiAddress)
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null)
  const [hasInjected, setHasInjected] = useState<boolean | null>(null)
  const [isSafari, setIsSafari] = useState(false)

  // Detect a legacy injected provider once on the client. null = not yet known.
  // Also flag Safari: MetaMask ships no Safari extension, so those visitors can
  // only use WalletConnect or a remote-wallet connector — say so instead of
  // offering a button that cannot work.
  useEffect(() => {
    const provider = typeof window !== "undefined" && Boolean((window as Window & { ethereum?: unknown }).ethereum)
    setHasInjected(provider)
    setIsSafari(/^((?!chrome|android|crios|fxios|edg).)*safari/i.test(navigator.userAgent))
  }, [])

  // Build the wallet list from wagmi's connectors, including EIP-6963
  // announcements, preferring a discovered wallet over the legacy shim.
  const walletOptions = useMemo(() => {
    const discovered = connectors.filter((c) => c.id.includes("."))
    const seen = new Set<string>()
    const options: { id: string; ico: string; name: string }[] = []
    for (const c of [...connectors].sort((a, b) => walletRank(a.id) - walletRank(b.id))) {
      const family = walletFamily(c.id)
      if (seen.has(family)) continue
      // Never offer the legacy shim when a real wallet was announced, or when
      // there is no window.ethereum at all — that click ends in
      // "Provider not found".
      if (c.id === "injected" && (discovered.length > 0 || hasInjected === false)) continue
      seen.add(family)
      const known = KNOWN_WALLETS[c.id]
      options.push({ id: c.id, ico: known?.ico || "◈", name: known?.name || c.name || c.id })
    }
    return options
  }, [connectors, hasInjected])

  // Redirect to /app when session is established
  useEffect(() => {
    if (session) {
      window.location.href = "/app"
    }
  }, [session])

  // Surface the sign-in failure reason (backend unreachable, rejected
  // signature, 401/403) instead of a stale "connecting…" state.
  useEffect(() => {
    if (authError) setMsg({ text: authError, ok: false })
  }, [authError])

  // Surface wagmi errors
  useEffect(() => {
    if (error) {
      setMsg({ text: `// ${error.message}`, ok: false })
    }
  }, [error])

  // If a connect attempt settles without a session (no wallet popup, user
  // dismissed, provider missing), drop the stale "connecting…" line so the
  // error/authError effect or the next click controls the message.
  useEffect(() => {
    if (!isPending && !authing && !session && !error) {
      setMsg((prev) => (prev && prev.text.startsWith("// connecting") ? null : prev))
    }
  }, [isPending, authing, session, error])

  function handleWallet(walletId: string) {
    const connector = connectors.find(c => c.id === walletId)
    if (!connector) {
      setMsg({ text: `// wallet not available — try WalletConnect`, ok: false })
      return
    }
    setMsg({ text: `// connecting ${KNOWN_WALLETS[walletId]?.name || walletId} on Base…`, ok: true })
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
            {walletOptions.map((w) => (
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

          {hasInjected === false && !walletOptions.some((w) => /metamask|injected/i.test(w.id)) && !msg && (
            <div className="auth-msg" style={{ color: "var(--gold-warm)", fontSize: 11 }}>
              {isSafari
                ? "Safari has no browser-wallet extension — open supercompute.io in Chrome or Brave with MetaMask, or continue with WalletConnect below"
                : "no browser wallet detected — enable your wallet extension for supercompute.io, or continue with WalletConnect"}
            </div>
          )}

          {wagmiAddress && !session && (
            <div className="auth-msg" style={{ color: "var(--teal)", fontSize: 11 }}>
              {/* Render ENS-first; fall back to formatted address. Hydrates
                  client-side after wagmi picks up the connection. */}
              connected as <strong>{formatAddress(wagmiAddress, ensName)}</strong>
            </div>
          )}

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
