import { useRef, useEffect, useCallback } from "react"
import type { EntityNode, EntityEdge, PhysicsBody, GravityConfig } from "./types"
import { DEFAULT_GRAVITY } from "./constants"

export function usePhysicsEngine(
  nodes: EntityNode[],
  edges: EntityEdge[],
  canvasWidth: number,
  canvasHeight: number,
  gravity?: GravityConfig
) {
  const positions = useRef<Map<string, PhysicsBody>>(new Map())
  const connectionCounts = useRef<Map<string, number>>(new Map())
  const initialized = useRef(false)

  const config = {
    damping: gravity?.damping ?? DEFAULT_GRAVITY.damping,
    repulsion: gravity?.repulsion ?? DEFAULT_GRAVITY.repulsion,
    attraction: gravity?.attraction ?? DEFAULT_GRAVITY.attraction,
    centerForce: gravity?.centerForce ?? DEFAULT_GRAVITY.centerForce,
    edgeWeightMultiplier: gravity?.edgeWeightMultiplier ?? DEFAULT_GRAVITY.edgeWeightMultiplier,
  }

  useEffect(() => {
    const counts = new Map<string, number>()
    nodes.forEach(n => counts.set(n.id, 0))
    edges.forEach(e => {
      counts.set(e.from, (counts.get(e.from) || 0) + 1)
      counts.set(e.to, (counts.get(e.to) || 0) + 1)
    })
    connectionCounts.current = counts
  }, [nodes, edges])

  const initialize = useCallback((w: number, h: number) => {
    if (initialized.current && positions.current.size === nodes.length) return
    nodes.forEach((n, i) => {
      if (positions.current.has(n.id)) return
      const angle = (i / nodes.length) * Math.PI * 2
      const radius = Math.min(w, h) * 0.3
      positions.current.set(n.id, {
        x: w / 2 + Math.cos(angle) * radius + (Math.random() - 0.5) * 50,
        y: h / 2 + Math.sin(angle) * radius + (Math.random() - 0.5) * 50,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
      })
    })
    initialized.current = true
  }, [nodes])

  const step = useCallback((w: number, h: number) => {
    const pos = positions.current
    const cx = w / 2
    const cy = h / 2

    const nodeList = nodes.map(n => ({ id: n.id, body: pos.get(n.id)! })).filter(n => n.body)

    for (let i = 0; i < nodeList.length; i++) {
      for (let j = i + 1; j < nodeList.length; j++) {
        const a = nodeList[i].body
        const b = nodeList[j].body
        const dx = b.x - a.x
        const dy = b.y - a.y
        const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 1)
        const force = config.repulsion / (dist * dist)
        const fx = (dx / dist) * force
        const fy = (dy / dist) * force
        a.vx -= fx
        a.vy -= fy
        b.vx += fx
        b.vy += fy
      }
    }

    for (const edge of edges) {
      const a = pos.get(edge.from)
      const b = pos.get(edge.to)
      if (!a || !b) continue
      const dx = b.x - a.x
      const dy = b.y - a.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      const weight = edge.weight ?? 1
      const force = dist * config.attraction * weight * config.edgeWeightMultiplier
      const fx = (dx / Math.max(dist, 1)) * force
      const fy = (dy / Math.max(dist, 1)) * force
      a.vx += fx
      a.vy += fy
      b.vx -= fx
      b.vy -= fy
    }

    for (const { body } of nodeList) {
      body.vx += (cx - body.x) * config.centerForce
      body.vy += (cy - body.y) * config.centerForce
      body.vx *= config.damping
      body.vy *= config.damping
      body.x += body.vx
      body.y += body.vy
    }
  }, [nodes, edges, config])

  const reset = useCallback(() => {
    positions.current.clear()
    initialized.current = false
  }, [])

  return {
    positions: positions.current,
    connectionCounts: connectionCounts.current,
    initialize,
    step,
    reset,
  }
}
