import { useEffect, useRef, useState, useCallback, useMemo } from "react"
import PublicLayout from "../components/PublicLayout"
import Footer from "../components/Footer"

const GRAPH_CATEGORIES: Record<string, string> = {
  // Terminal Dossier palette only
  protocol: "#C9A33A",     // --gold-warm
  token: "#6FA3E5",        // --mono-blue
  agent: "#E0BE3F",        // --hud-yellow
  module: "#6FA3E5",       // --mono-blue
  concept: "#F4ECD8",      // --cream
  term: "#6FA3E5",         // --mono-blue
  person: "#C9A33A",       // --gold-warm
  date: "#E0BE3F",         // --hud-yellow
  event: "#E0BE3F",        // --hud-yellow
  narrative: "#F4ECD8",    // --cream
  image: "#C9A33A",        // --gold-warm
  officer: "#dc2626",      // --danger
  incident: "#E0BE3F",     // --hud-yellow
  misconduct: "#dc2626",   // --danger
  department: "#6FA3E5",   // --mono-blue
  complaint: "#C9A33A",    // --gold-warm
  chain: "#F4ECD8",        // --cream
  default: "#6FA3E5",      // --mono-blue
}

const GRAPHS = [
  { id: "school", label: "Web3 School KG", icon: "📚" },
  { id: "police", label: "Police Data KG", icon: "🚔" },
  { id: "defi", label: "DeFi / ReFi KG", icon: "🏦" },
]

type KgNode = { id: string; label: string; type: string; description?: string; level?: string }
type KgEdge = [string, string]
type KgGraph = { nodes: KgNode[]; edges: KgEdge[]; meta?: unknown }
type KgResponse = { graph: KgGraph; mcp?: boolean }

export default function KnowledgeGraphPage() {
  const [graphId, setGraphId] = useState("school")
  const [graphData, setGraphData] = useState<KgGraph | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)
  const [selectedNode, setSelectedNode] = useState<KgNode | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const animRef = useRef(null)
  const positionsRef = useRef(new Map())
  const dragRef = useRef(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    setSelectedNode(null)
    fetch(`/api/kg/graph?graph=${graphId}`)
      .then(r => r.json() as Promise<KgResponse>)
      .then(d => {
        setGraphData(d.graph)
        positionsRef.current = new Map()
        setLoading(false)
      })
      .catch((e: unknown) => { setError(e instanceof Error ? e.message : String(e)); setLoading(false) })
  }, [graphId])

  const filteredNodes = useMemo(() => {
    if (!graphData) return []
    if (!searchQuery.trim()) return graphData.nodes
    const q = searchQuery.toLowerCase()
    return graphData.nodes.filter(n =>
      n.label.toLowerCase().includes(q) ||
      n.type?.toLowerCase().includes(q) ||
      (n.description || "").toLowerCase().includes(q)
    )
  }, [graphData, searchQuery])

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || !graphData) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const w = canvas.width, h = canvas.height
    ctx.clearRect(0, 0, w, h)
    ctx.fillStyle = "#0a1330"
    ctx.fillRect(0, 0, w, h)

    // Grid (Terminal Dossier hairline)
    ctx.strokeStyle = "rgba(30,58,95,0.20)"
    ctx.lineWidth = 1
    for (let x = 0; x < w; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke() }
    for (let y = 0; y < h; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke() }

    const pos = positionsRef.current
    const isFiltering = searchQuery.trim().length > 0

    // Edges (brass-warm, low opacity)
    graphData.edges.forEach(([from, to]) => {
      const p1 = pos.get(from), p2 = pos.get(to)
      if (!p1 || !p2) return
      ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y)
      ctx.strokeStyle = "rgba(201,163,58,0.18)"
      ctx.lineWidth = 1; ctx.stroke()
    })

    // Nodes
    graphData.nodes.forEach(node => {
      const p = pos.get(node.id)
      if (!p) return
      const color = GRAPH_CATEGORIES[node.type] || GRAPH_CATEGORIES.default
      const r = (pos.get(node.id)?.connections || 0) > 3 ? 10 : 7
      const isHover = hoveredNode === node.id
      const isSel = selectedNode?.id === node.id
      const isVisible = !isFiltering || filteredNodes.some(n => n.id === node.id)
      if (isFiltering && !isVisible) return

      ctx.globalAlpha = isSel ? 1 : isHover ? 0.95 : 0.75
      ctx.beginPath(); ctx.arc(p.x, p.y, r * (isHover || isSel ? 1.3 : 1), 0, Math.PI * 2)
      ctx.fillStyle = color; ctx.fill()
      ctx.strokeStyle = isSel ? "#C9A33A" : "rgba(244,236,216,0.25)"
      ctx.lineWidth = isSel ? 2 : 1; ctx.stroke()
      ctx.globalAlpha = 1

      ctx.fillStyle = "#F4ECD8"
      ctx.font = "9px 'JetBrains Mono', monospace"
      ctx.textAlign = "center"
      ctx.fillText(node.label, p.x, p.y + r + 12)
    })
  }, [graphData, hoveredNode, selectedNode, filteredNodes, searchQuery])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !graphData) return
    const parent = canvas.parentElement
    if (!parent) return
    const rect = parent.getBoundingClientRect()
    canvas.width = rect.width
    canvas.height = rect.height
    const w = canvas.width, h = canvas.height

    // Initialize positions
    graphData.nodes.forEach((n, i) => {
      if (!positionsRef.current.has(n.id)) {
        const angle = (i / graphData.nodes.length) * Math.PI * 2
        positionsRef.current.set(n.id, {
          x: w / 2 + Math.cos(angle) * Math.min(w, h) * 0.3,
          y: h / 2 + Math.sin(angle) * Math.min(w, h) * 0.3,
          vx: 0, vy: 0,
          connections: graphData.edges.filter(e => e[0] === n.id || e[1] === n.id).length,
        })
      }
    })

    let animId: number
    const simulate = () => {
      const pos = positionsRef.current
      graphData.nodes.forEach(n1 => {
        const p1 = pos.get(n1.id)
        if (!p1) return
        graphData.nodes.forEach(n2 => {
          if (n1.id >= n2.id) return
          const p2 = pos.get(n2.id)
          if (!p2) return
          const dx = p2.x - p1.x, dy = p2.y - p1.y
          const dist = Math.sqrt(dx * dx + dy * dy) || 1
          const f = 2000 / (dist * dist)
          p1.vx -= dx / dist * f; p1.vy -= dy / dist * f
          p2.vx += dx / dist * f; p2.vy += dy / dist * f
        })
      })
      graphData.edges.forEach(([from, to]) => {
        const p1 = pos.get(from), p2 = pos.get(to)
        if (!p1 || !p2) return
        const dx = p2.x - p1.x, dy = p2.y - p1.y
        const dist = Math.sqrt(dx * dx + dy * dy) || 1
        const f = dist * 0.008
        p1.vx += dx / dist * f; p1.vy += dy / dist * f
        p2.vx -= dx / dist * f; p2.vy -= dy / dist * f
      })
      pos.forEach(p => { p.vx -= p.x * 0.003; p.vy -= p.y * 0.003 })
      pos.forEach(p => { if (!dragRef.current) { p.vx *= 0.85; p.vy *= 0.85; p.x += p.vx; p.y += p.vy } })
      draw()
      animId = requestAnimationFrame(simulate)
    }
    animId = requestAnimationFrame(simulate)
    return () => cancelAnimationFrame(animId)
  }, [graphData, draw])

  // Mouse handlers
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const getNodeAt = (x: number, y: number) => {
      for (const [id, p] of positionsRef.current) {
        const node = graphData?.nodes.find(n => n.id === id)
        if (!node) continue
        const r = (p.connections || 0) > 3 ? 13 : 10
        if (Math.abs(x - p.x) < r && Math.abs(y - p.y) < r) return id
      }
      return null
    }
    canvas.onmousemove = e => {
      const r = canvas.getBoundingClientRect()
      const x = e.clientX - r.left, y = e.clientY - r.top
      const id = getNodeAt(x, y)
      canvas.style.cursor = id ? "pointer" : "default"
      if (id !== hoveredNode) setHoveredNode(id)
    }
    canvas.onclick = e => {
      const r = canvas.getBoundingClientRect()
      const x = e.clientX - r.left, y = e.clientY - r.top
      const id = getNodeAt(x, y)
      if (id) {
        const node = graphData?.nodes.find(n => n.id === id)
        setSelectedNode(node || null)
      } else {
        setSelectedNode(null)
      }
    }
  }, [graphData, hoveredNode])

  return (
    <PublicLayout title="SUPERCOMPUTE · Knowledge Graph" wide>
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

        {/* Header */}
        <div className="hero" style={{ paddingBottom: 24, minHeight: "auto", borderBottom: "1px solid var(--border)" }}>
          <div className="hero-kicker">
            <div className="status-dot" />
            <span className="label" style={{ color: "var(--gold-warm)" }}>// knowledge graph</span>
          </div>
          <h1 style={{ fontSize: "1.6rem", fontWeight: 700, marginBottom: 8 }}>
            Knowledge <span style={{ color: "var(--gold-warm)" }}>Graphs</span>
          </h1>
          <p style={{ color: "var(--mono-blue)", fontSize: 13, maxWidth: 540, lineHeight: 1.7 }}>
            Multi-graph knowledge system. Switch between domains to explore entity relationships,
            prerequisite chains, and network topology.
          </p>
        </div>

        {/* Graph selector */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {GRAPHS.map(g => (
            <button
              key={g.id}
              onClick={() => setGraphId(g.id)}
              className="cmd-btn"
              style={graphId === g.id ? {
                background: "var(--gold-warm)", color: "var(--site-bg)",
                border: "1px solid var(--gold-warm)",
              } : {
                background: "transparent", color: "var(--cream)",
                border: "1px solid var(--border)",
              }}
            >
              {g.icon} {g.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="// search nodes..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          style={{
            fontFamily: "var(--font-mono)", fontSize: 12, background: "transparent",
            color: "var(--cream)", border: "1px solid var(--border)",
            padding: "10px 14px", outline: "none", width: "100%", boxSizing: "border-box",
          }}
        />

        {/* Error state */}
        {error && (
          <div style={{ padding: 24, border: "1px solid var(--danger)", color: "var(--danger)", fontFamily: "var(--font-mono)", fontSize: 12 }}>
            ⚠ {error}
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div style={{ height: 400, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--border)" }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--mono-blue)" }}>// loading graph...</div>
          </div>
        )}

        {/* Empty state */}
        {!loading && graphData && graphData.nodes.length === 0 && (
          <div style={{ height: 400, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--border)", flexDirection: "column", gap: 12 }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 24 }}>◎</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--mono-blue)" }}>
              // no entities in this graph
            </div>
          </div>
        )}

        {/* Canvas */}
        {!loading && graphData && graphData.nodes.length > 0 && (
          <div style={{ display: "flex", gap: 16 }}>
            <div style={{ flex: 1, height: 500, border: "1px solid var(--border)", position: "relative", overflow: "hidden" }}>
              <canvas ref={canvasRef} style={{ width: "100%", height: "100%", display: "block" }} />
            </div>

            {/* Detail panel */}
            {selectedNode && (
              <div style={{
                width: 260, border: "1px solid var(--border-warm)", padding: 20,
                display: "flex", flexDirection: "column", gap: 12, alignSelf: "flex-start",
              }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--gold-warm)", letterSpacing: "0.15em", textTransform: "uppercase" }}>
                  [{selectedNode.type}]
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--cream)" }}>
                  {selectedNode.label}
                </div>
                <div style={{ fontSize: 12, color: "var(--mono-blue)", lineHeight: 1.6 }}>
                  {selectedNode.description || "No description"}
                </div>
                {selectedNode.level && (
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--gold-warm)", border: "1px solid var(--border-warm)", padding: "4px 8px", alignSelf: "flex-start" }}>
                    {selectedNode.level.toUpperCase()}
                  </div>
                )}
                {graphId === "school" && (
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--mono-blue)", marginTop: 8 }}>
                    // {selectedNode.id}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Stats */}
        {graphData && graphData.nodes.length > 0 && (
          <div style={{ display: "flex", gap: 24, fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--mono-blue)", borderTop: "1px solid var(--border)", paddingTop: 16 }}>
            <span>{graphData.nodes.length} entities</span>
            <span>{graphData.edges.length} relationships</span>
            <span>{new Set(graphData.nodes.map(n => n.type)).size} types</span>
          </div>
        )}

      </div>
      <Footer />
    </PublicLayout>
  )
}
