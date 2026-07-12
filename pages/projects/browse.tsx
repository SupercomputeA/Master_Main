import type { GetStaticProps } from "next"
import PublicLayout from "../../components/PublicLayout"
import Footer from "../../components/Footer"
import Link from "next/link"
import { getAllProjects, type Project } from "../../lib/content"

export const getStaticProps: GetStaticProps = async () => {
  const projects = await getAllProjects()
  return { props: { projects } }
}

export default function ProjectBrowse({ projects }: { projects: Project[] }) {
  return (
    <PublicLayout title="SUPERCOMPUTE · Projects">
      <section className="hero" id="projects">
        <div className="hero-kicker">
          <div className="status-dot" />
          <span className="label">// projects</span>
        </div>
        <h1 className="display-xl hero-title">ECOSYSTEM<br /><em>PROJECTS</em></h1>
        <p className="hero-sub">Browse the Supercompute ecosystem — each project has its own token, agent, and on-chain milestones.</p>
      </section>

      <section className="section">
        <div className="section-header">
          <div className="label">// ecosystem</div>
          <div><h2 className="display-md">All Projects · {projects.length}</h2></div>
        </div>
        {projects.length === 0 ? (
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "40px", textAlign: "center", color: "var(--muted)", fontSize: 12 }}>
            No projects yet. Editors add projects via TinaCMS at /admin.
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 1, background: "var(--border)", border: "1px solid var(--border)" }}>
            {projects.map(p => (
              <div key={p.slug} style={{ background: "var(--bg)", padding: 0 }}>
                <div style={{ height: 100, background: "linear-gradient(135deg, var(--surface) 0%, var(--bg-alt) 100%)", display: "flex", alignItems: "center", justifyContent: "center", borderBottom: "1px solid var(--border)", position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", top: 12, right: 12, fontFamily: "var(--font-mono)", fontSize: 8, color: "var(--accent)", border: "1px solid var(--border)", padding: "2px 8px" }}>{p.chain}</div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 700, color: "var(--accent)", opacity: 0.2 }}>{p.title.toUpperCase()}</div>
                </div>
                <div style={{ padding: "18px 20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>{p.title}</div>
                      <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{p.tagline}</div>
                    </div>
                    {p.tokenSymbol && (
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--accent)", border: "1px solid var(--border-accent)", padding: "2px 6px", flexShrink: 0 }}>{p.tokenSymbol}</span>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 12, marginBottom: 14, fontFamily: "var(--font-mono)", fontSize: 9 }}>
                    <span style={{ color: "var(--teal)" }}>// {p.status}</span>
                    <span style={{ color: "var(--muted)" }}>{p.agents || 0} agent{(p.agents || 0) === 1 ? "" : "s"}</span>
                    <span style={{ color: "var(--muted)" }}>pre-TGE</span>
                  </div>
                  <Link href={`/projects/${p.slug}`} className="btn-connect" style={{ fontSize: 10, padding: "6px 14px", textDecoration: "none" }}>View Details →</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <Footer />
    </PublicLayout>
  )
}
