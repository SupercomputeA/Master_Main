import Layout from "../../components/Layout"
import Footer from "../../components/Footer"
import { modules, modulesByAccess } from "../../lib/school"
import { useAuth } from "../../lib/auth"
import { useState } from "react"

export default function MemberSchool() {
  const { session } = useAuth()
  const [filter, setFilter] = useState<"all" | "free" | "member">("all")
  const display = filter === "all" ? modules : modulesByAccess[filter]
  const completed = modules.filter(m => m.done).length
  const progress = Math.round((completed / modules.length) * 100)

  return (
    <Layout title="SUPERCOMPUTE · Web3 School">
      <section className="hero" id="school">
        <div className="hero-kicker">
          <div className="status-dot"></div>
          <span className="label">// school · member</span>
        </div>
        <h1 className="display-xl hero-title">
          WEB3<br /><em>SCHOOL</em>
        </h1>
        <p className="hero-sub">
          Member curriculum — advanced modules on agents, tokenomics, security, liquidity, and governance.
          Complete modules to earn NFT credentials.
        </p>
      </section>

      <section className="section">
        <div className="section-header">
          <div className="label">// progress</div>
          <div>
            <h2 className="display-md">Your Progress</h2>
          </div>
        </div>
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "20px 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: "var(--fg)" }}>Overall Completion</span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--accent)" }}>{progress}%</span>
          </div>
          <div style={{ height: 6, background: "var(--border)", overflow: "hidden" }}>
            <div style={{ width: `${progress}%`, height: "100%", background: "var(--accent)" }}></div>
          </div>
          <div style={{ display: "flex", gap: 24, marginTop: 16, fontSize: 11, color: "var(--fg)" }}>
            <span>{completed} / {modules.length} modules completed</span>
            <span>{session ? "Connected" : "Connect to track"} · {modules.filter(m => m.access === "free").length} free / {modules.filter(m => m.access === "member").length} member</span>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <div className="label">// curriculum</div>
          <div>
            <h2 className="display-md">Master Syllabus</h2>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          {(["all", "free", "member"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase",
              padding: "6px 16px", border: `1px solid ${filter === f ? "var(--accent)" : "var(--border)"}`,
              background: filter === f ? "var(--accent-dim)" : "transparent",
              color: filter === f ? "var(--accent)" : "var(--fg)",
              cursor: "pointer",
            }}>
              {f === "all" ? "All Modules" : f === "free" ? "Free" : "Member"}
            </button>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 1, background: "var(--border)", border: "1px solid var(--border)" }}>
          {display.map(m => (
            <div key={m.id} style={{
              background: "var(--bg)", padding: "24px",
              display: "flex", flexDirection: "column", gap: 12,
              transition: "background 0.2s",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 24 }}>{m.icon}</span>
                <span style={{
                  fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: "0.1em", textTransform: "uppercase",
                  padding: "2px 8px", border: `1px solid ${m.color}44`, color: m.color,
                }}>
                  {m.access}
                </span>
              </div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.02em", color: m.color }}>
                {m.id} · {m.title}
              </div>
              <div style={{ fontSize: 11, color: "var(--fg)", lineHeight: 1.6, flex: 1 }}>
                {m.description}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto" }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--fg)" }}>
                  {m.lessons.length} lessons · {m.duration}
                </div>
                <span style={{
                  fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: "0.1em",
                  padding: "2px 6px", border: "1px solid var(--border)", color: "var(--fg)",
                }}>
                  {m.difficulty}
                </span>
              </div>
              {m.credential && (
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: "var(--muted)" }}>
                  Credential: {m.credential}
                </div>
              )}
              <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                <a href={`/school/lesson/${m.lessons[0].id}`} style={{
                  fontFamily: "var(--font-mono)", fontSize: 9, padding: "6px 14px",
                  background: m.access === "free" ? "var(--accent)" : "transparent",
                  color: m.access === "free" ? "var(--bg)" : "var(--accent)",
                  border: `1px solid ${m.access === "free" ? "var(--accent)" : "var(--accent-dim)"}`,
                  textDecoration: "none", display: "inline-block",
                }}>
                  {m.access === "free" ? "Start Free" : "→ Begin Module"}
                </a>
                <a href={`/school/${m.id}`} style={{
                  fontFamily: "var(--font-mono)", fontSize: 9, padding: "6px 14px",
                  background: "transparent", color: "var(--fg)",
                  border: "1px solid var(--border)", textDecoration: "none",
                }}>
                  View All
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </Layout>
  )
}