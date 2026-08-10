import fs from "fs"
import path from "path"
import { useEffect, useMemo, useState } from "react"
import MemberLayout from "../../components/MemberLayout"

/* Admin — Content Moderation
 * Real data: static posts from content/posts/*.md (build time) merged with
 * D1 articles from /api/articles (client). Mock removed 2026-08-10.
 */

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

// Parse simple YAML frontmatter from markdown files
function parseFrontmatter(raw: string): { fm: Record<string, any>; body: string } {
  const fm: Record<string, any> = {}
  let body = raw
  const m = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n?/)
  if (m) {
    const block = m[1]
    for (const line of block.split("\n")) {
      const idx = line.indexOf(":")
      if (idx > 0) {
        const k = line.slice(0, idx).trim()
        let v = line.slice(idx + 1).trim()
        v = v.replace(/^["']|["']$/g, "")
        if (k) fm[k] = v
      }
    }
    body = raw.slice(m[0].length)
  }
  return { fm, body }
}

export async function getStaticProps() {
  const postsDir = path.join(process.cwd(), "content", "posts")
  const staticArticles: Article[] = []

  try {
    const files = fs.readdirSync(postsDir).filter((f) => f.endsWith(".md"))
    for (const file of files) {
      const raw = fs.readFileSync(path.join(postsDir, file), "utf-8")
      const { fm } = parseFrontmatter(raw)
      staticArticles.push({
        id: `md_${file.replace(".md", "")}`,
        slug: fm.slug || file.replace(".md", ""),
        title: fm.title || file.replace(".md", ""),
        excerpt: fm.excerpt || "",
        author: fm.author || "Quanta S",
        category: fm.category || "SIGNAL",
        published_at: fm.date || null,
        status: fm.status || "published",
      })
    }
  } catch {
    // content/posts may not exist in some build contexts
  }

  staticArticles.sort((a, b) => {
    const da = a.published_at ? new Date(a.published_at).getTime() : 0
    const db = b.published_at ? new Date(b.published_at).getTime() : 0
    return db - da
  })

  return { props: { staticArticles } }
}

interface ModItem {
  key: string
  thumb: string
  title: string
  status: string
  by: string
  when: string
  desc: string
  flags?: string
  actions: { label: string; kind?: "approve" | "reject" }[]
}

function fmtDate(iso: string | null | undefined): string {
  if (!iso) return "—"
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

function statusBadge(status: string | null): string {
  const s = (status || "published").toLowerCase()
  if (s === "draft" || s === "review" || s === "pending") return "Pending Review"
  if (s === "flagged") return "Flagged"
  return "Published"
}

function actionSet(status: string | null): { label: string; kind?: "approve" | "reject" }[] {
  const s = (status || "published").toLowerCase()
  if (s === "draft" || s === "review" || s === "pending") {
    return [
      { label: "Approve", kind: "approve" },
      { label: "Reject", kind: "reject" },
      { label: "Request Changes" },
    ]
  }
  if (s === "flagged") {
    return [{ label: "Review Flags" }, { label: "Hide" }, { label: "Remove", kind: "reject" }]
  }
  return [{ label: "Edit" }, { label: "Unpublish", kind: "reject" }]
}

function toItems(articles: Article[]): ModItem[] {
  return articles.map((a, i) => ({
    key: a.id || `${i}`,
    thumb: a.category === "TECHNOLOGY" ? "🔧" : a.category === "EDUCATION" ? "🎓" : a.category === "COMMUNITY" ? "💬" : "📝",
    title: a.title || a.slug || "Untitled",
    status: statusBadge(a.status),
    by: `By ${a.author || "Quanta Sovereigna"}`,
    when: a.published_at ? `Published ${fmtDate(a.published_at)}` : "Not yet published",
    desc: a.excerpt || "",
    actions: actionSet(a.status),
  }))
}

export default function AdminContent({ staticArticles }: { staticArticles: Article[] }) {
  const [dynamicArticles, setDynamicArticles] = useState<Article[] | null>(null)

  useEffect(() => {
    fetch(`${API_BASE}/api/articles`)
      .then((r) => r.json())
      .then((d: any) => setDynamicArticles(Array.isArray(d.articles) ? d.articles : []))
      .catch(() => setDynamicArticles([]))
  }, [])

  const items: ModItem[] = useMemo(() => {
    if (dynamicArticles === null) return toItems(staticArticles)
    const d1Slugs = new Set(dynamicArticles.map((a) => a.slug))
    const merged = [...dynamicArticles, ...staticArticles.filter((a) => !d1Slugs.has(a.slug))]
    return toItems(merged)
  }, [staticArticles, dynamicArticles])

  return (
    <MemberLayout title="SUPERCOMPUTE · Content Moderation" variant="admin" wide>
      <div className="tpl-admin">
        <div className="header">
          <div>
            <div className="label">Administration</div>
            <h1>Content Moderation</h1>
          </div>
          <div className="content-count">{items.length} items</div>
        </div>

        <div className="content-list">
          {items.length === 0 && (
            <div className="content-item term-card">
              <div className="content-main">
                <div className="content-desc">No articles yet.</div>
              </div>
            </div>
          )}
          {items.map((item) => (
            <div key={item.key} className="content-item term-card">
              <div className="content-thumbnail">{item.thumb}</div>
              <div className="content-main">
                <div className="content-header">
                  <div className="content-title">{item.title}</div>
                  <div className="content-status">{item.status}</div>
                </div>
                <div className="content-meta">
                  <span>{item.by}</span>
                  <span>{item.when}</span>
                </div>
                <div className="content-desc">{item.desc}</div>
                {item.flags && <div className="content-flags">{item.flags}</div>}
                <div className="content-actions">
                  {item.actions.map((a) => (
                    <button key={a.label} className={`mod-btn${a.kind ? " " + a.kind : ""}`}>{a.label}</button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </MemberLayout>
  )
}
