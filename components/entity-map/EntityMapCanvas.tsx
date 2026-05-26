"use client"

import { useEffect, useRef, useCallback } from "react"
import { useEntityMap } from "./useEntityMap"
import { usePhysicsEngine } from "./usePhysicsEngine"
import type { EntityNode, PhysicsBody } from "./types"
import { GRID_SIZE } from "./constants"
import {
  getNodeRadius,
  getColor,
  getShape,
  drawNodeShape,
  drawLegend,
  interpolatePath,
  getNodeAt,
} from "./utils"
import { TYPE_LABELS } from "./constants"

export default function EntityMapCanvas({
  height = 520,
  interactive = true,
}: {
  height?: number | string
  interactive?: boolean
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const animRef = useRef<number>(0)
  const hoveredRef = useRef<string | null>(null)
  const draggingNodeRef = useRef<string | null>(null)
  const isDraggingCanvasRef = useRef(false)
  const lastMouseRef = useRef({ x: 0, y: 0 })
  const dashOffsetRef = useRef(0)
  const touchesRef = useRef<{ id: number; x: number; y: number }[]>([])
  const lastPinchDistRef = useRef<number | null>(null)

  const { state, dispatch, selectNode, hoverNode } = useEntityMap()
  const {
    nodes, edges, selectedNodeId, hoveredNodeId,
    highlightedNodeIds, transform, activePath, pathProgress,
    isPathPlaying, activeFilters, searchQuery,
  } = state

  const { positions, connectionCounts, initialize, step } = usePhysicsEngine(
    nodes,
    edges,
    typeof window !== "undefined" ? window.innerWidth : 800,
    typeof height === "number" ? height : 520
  )

  const filteredNodeIds = useCallback((): Set<string> => {
    let filtered = nodes

    if (activeFilters.size > 0) {
      filtered = filtered.filter(n => activeFilters.has(n.type))
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter(n => {
        const label = n.label.toLowerCase().includes(q)
        const type = n.type.toLowerCase().includes(q)
        const desc = (n.description || "").toLowerCase().includes(q)
        const def = (n.definition || "").toLowerCase().includes(q)
        const props = n.properties
          ? Object.values(n.properties).some(v => v.toLowerCase().includes(q))
          : false
        return label || type || desc || def || props
      })
    }

    if (filtered.length === nodes.length && activeFilters.size === 0 && !searchQuery.trim()) {
      return new Set()
    }
    return new Set(filtered.map(n => n.id))
  }, [nodes, activeFilters, searchQuery])

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const updateSize = () => {
      const rect = container.getBoundingClientRect()
      canvas.width = rect.width
      canvas.height = rect.height
      return { w: rect.width, h: rect.height }
    }
    const { w, h } = updateSize()

    initialize(w, h)

    const highlighted = filteredNodeIds()
    const activeTypes = new Set(nodes.map(n => n.type))

    const draw = () => {
      ctx.clearRect(0, 0, w, h)
      ctx.fillStyle = "#0a0f17"
      ctx.fillRect(0, 0, w, h)

      ctx.strokeStyle = "rgba(100,116,139,0.08)"
      ctx.lineWidth = 1
      const offsetX = transform.x % GRID_SIZE
      const offsetY = transform.y % GRID_SIZE
      for (let x = offsetX; x < w; x += GRID_SIZE) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, h)
        ctx.stroke()
      }
      for (let y = offsetY; y < h; y += GRID_SIZE) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(w, y)
        ctx.stroke()
      }

      ctx.save()
      ctx.translate(transform.x, transform.y)
      ctx.scale(transform.scale, transform.scale)

      const pathSet = activePath ? new Set(activePath) : null
      const pathEdgeSet = new Set<string>()
      if (activePath) {
        for (let i = 0; i < activePath.length - 1; i++) {
          pathEdgeSet.add(`${activePath[i]}->${activePath[i + 1]}`)
          pathEdgeSet.add(`${activePath[i + 1]}->${activePath[i]}`)
        }
      }

      edges.forEach(edge => {
        const p1 = positions.get(edge.from)
        const p2 = positions.get(edge.to)
        if (!p1 || !p2) return

        const isPathEdge = pathEdgeSet.has(`${edge.from}->${edge.to}`) || pathEdgeSet.has(`${edge.to}->${edge.from}`)
        const isHighlighted = highlighted.size === 0 || highlighted.has(edge.from) || highlighted.has(edge.to)
        const isSelectedEdge = selectedNodeId === edge.from || selectedNodeId === edge.to

        if (pathSet && !isPathEdge) {
          ctx.globalAlpha = 0.1
        } else {
          ctx.globalAlpha = 1
        }

        if (isPathEdge) {
          ctx.save()
          ctx.setLineDash([6, 4])
          ctx.lineDashOffset = -dashOffsetRef.current
          ctx.strokeStyle = "#d4af37"
          ctx.lineWidth = 2.5
          ctx.beginPath()
          ctx.moveTo(p1.x, p1.y)
          ctx.lineTo(p2.x, p2.y)
          ctx.stroke()
          ctx.restore()
        } else {
          if (isSelectedEdge) {
            ctx.shadowColor = "#C9A33A"
            ctx.shadowBlur = 4
          }
          ctx.beginPath()
          ctx.moveTo(p1.x, p1.y)
          ctx.lineTo(p2.x, p2.y)
          ctx.strokeStyle = isHighlighted && highlighted.size > 0 ? "rgba(201,163,58,0.6)" : "rgba(100,116,139,0.2)"
          ctx.lineWidth = isHighlighted && highlighted.size > 0 ? 1.5 : 1
          ctx.stroke()
          ctx.shadowBlur = 0
        }

        ctx.globalAlpha = 1

        if (isSelectedEdge && edge.label) {
          const midX = (p1.x + p2.x) / 2
          const midY = (p1.y + p2.y) / 2
          ctx.fillStyle = "rgba(201,163,58,0.6)"
          ctx.font = "9px monospace"
          ctx.textAlign = "center"
          ctx.fillText(edge.label, midX, midY - 6)
        }
      })

      nodes.forEach(node => {
        const pos = positions.get(node.id)
        if (!pos) return

        const conns = connectionCounts.get(node.id) || 0
        const radius = getNodeRadius(node, conns)
        const color = getColor(node.type)
        const shape = getShape(node.type)
        const isHover = hoveredRef.current === node.id
        const isSel = selectedNodeId === node.id
        const isInHighlight = highlighted.size === 0 || highlighted.has(node.id)
        const isDimmed = highlighted.size > 0 && !isInHighlight
        const isInPath = pathSet ? pathSet.has(node.id) : true

        if (pathSet && !isInPath) {
          ctx.globalAlpha = 0.15
        } else if (isDimmed) {
          ctx.globalAlpha = 0.3
        } else {
          ctx.globalAlpha = 1
        }

        if (isSel) {
          ctx.shadowColor = color
          ctx.shadowBlur = 25
        } else if (isHover && isInHighlight) {
          ctx.shadowColor = color
          ctx.shadowBlur = 15
        } else if (isInHighlight && highlighted.size > 0) {
          ctx.shadowColor = color
          ctx.shadowBlur = 8
        }

        const r = radius * (isHover || isSel ? 1.25 : 1)
        const strokeColor = isSel ? "#fff" : isHover ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.15)"

        drawNodeShape(ctx, shape, pos.x, pos.y, r, color, strokeColor, ctx.globalAlpha)

        ctx.shadowBlur = 0

        ctx.fillStyle = isHover || isSel ? "#fff" : "rgba(226,232,240,0.85)"
        ctx.font = `bold ${Math.max(10, radius * 0.65)}px monospace`
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText(node.label.substring(0, 14), pos.x, pos.y + r + 10)

        ctx.fillStyle = color
        ctx.font = "8px monospace"
        ctx.fillText(
          (TYPE_LABELS[node.type] || node.type).toUpperCase(),
          pos.x,
          pos.y - r - 8
        )

        ctx.globalAlpha = 1
      })

      if (activePath && activePath.length >= 2) {
        const cursor = interpolatePath(positions, activePath, pathProgress)
        if (cursor) {
          ctx.beginPath()
          ctx.arc(cursor.x, cursor.y, 6, 0, Math.PI * 2)
          ctx.fillStyle = "#d4af37"
          ctx.fill()
          ctx.strokeStyle = "#fff"
          ctx.lineWidth = 2
          ctx.stroke()

          ctx.beginPath()
          ctx.arc(cursor.x, cursor.y, 12, 0, Math.PI * 2)
          ctx.strokeStyle = "rgba(212,175,55,0.4)"
          ctx.lineWidth = 1
          ctx.stroke()
        }
      }

      ctx.restore()

      drawLegend(ctx, activeTypes, w)

      if (highlighted.size > 0) {
        ctx.fillStyle = "rgba(26,83,92,0.9)"
        ctx.font = "10px monospace"
        ctx.textAlign = "left"
        ctx.fillText(`${highlighted.size} of ${nodes.length} nodes`, 12, 54)
      }
    }

    const simulate = () => {
      step(w, h)
      if (isPathPlaying) {
        dashOffsetRef.current += 0.8
      }
      draw()
      animRef.current = requestAnimationFrame(simulate)
    }

    animRef.current = requestAnimationFrame(simulate)

    if (!interactive) return () => cancelAnimationFrame(animRef.current)

    const hitTest = (mx: number, my: number): EntityNode | null => {
      return getNodeAt(mx, my, nodes, positions, transform, connectionCounts)
    }

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      if (isDraggingCanvasRef.current) {
        const dx = x - lastMouseRef.current.x
        const dy = y - lastMouseRef.current.y
        dispatch({ type: "SET_TRANSFORM", transform: { x: transform.x + dx, y: transform.y + dy, scale: transform.scale } })
        lastMouseRef.current = { x, y }
        return
      }

      if (draggingNodeRef.current) {
        const worldX = (x - transform.x) / transform.scale
        const worldY = (y - transform.y) / transform.scale
        const body = positions.get(draggingNodeRef.current)
        if (body) {
          body.x = worldX
          body.y = worldY
          body.vx = 0
          body.vy = 0
        }
        return
      }

      const node = hitTest(x, y)
      hoveredRef.current = node?.id ?? null
      hoverNode(node?.id ?? null)
      canvas.style.cursor = node ? "pointer" : "grab"
    }

    const onMouseDown = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const node = hitTest(x, y)
      if (node) {
        draggingNodeRef.current = node.id
        canvas.style.cursor = "grabbing"
      } else {
        isDraggingCanvasRef.current = true
        lastMouseRef.current = { x, y }
        canvas.style.cursor = "grabbing"
      }
    }

    const onMouseUp = () => {
      draggingNodeRef.current = null
      isDraggingCanvasRef.current = false
      canvas.style.cursor = "grab"
    }

    const onClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const node = hitTest(x, y)
      selectNode(node?.id ?? null)
    }

    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const delta = e.deltaY > 0 ? 0.9 : 1.1
      const newScale = Math.max(0.4, Math.min(2.5, transform.scale * delta))
      const scaleChange = newScale / transform.scale
      dispatch({
        type: "SET_TRANSFORM",
        transform: {
          x: x - (x - transform.x) * scaleChange,
          y: y - (y - transform.y) * scaleChange,
          scale: newScale,
        },
      })
    }

    const onTouchStart = (e: TouchEvent) => {
      e.preventDefault()
      const touches = Array.from(e.touches).map(t => {
        const rect = canvas.getBoundingClientRect()
        return { id: t.identifier, x: t.clientX - rect.left, y: t.clientY - rect.top }
      })
      touchesRef.current = touches

      if (touches.length === 1) {
        const node = hitTest(touches[0].x, touches[0].y)
        if (node) {
          draggingNodeRef.current = node.id
        } else {
          isDraggingCanvasRef.current = true
          lastMouseRef.current = { x: touches[0].x, y: touches[0].y }
        }
      } else if (touches.length === 2) {
        const dx = touches[1].x - touches[0].x
        const dy = touches[1].y - touches[0].y
        lastPinchDistRef.current = Math.sqrt(dx * dx + dy * dy)
      }
    }

    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault()
      const touches = Array.from(e.touches).map(t => {
        const rect = canvas.getBoundingClientRect()
        return { id: t.identifier, x: t.clientX - rect.left, y: t.clientY - rect.top }
      })

      if (touches.length === 1 && isDraggingCanvasRef.current) {
        const dx = touches[0].x - lastMouseRef.current.x
        const dy = touches[0].y - lastMouseRef.current.y
        dispatch({ type: "SET_TRANSFORM", transform: { x: transform.x + dx, y: transform.y + dy, scale: transform.scale } })
        lastMouseRef.current = { x: touches[0].x, y: touches[0].y }
      } else if (touches.length === 1 && draggingNodeRef.current) {
        const worldX = (touches[0].x - transform.x) / transform.scale
        const worldY = (touches[0].y - transform.y) / transform.scale
        const body = positions.get(draggingNodeRef.current)
        if (body) {
          body.x = worldX
          body.y = worldY
          body.vx = 0
          body.vy = 0
        }
      } else if (touches.length === 2 && lastPinchDistRef.current !== null) {
        const dx = touches[1].x - touches[0].x
        const dy = touches[1].y - touches[0].y
        const dist = Math.sqrt(dx * dx + dy * dy)
        const delta = dist / lastPinchDistRef.current
        const cx = (touches[0].x + touches[1].x) / 2
        const cy = (touches[0].y + touches[1].y) / 2

        const newScale = Math.max(0.4, Math.min(2.5, transform.scale * delta))
        const scaleChange = newScale / transform.scale
        dispatch({
          type: "SET_TRANSFORM",
          transform: {
            x: cx - (cx - transform.x) * scaleChange,
            y: cy - (cy - transform.y) * scaleChange,
            scale: newScale,
          },
        })
        lastPinchDistRef.current = dist
      }

      touchesRef.current = touches
    }

    const onTouchEnd = (e: TouchEvent) => {
      if (e.touches.length === 0) {
        if (draggingNodeRef.current === null && !isDraggingCanvasRef.current && touchesRef.current.length === 1) {
          const t = touchesRef.current[0]
          const node = hitTest(t.x, t.y)
          selectNode(node?.id ?? null)
        }
        draggingNodeRef.current = null
        isDraggingCanvasRef.current = false
        lastPinchDistRef.current = null
      }
      touchesRef.current = Array.from(e.touches).map(t => {
        const rect = canvas.getBoundingClientRect()
        return { id: t.identifier, x: t.clientX - rect.left, y: t.clientY - rect.top }
      })
    }

    canvas.addEventListener("mousemove", onMouseMove)
    canvas.addEventListener("mousedown", onMouseDown)
    canvas.addEventListener("mouseup", onMouseUp)
    canvas.addEventListener("click", onClick)
    canvas.addEventListener("wheel", onWheel, { passive: false })
    canvas.addEventListener("touchstart", onTouchStart, { passive: false })
    canvas.addEventListener("touchmove", onTouchMove, { passive: false })
    canvas.addEventListener("touchend", onTouchEnd)

    const onResize = () => updateSize()
    window.addEventListener("resize", onResize)

    return () => {
      cancelAnimationFrame(animRef.current)
      canvas.removeEventListener("mousemove", onMouseMove)
      canvas.removeEventListener("mousedown", onMouseDown)
      canvas.removeEventListener("mouseup", onMouseUp)
      canvas.removeEventListener("click", onClick)
      canvas.removeEventListener("wheel", onWheel)
      canvas.removeEventListener("touchstart", onTouchStart)
      canvas.removeEventListener("touchmove", onTouchMove)
      canvas.removeEventListener("touchend", onTouchEnd)
      window.removeEventListener("resize", onResize)
    }
  }, [nodes, edges, transform, selectedNodeId, highlightedNodeIds, activePath, pathProgress, isPathPlaying, activeFilters, searchQuery, height, interactive])

  return (
    <div ref={containerRef} style={{ position: "relative", width: "100%", height, background: "#0a0f17" }}>
      <canvas
        ref={canvasRef}
        style={{ display: "block", width: "100%", height: "100%", cursor: "grab", touchAction: "none" }}
      />
    </div>
  )
}
