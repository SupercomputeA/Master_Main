import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import Link from "next/link"
import type { GetStaticProps } from "next"
import MemberLayout from "../../components/MemberLayout"
import { useAuth } from "../../lib/auth"
import { getAllSchoolModules, type SchoolModuleContent } from "../../lib/content"

/* Member — School (after login = the steak). Real curriculum from content/school,
   each card links into the module coursework. Login-gated: logged-out visitors
   never see the vertical member nav here — they're sent to the /school sizzle. */

export const getStaticProps: GetStaticProps = async () => {
  const modules = await getAllSchoolModules()
  return { props: { modules } }
}

function StatusTag({ done }: { done: boolean }) {
  return done
    ? <span className="course-status done">Completed</span>
    : <span className="course-status progress">Start →</span>
}

export default function MemberSchool({ modules }: { modules: SchoolModuleContent[] }) {
  const { session } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  useEffect(() => {
    if (mounted && !session) router.replace("/school")
  }, [mounted, session, router])

  if (!mounted || !session) return null

  const doneCount = modules.filter(m => m.done).length
  const pct = modules.length ? Math.round((doneCount / modules.length) * 100) : 0

  return (
    <MemberLayout
      title="SUPERCOMPUTE · Web3 School"
      banner={{ icon: "🎓", title: "Learn & Master", sub: "Unlock Web3 knowledge through structured courses, practical modules, and community-driven education." }}
    >
      <div className="page-header">
        <div>
          <div className="header-label">Member Dashboard</div>
          <h1 className="page-title">Web3 School</h1>
        </div>
      </div>

      <div className="progress-card">
        <div className="progress-label">Overall Progress</div>
        <div className="progress-percent">{pct}%</div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="courses-grid">
        {modules.map((m) => (
          <Link key={m.moduleId} href={`/school/${m.moduleId}`} className="course-card" style={{ textDecoration: "none", color: "inherit" }}>
            <div className="course-icon">{m.icon}</div>
            <div className="course-title">{m.title}</div>
            <div className="course-desc">{m.description}</div>
            <div className="course-meta">
              <span>{m.lessons.length} lessons · {m.duration}</span>
              <StatusTag done={m.done} />
            </div>
          </Link>
        ))}
      </div>
    </MemberLayout>
  )
}
