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
    desc: "Explore the full potential of Web3 — protocols, governance, economics, and community coordination at scale.",
    link: "Learn more →",
    href: "/projects",
  },
  {
    icon: "🛠️",
    title: "How to Build Them",
    desc: "Hands-on education and practical guidance for implementing Web3 infrastructure, DAOs, and decentralized systems.",
    link: "Explore school →",
    href: "/school",
  },
  {
    icon: "🤝",
    title: "Unite & Scale",
    desc: "Connect with builders, creators, and thinkers. Collaborate on projects that reshape how communities coordinate.",
    link: "Join community →",
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
          <div className="subheader">Design with Liberation in mind</div>
          <p className="hero-copy">
            We're building the tools and knowledge infrastructure for Web3 communities to
            expand beyond limitations, collaborate openly, and unite around shared vision.
          </p>
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
            <div className="section-label">Your Journey</div>
            <h2 className="section-title">How Far We Can Take You</h2>
            <p className="section-desc">
              Progress tracking across different paths through Supercompute's ecosystem and capabilities.
            </p>
          </div>
          <div className="journey-grid">
            <Journey title="The Builder Path" items={BUILDER_PATH} />
            <Journey title="The Creator Path" items={CREATOR_PATH} />
          </div>
        </section>
      </div>
      <Footer />
    </PublicLayout>
  )
}
