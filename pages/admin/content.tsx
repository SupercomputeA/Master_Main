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
  id: string | null          // D1 article id (null for static md_ posts — not API-managed)
  thumb: string
  title: string
  status: string
  by: string
  when: string
  desc: string
  flags?: string
  actions: { label: string; kind?: "approve" | "reject"; op?: "publish" | "review" | "delete" | "unpublish" | "flag" }[]
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

function actionSet(status: string | null): { label: string; kind?: "approve" | "reject"; op?: "publish" | "review" | "delete" | "unpublish" | "flag" }[] {
  const s = (status || "published").toLowerCase()
  if (s === "draft" || s === "review" || s === "pending") {
    return [
      { label: "Approve", kind: "approve", op: "publish" },
      { label: "Reject", kind: "reject", op: "delete" },
      { label: "Request Changes", op: "review" },
    ]
  }
  if (s === "flagged") {
    return [{ label: "Review Flags", op: "flag" }, { label: "Hide", op: "review" }, { label: "Remove", kind: "reject", op: "delete" }]
  }
  return [{ label: "Unpublish", kind: "reject", op: "unpublish" }]
}

function toItems(articles: Article[]): ModItem[] {
  return articles.map((a, i) => ({
    key: a.id || `${i}`,
    id: a.id && !String(a.id).startsWith("md_") ? a.id : null,
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
  const [busy, setBusy] = useState<string | null>(null)
  const [flash, setFlash] = useState<string | null>(null)

  async function refresh() {
    const session = typeof window !== "undefined" ? localStorage.getItem("session") : null
    const headers: Record<string, string> = {}
    if (session) headers.Authorization = `Bearer ${session}`
    fetch(`${API_BASE}/api/articles?status=all`, { headers })
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((d: any) => setDynamicArticles(Array.isArray(d.articles) ? d.articles : []))
      .catch(() => setDynamicArticles([]))
  }

  useEffect(() => { refresh() }, [])

  // Moderation ops: Approve → publish, Request Changes → review, Unpublish → draft,
  // Reject/Remove → delete. All admin-gated server-side; session sent as Bearer.
  async function act(item: ModItem, op: string) {
    if (!item.id) return
    setBusy(item.id)
    setFlash(null)
    const session = typeof window !== "undefined" ? localStorage.getItem("session") : null
    if (!session) { setFlash("// connect wallet + sign in to moderate"); setBusy(null); return }
    try {
      let ok = false
      if (op === "delete") {
        const r = await fetch(`${API_BASE}/api/articles/${item.id}`, { method: "DELETE", headers: { Authorization: `Bearer ${session}` } })
        ok = r.ok
        if (ok) setFlash(`// removed "${item.title}"`)
      } else {
        const body: Record<string, unknown> = {}
        if (op === "publish") { body.status = "published"; body.published_at = Math.floor(Date.now() / 1000) }
        if (op === "review") body.status = "review"
        if (op === "unpublish") body.status = "draft"
        const r = await fetch(`${API_BASE}/api/articles/${item.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${session}` },
          body: JSON.stringify(body),
        })
        ok = r.ok
        if (ok) setFlash(`// ${op === "publish" ? "published" : op === "review" ? "changes requested" : "unpublished"}: "${item.title}"`)
      }
      if (ok) refresh()
      else setFlash(`// action failed (${op})`)
    } catch {
      setFlash(`// action failed (${op})`)
    } finally {
      setBusy(null)
    }
  }

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
          {flash && <div className="ed-msg" style={{ margin: "0 0 16px" }}>{flash}</div>}
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
                    <button
                      key={a.label}
                      className={`mod-btn${a.kind ? " " + a.kind : ""}`}
                      disabled={!item.id || busy === item.id}
                      onClick={() => a.op && act(item, a.op)}
                    >
                      {busy === item.id ? "…" : a.label}
                    </button>
                  ))}
                  {!item.id && <span style={{ fontSize: 11, opacity: 0.6, marginLeft: 8 }}>static</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </MemberLayout>
  )
}
