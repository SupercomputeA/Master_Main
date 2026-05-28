"use client"

import { useMemo } from "react"
import { useEntityMap } from "./useEntityMap"
import { TYPE_COLORS } from "./constants"
import type { EntityNode } from "./types"

export default function EntityMapDetailPanel() {
  const { state, selectNode } = useEntityMap()
  const { nodes, edges, selectedNodeId } = state

  const selectedNode = useMemo(
    () => nodes.find(n => n.id === selectedNodeId) ?? null,
    [nodes, selectedNodeId]
  )

  const connections = useMemo(() => {
    if (!selectedNode) return []
    return edges
      .filter(e => e.from === selectedNode.id || e.to === selectedNode.id)
      .map(e => {
        const otherId = e.from === selectedNode.id ? e.to : e.from
        const otherNode = nodes.find(n => n.id === otherId)
        return { edge: e, node: otherNode }
      })
      .filter(c => c.node)
  }, [selectedNode, edges, nodes])

  if (!selectedNode) return null

  const color = TYPE_COLORS[selectedNode.type] || TYPE_COLORS.default

  return (
    <div style={{
      background: "var(--surface)",
      border: "1px solid var(--border)",
      padding: "20px 24px",
      display: "flex",
      flexDirection: "column",
      gap: 16,
      maxHeight: "100%",
      overflowY: "auto",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: color }} />
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            {selectedNode.type}
          </span>
        </div>
        <button
          onClick={() => selectNode(null)}
          style={{
            fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--muted)",
            background: "transparent", border: "1px solid var(--border)",
            padding: "3px 10px", cursor: "pointer",
          }}
        >
          Close
        </button>
      </div>

      <h3 style={{ fontFamily: "var(--font-display)", fontSize: 20, color: "var(--accent)", margin: 0 }}>
        {selectedNode.label}
      </h3>

      {selectedNode.type === "term" && selectedNode.definition && (
        <div style={{ background: "var(--bg)", border: "1px solid var(--border)", padding: "12px 16px" }}>
          <div className="label-sm" style={{ marginBottom: 6, color: color }}>// definition</div>
          <p style={{ fontFamily: "var(--font-m)", fontSize: 13, color: "var(--fg)", lineHeight: 1.6, margin: 0 }}>
            {selectedNode.definition}
          </p>
        </div>
      )}

      {selectedNode.type === "image" && selectedNode.src && (
        <div>
          <img
            src={selectedNode.src}
            alt={selectedNode.alt || selectedNode.label}
            style={{ width: "100%", borderRadius: 4, border: "1px solid var(--border)" }}
          />
          {selectedNode.alt && (
            <p style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--muted)", marginTop: 6 }}>
              {selectedNode.alt}
            </p>
          )}
        </div>
      )}

      {(selectedNode.type === "date" || selectedNode.type === "event") && selectedNode.datetime && (
        <div style={{ display: "flex", gap: 12 }}>
          <div>
            <div className="label-sm" style={{ marginBottom: 4, color: color }}>// date</div>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--fg)" }}>
              {new Date(selectedNode.datetime).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </span>
          </div>
          {selectedNode.location && (
            <div>
              <div className="label-sm" style={{ marginBottom: 4, color: color }}>// location</div>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--fg)" }}>
                {selectedNode.location}
              </span>
            </div>
          )}
        </div>
      )}

      {selectedNode.description && (
        <p style={{ fontFamily: "var(--font-m)", fontSize: 13, color: "var(--fg)", lineHeight: 1.6, margin: 0 }}>
          {selectedNode.description}
        </p>
      )}

      {selectedNode.properties && Object.keys(selectedNode.properties).length > 0 && (
        <div style={{ borderTop: "1px solid var(--border)", paddingTop: 12 }}>
          <div className="label-sm" style={{ marginBottom: 8, color: "var(--accent)" }}>// properties</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {Object.entries(selectedNode.properties).map(([key, value]) => (
              <div key={key} style={{ display: "flex", justifyContent: "space-between", fontFamily: "var(--font-mono)", fontSize: 11 }}>
                <span style={{ color: "var(--muted)" }}>{key}</span>
                <span style={{ color: "var(--fg)" }}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {connections.length > 0 && (
        <div style={{ borderTop: "1px solid var(--border)", paddingTop: 12 }}>
          <div className="label-sm" style={{ marginBottom: 8, color: "var(--accent)" }}>// connections</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {connections.map((c, i) => (
              <button
                key={i}
                onClick={() => selectNode(c.node!.id)}
                style={{
                  fontFamily: "var(--font-mono)", fontSize: 10,
                  color: "var(--teal)", background: "var(--bg)",
                  border: "1px solid var(--border)", padding: "4px 8px",
                  cursor: "pointer",
                }}
              >
                {c.node!.label} ({c.edge.label})
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
