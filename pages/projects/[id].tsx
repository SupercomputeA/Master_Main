import type { GetStaticPaths, GetStaticProps } from "next"
import PublicLayout from "../../components/PublicLayout"
import Footer from "../../components/Footer"
import { getAllProjects, getProject, type Project } from "../../lib/content"

export const getStaticPaths: GetStaticPaths = async () => {
  const projects = await getAllProjects()
  return {
    paths: projects.map(p => ({ params: { id: p.slug } })),
    fallback: false,
  }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const slug = params?.id as string
  const project = await getProject(slug)
  if (!project) return { notFound: true }
  return { props: { project } }
}

export default function ProjectDetail({ project }: { project: Project }) {
  const sortedUpdates = [...project.updates].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <PublicLayout title={`SUPERCOMPUTE · ${project.title}`}>
      <section className="hero" id="project-detail">
        <div className="hero-kicker"><div className="status-dot" /><span className="label">// {project.slug}</span></div>
        <h1 className="display-xl hero-title">{project.title}<br /><em>{project.tokenSymbol}</em></h1>
        <p className="hero-sub">{project.tagline}</p>
        <div className="hero-meta" style={{ marginTop: 20 }}>
          <div className="meta-item"><div className="label-sm">// Status</div><div className="val" style={{ color: "var(--accent)" }}>{project.status}</div></div>
          <div className="meta-item"><div className="label-sm">// Chain</div><div className="val">{project.chain}</div></div>
          <div className="meta-item"><div className="label-sm">// Token</div><div className="val" style={{ color: "var(--accent)" }}>{project.tokenSymbol}</div></div>
        </div>
      </section>

      <section className="section">
        <div className="section-header"><div className="label">// about</div><div><h2 className="display-md">About {project.title}</h2></div></div>
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "24px" }}>
          <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.7 }}>{project.description}</p>
        </div>
      </section>

      <section className="section">
        <div className="section-header"><div className="label">// token</div><div><h2 className="display-md">{project.tokenSymbol}</h2></div></div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1, background: "var(--border)", border: "1px solid var(--border)", marginBottom: 20 }}>
          <div style={{ background: "var(--bg)", padding: "20px" }}>
            <div className="label-sm" style={{ marginBottom: 4 }}>// Symbol</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 24, fontWeight: 700, color: "var(--accent)" }}>{project.tokenSymbol}</div>
          </div>
          <div style={{ background: "var(--bg)", padding: "20px" }}>
            <div className="label-sm" style={{ marginBottom: 4 }}>// Price</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 14, color: "var(--muted)" }}>pre-TGE</div>
          </div>
          <div style={{ background: "var(--bg)", padding: "20px" }}>
            <div className="label-sm" style={{ marginBottom: 4 }}>// Status</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 14, color: "var(--muted)" }}>not deployed</div>
          </div>
        </div>
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "20px" }}>
          <p style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.6 }}>
            {project.tokenSymbol} has not been deployed yet. Token economics and launch details will be published here when finalized.
            No token sale is live. Any claim of a token sale for this project is fraudulent.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="section-header"><div className="label">// funding</div><div><h2 className="display-md">Funding Status</h2></div></div>
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "40px 24px", textAlign: "center" }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 22, color: "var(--accent)", marginBottom: 12 }}>
            Self-funded · Pre-launch
          </div>
          <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6, maxWidth: 460, margin: "0 auto" }}>
            No external raise. No token sale. No investors yet.
            {project.title} is in active development with internal resources.
          </p>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--muted)", marginTop: 24, letterSpacing: "0.1em", textTransform: "uppercase" }}>
            // funding module · not armed
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-header"><div className="label">// updates</div><div><h2 className="display-md">Building Updates</h2></div></div>
        {sortedUpdates.length === 0 ? (
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "24px", textAlign: "center", color: "var(--muted)", fontSize: 12 }}>
            No updates yet.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 1, background: "var(--border)", border: "1px solid var(--border)" }}>
            {sortedUpdates.map((u, i) => (
              <div key={i} style={{ background: "var(--bg)", padding: "16px 20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{
                      fontFamily: "var(--font-mono)", fontSize: 9, padding: "2px 6px",
                      background: u.type === "admin" ? "var(--accent-dim)" : u.type === "milestone" ? "var(--gold-dim)" : "var(--teal-dim)",
                      color: u.type === "admin" ? "var(--accent)" : u.type === "milestone" ? "var(--gold)" : "var(--teal)",
                      border: `1px solid ${u.type === "admin" ? "var(--border-accent)" : "var(--border)"}`,
                    }}>
                      {u.type.toUpperCase()}
                    </span>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--accent)" }}>{u.from}</span>
                  </div>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--muted)" }}>
                    {new Date(u.date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                  </span>
                </div>
                <p style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.6 }}>{u.text}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <Footer />
    </PublicLayout>
  )
}
