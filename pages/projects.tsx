import Link from "next/link"
import PublicLayout from "../components/PublicLayout"

/* Projects — faithful port of templates/projects/Projects.dc.html.
   Portfolio showcase across 3 categories; featured cards span 2 columns. */

interface Project {
  hero: string
  logo: string
  brand: string
  name: string
  desc: string
  meta: string
  featured?: boolean
}

const SECTIONS: { title: string; count: string; projects: Project[] }[] = [
  {
    title: "Core Infrastructure",
    count: "4 projects",
    projects: [
      { hero: "🧠", logo: "KG", brand: "Knowledge Graph", name: "Knowledge Graph", desc: "Semantic data intelligence, embeddings, and smart connections for understanding complex information across the metaverse ecosystem.", meta: "Data • Intelligence • Semantics", featured: true },
      { hero: "📰", logo: "ND", brand: "NewsDesk", name: "NewsDesk", desc: "Content production, distribution, and publishing platform for news and insights.", meta: "Publishing • Distribution" },
      { hero: "📈", logo: "TD", brand: "TradeDesk", name: "TradeDesk", desc: "Liquidity management and financial trading interface for Web3 markets.", meta: "Finance • Trading • Liquidity" },
      { hero: "🎓", logo: "WS", brand: "Web3 School", name: "Web3 School", desc: "Educational modules, class structure, and training for Web3 knowledge.", meta: "Education • Training" },
    ],
  },
  {
    title: "Community & Engagement",
    count: "5 projects",
    projects: [
      { hero: "⚽", logo: "TL", brand: "The League", name: "The League", desc: "Competitive gaming and community engagement platform.", meta: "Gaming • Community" },
      { hero: "🌍", logo: "GC", brand: "Global Citizen", name: "Global Citizen", desc: "Community governance and participation across borders.", meta: "Governance • Community" },
      { hero: "📡", logo: "SM", brand: "Social Media Hub", name: "Social Media Hub", desc: "Multi-platform publishing across Substack, TikTok, Twitter, Bluesky, and Farcaster. Live streaming and content distribution.", meta: "Publishing • Streaming • Social", featured: true },
      { hero: "🗽", logo: "AN", brand: "America NFT", name: "America NFT", desc: "Civic engagement platform using NFT infrastructure.", meta: "Civic • NFT • Engagement" },
      { hero: "🎥", logo: "LS", brand: "Live Sadhana", name: "Live Sadhana", desc: "Streaming platform focused on wellness and conscious community.", meta: "Streaming • Wellness" },
    ],
  },
  {
    title: "Web3 & Ecosystem",
    count: "5 projects",
    projects: [
      { hero: "🌱", logo: "SP", brand: "Solarpunk", name: "Solarpunk", desc: "Regenerative Web3 movement and environmental initiatives.", meta: "Regenerative • Environment" },
      { hero: "🛠️", logo: "ET", brand: "Ecological Toolkit", name: "Ecological Toolkit", desc: "Environmental tools and data infrastructure for sustainable impact.", meta: "Tools • Data • Environment" },
      { hero: "♻️", logo: "NW", brand: "NodeWaste", name: "NodeWaste", desc: "Infrastructure optimization and resource efficiency.", meta: "Infrastructure • Efficiency" },
      { hero: "🏜️", logo: "NM", brand: "Nomad", name: "Nomad", desc: "Distributed operations and decentralized coordination.", meta: "Distributed • Operations" },
      { hero: "🎨", logo: "WN", brand: "Word NFT", name: "Word NFT", desc: "Creative digital assets and NFT infrastructure.", meta: "Creative • Digital Assets" },
    ],
  },
]

export default function Projects() {
  return (
    <PublicLayout title="SUPERCOMPUTE · Projects" wide>
      <div className="landing">
        <section className="l-hero">
          <div className="l-eyebrow">
            <span><span className="gold">./projects</span> --supercompute</span>
            <span className="l-caret" />
          </div>
          <h1 className="headline">Projects</h1>
          <div className="subheader">Built in the open</div>
          <p className="hero-copy">
            A portfolio of Web3 tools and initiatives — shipped on Base, owned by the
            communities they serve.
          </p>
          <div style={{ marginTop: 32, display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/auth" className="btn btn-primary">Start a project</Link>
            <Link href="/auth" className="btn btn-outline">Sign in</Link>
          </div>
        </section>
      </div>
      <div className="tpl-projects">

        {SECTIONS.map((section) => (
          <div key={section.title} className="project-section">
            <div className="section-head">
              <div className="section-title">{section.title}</div>
              <div className="section-count">{section.count}</div>
            </div>
            <div className="projects-grid">
              {section.projects.map((p) => (
                <div key={p.name} className={`project-card${p.featured ? " featured-card" : ""}`}>
                  <div className="project-hero">{p.hero}</div>
                  <div className="project-content">
                    <div className="project-branding">
                      <div className="project-logo">{p.logo}</div>
                      <div className="project-brand-name">{p.brand}</div>
                    </div>
                    <div className="project-name">{p.name}</div>
                    <div className="project-desc">{p.desc}</div>
                    <div className="project-meta">{p.meta}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </PublicLayout>
  )
}
