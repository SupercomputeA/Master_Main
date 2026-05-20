import Layout from "../components/Layout"
import StakingComponent from "../components/Staking"
import Footer from "../components/Footer"

export default function Staking() {
  return (
    <Layout title="SUPERCOMPUTE · Staking">
      <section className="hero" id="staking">
        <div className="hero-kicker">
          <div className="status-dot"></div>
          <span className="label">// staking</span>
        </div>
        <h1 className="display-xl hero-title">
          STAKE<br /><em>$SCOM</em>
        </h1>
        <p className="hero-sub">
          50% of all sub-token trading fees route back to $SCOM stakers
          via FeeRouter.sol. Stake on Base, earn from protocol revenue.
        </p>
      </section>
      <StakingComponent />
      <Footer />
    </Layout>
  )
}
