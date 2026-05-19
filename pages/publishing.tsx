import Layout from "../components/Layout"
import NewsDesk from "../components/NewsDesk"
import Footer from "../components/Footer"

export default function Publishing() {
  return (
    <Layout title="SUPERCOMPUTE · Publishing">
      <section className="hero" id="publishing">
        <div className="hero-kicker">
          <div className="status-dot"></div>
          <span className="label">// publishing</span>
        </div>
        <h1 className="display-xl hero-title">
          SOVEREIGN<br /><em>PUBLISHING</em>
        </h1>
        <p className="hero-sub">
          NewsDesk articles, dispatches, and intelligence briefs.
          Written by Quanta S, edited by the operator, on-chain verified.
        </p>
      </section>
      <NewsDesk />
      <Footer />
    </Layout>
  )
}
