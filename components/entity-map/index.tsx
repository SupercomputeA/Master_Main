"use client"

import { EntityMapProvider, useEntityMap } from "./useEntityMap"
import EntityMapCanvas from "./EntityMapCanvas"
import EntityMapToolbar from "./EntityMapToolbar"
import EntityMapDetailPanel from "./EntityMapDetailPanel"
import EntityMapTimeline from "./EntityMapTimeline"
import EntityMapPath from "./EntityMapPath"
import EntityMapNarrative from "./EntityMapNarrative"
import EntityMapChat from "./EntityMapChat"
import type { EntityMapData } from "./types"

function EntityMapInner({
  height = 520,
  interactive = true,
  onNodeSelect,
}: {
  height?: number | string
  interactive?: boolean
  onNodeSelect?: (nodeId: string | null) => void
}) {
  const { state } = useEntityMap()
  const { selectedNodeId, activePath, narratives, activeNarrativeId } = state

  if (onNodeSelect) {
    const prev = selectedNodeId
    if (prev !== selectedNodeId) onNodeSelect(selectedNodeId)
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0, border: "1px solid rgba(50,60,80,0.5)", background: "#0a0f17", overflow: "hidden" }}>
      <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>
        <EntityMapToolbar />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: selectedNodeId || activeNarrativeId ? "1fr 360px" : "1fr", gap: 0 }}>
        <EntityMapCanvas height={height} interactive={interactive} />

        {(selectedNodeId || activeNarrativeId) && (
          <div style={{
            borderLeft: "1px solid var(--border)",
            display: "flex",
            flexDirection: "column",
            maxHeight: typeof height === "number" ? height : undefined,
            overflowY: "auto",
          }}>
            {activeNarrativeId ? (
              <EntityMapNarrative />
            ) : (
              <>
                <EntityMapDetailPanel />
                <EntityMapChat />
              </>
            )}
          </div>
        )}
      </div>

      <EntityMapPath />
      <EntityMapTimeline />

      {!activeNarrativeId && narratives.length > 0 && !activePath && (
        <div style={{ borderTop: "1px solid var(--border)" }}>
          <EntityMapNarrative />
        </div>
      )}
    </div>
  )
}

export default function EntityMap({
  data,
  height = 520,
  interactive = true,
  onNodeSelect,
}: {
  data: EntityMapData
  height?: number | string
  interactive?: boolean
  onNodeSelect?: (nodeId: string | null) => void
}) {
  return (
    <EntityMapProvider data={data}>
      <EntityMapInner height={height} interactive={interactive} onNodeSelect={onNodeSelect} />
    </EntityMapProvider>
  )
}

export type { EntityMapData, EntityNode, EntityEdge, PresetView, NarrativePath } from "./types"
