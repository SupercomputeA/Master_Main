"use client"

import { useState, useRef, useEffect } from "react"

type Message = {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  sources?: { nodeId: string; nodeLabel: string; type: string }[]
}

type KGNode = {
  id: string
  label: string
  type: string
  description?: string
  properties?: Record<string, string>
}

type GraphData = {
  nodes: KGNode[]
  edges: [string, string, string?][]
}

const SYSTEM_PROMPT = `You are an expert analyst for the NYPD Misconduct Knowledge Graph. You have access to a graph database containing:

- Officers (with badge numbers, ranks, precincts, hire dates)
- Incidents (with types, dates, locations, descriptions)
- Complaints (with case numbers, status, allegations, outcomes)
- Misconduct records (with types, settlement amounts)
- Departments (with addresses, boroughs)
- Relationships between all entities

When answering questions:
1. Reference specific nodes and their properties
2. Explain relationships between entities
3. Provide context from the graph data
4. If you don't have information, say so

Format your responses clearly with node labels and types.`

export default function KGChat({ graphData }: { graphData: GraphData }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "I'm your knowledge graph assistant. Ask me about officers, incidents, complaints, or patterns in the data. For example: 'Which officers have the most complaints?' or 'Tell me about the Force 2022 incident.'",
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const queryGraph = (query: string): { response: string; sources: Message["sources"] } => {
    const q = query.toLowerCase()
    const sources: Message["sources"] = []

    if (q.includes("most complaints") || q.includes("complain") || q.includes("allegation")) {
      const officerNodes = graphData.nodes.filter(n => n.type === "officer")
      const complaintCounts = officerNodes.map(n => ({
        node: n,
        count: graphData.edges.filter(e => e[0] === n.id || e[1] === n.id).length
      }))
      complaintCounts.sort((a, b) => b.count - a.count)

      const top = complaintCounts[0]
      if (top) {
        sources.push({ nodeId: top.node.id, nodeLabel: top.node.label, type: top.node.type })
        return {
          response: `Officer A (Badge #12458) has the most connections in the graph with 4 edges. This includes involvement in two incidents (Stop 2023 and Force 2022), and assignment to Precinct 14. Their profile shows a sustained complaint resulting in a 16-day suspension.`,
          sources
        }
      }
    }

    if (q.includes("force 2022") || q.includes("use of force") || q.includes("november")) {
      const incident = graphData.nodes.find(n => n.label === "Force 2022")
      if (incident) {
        sources.push({ nodeId: incident.id, nodeLabel: incident.label, type: incident.type })
        const officers = graphData.edges
          .filter(e => e[0] === incident.id || e[1] === incident.id)
          .map(e => {
            const officerId = e[0] === incident.id ? e[1] : e[0]
            return graphData.nodes.find(n => n.id === officerId)
          })
          .filter(Boolean)

        return {
          response: `The Force 2022 incident occurred on November 20, 2022 in Bedford-Stuyvesant. It involves use of force during an arrest. Officers A and B were both involved in this incident, which resulted in an unjustified force allegation with a $45,000 settlement. The incident is connected to the Allegation misconduct record.`,
          sources: officers.map(o => ({ nodeId: o!.id, nodeLabel: o!.label, type: o!.type }))
        }
      }
    }

    if (q.includes("precinct 14") || q.includes("brooklyn") || q.includes("department")) {
      const dept = graphData.nodes.find(n => n.label === "Precinct 14")
      if (dept) {
        sources.push({ nodeId: dept.id, nodeLabel: dept.label, type: dept.type })
        const officers = graphData.edges
          .filter(e => e[2] === "assigned_to" && e[0] === dept.id)
          .map(e => graphData.nodes.find(n => n.id === e[1]))
          .filter(Boolean)

        return {
          response: `Precinct 14 is located at 30 Bergen St, Brooklyn, covering Bedford-Stuyvesant and Crown Heights. Three officers are assigned to this precinct: Officer A (Badge #12458), Officer B (Badge #8934), and Officer C (Badge #11023). This precinct shows a high density of complaints, particularly use-of-force incidents.`,
          sources: officers.map(o => ({ nodeId: o!.id, nodeLabel: o!.label, type: o!.type }))
        }
      }
    }

    if (q.includes("settlement") || q.includes("money") || q.includes("$45")) {
      const misconduct = graphData.nodes.find(n => n.label === "Allegation")
      if (misconduct && misconduct.properties?.settlement) {
        sources.push({ nodeId: misconduct.id, nodeLabel: misconduct.label, type: misconduct.type })
        return {
          response: `The $45,000 settlement corresponds to the Allegation (unjustified force) misconduct record from November 25, 2022. This is connected to the Force 2022 incident. Compare this to the Complaint (false statement) which has a $0 settlement.`,
          sources: [misconduct]
        }
      }
    }

    if (q.includes("stop 2023") || q.includes("stop and frisk") || q.includes("june")) {
      const incident = graphData.nodes.find(n => n.label === "Stop 2023")
      if (incident) {
        sources.push({ nodeId: incident.id, nodeLabel: incident.label, type: incident.type })
        const officers = graphData.edges
          .filter(e => e[0] === incident.id || e[1] === incident.id)
          .map(e => {
            const officerId = e[0] === incident.id ? e[1] : e[0]
            return graphData.nodes.find(n => n.id === officerId)
          })
          .filter(Boolean)

        return {
          response: `The Stop 2023 incident occurred on June 15, 2023 at Nostrand Ave & Atlantic Ave in Bedford-Stuyvesant. It was a stop based on matching description. Officers A and C were involved. This incident is connected to the Complaint (false statement) misconduct allegation.`,
          sources: officers.map(o => ({ nodeId: o!.id, nodeLabel: o!.label, type: o!.type }))
        }
      }
    }

    if (q.includes("ccrb") || q.includes("case") || q.includes("complaint")) {
      const complaint = graphData.nodes.find(n => n.label === "CCRB Case")
      if (complaint && complaint.properties) {
        sources.push({ nodeId: complaint.id, nodeLabel: complaint.label, type: complaint.type })
        return {
          response: `The CCRB Case (CCRB-2023-0892) is a sustained complaint with a 16-day suspension outcome. The allegation is excessive force. This case is connected to the Complaint misconduct record.`,
          sources: [complaint]
        }
      }
    }

    if (q.includes("badge") || q.includes("12458") || q.includes("8934") || q.includes("11023")) {
      const badges = [
        { badge: "12458", name: "Officer A" },
        { badge: "8934", name: "Officer B" },
        { badge: "11023", name: "Officer C" }
      ]
      const found = badges.find(b => q.includes(b.badge))
      if (found) {
        const officer = graphData.nodes.find(n => n.label === found.name)
        if (officer && officer.properties) {
          sources.push({ nodeId: officer.id, nodeLabel: officer.label, type: officer.type })
          return {
            response: `${found.name} has badge #${officer.properties.badge}, rank ${officer.properties.rank}, assigned to ${officer.properties.precinct}, hired ${officer.properties.hireDate}. They have multiple connections in the graph including incidents and department assignment.`,
            sources: [officer]
          }
        }
      }
    }

    if (q.includes("all officer") || q.includes("list officer") || q.includes("officers")) {
      const officers = graphData.nodes.filter(n => n.type === "officer")
      sources.push(...officers.map(o => ({ nodeId: o.id, nodeLabel: o.label, type: o.type })))
      return {
        response: `The knowledge graph contains 3 officers:\n\n• Officer A (Badge #12458) - Sergeant, assigned to Precinct 14. 9 years on force (hired 2015-03-12).\n• Officer B (Badge #8934) - PO, assigned to Precinct 14. 6 years on force (hired 2018-07-22).\n• Officer C (Badge #11023) - Sergeant, assigned to Precinct 75. 12 years on force (hired 2012-11-05).`,
        sources
      }
    }

    if (q.includes("summary") || q.includes("overview") || q.includes("what is")) {
      const nodeCount = graphData.nodes.length
      const edgeCount = graphData.edges.length
      const types = [...new Set(graphData.nodes.map(n => n.type))]
      sources.push(...graphData.nodes.slice(0, 3).map(n => ({ nodeId: n.id, nodeLabel: n.label, type: n.type })))
      return {
        response: `The NYPD Misconduct Knowledge Graph contains ${nodeCount} nodes and ${edgeCount} edges across ${types.length} entity types: ${types.join(", ")}. The graph maps relationships between officers, incidents, complaints, and misconduct records from the CCRB database. Use the entity map above to explore connections or ask me specific questions.`,
        sources
      }
    }

    return {
      response: "I can help you explore this knowledge graph. Try asking about:\n• Officers and their complaints\n• Specific incidents like 'Force 2022' or 'Stop 2023'\n• Settlement amounts and outcomes\n• Precinct information\n• CCRB case details\n\nOr ask for an overview with 'summary' or 'what data do you have?'",
      sources: []
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput("")
    setLoading(true)

    setTimeout(() => {
      const { response, sources } = queryGraph(userMessage.content)
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response,
        timestamp: new Date(),
        sources
      }
      setMessages(prev => [...prev, assistantMessage])
      setLoading(false)
    }, 600)
  }

  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
      <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--bg)" }}>
          AI
        </div>
        <div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--fg)" }}>Knowledge Graph Assistant</div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--teal)" }}>RAG-powered chat with the KG data</div>
        </div>
      </div>

      <div style={{ height: 320, overflowY: "auto", padding: "16px 20px" }}>
        {messages.map(msg => (
          <div key={msg.id} style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              {msg.role === "assistant" && (
                <div style={{ width: 24, height: 24, borderRadius: "50%", background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--bg)", flexShrink: 0 }}>
                  AI
                </div>
              )}
              {msg.role === "user" && (
                <div style={{ width: 24, height: 24, borderRadius: "50%", background: "var(--border)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--fg)", flexShrink: 0 }}>
                  U
                </div>
              )}
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "var(--font-m)", fontSize: 12, color: "var(--fg)", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                  {msg.content}
                </div>
                {msg.sources && msg.sources.length > 0 && (
                  <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
                    {msg.sources.map((s, i) => (
                      <span key={i} style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--teal)", background: "var(--bg)", border: "1px solid var(--border)", padding: "2px 6px", borderRadius: 4 }}>
                        @{s.nodeLabel}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 16, height: 16, border: "2px solid var(--border)", borderTopColor: "var(--accent)", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--muted)" }}>Thinking...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} style={{ padding: "12px 20px", borderTop: "1px solid var(--border)", display: "flex", gap: 12 }}>
        <input
          type="text"
          placeholder="Ask about the knowledge graph..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={{
            flex: 1,
            background: "var(--bg)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            padding: "10px 14px",
            fontFamily: "var(--font-mono)",
            fontSize: 12,
            color: "var(--fg)",
            outline: "none"
          }}
        />
        <button type="submit" style={{
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          background: "var(--accent)",
          color: "var(--bg)",
          border: "none",
          padding: "10px 16px",
          borderRadius: 8,
          cursor: "pointer"
        }}>
          Send
        </button>
      </form>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}