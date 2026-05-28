import Layout from "../components/Layout"
import AgentFleet from "../components/AgentFleet"
import Footer from "../components/Footer"

export default function Dashboard() {
  return (
    <Layout title="SUPERCOMPUTE · Dashboard">
      <section className="hero" id="dashboard">
        <div className="hero-kicker">
          <div className="status-dot"></div>
          <span className="label">// admin · dashboard</span>
        </div>
        <h1 className="display-xl hero-title">
          FLEET<br /><em>DASHBOARD</em>
        </h1>
        <p className="hero-sub">
          Real-time status of all agents, services, and on-chain positions.
          Operator console for the Supercompute stack.
        </p>
        <div className="hero-meta">
          <div className="meta-item">
            <div className="label-sm">// Agents Online</div>
            <div className="val">4/13</div>
          </div>
          <div className="meta-item">
            <div className="label-sm">// Uptime</div>
            <div className="val">99.9%</div>
          </div>
          <div className="meta-item">
            <div className="label-sm">// Incidents</div>
            <div className="val">0</div>
          </div>
        </div>
      </section>
      <AgentFleet />
      <Footer />
    </Layout>
  )
}
