"use client"

import { useState, useRef, useEffect, useMemo } from "react"
import { useEntityMap } from "./useEntityMap"
import { TYPE_COLORS } from "./constants"
import type { EntityNode, EntityEdge } from "./types"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  sources?: { nodeId: string; label: string; type: string }[]
}

function tokenize(text: string): string[] {
  return text.toLowerCase().replace(/[^\w\s]/g, "").split(/\s+/).filter(t => t.length > 2)
}

function similarity(tokens: string[], text: string): number {
  const textTokens = new Set(tokenize(text))
  let matches = 0
  for (const t of tokens) {
    if (textTokens.has(t)) matches++
    for (const tt of textTokens) {
      if (tt.includes(t) || t.includes(tt)) { matches += 0.5; break }
    }
  }
  return matches / Math.max(tokens.length, 1)
}

function queryGraph(
  query: string,
  nodes: EntityNode[],
  edges: EntityEdge[],
  selectedNodeId: string | null
): { response: string; sources: Message["sources"] } {
  const tokens = tokenize(query)
  if (tokens.length === 0) {
    return { response: "Ask me about the entities, relationships, or concepts in this knowledge graph.", sources: [] }
  }

  const scored = nodes.map(node => {
    let score = 0
    score += similarity(tokens, node.label) * 3
    score += similarity(tokens, node.type) * 2
    score += similarity(tokens, node.description || "") * 1.5
    score += similarity(tokens, node.definition || "") * 1.5
    if (node.properties) {
      for (const v of Object.values(node.properties)) {
        score += similarity(tokens, v) * 1
      }
    }
    if (node.id === selectedNodeId) score += 1
    return { node, score }
  }).filter(s => s.score > 0.3).sort((a, b) => b.score - a.score)

  if (scored.length === 0) {
    return {
      response: `I couldn't find nodes matching "${query}". Try searching for specific entities, types, or concepts visible in the graph.`,
      sources: [],
    }
  }

  const topNodes = scored.slice(0, 5)
  const sources = topNodes.map(s => ({ nodeId: s.node.id, label: s.node.label, type: s.node.type }))

  const primary = topNodes[0].node
  const primaryEdges = edges.filter(e => e.from === primary.id || e.to === primary.id)
  const connectedNodes = primaryEdges.map(e => {
    const otherId = e.from === primary.id ? e.to : e.from
    return { edge: e, node: nodes.find(n => n.id === otherId) }
  }).filter(c => c.node)

  let response = `**${primary.label}** (${primary.type})`

  if (primary.description) {
    response += `\n${primary.description}`
  }

  if (primary.definition) {
    response += `\n\n*Definition:* ${primary.definition}`
  }

  if (connectedNodes.length > 0) {
    response += `\n\n**Connections** (${connectedNodes.length}):`
    connectedNodes.slice(0, 6).forEach(c => {
      response += `\n• ${c.edge.label} → ${c.node!.label} (${c.node!.type})`
    })
  }

  if (topNodes.length > 1) {
    response += `\n\n**Related entities:** ${topNodes.slice(1).map(s => s.node.label).join(", ")}`
  }

  return { response, sources }
}

export default function EntityMapChat() {
  const { state, selectNode } = useEntityMap()
  const { nodes, edges, selectedNodeId } = state

  const [messages, setMessages] = useState<Message[]>([{
    id: "welcome",
    role: "assistant",
    content: "Ask me about the entities, relationships, or concepts in this knowledge graph. I can help you explore connections and find information.",
  }])
  const [input, setInput] = useState("")
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSubmit = () => {
    if (!input.trim()) return

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: "user",
      content: input.trim(),
    }

    const result = queryGraph(input.trim(), nodes, edges, selectedNodeId)

    const assistantMsg: Message = {
      id: `a-${Date.now()}`,
      role: "assistant",
      content: result.response,
      sources: result.sources,
    }

    setMessages(prev => [...prev, userMsg, assistantMsg])
    setInput("")
  }

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      borderTop: "1px solid var(--border)",
      maxHeight: 300,
    }}>
      <div className="label-sm" style={{ padding: "8px 12px", color: "var(--accent)" }}>// chat</div>

      <div style={{ flex: 1, overflowY: "auto", padding: "0 12px 8px" }}>
        {messages.map(msg => (
          <div key={msg.id} style={{ marginBottom: 10 }}>
            <div style={{
              fontFamily: "var(--font-mono)",
              fontSize: 9,
              color: msg.role === "user" ? "var(--accent)" : "var(--teal)",
              marginBottom: 3,
              textTransform: "uppercase",
            }}>
              {msg.role === "user" ? "you" : "graph"}
            </div>
            <div style={{
              fontFamily: "var(--font-m)",
              fontSize: 11,
              color: "var(--fg)",
              lineHeight: 1.5,
              whiteSpace: "pre-wrap",
            }}>
              {msg.content}
            </div>
            {msg.sources && msg.sources.length > 0 && (
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 6 }}>
                {msg.sources.map(s => (
                  <button
                    key={s.nodeId}
                    onClick={() => selectNode(s.nodeId)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      padding: "2px 6px",
                      background: "var(--bg)",
                      border: "1px solid var(--border)",
                      cursor: "pointer",
                    }}
                  >
                    <span style={{ width: 5, height: 5, borderRadius: "50%", background: TYPE_COLORS[s.type] || TYPE_COLORS.default }} />
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--fg)" }}>{s.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div style={{ display: "flex", gap: 6, padding: "8px 12px", borderTop: "1px solid var(--border)" }}>
        <input
          type="text"
          placeholder="Ask about the graph..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") handleSubmit() }}
          style={{
            flex: 1,
            background: "var(--bg)",
            border: "1px solid var(--border)",
            padding: "6px 10px",
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            color: "var(--fg)",
            outline: "none",
          }}
        />
        <button
          onClick={handleSubmit}
          style={{
            background: "var(--accent)",
            color: "var(--bg)",
            border: "none",
            padding: "6px 12px",
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            cursor: "pointer",
          }}
        >
          Send
        </button>
      </div>
    </div>
  )
}
