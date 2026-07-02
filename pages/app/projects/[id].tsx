import type { GetStaticPropsContext } from "next"
import Link from "next/link"
import MemberLayout from "../../../components/MemberLayout"
import { MEMBER_PROJECTS, getMemberProject, type MemberProject } from "../../../lib/memberProjects"

/* Project detail — net-new screen (no template shipped; designed in Terminal
   Dossier). Statically generated per known slug (the site is `output: export`).
   Placeholder data until wired to the D1 `projects` table. */

export function getStaticPaths() {
  return { paths: MEMBER_PROJECTS.map((p) => ({ params: { id: p.slug } })), fallback: false }
}

export function getStaticProps(ctx: GetStaticPropsContext) {
  const id = typeof ctx.params?.id === "string" ? ctx.params.id : ""
  const project = getMemberProject(id) ?? null
  return { props: { id, project } }
}

export default function ProjectDetail({ id, project }: { id: string; project: MemberProject | null }) {
  const doneCount = project ? project.tasks.filter((t) => t.done).length : 0

  return (
    <MemberLayout title={`SUPERCOMPUTE · ${project?.name ?? "Project"}`}>
      <div className="tpl-pdetail">
        <div className="page-header" style={{ borderBottom: "none", marginBottom: 8, paddingBottom: 0 }}>
          <div>
            <div className="header-label">Member Dashboard</div>
          </div>
          <Link href="/app/projects" className="mem-btn" style={{ textDecoration: "none" }}>← All projects</Link>
        </div>

        {!project ? (
          <div className="pd-panel term-card">
            <div className="pd-panel-title">Not found</div>
            <div className="pd-prose">No project with id <span style={{ color: "var(--gold-warm)" }}>{id}</span>. It may have been archived. <Link href="/app/projects" style={{ color: "var(--gold-warm)" }}>Back to your projects →</Link></div>
          </div>
        ) : (
          <>
            <div className="pd-head">
              <div className="pd-icon">{project.icon}</div>
              <div>
                <h1 className="pd-name">{project.name}</h1>
                <div className="pd-meta">
                  <span className={`pd-badge${project.status === "paused" ? " paused" : ""}`}>{project.status}</span>
                  <span>Created {project.created}</span>
                  <span>{project.collaborators.length} collaborator{project.collaborators.length === 1 ? "" : "s"}</span>
                  <span>{doneCount}/{project.tasks.length} tasks done</span>
                </div>
              </div>
            </div>

            <div className="pd-grid">
              <div className="pd-panel term-card">
                <div className="pd-panel-title">Overview</div>
                <p className="pd-prose">{project.desc}</p>

                <div className="pd-panel-title" style={{ marginTop: 28 }}>Tasks</div>
                {project.tasks.map((t) => (
                  <div key={t.label} className="pd-task">
                    <span className={`dot${t.done ? "" : " open"}`} />
                    <span style={{ color: t.done ? "rgba(244,236,216,0.5)" : "var(--cream)", textDecoration: t.done ? "line-through" : "none" }}>{t.label}</span>
                  </div>
                ))}
              </div>

              <div>
                <div className="pd-panel term-card" style={{ marginBottom: 28 }}>
                  <div className="pd-panel-title">Collaborators</div>
                  {project.collaborators.map((c) => (
                    <div key={c} className="pd-row"><span className="k">@{c}</span><span className="v">member</span></div>
                  ))}
                </div>
                <div className="pd-panel term-card">
                  <div className="pd-panel-title">Activity</div>
                  {project.activity.map((a, i) => (
                    <div key={i} className="pd-row"><span className="k">{a.text}</span><span className="v">{a.time}</span></div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </MemberLayout>
  )
}
