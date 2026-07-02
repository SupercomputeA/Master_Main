import Link from "next/link"
import PublicLayout from "../components/PublicLayout"

/* Publishing — faithful port of templates/publishing/Publishing.dc.html.
   Protocol-analysis blog cards + knowledge-graph teaser block. */

interface Post {
  image: string
  category: string
  title: string
  excerpt: string
  minutes: string
}

const POSTS: Post[] = [
  { image: "🎁", category: "Finance", title: "Pool Together", excerpt: "No-loss lottery protocol enabling communities to pool savings and generate yield through collective draws.", minutes: "8 min" },
  { image: "🦄", category: "DEX", title: "Uniswap", excerpt: "Decentralized exchange revolutionizing liquidity pools with governance, routing, and composable infrastructure.", minutes: "12 min" },
  { image: "📊", category: "Payments", title: "Splits", excerpt: "Revenue distribution framework enabling creators and communities to configure flexible payment structures.", minutes: "7 min" },
  { image: "⚔️", category: "Governance", title: "Argon", excerpt: "DAO framework providing autonomous organization infrastructure for governance and decentralized treasury management.", minutes: "10 min" },
  { image: "📱", category: "Social", title: "Farcaster", excerpt: "Decentralized social network protocol with on-chain profiles and open ecosystem for composable applications.", minutes: "9 min" },
  { image: "🤖", category: "AI Agents", title: "Virtuals", excerpt: "AI agent infrastructure protocol enabling autonomous operations and intelligent on-chain interactions.", minutes: "11 min" },
  { image: "🏛️", category: "Community", title: "Guild", excerpt: "Community membership protocol with token-gated access control and collaborative governance features.", minutes: "8 min" },
  { image: "🎨", category: "Creative", title: "AI Image Gen", excerpt: "On-chain image generation and NFT creation infrastructure empowering creators with AI-assisted tools.", minutes: "9 min" },
  { image: "🔤", category: "Identity", title: "ENS", excerpt: "Ethereum Name Service providing decentralized domain names and identity infrastructure for Web3.", minutes: "7 min" },
  { image: "✓", category: "Credentials", title: "EAS", excerpt: "Ethereum Attestation Service enabling on-chain credentials, verification, and portable proof of claims.", minutes: "8 min" },
]

export default function Publishing() {
  return (
    <PublicLayout title="SUPERCOMPUTE · NewsDesk">
      <div className="landing">
        <section className="l-hero">
          <div className="l-eyebrow">
            <span><span className="gold">./newsdesk</span> --supercompute</span>
            <span className="l-caret" />
          </div>
          <h1 className="headline">NewsDesk</h1>
          <div className="subheader">Protocol evaluations</div>
          <p className="hero-copy">
            In-depth protocol evaluations and a living knowledge graph — mapping the
            mechanics, tokenomics, and community structures of Web3.
          </p>
          <div style={{ marginTop: 32, display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/auth" className="btn btn-primary">Subscribe</Link>
            <Link href="/auth" className="btn btn-outline">Sign in</Link>
          </div>
        </section>
      </div>
      <div className="tpl-publishing">

        <div className="section-header" style={{ marginBottom: 32 }}>
          <div className="label">// evaluations</div>
          <div><h2 className="display-md">Protocol Evaluations</h2></div>
        </div>

        <div className="blog-grid">
          {POSTS.map((post) => (
            <article key={post.title} className="blog-card">
              <div className="blog-image">{post.image}</div>
              <div className="blog-content">
                <div className="blog-category">{post.category}</div>
                <h2 className="blog-title">{post.title}</h2>
                <p className="blog-excerpt">{post.excerpt}</p>
                <div className="blog-meta">
                  <span>Read article</span>
                  <span>{post.minutes}</span>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="kg-block">
          <div style={{ marginBottom: 40 }}>
            <div className="section-label">Understanding Protocol Ecosystems</div>
            <h2 className="kg-title">Knowledge Graph</h2>
            <p className="kg-desc">
              Explore how protocols interconnect through data flows, smart contracts, and
              community participation. This graph visualizes the semantic relationships between
              Finance, Governance, Social, and Infrastructure layers.
            </p>
          </div>
          <div className="kg-canvas">
            <div>
              <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.6 }}>🧠</div>
              <p style={{ fontSize: 14, lineHeight: 1.6, maxWidth: 480 }}>
                Knowledge Graph visualization showing protocol relationships, data flows, and
                ecosystem connections. Hover over nodes to explore dependencies and smart
                contract interactions across the Web3 landscape.
              </p>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
