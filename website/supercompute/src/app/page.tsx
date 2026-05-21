'use client'

import Link from 'next/link'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import { useAccount } from 'wagmi'

const AGENTS = [
  { name: 'QUANTA', role: 'Operations · Content · Identity', desc: 'Sovereign content agent. On-chain identity via Virtuals Protocol ($QUANTA). Drafts NewsDesk articles, monitors on-chain signals.', icon: '◈', status: 'live' },
  { name: 'KNIGHT', role: 'Trade · CDP · Treasury', desc: 'TradeDesk agent. DeFi operations, CDP management, treasury ops on Base.', icon: '◆', status: 'live' },
  { name: 'CONDOR', role: 'Trade Execution', desc: 'Hummingbot-powered market making, arbitrage, and liquidity management.', icon: '◇', status: 'live' },
  { name: 'NEWSHOUND', role: 'Intelligence · Monitoring', desc: 'Monitors on-chain signals, news feeds, and social channels for actionable intelligence.', icon: '◐', status: 'live' },
  { name: 'LEXICON', role: 'Brand Enforcement', desc: 'Flags forbidden phrases across draft content. Brand drift catcher for all published materials.', icon: '◑', status: 'live' },
]

const SERVICES = [
  { tier: 'Signal', price: '$200', desc: '30-min strategy session. Edge cases, sanity checks, directional input.', icon: '◎' },
  { tier: 'Builder', price: '$750', desc: 'Full system design. Architecture, agent specs, composable with your stack.', icon: '◈' },
  { tier: 'Operator', price: '$2,000', desc: 'Hands-on execution. Agent deployment, monitoring, iteration.', icon: '◆' },
  { tier: 'Custom', price: 'TBD', desc: 'Tailored engagement. Protocol integrations, custom agent development.', icon: '◇' },
]

export default function HomePage() {
  const { address, isConnected } = useAccount()
  const { openConnectModal } = useConnectModal()

  return (
    <div className="p-8 max-w-6xl">
      {/* Hero */}
      <section className="mb-16">
        <div className="terminal-panel p-8 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="font-mono text-[#C8A84B] text-sm">hermes@supercompute:~</span>
            <span className="terminal-cursor font-mono text-[#38BDF8] text-sm" />
          </div>
          <h1 className="text-5xl font-black text-[#E2E8F0] leading-tight mb-4" style={{ letterSpacing: '-0.03em' }}>
            SUPERCOMPUTE
          </h1>
          <p className="text-[#94A3B8] text-lg max-w-xl mb-6">
            Sovereign AI agent infrastructure on Base Chain.<br />
            <span className="text-[#38BDF8]">13 agents</span>, <span className="text-[#C8A84B]">1 operator</span>, <span className="text-[#4ade80]">0 security incidents</span>.
          </p>
          <div className="flex gap-4">
            {isConnected ? (
              <Link href="/member/project" className="btn-gold">
                Enter Platform →
              </Link>
            ) : (
              <button onClick={openConnectModal} className="btn-gold">
                Connect Wallet →
              </button>
            )}
            <Link href="/consulting" className="btn-chrome">
              Consulting
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Stat label="AI Agents" value="13" accent="#38BDF8" />
          <Stat label="Founded" value="2013" accent="#94A3B8" />
          <Stat label="Security Incidents" value="0" accent="#4ade80" />
        </div>
      </section>

      {/* What We Stand For */}
      <section className="mb-16">
        <SectionHeader title="What We Stand For" subtitle="The mission before the product" />
        <div className="terminal-panel p-8 mb-6">
          <div className="grid grid-cols-3 gap-8">
            <div>
              <div className="text-2xl mb-3">◎</div>
              <h3 className="font-mono font-bold text-[#E2E8F0] mb-2">Money is a file format.</h3>
              <p className="text-[#94A3B8] text-sm">Open-source internet money. You can read it, write it, program it. No bank account required. No permission needed.</p>
            </div>
            <div>
              <div className="text-2xl mb-3">◆</div>
              <h3 className="font-mono font-bold text-[#E2E8F0] mb-2">You are the FED.</h3>
              <p className="text-[#94A3B8] text-sm">Own your collateral. Mint your own credit. Accumulate on swan events. Your agent runs the loop 24/7 while you sleep.</p>
            </div>
            <div>
              <div className="text-2xl mb-3">◈</div>
              <h3 className="font-mono font-bold text-[#E2E8F0] mb-2">Own your value.</h3>
              <p className="text-[#94A3B8] text-sm">Away from state-capture intermediaries. Protocol cards explain exactly what each tool does and why it empowers you.</p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="terminal-panel p-4 text-center border-[#C8A84B]/30">
            <span className="font-mono text-[#C8A84B] text-sm">"Money is a file format."</span>
          </div>
          <div className="terminal-panel p-4 text-center border-[#C8A84B]/30">
            <span className="font-mono text-[#C8A84B] text-sm">"You are the FED."</span>
          </div>
          <div className="terminal-panel p-4 text-center border-[#C8A84B]/30">
            <span className="font-mono text-[#C8A84B] text-sm">"Host your own dollar."</span>
          </div>
        </div>
      </section>

      {/* Agent Fleet */}
      <section className="mb-16">
        <SectionHeader title="Agent Fleet" subtitle="13 AI agents running sovereign lanes" />
        <div className="grid grid-cols-1 gap-3">
          {AGENTS.map((agent) => (
            <div key={agent.name} className="terminal-panel p-4 flex items-start gap-4 hover:border-[#38BDF8]/40 transition-colors">
              <span className="text-2xl text-[#38BDF8] mt-1">{agent.icon}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono font-bold text-[#E2E8F0]">{agent.name}</span>
                  <span className="font-mono text-[10px] text-[#64748B]">{agent.role}</span>
                  <span className="ml-auto text-[10px] font-mono text-[#4ade80]">● {agent.status}</span>
                </div>
                <p className="text-[#94A3B8] text-sm">{agent.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 text-right">
          <span className="font-mono text-xs text-[#64748B]">+ 8 more agents in fleet</span>
        </div>
      </section>

      {/* Consulting */}
      <section className="mb-16">
        <SectionHeader title="Consulting" subtitle="Three tiers, one human operator" />
        <div className="grid grid-cols-4 gap-4">
          {SERVICES.map((svc) => (
            <div key={svc.tier} className="terminal-panel p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg">{svc.icon}</span>
                <span className="font-mono text-[#C8A84B] font-bold">{svc.price}</span>
              </div>
              <div className="font-mono text-sm font-bold text-[#E2E8F0] mb-1">{svc.tier}</div>
              <p className="text-[#94A3B8] text-xs">{svc.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 text-center">
          <Link href="/consulting" className="btn-chrome inline-block">
            View All Services →
          </Link>
        </div>
      </section>

      {/* NewsDesk Preview */}
      <section className="mb-16">
        <SectionHeader title="NewsDesk" subtitle="AI-curated Web3 intelligence" />
        <div className="terminal-panel p-6">
          <div className="text-[#94A3B8] text-sm">
            <p className="mb-3">Intelligence across four content pillars:</p>
            <div className="grid grid-cols-2 gap-3">
              {['On-Chain Signals', 'Protocol Updates', 'Market Intelligence', 'Community Signals'].map((pillar) => (
                <div key={pillar} className="flex items-center gap-2 text-[#38BDF8]">
                  <span>◈</span>
                  <span className="font-mono text-xs">{pillar}</span>
                </div>
              ))}
            </div>
            {isConnected && (
              <div className="mt-4 pt-4 border-t border-[#1E3A5F]">
                <Link href="/admin/newsdesk" className="btn-gold text-xs">
                  Open NewsDesk CMS →
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

function Stat({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="terminal-panel p-4 text-center">
      <div className="font-mono text-3xl font-black" style={{ color: accent }}>{value}</div>
      <div className="font-mono text-xs text-[#64748B] mt-1">{label}</div>
    </div>
  )
}

function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-1">
        <span className="font-mono text-[#C8A84B] text-xs">//</span>
        <h2 className="text-2xl font-black text-[#E2E8F0]" style={{ letterSpacing: '-0.02em' }}>{title}</h2>
      </div>
      <p className="text-[#64748B] font-mono text-sm ml-6">{subtitle}</p>
    </div>
  )
}