import Head from "next/head"
import { useEffect, useMemo, useState } from "react"
import type { GetStaticPaths, GetStaticProps } from "next"
import { marked } from "marked"
import PublicLayout from "../../components/PublicLayout"
import Footer from "../../components/Footer"
import KnowledgeGraph from "../../components/KnowledgeGraph"

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

  // Build a per-article knowledge graph from the article's metadata. This is
  // a placeholder until Tina's `knowledgeGraph` field is wired into D1 (or
  // until the article detail endpoint serves the structured KG). The graph
  // is derived deterministically from category + author + status so the
  // article page always renders a meaningful visualization.
  const articleKg = useMemo(() => {
    if (!article) return { nodes: [], edges: [] }
    const cat = article.category || "GENERAL"
    const author = article.author || "anonymous"
    const nodes: Array<{ id: string; label: string; type: string }> = [
      { id: "article", label: article.title?.slice(0, 28) || "Article", type: "concept" },
      { id: `cat-${cat}`, label: cat, type: "term" },
      { id: `author-${author}`, label: author, type: "person" },
    ]
    if (article.published_at) {
      nodes.push({ id: "date", label: formatDate(article.published_at), type: "date" })
    }
    if (article.status) {
      nodes.push({ id: `status-${article.status}`, label: article.status, type: "event" })
    }
    const edges: Array<[string, string]> = [
      ["article", `cat-${cat}`],
      ["article", `author-${author}`],
    ]
    if (article.published_at) edges.push(["article", "date"])
    if (article.status) edges.push(["article", `status-${article.status}`])
    return { nodes, edges }
  }, [article])

  if (article === undefined) {
    return (
      <PublicLayout title="SUPERCOMPUTE · Article">
        <section className="section">
          <div style={{ padding: "60px 24px", textAlign: "center", color: "var(--muted)", fontFamily: "var(--font-mono)", fontSize: 12 }}>
            // loading article…
          </div>
        </section>
      </PublicLayout>
    )
  }

  if (!article) {
    return (
      <PublicLayout title="SUPERCOMPUTE · Article">
        <section className="section">
          <div style={{ padding: "60px 24px", textAlign: "center", color: "var(--muted)", fontFamily: "var(--font-mono)", fontSize: 12 }}>
            {error ? `// error: ${error}` : `// article not found: ${slugParam}`}
          </div>
        </section>
      </PublicLayout>
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

      <PublicLayout title={article.title}>
        <section className="hero" id="article-detail">
          <div className="hero-kicker">
            <div className="status-dot" />
            <span className="label">// {article.category || "—"}</span>
          </div>
          <h1 className="display-xl hero-title" style={{ fontSize: "clamp(28px, 5vw, 48px)" }}>{article.title}</h1>
          <div className="hero-meta" style={{ marginTop: 16 }}>
            <div className="meta-item"><div className="label-sm">// Author</div><div className="val" style={{ color: "var(--gold-warm)" }}>{article.author || "anonymous"}</div></div>
            <div className="meta-item"><div className="label-sm">// Published</div><div className="val">{formatDate(article.published_at)}</div></div>
            <div className="meta-item"><div className="label-sm">// Category</div><div className="val" style={{ color: article.category === "PROTOCOL_EVAL" ? "var(--teal)" : "var(--gold-warm)" }}>{article.category || "—"}</div></div>
          </div>
        </section>

        {/* Knowledge graph jumbotron (per Terminal Dossier article spec) */}
        <section className="section" style={{ paddingTop: 32 }}>
          <div className="section-header">
            <div className="label">// graph</div>
            <div><h2 className="display-md">Knowledge Graph</h2></div>
          </div>
          <div style={{ border: "1px solid var(--border-warm)", background: "var(--site-bg)", position: "relative" }}>
            <KnowledgeGraph
              data={articleKg}
              height={380}
              interactive={false}
            />
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--mono-blue)", marginTop: 12, letterSpacing: "0.05em" }}>
            // {articleKg.nodes.length} entities · {articleKg.edges.length} relationships — derived from article metadata
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
      </PublicLayout>
    </>
  )
}
