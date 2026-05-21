import Layout from "../components/Layout"
import Footer from "../components/Footer"
import { useAuth } from "../lib/auth"
import { modules, type SchoolModule } from "../lib/school"

function ModuleCard({ m, index }: { m: SchoolModule; index: number }) {
  const [open, setOpen] = useState(false)

  return (
    <div style={{ background: "var(--bg)", border: "1px solid var(--border)" }}>
      <div
        onClick={() => setOpen(!open)}
        style={{ padding: "20px 24px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 8,
            background: `${m.color}15`, border: `1px solid ${m.color}30`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18,
          }}>{m.icon}</div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: m.color }}>{m.id}</span>
              <span style={{ fontSize: 15, fontWeight: 600 }}>{m.title}</span>
            </div>
            <div style={{ fontSize: 11, color: "var(--muted)" }}>{m.subtitle} · {m.lessons.length} lessons · {m.duration}</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{
            fontFamily: "var(--font-mono)", fontSize: 9, padding: "3px 8px",
            background: `${m.color}15`, color: m.color, border: `1px solid ${m.color}30`,
          }}>{m.difficulty}</span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, padding: "3px 8px", background: "var(--accent-dim)", color: "var(--accent)", border: "1px solid var(--border-accent)" }}>
            {m.access.toUpperCase()}
          </span>
          <span style={{ fontSize: 14, color: "var(--muted)", transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>▾</span>
        </div>
      </div>
      {open && (
        <div style={{ borderTop: "1px solid var(--border)", padding: "20px 24px 24px" }}>
          <p style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.6, marginBottom: 16 }}>{m.description}</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 1, background: "var(--border)", border: "1px solid var(--border)" }}>
            <div style={{ background: "var(--surface)", padding: "8px 14px", display: "grid", gridTemplateColumns: "1fr 1fr 80px", gap: 12, fontSize: 9, fontFamily: "var(--font-mono)", color: "var(--muted)", textTransform: "uppercase" }}>
              <div>Lesson</div>
              <div>Topics</div>
              <div>Duration</div>
            </div>
            {m.lessons.map((l) => (
              <div key={l.id} style={{ background: "var(--bg)", padding: "12px 14px", display: "grid", gridTemplateColumns: "1fr 1fr 80px", gap: 12, alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 2 }}>{l.title}</div>
                  <div style={{ fontSize: 10, color: "var(--muted)" }}>{l.description}</div>
                </div>
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                  {l.topics.map((t) => (
                    <span key={t} style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: "var(--muted)", border: "1px solid var(--border)", padding: "1px 6px" }}>{t}</span>
                  ))}
                </div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--accent)", textAlign: "right" }}>{l.duration}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 16, display: "flex", gap: 12 }}>
            <button className="btn-connect" style={{ fontSize: 10, padding: "6px 18px" }}>Start Module</button>
            {m.credential && <button className="btn-connect" style={{ fontSize: 10, padding: "6px 18px", background: "transparent", color: "var(--muted)", borderColor: "var(--border)" }}>View Credential</button>}
          </div>
        </div>
      )}
    </div>
  )
}

import { useState } from "react"

const assignments = [
  { module: "WS-01", title: "Configure a Multi-Sig Wallet", due: "2026-06-01", status: "pending", points: 100 },
  { module: "DF-01", title: "Provide Liquidity on Aerodrome", due: "2026-06-15", status: "pending", points: 150 },
  { module: "RF-01", title: "ReFi Protocol Analysis Paper", due: "2026-07-01", status: "locked", points: 200 },
]

export default function SchoolPage() {
  const { session, profile } = useAuth()

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
          Principled Web3 education. Free modules on Wallet Security, ReFi, DeFi, and Core Values.
          NFT credentials on Base. Start free, earn your way to TradeDesk access.
        </p>
      </section>

      <section className="section">
        <div className="section-header">
          <div className="label">// free modules</div>
          <div>
            <h2 className="display-md">Start Learning Free</h2>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 1, background: "var(--border)", border: "1px solid var(--border)" }}>
          {modules.filter(m => m.access === "free").map((m, i) => (
            <ModuleCard key={m.id} m={m} index={i} />
          ))}
        </div>
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
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "20px 24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: "var(--muted)" }}>Overall Completion</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--accent)" }}>15%</span>
              </div>
              <div style={{ height: 6, background: "var(--border)", borderRadius: 3, overflow: "hidden" }}>
                <div style={{ width: "15%", height: "100%", background: "var(--accent)", borderRadius: 3 }}></div>
              </div>
              <div style={{ display: "flex", gap: 24, marginTop: 16, fontSize: 11, color: "var(--muted)" }}>
                <span>0 / 21 lessons complete</span>
                <span>{profile?.name ?? "Connect"} · {profile?.role ?? "Member"}</span>
              </div>
            </div>
          </section>

          <section className="section">
            <div className="section-header">
              <div className="label">// assignments</div>
              <div>
                <h2 className="display-md">Upcoming Assignments</h2>
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
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "40px 24px", textAlign: "center", color: "var(--muted)", fontSize: 13 }}>
            Free modules are open to everyone. Sign in to track progress, submit assignments, and earn NFT credentials.
          </div>
        </section>
      )}

      <Footer />
    </Layout>
  )
}
