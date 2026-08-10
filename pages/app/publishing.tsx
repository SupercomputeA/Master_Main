import { useEffect, useState } from "react"
import Link from "next/link"
import MemberLayout from "../../components/MemberLayout"

/* Member — My Articles (real data from /api/articles; mock removed 2026-08-10) */

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

function fmtWhen(iso: string | null | undefined): string {
  if (!iso) return "draft"
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  const now = Date.now()
  const diff = now - d.getTime()
  const days = Math.floor(diff / 86400000)
  if (days <= 0) return "today"
  if (days === 1) return "yesterday"
  if (days < 30) return `${days} days ago`
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

export default function MemberPublishing() {
  const [articles, setArticles] = useState<Article[] | null>(null)

  useEffect(() => {
    fetch(`${API_BASE}/api/articles`)
      .then((r) => r.json())
      .then((d: any) => setArticles(Array.isArray(d.articles) ? d.articles : []))
      .catch(() => setArticles([]))
  }, [])

  return (
    <MemberLayout
      title="SUPERCOMPUTE · My Articles"
      banner={{ icon: "📝", title: "Create & Publish", sub: "Write articles, upload media, and share insights with the Supercompute community across multiple platforms." }}
    >
      <div className="page-header">
        <div className="header-left">
          <div className="header-label">Member Dashboard</div>
          <h1 className="page-title">My Articles</h1>
        </div>
        <Link href="/app/publishing/new" className="mem-btn" style={{ textDecoration: "none" }}>+ New Article</Link>
      </div>

      <div className="articles-list">
        {articles === null && (
          <div className="article-item" style={{ padding: 24 }}>
            <div className="article-title">Loading articles…</div>
          </div>
        )}
        {articles !== null && articles.length === 0 && (
          <div className="article-item" style={{ padding: 24 }}>
            <div className="article-title">No articles yet.</div>
            <div className="article-excerpt">Write your first piece — + New Article.</div>
          </div>
        )}
        {articles?.map((a) => {
          const slug = a.slug || a.title || "untitled"
          const draft = (a.status || "").toLowerCase() === "draft" || !a.published_at
          return (
            <div key={a.id} className="article-item" style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <Link href={`/app/publishing/${a.id}/edit`} style={{ textDecoration: "none", color: "inherit", flex: 1, display: "flex", gap: 16, alignItems: "center" }}>
                <div className="article-thumbnail">📝</div>
                <div className="article-content">
                  <div className="article-title">{a.title || slug}</div>
                  <div className="article-excerpt">{a.excerpt || "No excerpt yet."}</div>
                  <div className="article-meta">
                    <span>{a.author || "Quanta Sovereigna"}</span>
                    <span>{fmtWhen(a.published_at)}</span>
                    {draft ? (
                      <span className="article-status">Draft</span>
                    ) : (
                      <span style={{ color: "#4ADE80" }}>Published</span>
                    )}
                  </div>
                </div>
              </Link>
              <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                <Link href={`/app/article/regular/${encodeURIComponent(slug)}`} className="mem-btn" style={{ textDecoration: "none", fontSize: 12 }}>Regular</Link>
                <Link href={`/app/article/kg/${encodeURIComponent(slug)}`} className="mem-btn" style={{ textDecoration: "none", fontSize: 12 }}>KG</Link>
              </div>
            </div>
          )
        })}
      </div>
    </MemberLayout>
  )
}
