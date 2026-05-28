"use client"

import { useMemo, useRef, useCallback, useEffect, useState } from "react"
import { useEntityMap } from "./useEntityMap"
import { TYPE_COLORS } from "./constants"
import { getTemporalNodes } from "./utils"
import type { EntityNode } from "./types"

export default function EntityMapTimeline() {
  const { state, selectNode, dispatch } = useEntityMap()
  const { nodes } = state
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const temporalNodes = useMemo(() => {
    return getTemporalNodes(nodes)
      .map(n => ({ ...n, date: new Date(n.datetime!) }))
      .sort((a, b) => a.date.getTime() - b.date.getTime())
  }, [nodes])

  const timeRange = useMemo(() => {
    if (temporalNodes.length < 2) return null
    const min = temporalNodes[0].date.getTime()
    const max = temporalNodes[temporalNodes.length - 1].date.getTime()
    const padding = (max - min) * 0.1 || 86400000
    return { min: min - padding, max: max + padding, span: max - min + padding * 2 }
  }, [temporalNodes])

  if (!timeRange || temporalNodes.length < 2) return null

  const getPosition = (date: Date) => {
    return ((date.getTime() - timeRange.min) / timeRange.span) * 100
  }

  const formatDate = (d: Date) => {
    const span = timeRange.span
    if (span > 365 * 86400000) return d.getFullYear().toString()
    if (span > 30 * 86400000) return d.toLocaleDateString("en-US", { month: "short", year: "numeric" })
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  const ticks = useMemo(() => {
    const count = Math.min(8, temporalNodes.length + 2)
    const result = []
    for (let i = 0; i <= count; i++) {
      const t = timeRange.min + (timeRange.span * i) / count
      result.push(new Date(t))
    }
    return result
  }, [timeRange, temporalNodes.length])

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        height: 60,
        background: "var(--surface)",
        borderTop: "1px solid var(--border)",
        padding: "8px 24px 0",
        userSelect: "none",
      }}
    >
      <div className="label-sm" style={{ color: "var(--accent)", marginBottom: 4, fontSize: 8 }}>
        // timeline
      </div>

      <div style={{ position: "relative", height: 32 }}>
        <div style={{
          position: "absolute",
          top: 14,
          left: 0,
          right: 0,
          height: 1,
          background: "var(--border)",
        }} />

        {ticks.map((t, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${getPosition(t)}%`,
              top: 10,
              transform: "translateX(-50%)",
            }}
          >
            <div style={{ width: 1, height: 8, background: "rgba(255,255,255,0.15)", marginBottom: 2 }} />
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: "var(--muted)", whiteSpace: "nowrap" }}>
              {formatDate(t)}
            </span>
          </div>
        ))}

        {temporalNodes.map(node => {
          const pos = getPosition(node.date)
          const color = TYPE_COLORS[node.type] || TYPE_COLORS.default
          const isSelected = state.selectedNodeId === node.id
          return (
            <button
              key={node.id}
              onClick={() => selectNode(node.id)}
              title={`${node.label} — ${formatDate(node.date)}`}
              style={{
                position: "absolute",
                left: `${pos}%`,
                top: 8,
                width: isSelected ? 12 : 8,
                height: isSelected ? 12 : 8,
                borderRadius: "50%",
                background: color,
                border: isSelected ? "2px solid #fff" : "1px solid rgba(255,255,255,0.3)",
                transform: "translateX(-50%)",
                cursor: "pointer",
                zIndex: isSelected ? 2 : 1,
                padding: 0,
                boxShadow: isSelected ? `0 0 8px ${color}` : "none",
              }}
            />
          )
        })}
      </div>
    </div>
  )
}
