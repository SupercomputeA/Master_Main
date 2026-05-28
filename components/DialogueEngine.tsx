"use client"

import { useState, useRef, useEffect } from "react"
import { useAuth } from "../lib/auth"

type DialogueMessage = { role: "user" | "system" | "bias" | "counter"; content: string; time: string }

const counterarguments: Record<string, { bias: string; counter: string }> = {
  good: {
    bias: "Individual officers being good doesn't address systemic patterns — the system itself may enable misconduct.",
    counter: "Officers with multiple complaints often face no discipline. The system protects individuals rather than removing problematic actors. Good people in bad systems still produce bad outcomes.",
  },
  union: {
    bias: "Unions are part of the problem, but cities without strong unions also fail to hold officers accountable.",
    counter: "Qualified immunity and political will matter more than union contracts. Even NYC with weak police union discipline has near-zero terminations for misconduct.",
  },
  abolish: {
    bias: "Abolition is a north star, not a plan. Immediate accountability requires transparency and civilian oversight.",
    counter: "What works now: civilian review boards with subpoena power, decertification registries, automatic investigations for killings.",
  },
  camera: {
    bias: "Body cameras alone don't change outcomes — what's recorded matters as much as who's watching.",
    counter: "97% of NYPD misconduct cases with video evidence led to no criminal charges. Footage helps external observers, not internal accountability.",
  },
}

export default function DialogueEngine() {
  const { profile } = useAuth()
  const [messages, setMessages] = useState<DialogueMessage[]>([
    { role: "system", content: "Let's start here: What is your initial belief about police accountability in America?", time: now() },
  ])
  const [input, setInput] = useState("")
  const [thinking, setThinking] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const send = () => {
    const text = input.trim()
    if (!text || thinking) return

    const userMsg: DialogueMessage = { role: "user", content: text, time: now() }
    setMessages(prev => [...prev, userMsg])
    setInput("")
    setThinking(true)

    const lower = text.toLowerCase()
    const matchKey = Object.keys(counterarguments).find(k => lower.includes(k))

    if (matchKey) {
      setTimeout(() => {
        setMessages(prev => [...prev, { role: "bias", content: `"${text}"`, time: now() }])
      }, 400)
      setTimeout(() => {
        setMessages(prev => [...prev, { role: "system", content: counterarguments[matchKey].bias, time: now() }])
      }, 900)
      setTimeout(() => {
        setMessages(prev => [...prev, { role: "counter", content: counterarguments[matchKey].counter, time: now() }])
        setThinking(false)
      }, 1500)
    } else {
      setTimeout(() => {
        setMessages(prev => [...prev, { role: "system", content: "That's a perspective worth examining. What data would change your mind?", time: now() }])
        setThinking(false)
      }, 600)
    }
  }

  const startConversation = (statement: string) => {
    setInput(statement)
    send()
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send() }
  }

  const prompts = [
    "Most officers are good people doing a hard job.",
    "Police unions protect bad officers from consequences.",
    "Body cameras and reform will fix the problem.",
    "The system needs to be rebuilt from scratch.",
  ]

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{
        borderBottom: "1px solid var(--border)",
        padding: "10px 14px",
        fontFamily: "var(--font-mono)",
        fontSize: 9,
        color: "var(--teal)",
        textTransform: "uppercase",
        letterSpacing: "0.1em",
      }}>
        // Explore Your Assumptions
      </div>

      <div style={{
        flex: 1, overflowY: "auto", padding: "16px",
        display: "flex", flexDirection: "column", gap: 12,
      }}>
        {messages.map((m, i) => (
          <div key={i} style={{
            display: "flex",
            flexDirection: "column",
            alignItems: m.role === "user" ? "flex-end" : "flex-start",
          }}>
            <div style={{
              maxWidth: "85%",
              padding: "10px 14px",
              fontSize: 12,
              lineHeight: 1.6,
              background: m.role === "user" ? "var(--surface)" :
                         m.role === "bias" ? "rgba(239,68,68,0.15)" :
                         m.role === "counter" ? "rgba(16,185,129,0.15)" :
                         "var(--bg)",
              border: `1px solid ${m.role === "user" ? "var(--border-accent)" : m.role === "bias" ? "#ef4444" : m.role === "counter" ? "#10b981" : "var(--border)"}`,
              fontFamily: m.role === "system" ? "var(--font-mono)" : "inherit",
              color: m.role === "bias" ? "#ef4444" : m.role === "counter" ? "#10b981" : "var(--fg)",
            }}>
              {m.content}
            </div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: "var(--muted)", marginTop: 3 }}>
              {m.role === "user" ? (profile?.name ?? "you") : "Condor"} · {m.time}
            </div>
          </div>
        ))}
        {thinking && (
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--teal)" }}>●</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--muted)" }}>processing...</div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div style={{
        borderTop: "1px solid var(--border)",
        padding: "12px 14px",
        display: "flex", gap: 8, background: "var(--surface)",
      }}>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Type your belief or question..."
          rows={1}
          style={{
            flex: 1, fontFamily: "var(--font-mono)", fontSize: 11,
            color: "var(--fg)", background: "var(--bg)", border: "1px solid var(--border)",
            padding: "8px 10px", resize: "none", outline: "none", maxHeight: 80,
          }}
        />
        <button
          onClick={send}
          disabled={!input.trim() || thinking}
          style={{
            padding: "8px 12px", background: input.trim() && !thinking ? "var(--accent)" : "transparent",
            color: input.trim() && !thinking ? "var(--bg)" : "var(--muted)",
            border: "1px solid var(--border-accent)", cursor: "pointer",
            fontFamily: "var(--font-mono)", fontSize: 10, alignSelf: "flex-end",
          }}
        >
          →
        </button>
      </div>

      <div style={{
        padding: "10px 14px", borderTop: "1px solid var(--border)",
        background: "var(--bg)",
      }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: "var(--muted)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.1em" }}>
          Or choose a starting point:
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {prompts.map((p, i) => (
            <button key={i} onClick={() => startConversation(p)}
              style={{
                padding: "6px 10px", background: "var(--surface)",
                border: "1px solid var(--border)", color: "var(--muted)",
                fontSize: 10, textAlign: "left", cursor: "pointer",
                fontFamily: "var(--font-mono)", transition: "all 0.2s",
              }}
              onMouseEnter={e => { (e.target as HTMLElement).style.borderColor = "var(--accent)"; (e.target as HTMLElement).style.color = "var(--accent)" }}
              onMouseLeave={e => { (e.target as HTMLElement).style.borderColor = "var(--border)"; (e.target as HTMLElement).style.color = "var(--muted)" }}
            >
              {p}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function now() {
  return new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })
}