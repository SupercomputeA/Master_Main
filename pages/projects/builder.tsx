import Layout from "../../components/Layout"
import Footer from "../../components/Footer"
import { useAuth } from "../../lib/auth"

const statusOpts = ["Active", "Beta", "Live", "Paused", "Complete"]

export default function ProjectsBuilder() {
  const { session } = useAuth()

  return (
    <Layout title="SUPERCOMPUTE · Projects Builder">
      <section className="hero" id="projects-builder">
        <div className="hero-kicker">
          <div className="status-dot"></div>
          <span className="label">// projects · builder</span>
        </div>
        <h1 className="display-xl hero-title">
          BUILD<br /><em>PROJECTS</em>
        </h1>
        <p className="hero-sub">
          Create, update, and track project configurations across the Supercompute fleet.
        </p>
      </section>

      {session ? (
        <>
          <section className="section">
            <div className="section-header">
              <div className="label">// create</div>
              <div>
                <h2 className="display-md">New Project</h2>
              </div>
            </div>
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "24px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: 16 }}>
                <div>
                  <div className="label-sm" style={{ marginBottom: 6 }}>Project Name</div>
                  <input type="text" placeholder="e.g. Quanta S v2" style={inputStyle} />
                </div>
                <div>
                  <div className="label-sm" style={{ marginBottom: 6 }}>Category</div>
                  <select style={inputStyle} defaultValue="">
                    <option value="" disabled>Select category</option>
                    <option>Agent</option>
                    <option>DeFi</option>
                    <option>Infra</option>
                    <option>App</option>
                    <option>Education</option>
                    <option>Media</option>
                    <option>Commerce</option>
                    <option>Ops</option>
                  </select>
                </div>
                <div>
                  <div className="label-sm" style={{ marginBottom: 6 }}>Status</div>
                  <select style={inputStyle} defaultValue="Active">
                    {statusOpts.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <div className="label-sm" style={{ marginBottom: 6 }}>Chain</div>
                  <input type="text" placeholder="e.g. Base" style={inputStyle} />
                </div>
                <div>
                  <div className="label-sm" style={{ marginBottom: 6 }}>TVL ($)</div>
                  <input type="text" placeholder="e.g. 420000" style={inputStyle} />
                </div>
                <div>
                  <div className="label-sm" style={{ marginBottom: 6 }}>Agents</div>
                  <input type="number" placeholder="0" style={inputStyle} />
                </div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <div className="label-sm" style={{ marginBottom: 6 }}>Description</div>
                <textarea rows={3} placeholder="Project overview..." style={{ ...inputStyle, resize: "vertical" }} />
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
                <button className="btn-connect" style={{ background: "transparent", color: "var(--muted)", borderColor: "var(--border)" }}>Cancel</button>
                <button className="btn-connect">Create Project</button>
              </div>
            </div>
          </section>

          <section className="section">
            <div className="section-header">
              <div className="label">// active</div>
              <div>
                <h2 className="display-md">Project Configs</h2>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 1, background: "var(--border)", border: "1px solid var(--border)" }}>
              <div style={{ background: "var(--surface)", padding: "10px 20px", display: "grid", gridTemplateColumns: "1fr 70px 80px 60px 90px 80px", gap: 12, fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--muted)", textTransform: "uppercase" }}>
                <div>Project</div>
                <div>Status</div>
                <div>TVL</div>
                <div>Agents</div>
                <div>Chains</div>
                <div>Actions</div>
              </div>
              {[
                { name: "Quanta S", status: "Active", tvl: "$420K", agents: 1, chains: "Base" },
                { name: "OpenClaw", status: "Active", tvl: "$230K", agents: 1, chains: "Base" },
                { name: "KNIGHT", status: "Active", tvl: "$180K", agents: 1, chains: "Base" },
                { name: "Token Dashboard", status: "Live", tvl: "—", agents: 0, chains: "Base" },
                { name: "TradeDesk", status: "Beta", tvl: "$65K", agents: 2, chains: "Base, Arb" },
              ].map((p, i) => (
                <div key={i} style={{ background: "var(--bg)", padding: "14px 20px", display: "grid", gridTemplateColumns: "1fr 70px 80px 60px 90px 80px", gap: 12, alignItems: "center" }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{p.name}</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: p.status === "Complete" ? "#666" : "var(--accent)" }}>{p.status}</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--accent)" }}>{p.tvl}</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>{p.agents}</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--muted)" }}>{p.chains}</div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="btn-connect" style={{ fontSize: 9, padding: "4px 10px" }}>Edit</button>
                    <button className="btn-connect" style={{ fontSize: 9, padding: "4px 10px", background: "transparent", color: "var(--muted)", borderColor: "var(--border)" }}>Raise</button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      ) : (
        <section className="section">
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "60px 24px", textAlign: "center", color: "var(--muted)", fontSize: 13 }}>
            Sign in with your wallet to access the project builder.
          </div>
        </section>
      )}

      <Footer />
    </Layout>
  )
}

const inputStyle: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: 12,
  color: "var(--fg)",
  background: "var(--bg)",
  border: "1px solid var(--border)",
  padding: "8px 12px",
  width: "100%",
  outline: "none",
}
