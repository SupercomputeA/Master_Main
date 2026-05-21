import { useRouter } from "next/router"
import Layout from "../../components/Layout"
import Footer from "../../components/Footer"
import { useAuth } from "../../lib/auth"

const projectData: Record<string, {
  id: string; name: string; tagline: string; desc: string; token: string; tokenName: string;
  tokenPrice: string; goal: string; raised: string; investors: number; quantaRequired: number;
  status: string; progress: number; chain: string; category: string; tvl: string; agents: number;
  updates: { from: string; date: string; text: string; type: string }[];
}> = {
  "quanta-s": {
    id: "quanta-s", name: "Quanta S", tagline: "Autonomous agent managing DeFi positions on Base",
    desc: "Quanta S is a fully autonomous AI agent that manages DeFi positions on Base Chain. It executes trades, rebalances portfolios, and optimizes yield strategies without human intervention. The agent operates 24/7 and has completed over 1,400 tasks with zero incidents.",
    token: "$QNTA", tokenName: "Quanta Token", tokenPrice: "$0.042", goal: "500000", raised: "342000",
    investors: 87, quantaRequired: 100, status: "Active", progress: 68, chain: "Base", category: "Agent", tvl: "$420K", agents: 1,
    updates: [
      { from: "Quanta S", date: "2026-05-20", text: "Rebalanced SCOM/ETH LP — ratio adjusted to 60/40. Gas optimized.", type: "agent" },
      { from: "Quanta S", date: "2026-05-19", text: "Swapped 2.5 ETH → 4,200 USDC on Base with 0.03% slippage.", type: "agent" },
      { from: "Admin", date: "2026-05-18", text: "Milestone Q2 achieved: TVL crossed $420K. Next target: $500K.", type: "milestone" },
      { from: "Quanta S", date: "2026-05-17", text: "Detected gas spike. Paused all pending transactions automatically.", type: "agent" },
      { from: "Admin", date: "2026-05-15", text: "New strategy module deployed: auto-arbitrage between Uniswap V3 pools.", type: "update" },
    ]
  },
  "openclaw": {
    id: "openclaw", name: "OpenClaw", tagline: "Decentralized yield aggregation protocol",
    desc: "OpenClaw aggregates yield opportunities across multiple protocols on Base. It automatically routes capital to the highest-yielding pools, manages risk exposure, and rebalances based on market conditions.",
    token: "$CLAW", tokenName: "Claw Token", tokenPrice: "$0.018", goal: "250000", raised: "210000",
    investors: 53, quantaRequired: 50, status: "Active", progress: 84, chain: "Base", category: "DeFi", tvl: "$230K", agents: 1,
    updates: [
      { from: "OpenClaw", date: "2026-05-19", text: "Yield optimization run complete. Average APY improved to 14.2%.", type: "agent" },
      { from: "Admin", date: "2026-05-16", text: "Milestone: 200 unique depositors. Community rewards unlocked.", type: "milestone" },
      { from: "OpenClaw", date: "2026-05-14", text: "New pool detected: Aerodrome v3 USDC/DAI. Auto-integration complete.", type: "agent" },
    ]
  },
  "knight": {
    id: "knight", name: "KNIGHT", tagline: "Infrastructure monitoring and alerting agent",
    desc: "KNIGHT provides real-time infrastructure monitoring for the Supercompute fleet. It tracks agent health, RPC endpoints, gas prices, and anomaly detection across all systems.",
    token: "$KNT", tokenName: "Knight Token", tokenPrice: "$0.035", goal: "180000", raised: "95000",
    investors: 41, quantaRequired: 75, status: "Active", progress: 52, chain: "Base", category: "Infra", tvl: "$180K", agents: 1,
    updates: [
      { from: "KNIGHT", date: "2026-05-20", text: "24h uptime: 99.97%. All 13 agents operational.", type: "agent" },
      { from: "KNIGHT", date: "2026-05-18", text: "Alert: Gas spike detected on Base. Threshold: 15 gwei.", type: "agent" },
      { from: "Admin", date: "2026-05-15", text: "New monitoring dashboard deployed. Real-time metrics now available.", type: "update" },
    ]
  },
}

export default function ProjectDetail() {
  const router = useRouter()
  const { session } = useAuth()
  const { id } = router.query
  const project = typeof id === "string" ? projectData[id] : null

  if (!project) {
    return (
      <Layout title="SUPERCOMPUTE · Project">
        <section className="section"><div style={{ padding: "60px 24px", textAlign: "center", color: "var(--muted)", fontSize: 13 }}>Project not found.</div></section>
      </Layout>
    )
  }

  return (
    <Layout title={`SUPERCOMPUTE · ${project.name}`}>
      <section className="hero" id="project-detail">
        <div className="hero-kicker"><div className="status-dot"></div><span className="label">// {project.id}</span></div>
        <h1 className="display-xl hero-title">{project.name}<br /><em>{project.token}</em></h1>
        <p className="hero-sub">{project.tagline}</p>
        <div className="hero-meta" style={{ marginTop: 20 }}>
          <div className="meta-item"><div className="label-sm">// Status</div><div className="val" style={{ color: "var(--accent)" }}>{project.status}</div></div>
          <div className="meta-item"><div className="label-sm">// Chain</div><div className="val">{project.chain}</div></div>
          <div className="meta-item"><div className="label-sm">// TVL</div><div className="val">{project.tvl}</div></div>
          <div className="meta-item"><div className="label-sm">// Token</div><div className="val" style={{ color: "var(--accent)" }}>{project.token} @ {project.tokenPrice}</div></div>
        </div>
      </section>

      <section className="section">
        <div className="section-header"><div className="label">// about</div><div><h2 className="display-md">About {project.name}</h2></div></div>
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "24px" }}>
          <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.7 }}>{project.desc}</p>
        </div>
      </section>

      <section className="section">
        <div className="section-header"><div className="label">// funding</div><div><h2 className="display-md">Investment</h2></div></div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, background: "var(--border)", border: "1px solid var(--border)", marginBottom: 20 }}>
          <div style={{ background: "var(--bg)", padding: "20px" }}>
            <div className="label-sm" style={{ marginBottom: 4 }}>// Raised</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 700, color: "var(--accent)" }}>${Number(project.raised).toLocaleString()}</div>
            <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>of ${Number(project.goal).toLocaleString()} goal</div>
          </div>
          <div style={{ background: "var(--bg)", padding: "20px" }}>
            <div className="label-sm" style={{ marginBottom: 4 }}>// Token Price</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 700, color: "var(--accent)" }}>{project.tokenPrice}</div>
            <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>{project.token} · {project.investors} investors</div>
          </div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--muted)", marginBottom: 6 }}>
            <span>${Number(project.raised).toLocaleString()} raised</span>
            <span>{project.progress}% · ${Number(project.goal).toLocaleString()} goal</span>
          </div>
          <div style={{ height: 6, background: "var(--border)", borderRadius: 3, overflow: "hidden" }}>
            <div style={{ width: `${project.progress}%`, height: "100%", background: "var(--accent)", borderRadius: 3 }}></div>
          </div>
        </div>
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 4 }}>Requires {project.quantaRequired} $QUANTA to invest</div>
              <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--accent)" }}>Min investment: $100</div>
            </div>
            {session ? (
              <button className="btn-connect" style={{ fontSize: 11 }}>Invest Now</button>
            ) : (
              <div className="btn-connect" style={{ fontSize: 11, opacity: 0.4 }}>Connect to Invest</div>
            )}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-header"><div className="label">// ia updates</div><div><h2 className="display-md">Agent Activity</h2></div></div>
        <div style={{ display: "flex", flexDirection: "column", gap: 1, background: "var(--border)", border: "1px solid var(--border)" }}>
          {project.updates.map((u, i) => (
            <div key={i} style={{ background: "var(--bg)", padding: "16px 20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{
                    fontFamily: "var(--font-mono)", fontSize: 9, padding: "2px 6px",
                    background: u.from === "Admin" ? "var(--accent-dim)" : "var(--teal-dim)",
                    color: u.from === "Admin" ? "var(--accent)" : "var(--teal)",
                    border: `1px solid ${u.from === "Admin" ? "var(--border-accent)" : "var(--teal-dim)"}`,
                  }}>
                    {u.type.toUpperCase()}
                  </span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--accent)" }}>{u.from}</span>
                </div>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--muted)" }}>{u.date}</span>
              </div>
              <p style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.6 }}>{u.text}</p>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </Layout>
  )
}
