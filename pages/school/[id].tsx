import Layout from "../../components/Layout"
import Footer from "../../components/Footer"
import { useRouter } from "next/router"
import { getModule } from "../../lib/school"
import Link from "next/link"

export default function ModulePage() {
  const router = useRouter()
  const { id } = router.query
  const mod = typeof id === "string" ? getModule(id) : undefined

  if (!mod) {
    return (
      <Layout title="SUPERCOMPUTE · Module Not Found">
        <section className="hero">
          <div className="hero-kicker"><div className="status-dot"></div><span className="label">// error</span></div>
          <h1 className="display-xl hero-title">MODULE<br /><em>NOT FOUND</em></h1>
          <p className="hero-sub">No module with ID "{id}" exists.</p>
          <div className="hero-actions" style={{ marginTop: 24 }}>
            <Link href="/school" className="btn btn-outline">← Back to School</Link>
          </div>
        </section>
        <Footer />
      </Layout>
    )
  }

  return (
    <Layout title={`SUPERCOMPUTE · ${mod.id} ${mod.title}`}>
      <section className="hero">
        <div className="hero-kicker">
          <div className="status-dot"></div>
          <span className="label">// {mod.id}</span>
        </div>
        <h1 className="display-xl hero-title" style={{ fontSize: "clamp(32px, 5vw, 64px)" }}>
          {mod.title}<br /><em style={{ color: mod.color }}>{mod.subtitle}</em>
        </h1>
        <p className="hero-sub">{mod.description}</p>
        <div className="hero-meta">
          <div className="meta-item"><div className="label-sm">Duration</div><div className="val" style={{ fontSize: 16 }}>{mod.duration}</div></div>
          <div className="meta-item"><div className="label-sm">Lessons</div><div className="val" style={{ fontSize: 16 }}>{mod.lessons.length}</div></div>
          <div className="meta-item"><div className="label-sm">Difficulty</div><div className="val" style={{ fontSize: 16, color: mod.color }}>{mod.difficulty}</div></div>
          <div className="meta-item"><div className="label-sm">Access</div><div className="val" style={{ fontSize: 16 }}>{mod.access.toUpperCase()}</div></div>
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <div className="label">// curriculum</div>
          <div>
            <h2 className="display-md">Lesson Plan</h2>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 1, background: "var(--border)", border: "1px solid var(--border)" }}>
          {mod.lessons.map((l, i) => (
            <Link key={l.id} href={`/school/lesson/${l.id}`} style={{
              background: "var(--bg)", padding: "18px 24px",
              display: "grid", gridTemplateColumns: "auto 1fr auto",
              gap: 20, alignItems: "center", textDecoration: "none",
              transition: "background 0.15s",
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: "50%",
                background: `${mod.color}15`, border: `1px solid ${mod.color}30`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "var(--font-mono)", fontSize: 11, color: mod.color,
              }}>
                {String(i + 1).padStart(2, "0")}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--fg)", marginBottom: 2 }}>{l.title}</div>
                <div style={{ fontSize: 11, color: "var(--fg)", lineHeight: 1.5 }}>{l.description}</div>
                <div style={{ display: "flex", gap: 4, marginTop: 6 }}>
                  {l.topics.map(t => (
                    <span key={t} style={{
                      fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: "0.05em",
                      padding: "1px 6px", border: "1px solid var(--border)", color: "var(--fg)",
                    }}>{t}</span>
                  ))}
                </div>
              </div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--accent)", whiteSpace: "nowrap" }}>
                {l.duration}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {mod.credential && (
        <section className="section">
          <div className="section-header">
            <div className="label">// credential</div>
            <div>
              <h2 className="display-md">NFT Credential</h2>
            </div>
          </div>
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "24px", display: "flex", gap: 20, alignItems: "center" }}>
            <div style={{
              width: 80, height: 80, borderRadius: "50%",
              background: `${mod.color}20`, border: `2px solid ${mod.color}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 32,
            }}>{mod.icon}</div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>{mod.credential}</div>
              <div style={{ fontSize: 11, color: "var(--fg)", lineHeight: 1.6 }}>
                Complete all {mod.lessons.length} lessons to earn this credential as an on-chain NFT on Base.
                Credentials are soul-bound and verified by the Supercompute attestation service.
              </div>
            </div>
          </div>
        </section>
      )}

      <Footer />
    </Layout>
  )
}