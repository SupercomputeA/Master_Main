import Layout from "../components/Layout"
import ProjectsComponent from "../components/Projects"
import Footer from "../components/Footer"

export default function Projects() {
  return (
    <Layout title="SUPERCOMPUTE · Projects">
      <section className="hero" id="projects">
        <div className="hero-kicker">
          <div className="status-dot"></div>
          <span className="label">// projects</span>
        </div>
        <h1 className="display-xl hero-title">
          SHIPPED<br /><em>IN PUBLIC</em>
        </h1>
        <p className="hero-sub">
          Every project Supercompute has built, funded, or contributed to.
          Tokens, agents, treasury ops, migrations — all on-chain.
        </p>
      </section>
      <ProjectsComponent />
      <Footer />
    </Layout>
  )
}
