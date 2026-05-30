"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { useAuth } from "../lib/auth"

type Message = { role: "user" | "agent"; content: string; time: string }

const AGENT_NAME = "Condor"
const AGENT_AVATAR = "C"

export default function AgentChat() {
  const { isAdmin, profile } = useAuth()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { role: "agent", content: "Condor online. Monitoring Base chain, CDP positions, and DEX liquidity. How can I assist?", time: now() },
  ])
  const [input, setInput] = useState("")
  const [thinking, setThinking] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isAdmin) return
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isAdmin])

  const send = useCallback(async () => {
    const text = input.trim()
    if (!text || thinking) return
    const userMsg: Message = { role: "user", content: text, time: now() }
    setMessages(prev => [...prev, userMsg])
    setInput("")
    setThinking(true)

    try {
      const res = await fetch("/api/agent/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, wallet: profile?.address || profile?.wallet_address }),
      })
      const data = await res.json() as { reply?: string; error?: string }
      const agentMsg: Message = { role: "agent", content: data.reply ?? "Processing...", time: now() }
      setMessages(prev => [...prev, agentMsg])
    } catch {
      setMessages(prev => [...prev, { role: "agent", content: "Connection error. Retry.", time: now() }])
    }
    setThinking(false)
  }, [input, thinking, profile])

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send() }
    if (e.key === "Escape") setOpen(false)
  }

  if (!isAdmin) return null

  return (
    <>
      {/* Floating trigger */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          style={{
            position: "fixed", bottom: 24, right: 24, zIndex: 9999,
            width: 56, height: 56, borderRadius: 0,
            background: "var(--accent)", color: "var(--bg)",
            border: "1px solid var(--border-accent)",
            fontFamily: "var(--font-mono)", fontSize: 11,
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 20px rgba(201,163,58,0.3)",
          }}
          title="Chat with Condor"
        >
          C
        </button>
      )}

      {/* Chat window */}
      {open && (
        <div style={{
          position: "fixed", bottom: 24, right: 24, zIndex: 9999,
          width: 360, height: 480, maxHeight: "80vh",
          background: "var(--bg)", border: "1px solid var(--border-accent)",
          display: "flex", flexDirection: "column",
          boxShadow: "0 0 40px rgba(0,0,0,0.8)",
        }}>
          {/* Header */}
          <div style={{
            padding: "12px 16px", borderBottom: "1px solid var(--border)",
            display: "flex", alignItems: "center", gap: 10, background: "var(--surface)",
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: 0, background: "var(--accent)",
              color: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 700,
            }}>
              {AGENT_AVATAR}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--accent)" }}>// {AGENT_NAME}</div>
              <div style={{ fontSize: 9, color: "var(--teal)", fontFamily: "var(--font-mono)" }}>● Online · Base Chain</div>
            </div>
            <button
              onClick={() => setOpen(false)}
              style={{
                background: "transparent", border: "none", color: "var(--muted)",
                cursor: "pointer", fontFamily: "var(--font-mono)", fontSize: 14, padding: 4,
              }}
            >
              ×
            </button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: 12 }}>
            {messages.map((m, i) => (
              <div key={i} style={{
                display: "flex", flexDirection: "column",
                alignItems: m.role === "user" ? "flex-end" : "flex-start",
              }}>
                <div style={{
                  maxWidth: "80%",
                  padding: "10px 14px",
                  background: m.role === "user" ? "var(--surface)" : "var(--bg)",
                  border: `1px solid ${m.role === "user" ? "var(--border-accent)" : "var(--border)"}`,
                  fontSize: 12, color: "var(--fg)", lineHeight: 1.5,
                  fontFamily: m.role === "agent" ? "var(--font-mono)" : "inherit",
                }}>
                  {m.content}
                </div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: "var(--muted)", marginTop: 3 }}>
                  {m.role === "agent" ? AGENT_NAME : profile?.name ?? "you"} · {m.time}
                </div>
              </div>
            ))}
            {thinking && (
              <div style={{ display: "flex", gap: 6, alignItems: "center", padding: "4px 0" }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--teal)" }}>●</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--muted)" }}>Condor is thinking...</div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{ padding: "12px", borderTop: "1px solid var(--border)", background: "var(--surface)" }}>
            <div style={{ display: "flex", gap: 8 }}>
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Ask Condor..."
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
                  fontFamily: "var(--font-mono)", fontSize: 10,
                }}
              >
                →
              </button>
            </div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: "var(--muted)", marginTop: 6, textAlign: "center" }}>
              Esc to close · Enter to send
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function now() {
  return new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })
}