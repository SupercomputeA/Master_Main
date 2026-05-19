import Layout from "../components/Layout"
import SchoolComponent from "../components/School"
import Footer from "../components/Footer"

export default function SchoolPage() {
  return (
    <Layout title="SUPERCOMPUTE · Web3 School">
      <section className="hero" id="school">
        <div className="hero-kicker">
          <div className="status-dot"></div>
          <span className="label">// school</span>
        </div>
        <h1 className="display-xl hero-title">
          WEB3<br /><em>SCHOOL</em>
        </h1>
        <p className="hero-sub">
          Principled Web3 education. Seven modules. NFT credentials on Base.
          Start free, earn your way to TradeDesk access.
        </p>
      </section>
      <SchoolComponent />
      <Footer />
    </Layout>
  )
}
