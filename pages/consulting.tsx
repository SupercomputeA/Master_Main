import Layout from "../components/Layout"
import Services from "../components/Services"
import Footer from "../components/Footer"

export default function Consulting() {
  return (
    <Layout title="SUPERCOMPUTE · Consulting">
      <section className="hero" id="consulting">
        <div className="hero-kicker">
          <div className="status-dot"></div>
          <span className="label">// consulting</span>
        </div>
        <h1 className="display-xl hero-title">
          HANDS-ON<br /><em>CONSULTING</em>
        </h1>
        <p className="hero-sub">
          I work directly with founders. No account managers, no platform.
          You get the person who built 14 projects and thirteen agents.
        </p>
        <div className="hero-actions">
          <a href="https://calendly.com/ora_mi" className="btn btn-primary">// Book strategy call</a>
        </div>
      </section>
      <Services />
      <Footer />
    </Layout>
  )
}
