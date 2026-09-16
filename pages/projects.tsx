import { useEffect, useState } from "react"
import Link from "next/link"
import PublicLayout from "../components/PublicLayout"
import Footer from "../components/Footer"

/* Projects — faithful port of templates/projects/Projects.dc.html.
   Portfolio showcase across 3 categories; featured cards span 2 columns.

   The list is now DATA-DRIVEN: the primary grid renders the live `projects` table through
   `GET /api/projects` (D1), and the curated sections below are the fallback that keeps the page
   populated when the API is unavailable. Before this, the whole page was hardcoded while the real
   catalog sat in D1 — and /api/projects was returning a bodyless `error code: 1101` (CF uncaught
   Worker exception) with nothing on the page to show it. When the fetch fails we render a visible
   degraded notice rather than silently showing curated content as if it were live. */

interface Project {
  hero: string
  logo: string
  brand: string
  name: string
  desc: string
  meta: string
  featured?: boolean
}

// Shape returned by GET /api/projects (see functions/api/projects.js — PROJECT_LIST_COLUMNS).
interface LiveProject {
  id: string
  name: string
  tagline: string | null
  description: string | null
  status: string | null
  repo: string | null
  coin: string | null
  chain: string | null
  featured: number | null
  sort_order: number | null
  funding_goal_usd: number | null
  cover_image_url: string | null
  website_url: string | null
  github_url: string | null
  twitter_url: string | null
  creator_name: string | null
  created_at: string | null
  updated_at: string | null
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

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase()

/** The registry link for a project row: prefer the explicit website, else GitHub, else the repo slug. */
function repoHref(p: LiveProject): string | null {
  if (p.website_url) return p.website_url
  if (p.github_url) return p.github_url
  if (p.repo && /^https?:\/\//.test(p.repo)) return p.repo
  if (p.repo) return `https://github.com/supercompute/${p.repo}`
  return null
}

export default function Projects() {
  const [live, setLive] = useState<LiveProject[]>([])
  const [state, setState] = useState<"syncing" | "live" | "unavailable">("syncing")

  useEffect(() => {
    let cancelled = false
    fetch("/api/projects")
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json() as Promise<{ projects?: LiveProject[] } | null>
      })
      .then((body: { projects?: LiveProject[] } | null) => {
        if (cancelled) return
        const rows: LiveProject[] = Array.isArray(body?.projects) ? body.projects : []
        setLive(rows)
        setState(rows.length ? "live" : "unavailable")
      })
      .catch(() => {
        if (!cancelled) setState("unavailable")
      })
    return () => {
      cancelled = true
    }
  }, [])

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

      {/* Live registry — GET /api/projects. This is the authoritative catalog. */}
      <div className="tpl-projects">
        <div className="project-section">
          <div className="section-head">
            <div className="section-title">Registry</div>
            <div className="section-count" style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: state === "live" ? "var(--teal)" : "var(--muted)" }}>
              {state === "syncing" && "// syncing projects table…"}
              {state === "live" && `// live · ${live.length} record${live.length === 1 ? "" : "s"}`}
              {state === "unavailable" && "// registry unreachable — showing curated tracks"}
            </div>
          </div>

          {state === "live" && (
            <div className="projects-grid">
              {live.map((p) => {
                const href = repoHref(p)
                const blurb = p.tagline || p.description || ""
                const metaBits = [p.chain, p.coin, p.status].filter((v): v is string => !!v && String(v).trim() !== "")
                return (
                  <div key={p.id} className={`project-card${p.featured ? " featured-card" : ""}`}>
                    <div className="project-hero">{initials(p.name) || "SC"}</div>
                    <div className="project-content">
                      <div className="project-branding">
                        <div className="project-logo">{initials(p.name) || "SC"}</div>
                        <div className="project-brand-name">{p.coin || "Supercompute"}</div>
                      </div>
                      <div className="project-name">{p.name}</div>
                      {blurb && <div className="project-desc">{blurb}</div>}
                      <div className="project-meta">
                        {metaBits.length ? metaBits.join(" • ") : "Registry"}
                        {href && (
                          <>
                            {" • "}
                            <a href={href} target="_blank" rel="noreferrer noopener" style={{ color: "var(--accent)" }}>
                              open ↗
                            </a>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {state === "unavailable" && (
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "24px 26px", fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--muted)", lineHeight: 1.7 }}>
              The projects registry did not answer, so the curated tracks below are standing in for it.
              Nothing here is being presented as live data.
            </div>
          )}
        </div>

        {SECTIONS.map((section) => (
          <div key={section.title} className="project-section">
            <div className="section-head">
              <div className="section-title">{section.title}</div>
              <div className="section-count">{state === "live" ? `${section.count} curated` : section.count}</div>
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
      <Footer />
    </PublicLayout>
  )
}
