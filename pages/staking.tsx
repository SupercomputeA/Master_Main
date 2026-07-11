import PublicLayout from "../components/PublicLayout"
import Footer from "../components/Footer"

export default function Staking() {
  return (
    <PublicLayout title="SUPERCOMPUTE · Staking">
      <section className="hero" id="staking">
        <div className="hero-kicker">
          <div className="status-dot" />
          <span className="label">// staking</span>
        </div>
        <h1 className="display-xl hero-title">
          STAKE<br /><em>$SCOM</em>
        </h1>
        <p className="hero-sub">
          50% of all sub-token trading fees route back to $SCOM stakers
          via FeeRouter.sol. Stake on Base, earn from protocol revenue.
        </p>
      </section>

      <section className="section">
        <div style={{ background: "var(--surface)", border: "1px solid var(--border-accent)", padding: "60px 32px", textAlign: "center" }}>
          <div style={{ fontSize: 32, marginBottom: 16 }}>⏳</div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 22, color: "var(--accent)", marginBottom: 12 }}>
            Coming after $SCOM TGE
          </div>
          <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6, maxWidth: 460, margin: "0 auto" }}>
            Staking opens after the $SCOM token generation event. Follow{" "}
            <a href="https://twitter.com/supercompute_io" target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)" }}>
              @supercompute_io
            </a>{" "}
            for the date.
          </p>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--muted)", marginTop: 24, letterSpacing: "0.1em", textTransform: "uppercase" }}>
            // staking module · not yet armed
          </div>
        </div>
      </section>

      <Footer />
    </PublicLayout>
  )
}
