import type { EntityNode, Transform, PhysicsBody, NodeShape } from "./types"
import { TYPE_SHAPES, TYPE_COLORS, BASE_NODE_RADIUS, MAX_CONNECTION_BONUS, CONNECTION_RADIUS_FACTOR } from "./constants"

export function getNodeRadius(node: EntityNode, connectionCount: number): number {
  const bonus = Math.min(connectionCount * CONNECTION_RADIUS_FACTOR, MAX_CONNECTION_BONUS)
  return BASE_NODE_RADIUS + bonus
}

export function screenToWorld(sx: number, sy: number, t: Transform): { x: number; y: number } {
  return { x: (sx - t.x) / t.scale, y: (sy - t.y) / t.scale }
}

export function worldToScreen(wx: number, wy: number, t: Transform): { x: number; y: number } {
  return { x: wx * t.scale + t.x, y: wy * t.scale + t.y }
}

export function getNodeAt(
  mx: number,
  my: number,
  nodes: EntityNode[],
  positions: Map<string, PhysicsBody>,
  transform: Transform,
  connectionCounts: Map<string, number>
): EntityNode | null {
  const world = screenToWorld(mx, my, transform)
  for (let i = nodes.length - 1; i >= 0; i--) {
    const node = nodes[i]
    const pos = positions.get(node.id)
    if (!pos) continue
    const r = getNodeRadius(node, connectionCounts.get(node.id) || 0)
    const dx = world.x - pos.x
    const dy = world.y - pos.y
    if (dx * dx + dy * dy <= r * r * 1.5) return node
  }
  return null
}

export function getColor(type: string): string {
  return TYPE_COLORS[type] ?? TYPE_COLORS.default
}

export function getShape(type: string): NodeShape {
  return TYPE_SHAPES[type] ?? TYPE_SHAPES.default
}

export function drawNodeShape(
  ctx: CanvasRenderingContext2D,
  shape: NodeShape,
  x: number,
  y: number,
  r: number,
  fill: string,
  stroke: string | null,
  alpha: number
) {
  ctx.save()
  ctx.globalAlpha = alpha

  ctx.fillStyle = fill
  if (stroke) {
    ctx.strokeStyle = stroke
    ctx.lineWidth = 2
  }

  ctx.beginPath()

  switch (shape) {
    case "circle":
      ctx.arc(x, y, r, 0, Math.PI * 2)
      break

    case "diamond": {
      const s = r * 1.3
      ctx.moveTo(x, y - s)
      ctx.lineTo(x + s, y)
      ctx.lineTo(x, y + s)
      ctx.lineTo(x - s, y)
      ctx.closePath()
      break
    }

    case "hexagon": {
      const s = r * 1.2
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - Math.PI / 6
        const px = x + s * Math.cos(angle)
        const py = y + s * Math.sin(angle)
        if (i === 0) ctx.moveTo(px, py)
        else ctx.lineTo(px, py)
      }
      ctx.closePath()
      break
    }

    case "roundedRect": {
      const w = r * 2.4
      const h = r * 1.6
      const cr = 4
      const lx = x - w / 2
      const ly = y - h / 2
      ctx.moveTo(lx + cr, ly)
      ctx.lineTo(lx + w - cr, ly)
      ctx.quadraticCurveTo(lx + w, ly, lx + w, ly + cr)
      ctx.lineTo(lx + w, ly + h - cr)
      ctx.quadraticCurveTo(lx + w, ly + h, lx + w - cr, ly + h)
      ctx.lineTo(lx + cr, ly + h)
      ctx.quadraticCurveTo(lx, ly + h, lx, ly + h - cr)
      ctx.lineTo(lx, ly + cr)
      ctx.quadraticCurveTo(lx, ly, lx + cr, ly)
      ctx.closePath()
      break
    }

    case "arrow": {
      const s = r * 1.3
      ctx.moveTo(x + s, y)
      ctx.lineTo(x - s * 0.5, y - s * 0.8)
      ctx.lineTo(x - s * 0.2, y)
      ctx.lineTo(x - s * 0.5, y + s * 0.8)
      ctx.closePath()
      break
    }

    case "square": {
      const s = r * 1.2
      ctx.rect(x - s, y - s, s * 2, s * 2)
      break
    }
  }

  ctx.fill()
  if (stroke) ctx.stroke()

  ctx.restore()
}

export function interpolatePath(
  positions: Map<string, PhysicsBody>,
  pathIds: string[],
  progress: number
): { x: number; y: number; currentIndex: number } | null {
  if (pathIds.length < 2) return null

  const totalSegments = pathIds.length - 1
  const rawIndex = progress * totalSegments
  const segmentIndex = Math.min(Math.floor(rawIndex), totalSegments - 1)
  const segmentProgress = rawIndex - segmentIndex

  const fromPos = positions.get(pathIds[segmentIndex])
  const toPos = positions.get(pathIds[segmentIndex + 1])
  if (!fromPos || !toPos) return null

  return {
    x: fromPos.x + (toPos.x - fromPos.x) * segmentProgress,
    y: fromPos.y + (toPos.y - fromPos.y) * segmentProgress,
    currentIndex: segmentIndex,
  }
}

export function getNodesInTimeRange(
  nodes: EntityNode[],
  start: Date,
  end: Date
): Set<string> {
  const ids = new Set<string>()
  for (const node of nodes) {
    if (!node.datetime) continue
    const d = new Date(node.datetime)
    if (d >= start && d <= end) ids.add(node.id)
  }
  return ids
}

export function getTemporalNodes(nodes: EntityNode[]): EntityNode[] {
  return nodes.filter(n => n.datetime && (n.type === "date" || n.type === "event"))
}

export function drawLegend(
  ctx: CanvasRenderingContext2D,
  activeTypes: Set<string>,
  canvasWidth: number
) {
  const types = Array.from(activeTypes).sort()
  if (types.length === 0) return

  const padding = 12
  const itemHeight = 18
  const legendWidth = 130
  const legendHeight = padding * 2 + types.length * itemHeight
  const lx = canvasWidth - legendWidth - 16
  const ly = 16

  ctx.save()
  ctx.globalAlpha = 0.85
  ctx.fillStyle = "#0a192f"
  ctx.strokeStyle = "rgba(255,255,255,0.08)"
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.roundRect(lx, ly, legendWidth, legendHeight, 6)
  ctx.fill()
  ctx.stroke()
  ctx.globalAlpha = 1

  ctx.font = "9px 'JetBrains Mono', monospace"
  ctx.fillStyle = "#d4af37"
  ctx.fillText("// LEGEND", lx + padding, ly + padding + 6)

  types.forEach((type, i) => {
    const iy = ly + padding + 20 + i * itemHeight
    const color = TYPE_COLORS[type] ?? TYPE_COLORS.default
    const shape = TYPE_SHAPES[type] ?? "circle"

    drawNodeShape(ctx, shape, lx + padding + 5, iy, 5, color, null, 1)

    ctx.fillStyle = "rgba(255,255,255,0.7)"
    ctx.font = "10px 'JetBrains Mono', monospace"
    ctx.fillText(
      (type.charAt(0).toUpperCase() + type.slice(1)),
      lx + padding + 16,
      iy + 3.5
    )
  })

  ctx.restore()
}
