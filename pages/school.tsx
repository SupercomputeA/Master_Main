import Layout from "../components/Layout"
import Footer from "../components/Footer"
import { useAuth } from "../lib/auth"

const modules = [
  { id: "M1", title: "Blockchain Fundamentals", lessons: 8, completed: 8, progress: 100, desc: "Hash functions, consensus, and the history of decentralized money." },
  { id: "M2", title: "Smart Contracts 101", lessons: 10, completed: 10, progress: 100, desc: "Solidity basics, gas optimization, and deploying on Base." },
  { id: "M3", title: "DeFi Architecture", lessons: 12, completed: 12, progress: 100, desc: "AMMs, lending protocols, yield strategies, and risk." },
  { id: "M4", title: "Web3 Identity & Auth", lessons: 6, completed: 6, progress: 100, desc: "SIWE, DIDs, Verifiable Credentials, and session management." },
  { id: "M5", title: "Autonomous Agents", lessons: 10, completed: 7, progress: 70, desc: "Agent frameworks, on-chain automation, and fleet orchestration." },
  { id: "M6", title: "Treasury Management", lessons: 8, completed: 0, progress: 0, desc: "Multi-sig ops, portfolio rebalancing, and governance." },
  { id: "M7", title: "Token Engineering", lessons: 10, completed: 0, progress: 0, desc: "Tokenomics design, bonding curves, and incentive modeling." },
]

const assignments = [
  { module: "M5", title: "Deploy Your First Agent", due: "2026-06-01", status: "pending", points: 100 },
  { module: "M5", title: "Agent Monitoring Dashboard", due: "2026-06-15", status: "pending", points: 150 },
  { module: "M6", title: "Multi-sig Configuration Lab", due: "2026-07-01", status: "locked", points: 200 },
]

export default function SchoolPage() {
  const { session } = useAuth()

  return (
    <Layout title="SUPERCOMPUTE · Web3 School">
      <section className="hero" id="school">
        <div className="hero-kicker">
          <div className="status-dot"></div>
          <span className="label">// school</span>
        </div>
        <h1 className="display-xl hero-title">
          WEB3<br /><em>SCHOOL</em>
        </h1>
        <p className="hero-sub">
          Principled Web3 education. Seven modules. NFT credentials on Base.
          Start free, earn your way to TradeDesk access.
        </p>
      </section>

      {session ? (
        <>
          <section className="section">
            <div className="section-header">
              <div className="label">// progress</div>
              <div>
                <h2 className="display-md">Your Progress</h2>
              </div>
            </div>
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "20px 24px", marginBottom: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: "var(--muted)" }}>Overall Completion</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--accent)" }}>55%</span>
              </div>
              <div style={{ height: 6, background: "var(--border)", borderRadius: 3, overflow: "hidden" }}>
                <div style={{ width: "55%", height: "100%", background: "var(--accent)", borderRadius: 3 }}></div>
              </div>
              <div style={{ display: "flex", gap: 24, marginTop: 16, fontSize: 11, color: "var(--muted)" }}>
                <span>43 / 64 lessons</span>
                <span>5 / 7 modules</span>
                <span>0 / 3 assignments submitted</span>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 1, background: "var(--border)", border: "1px solid var(--border)" }}>
              {modules.map((m) => (
                <div key={m.id} style={{ background: "var(--bg)", padding: "18px 20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <div>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--accent)" }}>{m.id}</span>
                      <span style={{ fontSize: 14, fontWeight: 600, marginLeft: 12 }}>{m.title}</span>
                    </div>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: m.progress === 100 ? "var(--accent)" : "var(--muted)" }}>
                      {m.completed}/{m.lessons}
                    </span>
                  </div>
                  <p style={{ fontSize: 11, color: "var(--muted)", marginBottom: 10 }}>{m.desc}</p>
                  <div style={{ height: 4, background: "var(--border)", borderRadius: 2, overflow: "hidden" }}>
                    <div style={{ width: `${m.progress}%`, height: "100%", background: m.progress === 100 ? "var(--accent)" : "#555", borderRadius: 2 }}></div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="section">
            <div className="section-header">
              <div className="label">// assignments</div>
              <div>
                <h2 className="display-md">Upcoming Work</h2>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 1, background: "var(--border)", border: "1px solid var(--border)" }}>
              {assignments.map((a, i) => (
                <div key={i} style={{ background: "var(--bg)", padding: "16px 20px", display: "grid", gridTemplateColumns: "60px 1fr 100px 80px", gap: 12, alignItems: "center" }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--accent)" }}>{a.module}</span>
                  <span style={{ fontSize: 13 }}>{a.title}</span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--muted)" }}>Due {a.due}</span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, textTransform: "capitalize", color: a.status === "locked" ? "#555" : a.status === "pending" ? "var(--accent)" : "var(--muted)" }}>
                    {a.status}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </>
      ) : (
        <section className="section">
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "60px 24px", textAlign: "center", color: "var(--muted)", fontSize: 13 }}>
            Connect your wallet and sign in to access course materials, track progress, and submit assignments.
          </div>
        </section>
      )}

      <Footer />
    </Layout>
  )
}
