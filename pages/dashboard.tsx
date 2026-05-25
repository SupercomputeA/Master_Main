import Layout from "../components/Layout"
import Footer from "../components/Footer"
import AgentFleetComponent from "../components/AgentFleet"
import { useState } from "react"

const agents = [
  { name: "Hermescommand", role: "coordinator", status: "active", tasks: 1427, uptime: "99.97%", lastActive: "now" },
  { name: "OpenClaw", role: "infrastructure · primary operator", status: "active", tasks: 893, uptime: "99.94%", lastActive: "now" },
  { name: "Quanta S", role: "newsdesk · intelligence", status: "active", tasks: 567, uptime: "99.88%", lastActive: "2m ago" },
]

const recentActivity = [
  { agent: "Quanta S", action: "Published protocol evaluation: Aave V3 on Base", time: "14m ago", type: "publish" },
  { agent: "OpenClaw", action: "Automated social post to X / Farcaster", time: "1h ago", type: "social" },
  { agent: "Quanta S", action: "Draft: Token Gating Deep Dive complete", time: "2h ago", type: "draft" },
  { agent: "OpenClaw", action: "Linear ticket SC-422 moved to In Progress", time: "4h ago", type: "ticket" },
  { agent: "Hermescommand", action: "Daily standup summary generated", time: "6h ago", type: "report" },
]

export default function Dashboard() {
  const [tab, setTab] = useState<"overview" | "fleet">("overview")

  return (
    <Layout title="SUPERCOMPUTE · Command Center">
      <section className="hero" id="dashboard">
        <div className="hero-kicker"><div className="status-dot"></div><span className="label">// command center</span></div>
        <h1 className="display-xl hero-title">COMMAND<br /><em>CENTER</em></h1>
        <p className="hero-sub">Real-time fleet status, system health, and agent activity. Operator console for the Supercompute stack.</p>
        <div className="hero-meta">
          <div className="meta-item"><div className="label-sm">// Agents Online</div><div className="val" style={{ color: "var(--accent)" }}>3/3</div></div>
          <div className="meta-item"><div className="label-sm">// Fleet Uptime</div><div className="val" style={{ color: "var(--teal)" }}>99.9%</div></div>
          <div className="meta-item"><div className="label-sm">// Tasks Today</div><div className="val">3,121</div></div>
          <div className="meta-item"><div className="label-sm">// Incidents</div><div className="val">0</div></div>
        </div>
      </section>

      <div style={{ display: "flex", gap: 0, borderBottom: "1px solid var(--border)", padding: "0 24px" }}>
        {(["overview", "fleet"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            style={{
              fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase",
              padding: "10px 20px", background: "transparent", color: tab === t ? "var(--accent)" : "var(--muted)",
              border: "none", borderBottom: tab === t ? "2px solid var(--accent)" : "2px solid transparent",
              cursor: "pointer",
            }}
          >
            {t === "overview" ? "// Overview" : "// Agent Fleet"}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <>
          {/* Fleet Health */}
          <section className="section">
            <div className="section-header"><div className="label">// fleet health</div><div><h2 className="display-md">Agent Status</h2></div></div>
            <div className="operator-grid">
              {agents.map((a) => (
                <div key={a.name} className="op-cell">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                    <div>
                      <div className="op-tag">{a.status === "active" ? "● ACTIVE" : "◐ OBSERVER"}</div>
                      <div className="agent-name" style={{ fontSize: 15, marginBottom: 2 }}>{a.name}</div>
                      <div className="agent-role">{a.role}</div>
                    </div>
                    <span style={{
                      fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: "0.1em", textTransform: "uppercase",
                      padding: "3px 8px", border: `1px solid ${a.status === "active" ? "rgba(100,255,150,0.3)" : "var(--accent-dim)"}`,
                      color: a.status === "active" ? "rgba(100,255,150,0.8)" : "var(--accent)",
                    }}>
                      {a.status === "active" ? "● online" : "◐ observer"}
                    </span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 8 }}>
                    <div><div className="op-stat-label">Tasks</div><div className="op-stat" style={{ fontSize: 24 }}>{a.tasks}</div></div>
                    <div><div className="op-stat-label">Uptime</div><div className="op-stat" style={{ fontSize: 24, color: "var(--accent)" }}>{a.uptime}</div></div>
                  </div>
                  <div style={{ marginTop: 8, fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--muted)" }}>
                    Last active: {a.lastActive}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Quick Actions */}
          <section className="section">
            <div className="section-header"><div className="label">// actions</div><div><h2 className="display-md">Quick Commands</h2></div></div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {["Deploy Agent", "Run Diagnostic", "Open Terminal", "View Logs", "System Status"].map((action) => (
                <button key={action} className="btn btn-outline" style={{ fontSize: 10, padding: "10px 18px" }}>
                  → {action}
                </button>
              ))}
            </div>
          </section>

          {/* Recent Activity */}
          <section className="section">
            <div className="section-header"><div className="label">// activity log</div><div><h2 className="display-md">Recent Activity</h2></div></div>
            <div style={{ display: "flex", flexDirection: "column", gap: 1, background: "var(--border)", border: "1px solid var(--border)" }}>
              {recentActivity.map((a, i) => (
                <div key={i} style={{
                  background: "var(--bg)", padding: "12px 20px",
                  display: "grid", gridTemplateColumns: "100px 1fr 70px", gap: 12, alignItems: "center",
                }}>
                  <div style={{
                    fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.1em",
                    color: a.type === "alert" ? "#ff6b35" : "var(--accent)",
                  }}>
                    [{a.agent}]
                  </div>
                  <div style={{ fontSize: 12, color: "var(--fg)", lineHeight: 1.4 }}>{a.action}</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--muted)", textAlign: "right" }}>{a.time}</div>
                </div>
              ))}
            </div>
          </section>

          {/* System Status */}
          <section className="section">
            <div className="section-header"><div className="label">// system</div><div><h2 className="display-md">System Status</h2></div></div>
            <div className="fleet-summary">
              {[
                { label: "RPC Endpoints", value: "4/4", status: "operational" },
                { label: "NewsDesk", value: "Active", status: "operational" },
                { label: "TradeDesk", value: "Observer", status: "limited" },
                { label: "School", value: "Online", status: "operational" },
                { label: "Projects", value: "Active", status: "operational" },
                { label: "Auth Service", value: "Healthy", status: "operational" },
                { label: "D1 Database", value: "Connected", status: "operational" },
                { label: "KV Cache", value: "Synced", status: "operational" },
              ].map((sys, i) => (
                <div key={i} className="fleet-stat" style={{ padding: "16px 12px" }}>
                  <div className="fleet-stat-num" style={{ fontSize: 20, color: sys.status === "operational" ? "var(--teal)" : "var(--accent)" }}>
                    {sys.status === "operational" ? "●" : "◐"} {sys.value}
                  </div>
                  <div className="op-stat-label" style={{ marginTop: 4 }}>{sys.label}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 16, background: "var(--surface)", border: "1px solid var(--border)", padding: "16px 20px" }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--teal)", marginBottom: 4 }}>$ last system check → 14s ago</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--muted)" }}>
                All systems operational. 0 alerts. 0 pending incidents. 3,121 tasks processed today.
              </div>
            </div>
          </section>
        </>
      )}

      {tab === "fleet" && <AgentFleetComponent />}

      <Footer />
    </Layout>
  )
}
