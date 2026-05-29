import type { GetStaticPaths, GetStaticProps } from "next"
import Link from "next/link"
import Layout from "../../../components/Layout"
import Footer from "../../../components/Footer"
import TokenGate from "../../../components/TokenGate"
import { getAllSchoolModules, type SchoolModuleContent, type SchoolLesson } from "../../../lib/content"

interface LessonContext {
  mod: SchoolModuleContent
  lesson: SchoolLesson
  index: number
  prev: SchoolLesson | null
  next: SchoolLesson | null
}

export const getStaticPaths: GetStaticPaths = async () => {
  const modules = await getAllSchoolModules()
  const paths: { params: { id: string } }[] = []
  for (const m of modules) {
    for (const l of m.lessons) {
      paths.push({ params: { id: l.id } })
    }
  }
  return { paths, fallback: false }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const id = params?.id as string
  const modules = await getAllSchoolModules()
  for (const m of modules) {
    const idx = m.lessons.findIndex(l => l.id === id)
    if (idx !== -1) {
      const ctx: LessonContext = {
        mod: m,
        lesson: m.lessons[idx],
        index: idx,
        prev: idx > 0 ? m.lessons[idx - 1] : null,
        next: idx < m.lessons.length - 1 ? m.lessons[idx + 1] : null,
      }
      return { props: { ctx } }
    }
  }
  return { notFound: true }
}

function LessonBody({ ctx }: { ctx: LessonContext }) {
  const { mod, lesson, index, prev, next } = ctx
  const topics = lesson.topics.split(",").map(t => t.trim()).filter(Boolean)

  return (
    <>
      <section className="section">
        <div className="section-header">
          <div className="label">// topics</div>
          <div><h2 className="display-md">Key Topics</h2></div>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {topics.map(t => (
            <span key={t} style={{
              fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.05em",
              padding: "6px 14px", border: "1px solid var(--border-accent)", color: "var(--accent)",
              background: "var(--accent-dim)",
            }}>
              {t}
            </span>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <div className="label">// content</div>
          <div><h2 className="display-md">Lesson Content</h2></div>
        </div>
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "32px" }}>
          <div style={{ fontSize: 13, color: "var(--fg)", lineHeight: 1.8, maxWidth: 720 }}>
            <p style={{ marginBottom: 20 }}>
              This lesson covers <strong style={{ color: "var(--accent)" }}>{lesson.title.toLowerCase()}</strong> —
              part of the <strong style={{ color: mod.color }}>{mod.title}</strong> module.
            </p>
            <p style={{ marginBottom: 20 }}>{lesson.description}</p>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--fg)", lineHeight: 2 }}>
              <div style={{ marginBottom: 16 }}>{">"}_ Learning objectives:</div>
              {topics.map((t, i) => (
                <div key={t} style={{ paddingLeft: 24, color: "var(--accent)" }}>
                  [{String(i + 1).padStart(2, "0")}] {t}
                </div>
              ))}
            </div>
            <div style={{ marginTop: 24, padding: "16px 20px", background: "var(--bg-alt)", border: "1px solid var(--border)" }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--accent)", marginBottom: 6 }}>$ practical exercise</div>
              <div style={{ fontSize: 12, color: "var(--fg)", lineHeight: 1.7 }}>
                Complete the hands-on exercise for this lesson. Apply each topic listed above.
                Submit your work to receive credit toward the {mod.credential || "module completion"} credential.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section" style={{ borderBottom: "none" }}>
        <div className="section-header">
          <div className="label">// navigation</div>
          <div><h2 className="display-md">Continue Learning</h2></div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
          {prev ? (
            <Link href={`/school/lesson/${prev.id}`} style={{
              flex: 1, padding: "18px 24px", border: "1px solid var(--border)",
              textDecoration: "none", display: "flex", flexDirection: "column", gap: 4,
            }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--accent)" }}>← Previous Lesson</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--fg)" }}>{prev.title}</div>
              <div style={{ fontSize: 10, color: "var(--fg)" }}>{prev.duration}</div>
            </Link>
          ) : <div style={{ flex: 1 }} />}
          <Link href={`/school/${mod.moduleId}`} style={{
            padding: "18px 24px", border: "1px solid var(--border)",
            textDecoration: "none", display: "flex", flexDirection: "column", gap: 4, alignItems: "center",
          }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--accent)" }}>↑ Module Overview</div>
            <div style={{ fontSize: 11, color: "var(--fg)" }}>{mod.moduleId} {mod.title}</div>
          </Link>
          {next ? (
            <Link href={`/school/lesson/${next.id}`} style={{
              flex: 1, padding: "18px 24px", border: "1px solid var(--border)",
              textDecoration: "none", display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end",
            }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--accent)" }}>Next Lesson →</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--fg)" }}>{next.title}</div>
              <div style={{ fontSize: 10, color: "var(--fg)" }}>{next.duration}</div>
            </Link>
          ) : <div style={{ flex: 1 }} />}
        </div>
      </section>
    </>
  )
}

export default function LessonPage({ ctx }: { ctx: LessonContext }) {
  const { mod, lesson, index } = ctx

  return (
    <Layout title={`SUPERCOMPUTE · ${lesson.title}`}>
      <section className="hero" style={{ paddingBottom: 48 }}>
        <div className="hero-kicker">
          <div className="status-dot" />
          <span className="label" style={{ color: mod.color }}>// {mod.moduleId} · lesson {String(index + 1).padStart(2, "0")}</span>
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 16, marginBottom: 8 }}>
          <Link href={`/school/${mod.moduleId}`} style={{
            fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--accent)",
            textDecoration: "none", borderBottom: "1px solid var(--accent-dim)",
          }}>
            ← {mod.moduleId} {mod.title}
          </Link>
        </div>
        <h1 className="display-xl hero-title" style={{ fontSize: "clamp(28px, 4vw, 48px)" }}>
          {lesson.title}
        </h1>
        <p className="hero-sub" style={{ maxWidth: 600, marginBottom: 24 }}>{lesson.description}</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", marginBottom: 16 }}>
          <span style={{
            fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase",
            padding: "3px 10px", border: "1px solid var(--accent-dim)", color: "var(--accent)",
          }}>
            {lesson.duration}
          </span>
          <span style={{
            fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.1em",
            padding: "3px 10px", border: "1px solid var(--border)", color: "var(--fg)",
          }}>
            Lesson {index + 1} / {mod.lessons.length}
          </span>
          <span style={{
            fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase",
            padding: "3px 10px", border: `1px solid ${mod.color}44`, color: mod.color,
          }}>
            {mod.access}
          </span>
        </div>
      </section>

      {mod.access === "member" ? (
        <section className="section">
          <TokenGate
            requirements={[
              { token: "$SCOM", minBalance: "100", label: "Hold 100 $SCOM for this lesson" },
            ]}
          >
            <LessonBody ctx={ctx} />
          </TokenGate>
        </section>
      ) : (
        <LessonBody ctx={ctx} />
      )}

      <Footer />
    </Layout>
  )
}
