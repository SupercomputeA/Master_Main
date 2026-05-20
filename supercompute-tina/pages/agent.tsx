import Layout from "../components/Layout"
import Footer from "../components/Footer"

const agent = {
  id: "agent-001",
  name: "KNIGHT",
  status: "active",
  framework: "ElizaOS",
  chain: "Base",
  wallet: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
  uptime: "99.97%",
  lastActive: "Just now",
  capabilities: ["Trade Execution", "Risk Analysis", "Portfolio Rebalance", "Arbitrage Detection"],
  memory: "2.4 GB / 4 GB",
  cpu: "12%",
  tasksCompleted: 1483,
  totalValueManaged: "$180K",
}

const recentActions = [
  { time: "14:23:05", action: "Swapped 2.5 ETH → 4,200 USDC on Base (0.03% slippage)" },
  { time: "14:18:12", action: "Rebalanced SCOM/ETH LP — ratio adjusted to 60/40" },
  { time: "14:02:44", action: "Detected gas spike. Paused all pending transactions." },
  { time: "13:55:30", action: "Executed limit order: Buy 500 SCOM @ $0.42" },
  { time: "13:41:09", action: "Arbitrage opportunity identified. Profit: 0.12 ETH" },
  { time: "13:22:18", action: "Submitted governance vote on SCP-044" },
]

export default function Agent() {
  return (
    <Layout title="SUPERCOMPUTE · Agent">
      <section className="hero" id="agent">
        <div className="hero-kicker">
          <div className="status-dot"></div>
          <span className="label">// admin · agent</span>
        </div>
        <h1 className="display-xl hero-title">
          {agent.name}<br /><em>STATUS</em>
        </h1>
        <div className="hero-meta" style={{ marginTop: 20 }}>
          <div className="meta-item">
            <div className="label-sm">// Status</div>
            <div className="val" style={{ color: "var(--accent)" }}>{agent.status}</div>
          </div>
          <div className="meta-item">
            <div className="label-sm">// Framework</div>
            <div className="val">{agent.framework}</div>
          </div>
          <div className="meta-item">
            <div className="label-sm">// Chain</div>
            <div className="val">{agent.chain}</div>
          </div>
          <div className="meta-item">
            <div className="label-sm">// Uptime</div>
            <div className="val">{agent.uptime}</div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <div className="label">// metrics</div>
          <div>
            <h2 className="display-md">Live Telemetry</h2>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, background: "var(--border)", border: "1px solid var(--border)", marginBottom: 24 }}>
          <div style={{ background: "var(--bg)", padding: "18px 20px" }}>
            <div className="label-sm" style={{ marginBottom: 4 }}>// Tasks Completed</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 24, color: "var(--accent)" }}>{agent.tasksCompleted.toLocaleString()}</div>
          </div>
          <div style={{ background: "var(--bg)", padding: "18px 20px" }}>
            <div className="label-sm" style={{ marginBottom: 4 }}>// Value Managed</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 24, color: "var(--accent)" }}>{agent.totalValueManaged}</div>
          </div>
          <div style={{ background: "var(--bg)", padding: "18px 20px" }}>
            <div className="label-sm" style={{ marginBottom: 4 }}>// Memory</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 14, color: "var(--fg)" }}>{agent.memory}</div>
          </div>
          <div style={{ background: "var(--bg)", padding: "18px 20px" }}>
            <div className="label-sm" style={{ marginBottom: 4 }}>// CPU</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 14, color: "var(--fg)" }}>{agent.cpu}</div>
          </div>
        </div>
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "16px 20px" }}>
          <div className="label-sm" style={{ marginBottom: 8 }}>// Capabilities</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {agent.capabilities.map((c, i) => (
              <span key={i} style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--accent)", border: "1px solid var(--border-accent)", padding: "4px 10px" }}>{c}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <div className="label">// feed</div>
          <div>
            <h2 className="display-md">Action Log</h2>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 1, background: "var(--border)", border: "1px solid var(--border)" }}>
          {recentActions.map((a, i) => (
            <div key={i} style={{ background: "var(--bg)", padding: "12px 20px", fontSize: 12, fontFamily: "var(--font-mono)", display: "grid", gridTemplateColumns: "80px 1fr", gap: 12 }}>
              <span style={{ color: "var(--accent)" }}>{a.time}</span>
              <span style={{ color: "var(--muted)" }}>{a.action}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <div className="label">// wallet</div>
          <div>
            <h2 className="display-md">On-Chain Identity</h2>
          </div>
        </div>
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "16px 20px", fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--muted)", wordBreak: "break-all" }}>
          {agent.wallet}
        </div>
      </section>

      <Footer />
    </Layout>
  )
}
