import Link from "next/link"
import PublicLayout from "../components/PublicLayout"
import Footer from "../components/Footer"

/* Community hub — follow the build in real time: live streaming, a schedule of
   upcoming content, and the social channels. Terminal Dossier styling. */

type SchedType = "stream" | "ama" | "drop"
interface SchedItem { day: string; time: string; type: SchedType; label: string; title: string; desc: string }

const SCHEDULE: SchedItem[] = [
  { day: "Mon", time: "10:00 ET", type: "stream", label: "Stream", title: "Building a DeFi vault, live", desc: "Ship a yield vault on Base from an empty repo." },
  { day: "Wed", time: "15:00 ET", type: "ama", label: "AMA", title: "Ask me anything — ReFi", desc: "Regenerative finance, carbon markets, community-owned infra." },
  { day: "Thu", time: "12:00 ET", type: "drop", label: "Drop", title: "New School module — Wallet Security", desc: "Free lesson release plus a soul-bound credential." },
  { day: "Fri", time: "18:00 ET", type: "stream", label: "Stream", title: "Agent fleet office hours", desc: "Live debugging of autonomous on-chain agents." },
]

interface Social { icon: string; name: string; handle: string; cta: string; url: string }

const SOCIALS: Social[] = [
  { icon: "𝕏", name: "X / Twitter", handle: "@supercompute_io", cta: "Follow →", url: "https://x.com/supercompute_io" },
  { icon: "◆", name: "Farcaster", handle: "/supercompute", cta: "Follow →", url: "https://warpcast.com/supercompute" },
  { icon: "▶", name: "YouTube", handle: "Live & replays", cta: "Subscribe →", url: "https://youtube.com/@supercompute" },
  { icon: "📅", name: "Calendly", handle: "Book a call", cta: "Schedule →", url: "https://calendly.com/ora_mi" },
]

export default function Community() {
  return (
    <PublicLayout title="SUPERCOMPUTE · Community">
      <div className="landing">
        <section className="l-hero">
          <div className="l-eyebrow">
            <span><span className="gold">./community</span> --live</span>
            <span className="l-caret" />
          </div>
          <h1 className="headline">Community</h1>
          <div className="subheader">Build in public</div>
          <p className="hero-copy">
            Follow the work in real time — live streams from the desk, a schedule of what's
            coming, and every channel to plug into. Ship alongside us.
          </p>
          <div style={{ marginTop: 32, display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/auth" className="btn btn-primary">Join the community</Link>
            <Link href="/auth" className="btn btn-outline">Sign in</Link>
          </div>
        </section>
      </div>

      <div className="tpl-community">
        {/* LIVE STREAMING */}
        <section className="section">
          <div className="section-header">
            <div className="label">// live</div>
            <div><h2 className="display-md">Live Streaming</h2></div>
          </div>
          <div className="stream-panel">
            <div className="stream-screen">
              <div className="stream-pill-wrap">
                <span className="live-pill off"><span className="dot" /> Offline</span>
              </div>
              <div className="stream-play">▶</div>
              <div className="stream-cap">Next broadcast in 2 days · replays on YouTube</div>
            </div>
            <div className="stream-meta">
              <span className="live-pill off" style={{ alignSelf: "flex-start" }}><span className="dot" /> Up next</span>
              <div className="stream-title">Building a DeFi vault, live</div>
              <p className="stream-desc">
                Ship a yield vault on Base from an empty repo — contracts, tests, and a
                front-end. Bring questions; we build in the open.
              </p>
              <div className="stream-when">Mon · 10:00 ET</div>
              <a href="https://x.com/supercompute_io" target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ alignSelf: "flex-start" }}>
                Set a reminder
              </a>
              <div className="stream-watch">WATCH LIVE ON · X · FARCASTER · YOUTUBE</div>
            </div>
          </div>
        </section>

        {/* SCHEDULED CONTENT */}
        <section className="section">
          <div className="section-header">
            <div className="label">// schedule · this week</div>
            <div><h2 className="display-md">Upcoming</h2></div>
          </div>
          <div className="sched">
            {SCHEDULE.map((s) => (
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
        </section>

        {/* SOCIAL MEDIA */}
        <section className="section" style={{ borderBottom: "none" }}>
          <div className="section-header">
            <div className="label">// social</div>
            <div><h2 className="display-md">Follow the Build</h2></div>
          </div>
          <div className="social-grid">
            {SOCIALS.map((s) => (
              <a key={s.name} href={s.url} target="_blank" rel="noopener noreferrer" className="social-card">
                <div className="social-icon">{s.icon}</div>
                <div className="social-name">{s.name}</div>
                <div className="social-handle">{s.handle}</div>
                <div className="social-cta">{s.cta}</div>
              </a>
            ))}
          </div>
        </section>
      </div>

      <Footer />
    </PublicLayout>
  )
}
