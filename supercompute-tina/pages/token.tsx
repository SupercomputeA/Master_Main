import Layout from "../components/Layout"
import StakingComponent from "../components/Staking"
import Footer from "../components/Footer"

export default function Token() {
  return (
    <Layout title="SUPERCOMPUTE · $SCOM Token">
      <section className="hero" id="token">
        <div className="hero-kicker">
          <div className="status-dot"></div>
          <span className="label">// token</span>
        </div>
        <h1 className="display-xl hero-title">
          $SCOM<br /><em>TOKEN</em>
        </h1>
        <p className="hero-sub">
          Builder coin on Base Chain. Rewards stakers from protocol revenue.
          Live Q3 2026. Stake to earn a share of trading fees.
        </p>
        <div className="hero-meta">
          <div className="meta-item">
            <div className="label-sm">// Network</div>
            <div className="val">Base L2</div>
          </div>
          <div className="meta-item">
            <div className="label-sm">// Est. APY</div>
            <div className="val">~12%</div>
          </div>
          <div className="meta-item">
            <div className="label-sm">// Launch</div>
            <div className="val">Q3 2026</div>
          </div>
        </div>
      </section>
      <StakingComponent />
      <Footer />
    </Layout>
  )
}
