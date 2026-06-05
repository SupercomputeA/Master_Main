import type { GetStaticPaths, GetStaticProps } from "next"
import Layout from "../../components/Layout"
import Footer from "../../components/Footer"
import { useAuth } from "../../lib/auth"
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
  const { session } = useAuth()
  const sortedUpdates = [...project.updates].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <Layout title={`SUPERCOMPUTE · ${project.title}`}>
      <section className="hero" id="project-detail">
        <div className="hero-kicker"><div className="status-dot" /><span className="label">// {project.slug}</span></div>
        <h1 className="display-xl hero-title">{project.title}<br /><em>{project.tokenSymbol}</em></h1>
        <p className="hero-sub">{project.tagline}</p>
        <div className="hero-meta" style={{ marginTop: 20 }}>
          <div className="meta-item"><div className="label-sm">// Status</div><div className="val" style={{ color: "var(--accent)" }}>{project.status}</div></div>
          <div className="meta-item"><div className="label-sm">// Chain</div><div className="val">{project.chain}</div></div>
          <div className="meta-item"><div className="label-sm">// TVL</div><div className="val">{project.tvl}</div></div>
          <div className="meta-item"><div className="label-sm">// Token</div><div className="val" style={{ color: "var(--accent)" }}>{project.tokenSymbol} @ {project.tokenPrice}</div></div>
        </div>
      </section>

      <section className="section">
        <div className="section-header"><div className="label">// about</div><div><h2 className="display-md">About {project.title}</h2></div></div>
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "24px" }}>
          <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.7 }}>{project.description}</p>
        </div>
      </section>

      <section className="section">
        <div className="section-header"><div className="label">// token data</div><div><h2 className="display-md">{project.tokenSymbol}</h2></div></div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1, background: "var(--border)", border: "1px solid var(--border)", marginBottom: 20 }}>
          <div style={{ background: "var(--bg)", padding: "20px" }}>
            <div className="label-sm" style={{ marginBottom: 4 }}>// Symbol</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 700, color: "var(--accent)" }}>{project.tokenSymbol}</div>
          </div>
          <div style={{ background: "var(--bg)", padding: "20px" }}>
            <div className="label-sm" style={{ marginBottom: 4 }}>// Price</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 700, color: "var(--accent)" }}>{project.tokenPrice}</div>
          </div>
          <div style={{ background: "var(--bg)", padding: "20px" }}>
            <div className="label-sm" style={{ marginBottom: 4 }}>// TVL</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 700, color: "var(--accent)" }}>{project.tvl}</div>
          </div>
          <div style={{ background: "var(--bg)", padding: "20px" }}>
            <div className="label-sm" style={{ marginBottom: 4 }}>// Holders</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 700, color: "var(--accent)" }}>{project.investors}</div>
          </div>
        </div>
        {project.tokenAddress && (
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "12px 16px", fontFamily: "var(--font-mono)", fontSize: 11 }}>
            <span style={{ color: "var(--muted)" }}>Contract: </span>
            <a href={`https://basescan.org/token/${project.tokenAddress}`} target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)" }}>
              {project.tokenAddress}
            </a>
          </div>
        )}
      </section>

      <section className="section">
        <div className="section-header"><div className="label">// funding</div><div><h2 className="display-md">Investment</h2></div></div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, background: "var(--border)", border: "1px solid var(--border)", marginBottom: 20 }}>
          <div style={{ background: "var(--bg)", padding: "20px" }}>
            <div className="label-sm" style={{ marginBottom: 4 }}>// Raised</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 700, color: "var(--accent)" }}>${project.raised.toLocaleString()}</div>
            <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>of ${project.goal.toLocaleString()} goal</div>
          </div>
          <div style={{ background: "var(--bg)", padding: "20px" }}>
            <div className="label-sm" style={{ marginBottom: 4 }}>// Investors</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 700, color: "var(--accent)" }}>{project.investors}</div>
            <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>{project.progress}% of goal raised</div>
          </div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--muted)", marginBottom: 6 }}>
            <span>${project.raised.toLocaleString()} raised</span>
            <span>{project.progress}% · ${project.goal.toLocaleString()} goal</span>
          </div>
          <div style={{ height: 6, background: "var(--border)", borderRadius: 3, overflow: "hidden" }}>
            <div style={{ width: `${project.progress}%`, height: "100%", background: "var(--accent)", borderRadius: 3 }} />
          </div>
        </div>
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 4 }}>Requires {project.scomRequired} $SCOM to invest</div>
              <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--accent)" }}>Min investment: $100</div>
            </div>
            {session ? (
              <button className="btn-connect" style={{ fontSize: 11 }}>Invest Now</button>
            ) : (
              <div className="btn-connect" style={{ fontSize: 11, opacity: 0.4 }}>Connect to Invest</div>
            )}
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
    </Layout>
  )
}
