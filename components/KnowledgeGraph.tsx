"use client"

import { useEffect, useRef, useState, useCallback, useMemo } from "react"

type KGNode = {
  id: string
  label: string
  type: string
  connections?: number
  description?: string
  properties?: Record<string, string>
  [key: string]: unknown
}

type KGEdge = [string, string, string?]

type GraphData = {
  nodes: KGNode[]
  edges: KGEdge[]
  stats?: { label: string; value: string | number }[]
}

// Terminal Dossier-aligned KG node palette. All values trace to canonical
// tokens (--gold-warm, --mono-blue, --hud-yellow, --cream, --danger, --green).
// No pink/cyan/violet — those are reserved for logo gradient + auth overlay
// + school progress-bar fill per the Web3 Identity palette rule.
const TYPE_COLORS: Record<string, string> = {
  // Article-level concepts (Tina schema)
  protocol: "#C9A33A",   // --gold-warm  — primary node accent
  token: "#6FA3E5",      // --mono-blue  — secondary
  agent: "#E0BE3F",      // --hud-yellow — identity
  concept: "#F4ECD8",    // --cream      — neutral
  person: "#C9A33A",     // --gold-warm
  term: "#6FA3E5",       // --mono-blue
  date: "#E0BE3F",       // --hud-yellow
  event: "#E0BE3F",      // --hud-yellow
  narrative: "#F4ECD8",  // --cream
  image: "#C9A33A",      // --gold-warm  (brass hairline substitute)

  // Police/NYPD dataset semantic types (NYPD misconduct analysis)
  officer: "#dc2626",    // --danger
  incident: "#E0BE3F",   // --hud-yellow — attention
  misconduct: "#dc2626", // --danger
  department: "#6FA3E5", // --mono-blue  — institutional
  complaint: "#C9A33A",  // --gold-warm  — visibility
  chain: "#F4ECD8",      // --cream      — neutral
  member: "#6FA3E5",     // --mono-blue
  project: "#C9A33A",    // --gold-warm

  default: "#6FA3E5",    // --mono-blue  — fallback
}

const TYPE_LABELS: Record<string, string> = {
  officer: "Officer",
  incident: "Incident",
  misconduct: "Misconduct",
  department: "Department",
  complaint: "Complaint",
  protocol: "Protocol",
  agent: "Agent",
  project: "Project",
  token: "Token",
  member: "Member",
}

const SEARCH_CATEGORIES = [
  { key: "all", label: "All" },
  { key: "officer", label: "Officers" },
  { key: "incident", label: "Incidents" },
  { key: "misconduct", label: "Misconduct" },
  { key: "department", label: "Departments" },
  { key: "complaint", label: "Complaints" },
]

export default function KnowledgeGraph({
  data,
  width = "100%",
  height = 500,
  interactive = true,
  onNodeClick,
  selectedNodeId,
}: {
  data: GraphData
  width?: number | string
  height?: number | string
  interactive?: boolean
  onNodeClick?: (node: KGNode) => void
  selectedNodeId?: string | null
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [hovered, setHovered] = useState<string | null>(null)
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 })
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false)
  const [lastMouse, setLastMouse] = useState({ x: 0, y: 0 })
  const [searchQuery, setSearchQuery] = useState("")
  const [searchCategory, setSearchCategory] = useState("all")
  const [highlightedNodes, setHighlightedNodes] = useState<Set<string>>(new Set())
  const [initialized, setInitialized] = useState(false)

  const positionsRef = useRef<Map<string, { x: number; y: number; vx: number; vy: number }>>(new Map())
  const nodeConnectionsRef = useRef<Map<string, number>>(new Map())
  const animRef = useRef<number>(0)
  const hoveredRef = useRef<string | null>(null)

  const getColor = (type: string) => TYPE_COLORS[type] ?? TYPE_COLORS.default

  useEffect(() => {
    const counts = new Map<string, number>()
    data.nodes.forEach(n => counts.set(n.id, 0))
    data.edges.forEach(([from, to]) => {
      counts.set(from, (counts.get(from) || 0) + 1)
      counts.set(to, (counts.get(to) || 0) + 1)
    })
    nodeConnectionsRef.current = counts
  }, [data])

  const filteredNodes = useMemo(() => {
    let nodes = data.nodes

    if (searchCategory !== "all") {
      nodes = nodes.filter(n => n.type === searchCategory)
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      nodes = nodes.filter(n => {
        const labelMatch = n.label.toLowerCase().includes(q)
        const typeMatch = n.type.toLowerCase().includes(q)
        const descMatch = (n.description || "").toLowerCase().includes(q)
        const propsMatch = n.properties
          ? Object.values(n.properties).some(v => (v as string).toLowerCase().includes(q))
          : false
        return labelMatch || typeMatch || descMatch || propsMatch
      })
    }

    return nodes
  }, [data.nodes, searchCategory, searchQuery])

  useEffect(() => {
    if (searchQuery || searchCategory !== "all") {
      setHighlightedNodes(new Set(filteredNodes.map(n => n.id)))
    } else {
      setHighlightedNodes(new Set())
    }
  }, [filteredNodes, searchQuery, searchCategory])

  const getNodeRadius = useCallback((node: KGNode): number => {
    const connections = nodeConnectionsRef.current.get(node.id) || 0
    const baseSize = 8
    const connectionBonus = Math.min(connections * 1.2, 10)
    return baseSize + connectionBonus
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let w: number
    let h: number

    const updateSize = () => {
      const rect = container.getBoundingClientRect()
      w = rect.width
      h = rect.height
      canvas.width = w
      canvas.height = h
    }
    updateSize()

    if (!initialized) {
      data.nodes.forEach((n, i) => {
        if (!positionsRef.current.has(n.id)) {
          const angle = (i / data.nodes.length) * Math.PI * 2
          const radius = Math.min(w, h) * 0.3
          const x = w / 2 + Math.cos(angle) * radius + (Math.random() - 0.5) * 50
          const y = h / 2 + Math.sin(angle) * radius + (Math.random() - 0.5) * 50
          positionsRef.current.set(n.id, {
            x,
            y,
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 0.5) * 4
          })
        }
      })
      setInitialized(true)
    }
    const positions = positionsRef.current

    let dragging: string | null = null

    const draw = () => {
      ctx.clearRect(0, 0, w, h)

      ctx.fillStyle = "#0a1330"
      ctx.fillRect(0, 0, w, h)

      ctx.strokeStyle = "rgba(30,58,95,0.15)"
      ctx.lineWidth = 1
      const gridSize = 40
      const offsetX = transform.x % gridSize
      const offsetY = transform.y % gridSize
      for (let x = offsetX; x < w; x += gridSize) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, h)
        ctx.stroke()
      }
      for (let y = offsetY; y < h; y += gridSize) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(w, y)
        ctx.stroke()
      }

      ctx.save()
      ctx.translate(transform.x, transform.y)
      ctx.scale(transform.scale, transform.scale)

      const currentHovered = hoveredRef.current

      data.edges.forEach(([from, to, label]) => {
        const p1 = positions.get(from)
        const p2 = positions.get(to)
        if (!p1 || !p2) return

        const isHighlighted = highlightedNodes.has(from) || highlightedNodes.has(to)
        const isSelectedEdge = selectedNodeId === from || selectedNodeId === to

        if (isHighlighted || selectedNodeId) {
          ctx.shadowColor = "#C9A33A"
          ctx.shadowBlur = 4
        }

        ctx.beginPath()
        ctx.moveTo(p1.x, p1.y)
        ctx.lineTo(p2.x, p2.y)
        ctx.strokeStyle = isHighlighted ? "rgba(201,163,58,0.6)" : "rgba(100,116,139,0.2)"
        ctx.lineWidth = isHighlighted ? 1.5 : 1
        ctx.stroke()
        ctx.shadowBlur = 0

        if (isSelectedEdge && label) {
          const midX = (p1.x + p2.x) / 2
          const midY = (p1.y + p2.y) / 2
          ctx.fillStyle = "rgba(201,163,58,0.6)"
          ctx.font = "9px monospace"
          ctx.textAlign = "center"
          ctx.fillText(label, midX, midY - 6)
        }
      })

      data.nodes.forEach(node => {
        const pos = positions.get(node.id)
        if (!pos) return

        const radius = getNodeRadius(node)
        const color = getColor(node.type)
        const isHover = currentHovered === node.id
        const isSel = selectedNodeId === node.id
        const isHighlighted = highlightedNodes.size === 0 || highlightedNodes.has(node.id)
        const isDimmed = highlightedNodes.size > 0 && !isHighlighted

        if (isSel) {
          ctx.shadowColor = color
          ctx.shadowBlur = 25
        } else if (isHover && isHighlighted) {
          ctx.shadowColor = color
          ctx.shadowBlur = 15
        } else if (isHighlighted) {
          ctx.shadowColor = color
          ctx.shadowBlur = 8
        }

        ctx.globalAlpha = isDimmed ? 0.3 : 1

        ctx.beginPath()
        ctx.arc(pos.x, pos.y, radius * (isHover || isSel ? 1.25 : 1), 0, Math.PI * 2)
        ctx.fillStyle = color
        ctx.fill()

        ctx.strokeStyle = isSel ? "#fff" : isHover ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.15)"
        ctx.lineWidth = isSel ? 2.5 : 1
        ctx.stroke()
        ctx.shadowBlur = 0

        if (radius > 10) {
          ctx.beginPath()
          ctx.arc(pos.x - radius * 0.25, pos.y - radius * 0.25, radius * 0.35, 0, Math.PI * 2)
          ctx.fillStyle = "rgba(255,255,255,0.25)"
          ctx.fill()
        }

        ctx.fillStyle = isHover || isSel ? "#fff" : "rgba(226,232,240,0.85)"
        ctx.font = `bold ${Math.max(10, radius * 0.65)}px monospace`
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText(node.label.substring(0, 14), pos.x, pos.y + radius + 10)

        ctx.fillStyle = color
        ctx.font = "8px monospace"
        ctx.fillText(TYPE_LABELS[node.type]?.toUpperCase() || node.type.toUpperCase(), pos.x, pos.y - radius - 8)

        ctx.globalAlpha = 1
      })

      ctx.restore()
    }

    draw()

    const getNodeAt = (mx: number, my: number): string | null => {
      const adjX = (mx - transform.x) / transform.scale
      const adjY = (my - transform.y) / transform.scale
      for (const [id, pos] of positions) {
        const node = data.nodes.find(n => n.id === id)
        if (!node) continue
        const r = getNodeRadius(node) * 1.8
        const dx = adjX - pos.x, dy = adjY - pos.y
        if (dx * dx + dy * dy <= r * r) return id
      }
      return null
    }

    if (interactive) {
      canvas.onmousemove = (e) => {
        const rect = canvas.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top

        if (isDraggingCanvas) {
          setTransform(prev => ({
            ...prev,
            x: prev.x + (x - lastMouse.x),
            y: prev.y + (y - lastMouse.y)
          }))
          setLastMouse({ x, y })
          draw()
          return
        }

        const id = getNodeAt(x, y)
        hoveredRef.current = id
        setHovered(id)
        canvas.style.cursor = id ? "grab" : "grab"
        draw()
      }

      canvas.onmousedown = (e) => {
        const rect = canvas.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        const id = getNodeAt(x, y)
        if (id) {
          dragging = id
          canvas.style.cursor = "grabbing"
        } else {
          setIsDraggingCanvas(true)
          setLastMouse({ x, y })
          canvas.style.cursor = "grabbing"
        }
      }

      canvas.onmouseup = () => {
        dragging = null
        setIsDraggingCanvas(false)
        canvas.style.cursor = "grab"
      }

      canvas.onclick = (e) => {
        const rect = canvas.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        const id = getNodeAt(x, y)
        if (id) {
          const node = data.nodes.find(n => n.id === id)
          if (node && onNodeClick) {
            onNodeClick(node)
          }
        }
      }

      canvas.onwheel = (e) => {
        e.preventDefault()
        const rect = canvas.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        const delta = e.deltaY > 0 ? 0.9 : 1.1

        setTransform(prev => {
          const newScale = Math.max(0.4, Math.min(2.5, prev.scale * delta))
          const scaleChange = newScale / prev.scale
          const newX = x - (x - prev.x) * scaleChange
          const newY = y - (y - prev.y) * scaleChange
          return { x: newX, y: newY, scale: newScale }
        })
        draw()
      }
    }

    const DAMPING = 0.85
    const REPULSION = 4000
    const ATTRACTION = 0.006
    const CENTER_FORCE = 0.003

    const simulate = () => {
      data.nodes.forEach((n1, i) => {
        const p1 = positions.get(n1.id)
        if (!p1) return
        data.nodes.forEach((n2, j) => {
          if (i >= j) return
          const p2 = positions.get(n2.id)
          if (!p2) return
          const dx = p2.x - p1.x
          const dy = p2.y - p1.y
          const dist = Math.sqrt(dx * dx + dy * dy) || 1
          const force = REPULSION / (dist * dist)
          p1.vx -= dx / dist * force
          p1.vy -= dy / dist * force
          p2.vx += dx / dist * force
          p2.vy += dy / dist * force
        })
      })

      data.edges.forEach(([from, to]) => {
        const p1 = positions.get(from)
        const p2 = positions.get(to)
        if (!p1 || !p2) return
        const dx = p2.x - p1.x
        const dy = p2.y - p1.y
        const dist = Math.sqrt(dx * dx + dy * dy) || 1
        const force = dist * ATTRACTION
        p1.vx += dx / dist * force
        p1.vy += dy / dist * force
        p2.vx -= dx / dist * force
        p2.vy -= dy / dist * force
      })

      positions.forEach((pos) => {
        pos.vx -= pos.x * CENTER_FORCE
        pos.vy -= pos.y * CENTER_FORCE
      })

      positions.forEach((pos) => {
        if (dragging) return
        pos.vx *= DAMPING
        pos.vy *= DAMPING
        pos.x += pos.vx
        pos.y += pos.vy
        pos.x = Math.max(25, Math.min(w / transform.scale - 25, pos.x))
        pos.y = Math.max(25, Math.min(h / transform.scale - 25, pos.y))
      })

      draw()
      animRef.current = requestAnimationFrame(simulate)
    }

    if (initialized) {
      animRef.current = requestAnimationFrame(simulate)
    }

    return () => {
      cancelAnimationFrame(animRef.current)
    }
  }, [data, height, interactive, transform, selectedNodeId, getNodeRadius, onNodeClick, highlightedNodes, initialized])

  return (
    <div ref={containerRef} style={{ position: "relative", width, height, background: "var(--site-bg)", border: "1px solid var(--border-warm)" }}>
      <div style={{ position: "absolute", top: 12, left: 12, right: 12, display: "flex", gap: 12, zIndex: 10 }}>
        <input
          type="text"
          placeholder="Search nodes... (dates, people, terms)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            flex: 1,
            background: "var(--surface-0)",
            border: "1px solid var(--border)",
            padding: "10px 14px",
            fontFamily: "var(--font-mono)",
            fontSize: 12,
            color: "var(--cream)",
            outline: "none"
          }}
        />
        <select
          value={searchCategory}
          onChange={(e) => setSearchCategory(e.target.value)}
          style={{
            background: "var(--surface-0)",
            border: "1px solid var(--border)",
            padding: "10px 14px",
            fontFamily: "var(--font-mono)",
            fontSize: 12,
            color: "var(--cream)",
            cursor: "pointer"
          }}
        >
          {SEARCH_CATEGORIES.map(cat => (
            <option key={cat.key} value={cat.key}>{cat.label}</option>
          ))}
        </select>
      </div>

      <canvas ref={canvasRef} style={{ display: "block", width: "100%", height: "100%", cursor: "grab" }} />

      <div style={{
        position: "absolute",
        bottom: 12,
        left: 12,
        display: "flex",
        gap: 8,
        fontFamily: "monospace",
        fontSize: 9,
        color: "rgba(148,163,184,0.6)"
      }}>
        <span>zoom: {Math.round(transform.scale * 100)}%</span>
        <span style={{ color: "rgba(100,116,139,0.4)" }}>·</span>
        <span>scroll to zoom</span>
        <span style={{ color: "rgba(100,116,139,0.4)" }}>·</span>
        <span>drag to pan</span>
        <span style={{ color: "rgba(100,116,139,0.4)" }}>·</span>
        <span>click node for details</span>
      </div>

      {filteredNodes.length > 0 && filteredNodes.length !== data.nodes.length && (
        <div style={{
          position: "absolute",
          top: 54,
          left: 12,
          fontFamily: "monospace",
          fontSize: 10,
          color: "var(--teal)",
          background: "rgba(15,20,30,0.9)",
          padding: "4px 8px",
          borderRadius: 4
        }}>
          {filteredNodes.length} of {data.nodes.length} nodes
        </div>
      )}
    </div>
  )
}