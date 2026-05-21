import Layout from "../../components/Layout"
import Footer from "../../components/Footer"
import { useAuth } from "../../lib/auth"

const steps = [
  { num: 1, label: "Define Module", fields: ["Title", "Description", "Difficulty"] },
  { num: 2, label: "Add Lessons", fields: ["Lesson Title", "Content Body", "Duration"] },
  { num: 3, label: "Set Assignments", fields: ["Assignment Name", "Due Date", "Points"] },
  { num: 4, label: "Publish", fields: ["Access Level", "Credential NFT", "Status"] },
]

export default function SchoolBuilder() {
  const { session } = useAuth()

  return (
    <Layout title="SUPERCOMPUTE · School Builder">
      <section className="hero" id="school-builder">
        <div className="hero-kicker">
          <div className="status-dot"></div>
          <span className="label">// school · builder</span>
        </div>
        <h1 className="display-xl hero-title">
          COURSE<br /><em>BUILDER</em>
        </h1>
        <p className="hero-sub">
          Build Web3 School modules with lessons, assignments, and NFT credentials.
        </p>
      </section>

      {session ? (
        <>
          <section className="section">
            <div className="section-header">
              <div className="label">// workflow</div>
              <div>
                <h2 className="display-md">Builder Process</h2>
              </div>
            </div>
            <div style={{ display: "flex", gap: 1, background: "var(--border)", border: "1px solid var(--border)", marginBottom: 24 }}>
              {steps.map((s) => (
                <div key={s.num} style={{ flex: 1, background: "var(--bg)", padding: "20px", textAlign: "center" }}>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 700, color: "var(--accent)", marginBottom: 4 }}>{s.num}</div>
                  <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>{s.label}</div>
                  <div style={{ fontSize: 10, color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
                    {s.fields.join(" · ")}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="section">
            <div className="section-header">
              <div className="label">// step 1</div>
              <div>
                <h2 className="display-md">Module Details</h2>
              </div>
            </div>
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "24px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: 16 }}>
                <div>
                  <div className="label-sm" style={{ marginBottom: 6 }}>Module Title</div>
                  <input type="text" placeholder="e.g. Autonomous Agents" style={inputStyle} />
                </div>
                <div>
                  <div className="label-sm" style={{ marginBottom: 6 }}>Difficulty</div>
                  <select style={inputStyle} defaultValue="">
                    <option value="" disabled>Select</option>
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                  </select>
                </div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <div className="label-sm" style={{ marginBottom: 6 }}>Description</div>
                <textarea rows={3} placeholder="Module overview and learning objectives..." style={{ ...inputStyle, resize: "vertical" }} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <div className="label-sm" style={{ marginBottom: 6 }}>Lessons</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {["Agent Frameworks Overview", "ElizaOS Setup", "On-Chain Automation", "Fleet Orchestration"].map((l, i) => (
                    <div key={i} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <input type="text" value={l} style={{ ...inputStyle, flex: 1 }} readOnly />
                      <button className="btn-connect" style={{ fontSize: 9, padding: "4px 10px", background: "transparent", color: "var(--muted)", borderColor: "var(--border)" }}>Edit</button>
                      <button className="btn-connect" style={{ fontSize: 9, padding: "4px 10px", background: "transparent", color: "#ff6b6b", borderColor: "#ff6b6b" }}>Del</button>
                    </div>
                  ))}
                  <button className="btn-connect" style={{ fontSize: 10, padding: "6px 14px", background: "transparent", color: "var(--accent)", borderColor: "var(--border-accent)", alignSelf: "flex-start" }}>+ Add Lesson</button>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
                <button className="btn-connect" style={{ background: "transparent", color: "var(--muted)", borderColor: "var(--border)" }}>Save Draft</button>
                <button className="btn-connect">Next: Assignments</button>
              </div>
            </div>
          </section>

          <section className="section">
            <div className="section-header">
              <div className="label">// modules</div>
              <div>
                <h2 className="display-md">Existing Modules</h2>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 1, background: "var(--border)", border: "1px solid var(--border)" }}>
              {[
                { id: "M1", title: "Blockchain Fundamentals", lessons: 8, status: "Published" },
                { id: "M2", title: "Smart Contracts 101", lessons: 10, status: "Published" },
                { id: "M3", title: "DeFi Architecture", lessons: 12, status: "Published" },
                { id: "M4", title: "Web3 Identity & Auth", lessons: 6, status: "Published" },
                { id: "M5", title: "Autonomous Agents", lessons: 10, status: "Draft" },
              ].map((m) => (
                <div key={m.id} style={{ background: "var(--bg)", padding: "14px 20px", display: "grid", gridTemplateColumns: "40px 1fr 60px 80px 120px", gap: 12, alignItems: "center" }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--accent)" }}>{m.id}</span>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{m.title}</span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--muted)" }}>{m.lessons} lessons</span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: m.status === "Published" ? "var(--accent)" : "#888" }}>{m.status}</span>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="btn-connect" style={{ fontSize: 9, padding: "4px 10px" }}>Edit</button>
                    <button className="btn-connect" style={{ fontSize: 9, padding: "4px 10px", background: "transparent", color: "var(--muted)", borderColor: "var(--border)" }}>Duplicate</button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      ) : (
        <section className="section">
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "60px 24px", textAlign: "center", color: "var(--muted)", fontSize: 13 }}>
            Sign in with your wallet to access the course builder.
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
