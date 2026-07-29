import type { GetStaticPaths, GetStaticProps } from "next"
import Link from "next/link"
import PublicLayout from "../../components/PublicLayout"
import Footer from "../../components/Footer"
import TokenGate from "../../components/TokenGate"
import AuthGate from "../../components/AuthGate"
import { getAllSchoolModules, getSchoolModule, type SchoolModuleContent } from "../../lib/content"

export const getStaticPaths: GetStaticPaths = async () => {
  const modules = await getAllSchoolModules()
  return {
    paths: modules.map(m => ({ params: { id: m.moduleId } })),
    fallback: false,
  }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const id = params?.id as string
  const mod = await getSchoolModule(id)
  if (!mod) return { notFound: true }
  return { props: { mod } }
}

function ModuleBody({ mod }: { mod: SchoolModuleContent }) {
  return (
    <>
      <section className="section">
        <div className="section-header">
          <div className="label">// curriculum · {mod.lessons.length} lessons</div>
          <div><h2 className="display-md">Lesson Plan</h2></div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 1, background: "var(--border)", border: "1px solid var(--border)" }}>
          {mod.lessons.map((l, i) => (
            <Link key={l.id} href={`/school/lesson/${l.id}`} style={{
              background: "var(--bg)", padding: "18px 24px",
              display: "grid", gridTemplateColumns: "auto 1fr auto",
              gap: 20, alignItems: "center", textDecoration: "none",
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
                <div style={{ display: "flex", gap: 4, marginTop: 6, flexWrap: "wrap" }}>
                  {l.topics.split(",").map(t => t.trim()).filter(Boolean).map(t => (
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
            <div><h2 className="display-md">NFT Credential</h2></div>
          </div>
          <div style={{ background: "var(--surface-1)", border: "1px solid var(--border)", padding: "24px", display: "flex", gap: 20, alignItems: "center" }}>
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
    </>
  )
}

export default function ModulePage({ mod }: { mod: SchoolModuleContent }) {
  return (
    <PublicLayout title={`SUPERCOMPUTE · ${mod.moduleId} ${mod.title}`}>
      <section className="hero">
        <div className="hero-kicker">
          <div className="status-dot" />
          <span className="label">// {mod.moduleId}</span>
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

      <section className="section" style={{ borderBottom: "none", paddingBottom: 0 }}>
        <AuthGate
          title="Sign in to open this module"
          note="The lesson plan and credential unlock once you sign in. Free to join."
        >
          {mod.access === "member" ? (
            <TokenGate
              requirements={[
                { token: "0x5ACDC563450cC35055d7344287C327fafB2b371A", minBalance: "100000000000000000000", label: "Hold 100 $QUANTA for member modules" },
              ]}
            >
              <ModuleBody mod={mod} />
            </TokenGate>
          ) : (
            <ModuleBody mod={mod} />
          )}
        </AuthGate>
      </section>

      <Footer />
    </PublicLayout>
  )
}
