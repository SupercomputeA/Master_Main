import Layout from "../components/Layout"
import Footer from "../components/Footer"

export default function TradeDesk() {
  return (
    <Layout title="SUPERCOMPUTE · TradeDesk">
      <section className="hero" id="tradedesk">
        <div className="hero-kicker">
          <div className="status-dot"></div>
          <span className="label">// admin · tradedesk</span>
        </div>
        <h1 className="display-xl hero-title">
          TRADE<br /><em>DESK</em>
        </h1>
        <p className="hero-sub">
          DeFi operations via KNIGHT agent. CDP management, treasury ops,
          and Polymarket monitoring on Base Chain.
        </p>
        <div className="hero-meta">
          <div className="meta-item">
            <div className="label-sm">// Status</div>
            <div className="val">Observer</div>
          </div>
          <div className="meta-item">
            <div className="label-sm">// Monitor</div>
            <div className="val">24/7</div>
          </div>
        </div>
      </section>
      <Footer />
    </Layout>
  )
}
