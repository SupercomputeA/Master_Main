import Link from "next/link"
import MemberLayout from "../../components/MemberLayout"
import { MEMBER_PROJECTS } from "../../lib/memberProjects"

/* Member — Projects (port of MemberProjects.dc.html).
   Cards link to project detail; "+ New Project" routes to the create screen. */

export default function MemberProjects() {
  return (
    <MemberLayout
      title="SUPERCOMPUTE · Your Projects"
      banner={{ icon: "🎯", title: "Build & Collaborate", sub: "Launch new initiatives, manage team projects, and track progress across your portfolio of ideas." }}
    >
      <div className="page-header">
        <div className="header-left">
          <div className="header-label">Member Dashboard</div>
          <h1 className="page-title">Your Projects</h1>
        </div>
        <Link href="/app/projects/new" className="mem-btn" style={{ textDecoration: "none" }}>+ New Project</Link>
      </div>

      <div className="projects-grid">
        {MEMBER_PROJECTS.map((p) => (
          <Link key={p.slug} href={`/app/projects/${p.slug}`} className="project-card" style={{ textDecoration: "none" }}>
            <div className="project-icon">{p.icon}</div>
            <div className="project-name">{p.name}</div>
            <div className="project-desc">{p.desc}</div>
            <div className="project-meta">Created {p.created} • {p.collaborators.length} collaborator{p.collaborators.length === 1 ? "" : "s"}</div>
          </Link>
        ))}
      </div>
    </MemberLayout>
  )
}
