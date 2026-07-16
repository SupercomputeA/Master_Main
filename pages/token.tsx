import type { GetStaticProps } from "next"
import Link from "next/link"
import { useState, useEffect } from "react"
import PublicLayout from "../components/PublicLayout"
import Footer from "../components/Footer"
import { useAuth } from "../lib/auth"
import { getAllProjects, type Project } from "../lib/content"

export const getStaticProps: GetStaticProps = async () => {
  const projects = await getAllProjects()
  return { props: { projects } }
}

interface TokenData {
  address: string
  deployed: boolean
  chain: string
  name: string
  symbol: string
  decimals: number
  totalSupply: number
  totalSupplyFormatted: string
  owner: string | null
  explorer: string
  timestamp: string
  walletBalance?: number
  walletBalanceFormatted?: string
}

function formatSupply(formatted: string): string {
  const parts = formatted.split(".")
  const intPart = parseInt(parts[0]).toLocaleString()
  return parts[1] ? `${intPart}.${parts[1]}` : intPart
}

function shortAddr(addr: string): string {
  if (!addr || addr.length < 42) return addr
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`
}

export default function Token({ projects }: { projects: Project[] }) {
  const projectTokens = projects.filter(p => p.tokenSymbol)
  const { session } = useAuth()
  const [tokenData, setTokenData] = useState<TokenData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const wallet = session
    const url = wallet ? `/api/token?wallet=${wallet}` : "/api/token"
    fetch(url)
      .then((r) => r.json())
      .then((d: unknown) => setTokenData(d as TokenData))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [session])

  const supplyDisplay = tokenData?.totalSupplyFormatted
    ? formatSupply(tokenData.totalSupplyFormatted)
    : "—"
  const deployed = tokenData?.deployed ?? false

  return (
    <PublicLayout title="SUPERCOMPUTE · Token">
      <section className="hero" id="token">
        <div className="hero-kicker">
          <div className="status-dot" />
          <span className="label">// token</span>
        </div>
        <h1 className="display-xl hero-title">
          $QUANTA<br /><em>TOKEN</em>
        </h1>
        <p className="hero-sub">
          The builder coin on Base Chain. {deployed
            ? "Contract deployed and verified. Token gating reads on-chain balances. Staking activates post-liquidity."
            : "Contract address reserved. Token gating reads on-chain balances. Staking activates post-TGE."}
        </p>
        <div className="hero-meta">
          <div className="meta-item">
            <div className="label-sm">// Network</div>
            <div className="val">Base L2</div>
          </div>
          <div className="meta-item">
            <div className="label-sm">// Contract</div>
            <div className="val" style={{ fontSize: 10, fontFamily: "var(--font-mono)" }}>
              {tokenData ? shortAddr(tokenData.address) : "0x5ACD…371A"}
            </div>
          </div>
          <div className="meta-item">
            <div className="label-sm">// Status</div>
            <div className="val">
              {loading ? "syncing…" : deployed ? "Deployed" : "Pre-TGE"}
            </div>
          </div>
        </div>
      </section>

      {/* On-chain data — live from Base RPC */}
      <section className="section">
        <div className="section-header">
          <div className="label">// on-chain data</div>
          <div><h2 className="display-md">Token State</h2></div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1, background: "var(--border)", border: "1px solid var(--border)" }}>
          <div style={{ background: "var(--bg)", padding: "20px" }}>
            <div className="label-sm" style={{ marginBottom: 4 }}>// Name</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 20, fontWeight: 700, color: "var(--accent)" }}>
              {loading ? "—" : "$QUANTA"}
            </div>
            <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>
              {tokenData?.symbol ? `$${tokenData.symbol}` : "$QUANTA"}
            </div>
          </div>
          <div style={{ background: "var(--bg)", padding: "20px" }}>
            <div className="label-sm" style={{ marginBottom: 4 }}>// Total Supply</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 28, fontWeight: 700, color: "var(--accent)" }}>
              {loading ? "—" : supplyDisplay}
            </div>
            <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>
              {tokenData ? `${tokenData.decimals} decimals` : "—"}
            </div>
          </div>
          <div style={{ background: "var(--bg)", padding: "20px" }}>
            <div className="label-sm" style={{ marginBottom: 4 }}>// Deployed</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 28, fontWeight: 700, color: deployed ? "var(--accent)" : "var(--muted)" }}>
              {loading ? "—" : deployed ? "✓" : "○"}
            </div>
            <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>
              {loading ? "querying…" : deployed ? "bytecode live" : "no bytecode"}
            </div>
          </div>
          <div style={{ background: "var(--bg)", padding: "20px" }}>
            <div className="label-sm" style={{ marginBottom: 4 }}>// Owner</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 600, color: "var(--accent)", wordBreak: "break-all" }}>
              {loading ? "—" : (tokenData?.owner ? shortAddr(tokenData.owner) : "—")}
            </div>
            <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>contract owner</div>
          </div>
        </div>

        {/* Wallet balance for connected users */}
        {session && (
          <div style={{ marginTop: 12, background: "var(--surface)", border: "1px solid var(--border-warm)", padding: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div className="label-sm" style={{ marginBottom: 4 }}>// Your Balance</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 22, fontWeight: 700, color: "var(--accent)" }}>
                {tokenData?.walletBalanceFormatted ?? "0.000000"}
              </div>
            </div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--muted)", textAlign: "right" }}>
              {shortAddr(session)}
            </div>
          </div>
        )}

        {/* Explorer link */}
        {tokenData && (
          <div style={{ marginTop: 12, fontFamily: "var(--font-mono)", fontSize: 11 }}>
            <a href={tokenData.explorer} target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)", textDecoration: "none" }}>
              → View on Basescan
            </a>
            <span style={{ color: "var(--muted)", marginLeft: 16 }}>
              Last queried: {new Date(tokenData.timestamp).toLocaleTimeString("en-US", { hour12: false })}
            </span>
          </div>
        )}
      </section>

      {/* Ecosystem status */}
      <section className="section">
        <div className="section-header">
          <div className="label">// ecosystem</div>
          <div><h2 className="display-md">Ecosystem Status</h2></div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1, background: "var(--border)", border: "1px solid var(--border)" }}>
          <div style={{ background: "var(--bg)", padding: "20px" }}>
            <div className="label-sm" style={{ marginBottom: 4 }}>// Projects</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 28, fontWeight: 700, color: "var(--accent)" }}>{projects.length}</div>
            <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>in development</div>
          </div>
          <div style={{ background: "var(--bg)", padding: "20px" }}>
            <div className="label-sm" style={{ marginBottom: 4 }}>// Project Tokens</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 28, fontWeight: 700, color: "var(--accent)" }}>{projectTokens.length}</div>
            <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>planned, none deployed</div>
          </div>
          <div style={{ background: "var(--bg)", padding: "20px" }}>
            <div className="label-sm" style={{ marginBottom: 4 }}>// Capital Raised</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 28, fontWeight: 700, color: "var(--accent)" }}>$0</div>
            <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>self-funded, no external raise</div>
          </div>
          <div style={{ background: "var(--bg)", padding: "20px" }}>
            <div className="label-sm" style={{ marginBottom: 4 }}>// TVL</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 28, fontWeight: 700, color: "var(--accent)" }}>$0</div>
            <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>pre-liquidity</div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <div className="label">// project tokens</div>
          <div><h2 className="display-md">Sub-Tokens</h2></div>
        </div>
        {projectTokens.length === 0 ? (
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "40px", textAlign: "center", color: "var(--muted)", fontSize: 12 }}>
            No project tokens yet.
          </div>
        ) : (
          <div style={{ background: "var(--bg)", border: "1px solid var(--border)", overflow: "hidden" }}>
            <div style={{ background: "var(--surface)", padding: "10px 16px", display: "grid", gridTemplateColumns: "100px 1fr 90px 90px 80px", gap: 12, fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              <div>Token</div>
              <div>Project</div>
              <div>Price</div>
              <div>Status</div>
              <div></div>
            </div>
            {projectTokens.map(p => (
              <div key={p.slug} style={{ padding: "12px 16px", display: "grid", gridTemplateColumns: "100px 1fr 90px 90px 80px", gap: 12, alignItems: "center", borderTop: "1px solid var(--border)" }}>
                <div style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--accent)" }}>{p.tokenSymbol}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{p.title}</div>
                  <div style={{ fontSize: 10, color: "var(--muted)" }}>{p.tagline}</div>
                </div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--muted)" }}>{p.tokenPrice || "pre-TGE"}</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--muted)" }}>pre-TGE</div>
                <Link href={`/projects/${p.slug}`} className="btn-connect" style={{ fontSize: 9, padding: "4px 10px", textDecoration: "none", textAlign: "center" }}>
                  View →
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="section">
        <div className="section-header">
          <div className="label">// stake</div>
          <div><h2 className="display-md">Stake $QUANTA</h2></div>
        </div>
        <div style={{ background: "var(--surface)", border: "1px solid var(--border-accent)", padding: "60px 32px", textAlign: "center" }}>
          <div style={{ fontSize: 32, marginBottom: 16 }}>⏳</div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 22, color: "var(--accent)", marginBottom: 12 }}>
            Stake $QUANTA
          </div>
          <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6, maxWidth: 460, margin: "0 auto" }}>
            QUANTA is deployed on Base. Staking opens after liquidity bootstrapping —
            stakers earn from protocol revenue and agent operations.
          </p>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--muted)", marginTop: 24, letterSpacing: "0.1em", textTransform: "uppercase" }}>
            // staking module · awaiting liquidity
          </div>
        </div>
      </section>

      <Footer />
    </PublicLayout>
  )
}
