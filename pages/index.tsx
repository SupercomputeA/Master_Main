import Link from "next/link"
import { useEffect, useState } from "react"
import Layout from "../components/Layout"
import Footer from "../components/Footer"

interface ArticlePreview {
  id: string
  slug: string | null
  title: string
  excerpt: string | null
  author: string | null
  published_at: string | null
  category: string | null
  status?: string | null
}

const API_BASE = ""

function formatDate(iso: string | null | undefined): string {
  if (!iso) return ""
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

export default function Home() {
  const [articles, setArticles] = useState<ArticlePreview[] | null>(null)
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

  return (
    <Layout title="SUPERCOMPUTE · Publishing">
      <section className="hero">
        <div className="hero-kicker">
          <div className="status-dot" />
          <span className="label">// publishing · agent-powered</span>
        </div>
        <h1 style={{
          fontFamily: "var(--font-logo)", fontSize: "clamp(48px, 10vw, 100px)",
          fontWeight: 400, lineHeight: 1, marginBottom: 8, color: "var(--accent)", letterSpacing: "0.02em",
        }}>
          SUPERCOMPUTE
        </h1>
        <p style={{
          fontFamily: "var(--font-logo)", fontSize: "clamp(28px, 5vw, 50px)",
          fontWeight: 400, lineHeight: 1, marginBottom: 24, color: "var(--muted)", letterSpacing: "0.02em",
        }}>
          publishing
        </p>
        <p className="hero-sub" style={{ maxWidth: 600, fontSize: 14 }}>
          Agent-powered news for the resistance. Write once, publish everywhere. Knowledge graphs that make complex stories navigable.
        </p>
        <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
          <Link href="/compose" style={{
            fontFamily: "var(--font-mono)", fontSize: 11, background: "var(--accent)",
            color: "var(--bg)", padding: "10px 24px", textDecoration: "none",
            textTransform: "uppercase", letterSpacing: "0.1em",
          }}>
            Compose
          </Link>
          <Link href="/newsdesk" style={{
            fontFamily: "var(--font-mono)", fontSize: 11, background: "transparent",
            color: "var(--muted)", padding: "10px 24px", textDecoration: "none",
            border: "1px solid var(--border)", textTransform: "uppercase", letterSpacing: "0.1em",
          }}>
            Browse Feed
          </Link>
        </div>
      </section>

      {/* Platform targets */}
      <section className="section">
        <div className="section-header">
          <div className="label">// one post, every platform</div>
          <div><h2 className="display-md">Write Once</h2></div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1, background: "var(--border)", border: "1px solid var(--border)" }}>
          {[
            { icon: "𝕏", name: "X / Twitter", detail: "280 chars · auto-thread · hashtags" },
            { icon: "⌐◨-◨", name: "Farcaster", detail: "1024 chars · frames · channels" },
            { icon: "🌿", name: "Lens Protocol", detail: "Full markdown · on-chain · collectible" },
            { icon: "✦", name: "Mirror", detail: "Long-form · on-chain · NFT entries" },
          ].map(p => (
            <div key={p.name} style={{ background: "var(--bg)", padding: "28px 20px", textAlign: "center" }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>{p.icon}</div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 16, color: "var(--accent)", marginBottom: 8 }}>{p.name}</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--muted)", lineHeight: 1.6 }}>{p.detail}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Latest articles — runtime fetched from D1 */}
      <section className="section">
        <div className="section-header">
          <div className="label">// latest</div>
          <div><h2 className="display-md">Feed</h2></div>
        </div>
        {articles === null ? (
          <div style={{ background: "var(--bg)", border: "1px solid var(--border)", padding: "40px 24px", textAlign: "center", color: "var(--muted)", fontFamily: "var(--font-mono)", fontSize: 12 }}>
            // loading feed…
          </div>
        ) : articles.length === 0 ? (
          <div style={{ background: "var(--bg)", border: "1px solid var(--border)", padding: "40px 24px", textAlign: "center", color: "var(--muted)", fontFamily: "var(--font-mono)", fontSize: 12 }}>
            {error ? `// error: ${error}` : "// no articles yet — start the press"}
          </div>
        ) : (
          <div style={{ display: "grid", gap: 1, background: "var(--border)", border: "1px solid var(--border)" }}>
            {articles.slice(0, 8).map(article => (
              <Link
                key={article.id}
                href={`/newsdesk/${article.slug || article.id}`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <div style={{
                  display: "grid", gridTemplateColumns: "1fr auto",
                  background: "var(--bg)", padding: "20px 24px",
                  cursor: "pointer",
                }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: article.category === "PROTOCOL_EVAL" ? "var(--teal)" : "var(--accent)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                        {article.category || "—"}
                      </span>
                    </div>
                    <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "var(--fg)", marginBottom: 6 }}>{article.title}</h3>
                    <p style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--muted)", lineHeight: 1.5 }}>
                      {article.excerpt || ""}
                    </p>
                  </div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--muted)", textAlign: "right", minWidth: 100 }}>
                    <div>{article.author || ""}</div>
                    <div style={{ marginTop: 4 }}>{formatDate(article.published_at)}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <Footer />
    </Layout>
  )
}
