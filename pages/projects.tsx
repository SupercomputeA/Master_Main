import Layout from "../components/Layout"
import Footer from "../components/Footer"
import { useAuth } from "../lib/auth"
import Link from "next/link"

const wizardSteps = [
  { num: 1, label: "Ideation", desc: "Define project scope, goals, and tokenomics." },
  { num: 2, label: "Build", desc: "Develop smart contracts, agent integration, and UI." },
  { num: 3, label: "Audit", desc: "Security review, milestone verification, and agent attestation." },
  { num: 4, label: "Launch", desc: "Deploy on-chain, open funding, and begin operations." },
  { num: 5, label: "Operate", desc: "Ongoing management, milestone updates, and community engagement." },
]

const projects = [
  { id: "quanta-s", name: "Quanta S", tagline: "Autonomous agent managing DeFi positions on Base", step: 5, status: "Operate", statusColor: "var(--teal)" },
  { id: "openclaw", name: "OpenClaw", tagline: "Decentralized yield aggregation protocol", step: 5, status: "Operate", statusColor: "var(--teal)" },
  { id: "knight", name: "KNIGHT", tagline: "Infrastructure monitoring and alerting agent", step: 5, status: "Operate", statusColor: "var(--teal)" },
  { id: "tradedesk", name: "TradeDesk", tagline: "Multi-chain trading terminal with agent execution", step: 3, status: "Audit", statusColor: "var(--accent)" },
  { id: "agent-fleet", name: "Agent Fleet API", tagline: "Unified API for all 13 Supercompute agents", step: 4, status: "Launch", statusColor: "var(--accent)" },
  { id: "staking-vaults", name: "Staking Vaults", tagline: "Automated yield strategies with multi-sig security", step: 5, status: "Operate", statusColor: "var(--teal)" },
]

export default function Projects() {
  const { session } = useAuth()

  return (
    <Layout title="SUPERCOMPUTE · Projects">
      <section className="hero" id="projects">
        <div className="hero-kicker">
          <div className="status-dot"></div>
          <span className="label">// projects</span>
        </div>
        <h1 className="display-xl hero-title">
          PROJECT<br /><em>DASHBOARD</em>
        </h1>
        <p className="hero-sub">
          Manage projects from ideation through launch and operations.
          Each project has an assigned agent, a token, and on-chain milestones.
        </p>
        {session && (
          <div className="hero-actions">
            <Link href="/projects/builder" className="btn btn-primary">// New Project</Link>
          </div>
        )}
      </section>

      <section className="section">
        <div className="section-header">
          <div className="label">// lifecycle</div>
          <div><h2 className="display-md">Project Lifecycle Wizard</h2></div>
        </div>
        <div style={{ display: "flex", gap: 1, background: "var(--border)", border: "1px solid var(--border)", marginBottom: 48 }}>
          {wizardSteps.map((s, i) => (
            <div key={s.num} style={{
              flex: 1, background: "var(--bg)", padding: "20px 16px",
              borderRight: i < wizardSteps.length - 1 ? "1px solid var(--border)" : "none",
            }}>
              <div style={{
                fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--accent)",
                border: "1px solid var(--border-accent)", padding: "2px 8px", display: "inline-block", marginBottom: 8,
              }}>STEP {s.num}</div>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4, color: "var(--fg)" }}>{s.label}</div>
              <div style={{ fontSize: 10, color: "var(--muted)", lineHeight: 1.5 }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <div className="label">// portfolio</div>
          <div><h2 className="display-md">Active Projects</h2></div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 1, background: "var(--border)", border: "1px solid var(--border)" }}>
          {projects.map((p) => (
            <div key={p.id} style={{ background: "var(--bg)", padding: 0 }}>
              <div style={{ height: 100, background: "linear-gradient(135deg, var(--surface) 0%, var(--bg-alt) 100%)", display: "flex", alignItems: "center", justifyContent: "center", borderBottom: "1px solid var(--border)", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 12, right: 12, fontFamily: "var(--font-mono)", fontSize: 8, color: p.statusColor, border: "1px solid var(--border)", padding: "2px 8px" }}>{p.status}</div>
                <div style={{ position: "absolute", top: 12, left: 12, fontFamily: "var(--font-mono)", fontSize: 8, color: "var(--muted)", border: "1px solid var(--border)", padding: "2px 8px" }}>STEP {p.step}/5</div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 700, color: "var(--accent)", opacity: 0.2 }}>{p.name.toUpperCase()}</div>
              </div>
              <div style={{ padding: "18px 20px" }}>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{p.name}</div>
                <div style={{ fontSize: 11, color: "var(--muted)", lineHeight: 1.5, marginBottom: 12 }}>{p.tagline}</div>
                <div style={{ display: "flex", gap: 6 }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--accent)", border: "1px solid var(--border-accent)", padding: "3px 8px" }}>// agent assigned</span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--muted)", border: "1px solid var(--border)", padding: "3px 8px" }}>on-chain</span>
                </div>
                <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
                  <Link href={`/projects/${p.id}`} className="btn-connect" style={{ fontSize: 10, padding: "6px 14px", textDecoration: "none" }}>View →</Link>
                  <span className="btn-connect" style={{ fontSize: 10, padding: "6px 14px", opacity: 0.6, cursor: "default" }}>Update</span>
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
