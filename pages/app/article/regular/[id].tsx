import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/router"
import MemberLayout from "../../../../components/MemberLayout"

/* Regular Article Template — reads a published article by slug and renders
   the standard Terminal Dossier reading surface. Static-export friendly. */

interface Article {
  id: string
  title: string
  slug: string | null
  excerpt: string | null
  category: string | null
  author: string | null
  content?: string
  published_at: string | null
}

const API_BASE = ""

function fmtDate(iso: string | null | undefined): string {
  if (!iso) return "—"
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
}

function markdownish(text: string): string {
  // Minimal renderer for our markdown-ish drafts: headings, bold, lists, links, paragraphs.
  let html = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
  html = html.replace(/^### (.*)$/gm, "<h3>$1</h3>")
  html = html.replace(/^## (.*)$/gm, "<h2>$1</h2>")
  html = html.replace(/^# (.*)$/gm, "<h1>$1</h1>")
  html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
  html = html.replace(/^[-*] (.*)$/gm, "<li>$1</li>")
  html = html.replace(/(<li>.*<\/li>)/s, "<ul>$1</ul>")
  html = html.replace(/\n{2,}/g, "</p><p>")
  html = html.replace(/\n/g, "<br/>")
  return `<p>${html}</p>`
}

export default function RegularArticle() {
  const router = useRouter()
  const slug = typeof router.query.id === "string" ? router.query.id : ""
  const [article, setArticle] = useState<Article | null>(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!slug) return
    fetch(`${API_BASE}/api/articles?slug=${encodeURIComponent(slug)}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((d: any) => {
        const list: Article[] = d.articles || []
        if (list.length === 0) { setNotFound(true); return }
        setArticle(list[0])
      })
      .catch(() => setNotFound(true))
  }, [slug])

  return (
    <MemberLayout title={`SUPERCOMPUTE · ${article?.title || "Article"}`}>
      <div className="tpl-article">
        {notFound ? (
          <div className="term-card" style={{ padding: 24 }}>
            <div className="section-head">Article not found</div>
            <p>The requested article isn't available.</p>
            <Link href="/newsdesk" style={{ color: "#C9A33A", textDecoration: "none" }}>← Back to NewsDesk</Link>
          </div>
        ) : !article ? (
          <div className="term-card" style={{ padding: 24 }}>
            <div className="section-head">Loading article…</div>
          </div>
        ) : (
          <>
            <div className="masthead">
              <div className="eyebrow">{article.category || "Article"} · NewsDesk</div>
              <h1 className="article-title">{article.title}</h1>
              <div className="article-meta">
                <span>By <span className="m-val">{article.author || "Quanta Sovereigna"}</span></span>
                <span>Published <span className="m-val">{fmtDate(article.published_at)}</span></span>
              </div>
              {article.excerpt && <p className="article-deck">{article.excerpt}</p>}
            </div>

            {article.content ? (
              <div className="article-body" dangerouslySetInnerHTML={{ __html: markdownish(article.content) }} />
            ) : (
              <div className="article-body">
                <p>{article.excerpt || "Full text coming soon."}</p>
              </div>
            )}
          </>
        )}
      </div>
    </MemberLayout>
  )
}
