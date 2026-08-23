import Link from "next/link"
import PublicLayout from "../components/PublicLayout"
import Footer from "../components/Footer"

/* Landing — faithful port of templates/landing/LandingPage.dc.html.
   Centered Phosphate hero, three value cards, dual journey progress.
   Value-card links wired to real routes. */

const VALUES = [
  {
    icon: "🔓",
    title: "Expansive Ideas",
    desc: "AI agents decode protocols, governance, and economics into plain language. Web3's full potential, without the jargon wall.",
    link: "Explore projects →",
    href: "/projects",
  },
  {
    icon: "🛠️",
    title: "How to Build Them",
    desc: "Hands-on tracks with an agent at your side. Build Web3 infrastructure at your own pace, from fundamentals to launch.",
    link: "Explore school →",
    href: "/school",
  },
  {
    icon: "🤝",
    title: "Unite & Scale",
    desc: "Bring a community together — coordinate, collaborate, and ship without surrendering trustlessness.",
    link: "Explore community →",
    href: "/community",
  },
]

const BUILDER_PATH = [
  { label: "Fundamentals", pct: 85 },
  { label: "Smart Contracts", pct: 62 },
  { label: "Protocol Design", pct: 38 },
  { label: "Launch & Scale", pct: 15 },
]

const CREATOR_PATH = [
  { label: "Web3 Literacy", pct: 78 },
  { label: "Content Strategy", pct: 71 },
  { label: "Community Building", pct: 56 },
  { label: "Monetization", pct: 22 },
]

function Journey({ title, items }: { title: string; items: { label: string; pct: number }[] }) {
  return (
    <div className="journey-card">
      <div className="journey-title">{title}</div>
      <div className="journey-list">
        {items.map((it) => (
          <div key={it.label} className="progress-item">
            <div className="progress-label">
              <span>{it.label}</span>
              <span>{it.pct}%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${it.pct}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Home() {
  return (
    <PublicLayout title="SUPERCOMPUTE · Design with liberation in mind">
      <div className="landing">
        <section className="l-hero">
          <div className="l-eyebrow">
            <span><span className="gold">./status</span> --supercompute</span>
            <span className="l-caret" />
          </div>
          <h1 className="headline">Supercompute</h1>
          <div className="subheader">Crypto is complex. Your AI operator makes it simple.</div>
          <p className="hero-copy">
            Wallets, gas, protocols, governance — Web3 asks too much before you can use it.
            Supercompute's AI agents on Base do the heavy lifting: research, trade, publish, build.
            You keep the keys. Trustlessness stays intact — the agent works for you, never between you and the chain.
          </p>
          <div className="l-hero-actions">
            <Link href="/projects" className="btn btn-primary">// Explore projects</Link>
            <Link href="/school" className="btn btn-outline">→ Start learning</Link>
          </div>
        </section>

        <section className="value-sections">
          {VALUES.map((v) => (
            <Link key={v.title} href={v.href} className="value-card">
              <div className="value-icon">{v.icon}</div>
              <div className="value-title">{v.title}</div>
              <div className="value-desc">{v.desc}</div>
              <div className="value-link">{v.link}</div>
            </Link>
          ))}
        </section>

        <section className="progress-section">
          <div className="l-section-header">
            <div className="section-label">Your path</div>
            <h2 className="section-title">From curious to capable</h2>
            <p className="section-desc">
              AI-guided tracks take you from fundamentals to launch. Percentages show how much of each path is built and live.
            </p>
          </div>
          <div className="journey-grid">
            <Journey title="Builder Path" items={BUILDER_PATH} />
            <Journey title="Creator Path" items={CREATOR_PATH} />
          </div>
        </section>
      </div>
      <Footer />
    </PublicLayout>
  )
}
