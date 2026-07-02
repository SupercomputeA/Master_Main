import Link from "next/link"
import MemberLayout from "../../components/MemberLayout"

/* Member — Home dashboard. No dedicated template shipped in the export
   (the vertical nav's "Home" pointed at the site hub); built as a clean
   member landing that routes into each member section. */

const CARDS = [
  { icon: "🎯", name: "Projects", desc: "Launch initiatives and collaborate with your team.", href: "/app/projects", meta: "3 active" },
  { icon: "💰", name: "Staking", desc: "Track positions and yield across protocols.", href: "/app/staking", meta: "$245.8K staked" },
  { icon: "📝", name: "Publishing", desc: "Write, upload media, and manage drafts.", href: "/app/publishing", meta: "3 articles" },
  { icon: "🎓", name: "School", desc: "Course modules and progress tracking.", href: "/app/school", meta: "45% complete" },
  { icon: "📊", name: "Token Tracker", desc: "Holdings, transactions, and analytics.", href: "/app/token", meta: "$48,240" },
  { icon: "🧠", name: "Article + Graph", desc: "Knowledge graph, timeline, debate, comments.", href: "/app/article/1", meta: "open" },
]

export default function MemberHome() {
  return (
    <MemberLayout
      title="SUPERCOMPUTE · Member Dashboard"
      banner={{ icon: "◎", title: "Welcome back, operator", sub: "Your member dashboard — projects, staking, publishing, school, and token tracking in one command surface." }}
    >
      <div className="page-header">
        <div>
          <div className="header-label">Member Dashboard</div>
          <h1 className="page-title">Home</h1>
        </div>
      </div>

      <div className="projects-grid">
        {CARDS.map((c) => (
          <Link key={c.name} href={c.href} className="project-card" style={{ textDecoration: "none" }}>
            <div className="project-icon">{c.icon}</div>
            <div className="project-name">{c.name}</div>
            <div className="project-desc">{c.desc}</div>
            <div className="project-meta">{c.meta}</div>
          </Link>
        ))}
      </div>
    </MemberLayout>
  )
}
