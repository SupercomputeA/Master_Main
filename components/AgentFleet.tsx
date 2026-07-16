const agents = [
  { name: "Hermes", role: "coordinator · command", status: "online", desc: "Local fleet conductor. Routes work between agents, surfaces Kanban status, fans out to Quanta/KNIGHT/OpenClaw as needed." },
  { name: "OpenClaw", role: "infrastructure · primary operator", status: "online", desc: "Browser automation. Social posting (X, Lens, FarFarster), web research, Linear ticket updates, task execution." },
  { name: "Quanta", role: "newsdesk · intelligence", status: "online", desc: "Sovereign content agent. On-chain identity via Virtuals Protocol. Drafts NewsDesk articles, monitors on-chain signals, cross-posts." },
  { name: "KNIGHT", role: "tradedesk · analytics", status: "observer", desc: "Trading agent on Conway Terminal. Observer mode — monitors CDP positions, Polymarket opportunities, treasury. Monitors 24/7." },
]

const UNK = { color: "#ef4444" } as const

export default function AgentFleet() {
  return (
    <section className="section" id="fleet">
      <div className="section-header">
        <div className="label">// ./agents --fleet</div>
        <div><h2 className="display-md">Agent Fleet</h2></div>
      </div>
      <div className="fleet-summary">
        <div className="fleet-stat">
          <div className="fleet-stat-num accent">3</div>
          <div className="op-stat-label">Active</div>
        </div>
        <div className="fleet-stat">
          <div className="fleet-stat-num accent">1</div>
          <div className="op-stat-label">Observer</div>
        </div>
        <div className="fleet-stat">
          <div className="fleet-stat-num" style={{ color: UNK.color }}>—</div>
          <div className="op-stat-label">Dev</div>
        </div>
        <div className="fleet-stat">
          <div className="fleet-stat-num" style={{ color: UNK.color }}>—</div>
          <div className="op-stat-label">Queued</div>
        </div>
      </div>
      <div className="agent-grid" style={{ marginTop: 1 }}>
        {agents.map((agent, i) => (
          <div className="agent-card" key={i}>
            <div>
              <div className="agent-name">{agent.name}</div>
              <div className="agent-role">{agent.role}</div>
            </div>
            <span className={`agent-status ${agent.status}`}>
              {agent.status === "online" ? "● active" : "◐ observer"}
            </span>
            <div className="agent-desc">{agent.desc}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
