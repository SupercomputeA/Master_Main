import Layout from "../components/Layout"
import Hero from "../components/Hero"
import About from "../components/About"
import Services from "../components/Services"
import Projects from "../components/Projects"
import AgentFleet from "../components/AgentFleet"
import NewsDesk from "../components/NewsDesk"
import School from "../components/School"
import Staking from "../components/Staking"
import Footer from "../components/Footer"

export default function Home() {
  return (
    <Layout>
      <Hero />
      <About />
      <Services />
      <Projects />
      <AgentFleet />
      <NewsDesk />
      <School />
      <Staking />
      <Footer />
    </Layout>
  )
}
