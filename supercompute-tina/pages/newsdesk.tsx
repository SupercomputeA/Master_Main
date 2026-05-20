import Layout from "../components/Layout"
import NewsDeskComponent from "../components/NewsDesk"
import Footer from "../components/Footer"

export default function NewsDesk() {
  return (
    <Layout title="SUPERCOMPUTE · NewsDesk CMS">
      <section className="hero" id="newsdesk">
        <div className="hero-kicker">
          <div className="status-dot"></div>
          <span className="label">// admin · newsdesk</span>
        </div>
        <h1 className="display-xl hero-title">
          NEWSDESK<br /><em>CMS</em>
        </h1>
        <p className="hero-sub">
          AI-curated Web3 intelligence. Written by Quanta S, edited by the
          operator. Cross-posted to X, Lens, and Farcaster.
        </p>
      </section>
      <NewsDeskComponent />
      <Footer />
    </Layout>
  )
}
