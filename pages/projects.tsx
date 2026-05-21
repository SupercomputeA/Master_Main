import Layout from "../components/Layout"
import Footer from "../components/Footer"
import { useAuth } from "../lib/auth"

const projects = [
  { id: "quanta-s", name: "Quanta S", tagline: "Autonomous agent managing DeFi positions on Base", token: "$QNTA", tokenPrice: "$0.042", goal: "500,000", raised: "342,000", investors: 87, quantaRequired: 100, status: "Active", progress: 68, chain: "Base", photo: null },
  { id: "openclaw", name: "OpenClaw", tagline: "Decentralized yield aggregation protocol", token: "$CLAW", tokenPrice: "$0.018", goal: "250,000", raised: "210,000", investors: 53, quantaRequired: 50, status: "Active", progress: 84, chain: "Base", photo: null },
  { id: "knight", name: "KNIGHT", tagline: "Infrastructure monitoring and alerting agent", token: "$KNT", tokenPrice: "$0.035", goal: "180,000", raised: "95,000", investors: 41, quantaRequired: 75, status: "Active", progress: 52, chain: "Base", photo: null },
  { id: "tradedesk", name: "TradeDesk", tagline: "Multi-chain trading terminal with agent execution", token: "$TDK", tokenPrice: "$0.12", goal: "800,000", raised: "280,000", investors: 124, quantaRequired: 250, status: "Beta", progress: 35, chain: "Base, Arb", photo: null },
  { id: "agent-fleet", name: "Agent Fleet API", tagline: "Unified API for all 13 Supercompute agents", token: "$FLEET", tokenPrice: "$0.08", goal: "1,000,000", raised: "450,000", investors: 203, quantaRequired: 150, status: "Active", progress: 45, chain: "Base", photo: null },
  { id: "staking-vaults", name: "Staking Vaults", tagline: "Automated yield strategies with multi-sig security", token: "$VAULT", tokenPrice: "$0.06", goal: "350,000", raised: "340,000", investors: 76, quantaRequired: 50, status: "Active", progress: 97, chain: "Base", photo: null },
]

export default function Projects() {
  const { session, profile } = useAuth()

  return (
    <Layout title="SUPERCOMPUTE · Projects">
      <section className="hero" id="projects">
        <div className="hero-kicker">
          <div className="status-dot"></div>
          <span className="label">// projects</span>
        </div>
        <h1 className="display-xl hero-title">
          INVEST<br /><em>IN PROJECTS</em>
        </h1>
        <p className="hero-sub">
          Member-exclusive project funding. Each project has its own token.
          Hold $QUANTA to access and invest. Track progress via IA agent updates.
        </p>
        {!session && (
          <div className="hero-actions">
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--accent)", border: "1px solid var(--border-accent)", padding: "10px 18px", display: "inline-block" }}>
              Connect wallet → Hold $QUANTA → Invest in projects
            </div>
          </div>
        )}
      </section>

      <section className="section">
        <div className="section-header">
          <div className="label">// opportunities</div>
          <div>
            <h2 className="display-md">Active Projects</h2>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 1, background: "var(--border)", border: "1px solid var(--border)" }}>
          {projects.map((p) => (
            <div key={p.id} style={{ background: "var(--bg)", padding: 0 }}>
              <div style={{ height: 120, background: "linear-gradient(135deg, var(--surface) 0%, var(--bg-alt) 100%)", display: "flex", alignItems: "center", justifyContent: "center", borderBottom: "1px solid var(--border)", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 12, right: 12, fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--accent)", border: "1px solid var(--border-accent)", padding: "3px 8px" }}>{p.chain}</div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 700, color: "var(--accent)", opacity: 0.3 }}>{p.name.toUpperCase()}</div>
              </div>
              <div style={{ padding: "18px 20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700 }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{p.tagline}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--accent)" }}>{p.token}</div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--muted)" }}>{p.tokenPrice}</div>
                  </div>
                </div>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--muted)", marginBottom: 4 }}>
                    <span>${p.raised.toLocaleString()} raised</span>
                    <span>Goal: ${p.goal.toLocaleString()}</span>
                  </div>
                  <div style={{ height: 4, background: "var(--border)", borderRadius: 2, overflow: "hidden" }}>
                    <div style={{ width: `${p.progress}%`, height: "100%", background: "var(--accent)", borderRadius: 2 }}></div>
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--muted)" }}>
                    {p.investors} investors · Requires {p.quantaRequired} $QUANTA
                  </div>
                  {session ? (
                    <a href={`/projects/${p.id}`} className="btn-connect" style={{ fontSize: 10, padding: "6px 14px", textDecoration: "none" }}>View →</a>
                  ) : (
                    <span className="btn-connect" style={{ fontSize: 10, padding: "6px 14px", opacity: 0.4 }}>Locked</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </Layout>
  )
}
