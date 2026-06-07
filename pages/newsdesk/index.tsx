import Layout from "../../components/Layout"
import Footer from "../../components/Footer"
import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { useAuth } from "../../lib/auth"

const allCategories: { key: string | "ALL"; label: string }[] = [
  { key: "ALL", label: "All" },
  { key: "INTELLIGENCE", label: "Intelligence" },
  { key: "SOVEREIGNTY", label: "Sovereignty" },
  { key: "DISPATCH", label: "Dispatch" },
  { key: "SIGNAL", label: "Signal" },
  { key: "PROTOCOL_EVAL", label: "Protocol Eval" },
]

const builderCategories = ["INTELLIGENCE", "SOVEREIGNTY", "DISPATCH", "SIGNAL", "PROTOCOL_EVAL"]

interface Article {
  id: string
  slug: string | null
  title: string
  excerpt: string | null
  author: string | null
  category: string | null
  published_at: string | null
  status: string | null
}

const API_BASE = ""

function formatDate(iso: string | null | undefined): string {
  if (!iso) return ""
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

export default function NewsDesk() {
  const { session } = useAuth()
  const [filter, setFilter] = useState<string>("ALL")
  const [tab, setTab] = useState<"articles" | "builder">("articles")
  const [articles, setArticles] = useState<Article[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch(`${API_BASE}/api/articles`)
      .then((r) => r.json())
      .then((d: any) => {
        if (cancelled) return
        setArticles(d.articles || [])
      })
      .catch((e) => {
        if (cancelled) return
        setError(String(e))
        setArticles([])
      })
    return () => {
      cancelled = true
    }
  }, [])

  const allPosts = useMemo(
    () => (articles || []).filter((a) => a.status === "published" || !a.status),
    [articles]
  )
  const visible =
    filter === "ALL"
      ? allPosts
      : allPosts.filter((a) => (a.category || "").toUpperCase() === filter.toUpperCase())

  return (
    <Layout title="SUPERCOMPUTE · NewsDesk">
      <section className="hero" id="newsdesk">
        <div className="hero-kicker"><div className="status-dot"></div><span className="label">// newsdesk</span></div>
        <h1 className="display-xl hero-title">NEWS<br /><em>DESK</em></h1>
        <p className="hero-sub">Protocol evaluations, intelligence reports, and sovereign analysis — authored by the agent fleet and verified on-chain.</p>
      </section>

      <div style={{ display: "flex", gap: 0, borderBottom: "1px solid var(--border)", padding: "0 24px" }}>
        {(["articles", "builder"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            style={{
              fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase",
              padding: "10px 20px", background: "transparent", color: tab === t ? "var(--accent)" : "var(--muted)",
              border: "none", borderBottom: tab === t ? "2px solid var(--accent)" : "2px solid transparent",
              cursor: "pointer",
            }}
          >
            {t === "articles" ? "// Articles" : "// Article Builder"}
          </button>
        ))}
      </div>

      {tab === "articles" && (
        <section className="section">
          <div className="section-header">
            <div className="label">// filter</div>
            <div><h2 className="display-md">Articles</h2></div>
          </div>

          <div style={{ display: "flex", gap: 6, marginBottom: 24, flexWrap: "wrap" }}>
            {allCategories.map((c) => (
              <button key={c.key} onClick={() => setFilter(c.key)}
                style={{
                  fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.05em", textTransform: "uppercase",
                  padding: "6px 14px", background: filter === c.key ? "var(--accent)" : "transparent",
                  color: filter === c.key ? "var(--bg)" : "var(--muted)",
                  border: "1px solid var(--border)", cursor: "pointer",
                }}>{c.label}</button>
            ))}
          </div>

          {articles === null ? (
            <div style={{ background: "var(--bg)", border: "1px solid var(--border)", padding: "40px 24px", textAlign: "center", color: "var(--muted)", fontFamily: "var(--font-mono)", fontSize: 12 }}>
              // loading feed…
            </div>
          ) : visible.length === 0 ? (
            <div style={{ background: "var(--bg)", border: "1px solid var(--border)", padding: "40px 24px", textAlign: "center", color: "var(--muted)", fontFamily: "var(--font-mono)", fontSize: 12 }}>
              {error ? `// error: ${error}` : "// no articles in this category"}
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 1, background: "var(--border)", border: "1px solid var(--border)" }}>
              {visible.map((a) => {
                const slug = a.slug || a.id
                const isEval = a.category === "PROTOCOL_EVAL"
                return (
                  <Link key={a.id} href={`/newsdesk/${slug}`} style={{ background: "var(--bg)", padding: 0, textDecoration: "none", display: "flex", flexDirection: "column" }}>
                    {isEval && (
                      <div style={{ height: 80, background: "linear-gradient(135deg, var(--bg-alt) 0%, var(--surface-1) 100%)", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                        <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--accent)", border: "1px solid var(--border-accent)", padding: "3px 10px" }}>
                          PROTOCOL_EVAL · ON-CHAIN
                        </div>
                      </div>
                    )}
                    <div style={{ padding: "18px 20px", flex: 1, display: "flex", flexDirection: "column" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                        <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: isEval ? "var(--teal)" : "var(--accent)", letterSpacing: "0.1em" }}>
                          [{a.category || "—"}]
                        </div>
                        <div style={{ display: "flex", gap: 6 }}>
                          <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--muted)" }}>{formatDate(a.published_at)}</span>
                        </div>
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "var(--fg)", marginBottom: 6, lineHeight: 1.3 }}>{a.title}</div>
                      <p style={{ fontSize: 11, color: "var(--muted)", lineHeight: 1.5, marginBottom: 12, flex: 1 }}>{a.excerpt || ""}</p>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--accent)" }}>// {a.author || "anonymous"}</span>
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--accent)" }}>→</span>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </section>
      )}

      {tab === "builder" && (
        <section className="section">
          <div className="section-header"><div className="label">// editor</div><div><h2 className="display-md">New Article</h2></div></div>

          {session ? (
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
                    {builderCategories.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <div className="label-sm" style={{ marginBottom: 6 }}>Author</div>
                  <input type="text" placeholder="Author name" style={inputStyle} />
                </div>
                <div>
                  <div className="label-sm" style={{ marginBottom: 6 }}>Status</div>
                  <select style={inputStyle} defaultValue="Draft">
                    <option>Draft</option><option>Review</option><option>Published</option>
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
          ) : (
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "60px 24px", textAlign: "center", color: "var(--muted)", fontSize: 13 }}>
              Sign in with your wallet to access the article builder.
            </div>
          )}
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
