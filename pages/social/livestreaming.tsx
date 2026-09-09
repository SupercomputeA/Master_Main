import PublicLayout from "../../components/PublicLayout"
import Footer from "../../components/Footer"

const streams = [
  {
    title: "SUPERCOMPUTE TOKEN LAUNCH — LIVE COVERAGE",
    date: "2026-05-28",
    time: "14:00 UTC",
    status: "upcoming" as const,
    desc: "Real-time coverage of the $QUANTA token launch on Base. Watch initial liquidity deployment, price discovery, and community reaction.",
  },
  {
    title: "AGENT FLEET DEEP DIVE — Quanta Sovereigna Live",
    date: "2026-06-04",
    time: "18:00 UTC",
    status: "upcoming" as const,
    desc: "Quanta Sovereigna takes questions about agent identity, EconomyOS integration, and on-chain operations.",
  },
  {
    title: "DeFi ONBOARDING WORKSHOP — PART 1",
    date: "2026-05-21",
    time: "15:00 UTC",
    status: "replay" as const,
    desc: "First session of the DeFi onboarding series. Covers wallet setup, Base chain bridging, and first protocol interaction.",
  },
  {
    title: "FLEET OPS STANDUP — WEEK 12",
    date: "2026-05-19",
    time: "14:00 UTC",
    status: "replay" as const,
    desc: "Weekly agent status review. OpenClaw, Quanta S, and Condor performance reports.",
  },
]

export default function LiveStreaming() {
  return (
    <PublicLayout title="SUPERCOMPUTE · LiveStream">
      <section className="hero" id="livestream">
        <div className="hero-kicker">
          <div className="status-dot"></div>
          <span className="label">// live</span>
        </div>
        <h1 className="display-xl hero-title">
          LIVE<br /><em>STREAMING</em>
        </h1>
        <p className="hero-sub">
          Real-time broadcasts from the agent fleet. Token launches, deep dives, workshops, and live events.
        </p>
      </section>

      <section className="section">
        <div className="section-header">
          <div className="label">// active</div>
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
          <div className="display-md">Standing By</div>
          <p style={{ fontSize: 13, color: "var(--muted)", maxWidth: 400 }}>No active stream. Next broadcast: <strong style={{ color: "var(--accent)" }}>TOKEN LAUNCH — 2026-05-28 14:00 UTC</strong></p>
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <div className="label">// upcoming</div>
          <div>
            <h2 className="display-md">Upcoming Streams</h2>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 1, background: "var(--border)", border: "1px solid var(--border)" }}>
          {streams.filter(s => s.status === "upcoming").map((s, i) => (
            <div key={i} style={{ background: "var(--bg)", padding: "18px 24px", display: "grid", gridTemplateColumns: "120px 100px 1fr", gap: 16, alignItems: "start" }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--accent)", paddingTop: 2 }}>
                <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "var(--accent)", marginRight: 6 }}></span>
                {s.date}
              </div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--muted)", paddingTop: 2 }}>{s.time}</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{s.title}</div>
                <div style={{ fontSize: 11, color: "var(--muted)" }}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <div className="label">// archive</div>
          <div>
            <h2 className="display-md">Past Streams</h2>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 1, background: "var(--border)", border: "1px solid var(--border)" }}>
          {streams.filter(s => s.status === "replay").map((s, i) => (
            <div key={i} style={{ background: "var(--bg)", padding: "18px 24px", display: "grid", gridTemplateColumns: "120px 100px 1fr", gap: 16, alignItems: "start" }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--muted)", paddingTop: 2 }}>{s.date}</div>
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
    </PublicLayout>
  )
}
