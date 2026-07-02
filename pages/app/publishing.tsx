import Link from "next/link"
import MemberLayout from "../../components/MemberLayout"

/* Member — Publishing (port of MemberPublishing.dc.html) */

type Pub = { published: boolean }
const ARTICLES: {
  thumb: string; title: string; excerpt: string; date: string; views: string; status: "draft" | "published"
}[] = [
  { thumb: "📝", title: "Understanding Liquidity Pools", excerpt: "A deep dive into how automated market makers work, the mechanics of impermanent loss, and strategies for optimizing LP positions.", date: "3 days ago", views: "1,240 views", status: "draft" },
  { thumb: "💡", title: "DAO Governance Models", excerpt: "Exploring different governance structures, voting mechanisms, and treasury management approaches in decentralized organizations.", date: "1 week ago", views: "3,860 views", status: "published" },
  { thumb: "🔐", title: "Self-Custody Best Practices", excerpt: "Essential security principles for managing your own private keys and protecting digital assets from common vulnerabilities.", date: "2 weeks ago", views: "5,240 views", status: "published" },
]

export default function MemberPublishing() {
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
        {ARTICLES.map((a) => (
          <Link key={a.title} href="/app/publishing/new" className="article-item" style={{ textDecoration: "none", color: "inherit" }}>
            <div className="article-thumbnail">{a.thumb}</div>
            <div className="article-content">
              <div className="article-title">{a.title}</div>
              <div className="article-excerpt">{a.excerpt}</div>
              <div className="article-meta">
                <span>{a.date}</span>
                <span>{a.views}</span>
                {a.status === "draft" ? (
                  <span className="article-status">Draft</span>
                ) : (
                  <span style={{ color: "#4ADE80" }}>Published</span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </MemberLayout>
  )
}
