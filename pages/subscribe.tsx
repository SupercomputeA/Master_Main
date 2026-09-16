import { useEffect, useState } from "react"
import Link from "next/link"
import Head from "next/head"
import { useAccount } from "wagmi"
import { useConnect } from "wagmi"
import { useAuth } from "../lib/auth"
import { TIERS, isPaidTier, PAYMENT_CONFIG } from "../lib/tiers"
import type { Tier } from "../lib/tiers"
import PublicLayout from "../components/PublicLayout"
import Footer from "../components/Footer"

/* /subscribe — Subscriber onboarding funnel.
   - Free rail: connect wallet, instant activation.
   - Paid rail (USDC on Base): connect wallet, sign EIP-3009 transferWithAuthorization,
     server verifies and flips status='active'.
   - Email fallback: wallet-less visitors get a 'lead' tier row (auto-active).
*/

const FAQ = [
  {
    q: "Do I need a wallet to subscribe?",
    a: "Wallet-first unlocks the full tier and the paid rail (USDC on Base). Wallet-less visitors can drop an email and we'll mark you as a lead — you'll be the first to know when tier-1 goes live.",
  },
  {
    q: "What payment rails do you accept?",
    a: "USDC on Base mainnet, paid monthly via EIP-3009 transferWithAuthorization. No card data, no custodial accounts. The USDC contract is 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913 and payments settle to supercompute.eth (0x1a828cd220559479e2f761805da4ee722683323B).",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. Your tier stays active through the end of the current 30-day window. No auto-renewal commitment — to renew, sign a new EIP-3009 authorization each month.",
  },
  {
    q: "What does each tier unlock?",
    a: "Builder = KG full read + 5 inference calls/day + School Module 1. Operator = +100 inference + full School + staking + TradeDesk read. Syndicate = +unlimited inference + direct line + research co-authorship + TradeDesk write.",
  },
  {
    q: "Where does the money go?",
    a: "100% of USDC subscription revenue flows to the Supercompute treasury at supercompute.eth. The treasury funds protocol development, agent-fleet inference costs, and the founders syndicate dinner (annual).",
  },
  {
    q: "What's the legal entity?",
    a: "Supercompute. Operated by Supercompute. All on-chain receipts at 0x1a828cd220559479e2f761805da4ee722683323B.",
  },
];

export default function Subscribe() {
  const { isConnected, address } = useAccount()
  const { connectors, connect } = useConnect()
  const { session, profile, authing } = useAuth()

  const [selectedTier, setSelectedTier] = useState<Tier>(TIERS[1]) // default: Builder
  const [email, setEmail] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [paying, setPaying] = useState(false)
  const [subscriberId, setSubscriberId] = useState<string | null>(null)
  const [result, setResult] = useState<{ ok: boolean; tier?: string; status?: string; msg: string } | null>(null)

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
        setSubscriberId(sub.id)
        if (isPaidTier(sub.tier)) {
          // Don't mark complete — payment step pending.
          setResult({
            ok: true,
            tier: sub.tier,
            status: sub.status,
            msg: `Tier ${sub.tier} recorded. Sign the USDC payment authorization below to activate.`,
          })
        } else {
          setResult({
            ok: true,
            tier: sub.tier,
            status: sub.status,
            msg: sub.status === "active"
              ? `Welcome — ${sub.tier} tier is active.`
              : `Tier ${sub.tier} recorded (status: ${sub.status}).`,
          })
        }
      } else {
        setResult({ ok: false, msg: data.error || "Failed to record subscriber" })
      }
    } catch (e) {
      setResult({ ok: false, msg: e instanceof Error ? e.message : String(e) })
    } finally {
      setSubmitting(false)
    }
  }

  // After successful auth + tier-select, POST /api/subscribers once.
  useEffect(() => {
    if (session && profile && address && selectedTier && !subscriberId && !submitting) {
      submitSubscriber({ wallet: address, tier: selectedTier.id })
    }
  }, [session, profile, address, selectedTier])

  // USDC payment step — uses the standard ERC-3009 receiveWithAuthorization flow
  // via the user's connected wallet. We construct the typed-data message client-side
  // and POST the signature to /api/subscribers/pay for verification + activation.
  async function payWithUSDC() {
    if (!address || !subscriberId) return
    setPaying(true)
    try {
      const tier = selectedTier
      const amountUSDC = tier.priceCents / 100 // cents → dollars
      const amountBaseUnits = BigInt(tier.priceCents) * BigInt(10 ** 4) // 6 decimals
      const now = Math.floor(Date.now() / 1000)
      const validAfter = 0
      const validBefore = now + 3600 // 1 hour window
      const nonce = "0x" + Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map(b => b.toString(16).padStart(2, "0")).join("")

      // EIP-712 typed data for USDC's TransferWithAuthorization.
      const domain = {
        name: "USD Coin",
        version: "2",
        chainId: PAYMENT_CONFIG.chainId,
        verifyingContract: PAYMENT_CONFIG.usdcContract,
      }
      const types = {
        TransferWithAuthorization: [
          { name: "from", type: "address" },
          { name: "to", type: "address" },
          { name: "value", type: "uint256" },
          { name: "validAfter", type: "uint256" },
          { name: "validBefore", type: "uint256" },
          { name: "nonce", type: "bytes32" },
        ],
      }
      const message = {
        from: address,
        to: PAYMENT_CONFIG.treasury,
        value: amountBaseUnits.toString(),
        validAfter: validAfter.toString(),
        validBefore: validBefore.toString(),
        nonce,
      }

      // EIP-712 typed data via the connected wallet's eth_signTypedData_v4.
      // We get the provider from window.ethereum (any injected wallet on Base).
      const provider = (window as any).ethereum
      if (!provider) throw new Error("No injected wallet found. Install MetaMask, Rabby, or Coinbase Wallet.")
      const signature = await provider.request({
        method: "eth_signTypedData_v4",
        params: [address, JSON.stringify({ domain, types, primaryType: "TransferWithAuthorization", message })],
      }) as `0x${string}`

      // POST to /api/subscribers/pay for verification + DB activation.
      const res = await fetch("/api/subscribers/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscriber_id: subscriberId,
          tier: tier.id,
          signature,
          valid_after: validAfter,
          valid_before: validBefore,
          nonce,
        }),
      })
      const data: any = await res.json()
      if (data.ok) {
        setResult({
          ok: true,
          tier: tier.id,
          status: "active",
          msg: `Payment confirmed. ${tier.name} tier is active for 30 days.`,
        })
      } else {
        setResult({ ok: false, msg: data.error || "Payment verification failed" })
      }
    } catch (e) {
      setResult({ ok: false, msg: e instanceof Error ? e.message : String(e) })
    } finally {
      setPaying(false)
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

  const needsPayment = subscriberId && isPaidTier(selectedTier.id) && result?.status !== "active"

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
            Free rail for the curious. Paid rail for builders, operators, and the syndicate.
            Wallet-first onboarding, USDC on Base, no custodial accounts.
          </p>
        </section>

        {/* TIER GRID */}
        <section className="section">
          <div className="section-header">
            <div className="label">// tiers</div>
            <div>
              <h2 className="display-md">Pick a tier</h2>
              <p className="muted-text">Free rail activates on wallet connect. Paid rail requires USDC signature.</p>
            </div>
          </div>

          <div className="tier-grid">
            {TIERS.map((t) => {
              const isSelected = selectedTier.id === t.id
              return (
                <div
                  key={t.id}
                  className={`tier-card${isSelected ? " selected" : ""}${t.highlight ? " highlight" : ""}`}
                  onClick={() => { setSelectedTier(t); setResult(null); setSubscriberId(null) }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { setSelectedTier(t); setResult(null); setSubscriberId(null) } }}
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

          {/* USDC PAYMENT (paid tiers only, after subscriber row exists) */}
          {needsPayment && (
            <div className="sub-pay-card" style={{ marginTop: 16, padding: 20, border: "1px solid var(--gold-warm)" }}>
              <div className="label">// step 03 · pay</div>
              <h3 className="display-md" style={{ marginTop: 8 }}>
                Authorize {selectedTier.priceCents / 100} USDC
              </h3>
              <p className="muted-text" style={{ marginTop: 8 }}>
                Sign an EIP-3009 transferWithAuthorization message. Your wallet will send{" "}
                {selectedTier.priceCents / 100} USDC to <code>{PAYMENT_CONFIG.treasury.slice(0, 6)}…{PAYMENT_CONFIG.treasury.slice(-4)}</code>{" "}
                (supercompute.eth). One signature, no gas (sponsored by Supercompute).
              </p>
              <button
                type="button"
                className="btn-connect"
                onClick={payWithUSDC}
                disabled={paying}
                style={{ marginTop: 16 }}
              >
                {paying ? "// signing payment…" : `// PAY ${selectedTier.priceCents / 100} USDC — ${selectedTier.name.toUpperCase()}`}
              </button>
            </div>
          )}

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
              {result.ok && result.status === "active" && (
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
                and ping you when paid tier-1 goes live.
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
              Operated by <strong>Supercompute</strong>. By subscribing you agree to our{" "}
              <a href="/terms">Terms of Service</a> and{" "}
              <a href="/privacy">Privacy Policy</a>. Subscription payments are non-custodial
              and processed on-chain. No card data is stored on Supercompute infrastructure.
            </p>
            <p style={{ marginTop: 8, fontSize: 11, opacity: 0.6 }}>
              30-day renewal window, no auto-renewal. USDC settles to 0x1a828cd220559479e2f761805da4ee722683323B.
              This page is informational and does not constitute an offer to sell securities.
            </p>
          </div>
        </section>

        <Footer />
      </PublicLayout>
    </>
  )
}
