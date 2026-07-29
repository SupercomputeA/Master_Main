import { useEffect, useState } from "react"
import Link from "next/link"
import Head from "next/head"
import { useAccount } from "wagmi"
import { useConnect } from "wagmi"
import { useAuth } from "../lib/auth"
import { TIERS } from "../lib/tiers"
import type { Tier } from "../lib/tiers"
import PublicLayout from "../components/PublicLayout"
import Footer from "../components/Footer"

/* /subscribe — Subscriber onboarding funnel.
   - 4 tiers (Free / Builder / Operator / Syndicate) with placeholder pricing.
   - Wallet-first: SIWE connect via the existing AuthProvider; on success we POST /api/subscribers.
   - Email fallback: wallet-less visitors get a 'lead' tier row (auto-active).
   - Payment rail: scaffolded but NOT wired — see TRADEDESK_BLOCKER below.
*/

const FAQ = [
  {
    q: "Do I need a wallet to subscribe?",
    a: "Wallet-first unlocks the full tier. Wallet-less visitors can drop an email and we'll mark you as a lead — you'll be the first to know when tier-1 goes live.",
  },
  {
    q: "What chains do you accept?",
    a: "PLACEHOLDER — USDC on Base is the planned default. ETH on Base and stock-token rails via TradeDesk (Robinhood Chain, chain 4663) are next up. Confirm with team before going live.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. PLACEHOLDER cancellation policy — full refund within 7 days, prorated after. Final T&Cs pending legal review.",
  },
  {
    q: "What does each tier unlock?",
    a: "Builder = KG full read + 5 inference calls/day + School Module 1. Operator = +100 inference + full School + staking + TradeDesk read. Syndicate = +unlimited inference + direct line + research co-authorship.",
  },
]

export default function Subscribe() {
  const { isConnected, address } = useAccount()
  const { connectors, connect } = useConnect()
  const { session, profile, authing } = useAuth()

  const [selectedTier, setSelectedTier] = useState<Tier>(TIERS[1]) // default: Builder
  const [email, setEmail] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<{ ok: boolean; tier?: string; status?: string; msg: string } | null>(null)

  // After successful auth + tier-select, POST /api/subscribers once.
  useEffect(() => {
    if (session && profile && address && selectedTier && !submitting && !result) {
      submitSubscriber({ wallet: address, tier: selectedTier.id })
    }
  }, [session, profile, address, selectedTier])

  async function submitSubscriber(payload: { wallet?: string; email?: string; tier: string }) {
    setSubmitting(true)
    try {
      const res = await fetch("/api/subscribers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, source: "web" }),
      })
      const data: any = await res.json()
      if (data.ok) {
        const sub = data.subscriber
        setResult({
          ok: true,
          tier: sub.tier,
          status: sub.status,
          msg:
            sub.status === "active"
              ? `Welcome — ${sub.tier} tier is active.`
              : `Tier ${sub.tier} recorded (status: ${sub.status}). Payment rails not yet wired — placeholder.`,
        })
      } else {
        setResult({ ok: false, msg: data.error || "Failed to record subscriber" })
      }
    } catch (e) {
      setResult({ ok: false, msg: e instanceof Error ? e.message : String(e) })
    } finally {
      setSubmitting(false)
    }
  }

  function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setResult({ ok: false, msg: "// invalid email" })
      return
    }
    submitSubscriber({ email, tier: "lead" })
  }

  function handleWalletConnect() {
    const injected = connectors.find(c => c.id === "injected")
    const target = injected || connectors[0]
    if (target) connect({ connector: target })
  }

  return (
    <>
      <Head>
        <title>SUPERCOMPUTE · Subscribe</title>
        <meta name="description" content="Pick a tier, connect your wallet, and join the Supercompute operator network." />
      </Head>

      <PublicLayout title="SUPERCOMPUTE · Subscribe">
        <section className="hero" id="subscribe">
          <div className="hero-kicker">
            <div className="status-dot"></div>
            <span className="label">// subscribe</span>
          </div>
          <h1 className="display-xl hero-title">
            JOIN THE<br /><em>OPERATOR</em><br />NETWORK
          </h1>
          <p className="hero-sub">
            Four tiers. Wallet-first onboarding. Full member dashboard, knowledge graph,
            school, and the agent fleet — gated by your subscription.
          </p>
        </section>

        {/* TIER GRID */}
        <section className="section">
          <div className="section-header">
            <div className="label">// tiers</div>
            <div>
              <h2 className="display-md">Pick a tier</h2>
              <p className="muted-text">Pricing below is PLACEHOLDER — confirm with team before launch.</p>
            </div>
          </div>

          <div className="tier-grid">
            {TIERS.map((t) => {
              const isSelected = selectedTier.id === t.id
              return (
                <div
                  key={t.id}
                  className={`tier-card${isSelected ? " selected" : ""}${t.highlight ? " highlight" : ""}`}
                  onClick={() => { setSelectedTier(t); setResult(null) }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { setSelectedTier(t); setResult(null) } }}
                >
                  <div className="tier-head">
                    <div className="tier-name">{t.name.toUpperCase()}</div>
                    <div className="tier-price">{t.priceLabel}</div>
                  </div>
                  <p className="tier-tagline">{t.tagline}</p>
                  <ul className="tier-features">
                    {t.features.map((f, i) => (
                      <li key={i}>
                        <span className="tier-bullet">›</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="tier-cta">
                    {isSelected ? (
                      <span className="tier-cta-text">SELECTED</span>
                    ) : (
                      <span className="tier-cta-text muted">tap to select</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* WALLET CONNECT (tier-first, then connect) */}
        <section className="section">
          <div className="section-header">
            <div className="label">// step 02 · connect</div>
            <div>
              <h2 className="display-md">Connect a wallet on Base</h2>
              <p className="muted-text">
                Selected tier: <strong>{selectedTier.name}</strong> · {selectedTier.priceLabel}
              </p>
            </div>
          </div>

          <div className="sub-connect-card">
            {!session ? (
              <>
                <p className="sub-help">
                  Sign in with your Ethereum wallet. We use Sign-In with Ethereum (SIWE)
                  on Base — no email required, no passwords stored.
                </p>
                <button
                  type="button"
                  className="btn-connect"
                  onClick={handleWalletConnect}
                  disabled={authing}
                >
                  {authing ? "// signing…" : `// CONNECT — ${selectedTier.name.toUpperCase()}`}
                </button>
                {isConnected && !session && (
                  <p className="muted-text" style={{ marginTop: 12 }}>// awaiting SIWE signature…</p>
                )}
              </>
            ) : (
              <div className="sub-confirm">
                <div className="status-dot"></div>
                <div>
                  <div className="sub-confirm-label">CONNECTED</div>
                  <div className="sub-confirm-value">
                    {profile?.name || `${address?.slice(0, 6)}…${address?.slice(-4)}`}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Result banner */}
          {result && (
            <div
              className="sub-result"
              style={{
                marginTop: 16,
                padding: "14px 20px",
                border: `1px solid ${result.ok ? "var(--gold-warm)" : "var(--danger, #E74C3C)"}`,
                background: "var(--bg)",
                color: result.ok ? "var(--gold-warm)" : "var(--cream)",
              }}
            >
              {result.ok ? "✅ " : "// "}{result.msg}
              {result.ok && (
                <div style={{ marginTop: 8 }}>
                  <Link className="btn-connect" href="/dashboard">
                    // GO TO DASHBOARD →
                  </Link>
                </div>
              )}
            </div>
          )}
        </section>

        {/* EMAIL FALLBACK */}
        <section className="section">
          <div className="section-header">
            <div className="label">// no wallet? · step alt</div>
            <div>
              <h2 className="display-md">Drop your email instead</h2>
              <p className="muted-text">
                Wallet-less? We'll mark you as a <code>lead</code> in the subscribers table
                and ping you when your tier is ready.
              </p>
            </div>
          </div>

          <form onSubmit={handleEmailSubmit} className="sub-email-form">
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={submitting}
              className="sub-email-input"
              required
            />
            <button
              type="submit"
              className="btn-connect"
              disabled={submitting || !email}
            >
              {submitting ? "// saving…" : "// JOIN LIST"}
            </button>
          </form>
        </section>

        {/* FAQ */}
        <section className="section">
          <div className="section-header">
            <div className="label">// faq</div>
            <div>
              <h2 className="display-md">Frequently asked</h2>
            </div>
          </div>
          <div className="faq-list">
            {FAQ.map((item, i) => (
              <details key={i} className="faq-item">
                <summary className="faq-q">{item.q}</summary>
                <p className="faq-a">{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* LEGAL FOOTER */}
        <section className="section">
          <div className="legal-footer">
            <p>
              PLACEHOLDER legal copy. By subscribing you agree to our{" "}
              <a href="/terms">Terms of Service</a> and{" "}
              <a href="/privacy">Privacy Policy</a>. Subscription payments are non-custodial
              and processed on-chain. No card data is stored on Supercompute infrastructure.
            </p>
            <p style={{ marginTop: 8, fontSize: 11, opacity: 0.6 }}>
              Tier prices shown are PLACEHOLDER and not final. Cancellation policy
              PLACEHOLDER. Payment rails (USDC/Base, ETH/Base, TradeDesk stock-tokens) are
              in scaffolding — confirm before public launch.
            </p>
          </div>
        </section>

        <Footer />
      </PublicLayout>
    </>
  )
}