import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/router"
import MemberLayout from "../../../../components/MemberLayout"

/* Article Edit — loads existing article by id, PUT to /api/articles/:id.
   Static-export friendly: client-side fetch, no SSR. */

interface Article {
  id: string
  title: string
  slug: string | null
  category: string | null
  excerpt: string | null
  content?: string
  status: string | null
}

const API_BASE = ""
const CATEGORIES = ["Protocol Eval", "Finance", "Governance", "Social", "AI Agents", "Security", "Field Note", "TECHNOLOGY", "EDUCATION", "COMMUNITY", "INTELLIGENCE", "ECONOMICS"]

export default function ArticleEdit() {
  const router = useRouter()
  const id = typeof router.query.id === "string" ? router.query.id : ""
  const [loaded, setLoaded] = useState(false)
  const [notFound, setNotFound] = useState(false)
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState(CATEGORIES[0])
  const [cover, setCover] = useState("📝")
  const [excerpt, setExcerpt] = useState("")
  const [body, setBody] = useState("")
  const [msg, setMsg] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    fetch(`${API_BASE}/api/articles/${id}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((d: any) => {
        const a: Article = d.article || {}
        setTitle(a.title || "")
        if (a.category) setCategory(a.category)
        setExcerpt(a.excerpt || "")
        setBody(a.content || "")
        setLoaded(true)
      })
      .catch(() => {
        setNotFound(true)
        setLoaded(true)
      })
  }, [id])

  const words = body.trim() ? body.trim().split(/\s+/).length : 0
  const readMin = Math.max(1, Math.round(words / 200))

  async function save(status: "draft" | "published") {
    setMsg(null)
    const session = typeof window !== "undefined" ? localStorage.getItem("session") : null
    if (!session) { setMsg("// connect wallet + sign in to save"); return }
    try {
      const r = await fetch(`${API_BASE}/api/articles/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session}` },
        body: JSON.stringify({ title, category, excerpt, content: body, status }),
      })
      setMsg(r.ok ? (status === "published" ? "// published — live on the NewsDesk" : "// draft saved") : `// save failed (${r.status})`)
    } catch {
      setMsg("// save failed")
    }
  }

  return (
    <MemberLayout title="SUPERCOMPUTE · Edit Article" banner={{ icon: "📝", title: "Edit Article", sub: "Refine your piece and re-publish to the NewsDesk." }}>
      <div className="tpl-editor">
        <div className="page-header">
          <div className="header-left">
            <div className="header-label">Member Dashboard</div>
            <h1 className="page-title">{loaded ? "Edit Article" : "Loading…"}</h1>
          </div>
          <Link href="/app/publishing" className="mem-btn" style={{ textDecoration: "none" }}>← My articles</Link>
        </div>

        {notFound ? (
          <div className="ed-card term-card" style={{ padding: 24 }}>
            <div className="ed-side-title">Article not found</div>
            <p>This article doesn't exist or was removed.</p>
            <Link href="/app/publishing" className="mem-btn" style={{ textDecoration: "none" }}>← Back to My articles</Link>
          </div>
        ) : !loaded ? (
          <div className="ed-card term-card" style={{ padding: 24 }}>
            <div className="ed-side-title">Loading article…</div>
          </div>
        ) : (
          <div className="ed-grid">
            {/* Editor */}
            <div className="ed-card term-card">
              <input
                className="ed-title-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Article title"
              />
              <textarea
                className="ed-body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder={"> Write your article in Markdown…\n\n## Section\n\nBody copy, **bold**, and [links](https://…)."}
              />
            </div>

            {/* Meta + preview */}
            <div>
              <div className="ed-card term-card" style={{ marginBottom: 28 }}>
                <div className="ed-side-title">Metadata</div>
                <div className="ed-field">
                  <label className="ed-label" htmlFor="cat">Category</label>
                  <select id="cat" className="ed-select" value={category} onChange={(e) => setCategory(e.target.value)}>
                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="ed-field">
                  <label className="ed-label" htmlFor="cover">Cover glyph</label>
                  <input id="cover" className="ed-input" value={cover} onChange={(e) => setCover(e.target.value)} maxLength={4} />
                </div>
                <div className="ed-field">
                  <label className="ed-label" htmlFor="excerpt">Excerpt</label>
                  <input id="excerpt" className="ed-input" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} placeholder="One-line summary" />
                </div>

                <div className="ed-side-title" style={{ marginTop: 20 }}>Stats</div>
                <div className="ed-stat"><span>Words</span><span className="v">{words}</span></div>
                <div className="ed-stat"><span>Read time</span><span className="v">{readMin} min</span></div>
                <div className="ed-stat"><span>Article ID</span><span className="v" style={{ fontSize: 11 }}>{id.slice(0, 12)}…</span></div>

                <div className="ed-actions">
                  <button type="button" className="ed-btn publish" onClick={() => save("published")}>Publish</button>
                  <button type="button" className="ed-btn draft" onClick={() => save("draft")}>Save draft</button>
                </div>
                {msg && <div className="ed-msg">{msg}</div>}
              </div>

              <div className="ed-card term-card">
                <div className="ed-side-title">Card preview</div>
                <div className="tpl-publishing" style={{ maxWidth: "none" }}>
                  <article className="blog-card" style={{ cursor: "default" }}>
                    <div className="blog-image">{cover || "📝"}</div>
                    <div className="blog-content">
                      <div className="blog-category">{category}</div>
                      <h2 className="blog-title">{title || "Untitled article"}</h2>
                      <p className="blog-excerpt">{excerpt || "Your excerpt will appear here."}</p>
                      <div className="blog-meta"><span>Read article</span><span>{readMin} min</span></div>
                    </div>
                  </article>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </MemberLayout>
  )
}
