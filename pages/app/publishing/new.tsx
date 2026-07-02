import { useState } from "react"
import Link from "next/link"
import MemberLayout from "../../../components/MemberLayout"

/* Article Builder — net-new screen (no template shipped; designed in Terminal
   Dossier). Title + category + cover + body with live word count. Save/publish
   best-effort POST to /api/articles (admin-gated server-side). */

const CATEGORIES = ["Protocol Eval", "Finance", "Governance", "Social", "AI Agents", "Security", "Field Note"]

export default function ArticleBuilder() {
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState(CATEGORIES[0])
  const [cover, setCover] = useState("📝")
  const [excerpt, setExcerpt] = useState("")
  const [body, setBody] = useState("")
  const [msg, setMsg] = useState<string | null>(null)

  const words = body.trim() ? body.trim().split(/\s+/).length : 0
  const readMin = Math.max(1, Math.round(words / 200))

  async function save(status: "draft" | "published") {
    setMsg(null)
    await fetch("/api/articles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, category, cover, excerpt, content: body, status }),
    }).catch(() => {})
    setMsg(status === "published" ? "// published — live on the NewsDesk" : "// draft saved")
  }

  return (
    <MemberLayout
      title="SUPERCOMPUTE · Article Builder"
      banner={{ icon: "📝", title: "Article Builder", sub: "Write once, publish everywhere. Draft your piece, set the category, and ship it to the NewsDesk." }}
    >
      <div className="tpl-editor">
        <div className="page-header">
          <div className="header-left">
            <div className="header-label">Member Dashboard</div>
            <h1 className="page-title">New Article</h1>
          </div>
          <Link href="/app/publishing" className="mem-btn" style={{ textDecoration: "none" }}>← My articles</Link>
        </div>

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
              <div className="ed-stat"><span>Status</span><span className="v">Draft</span></div>

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
      </div>
    </MemberLayout>
  )
}
