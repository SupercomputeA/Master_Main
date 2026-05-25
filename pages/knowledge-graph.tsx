"use client"

import { useState, useEffect } from "react"
import Layout from "../components/Layout"
import Footer from "../components/Footer"
import KnowledgeGraph from "../components/KnowledgeGraph"
import DialogueEngine from "../components/DialogueEngine"

type KGNode = { id: string; label: string; type: string; x?: number; y?: number; r?: number }
type KGEdge = [string, string]

const LEGEND_ITEMS = [
  { type: "agent", label: "Agent", color: "#ff6b35" },
  { type: "protocol", label: "Protocol", color: "#10b981" },
  { type: "token", label: "Token", color: "#fbbf24" },
  { type: "project", label: "Project", color: "#a855f7" },
  { type: "officer", label: "Officer", color: "#f59e0b" },
  { type: "incident", label: "Incident", color: "#0ea5e9" },
  { type: "misconduct", label: "Misconduct", color: "#ef4444" },
  { type: "department", label: "Department", color: "#8b5cf6" },
  { type: "complaint", label: "Complaint", color: "#06b6d4" },
]

export default function KnowledgeGraphPage() {
  const [domain, setDomain] = useState<"supercompute" | "policing">("supercompute")
  const [graph, setGraph] = useState<{ nodes: KGNode[]; edges: KGEdge[] } | null>(null)
  const [loading, setLoading] = useState(true)
  const [mcpEnabled, setMcpEnabled] = useState(false)

  useEffect(() => {
    fetch(`/api/kg/graph?domain=${domain}`)
      .then(r => r.json())
      .then(d => {
        setGraph(d.graph)
        setMcpEnabled(d.mcp)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [domain])

  const stats = graph
    ? [
        { label: "Nodes", value: graph.nodes.length },
        { label: "Edges", value: graph.edges.length },
      ]
    : []

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
            <button key={d} onClick={() => { setDomain(d); setLoading(true); setGraph(null) }}
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
        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 1, background: "var(--border)", border: "1px solid var(--border)" }}>
          {/* Graph canvas */}
          <div>
            <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", background: "var(--surface)" }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                // {domain === "supercompute" ? "Supercompute Entity Map" : "Police Accountability Network"}
              </div>
            </div>
            {loading ? (
              <div style={{ height: 450, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)" }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--muted)" }}>
                  {mcpEnabled ? "Calling Memgraph MCP..." : "Loading graph data..."}
                </div>
              </div>
            ) : graph ? (
              <KnowledgeGraph data={graph} height={450} />
            ) : (
              <div style={{ height: 450, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)" }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--muted)" }}>No data</div>
              </div>
            )}
          </div>

          {/* Info panel */}
          <div style={{ background: "var(--bg)", display: "flex", flexDirection: "column" }}>
            {/* Legend */}
            <div style={{ padding: "16px", borderBottom: "1px solid var(--border)" }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>
                // node types
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {LEGEND_ITEMS.filter(l => domain === "policing" ? ["officer", "incident", "misconduct", "department", "complaint"].includes(l.type) : true).map(item => (
                  <div key={item.type} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: item.color, flexShrink: 0 }} />
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--muted)" }}>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats */}
            {stats.length > 0 && (
              <div style={{ padding: "16px", borderBottom: "1px solid var(--border)" }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>
                  // graph stats
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {stats.map(s => (
                    <div key={s.label} style={{ background: "var(--surface)", padding: "10px 12px" }}>
                      <div style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: "var(--muted)", marginBottom: 2 }}>{s.label.toUpperCase()}</div>
                      <div style={{ fontFamily: "var(--font-display)", fontSize: 20, color: "var(--accent)" }}>{s.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* About */}
            <div style={{ padding: "16px", flex: 1 }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>
                // about
              </div>
              <p style={{ fontSize: 11, color: "var(--muted)", lineHeight: 1.7 }}>
                {domain === "supercompute"
                  ? "Supercompute protocol entities — agents, tokens, protocols, and projects. Edges show relationships and dependencies."
                  : "Police accountability network from public records (NYPD, CCRB, Marshall Project). Node connections reveal patterns invisible in tabular data."}
              </p>
            </div>
          </div>
        </div>
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