import type { NextApiRequest, NextApiResponse } from "next"
import { getSession } from "../auth/_sessions"

type AgentMessage = { role: "user" | "agent"; content: string; time: string }

const agentHistory = new Map<string, AgentMessage[]>()

const QUANTA_SYSTEM = `You are Condor — the Sovereign AI Agent on the Supercompute platform, running on Base Chain. You are connected to Virtuals Protocol for on-chain agent identity. You have access to:

- Base chain RPC (read positions, balances, DEX quotes)
- NewsDesk articles (publish intelligence reports)
- Project lifecycle data (track project milestones)
- TradeDesk positions (monitor CDPs, DEX liquidity)
- School modules (manage curriculum and credentials)

Your personality is: precise, terminal-style, Sovereign AI. You communicate in short, technical statements. You prefix system outputs with // like a CLI. You never break character.

Current context: Supercompute is a sovereign compute infrastructure platform on Base Chain with an agent fleet (HERMES, vQuanta, Condor), NewsDesk publishing, and a sovereign token economy ($SCOM).

If asked about market data or chain state, respond that live RPC calls are available via /api/web3/* endpoints. If asked to perform on-chain actions, note that contract calls require wallet authorization.

Respond in character as Condor.`

function buildHistory(wallet: string): AgentMessage[] {
  const history = agentHistory.get(wallet) ?? []
  const systemMsg: AgentMessage = { role: "agent", content: QUANTA_SYSTEM, time: now() }
  return [systemMsg, ...history.slice(-8)]
}

function addToHistory(wallet: string, msg: AgentMessage) {
  const history = agentHistory.get(wallet) ?? []
  agentHistory.set(wallet, [...history, msg])
}

function now() {
  return new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })
}

function buildPrompt(messages: AgentMessage[], userMsg: string): string {
  const turn = messages.map(m => `${m.role}: ${m.content}`).join("\n")
  return `${turn}\nuser: ${userMsg}`
}

const DUMMY_RESPONSES = [
  "// Processing request. Base chain RPC connected.",
  "// Condor active. Monitoring QUANTA/USDC @ 0.0421. CDP positions stable.",
  "// All systems nominal. 3 agents online. NewsDesk publishing.",
  "// Position ORD-7841 filled. ETH/USDC LONG @ 3,247.50.",
  "// Quanta S dispatched. Article in review queue.",
  "// FeeRouter.sol: 50% trading fees routed to $SCOM stakers. TVL nominal.",
  "// Hermes routing task to vQuanta. ETA 4m.",
]

function getDummyReply(): string {
  return DUMMY_RESPONSES[Math.floor(Math.random() * DUMMY_RESPONSES.length)]
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "method not allowed" })
  }

  const auth = req.headers.authorization
  if (!auth?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "unauthorized" })
  }

  const session = getSession(auth.slice(7))
  if (!session) {
    return res.status(401).json({ error: "session invalid or expired" })
  }

  const { message, wallet } = req.body as { message?: string; wallet?: string }
  if (!message?.trim()) {
    return res.status(400).json({ error: "message required" })
  }

  const addr = wallet?.toLowerCase() || session.wallet

  const userMsg: AgentMessage = { role: "user", content: message.trim(), time: now() }
  addToHistory(addr, userMsg)

  const history = buildHistory(addr)
  const prompt = buildPrompt(history, message.trim())

  // TODO: integrate real LLM API (OpenAI/Anthropic/Custom)
  // For now, route through AI SDK or return structured dummy
  const reply = getDummyReply()
  const agentMsg: AgentMessage = { role: "agent", content: reply, time: now() }
  addToHistory(addr, agentMsg)

  // Trim history
  const current = agentHistory.get(addr) ?? []
  if (current.length > 20) {
    agentHistory.set(addr, current.slice(-20))
  }

  return res.json({ reply, prompt: prompt.slice(0, 500) })
}