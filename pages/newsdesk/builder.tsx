import Layout from "../../components/Layout"
import Footer from "../../components/Footer"
import { useAuth } from "../../lib/auth"

const categories = ["INTELLIGENCE", "SOVEREIGNTY", "DISPATCH", "SIGNAL"]

export default function NewsDeskBuilder() {
  const { session } = useAuth()

  return (
    <Layout title="SUPERCOMPUTE · Article Builder">
      <section className="hero" id="newsdesk-builder">
        <div className="hero-kicker">
          <div className="status-dot"></div>
          <span className="label">// newsdesk · article</span>
        </div>
        <h1 className="display-xl hero-title">
          ARTICLE<br /><em>BUILDER</em>
        </h1>
        <p className="hero-sub">
          Write, edit, and publish NewsDesk articles with on-chain attestation.
        </p>
      </section>

      {session ? (
        <>
          <section className="section">
            <div className="section-header">
              <div className="label">// editor</div>
              <div>
                <h2 className="display-md">New Article</h2>
              </div>
            </div>
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "24px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: 16 }}>
                <div>
                  <div className="label-sm" style={{ marginBottom: 6 }}>Article Title</div>
                  <input type="text" placeholder="e.g. The Future of On-Chain Identity" style={inputStyle} />
                </div>
                <div>
                  <div className="label-sm" style={{ marginBottom: 6 }}>Slug</div>
                  <input type="text" placeholder="e.g. future-of-on-chain-identity" style={inputStyle} />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", marginBottom: 16 }}>
                <div>
                  <div className="label-sm" style={{ marginBottom: 6 }}>Category</div>
                  <select style={inputStyle} defaultValue="">
                    <option value="" disabled>Select category</option>
                    {categories.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <div className="label-sm" style={{ marginBottom: 6 }}>Author</div>
                  <input type="text" placeholder="Author name" style={inputStyle} />
                </div>
                <div>
                  <div className="label-sm" style={{ marginBottom: 6 }}>Status</div>
                  <select style={inputStyle} defaultValue="Draft">
                    <option>Draft</option>
                    <option>Review</option>
                    <option>Published</option>
                  </select>
                </div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <div className="label-sm" style={{ marginBottom: 6 }}>Excerpt</div>
                <input type="text" placeholder="Brief summary for the article card..." style={inputStyle} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <div className="label-sm" style={{ marginBottom: 6 }}>Body (Markdown)</div>
                <textarea rows={12} placeholder="Write your article content here..." style={{ ...inputStyle, fontFamily: "var(--font-mono)", fontSize: 11, resize: "vertical" }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="btn-connect" style={{ background: "transparent", color: "var(--muted)", borderColor: "var(--border)", fontSize: 10, padding: "6px 14px" }}>Preview</button>
                  <button className="btn-connect" style={{ background: "transparent", color: "var(--muted)", borderColor: "var(--border)", fontSize: 10, padding: "6px 14px" }}>Save Draft</button>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="btn-connect" style={{ background: "transparent", color: "var(--accent)", borderColor: "var(--border-accent)", fontSize: 10, padding: "6px 14px" }}>Submit for Review</button>
                  <button className="btn-connect" style={{ fontSize: 10, padding: "6px 14px" }}>Publish</button>
                </div>
              </div>
            </div>
          </section>

          <section className="section">
            <div className="section-header">
              <div className="label">// recent</div>
              <div>
                <h2 className="display-md">Recent Articles</h2>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 1, background: "var(--border)", border: "1px solid var(--border)" }}>
              {[
                { title: "Welcome to Supercompute", cat: "INTELLIGENCE", author: "Quanta Sovereigna", status: "Published", date: "May 19" },
                { title: "Token Gating Deep Dive", cat: "SIGNAL", author: "Hermes", status: "Published", date: "May 18" },
                { title: "NewsDesk is Live", cat: "DISPATCH", author: "NewsDesk Lead", status: "Published", date: "May 17" },
              ].map((a, i) => (
                <div key={i} style={{ background: "var(--bg)", padding: "14px 20px", display: "grid", gridTemplateColumns: "1fr 80px 100px 80px 120px", gap: 12, alignItems: "center" }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{a.title}</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--accent)" }}>{a.cat}</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--muted)" }}>{a.author}</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--accent)" }}>{a.status}</div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="btn-connect" style={{ fontSize: 9, padding: "4px 10px" }}>Edit</button>
                    <button className="btn-connect" style={{ fontSize: 9, padding: "4px 10px", background: "transparent", color: "var(--muted)", borderColor: "var(--border)" }}>View</button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      ) : (
        <section className="section">
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "60px 24px", textAlign: "center", color: "var(--muted)", fontSize: 13 }}>
            Sign in with your wallet to access the article builder.
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
