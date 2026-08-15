import { useEffect, useRef, useState, useCallback, useMemo } from "react"
import { useRouter } from "next/router"
import PublicLayout from "../components/PublicLayout"
import Footer from "../components/Footer"

interface KGNode {
  id: string
  label: string
  type?: string
  description?: string
  connections?: number
  level?: string
  datetime?: string
}

interface GraphData {
  nodes: KGNode[]
  edges: [string, string][]
}

const GRAPH_CATEGORIES: Record<string, string> = {
  protocol: "#10b981", token: "#fbbf24", agent: "#ff6b35",
  module: "#6FA3E5", officer: "#f59e0b", incident: "#0ea5e9",
  misconduct: "#ef4444", department: "#8b5cf6", complaint: "#06b6d4",
  chain: "#627EEA",
  concept: "#F4ECD8", term: "#6FA3E5", person: "#C9A33A",
  article: "#E0BE3F", release: "#6FA3E5", milestone: "#F4ECD8",
  argument: "#C9A33A", comment: "#6FA3E5",
  default: "#64748b",
}

const GRAPHS = [
  { id: "school", label: "Web3 School KG", icon: "📚" },
  { id: "police", label: "Police Data KG", icon: "🚔" },
  { id: "defi", label: "DeFi / ReFi KG", icon: "🏦" },
  { id: "articles", label: "KG Articles", icon: "📄" },
]

type KgEdge = [string, string]
type KgResponse = { graph: GraphData; mcp?: boolean }

type PhysicsSettings = {
  repulsion: number      // charge force: 2000 / dist^2
  linkStrength: number   // spring pull: dist * k
  gravity: number        // center pull: pos * g
  damping: number        // velocity decay per frame
}

export default function KnowledgeGraphPage() {
  const router = useRouter()
  const [graphId, setGraphId] = useState<string>("school")
  const [graphData, setGraphData] = useState<GraphData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)
  const [selectedNode, setSelectedNode] = useState<KGNode | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [physics, setPhysics] = useState<PhysicsSettings>({
    repulsion: 2000,
    linkStrength: 0.008,
    gravity: 0.003,
    damping: 0.85,
  })
  const [showSettings, setShowSettings] = useState(false)
  const [mode, setMode] = useState<"map" | "timeline" | "levels">("map")
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const animRef = useRef(null)
  const positionsRef = useRef(new Map())
  const dragRef = useRef(null)
  const requestedGraphRef = useRef<string>("school")

  useEffect(() => {
    requestedGraphRef.current = graphId
    setLoading(true)
    setError(null)
    setSelectedNode(null)
    fetch(`/api/kg/graph?graph=${graphId}`)
      .then(r => r.json() as Promise<KgResponse>)
      .then(d => {
        // Ignore stale responses: a later graph switch may have superseded this fetch.
        if (requestedGraphRef.current !== graphId) return
        setGraphData((d as { graph: GraphData }).graph)
        positionsRef.current = new Map()
        setLoading(false)
      })
      .catch((e: unknown) => {
        if (requestedGraphRef.current !== graphId) return
        setError(e instanceof Error ? e.message : String(e)); setLoading(false)
      })
  }, [graphId])

  // Honor ?graph= and ?mode= URL params once the router is ready (static export hydrates query late).
  useEffect(() => {
    if (!router.isReady) return
    const q = router.query.graph
    if (typeof q === "string" && ["school", "police", "defi", "articles"].includes(q)) {
      setGraphId(q)
    }
    const m = router.query.mode
    if (m === "timeline" || m === "levels" || m === "map") {
      setMode(m)
    } else if (router.query.timeline === "1") {
      // Legacy alias
      setMode("timeline")
    }
  }, [router.isReady, router.query.graph, router.query.mode, router.query.timeline])

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

  // Story Timeline: temporal nodes (milestones/dates/events/incidents) sorted chronologically.
  const temporalNodes = useMemo(() => {
    if (!graphData) return []
    const TEMPORAL = new Set(["milestone", "date", "event", "incident", "misconduct", "complaint"])
    const parsed = graphData.nodes
      .filter(n => TEMPORAL.has(n.type || "") || n.datetime)
      .map(n => {
        let t: number | null = null
        if (n.datetime) t = new Date(n.datetime).getTime()
        else if (n.type === "milestone") {
          // Milestone descriptions carry a leading year: "2013 · Origin. ..."
          const m = (n.description || "").match(/(19|20)\d{2}/)
          if (m) t = new Date(`${m[0]}-01-01`).getTime()
        }
        return { node: n, time: t }
      })
      .filter(x => x.time !== null)
      .sort((a, b) => (a.time as number) - (b.time as number))
    return parsed
  }, [graphData])

  // Levels mode: group nodes by their level property (school ladder, etc.)
  const leveledGroups = useMemo(() => {
    if (!graphData) return []
    const groups = new Map<string, KGNode[]>()
    graphData.nodes.forEach(n => {
      const lvl = n.level || (n.type === "module" ? "unleveled" : "unleveled")
      if (!groups.has(lvl)) groups.set(lvl, [])
      groups.get(lvl)!.push(n)
    })
    const order = ["beginner", "intermediate", "advanced", "core", "unleveled"]
    return Array.from(groups.entries())
      .sort((a, b) => {
        const ia = order.indexOf(a[0]), ib = order.indexOf(b[0])
        return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib)
      })
      .map(([level, nodes]) => ({ level, nodes }))
  }, [graphData])

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

    // Timeline mode: compact chronological spine through temporal nodes (centered band).
    if (mode === "timeline") {
      const temporal = temporalNodes
      if (temporal.length >= 2) {
        ctx.beginPath()
        temporal.forEach(({ node }, i) => {
          const p = pos.get(node.id)
          if (!p) return
          if (i === 0) ctx.moveTo(p.x, p.y)
          else ctx.lineTo(p.x, p.y)
        })
        ctx.strokeStyle = "rgba(201,163,58,0.45)"
        ctx.lineWidth = 2
        ctx.stroke()
      }
      // Temporal nodes: gold dots + date labels above
      temporal.forEach(({ node, time }) => {
        const p = pos.get(node.id)
        if (!p) return
        const isSel = selectedNode?.id === node.id
        ctx.globalAlpha = isSel ? 1 : 0.9
        ctx.beginPath(); ctx.arc(p.x, p.y, isSel ? 13 : 10, 0, Math.PI * 2)
        ctx.fillStyle = "#C9A33A"; ctx.fill()
        ctx.strokeStyle = isSel ? "#E0BE3F" : "rgba(244,236,216,0.35)"
        ctx.lineWidth = isSel ? 2 : 1; ctx.stroke()
        ctx.globalAlpha = 1
        const year = time ? String(new Date(time).getUTCFullYear()) : ""
        ctx.fillStyle = "#E0BE3F"
        ctx.font = "bold 11px 'JetBrains Mono', monospace"
        ctx.textAlign = "center"
        ctx.fillText(year, p.x, p.y - 18)
        ctx.fillStyle = "#F4ECD8"
        ctx.font = "9px 'JetBrains Mono', monospace"
        ctx.fillText((node.label.length > 14 ? node.label.split(" ")[0] : node.label), p.x, p.y + 24)
      })
      // Non-temporal footer nodes dimmed
      graphData.nodes.forEach(node => {
        if (temporal.some(t => t.node.id === node.id)) return
        const p = pos.get(node.id)
        if (!p) return
        ctx.globalAlpha = 0.35
        ctx.beginPath(); ctx.arc(p.x, p.y, 4, 0, Math.PI * 2)
        ctx.fillStyle = "#6FA3E5"; ctx.fill()
        ctx.globalAlpha = 1
      })
      return
    }

    // Levels mode: nodes arranged in horizontal bands by level.
    if (mode === "levels") {
      const bands = leveledGroups
      const bandCount = bands.length
      const bandH = bandCount > 0 ? h / (bandCount + 1) : h
      bands.forEach((group, bi) => {
        const cy = bandH * (bi + 1)
        // Band label
        ctx.fillStyle = "#E0BE3F"
        ctx.font = "bold 10px 'JetBrains Mono', monospace"
        ctx.textAlign = "left"
        ctx.fillText(group.level.toUpperCase(), 30, cy - 26)
        // Nodes spread across the band
        const n = group.nodes.length
        group.nodes.forEach((node, ni) => {
          const p = pos.get(node.id)
          if (!p) return
          const isSel = selectedNode?.id === node.id
          ctx.globalAlpha = isSel ? 1 : 0.9
          ctx.beginPath(); ctx.arc(p.x, p.y, isSel ? 13 : 9, 0, Math.PI * 2)
          ctx.fillStyle = isSel ? "#C9A33A" : "#6FA3E5"
          ctx.fill()
          ctx.strokeStyle = isSel ? "#E0BE3F" : "rgba(244,236,216,0.3)"
          ctx.lineWidth = isSel ? 2 : 1; ctx.stroke()
          ctx.globalAlpha = 1
          ctx.fillStyle = "#F4ECD8"
          ctx.font = "9px 'JetBrains Mono', monospace"
          ctx.textAlign = "center"
          ctx.fillText(node.label, p.x, p.y + 22)
        })
      })
      return
    }

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
      const color = (node.type ? GRAPH_CATEGORIES[node.type] : undefined) || GRAPH_CATEGORIES.default
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
  }, [graphData, hoveredNode, selectedNode, filteredNodes, searchQuery, mode, temporalNodes, leveledGroups])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !graphData) return
    const parent = canvas.parentElement
    if (!parent) return
    const rect = parent.getBoundingClientRect()
    canvas.width = rect.width
    canvas.height = rect.height
    const w = canvas.width, h = canvas.height

    // Timeline mode: compact chronological spine — centered band, not full width.
    if (mode === "timeline") {
      positionsRef.current = new Map()
      const temporal = temporalNodes
      const n = temporal.length
      // Compact band: max 68% of width, centered
      const bandLeft = w * 0.16, bandRight = w * 0.84
      const span = bandRight - bandLeft
      temporal.forEach(({ node }, i) => {
        const x = n <= 1 ? w / 2 : bandLeft + (i / (n - 1)) * span
        positionsRef.current.set(node.id, { x, y: h / 2, vx: 0, vy: 0, connections: 1 })
      })
      // Non-temporal nodes dimmed along a footer strip
      graphData.nodes.forEach((node, i) => {
        if (positionsRef.current.has(node.id)) return
        const col = i % 9
        positionsRef.current.set(node.id, {
          x: 60 + (col / 8) * (w - 120),
          y: h - 26 - Math.floor(i / 9) * 20,
          vx: 0, vy: 0,
          connections: 0,
        })
      })
      draw()
      return
    }

    // Levels mode: nodes arranged in horizontal bands by level.
    if (mode === "levels") {
      positionsRef.current = new Map()
      const bands = leveledGroups
      const bandCount = bands.length
      const bandH = bandCount > 0 ? h / (bandCount + 1) : h
      bands.forEach((group, bi) => {
        const cy = bandH * (bi + 1)
        const n = group.nodes.length
        group.nodes.forEach((node, ni) => {
          const x = n <= 1 ? w / 2 : 80 + (ni / (n - 1)) * (w - 160)
          positionsRef.current.set(node.id, { x, y: cy, vx: 0, vy: 0, connections: 1 })
        })
      })
      draw()
      return
    }

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
      const { repulsion, linkStrength, gravity, damping } = physics
      graphData.nodes.forEach(n1 => {
        const p1 = pos.get(n1.id)
        if (!p1) return
        graphData.nodes.forEach(n2 => {
          if (n1.id >= n2.id) return
          const p2 = pos.get(n2.id)
          if (!p2) return
          const dx = p2.x - p1.x, dy = p2.y - p1.y
          const dist = Math.sqrt(dx * dx + dy * dy) || 1
          const f = repulsion / (dist * dist)
          p1.vx -= dx / dist * f; p1.vy -= dy / dist * f
          p2.vx += dx / dist * f; p2.vy += dy / dist * f
        })
      })
      graphData.edges.forEach(([from, to]) => {
        const p1 = pos.get(from), p2 = pos.get(to)
        if (!p1 || !p2) return
        const dx = p2.x - p1.x, dy = p2.y - p1.y
        const dist = Math.sqrt(dx * dx + dy * dy) || 1
        const f = dist * linkStrength
        p1.vx += dx / dist * f; p1.vy += dy / dist * f
        p2.vx -= dx / dist * f; p2.vy -= dy / dist * f
      })
      const w2 = w / 2, h2 = h / 2
      pos.forEach(p => { p.vx -= (p.x - w2) * gravity; p.vy -= (p.y - h2) * gravity })
      pos.forEach(p => { if (!dragRef.current) { p.vx *= damping; p.vy *= damping; p.x += p.vx; p.y += p.vy } })
      draw()
      animId = requestAnimationFrame(simulate)
    }
    animId = requestAnimationFrame(simulate)
    return () => cancelAnimationFrame(animId)
  }, [graphData, draw, physics, mode, temporalNodes, leveledGroups])

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
    <PublicLayout title="SUPERCOMPUTE · Knowledge Graph">
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

        {/* Mode switcher + physics tuning */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          {(["map", "timeline", "levels"] as const).map(m => (
            <button
              key={m}
              onClick={() => { setMode(m); setSelectedNode(null) }}
              className="cmd-btn"
              style={mode === m ? {
                background: "var(--gold-warm)", color: "var(--site-bg)",
                border: "1px solid var(--gold-warm)", fontFamily: "var(--font-mono)", fontSize: 10,
                letterSpacing: "0.1em", textTransform: "uppercase",
              } : {
                background: "transparent", color: "var(--cream)",
                border: "1px solid var(--border)", fontFamily: "var(--font-mono)", fontSize: 10,
                letterSpacing: "0.1em", textTransform: "uppercase",
              }}
            >
              {m === "map" ? "◈ map" : m === "timeline" ? "▸ timeline" : "≡ levels"}
            </button>
          ))}
          <button
            onClick={() => setShowSettings(s => !s)}
            className="cmd-btn"
            style={{
              marginLeft: "auto", background: "transparent", color: "var(--mono-blue)",
              border: "1px solid var(--border)", fontFamily: "var(--font-mono)", fontSize: 10,
              letterSpacing: "0.1em", textTransform: "uppercase",
            }}
          >
            {showSettings ? "▾ physics" : "▸ physics"}
          </button>
        </div>
        {showSettings && (
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16,
            border: "1px solid var(--border)", padding: "16px 18px",
            background: "rgba(255,255,255,0.02)",
          }}>
            {([
              ["repulsion", "Repulsion", 200, 8000, 100],
              ["linkStrength", "Link pull", 0.001, 0.05, 0.001],
              ["gravity", "Center gravity", 0, 0.02, 0.0005],
              ["damping", "Damping", 0.7, 0.99, 0.01],
            ] as [keyof PhysicsSettings, string, number, number, number][]).map(([key, label, min, max, step]) => (
              <label key={key} style={{ display: "flex", flexDirection: "column", gap: 6, fontFamily: "var(--font-mono)" }}>
                <span style={{ fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--mono-blue)" }}>
                  {label} · {physics[key]}
                </span>
                <input
                  type="range"
                  min={min}
                  max={max}
                  step={step}
                  value={physics[key]}
                  onChange={e => setPhysics(p => ({ ...p, [key]: Number(e.target.value) }))}
                  style={{ width: "100%", accentColor: "var(--gold-warm)" }}
                />
              </label>
            ))}
          </div>
        )}

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
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", gap: 16 }}>
              <div style={{ flex: 1, height: 500, border: "1px solid var(--border)", position: "relative", overflow: "hidden" }}>
                <canvas ref={canvasRef} style={{ width: "100%", height: "100%", display: "block" }} />
              </div>

              {/* Vocabulary panel — select a node → its term, definition, and related terms */}
              {selectedNode && (
                <div style={{
                  width: 280, border: "1px solid var(--border-warm)", padding: 20,
                  display: "flex", flexDirection: "column", gap: 12, alignSelf: "flex-start",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--gold-warm)", letterSpacing: "0.15em", textTransform: "uppercase" }}>
                      [vocabulary]
                    </div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--mono-blue)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                      {selectedNode.type}
                    </div>
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "var(--cream)", lineHeight: 1.3 }}>
                    {selectedNode.label}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--mono-blue)", lineHeight: 1.7 }}>
                    {selectedNode.description || "No definition yet for this term."}
                  </div>
                  {selectedNode.level && (
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--gold-warm)", border: "1px solid var(--border-warm)", padding: "4px 8px" }}>
                        LEVEL · {selectedNode.level.toUpperCase()}
                      </div>
                    </div>
                  )}
                  {(() => {
                    // Related terms via graph edges
                    const related = graphData
                      ? graphData.edges
                          .filter(e => e[0] === selectedNode.id || e[1] === selectedNode.id)
                          .map(e => {
                            const otherId = e[0] === selectedNode.id ? e[1] : e[0]
                            return graphData.nodes.find(n => n.id === otherId)
                          })
                          .filter((n): n is KGNode => !!n)
                          .slice(0, 6)
                      : []
                    if (related.length === 0) return null
                    return (
                      <div style={{ display: "flex", flexDirection: "column", gap: 6, borderTop: "1px solid var(--border)", paddingTop: 12 }}>
                        <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--gold-warm)" }}>
                          // related terms
                        </div>
                        {related.map(r => (
                          <button
                            key={r.id}
                            onClick={() => setSelectedNode(r)}
                            className="cmd-btn"
                            style={{
                              display: "flex", alignItems: "baseline", gap: 8, textAlign: "left",
                              background: "transparent", color: "var(--cream)", cursor: "pointer",
                              border: "none", padding: "2px 0", fontFamily: "var(--font-mono)", fontSize: 11,
                            }}
                          >
                            <span style={{ color: "var(--mono-blue)" }}>→</span>
                            <span>{r.label}</span>
                          </button>
                        ))}
                      </div>
                    )
                  })()}
                </div>
              )}
            </div>

            {/* Story Timeline panel — each entry IS a node: click selects it (vocab + related terms fire) */}
            {mode === "timeline" && temporalNodes.length > 0 && (
              <div style={{ border: "1px solid var(--border-warm)" }}>
                <div style={{
                  padding: "12px 18px", borderBottom: "1px solid var(--border)",
                  fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.15em",
                  textTransform: "uppercase", color: "var(--gold-warm)",
                }}>
                  // Story Timeline · {temporalNodes.length} entries
                </div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {temporalNodes.map(({ node, time }, i) => {
                    const isSel = selectedNode?.id === node.id
                    const year = time ? new Date(time).getUTCFullYear() : "—"
                    return (
                      <button
                        key={node.id}
                        onClick={() => setSelectedNode(node)}
                        className="cmd-btn"
                        style={{
                          display: "flex", gap: 18, alignItems: "baseline", textAlign: "left",
                          padding: "12px 18px", borderBottom: i < temporalNodes.length - 1 ? "1px solid var(--border)" : "none",
                          background: isSel ? "rgba(201,163,58,0.10)" : "transparent",
                          color: "var(--cream)", cursor: "pointer", borderRadius: 0,
                        }}
                      >
                        <span style={{
                          fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--gold-warm)",
                          minWidth: 56, letterSpacing: "0.05em",
                        }}>
                          {year}
                        </span>
                        <span style={{ flex: 1, fontSize: 12, fontWeight: 600, color: isSel ? "var(--gold-warm)" : "var(--cream)" }}>
                          {node.label}
                        </span>
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--mono-blue)", maxWidth: 420, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {node.description || ""}
                        </span>
                      </button>
                    )
                  })}
                </div>
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
