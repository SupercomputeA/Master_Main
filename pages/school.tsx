import type { GetStaticProps } from "next"
import Link from "next/link"
import PublicLayout from "../components/PublicLayout"
import Footer from "../components/Footer"
import { useAuth } from "../lib/auth"
import { getAllSchoolModules, type SchoolModuleContent } from "../lib/content"

/* Public School landing — all sizzle. Sells the curriculum (tracks, credentials,
   stats) but exposes NO classwork: lesson plans and lessons live behind login.
   Logged out → track cards are teasers + a Join/Sign-in CTA. Logged in → cards
   link into the modules. */

export const getStaticProps: GetStaticProps = async () => {
  const modules = await getAllSchoolModules()
  return { props: { modules } }
}

function TrackCard({ m, unlocked }: { m: SchoolModuleContent; unlocked: boolean }) {
  const inner = (
    <>
      <div className="sz-track-top">
        <div className="sz-track-ico" style={{ color: m.color, borderColor: `${m.color}55` }}>{m.icon}</div>
        <div>
          <div className="sz-track-name">{m.title}</div>
          <div className="sz-track-sub">{m.subtitle}</div>
        </div>
      </div>
      <div className="sz-track-desc">{m.description}</div>
      <div className="sz-track-meta">
        <span>{m.lessons.length} lessons · {m.duration} · {m.difficulty}</span>
        <span className="sz-track-lock">{unlocked ? "open →" : (m.access === "member" ? "$SCOM 🔒" : "sign in →")}</span>
      </div>
    </>
  )
  return unlocked
    ? <Link href={`/school/${m.moduleId}`} className="sz-track">{inner}</Link>
    : <div className="sz-track">{inner}</div>
}

export default function SchoolPage({ modules }: { modules: SchoolModuleContent[] }) {
  const { session } = useAuth()
  const unlocked = !!session

  const totalLessons = modules.reduce((s, m) => s + m.lessons.length, 0)
  const credentials = modules.filter(m => m.credential).length || modules.length

  return (
    <PublicLayout title="SUPERCOMPUTE · Web3 School">
      <div className="landing">
      <section className="l-hero">
        <div className="l-eyebrow">
          <span><span className="gold">./school</span> --supercompute</span>
          <span className="l-caret" />
        </div>
        <h1 className="headline">Web3 School</h1>
        <div className="subheader">Build with liberation in mind</div>
        <p className="hero-copy">
          Principled Web3 education. Wallet Security, DeFi, ReFi, and Core Values —
          taught by an operator who ships. Earn NFT credentials on Base. Start free,
          scale to TradeDesk access.
        </p>
        <div style={{ marginTop: 32, display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          {unlocked ? (
            <Link href={`/school/${modules[0]?.moduleId ?? ""}`} className="btn btn-primary">Enter your curriculum</Link>
          ) : (
            <>
              <Link href="/auth" className="btn btn-primary">Join free to start</Link>
              <Link href="/auth" className="btn btn-outline">Sign in</Link>
            </>
          )}
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <div className="label">// by the numbers</div>
          <div><h2 className="display-md">What's Inside</h2></div>
        </div>
        <div className="sz-stats">
          <div className="sz-stat"><div className="n">{modules.length}</div><div className="l">Tracks</div></div>
          <div className="sz-stat"><div className="n">{totalLessons}</div><div className="l">Lessons</div></div>
          <div className="sz-stat"><div className="n">{credentials}</div><div className="l">NFT Credentials</div></div>
        </div>

        <div className="sz-tracks">
          {modules.map(m => <TrackCard key={m.moduleId} m={m} unlocked={unlocked} />)}
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <div className="label">// credentials</div>
          <div><h2 className="display-md">Earn On-Chain</h2></div>
        </div>
        <div style={{ background: "var(--surface-1)", border: "1px solid var(--border-warm)", padding: 32, display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ fontSize: 44, lineHeight: 1 }}>🎖️</div>
          <div style={{ flex: 1, minWidth: 260 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: "var(--cream)", marginBottom: 6 }}>Soul-bound NFT credentials on Base</div>
            <p style={{ fontSize: 13, color: "var(--mono-blue)", lineHeight: 1.7 }}>
              Finish a track and mint a verifiable credential, attested by the Supercompute
              service. Stack them toward TradeDesk access and member modules.
            </p>
          </div>
        </div>
      </section>

      <section className="sz-cta">
        <div className="label" style={{ marginBottom: 16 }}>// enroll</div>
        {unlocked ? (
          <>
            <h2 className="display-lg">You're in. Pick a track and start.</h2>
            <p>Your progress and credentials are tied to your account.</p>
            <Link href={`/school/${modules[0]?.moduleId ?? ""}`} className="btn btn-primary" style={{ padding: "16px 32px" }}>Start learning</Link>
          </>
        ) : (
          <>
            <h2 className="display-lg">Create your account to start learning.</h2>
            <p>The curriculum, lesson plans, and credentials unlock the moment you sign in. Free to join.</p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/auth" className="btn btn-primary" style={{ padding: "16px 32px" }}>Join free</Link>
              <Link href="/auth" className="btn btn-outline" style={{ padding: "16px 32px" }}>Sign in</Link>
            </div>
          </>
        )}
      </section>
      </div>

      <Footer />
    </PublicLayout>
  )
}
