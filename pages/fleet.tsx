import Layout from "../components/Layout"
import AgentFleetComponent from "../components/AgentFleet"
import Footer from "../components/Footer"

export default function Fleet() {
  return (
    <Layout title="SUPERCOMPUTE · Agent Fleet">
      <section className="hero" id="fleet">
        <div className="hero-kicker">
          <div className="status-dot"></div>
          <span className="label">// admin · fleet</span>
        </div>
        <h1 className="display-xl hero-title">
          AGENT<br /><em>FLEET</em>
        </h1>
        <p className="hero-sub">
          Thirteen autonomous agents. One command layer.
          Infrastructure, intelligence, trading, governance, and operations.
        </p>
      </section>
      <AgentFleetComponent />
      <Footer />
    </Layout>
  )
}
