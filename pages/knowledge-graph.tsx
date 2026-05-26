"use client"

import { useState, useEffect, useMemo } from "react"
import Layout from "../components/Layout"
import Footer from "../components/Footer"
import EntityMap from "../components/entity-map"
import type { EntityMapData } from "../components/entity-map"
import DialogueEngine from "../components/DialogueEngine"

type ApiNode = { id: string; label: string; type: string; description?: string; properties?: Record<string, string> }
type ApiEdge = [string, string, string?]

export default function KnowledgeGraphPage() {
  const [domain, setDomain] = useState<"supercompute" | "policing">("supercompute")
  const [rawGraph, setRawGraph] = useState<{ nodes: ApiNode[]; edges: ApiEdge[] } | null>(null)
  const [loading, setLoading] = useState(true)
  const [mcpEnabled, setMcpEnabled] = useState(false)

  useEffect(() => {
    fetch(`/api/kg/graph?domain=${domain}`)
      .then(r => r.json())
      .then(d => {
        setRawGraph(d.graph)
        setMcpEnabled(d.mcp)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [domain])

  const entityMapData = useMemo((): EntityMapData | null => {
    if (!rawGraph) return null
    return {
      nodes: rawGraph.nodes.map(n => ({
        id: n.id,
        label: n.label,
        type: n.type as any,
        description: n.description,
        properties: n.properties,
      })),
      edges: rawGraph.edges.map(e => ({
        from: e[0],
        to: e[1],
        label: e[2] || "",
      })),
    }
  }, [rawGraph])

  return (
    <Layout title="SUPERCOMPUTE · Knowledge Graph">
      <section className="hero" id="kg-hero">
        <div className="hero-kicker">
          <div className="status-dot" />
          <span className="label">// knowledge graph</span>
          {mcpEnabled && (
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--teal)", border: "1px solid var(--teal)", padding: "2px 8px", marginLeft: 8 }}>
              ● MEMGRAPH LIVE
            </span>
          )}
        </div>
        <h1 className="display-xl hero-title">
          KNOWLEDGE<br /><em>GRAPH</em>
        </h1>
        <p className="hero-sub">
          Interactive entity map powered by {domain === "supercompute" ? "Supercompute protocol data" : "Memgraph MCP + police accountability records"}.
          Drag nodes, explore connections, confront assumptions.
        </p>
        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          {(["supercompute", "policing"] as const).map(d => (
            <button key={d} onClick={() => { setDomain(d); setLoading(true); setRawGraph(null) }}
              style={{
                padding: "6px 14px",
                background: domain === d ? "var(--accent)" : "transparent",
                color: domain === d ? "var(--bg)" : "var(--muted)",
                border: "1px solid var(--border)",
                fontFamily: "var(--font-mono)", fontSize: 9, cursor: "pointer",
                textTransform: "uppercase", letterSpacing: "0.1em",
              }}>
              {d}
            </button>
          ))}
        </div>
      </section>

      <section className="section">
        {loading ? (
          <div style={{ height: 500, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)", border: "1px solid var(--border)" }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--muted)" }}>
              {mcpEnabled ? "Calling Memgraph MCP..." : "Loading graph data..."}
            </div>
          </div>
        ) : entityMapData ? (
          <EntityMap data={entityMapData} height={500} />
        ) : (
          <div style={{ height: 500, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)", border: "1px solid var(--border)" }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--muted)" }}>No data</div>
          </div>
        )}
      </section>

      {/* Dialogue + article */}
      <section className="section">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, background: "var(--border)", border: "1px solid var(--border)" }}>
          {/* Article */}
          <div style={{ background: "var(--bg)", padding: "28px 24px" }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16 }}>
              // About This Data
            </div>
            <div style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.8 }}>
              {domain === "supercompute" ? (
                <>
                  <p style={{ marginBottom: 16 }}>
                    This knowledge graph visualizes the Supercompute protocol ecosystem. Each node is an entity — agent, token, protocol, project — and edges show how they relate.
                  </p>
                  <p style={{ marginBottom: 16 }}>
                    <strong style={{ color: "var(--accent)" }}>Why a knowledge graph?</strong><br />
                    Traditional docs hide relationships. A KG shows how $SCOM flows to stakers via FeeRouter, how agents coordinate, how protocols depend on each other.
                  </p>
                  <p>
                    Drag nodes to rearrange. Click to select. The graph updates live from Memgraph MCP when connected.
                  </p>
                </>
              ) : (
                <>
                  <p style={{ marginBottom: 16 }}>
                    This knowledge graph visualizes public misconduct records. Nodes are officers, incidents, complaints, and departments. Edges show connections — which officers were in which incidents, which complaints were filed.
                  </p>
                  <p style={{ marginBottom: 16 }}>
                    <strong style={{ color: "var(--accent)" }}>Why a knowledge graph?</strong><br />
                    Tabular data obscures patterns. A KG reveals: officers in multiple incidents, departments with systemic problems, complaints that lead nowhere.
                  </p>
                  <p>
                    Interact with the dialogue to the right to examine your assumptions about policing and accountability.
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Dialogue */}
          <div style={{ background: "var(--surface)", minHeight: 500 }}>
            <DialogueEngine />
          </div>
        </div>
      </section>

      <Footer />
    </Layout>
  )
}