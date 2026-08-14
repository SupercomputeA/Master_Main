import { useEffect, useState, type ReactNode } from "react"

/* KgTemplate — the working template model for SUPERCOMPUTE KG use cases.
   ONE renderer, ANY graph: fetches /api/kg/graph?graph=<graphId> and renders
   sections from whatever entity types exist:
   - SVG concept map       ← primary type (article/module/protocol…) + ring nodes
   - Release path ladder   ← release nodes, OR level ladder from level property
   - Story timeline        ← milestone nodes (if present)
   - Important people      ← person nodes (if present)
   - Debate                ← argument nodes, stance for/against (if present)
   - Comments              ← comment nodes, sorted by up (if present)
   Falls back to bundled data when the API is unreachable (static export).
   Export this component to every service use case — school, police, defi,
   future graphs. */

export type KgNode = {
  id: string
  label: string
  type: string
  description?: string
  level?: string
  num?: string
  stance?: string
  up?: number
  properties?: Record<string, unknown>
}
export type KgEdge = [string, string, string?]
export type KgGraph = { nodes: KgNode[]; edges: KgEdge[] }
export type KgResponse = { graph: KgGraph; mcp?: boolean }

const TYPE_COLOR: Record<string, string> = {
  concept: "#C9A33A",
  article: "#6FA3E5",
  module: "#6FA3E5",
  protocol: "#C9A33A",
  chain: "#F4ECD8",
  release: "#6FA3E5",
  milestone: "#E0BE3F",
  person: "#C9A33A",
  argument: "#a78bfa",
  comment: "#6FA3E5",
  default: "#6FA3E5",
}

export const HUB_TYPES = ["article", "module", "protocol", "chain", "concept"]

function GraphSvg({ nodes, edges, hubType = "article" }: { nodes: KgNode[]; edges: KgEdge[]; hubType?: string }) {
  const ring = nodes.filter(n => HUB_TYPES.includes(n.type))
  const center = ring.find(n => n.type === hubType) || ring[0] || { id: "hub", label: "HUB", type: hubType }
  const others = ring.filter(n => n.id !== center.id)
  const cx = 500, cy = 350, radius = 190
  const pos = new Map<string, { x: number; y: number }>()
  pos.set(center.id, { x: cx, y: cy })
  others.forEach((n, i) => {
    const angle = (i / Math.max(others.length, 1)) * Math.PI * 2 - Math.PI / 2
    pos.set(n.id, { x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) })
  })
  const seen = new Set<string>()
  const pairs = edges
    .filter(([a, b]) => pos.has(a) && pos.has(b))
    .filter(([a, b]) => {
      const k = [a, b].sort().join("|")
      if (seen.has(k)) return false
      seen.add(k)
      return true
    })
  return (
    <svg viewBox="0 0 1000 700" preserveAspectRatio="xMidYMid meet">
      <defs>
        <filter id="kgGlow">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      {pairs.map(([a, b]) => {
        const p1 = pos.get(a)!, p2 = pos.get(b)!
        const isHub = a === center.id || b === center.id
        return (
          <line key={`${a}-${b}`} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
            stroke={isHub ? "rgba(201,163,58,.3)" : "rgba(111,163,229,.18)"}
            strokeWidth={isHub ? 1 : 0.8} strokeDasharray="4,3" />
        )
      })}
      {[...pos.entries()].map(([id, p]) => {
        const n = ring.find(c => c.id === id)!
        const isCenter = id === center.id
        const color = TYPE_COLOR[n.type] || TYPE_COLOR.default
        return (
          <g key={id}>
            <circle cx={p.x} cy={p.y} r={isCenter ? 52 : 34}
              fill={isCenter ? "rgba(201,163,58,.22)" : `${color}1a`}
              stroke={isCenter ? "#E0BE3F" : color} strokeWidth={isCenter ? 2 : 1.5}
              filter={isCenter ? "url(#kgGlow)" : undefined} />
            <text x={p.x} y={p.y + (isCenter ? 6 : 3)} fontSize={isCenter ? 11 : 10}
              fontWeight={isCenter ? 700 : 600} textAnchor="middle" fill={isCenter ? "#C9A33A" : color}
              letterSpacing={isCenter ? "1" : undefined}>
              {isCenter ? n.label : labelWrap(n.label)}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

function labelWrap(label: string) {
  return label.length > 12 ? label.split(" ")[0] : label
}

export interface KgTemplateConfig {
  graphId: string
  title: string
  meta: { author: string; date: string; entry: string; read: string }
  hubType?: string
  fallback: KgGraph
  eyebrow?: string
  debateQuestion?: string
  /** Level ladder labels — when nodes carry `level`, render as release path. */
  levelLadder?: { level: string; label: string }[]
  levelBadge?: (level: string) => string
}

export default function KgTemplate({ config }: { config: KgTemplateConfig }) {
  const { graphId, title, meta, hubType = "article", fallback, eyebrow, debateQuestion, levelLadder, levelBadge } = config
  const [graph, setGraph] = useState<KgGraph>(fallback)
  const [live, setLive] = useState(false)

  useEffect(() => {
    fetch(`/api/kg/graph?graph=${graphId}`)
      .then(r => r.json() as Promise<KgResponse>)
      .then(d => {
        if (d?.graph?.nodes?.length) {
          setGraph(d.graph)
          setLive(!!d.mcp)
        }
      })
      .catch(() => { /* keep fallback */ })
  }, [graphId])

  const releases = graph.nodes.filter(n => n.type === "release").sort((a, b) => (a.num || "").localeCompare(b.num || ""))
  const milestones = graph.nodes.filter(n => n.type === "milestone")
  const people = graph.nodes.filter(n => n.type === "person")
  const forArgs = graph.nodes.filter(n => n.type === "argument" && n.stance === "for")
  const againstArgs = graph.nodes.filter(n => n.type === "argument" && n.stance === "against")
  const comments = graph.nodes.filter(n => n.type === "comment").sort((a, b) => (b.up || 0) - (a.up || 0))
  const hub = graph.nodes.find(n => n.type === hubType)
  const connected = graph.nodes.filter(n => n.id !== hub?.id && HUB_TYPES.includes(n.type))

  // Level ladder (school): derive steps from module levels when no release nodes.
  let ladder: ReactNode[] = []
  if (releases.length) {
    ladder = releases.map(s => (
      <div key={s.id} className={`release-step${s.description === "Reading Now" ? " current" : ""}`}>
        <div className="rs-num"><span className="rs-dot" />{s.num}</div>
        <div className="rs-title">{s.label}</div>
        <div className="rs-status">{s.description}</div>
      </div>
    ))
  } else if (levelLadder?.length) {
    const byLevel = (lv: string) => graph.nodes.filter(n => n.level === lv)
    ladder = levelLadder.map((lvl, i) => {
      const stepNodes = byLevel(lvl.level)
      return (
        <div key={lvl.level} className={`release-step${i === 0 ? " current" : ""}`}>
          <div className="rs-num"><span className="rs-dot" />{String(i + 1).padStart(2, "0")}</div>
          <div className="rs-title">{lvl.label}</div>
          <div className="rs-status">{stepNodes.length} modules{levelBadge ? ` · ${levelBadge(lvl.level)}` : ""}</div>
        </div>
      )
    })
  }

  return (
    <div className="tpl-kg">
      <div className="masthead">
        <div className="eyebrow">{eyebrow || `Knowledge Graph · ${graphId}`}{live ? " · MEMGRAPH LIVE" : ""}</div>
        <h1 className="article-title">{title}</h1>
        <div className="article-meta">
          <span>By <span className="m-val">{meta.author}</span></span>
          <span>Published <span className="m-val">{meta.date}</span></span>
          <span>Entry <span className="m-val">{meta.entry}</span></span>
          <span><span className="m-val">{meta.read}</span> read</span>
        </div>
      </div>

      <div className="graph-block term-card">
        <div className="graph-area"><GraphSvg nodes={graph.nodes} edges={graph.edges} hubType={hubType} /></div>
        <div className="graph-sidebar">
          <div className="gs-section">
            <div className="gs-label">Graph Overview</div>
            <div className="stat-row"><span>Nodes</span><span className="v">{graph.nodes.length}</span></div>
            <div className="stat-row"><span>Connections</span><span className="v">{graph.edges.length}</span></div>
            <div className="stat-row"><span>Depth</span><span className="v">3 levels</span></div>
          </div>
          <div className="gs-section">
            <div className="gs-label">Connected Concepts</div>
            <ul className="node-list">
              {connected.slice(0, 8).map((c, i) => (
                <li key={c.id}><span className="node-tag">{String(i + 1).padStart(2, "0")}</span>{c.label}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {ladder.length > 0 && (
        <div className="release-path term-card">{ladder}</div>
      )}

      {(milestones.length > 0 || people.length > 0) && (
        <div className="feature-grid">
          {milestones.length > 0 && (
            <div className="panel term-card">
              <div className="section-head">Story Timeline</div>
              <ul className="timeline">
                {milestones.map(t => (
                  <li key={t.id}>
                    <div className="tl-date">{t.description?.split("·")[0]?.trim()}</div>
                    <div className="tl-title">{t.label}</div>
                    <div className="tl-desc">{t.description?.split("·").slice(1).join("·").trim()}</div>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {people.length > 0 && (
            <div className="panel term-card">
              <div className="section-head">Important People</div>
              <div className="people-list">
                {people.map(p => (
                  <div key={p.id} className="person">
                    <div className="person-av">{p.label.slice(0, 2).toUpperCase()}</div>
                    <div>
                      <div className="person-name">{p.label}</div>
                      <div className="person-role">{p.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {(forArgs.length > 0 || againstArgs.length > 0) && (
        <div className="debate-block">
          <div className="section-head">{debateQuestion || `Debate · ${title}`}</div>
          <div className="debate-grid">
            <div className="debate-side for term-card">
              <div className="debate-header"><span>For</span><span className="debate-score">62%</span></div>
              {forArgs.map(a => (
                <div key={a.id} className="argument">{a.label}<div className="arg-author">{a.description}</div></div>
              ))}
            </div>
            <div className="debate-side against term-card">
              <div className="debate-header"><span>Against</span><span className="debate-score">38%</span></div>
              {againstArgs.map(a => (
                <div key={a.id} className="argument">{a.label}<div className="arg-author">{a.description}</div></div>
              ))}
            </div>
          </div>
        </div>
      )}

      {comments.length > 0 && (
        <div className="comments-block">
          <div className="section-head">Comments · {comments.length}</div>
          <textarea className="comment-input" rows={3} placeholder="> add to the discussion..." />
          {comments.map(c => (
            <div key={c.id} className="comment">
              <div className="comment-av">{c.description?.split("·")[0]?.trim().slice(0, 2).toUpperCase()}</div>
              <div className="comment-body">
                <div className="comment-meta">
                  <span className="comment-name">{c.description?.split("·")[0]?.trim()}</span>
                  <span className="comment-time">{c.description?.split("·").slice(1).join("·").trim()}</span>
                </div>
                <div className="comment-text">{c.label}</div>
                <div className="comment-actions"><span>↑ {c.up}</span><span>Reply</span><span>Cite in graph</span></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
