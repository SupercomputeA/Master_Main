import Layout from "../../components/Layout"
import Footer from "../../components/Footer"
import { useAuth } from "../../lib/auth"

const stats = [
  { label: "Total Articles", value: "5", sub: "NewsDesk" },
  { label: "School Modules", value: "7", sub: "2 free, 5 member" },
  { label: "Active Projects", value: "14", sub: "On Base" },
  { label: "Agents Online", value: "3", sub: "All operational" },
]

const agents = [
  { name: "HERMES", role: "BackOffice", status: "Operational" },
  { name: "vQuanta", role: "Operations", status: "Operational" },
  { name: "Condor", role: "Trade", status: "Operational" },
]

export default function AdminDashboard() {
  const { isAdmin } = useAuth()

  return (
    <Layout title="SUPERCOMPUTE · Admin">
      <section className="hero" id="admin">
        <div className="hero-kicker">
          <div className="status-dot"></div>
          <span className="label">// admin · command</span>
        </div>
        <h1 className="display-xl hero-title">
          COMMAND<br /><em>CENTER</em>
        </h1>
        <p className="hero-sub">
          Admin dashboard. Content management, agent fleet monitoring, and system controls.
        </p>
      </section>

      {isAdmin ? (
        <>
          <section className="section">
            <div className="section-header">
              <div className="label">// overview</div>
              <div>
                <h2 className="display-md">System Status</h2>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 1, background: "var(--border)", border: "1px solid var(--border)" }}>
              {stats.map((s, i) => (
                <div key={i} style={{ background: "var(--bg)", padding: "20px" }}>
                  <div className="label-sm" style={{ marginBottom: 8 }}>{s.label}</div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 36, fontWeight: 700, color: "var(--accent)", lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>{s.sub}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="section">
            <div className="section-header">
              <div className="label">// fleet</div>
              <div>
                <h2 className="display-md">Agent Status</h2>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 1, background: "var(--border)", border: "1px solid var(--border)" }}>
              <div style={{ background: "var(--surface)", padding: "10px 20px", display: "grid", gridTemplateColumns: "1fr 1fr 120px", gap: 12, fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--muted)", textTransform: "uppercase" }}>
                <div>Agent</div>
                <div>Role</div>
                <div>Status</div>
              </div>
              {agents.map((a, i) => (
                <div key={i} style={{ background: "var(--bg)", padding: "14px 20px", display: "grid", gridTemplateColumns: "1fr 1fr 120px", gap: 12, alignItems: "center" }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{a.name}</div>
                  <div style={{ fontSize: 12, color: "var(--muted)" }}>{a.role}</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--accent)" }}>
                    <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "var(--accent)", marginRight: 6 }}></span>
                    {a.status}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      ) : (
        <section className="section">
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "60px 24px", textAlign: "center", color: "var(--muted)", fontSize: 13 }}>
            Admin access required. Connect your wallet and sign in as admin.
          </div>
        </section>
      )}

      <Footer />
    </Layout>
  )
}
