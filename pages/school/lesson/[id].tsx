import type { GetStaticPaths, GetStaticProps } from "next"
import Link from "next/link"
import PublicLayout from "../../../components/PublicLayout"
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

/* The lesson data is a catalog entry (title, one-line description, topics) —
   there is no lesson body. So this presents an honest "lesson brief":
   objectives (topics) + a practical exercise, not fabricated prose. */
function LessonBody({ ctx }: { ctx: LessonContext }) {
  const { mod, lesson, prev, next } = ctx
  const topics = lesson.topics.split(",").map(t => t.trim()).filter(Boolean)

  return (
    <>
      <section className="section">
        <div className="section-header">
          <div className="label">// brief</div>
          <div><h2 className="display-md">Lesson Brief</h2></div>
        </div>
        <div style={{ background: "var(--surface-1)", border: "1px solid var(--border)", padding: 32 }}>
          <p style={{ fontSize: 14, color: "var(--cream)", lineHeight: 1.8, maxWidth: 720, marginBottom: 24 }}>
            {lesson.description}
          </p>

          <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, lineHeight: 2 }}>
            <div style={{ marginBottom: 12, color: "var(--gold-warm)" }}>{">"}_ objectives</div>
            {topics.map((t, i) => (
              <div key={t} style={{ paddingLeft: 24, color: "var(--cream)" }}>
                <span style={{ color: "var(--mono-blue)" }}>[{String(i + 1).padStart(2, "0")}]</span> {t}
              </div>
            ))}
          </div>

          <div style={{ marginTop: 28, padding: "18px 20px", background: "var(--surface-2)", border: "1px solid var(--border-warm)" }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--gold-warm)", marginBottom: 8, letterSpacing: "0.05em" }}>$ practical exercise</div>
            <div style={{ fontSize: 13, color: "var(--cream)", lineHeight: 1.7 }}>
              Work through each objective above, then submit your notes toward the{" "}
              {mod.credential || "module completion"} credential. Full lesson delivery happens in the member cohort.
            </div>
          </div>
        </div>
      </section>

      <section className="section" style={{ borderBottom: "none" }}>
        <div className="section-header">
          <div className="label">// navigation</div>
          <div><h2 className="display-md">Continue Learning</h2></div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          {prev ? (
            <Link href={`/school/lesson/${prev.id}`} style={{
              flex: 1, minWidth: 200, padding: "18px 24px", border: "1px solid var(--border)",
              textDecoration: "none", display: "flex", flexDirection: "column", gap: 4,
            }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--gold-warm)" }}>← Previous Lesson</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--cream)" }}>{prev.title}</div>
              <div style={{ fontSize: 10, color: "var(--mono-blue)" }}>{prev.duration}</div>
            </Link>
          ) : <div style={{ flex: 1, minWidth: 200 }} />}
          <Link href={`/school/${mod.moduleId}`} style={{
            padding: "18px 24px", border: "1px solid var(--border)",
            textDecoration: "none", display: "flex", flexDirection: "column", gap: 4, alignItems: "center",
          }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--gold-warm)" }}>↑ Module Overview</div>
            <div style={{ fontSize: 11, color: "var(--cream)" }}>{mod.moduleId} {mod.title}</div>
          </Link>
          {next ? (
            <Link href={`/school/lesson/${next.id}`} style={{
              flex: 1, minWidth: 200, padding: "18px 24px", border: "1px solid var(--border)",
              textDecoration: "none", display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end",
            }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--gold-warm)" }}>Next Lesson →</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--cream)" }}>{next.title}</div>
              <div style={{ fontSize: 10, color: "var(--mono-blue)" }}>{next.duration}</div>
            </Link>
          ) : <div style={{ flex: 1, minWidth: 200 }} />}
        </div>
      </section>
    </>
  )
}

export default function LessonPage({ ctx }: { ctx: LessonContext }) {
  const { mod, lesson, index } = ctx
  const topics = lesson.topics.split(",").map(t => t.trim()).filter(Boolean)

  return (
    <PublicLayout title={`SUPERCOMPUTE · ${lesson.title}`}>
      <section className="hero" style={{ paddingBottom: 48 }}>
        <div className="hero-kicker">
          <div className="status-dot" />
          <span className="label" style={{ color: mod.color }}>// {mod.moduleId} · lesson {String(index + 1).padStart(2, "0")}</span>
        </div>
        <div style={{ marginBottom: 12 }}>
          <Link href={`/school/${mod.moduleId}`} style={{
            fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--gold-warm)",
            textDecoration: "none", borderBottom: "1px solid var(--border-warm)",
          }}>
            ← {mod.moduleId} {mod.title}
          </Link>
        </div>
        <h1 className="display-xl hero-title" style={{ fontSize: "clamp(28px, 4vw, 48px)" }}>
          {lesson.title}
        </h1>
        <p className="hero-sub" style={{ maxWidth: 600, marginBottom: 24 }}>{lesson.description}</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
          <span style={{
            fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase",
            padding: "3px 10px", border: "1px solid var(--border-warm)", color: "var(--gold-warm)",
          }}>
            {lesson.duration}
          </span>
          <span style={{
            fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.1em",
            padding: "3px 10px", border: "1px solid var(--border)", color: "var(--cream)",
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

      <section className="section">
        <div className="section-header">
          <div className="label">// topics · {topics.length}</div>
          <div><h2 className="display-md">Key Topics</h2></div>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {topics.map(t => (
            <span key={t} style={{
              fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.05em",
              padding: "6px 14px", border: "1px solid var(--border-warm)", color: "var(--gold-warm)",
            }}>
              {t}
            </span>
          ))}
        </div>
      </section>

      {mod.access === "member" ? (
        <section className="section" style={{ borderBottom: "none", paddingBottom: 0 }}>
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
    </PublicLayout>
  )
}
