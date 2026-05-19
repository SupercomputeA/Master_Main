import Layout from "../components/Layout"
import Footer from "../components/Footer"

const streamSchedule = [
  { day: "Monday", time: "14:00 UTC", title: "Fleet Ops — Weekly Standup", desc: "Live agent status review. OpenClaw, Quanta S, and KNIGHT reports." },
  { day: "Wednesday", time: "16:00 UTC", title: "Building in Public — Code Review", desc: "Live coding session. Smart contracts, agent configs, infrastructure." },
  { day: "Friday", time: "18:00 UTC", title: "DeFi Deep Dive — Protocol Analysis", desc: "On-chain analysis of trending protocols. Live data, live commentary." },
  { day: "Saturday", time: "15:00 UTC", title: "Web3 School — Office Hours", desc: "Q&A for School members. Module walkthroughs and答疑." },
]

export default function Press() {
  return (
    <Layout title="SUPERCOMPUTE · Press & LiveStream">
      <section className="hero" id="press">
        <div className="hero-kicker">
          <div className="status-dot"></div>
          <span className="label">// press · livestream</span>
        </div>
        <h1 className="display-xl hero-title">
          LIVE &amp;<br /><em>ON CHAIN</em>
        </h1>
        <p className="hero-sub">
          Weekly live streams, press appearances, and community calls.
          All sessions are recorded and archived on-chain via IPFS.
        </p>
        <div className="hero-meta">
          <div className="meta-item">
            <div className="label-sm">// Next stream</div>
            <div className="val">Today</div>
          </div>
          <div className="meta-item">
            <div className="label-sm">// Time</div>
            <div className="val">14:00 UTC</div>
          </div>
          <div className="meta-item">
            <div className="label-sm">// Platform</div>
            <div className="val">Livepeer</div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <div className="label">// stream</div>
          <div>
            <h2 className="display-md">Live Now</h2>
          </div>
        </div>
        <div style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          padding: "60px 24px",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
        }}>
          <div style={{ width: 48, height: 48, borderRadius: "50%", background: "var(--accent-dim)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 16, height: 16, borderRadius: "50%", background: "var(--accent)", animation: "pulse 2s infinite" }}></div>
          </div>
          <div className="display-md">Stream Offline</div>
          <p style={{ fontSize: 13, color: "var(--muted)", maxWidth: 400 }}>Next live stream starts at the scheduled time below. Recordings are available immediately after.</p>
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <div className="label">// schedule</div>
          <div>
            <h2 className="display-md">Weekly Calendar</h2>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 1, background: "var(--border)", border: "1px solid var(--border)" }}>
          {streamSchedule.map((s, i) => (
            <div key={i} style={{ background: "var(--bg)", padding: "18px 24px", display: "grid", gridTemplateColumns: "100px 80px 1fr", gap: 16, alignItems: "start" }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--accent)", paddingTop: 2 }}>{s.day}</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--muted)", paddingTop: 2 }}>{s.time}</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{s.title}</div>
                <div style={{ fontSize: 11, color: "var(--muted)" }}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </Layout>
  )
}
