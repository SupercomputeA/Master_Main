"use client"

import { useEntityMap } from "./useEntityMap"
import { TYPE_COLORS, TYPE_LABELS } from "./constants"

export default function EntityMapToolbar() {
  const { state, setSearch, toggleFilter, activatePreset, clearPreset } = useEntityMap()
  const { searchQuery, activeFilters, presets, activePresetId, nodes } = state

  const nodeTypes = Array.from(new Set(nodes.map(n => n.type))).sort()

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {presets.length > 0 && (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <button
            onClick={clearPreset}
            style={{
              padding: "5px 12px",
              background: !activePresetId ? "var(--accent)" : "transparent",
              color: !activePresetId ? "var(--bg)" : "var(--muted)",
              border: "1px solid var(--border)",
              fontFamily: "var(--font-mono)",
              fontSize: 9,
              cursor: "pointer",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
            }}
          >
            All
          </button>
          {presets.map(p => (
            <button
              key={p.id}
              onClick={() => activatePreset(p)}
              title={p.description}
              style={{
                padding: "5px 12px",
                background: activePresetId === p.id ? "var(--accent)" : "transparent",
                color: activePresetId === p.id ? "var(--bg)" : "var(--muted)",
                border: "1px solid var(--border)",
                fontFamily: "var(--font-mono)",
                fontSize: 9,
                cursor: "pointer",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      )}

      <div style={{ display: "flex", gap: 8 }}>
        <input
          type="text"
          placeholder="Search nodes..."
          value={searchQuery}
          onChange={e => setSearch(e.target.value)}
          style={{
            flex: 1,
            background: "rgba(15,20,30,0.9)",
            border: "1px solid rgba(50,60,80,0.5)",
            padding: "8px 12px",
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            color: "#e2e8f0",
            outline: "none",
          }}
        />
      </div>

      {nodeTypes.length > 1 && (
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {nodeTypes.map(type => {
            const active = activeFilters.size === 0 || activeFilters.has(type)
            return (
              <button
                key={type}
                onClick={() => toggleFilter(type)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  padding: "3px 8px",
                  background: active ? "rgba(255,255,255,0.05)" : "transparent",
                  border: `1px solid ${active ? TYPE_COLORS[type] || "var(--border)" : "var(--border)"}`,
                  fontFamily: "var(--font-mono)",
                  fontSize: 9,
                  color: active ? TYPE_COLORS[type] || "var(--fg)" : "var(--muted)",
                  cursor: "pointer",
                  opacity: active ? 1 : 0.4,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: TYPE_COLORS[type] || "var(--muted)" }} />
                {TYPE_LABELS[type] || type}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
