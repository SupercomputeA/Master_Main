import Link from "next/link"
import PublicLayout from "../components/PublicLayout"
import Footer from "../components/Footer"
import { modules } from "../lib/school"

/* NewsDesk — the publishing hub. Rolls out content across four channels:
   Blog (protocol evaluations), Project releases, School class subjects, and
   Live Streaming (community engagement), published out to our social pages. */

interface Post { image: string; category: string; title: string; excerpt: string; meta: string }

const EVALUATIONS: Post[] = [
  { image: "🎁", category: "Finance", title: "Pool Together", excerpt: "No-loss lottery protocol enabling communities to pool savings and generate yield through collective draws.", meta: "8 min" },
  { image: "🦄", category: "DEX", title: "Uniswap", excerpt: "Decentralized exchange revolutionizing liquidity pools with governance, routing, and composable infrastructure.", meta: "12 min" },
  { image: "📊", category: "Payments", title: "Splits", excerpt: "Revenue distribution framework enabling creators and communities to configure flexible payment structures.", meta: "7 min" },
  { image: "⚔️", category: "Governance", title: "Argon", excerpt: "DAO framework providing autonomous organization infrastructure for governance and decentralized treasury management.", meta: "10 min" },
  { image: "📱", category: "Social", title: "Farcaster", excerpt: "Decentralized social network protocol with on-chain profiles and an open ecosystem for composable apps.", meta: "9 min" },
  { image: "🤖", category: "AI Agents", title: "Virtuals", excerpt: "AI agent infrastructure protocol enabling autonomous operations and intelligent on-chain interactions.", meta: "11 min" },
]

const RELEASES: Post[] = [
  { image: "📰", category: "Release", title: "NewsDesk v0.2", excerpt: "Multi-channel publishing — blog, project releases, class subjects, and live streaming in one feed.", meta: "shipped" },
  { image: "🧠", category: "Release", title: "Knowledge Graph viewer", excerpt: "Shared graph viewer across NewsDesk, ProjectDesk, and sGraph. Explore protocol relationships.", meta: "beta" },
  { image: "📈", category: "Release", title: "TradeDesk private beta", excerpt: "On-chain execution and agent automation for $QUANTA holders. Invites rolling out.", meta: "soon" },
]

type SchedType = "stream" | "ama" | "drop"
interface Stream { day: string; time: string; type: SchedType; label: string; title: string; desc: string }

const STREAMS: Stream[] = [
  { day: "Mon", time: "10:00 ET", type: "stream", label: "Stream", title: "Building a DeFi vault, live", desc: "Ship a yield vault on Base from an empty repo." },
  { day: "Wed", time: "15:00 ET", type: "ama", label: "AMA", title: "Ask me anything — ReFi", desc: "Regenerative finance, carbon markets, community-owned infra." },
  { day: "Thu", time: "12:00 ET", type: "drop", label: "Drop", title: "New School module — Wallet Security", desc: "Free lesson release plus a soul-bound credential." },
  { day: "Fri", time: "18:00 ET", type: "stream", label: "Stream", title: "Agent fleet office hours", desc: "Live debugging of autonomous on-chain agents." },
]

function ChannelHead({ tag, title, href }: { tag: string; title: string; href?: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, marginBottom: 28, paddingBottom: 14, borderBottom: "1px solid rgba(201,163,58,0.15)" }}>
      <div>
        <div className="label" style={{ marginBottom: 8 }}>{tag}</div>
        <h2 className="display-md">{title}</h2>
      </div>
      {href ? (
        <Link href={href} style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--gold-warm)", textDecoration: "none", whiteSpace: "nowrap" }}>
          view all →
        </Link>
      ) : null}
    </div>
  )
}

function Card({ p }: { p: Post }) {
  return (
    <article className="blog-card">
      <div className="blog-image">{p.image}</div>
      <div className="blog-content">
        <div className="blog-category">{p.category}</div>
        <h3 className="blog-title">{p.title}</h3>
        <p className="blog-excerpt">{p.excerpt}</p>
        <div className="blog-meta">
          <span>Read more</span>
          <span>{p.meta}</span>
        </div>
      </div>
    </article>
  )
}

export default function NewsDesk() {
  const classes = modules.slice(0, 6)

  return (
    <PublicLayout title="SUPERCOMPUTE · NewsDesk">
      <div className="landing">
        <section className="l-hero">
          <div className="l-eyebrow">
            <span><span className="gold">./newsdesk</span> --supercompute</span>
            <span className="l-caret" />
          </div>
          <h1 className="headline">NewsDesk</h1>
          <div className="subheader">Publishing</div>
          <p className="hero-copy">
            One feed for everything we ship — protocol evaluations, project releases, class
            subjects, and live streaming. Rolled out here and to our social pages.
          </p>
          <div style={{ marginTop: 32, display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/auth" className="btn btn-primary">Subscribe</Link>
            <Link href="/auth" className="btn btn-outline">Sign in</Link>
          </div>
        </section>
      </div>

      <div className="tpl-publishing">
        {/* CHANNEL 1 — BLOG · PROTOCOL EVALUATIONS */}
        <section style={{ marginBottom: 72 }}>
          <ChannelHead tag="// blog" title="Protocol Evaluations" />
          <div className="blog-grid">
            {EVALUATIONS.map((p) => <Card key={p.title} p={p} />)}
          </div>
        </section>

        {/* CHANNEL 2 — PROJECTS · RELEASES */}
        <section style={{ marginBottom: 72 }}>
          <ChannelHead tag="// projects" title="Project Releases" href="/projects" />
          <div className="blog-grid">
            {RELEASES.map((p) => <Card key={p.title} p={p} />)}
          </div>
        </section>

        {/* CHANNEL 3 — SCHOOL · CLASS SUBJECTS */}
        <section style={{ marginBottom: 72 }}>
          <ChannelHead tag="// school" title="Class Subjects" href="/school" />
          <div className="blog-grid">
            {classes.map((m) => (
              <Card
                key={m.id}
                p={{
                  image: m.icon,
                  category: m.difficulty,
                  title: m.title,
                  excerpt: m.subtitle,
                  meta: `${m.lessons.length} lessons`,
                }}
              />
            ))}
          </div>
        </section>

        {/* CHANNEL 4 — LIVE STREAMING · COMMUNITY ENGAGEMENT */}
        <section style={{ marginBottom: 32 }}>
          <ChannelHead tag="// live streaming" title="Community Engagement" />
          <div className="tpl-community" style={{ marginBottom: 20 }}>
            <div className="sched">
              {STREAMS.map((s) => (
                <div key={s.title} className="sched-row">
                  <div className="sched-date">
                    <span className="sched-day">{s.day}</span>
                    <span className="sched-time">{s.time}</span>
                  </div>
                  <div className={`sched-type ${s.type}`}>{s.label}</div>
                  <div>
                    <div className="sched-title">{s.title}</div>
                    <span className="sched-desc">{s.desc}</span>
                  </div>
                  <div className="sched-cta">Remind me →</div>
                </div>
              ))}
            </div>
          </div>
          <p style={{ fontSize: 13, color: "var(--mono-blue)", lineHeight: 1.7 }}>
            Live stream dates are published to our social pages — follow along on{" "}
            <a href="https://x.com/supercompute_io" target="_blank" rel="noopener noreferrer" style={{ color: "var(--gold-warm)" }}>X</a>,{" "}
            <a href="https://warpcast.com/supercompute" target="_blank" rel="noopener noreferrer" style={{ color: "var(--gold-warm)" }}>Farcaster</a>, and{" "}
            <a href="https://youtube.com/@supercompute" target="_blank" rel="noopener noreferrer" style={{ color: "var(--gold-warm)" }}>YouTube</a>.
          </p>
        </section>
      </div>

      <Footer />
    </PublicLayout>
  )
}
