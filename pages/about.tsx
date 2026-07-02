import Link from "next/link"
import PublicLayout from "../components/PublicLayout"
import Footer from "../components/Footer"

const timeline = [
  { year: "2013", event: "Occupy LA — First exposure to crypto. Started mining and building on Bitcoin." },
  { year: "2016", event: "Ethereum discovery. Began writing smart contracts and contributing to early DeFi protocols." },
  { year: "2018", event: "Survived the crypto winter. Built treasury management tools for DAOs." },
  { year: "2020", event: "DeFi Summer. Shipped first yield aggregation protocol. Onboarded 200+ farmers." },
  { year: "2022", event: "Base Chain launch. Migrated all operations to L2. Began agent development." },
  { year: "2024", event: "First autonomous agent (OpenClaw) deployed. Fleet expanded to 3 agents." },
  { year: "2025", event: "Quanta S launched on Virtuals Protocol. NewsDesk goes live." },
  { year: "2026", event: "Phase 1 complete. $SCOM token, Web3 School, TradeDesk all operational." },
]

export default function About() {
  return (
    <PublicLayout title="SUPERCOMPUTE · About us">
      <div className="landing">
        <section className="l-hero">
          <div className="l-eyebrow">
            <span><span className="gold">./about</span> --supercompute</span>
            <span className="l-caret" />
          </div>
          <h1 className="headline">About us</h1>
          <div className="subheader">One operator since 2013</div>
          <p className="hero-copy">
            Not a company. Not a DAO. One person doing hands-on Web3 work for founders who
            ship. Fourteen projects, thirteen agents, zero incidents.
          </p>
          <div style={{ marginTop: 32, display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/auth" className="btn btn-primary">Work with us</Link>
            <Link href="/publishing" className="btn btn-outline">NewsDesk</Link>
          </div>
        </section>
      </div>

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

      <section className="section">
        <div className="section-header">
          <div className="label">// knowledge graph</div>
          <div>
            <h2 className="display-md">Entity Map</h2>
            <p style={{ fontSize: 13, color: "var(--mono-blue)", marginTop: 8, maxWidth: 480, lineHeight: 1.7 }}>
              Three interconnected knowledge graphs powering entity discovery across school curricula,
              protocol ecosystems, and public data.
            </p>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1, border: "1px solid var(--border)" }}>
          <a href="/knowledge-graph?graph=school" style={{ padding: "24px", textDecoration: "none", color: "inherit", borderBottom: "1px solid var(--border)" }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 20, marginBottom: 8 }}>📚</div>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4, color: "var(--cream)" }}>School KG</div>
            <div style={{ fontSize: 11, color: "var(--mono-blue)", lineHeight: 1.5 }}>
              9 modules, prerequisite chains, credential paths. Visualize your learning track.
            </div>
          </a>
          <a href="/knowledge-graph?graph=police" style={{ padding: "24px", textDecoration: "none", color: "inherit", borderBottom: "1px solid var(--border)" }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 20, marginBottom: 8 }}>🚔</div>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4, color: "var(--cream)" }}>Police Data KG</div>
            <div style={{ fontSize: 11, color: "var(--mono-blue)", lineHeight: 1.5 }}>
              NYPD misconduct records — officers, incidents, complaints, and department relationships.
            </div>
          </a>
          <a href="/knowledge-graph?graph=defi" style={{ padding: "24px", textDecoration: "none", color: "inherit", borderBottom: "1px solid var(--border)" }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 20, marginBottom: 8 }}>🏦</div>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4, color: "var(--cream)" }}>DeFi / ReFi KG</div>
            <div style={{ fontSize: 11, color: "var(--mono-blue)", lineHeight: 1.5 }}>
              Protocols, tokens, agents on Base Chain. Explore composability relationships.
            </div>
          </a>
        </div>
        <div style={{ marginTop: 16 }}>
          <a href="/knowledge-graph" className="btn btn-outline">Open Knowledge Graph →</a>
        </div>
      </section>

      <Footer />
    </PublicLayout>
  )
}
