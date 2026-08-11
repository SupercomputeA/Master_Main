import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/router"
import MemberLayout from "../../../../components/MemberLayout"

/* Knowledge Graph Article Template — reads a real article by slug and renders
   the KG surface (graph block, release path, timeline, debate). Mock people
   and comments removed 2026-08-10; connected concepts come from /api/kg/graph
   when available. */

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

function GraphSvg() {
  const edge = { stroke: "rgba(201,163,58,.3)", strokeWidth: 1, strokeDasharray: "4,3", style: { animation: "kg-dash 1s linear infinite" } }
  return (
    <svg viewBox="0 0 1000 700" preserveAspectRatio="xMidYMid meet">
      <defs>
        <filter id="kgGlow">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <line x1="500" y1="350" x2="250" y2="180" {...edge} />
      <line x1="500" y1="350" x2="780" y2="200" {...edge} />
      <line x1="500" y1="350" x2="200" y2="500" {...edge} />
      <line x1="500" y1="350" x2="760" y2="520" {...edge} />
      <line x1="500" y1="350" x2="500" y2="600" {...edge} />
      <line x1="250" y1="180" x2="780" y2="200" stroke="rgba(111,163,229,.18)" strokeWidth={1} strokeDasharray="3,3" />
      <line x1="200" y1="500" x2="760" y2="520" stroke="rgba(111,163,229,.18)" strokeWidth={1} strokeDasharray="3,3" />
      <circle cx="250" cy="180" r="34" fill="rgba(111,163,229,.12)" stroke="#6FA3E5" strokeWidth={1.5} />
      <text x="250" y="184" fontSize="10" fontWeight="600" textAnchor="middle" fill="#6FA3E5">Keys</text>
      <circle cx="780" cy="200" r="34" fill="rgba(74,222,128,.1)" stroke="#4ADE80" strokeWidth={1.5} />
      <text x="780" y="204" fontSize="10" fontWeight="600" textAnchor="middle" fill="#4ADE80">Custody</text>
      <circle cx="200" cy="500" r="34" fill="rgba(201,163,58,.1)" stroke="#C9A33A" strokeWidth={1.5} />
      <text x="200" y="504" fontSize="10" fontWeight="600" textAnchor="middle" fill="#C9A33A">Wallets</text>
      <circle cx="760" cy="520" r="34" fill="rgba(167,139,250,.13)" stroke="#a78bfa" strokeWidth={1.5} />
      <text x="760" y="524" fontSize="10" fontWeight="600" textAnchor="middle" fill="#a78bfa">Recovery</text>
      <circle cx="500" cy="600" r="34" fill="rgba(201,163,58,.12)" stroke="#C9A33A" strokeWidth={1.5} />
      <text x="500" y="604" fontSize="10" fontWeight="600" textAnchor="middle" fill="#C9A33A">Risk</text>
      <circle cx="500" cy="350" r="52" fill="rgba(201,163,58,.22)" stroke="#E0BE3F" strokeWidth={2} filter="url(#kgGlow)" />
      <text x="500" y="346" fontSize="11" fontWeight="700" textAnchor="middle" fill="#C9A33A" letterSpacing="1">SELF</text>
      <text x="500" y="360" fontSize="11" fontWeight="700" textAnchor="middle" fill="#C9A33A" letterSpacing="1">CUSTODY</text>
    </svg>
  )
}

export default function KGArticle() {
  const router = useRouter()
  const slug = typeof router.query.id === "string" ? router.query.id : ""
  const [article, setArticle] = useState<Article | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [kg, setKg] = useState<{ nodeCount: number; edgeCount: number; concepts: string[] } | null>(null)

  useEffect(() => {
    if (!slug) return
    fetch(`${API_BASE}/api/articles?slug=${encodeURIComponent(slug)}&include=content`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((d: any) => {
        const list: Article[] = d.articles || []
        if (list.length === 0) { setNotFound(true); return }
        setArticle(list[0])
      })
      .catch(() => setNotFound(true))
  }, [slug])

  useEffect(() => {
    // Best-effort KG enrichment: school graph is the live one on the site.
    fetch(`${API_BASE}/api/kg/graph?graph=school`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((d: any) => {
        const g = d?.graph
        if (g && Array.isArray(g.nodes)) {
          setKg({
            nodeCount: g.nodes.length,
            edgeCount: Array.isArray(g.edges) ? g.edges.length : 0,
            concepts: g.nodes.slice(0, 6).map((n: any) => n.label || n.id).filter(Boolean),
          })
        }
      })
      .catch(() => setKg(null))
  }, [])

  return (
    <MemberLayout title={`SUPERCOMPUTE · ${article?.title || "Knowledge Graph Article"}`}>
      <div className="tpl-kg">
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
              <div className="eyebrow">Knowledge Graph · Article</div>
              <h1 className="article-title">{article.title}</h1>
              <div className="article-meta">
                <span>By <span className="m-val">{article.author || "Quanta Sovereigna"}</span></span>
                <span>Published <span className="m-val">{fmtDate(article.published_at)}</span></span>
                <span><span className="m-val">{article.category || "Article"}</span></span>
              </div>
              {article.excerpt && <p className="article-deck">{article.excerpt}</p>}
            </div>

            <div className="graph-block term-card">
              <div className="graph-area"><GraphSvg /></div>
              <div className="graph-sidebar">
                <div className="gs-section">
                  <div className="gs-label">Graph Overview</div>
                  <div className="stat-row"><span>Nodes</span><span className="v">{kg ? kg.nodeCount : "—"}</span></div>
                  <div className="stat-row"><span>Connections</span><span className="v">{kg ? kg.edgeCount : "—"}</span></div>
                  <div className="stat-row"><span>Source</span><span className="v">KG</span></div>
                </div>
                <div className="gs-section">
                  <div className="gs-label">Connected Concepts</div>
                  {kg && kg.concepts.length > 0 ? (
                    <ul className="node-list">
                      {kg.concepts.map((c, i) => (
                        <li key={c}><span className="node-tag">{String(i + 1).padStart(2, "0")}</span>{c}</li>
                      ))}
                    </ul>
                  ) : (
                    <ul className="node-list"><li><span className="node-tag">→</span>Awaiting graph</li></ul>
                  )}
                </div>
              </div>
            </div>

            <div className="feature-grid">
              <div className="panel term-card">
                <div className="section-head">Article Body</div>
                <div className="article-body" style={{ padding: "0 4px" }}>
                  {article.content ? (
                    article.content.split("\n").filter(Boolean).map((line, i) => (
                      <p key={i} style={{ margin: "0 0 12px", lineHeight: 1.7 }}>{line.replace(/^#{1,3} /, "")}</p>
                    ))
                  ) : (
                    <p>{article.excerpt || "Full text coming soon."}</p>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </MemberLayout>
  )
}
