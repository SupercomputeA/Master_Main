import Layout from "../../components/Layout"
import Footer from "../../components/Footer"
import Link from "next/link"

const projects = [
  { id: "quanta-s", name: "Quanta S", tagline: "Autonomous agent managing DeFi positions on Base", chain: "Base", agents: 1, status: "Active" },
  { id: "openclaw", name: "OpenClaw", tagline: "Decentralized yield aggregation protocol", chain: "Base", agents: 1, status: "Active" },
  { id: "knight", name: "KNIGHT", tagline: "Infrastructure monitoring and alerting agent", chain: "Base", agents: 1, status: "Active" },
  { id: "tradedesk", name: "TradeDesk", tagline: "Multi-chain trading terminal with agent execution", chain: "Base, Arb", agents: 1, status: "Beta" },
  { id: "agent-fleet", name: "Agent Fleet API", tagline: "Unified API for all 13 Supercompute agents", chain: "Base", agents: 13, status: "Active" },
  { id: "staking-vaults", name: "Staking Vaults", tagline: "Automated yield strategies with multi-sig security", chain: "Base", agents: 1, status: "Active" },
]

export default function ProjectBrowse() {
  return (
    <Layout title="SUPERCOMPUTE · Projects">
      <section className="hero" id="projects">
        <div className="hero-kicker">
          <div className="status-dot"></div>
          <span className="label">// projects</span>
        </div>
        <h1 className="display-xl hero-title">ECOSYSTEM<br /><em>PROJECTS</em></h1>
        <p className="hero-sub">Browse the Supercompute ecosystem — each project has its own token, agent, and on-chain milestones.</p>
      </section>

      <section className="section">
        <div className="section-header">
          <div className="label">// ecosystem</div>
          <div><h2 className="display-md">All Projects</h2></div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 1, background: "var(--border)", border: "1px solid var(--border)" }}>
          {projects.map((p) => (
            <div key={p.id} style={{ background: "var(--bg)", padding: 0 }}>
              <div style={{ height: 100, background: "linear-gradient(135deg, var(--surface) 0%, var(--bg-alt) 100%)", display: "flex", alignItems: "center", justifyContent: "center", borderBottom: "1px solid var(--border)", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 12, right: 12, fontFamily: "var(--font-mono)", fontSize: 8, color: "var(--accent)", border: "1px solid var(--border)", padding: "2px 8px" }}>{p.chain}</div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 700, color: "var(--accent)", opacity: 0.2 }}>{p.name.toUpperCase()}</div>
              </div>
              <div style={{ padding: "18px 20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{p.tagline}</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--teal)" }}>// {p.status}</span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--muted)" }}>{p.agents} agent{p.agents > 1 ? "s" : ""}</span>
                </div>
                <Link href={`/projects/${p.id}`} className="btn-connect" style={{ fontSize: 10, padding: "6px 14px", textDecoration: "none" }}>View Details →</Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </Layout>
  )
}
