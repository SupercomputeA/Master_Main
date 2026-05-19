import Layout from "../components/Layout"
import Footer from "../components/Footer"

const timeline = [
  { year: "2013", event: "Occupy LA — First exposure to crypto. Started mining and building on Bitcoin." },
  { year: "2016", event: "Ethereum discovery. Began writing smart contracts and contributing to early DeFi protocols." },
  { year: "2018", event: "Survived the crypto winter. Built treasury management tools for DAOs." },
  { year: "2020", event: "DeFi Summer. Shipped first yield aggregation protocol. Onboarded 200+ farmers." },
  { year: "2022", event: "Base Chain launch. Migrated all operations to L2. Began agent development." },
  { year: "2024", event: "First autonomous agent (OpenClaw) deployed. Fleet expanded to 13 agents." },
  { year: "2025", event: "Quanta S launched on Virtuals Protocol. NewsDesk goes live." },
  { year: "2026", event: "Phase 1 complete. $SCOM token, Web3 School, TradeDesk all operational." },
]

export default function About() {
  return (
    <Layout title="SUPERCOMPUTE · About">
      <section className="hero" id="about">
        <div className="hero-kicker">
          <div className="status-dot"></div>
          <span className="label">// about</span>
        </div>
        <h1 className="display-xl hero-title">
          ONE OPERATOR<br /><em>SINCE 2013</em>
        </h1>
        <p className="hero-sub">
          Not a company. Not a DAO. One person doing hands-on Web3 work
          for founders who ship. Fourteen projects, thirteen agents, zero incidents.
        </p>
      </section>

      <section className="section">
        <div className="section-header">
          <div className="label">// doctrine</div>
          <div>
            <h2 className="display-md">How I Work</h2>
          </div>
        </div>
        <div className="operator-grid">
          <div className="op-cell">
            <div className="op-tag">Hands-on</div>
            <p className="op-bio" style={{ fontSize: 13, lineHeight: 1.75, color: "var(--muted)" }}>
              I don&apos;t outsource the work. If you hire me, I&apos;m the one
              writing contracts, configuring agents, and managing your treasury.
            </p>
          </div>
          <div className="op-cell">
            <div className="op-tag">Values</div>
            <p className="op-bio" style={{ fontSize: 13, lineHeight: 1.75, color: "var(--muted)" }}>
              Principled before profitable. Liberation over extraction. No
              speculative plays, no roadmap theatre, no empty promises.
            </p>
          </div>
          <div className="op-cell">
            <div className="op-tag">Pro Expansion</div>
            <p className="op-bio" style={{ fontSize: 13, lineHeight: 1.75, color: "var(--muted)" }}>
              I build for scale. Every project is designed to grow beyond
              the initial scope — with agents, automation, and on-chain ops.
            </p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <div className="label">// timeline</div>
          <div>
            <h2 className="display-md">The Journey</h2>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 1, background: "var(--border)", border: "1px solid var(--border)" }}>
          {timeline.map((t, i) => (
            <div key={i} style={{ background: "var(--bg)", padding: "18px 24px", display: "grid", gridTemplateColumns: "80px 1fr", gap: 20, alignItems: "start" }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, color: "var(--accent)" }}>{t.year}</div>
              <div style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6 }}>{t.event}</div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </Layout>
  )
}
