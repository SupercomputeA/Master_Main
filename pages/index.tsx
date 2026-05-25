import Layout from "../components/Layout"
import Footer from "../components/Footer"

export default function Home() {
  return (
    <Layout title="SUPERCOMPUTE · Sovereign Compute Infrastructure">
      <section className="hero">
        <div className="hero-kicker">
          <div className="status-dot"></div>
          <span className="label">// terminal · sovereign</span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--accent)", border: "1px solid var(--accent-dim)", padding: "2px 8px", marginLeft: 8 }}>
            PHASE 1
          </span>
        </div>
        <h1 style={{
          fontFamily: "var(--font-logo)", fontSize: "clamp(48px, 10vw, 100px)",
          fontWeight: 400, lineHeight: 1, marginBottom: 8, color: "var(--accent)",
          letterSpacing: "0.02em",
        }}>
          SUPERCOMPUTE
        </h1>
        <p style={{
          fontFamily: "var(--font-logo)", fontSize: "clamp(28px, 5vw, 50px)",
          fontWeight: 400, lineHeight: 1, marginBottom: 24, color: "var(--muted)",
          letterSpacing: "0.02em",
        }}>
          driving innovation
        </p>
        <p className="hero-sub" style={{ maxWidth: 600, fontSize: 14 }}>
          Sovereign compute infrastructure for the on-chain era. Agent fleet, protocol evaluations, and community-governed treasury on Base Chain.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1, background: "var(--border)", border: "1px solid var(--border)", marginBottom: 0 }}>
          <div style={{ background: "var(--bg)", padding: "24px 20px" }}>
            <div className="label-sm" style={{ marginBottom: 4 }}>// NewsDesk</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 700, color: "var(--accent)" }}>LIVE</div>
            <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>Daily publishing · 6 articles</div>
          </div>
          <div style={{ background: "var(--bg)", padding: "24px 20px" }}>
            <div className="label-sm" style={{ marginBottom: 4 }}>// School</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 700, color: "var(--accent)" }}>LIVE</div>
            <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>4 modules · Free access</div>
          </div>
          <div style={{ background: "var(--bg)", padding: "24px 20px" }}>
            <div className="label-sm" style={{ marginBottom: 4 }}>// TradeDesk</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 700, color: "var(--muted)" }}>BUILD</div>
            <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>Observer mode active</div>
          </div>
        </div>
      </section>

      <Footer />
    </Layout>
  )
}
