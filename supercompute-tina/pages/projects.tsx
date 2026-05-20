import Layout from "../components/Layout"
import Footer from "../components/Footer"

const projects = [
  { name: "Quanta S", status: "Active", tvl: "$420K", agents: 1, chains: "Base", category: "Agent" },
  { name: "OpenClaw", status: "Active", tvl: "$230K", agents: 1, chains: "Base", category: "DeFi" },
  { name: "KNIGHT", status: "Active", tvl: "$180K", agents: 1, chains: "Base", category: "Infra" },
  { name: "Supercomputers", status: "Active", tvl: "$1.2M", agents: 10, chains: "Base, Eth", category: "Fleet" },
  { name: "Token Dashboard", status: "Live", tvl: "—", agents: 0, chains: "Base", category: "App" },
  { name: "Web3 School", status: "Live", tvl: "—", agents: 0, chains: "Base", category: "Education" },
  { name: "TradeDesk", status: "Beta", tvl: "$65K", agents: 2, chains: "Base, Arb", category: "DeFi" },
  { name: "NewsDesk", status: "Live", tvl: "—", agents: 1, chains: "Base", category: "Media" },
  { name: "StoreFront", status: "Live", tvl: "—", agents: 0, chains: "Base", category: "Commerce" },
  { name: "Publishing", status: "Live", tvl: "—", agents: 1, chains: "Base", category: "Media" },
  { name: "Agent Fleet API", status: "Active", tvl: "$95K", agents: 13, chains: "Base", category: "Infra" },
  { name: "Staking Vaults", status: "Active", tvl: "$340K", agents: 2, chains: "Base", category: "DeFi" },
  { name: "Protocol Migrations", status: "Complete", tvl: "$2.1M", agents: 1, chains: "Base", category: "Ops" },
  { name: "Treasury Ops", status: "Active", tvl: "$4.8M", agents: 3, chains: "Base, Eth", category: "Ops" },
]

const supportItems = [
  { icon: "✦", title: "Smart Contract Deployments", desc: "ERC-20 tokens, NFT collections, DAO frameworks, and custom contracts deployed and verified.", status: "Operational" },
  { icon: "⬡", title: "Agent Infrastructure", desc: "Thirteen agents running 24/7 on Base with automated monitoring and escalation.", status: "Operational" },
  { icon: "◈", title: "CI/CD Pipelines", desc: "Automated builds, tests, and deployments via GitHub Actions + Cloudflare Pages.", status: "Operational" },
  { icon: "▣", title: "Database & Indexing", desc: "D1 database with KV cache layer for on-chain data. Subgraph indexing for real-time queries.", status: "Operational" },
  { icon: "◉", title: "Monitoring & Alerting", desc: "Agent health checks, TVL tracking, gas monitoring, and anomaly detection.", status: "Active Development" },
  { icon: "⊞", title: "Disaster Recovery", desc: "Multi-sig recovery plans, daily snapshots, and redundant RPC endpoints.", status: "Operational" },
]

export default function Projects() {
  return (
    <Layout title="SUPERCOMPUTE · Projects">
      <section className="hero" id="projects">
        <div className="hero-kicker">
          <div className="status-dot"></div>
          <span className="label">// projects</span>
        </div>
        <h1 className="display-xl hero-title">
          SHIPPED<br /><em>IN PUBLIC</em>
        </h1>
        <p className="hero-sub">
          Every project Supercompute has built, funded, or contributed to.
          Tokens, agents, treasury ops, migrations — all on-chain.
        </p>
      </section>

      <section className="section">
        <div className="section-header">
          <div className="label">// portfolio</div>
          <div>
            <h2 className="display-md">Project Config</h2>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 1, background: "var(--border)", border: "1px solid var(--border)" }}>
          <div style={{ background: "var(--surface)", padding: "10px 20px", display: "grid", gridTemplateColumns: "1fr 70px 80px 60px 90px 60px", gap: 12, fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--muted)", textTransform: "uppercase" }}>
            <div>Project</div>
            <div>Status</div>
            <div>TVL</div>
            <div>Agents</div>
            <div>Chains</div>
            <div>Type</div>
          </div>
          {projects.map((p, i) => (
            <div key={i} style={{ background: "var(--bg)", padding: "14px 20px", display: "grid", gridTemplateColumns: "1fr 70px 80px 60px 90px 60px", gap: 12, alignItems: "center" }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{p.name}</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: p.status === "Complete" ? "#666" : "var(--accent)" }}>{p.status}</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--accent)" }}>{p.tvl}</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>{p.agents}</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--muted)" }}>{p.chains}</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--muted)" }}>{p.category}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <div className="label">// support</div>
          <div>
            <h2 className="display-md">Infrastructure Status</h2>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 1, background: "var(--border)", border: "1px solid var(--border)" }}>
          {supportItems.map((s, i) => (
            <div key={i} style={{ background: "var(--bg)", padding: "18px 20px", display: "grid", gridTemplateColumns: "30px 1fr 120px", gap: 12, alignItems: "center" }}>
              <div style={{ fontSize: 18, color: "var(--accent)" }}>{s.icon}</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{s.title}</div>
                <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{s.desc}</div>
              </div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, textAlign: "right", color: s.status === "Operational" ? "var(--accent)" : "var(--muted)" }}>
                <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: s.status === "Operational" ? "var(--accent)" : "#888", marginRight: 6 }}></span>
                {s.status}
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </Layout>
  )
}
