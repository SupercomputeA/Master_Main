import { useState, useMemo } from "react"
import Layout from "../components/Layout"
import Footer from "../components/Footer"
import type { PostDraft, Platform, ExportResult } from "../lib/export/types"
import { PLATFORMS } from "../lib/export/types"
import { exportAll } from "../lib/export/formatters"

const CATEGORIES = ["INTELLIGENCE", "SOVEREIGNTY", "DISPATCH", "SIGNAL", "PROTOCOL_EVAL"]

export default function Compose() {
  const [draft, setDraft] = useState<PostDraft>({
    title: "",
    body: "",
    excerpt: "",
    author: "",
    tags: [],
    category: "DISPATCH",
    coverImage: "",
  })
  const [tagInput, setTagInput] = useState("")
  const [activePlatform, setActivePlatform] = useState<Platform>("x")
  const [copied, setCopied] = useState<Platform | null>(null)

  const exports = useMemo(() => {
    if (!draft.title && !draft.body) return null
    return exportAll(draft)
  }, [draft])

  const activeExport = exports?.find(e => e.platform === activePlatform) ?? null

  const update = (field: keyof PostDraft, value: string) => {
    setDraft(prev => ({ ...prev, [field]: value }))
  }

  const addTag = () => {
    const tag = tagInput.trim()
    if (tag && !draft.tags.includes(tag)) {
      setDraft(prev => ({ ...prev, tags: [...prev.tags, tag] }))
      setTagInput("")
    }
  }

  const removeTag = (tag: string) => {
    setDraft(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }))
  }

  const copyToClipboard = async (text: string, platform: Platform) => {
    await navigator.clipboard.writeText(text)
    setCopied(platform)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <Layout title="SUPERCOMPUTE · Compose">
      <section className="hero" id="compose">
        <div className="hero-kicker">
          <div className="status-dot" />
          <span className="label">// compose</span>
        </div>
        <h1 className="display-xl hero-title" style={{ fontSize: "clamp(28px, 5vw, 56px)" }}>
          WRITE<br /><em>ONCE</em>
        </h1>
        <p className="hero-sub">
          One post. Four platforms. Every format handled.
        </p>
      </section>

      <section className="section">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, background: "var(--border)", border: "1px solid var(--border)" }}>
          {/* Editor */}
          <div style={{ background: "var(--bg)", padding: "28px 24px" }}>
            <div className="label-sm" style={{ marginBottom: 16, color: "var(--accent)" }}>// editor</div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: 6 }}>Title</label>
                <input
                  type="text"
                  value={draft.title}
                  onChange={e => update("title", e.target.value)}
                  placeholder="Article title..."
                  style={{ width: "100%", background: "var(--surface)", border: "1px solid var(--border)", padding: "10px 14px", fontFamily: "var(--font-display)", fontSize: 18, color: "var(--fg)", outline: "none" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: 6 }}>Author</label>
                  <input
                    type="text"
                    value={draft.author}
                    onChange={e => update("author", e.target.value)}
                    placeholder="Author name..."
                    style={{ width: "100%", background: "var(--surface)", border: "1px solid var(--border)", padding: "8px 12px", fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--fg)", outline: "none" }}
                  />
                </div>
                <div>
                  <label style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: 6 }}>Category</label>
                  <select
                    value={draft.category}
                    onChange={e => update("category", e.target.value)}
                    style={{ width: "100%", background: "var(--surface)", border: "1px solid var(--border)", padding: "8px 12px", fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--fg)", cursor: "pointer" }}
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: 6 }}>Excerpt</label>
                <textarea
                  value={draft.excerpt}
                  onChange={e => update("excerpt", e.target.value)}
                  placeholder="Short summary for social previews..."
                  rows={2}
                  style={{ width: "100%", background: "var(--surface)", border: "1px solid var(--border)", padding: "10px 14px", fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--fg)", outline: "none", resize: "vertical" }}
                />
              </div>

              <div>
                <label style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: 6 }}>Body (markdown)</label>
                <textarea
                  value={draft.body}
                  onChange={e => update("body", e.target.value)}
                  placeholder="Write your article in markdown..."
                  rows={14}
                  style={{ width: "100%", background: "var(--surface)", border: "1px solid var(--border)", padding: "14px 16px", fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--fg)", outline: "none", resize: "vertical", lineHeight: 1.8 }}
                />
              </div>

              <div>
                <label style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: 6 }}>Tags</label>
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    type="text"
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addTag() } }}
                    placeholder="Add tag..."
                    style={{ flex: 1, background: "var(--surface)", border: "1px solid var(--border)", padding: "8px 12px", fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--fg)", outline: "none" }}
                  />
                  <button onClick={addTag} style={{ background: "var(--accent)", color: "var(--bg)", border: "none", padding: "8px 16px", fontFamily: "var(--font-mono)", fontSize: 10, cursor: "pointer" }}>
                    Add
                  </button>
                </div>
                {draft.tags.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 8 }}>
                    {draft.tags.map(tag => (
                      <span
                        key={tag}
                        onClick={() => removeTag(tag)}
                        style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--muted)", border: "1px solid var(--border)", padding: "3px 8px", cursor: "pointer" }}
                      >
                        {tag} ×
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: 6 }}>Cover Image URL</label>
                <input
                  type="text"
                  value={draft.coverImage}
                  onChange={e => update("coverImage", e.target.value)}
                  placeholder="https://..."
                  style={{ width: "100%", background: "var(--surface)", border: "1px solid var(--border)", padding: "8px 12px", fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--fg)", outline: "none" }}
                />
              </div>
            </div>
          </div>

          {/* Export Preview */}
          <div style={{ background: "var(--bg)", padding: "28px 24px", borderLeft: "1px solid var(--border)" }}>
            <div className="label-sm" style={{ marginBottom: 16, color: "var(--accent)" }}>// export preview</div>

            <div style={{ display: "flex", gap: 0, marginBottom: 20 }}>
              {(Object.keys(PLATFORMS) as Platform[]).map(p => {
                const config = PLATFORMS[p]
                const exp = exports?.find(e => e.platform === p)
                return (
                  <button
                    key={p}
                    onClick={() => setActivePlatform(p)}
                    style={{
                      flex: 1,
                      padding: "10px 8px",
                      background: activePlatform === p ? "var(--accent)" : "var(--surface)",
                      color: activePlatform === p ? "var(--bg)" : "var(--muted)",
                      border: "1px solid var(--border)",
                      fontFamily: "var(--font-mono)",
                      fontSize: 9,
                      cursor: "pointer",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <span style={{ fontSize: 16 }}>{config.icon}</span>
                    <span>{config.name}</span>
                    {exp && (
                      <span style={{ fontSize: 8, opacity: 0.7 }}>
                        {exp.characterCount}/{config.maxChars}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>

            {activeExport ? (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--muted)" }}>
                    {activeExport.characterCount} chars
                    {activeExport.threadParts && ` · ${activeExport.threadParts.length} parts`}
                    {activeExport.metadata.format && ` · ${activeExport.metadata.format}`}
                  </div>
                  <button
                    onClick={() => copyToClipboard(activeExport.preview, activePlatform)}
                    style={{
                      background: copied === activePlatform ? "var(--teal)" : "var(--accent)",
                      color: "var(--bg)",
                      border: "none",
                      padding: "6px 14px",
                      fontFamily: "var(--font-mono)",
                      fontSize: 10,
                      cursor: "pointer",
                    }}
                  >
                    {copied === activePlatform ? "Copied" : "Copy"}
                  </button>
                </div>

                <div style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  padding: "16px 20px",
                  fontFamily: "var(--font-mono)",
                  fontSize: 12,
                  color: "var(--fg)",
                  lineHeight: 1.7,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  maxHeight: 500,
                  overflowY: "auto",
                }}>
                  {activeExport.preview}
                </div>

                {activeExport.threadParts && activeExport.threadParts.length > 1 && (
                  <div style={{ marginTop: 16 }}>
                    <div className="label-sm" style={{ marginBottom: 8, color: "var(--accent)" }}>// thread breakdown</div>
                    {activeExport.threadParts.map((part, i) => (
                      <div key={i} style={{ marginBottom: 8 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                          <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--teal)" }}>Part {i + 1}</span>
                          <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--muted)" }}>{part.length} chars</span>
                        </div>
                        <div style={{
                          background: "var(--bg)",
                          border: "1px solid var(--border)",
                          padding: "10px 14px",
                          fontFamily: "var(--font-mono)",
                          fontSize: 11,
                          color: "var(--fg)",
                          lineHeight: 1.6,
                          whiteSpace: "pre-wrap",
                        }}>
                          {part}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div style={{ padding: "60px 24px", textAlign: "center", color: "var(--muted)", fontSize: 12 }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 24, color: "var(--accent)", marginBottom: 12 }}>Write something</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>
                  Your post will be formatted for X, Farcaster, Lens, and Mirror in real time.
                </div>
              </div>
            )}

            {exports && (
              <div style={{ marginTop: 24, borderTop: "1px solid var(--border)", paddingTop: 16 }}>
                <div className="label-sm" style={{ marginBottom: 12, color: "var(--accent)" }}>// export all</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {exports.map(exp => {
                    const config = PLATFORMS[exp.platform]
                    const overLimit = exp.characterCount > config.maxChars && !exp.threadParts
                    return (
                      <button
                        key={exp.platform}
                        onClick={() => copyToClipboard(exp.preview, exp.platform)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "10px 14px",
                          background: "var(--surface)",
                          border: `1px solid ${overLimit ? "var(--danger)" : "var(--border)"}`,
                          cursor: "pointer",
                        }}
                      >
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--fg)" }}>
                          {config.icon} {config.name}
                        </span>
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: copied === exp.platform ? "var(--teal)" : overLimit ? "var(--danger)" : "var(--muted)" }}>
                          {copied === exp.platform ? "Copied" : `${exp.characterCount} chars`}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </Layout>
  )
}
