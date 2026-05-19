import Head from "next/head"
import Sidebar from "../components/Sidebar"
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
    <>
      <Head>
        <title>SUPERCOMPUTE · Web3 built for liberation</title>
        <meta name="description" content="One operator, hands-on Web3 consulting on Base Chain since 2013. Sovereign infrastructure, 13 agents." />
      </Head>

      <Sidebar />

      <main className="main">
        <Hero />
        <About />
        <Services />
        <Projects />
        <AgentFleet />
        <NewsDesk />
        <School />
        <Staking />
        <Footer />
      </main>
    </>
  )
}
