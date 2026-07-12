import Head from "next/head"
import { useEffect, useMemo, useState } from "react"
import type { GetStaticPaths, GetStaticProps } from "next"
import { marked } from "marked"
import PublicLayout from "../../components/PublicLayout"
import Footer from "../../components/Footer"
import KnowledgeGraph from "../../components/KnowledgeGraph"
import fs from "fs"
import path from "path"

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

function parseFrontmatter(raw: string): { fm: Record<string, string>; body: string } {
  const parts = raw.split("---", 2)
  if (parts.length < 2) return { fm: {}, body: raw }
  const fmText = parts[1]
  const body = raw.split("---", 2)[2]?.trim() || ""
  const fm: Record<string, string> = {}
  for (const line of fmText.trim().split("\n")) {
    const m = line.match(/^(\w+):\s*["']?(.+?)["']?\s*$/)
    if (m) fm[m[1]] = m[2]
  }
  return { fm, body }
}

// Pre-render all article slugs from content/posts/*.md at build time.
// Each slug gets its own static HTML file with full article content —
// SEO crawlers and social card previews see the real article immediately.
// Client-side fetch from /api/articles supplements with D1-edited content.
export const getStaticPaths: GetStaticPaths = async () => {
  const postsDir = path.join(process.cwd(), "content", "posts")
  const paths: Array<{ params: { slug: string } }> = []

  try {
    const files = fs.readdirSync(postsDir).filter((f) => f.endsWith(".md"))
    for (const file of files) {
      const raw = fs.readFileSync(path.join(postsDir, file), "utf-8")
      const { fm } = parseFrontmatter(raw)
      const slug = fm.slug || file.replace(".md", "")
      paths.push({ params: { slug } })
    }
  } catch {
    // content/posts may not exist in some build contexts
  }

  // Also include the placeholder for runtime-only D1 articles
  paths.push({ params: { slug: "article" } })

  return { paths, fallback: false }
}

export const getStaticProps: GetStaticProps = async (ctx) => {
  const slug = ctx.params?.slug as string
  const postsDir = path.join(process.cwd(), "content", "posts")
  let staticArticle: Partial<Article> | null = null

  try {
    const files = fs.readdirSync(postsDir).filter((f) => f.endsWith(".md"))
    for (const file of files) {
      const raw = fs.readFileSync(path.join(postsDir, file), "utf-8")
      const { fm, body } = parseFrontmatter(raw)
      const fileSlug = fm.slug || file.replace(".md", "")
      if (fileSlug === slug) {
        staticArticle = {
          id: `md_${slug}`,
          slug: fileSlug,
          title: fm.title || slug,
          excerpt: fm.excerpt || "",
          content: body,
          category: fm.category || "SIGNAL",
          author: fm.author || "Quanta S",
          published_at: fm.date || null,
          status: fm.status || "published",
          views: 0,
        }
        break
      }
    }
  } catch {
    // content/posts may not exist
  }

  return { props: { staticArticle, slug } }
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return ""
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

function renderMarkdown(md: string | null | undefined): string {
  if (!md) return ""
  return marked.parse(md, { async: false }) as string
}

export default function ArticleDetail({ staticArticle, slug: staticSlug }: { staticArticle: Partial<Article> | null; slug: string }) {
  const [article, setArticle] = useState<Article | null | undefined>(
    staticArticle ? (staticArticle as Article) : undefined
  )
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // If we have static content, try to fetch the D1 version (may be newer)
    // If we don't (placeholder slug), resolve the real slug from URL and fetch
    const path = typeof window !== "undefined" ? window.location.pathname : ""
    const match = path.match(/^\/newsdesk\/([^/?#]+)\/?$/)
    const realSlug = match ? decodeURIComponent(match[1]) : staticSlug

    if (!realSlug || realSlug === "article") {
      if (!staticArticle) setArticle(null)
      return
    }

    let cancelled = false
    fetch(`${API_BASE}/api/articles?include=content&slug=${encodeURIComponent(realSlug)}`)
      .then((r) => r.json())
      .then((d: any) => {
        if (cancelled) return
        const list = d.articles || []
        if (list.length > 0) {
          setArticle(list[0] as Article)
        } else if (!staticArticle) {
          setArticle(null)
        }
        // If D1 has no article but we have static content, keep showing static
      })
      .catch((e) => {
        if (cancelled) return
        setError(String(e))
        if (!staticArticle) setArticle(null)
      })

    return () => {
      cancelled = true
    }
  }, [staticArticle, staticSlug])

  const htmlBody = useMemo(() => renderMarkdown(article?.content), [article?.content])

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
            {error ? `// error: ${error}` : `// article not found`}
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
