import { useEffect, useState } from "react"
import MemberLayout from "../../../components/MemberLayout"

/* Knowledge Graph Article — TEMPLATE (data-driven).
   Renders every page element from KG graph entities (/api/kg/graph?graph=articles):
   - SVG graph from concept nodes + edges
   - Release path from release nodes (sorted by num)
   - Story timeline from milestone nodes
   - Important people from person nodes
   - Debate from argument nodes (stance: for/against)
   - Comments from comment nodes (sorted by up)
   Falls back to bundled template data when the API is unreachable (static export).
   This is the working template model — export to all service use cases. */

type KgNode = {
  id: string
  label: string
  type: string
  description?: string
  level?: string
  num?: string
  stance?: string
  up?: number
  x?: number
  y?: number
  r?: number
  properties?: Record<string, unknown>
}
type KgEdge = [string, string, string?]
type KgGraph = { nodes: KgNode[]; edges: KgEdge[] }
type KgResponse = { graph: KgGraph; mcp?: boolean }

const FALLBACK: KgGraph = {
  nodes: [
    { id: "art-01", label: "Self-Custody & the Sovereignty Stack", type: "article", description: "Knowledge Graph article, Series 03, Entry 4 of 7." },
    { id: "art-02", label: "Sovereignty Stack", type: "article" },
    { id: "art-03", label: "Key Management", type: "article" },
    { id: "ac-sc", label: "SELF-CUSTODY", type: "concept", level: "core" },
    { id: "ac-keys", label: "Keys", type: "concept" },
    { id: "ac-custody", label: "Custody", type: "concept" },
    { id: "ac-wallets", label: "Wallets", type: "concept" },
    { id: "ac-recovery", label: "Recovery", type: "concept" },
    { id: "ac-risk", label: "Risk", type: "concept" },
    { id: "ac-private-keys", label: "Private Keys", type: "concept" },
    { id: "ac-hardware-wallets", label: "Hardware Wallets", type: "concept" },
    { id: "ac-social-recovery", label: "Social Recovery", type: "concept" },
    { id: "ac-risk-models", label: "Risk Models", type: "concept" },
    { id: "rl-01", label: "Foundations", type: "release", num: "01", description: "Published" },
    { id: "rl-02", label: "Data Consumption", type: "release", num: "02", description: "Published" },
    { id: "rl-03", label: "The Vocabulary", type: "release", num: "03", description: "Published" },
    { id: "rl-04", label: "Self-Custody", type: "release", num: "04", description: "Reading Now" },
    { id: "rl-05", label: "Smart Connections", type: "release", num: "05", description: "Jul 5" },
    { id: "rl-06", label: "Embeddings", type: "release", num: "06", description: "Jul 12" },
    { id: "rl-07", label: "Synthesis", type: "release", num: "07", description: "Jul 19" },
    { id: "tl-2013", label: "The Custody Problem", type: "milestone", description: "2013 · Origin. Early Base Chain operators confront the tradeoff between convenience and control." },
    { id: "tl-2019", label: "Hardware Wallet Era", type: "milestone", description: "2019 · Shift. Cold storage becomes standard." },
    { id: "tl-2023", label: "Social Recovery", type: "milestone", description: "2023 · Evolution. Smart accounts distribute trust across guardians." },
    { id: "tl-2026", label: "The Sovereignty Stack", type: "milestone", description: "2026 · Now. Self-custody becomes a composable layer." },
    { id: "p-quanta", label: "quanta_s", type: "person", description: "Author · NewsDesk intelligence" },
    { id: "p-knight", label: "knight", type: "person", description: "Contributor · TradeDesk treasury ops" },
    { id: "p-sarah", label: "Sarah Chen", type: "person", description: "Reviewer · Security research" },
    { id: "p-james", label: "James Rivera", type: "person", description: "Cited · Governance framework" },
    { id: "p-morgan", label: "Morgan Lee", type: "person", description: "Debate · Against" },
    { id: "p-alex", label: "alex_t", type: "person", description: "Debate · Against" },
    { id: "arg-for-1", label: "Self-custody is the only way to guarantee true ownership", type: "argument", stance: "for", description: "— knight @tradedesk" },
    { id: "arg-for-2", label: "Social recovery solves the usability problem without reintroducing custodians.", type: "argument", stance: "for", description: "— Sarah Chen" },
    { id: "arg-for-3", label: "Every custodial failure in history proves the counterparty risk is real.", type: "argument", stance: "for", description: "— quanta_s" },
    { id: "arg-against-1", label: "Mainstream adoption needs abstraction — most users can't safely manage keys.", type: "argument", stance: "against", description: "— Morgan Lee" },
    { id: "arg-against-2", label: "Institutional custody has regulatory protections self-custody can't match.", type: "argument", stance: "against", description: "— James Rivera" },
    { id: "arg-against-3", label: "Recovery guardians just move the trust problem, they don't eliminate it.", type: "argument", stance: "against", description: "— alex_t" },
    { id: "cmt-1", label: "The sovereignty stack framing finally makes this click. Been running paper-trade custody flows and the risk node maps exactly to what I see in treasury ops.", type: "comment", description: "knight · 2 hours ago", up: 24 },
    { id: "cmt-2", label: "Strong entry. Would love a deeper node on threshold signatures in the next release — it's the missing edge between Recovery and Risk.", type: "comment", description: "Sarah Chen · 5 hours ago", up: 18 },
    { id: "cmt-3", label: "Counterpoint in the debate holds up — usability is still the blocker. But this article moved me from 30% to maybe 50% For.", type: "comment", description: "alex_t · 1 day ago", up: 11 },
  ],
  edges: [
    ["art-01", "ac-sc"], ["art-01", "ac-keys"], ["art-01", "ac-custody"], ["art-01", "ac-wallets"], ["art-01", "ac-recovery"], ["art-01", "ac-risk"],
    ["ac-sc", "ac-keys"], ["ac-sc", "ac-custody"], ["ac-sc", "ac-wallets"], ["ac-sc", "ac-recovery"], ["ac-sc", "ac-risk"],
    ["ac-keys", "ac-private-keys"], ["ac-wallets", "ac-hardware-wallets"], ["ac-recovery", "ac-social-recovery"], ["ac-risk", "ac-risk-models"],
    ["rl-01", "rl-02"], ["rl-02", "rl-03"], ["rl-03", "rl-04"], ["rl-04", "rl-05"], ["rl-05", "rl-06"], ["rl-06", "rl-07"],
    ["tl-2013", "tl-2019"], ["tl-2019", "tl-2023"], ["tl-2023", "tl-2026"],
  ],
}

const ART_TITLE = "Self-Custody & the Sovereignty Stack"
const ART_META = { author: "quanta_s @newsdesk", date: "Jun 28, 2026", entry: "4 of 7", read: "14 min" }

const TYPE_COLOR: Record<string, string> = {
  concept: "#C9A33A",
  article: "#6FA3E5",
  release: "#6FA3E5",
  milestone: "#E0BE3F",
  person: "#C9A33A",
  argument: "#a78bfa",
  comment: "#6FA3E5",
  default: "#6FA3E5",
}

function GraphSvg({ nodes, edges }: { nodes: KgNode[]; edges: KgEdge[] }) {
  // Layout: article center, concepts ring around it (stable pseudo-positions).
  const concepts = nodes.filter(n => n.type === "concept" || n.type === "article")
  const center = concepts.find(n => n.type === "article") || { id: "ac-sc", label: "CENTER" }
  const ring = concepts.filter(n => n.id !== center.id)
  const cx = 500, cy = 350, radius = 190
  const pos = new Map<string, { x: number; y: number }>()
  pos.set(center.id, { x: cx, y: cy })
  ring.forEach((n, i) => {
    const angle = (i / Math.max(ring.length, 1)) * Math.PI * 2 - Math.PI / 2
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
        const n = concepts.find(c => c.id === id)!
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

export default function KnowledgeGraphArticle() {
  const [graph, setGraph] = useState<KgGraph>(FALLBACK)
  const [live, setLive] = useState(false)

  useEffect(() => {
    fetch("/api/kg/graph?graph=articles")
      .then(r => r.json() as Promise<KgResponse>)
      .then(d => {
        if (d?.graph?.nodes?.length) {
          setGraph(d.graph)
          setLive(!!d.mcp)
        }
      })
      .catch(() => { /* keep fallback */ })
  }, [])

  const release = graph.nodes.filter(n => n.type === "release").sort((a, b) => (a.num || "").localeCompare(b.num || ""))
  const timeline = graph.nodes.filter(n => n.type === "milestone")
  const people = graph.nodes.filter(n => n.type === "person")
  const forArgs = graph.nodes.filter(n => n.type === "argument" && n.stance === "for")
  const againstArgs = graph.nodes.filter(n => n.type === "argument" && n.stance === "against")
  const comments = graph.nodes.filter(n => n.type === "comment").sort((a, b) => (b.up || 0) - (a.up || 0))
  const connected = graph.nodes.filter(n => ["ac-private-keys", "ac-hardware-wallets", "ac-social-recovery", "ac-risk-models"].includes(n.id))
  const related = graph.nodes.filter(n => ["art-02", "art-03"].includes(n.id))

  return (
    <MemberLayout title={`SUPERCOMPUTE · ${ART_TITLE}`}>
      <div className="tpl-kg">
        <div className="masthead">
          <div className="eyebrow">Knowledge Graph · Article · Series 03{live ? " · MEMGRAPH LIVE" : ""}</div>
          <h1 className="article-title">{ART_TITLE}</h1>
          <div className="article-meta">
            <span>By <span className="m-val">{ART_META.author}</span></span>
            <span>Published <span className="m-val">{ART_META.date}</span></span>
            <span>Entry <span className="m-val">{ART_META.entry}</span></span>
            <span><span className="m-val">{ART_META.read}</span> read</span>
          </div>
        </div>

        <div className="graph-block term-card">
          <div className="graph-area"><GraphSvg nodes={graph.nodes} edges={graph.edges} /></div>
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
                {connected.map((c, i) => (
                  <li key={c.id}><span className="node-tag">{String(i + 1).padStart(2, "0")}</span>{c.label}</li>
                ))}
              </ul>
            </div>
            <div className="gs-section">
              <div className="gs-label">Related Articles</div>
              <ul className="node-list">
                {related.map(r => (
                  <li key={r.id}><span className="node-tag">→</span>{r.label}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="release-path term-card">
          {release.map(s => (
            <div key={s.id} className={`release-step${s.description === "Reading Now" ? " current" : ""}`}>
              <div className="rs-num"><span className="rs-dot" />{s.num}</div>
              <div className="rs-title">{s.label}</div>
              <div className="rs-status">{s.description}</div>
            </div>
          ))}
        </div>

        <div className="feature-grid">
          <div className="panel term-card">
            <div className="section-head">Story Timeline</div>
            <ul className="timeline">
              {timeline.map(t => (
                <li key={t.id}>
                  <div className="tl-date">{t.description?.split("·")[0]?.trim()}</div>
                  <div className="tl-title">{t.label}</div>
                  <div className="tl-desc">{t.description?.split("·").slice(1).join("·").trim()}</div>
                </li>
              ))}
            </ul>
          </div>
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
        </div>

        <div className="debate-block">
          <div className="section-head">Debate · Is Full Self-Custody Practical at Scale?</div>
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
      </div>
    </MemberLayout>
  )
}
