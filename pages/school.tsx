import type { GetStaticProps } from "next"
import { useState } from "react"
import Link from "next/link"
import Layout from "../components/Layout"
import Footer from "../components/Footer"
import { useAuth } from "../lib/auth"
import { getAllSchoolModules, type SchoolModuleContent } from "../lib/content"

export const getStaticProps: GetStaticProps = async () => {
  const modules = await getAllSchoolModules()
  return { props: { modules } }
}

function ModuleCard({ m }: { m: SchoolModuleContent }) {
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
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: m.color }}>{m.moduleId}</span>
              <span style={{ fontSize: 15, fontWeight: 600 }}>{m.title}</span>
            </div>
            <div style={{ fontSize: 11, color: "var(--muted)" }}>
              {m.subtitle} · {m.lessons.length} lessons · {m.duration}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{
            fontFamily: "var(--font-mono)", fontSize: 9, padding: "3px 8px",
            background: `${m.color}15`, color: m.color, border: `1px solid ${m.color}30`,
          }}>{m.difficulty}</span>
          <span style={{
            fontFamily: "var(--font-mono)", fontSize: 9, padding: "3px 8px",
            background: m.access === "free" ? "var(--teal-dim)" : "var(--accent-dim)",
            color: m.access === "free" ? "var(--teal)" : "var(--accent)",
            border: `1px solid ${m.access === "free" ? "var(--teal)" : "var(--border-accent)"}`,
          }}>
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
            {m.lessons.map(l => (
              <Link
                key={l.id}
                href={`/school/lesson/${l.id}`}
                onClick={e => e.stopPropagation()}
                style={{
                  background: "var(--bg)", padding: "12px 14px",
                  display: "grid", gridTemplateColumns: "1fr 1fr 80px", gap: 12,
                  alignItems: "center", textDecoration: "none", color: "inherit",
                }}
              >
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 2, color: "var(--fg)" }}>{l.title}</div>
                  <div style={{ fontSize: 10, color: "var(--muted)" }}>{l.description}</div>
                </div>
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                  {l.topics.split(",").map(t => t.trim()).filter(Boolean).map(t => (
                    <span key={t} style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: "var(--muted)", border: "1px solid var(--border)", padding: "1px 6px" }}>{t}</span>
                  ))}
                </div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--accent)", textAlign: "right" }}>{l.duration}</div>
              </Link>
            ))}
          </div>
          <div style={{ marginTop: 16, display: "flex", gap: 12 }} onClick={e => e.stopPropagation()}>
            <Link href={`/school/${m.moduleId}`} className="btn-connect" style={{ fontSize: 10, padding: "6px 18px", textDecoration: "none" }}>
              Start Module
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

export default function SchoolPage({ modules }: { modules: SchoolModuleContent[] }) {
  const { session, profile } = useAuth()
  const freeModules = modules.filter(m => m.access === "free")
  const memberModules = modules.filter(m => m.access === "member")

  return (
    <Layout title="SUPERCOMPUTE · Web3 School">
      <section className="hero" id="school">
        <div className="hero-kicker">
          <div className="status-dot" />
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
          <div className="label">// free modules · {freeModules.length}</div>
          <div><h2 className="display-md">Start Learning Free</h2></div>
        </div>
        {freeModules.length === 0 ? (
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "40px", textAlign: "center", color: "var(--muted)", fontSize: 12 }}>
            No modules published yet. Editors add school modules via TinaCMS at /admin.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 1, background: "var(--border)", border: "1px solid var(--border)" }}>
            {freeModules.map(m => <ModuleCard key={m.moduleId} m={m} />)}
          </div>
        )}
      </section>

      {memberModules.length > 0 && (
        <section className="section">
          <div className="section-header">
            <div className="label">// member modules · {memberModules.length}</div>
            <div><h2 className="display-md">For $SCOM Holders</h2></div>
          </div>
          {session ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 1, background: "var(--border)", border: "1px solid var(--border)" }}>
              {memberModules.map(m => <ModuleCard key={m.moduleId} m={m} />)}
            </div>
          ) : (
            <div style={{ background: "var(--surface)", border: "1px solid var(--border-accent)", padding: "40px 24px", textAlign: "center" }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>🪙</div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "var(--accent)", marginBottom: 8 }}>
                {memberModules.length} Member-Only Module{memberModules.length === 1 ? "" : "s"}
              </div>
              <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 16 }}>
                Connect your wallet with 100+ $SCOM to unlock advanced modules and assignments.
              </p>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--accent)" }}>
                // Use the Connect button in the sidebar
              </div>
            </div>
          )}
        </section>
      )}

      {session && (
        <section className="section">
          <div className="section-header">
            <div className="label">// progress</div>
            <div><h2 className="display-md">Your Progress</h2></div>
          </div>
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "20px 24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: "var(--muted)" }}>Overall Completion</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--accent)" }}>0%</span>
            </div>
            <div style={{ height: 6, background: "var(--border)", borderRadius: 3, overflow: "hidden" }}>
              <div style={{ width: "0%", height: "100%", background: "var(--accent)", borderRadius: 3 }} />
            </div>
            <div style={{ display: "flex", gap: 24, marginTop: 16, fontSize: 11, color: "var(--muted)" }}>
              <span>0 / {modules.reduce((s, m) => s + m.lessons.length, 0)} lessons complete</span>
              <span>{profile?.name ?? "Connect"} · {profile?.role ?? "Member"}</span>
            </div>
          </div>
        </section>
      )}

      <Footer />
    </Layout>
  )
}
