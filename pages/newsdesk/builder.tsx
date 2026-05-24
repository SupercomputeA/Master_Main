import Layout from "../../components/Layout"
import Footer from "../../components/Footer"
import { useAuth } from "../../lib/auth"

const categories = ["INTELLIGENCE", "SOVEREIGNTY", "DISPATCH", "SIGNAL", "PROTOCOL_EVAL"]

export default function NewsDeskBuilder() {
  const { session } = useAuth()

  return (
    <Layout title="SUPERCOMPUTE · Article Builder">
      <section className="hero" id="newsdesk-builder">
        <div className="hero-kicker"><div className="status-dot"></div><span className="label">// newsdesk · article</span></div>
        <h1 className="display-xl hero-title">ARTICLE<br /><em>BUILDER</em></h1>
        <p className="hero-sub">Write, edit, and publish NewsDesk articles with on-chain attestation.</p>
      </section>

      {session ? (
        <>
          <section className="section">
            <div className="section-header"><div className="label">// editor</div><div><h2 className="display-md">New Article</h2></div></div>
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "24px" }}>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                <div>
                  <div className="label-sm" style={{ marginBottom: 6 }}>Article Title</div>
                  <input type="text" placeholder="e.g. The Future of On-Chain Identity" style={inputStyle} />
                </div>
                <div>
                  <div className="label-sm" style={{ marginBottom: 6 }}>Slug</div>
                  <input type="text" placeholder="e.g. future-of-on-chain-identity" style={inputStyle} />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 16, marginBottom: 16 }}>
                <div>
                  <div className="label-sm" style={{ marginBottom: 6 }}>Category</div>
                  <select style={inputStyle} defaultValue="">
                    <option value="" disabled>Select</option>
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
                <div>
                  <div className="label-sm" style={{ marginBottom: 6 }}>Access</div>
                  <select style={inputStyle} defaultValue="public">
                    <option value="public">Public</option>
                    <option value="subscriber">Subscriber Only</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <div className="label-sm" style={{ marginBottom: 6 }}>Excerpt</div>
                <input type="text" placeholder="Brief summary for the article card..." style={inputStyle} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <div className="label-sm" style={{ marginBottom: 6 }}>Body (Markdown)</div>
                <textarea rows={10} placeholder="Write your article content here..." style={{ ...inputStyle, fontFamily: "var(--font-mono)", fontSize: 11, resize: "vertical" }} />
              </div>

              <div style={{ marginTop: 24, marginBottom: 16 }}>
                <div className="label-sm" style={{ marginBottom: 10, color: "var(--accent)" }}>// SEO Metadata</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 12 }}>
                  <div>
                    <div className="label-sm" style={{ marginBottom: 6 }}>SEO Title</div>
                    <input type="text" placeholder="Search engine title..." style={inputStyle} />
                  </div>
                  <div>
                    <div className="label-sm" style={{ marginBottom: 6 }}>OG Image Path</div>
                    <input type="text" placeholder="/og-article.png" style={inputStyle} />
                  </div>
                </div>
                <div style={{ marginBottom: 12 }}>
                  <div className="label-sm" style={{ marginBottom: 6 }}>Meta Description</div>
                  <input type="text" placeholder="150-160 character description for search results..." style={inputStyle} />
                </div>
                <div>
                  <div className="label-sm" style={{ marginBottom: 6 }}>Keywords (comma-separated)</div>
                  <input type="text" placeholder="DeFi, Base, yield, protocol evaluation" style={inputStyle} />
                </div>
              </div>

              <div style={{ marginTop: 24, marginBottom: 16 }}>
                <div className="label-sm" style={{ marginBottom: 10, color: "var(--accent)" }}>// Knowledge Graph</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div style={{ background: "var(--bg)", border: "1px solid var(--border)", padding: 16 }}>
                    <div className="label-sm" style={{ marginBottom: 8 }}>Nodes</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <input type="text" placeholder="Node ID: supercompute" style={inputStyle} />
                      <input type="text" placeholder="Label: Supercompute" style={inputStyle} />
                      <select style={inputStyle} defaultValue="concept">
                        <option value="protocol">Protocol</option>
                        <option value="token">Token</option>
                        <option value="agent">Agent</option>
                        <option value="concept">Concept</option>
                        <option value="person">Person</option>
                      </select>
                      <button style={addBtnStyle}>+ Add Node</button>
                    </div>
                  </div>
                  <div style={{ background: "var(--bg)", border: "1px solid var(--border)", padding: 16 }}>
                    <div className="label-sm" style={{ marginBottom: 8 }}>Edges</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <input type="text" placeholder="From ID" style={inputStyle} />
                      <input type="text" placeholder="To ID" style={inputStyle} />
                      <input type="text" placeholder="Label: built on" style={inputStyle} />
                      <button style={addBtnStyle}>+ Add Edge</button>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 24, marginBottom: 16 }}>
                <div className="label-sm" style={{ marginBottom: 10, color: "var(--accent)" }}>// Protocol Evaluation (only for PROTOCOL_EVAL category)</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
                  <div>
                    <div className="label-sm" style={{ marginBottom: 6 }}>Protocol Name</div>
                    <input type="text" placeholder="e.g. Aave V3" style={inputStyle} />
                  </div>
                  <div>
                    <div className="label-sm" style={{ marginBottom: 6 }}>Chain</div>
                    <input type="text" placeholder="Base" style={inputStyle} />
                  </div>
                  <div>
                    <div className="label-sm" style={{ marginBottom: 6 }}>TVL</div>
                    <input type="text" placeholder="$1.2B" style={inputStyle} />
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
                  <div>
                    <div className="label-sm" style={{ marginBottom: 6 }}>Risk Score</div>
                    <select style={inputStyle} defaultValue="">
                      <option value="" disabled>Select</option>
                      <option>Low</option>
                      <option>Medium</option>
                      <option>High</option>
                      <option>Critical</option>
                    </select>
                  </div>
                  <div>
                    <div className="label-sm" style={{ marginBottom: 6 }}>Recommendation</div>
                    <select style={inputStyle} defaultValue="">
                      <option value="" disabled>Select</option>
                      <option>Invest</option>
                      <option>Monitor</option>
                      <option>Caution</option>
                      <option>Avoid</option>
                    </select>
                  </div>
                  <div>
                    <div className="label-sm" style={{ marginBottom: 6 }}>Category</div>
                    <input type="text" placeholder="Lending, DEX, etc." style={inputStyle} />
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <div className="label-sm" style={{ marginBottom: 6 }}>Audited By</div>
                    <input type="text" placeholder="Trail of Bits, Certora" style={inputStyle} />
                  </div>
                  <div>
                    <div className="label-sm" style={{ marginBottom: 6 }}>Launch Date</div>
                    <input type="text" placeholder="August 2024" style={inputStyle} />
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 24, borderTop: "1px solid var(--border)", paddingTop: 20 }}>
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
            <div className="section-header"><div className="label">// recent</div><div><h2 className="display-md">Recent Articles</h2></div></div>
            <div style={{ display: "flex", flexDirection: "column", gap: 1, background: "var(--border)", border: "1px solid var(--border)" }}>
              {[
                { title: "Protocol Evaluation: Aave V3 on Base", cat: "PROTOCOL_EVAL", author: "KNIGHT", status: "Published", date: "May 20" },
                { title: "Welcome to Supercompute", cat: "INTELLIGENCE", author: "Quanta Sovereigna", status: "Published", date: "May 19" },
                { title: "Token Gating Deep Dive", cat: "SIGNAL", author: "Hermes", status: "Published", date: "May 18" },
              ].map((a, i) => (
                <div key={i} style={{ background: "var(--bg)", padding: "14px 20px", display: "grid", gridTemplateColumns: "1fr 90px 100px 80px 120px", gap: 12, alignItems: "center" }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{a.title}</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: a.cat === "PROTOCOL_EVAL" ? "var(--teal)" : "var(--accent)" }}>{a.cat}</div>
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
  fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--fg)", background: "var(--bg)",
  border: "1px solid var(--border)", padding: "8px 12px", width: "100%", outline: "none",
}

const addBtnStyle: React.CSSProperties = {
  fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--accent)", background: "transparent",
  border: "1px solid var(--border-accent)", padding: "6px 12px", cursor: "pointer",
}
