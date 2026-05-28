"use client"

import { useMemo } from "react"
import { useEntityMap } from "./useEntityMap"
import { TYPE_COLORS } from "./constants"

export default function EntityMapNarrative() {
  const { state, narrativeNext, narrativePrev, stopNarrative, startNarrative } = useEntityMap()
  const { narratives, activeNarrativeId, narrativeStep, nodes } = state

  const activeNarrative = useMemo(
    () => narratives.find(n => n.id === activeNarrativeId),
    [narratives, activeNarrativeId]
  )

  if (narratives.length === 0) return null

  if (!activeNarrative) {
    return (
      <div style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        padding: "16px 20px",
      }}>
        <div className="label-sm" style={{ color: "var(--accent)", marginBottom: 12 }}>// narratives</div>
        {narratives.map(n => (
          <button
            key={n.id}
            onClick={() => startNarrative(n.id)}
            style={{
              display: "block",
              width: "100%",
              textAlign: "left",
              background: "var(--bg)",
              border: "1px solid var(--border)",
              padding: "10px 14px",
              marginBottom: 6,
              cursor: "pointer",
            }}
          >
            <div style={{ fontFamily: "var(--font-display)", fontSize: 14, color: "var(--accent)" }}>
              {n.title}
            </div>
            {n.description && (
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--muted)", marginTop: 4 }}>
                {n.description} — {n.steps.length} steps
              </div>
            )}
          </button>
        ))}
      </div>
    )
  }

  const currentNodeId = activeNarrative.steps[narrativeStep]
  const currentNode = nodes.find(n => n.id === currentNodeId)
  const isFirst = narrativeStep === 0
  const isLast = narrativeStep === activeNarrative.steps.length - 1
  const color = currentNode ? TYPE_COLORS[currentNode.type] || TYPE_COLORS.default : "var(--muted)"

  return (
    <div style={{
      background: "var(--surface)",
      border: "1px solid var(--border)",
      padding: "20px 24px",
      display: "flex",
      flexDirection: "column",
      gap: 16,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div className="label-sm" style={{ color: "var(--accent)" }}>// narrative</div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 16, color: "var(--accent)", marginTop: 4 }}>
            {activeNarrative.title}
          </div>
        </div>
        <button
          onClick={stopNarrative}
          style={{
            fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--muted)",
            background: "transparent", border: "1px solid var(--border)",
            padding: "4px 10px", cursor: "pointer",
          }}
        >
          Exit
        </button>
      </div>

      <div style={{
        display: "flex",
        gap: 4,
      }}>
        {activeNarrative.steps.map((_, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 3,
              background: i <= narrativeStep ? "var(--accent)" : "var(--border)",
              transition: "background 0.2s",
            }}
          />
        ))}
      </div>

      <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--muted)" }}>
        Step {narrativeStep + 1} of {activeNarrative.steps.length}
      </div>

      {currentNode && (
        <div style={{ background: "var(--bg)", border: "1px solid var(--border)", padding: "14px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: color }} />
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--muted)", textTransform: "uppercase" }}>
              {currentNode.type}
            </span>
          </div>
          <h4 style={{ fontFamily: "var(--font-display)", fontSize: 16, color: color, margin: "0 0 8px" }}>
            {currentNode.label}
          </h4>
          {currentNode.description && (
            <p style={{ fontFamily: "var(--font-m)", fontSize: 12, color: "var(--fg)", lineHeight: 1.6, margin: 0 }}>
              {currentNode.description}
            </p>
          )}
          {currentNode.prompt && (
            <div style={{
              marginTop: 12,
              padding: "10px 14px",
              background: "var(--surface)",
              borderLeft: `3px solid ${color}`,
              fontFamily: "var(--font-m)",
              fontSize: 12,
              color: "var(--fg)",
              lineHeight: 1.5,
              fontStyle: "italic",
            }}>
              {currentNode.prompt}
            </div>
          )}
        </div>
      )}

      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={narrativePrev}
          disabled={isFirst}
          style={{
            flex: 1,
            padding: "8px",
            background: isFirst ? "transparent" : "var(--bg)",
            color: isFirst ? "var(--muted)" : "var(--fg)",
            border: "1px solid var(--border)",
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            cursor: isFirst ? "default" : "pointer",
            opacity: isFirst ? 0.3 : 1,
          }}
        >
          ← Previous
        </button>
        <button
          onClick={narrativeNext}
          disabled={isLast}
          style={{
            flex: 1,
            padding: "8px",
            background: isLast ? "transparent" : "var(--accent)",
            color: isLast ? "var(--muted)" : "var(--bg)",
            border: "1px solid var(--border)",
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            cursor: isLast ? "default" : "pointer",
            opacity: isLast ? 0.3 : 1,
          }}
        >
          Next →
        </button>
      </div>
    </div>
  )
}
