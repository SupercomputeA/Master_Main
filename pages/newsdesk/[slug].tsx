import Head from "next/head"
import { useEffect, useMemo, useState } from "react"
import type { GetStaticPaths, GetStaticProps } from "next"
import { marked } from "marked"
import Layout from "../../components/Layout"
import Footer from "../../components/Footer"

interface Article {
  id: string
  slug: string | null
  title: string
  excerpt: string | null
  content: string | null
  category: string | null
  author: string | null
  published_at: string | null
  status: string | null
  views: number | null
}

const API_BASE = ""

// Build a single static placeholder so the [slug] route has a generated HTML file.
// Cloudflare Pages redirects /newsdesk/* → /newsdesk/article.html so any slug
// serves the same HTML; the React app then resolves the actual slug at runtime
// from useRouter().query.slug and fetches /api/articles?include=content&slug=<slug>.
//
// We deliberately use a non-bracket name for the placeholder because Cloudflare's
// _redirects interprets `[slug]` as a wildcard substitution token, not a literal
// filename.
export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [{ params: { slug: "article" } }],
    fallback: false,
  }
}

// Stub getStaticProps required by Next.js when getStaticPaths is present.
// All article data is fetched at runtime via /api/articles — this is purely
// here to satisfy the static-export build, no Tina dependency remains.
export const getStaticProps: GetStaticProps = async () => {
  return { props: {} }
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return ""
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

function renderMarkdown(md: string | null | undefined): string {
  if (!md) return ""
  // marked.parse is sync by default; cast as string to satisfy the overloaded return.
  return marked.parse(md, { async: false }) as string
}

export default function ArticleDetail() {
  const [slugParam, setSlugParam] = useState<string>("")

  const [article, setArticle] = useState<Article | null | undefined>(undefined) // undefined = loading
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Read the actual slug from the browser URL. We deliberately avoid
    // useRouter().query.slug here: with output: "export" and a single
    // placeholder path, the static HTML is built for the placeholder slug
    // and useRouter() returns that build-time value at hydration. The URL
    // bar always shows the user-requested path, so window.location is
    // the source of truth.
    const path = typeof window !== "undefined" ? window.location.pathname : ""
    const match = path.match(/^\/newsdesk\/([^/?#]+)\/?$/)
    const slug = match ? decodeURIComponent(match[1]) : ""
    setSlugParam(slug)

    if (!slug) {
      setArticle(null)
      return
    }

    let cancelled = false
    setArticle(undefined)
    setError(null)

    const apiUrl = `${API_BASE}/api/articles?include=content&slug=${encodeURIComponent(slug)}`
    fetch(apiUrl)
      .then((r) => r.json())
      .then((d: any) => {
        if (cancelled) return
        const list = d.articles || []
        if (list.length > 0) {
          setArticle(list[0] as Article)
        } else {
          setArticle(null)
        }
      })
      .catch((e) => {
        if (cancelled) return
        setError(String(e))
        setArticle(null)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const htmlBody = useMemo(() => renderMarkdown(article?.content), [article?.content])

  if (article === undefined) {
    return (
      <Layout title="SUPERCOMPUTE · Article">
        <section className="section">
          <div style={{ padding: "60px 24px", textAlign: "center", color: "var(--muted)", fontFamily: "var(--font-mono)", fontSize: 12 }}>
            // loading article…
          </div>
        </section>
      </Layout>
    )
  }

  if (!article) {
    return (
      <Layout title="SUPERCOMPUTE · Article">
        <section className="section">
          <div style={{ padding: "60px 24px", textAlign: "center", color: "var(--muted)", fontFamily: "var(--font-mono)", fontSize: 12 }}>
            {error ? `// error: ${error}` : `// article not found: ${slugParam}`}
          </div>
        </section>
      </Layout>
    )
  }

  return (
    <>
      <Head>
        <title>{article.title} — SUPERCOMPUTE Publishing</title>
        <meta name="description" content={article.excerpt || ""} />
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={article.excerpt || ""} />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>

      <Layout title={article.title}>
        <section className="hero" id="article-detail">
          <div className="hero-kicker">
            <div className="status-dot" />
            <span className="label">// {article.category || "—"}</span>
          </div>
          <h1 className="display-xl hero-title" style={{ fontSize: "clamp(28px, 5vw, 48px)" }}>{article.title}</h1>
          <div className="hero-meta" style={{ marginTop: 16 }}>
            <div className="meta-item"><div className="label-sm">// Author</div><div className="val" style={{ color: "var(--accent)" }}>{article.author || "anonymous"}</div></div>
            <div className="meta-item"><div className="label-sm">// Published</div><div className="val">{formatDate(article.published_at)}</div></div>
            <div className="meta-item"><div className="label-sm">// Category</div><div className="val" style={{ color: article.category === "PROTOCOL_EVAL" ? "var(--teal)" : "var(--accent)" }}>{article.category || "—"}</div></div>
          </div>
        </section>

        <section className="section">
          <div className="section-header">
            <div className="label">// article</div>
            <div><h2 className="display-md">{article.title}</h2></div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 1, background: "var(--border)", border: "1px solid var(--border)" }}>
            <div style={{ background: "var(--bg)", padding: "32px 28px" }}>
              {htmlBody ? (
                <article
                  className="article-body"
                  style={{ fontSize: 13, color: "var(--fg)", lineHeight: 1.8 }}
                  dangerouslySetInnerHTML={{ __html: htmlBody }}
                />
              ) : (
                <div style={{ padding: "40px 24px", textAlign: "center", color: "var(--muted)", fontSize: 12 }}>No content.</div>
              )}
            </div>

            <div style={{ background: "var(--bg)", padding: "24px 20px", borderLeft: "1px solid var(--border)" }}>
              <div className="label-sm" style={{ marginBottom: 12 }}>// Details</div>
              <div style={{ fontSize: 11, color: "var(--muted)", lineHeight: 2 }}>
                <div><strong style={{ color: "var(--accent)" }}>Status:</strong> {article.status || "published"}</div>
                <div><strong style={{ color: "var(--accent)" }}>Author:</strong> {article.author || "anonymous"}</div>
                <div><strong style={{ color: "var(--accent)" }}>Date:</strong> {formatDate(article.published_at)}</div>
                <div><strong style={{ color: "var(--accent)" }}>Views:</strong> {article.views ?? 0}</div>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </Layout>
    </>
  )
}
