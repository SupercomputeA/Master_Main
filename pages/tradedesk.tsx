import Link from "next/link"
import PublicLayout from "../components/PublicLayout"
import Footer from "../components/Footer"

/* TradeDesk — coming soon. Sizzle only; the desk opens to $SCOM holders at launch. */

const FEATURES = [
  { icon: "📊", title: "On-chain execution", desc: "Swap, LP, and rebalance across Base DEXs from one desk — no tab-hopping." },
  { icon: "🤖", title: "Agent automation", desc: "Hand routine strategies to the fleet: DCA, yield rotation, and risk guards." },
  { icon: "🛡️", title: "Risk controls", desc: "Position limits, slippage guards, and alerts tuned to your treasury." },
  { icon: "🔑", title: "$SCOM gated", desc: "Early access for token holders. Stake to unlock desk tiers." },
]

export default function TradeDesk() {
  return (
    <PublicLayout title="SUPERCOMPUTE · TradeDesk">
      <div className="landing">
        <section className="l-hero">
          <div className="l-eyebrow">
            <span><span className="gold">./tradedesk</span> --supercompute</span>
            <span className="l-caret" />
          </div>
          <h1 className="headline">TradeDesk</h1>
          <div className="subheader">Coming soon</div>
          <p className="hero-copy">
            On-chain trading, portfolio tooling, and desk automation for the Supercompute
            fleet. Built on Base, gated to $SCOM holders at launch.
          </p>
          <div style={{ marginTop: 32, display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/auth" className="btn btn-primary">Get early access</Link>
            <Link href="/publishing" className="btn btn-outline">Follow updates</Link>
          </div>
        </section>
      </div>

      <div className="tpl-community">
        <section className="section">
          <div className="section-header">
            <div className="label">// status</div>
            <div><h2 className="display-md">What's Coming</h2></div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <span className="live-pill off"><span className="dot" /> In development · Phase 1</span>
          </div>

          <div className="social-grid">
            {FEATURES.map((f) => (
              <div key={f.title} className="social-card" style={{ cursor: "default" }}>
                <div className="social-icon">{f.icon}</div>
                <div className="social-name">{f.title}</div>
                <div className="social-handle" style={{ lineHeight: 1.6 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="section" style={{ borderBottom: "none", textAlign: "center" }}>
          <p style={{ fontSize: 14, color: "var(--mono-blue)", lineHeight: 1.8, maxWidth: 520, margin: "0 auto 24px" }}>
            Launch dates and beta invites roll out through NewsDesk and our social channels.
            Join now to be first in line.
          </p>
          <Link href="/auth" className="btn btn-primary" style={{ padding: "16px 32px" }}>Join the waitlist</Link>
        </section>
      </div>

      <Footer />
    </PublicLayout>
  )
}
