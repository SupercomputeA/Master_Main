import Layout from "../components/Layout"
import Services from "../components/Services"
import Projects from "../components/Projects"
import Footer from "../components/Footer"

export default function StoreFront() {
  return (
    <Layout title="SUPERCOMPUTE · StoreFront">
      <section className="hero" id="home">
        <div className="hero-kicker">
          <div className="status-dot"></div>
          <span className="label">// storefront</span>
        </div>
        <h1 className="display-xl hero-title">
          SOVEREIGN<br /><em>INFRASTRUCTURE</em>
        </h1>
        <p className="hero-sub">
          Consulting, agents, and on-chain tooling for Web3 founders.
          Everything here is something we&apos;ve shipped ourselves.
        </p>
      </section>
      <Services />
      <Projects />
      <Footer />
    </Layout>
  )
}
