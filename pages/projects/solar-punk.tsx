import dynamic from "next/dynamic"
import PublicLayout from "../../components/PublicLayout"
import Footer from "../../components/Footer"

const FarcasterFeed = dynamic(() => import("../../components/FarcasterFeed"), { ssr: false })

const features = [
  {
    id: "token",
    label: "Custom Token",
    title: "$QUANTA · $SCOM",
    desc: "Dual-token economy. $QUANTA governs the ecosystem. $SCOM gates access to School, TradeDesk, and agent API — staked for security, earned for participation.",
    tag: "LIVE",
    color: "var(--accent)",
  },
  {
    id: "dao",
    label: "Governance",
    title: "On-Chain DAO",
    desc: "Token-weighted proposals for treasury allocation, agent strategy, protocol investments, and platform parameters. Quorum-based voting on Base via Tally.",
    tag: "BUILD",
    color: "var(--accent)",
  },
  {
    id: "staking",
    label: "Staking + Security",
    title: "Community Staking",
    desc: "Time-locked staking with escalating rewards. Lock $SCOM for 30/90/180 days to secure the network, earn yield, and unlock tiered access. Penalty-based early withdrawal.",
    tag: "LIVE",
    color: "var(--accent)",
  },
  {
    id: "virtuals-agent",
    label: "Virtuals Protocol",
    title: "Agent for Small Business",
    desc: "Deploy a Virtuals Protocol agent on Base to automate treasury ops, manage LP positions, run social campaigns, and execute on-chain workflows — no code required.",
    tag: "PROPOSED",
    color: "var(--accent)",
    link: "https://app.virtuals.io",
  },
  {
    id: "splits",
    label: "0xSplits",
    title: "Streaming Splits",
    desc: "Programmatic revenue splitting via 0xSplits. Automate distribution to contributors, DAO treasury, liquidity pools, and staking rewards — all in one contract.",
    tag: "INTEGRATE",
    color: "var(--accent)",
    link: "https://splits.org",
  },
  {
    id: "farcaster",
    label: "Farcaster",
    title: "Marketing on Farcaster",
    desc: "Agent-published casts for protocol evaluations, governance proposals, and ecosystem updates. On-chain social with Farcaster frames for interactive treasury votes.",
    tag: "ACTIVE",
    color: "var(--accent)",
    link: "https://warpcast.com/supercompute",
  },
  {
    id: "rail",
    label: "Stateside Rail",
    title: "Default on Base",
    desc: "Base Chain as the settlement layer. Coinbase L2 provides fiat on-ramp, institutional custody, and合规 rails — enabling real-world business flows on-chain.",
    tag: "LIVE",
    color: "var(--accent)",
  },
  {
    id: "liquidity",
    label: "Community Liquidity",
    title: "Held Liquidity Pools",
    desc: "Community-owned LP positions on Aerodrome. Yield from trading fees flows back to stakers and DAO treasury. Transparent, non-custodial, and governed by token holders.",
    tag: "BUILD",
    color: "var(--accent)",
  },
]

export default function SolarPunk() {
  return (
    <PublicLayout title="SUPERCOMPUTE · Solar Punk">
      <section className="hero" style={{
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: "-40%", right: "-10%", width: "600px", height: "600px",
          borderRadius: "50%", background: "radial-gradient(circle, rgba(212,175,55,0.12) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", bottom: "-30%", left: "-5%", width: "400px", height: "400px",
          borderRadius: "50%", background: "radial-gradient(circle, rgba(212,175,55,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        <div style={{ position: "relative", zIndex: 1 }}>
          <div className="hero-kicker">
            <div className="status-dot"></div>
            <span className="label" style={{ color: "var(--accent)" }}>// solar punk · proposal</span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--accent)", border: "1px solid var(--accent-dim)", padding: "2px 8px", marginLeft: 8 }}>
              PHASE 2
            </span>
          </div>
          <h1 className="display-xl hero-title" style={{ fontSize: "clamp(48px, 10vw, 120px)", lineHeight: 0.85, marginBottom: 24 }}>
            SOLAR<br /><em style={{ color: "var(--accent)" }}>PUNK</em>
          </h1>
          <p className="hero-sub" style={{ maxWidth: 600, fontSize: 14, color: "var(--fg)" }}>
            Sovereign infrastructure meets regenerative finance. Tokenized governance, community-owned liquidity,
            and autonomous agents building the on-chain economy on Base.
          </p>
          <div className="hero-actions" style={{ marginTop: 32 }}>
            <a href="#proposal" className="btn btn-primary" style={{ background: "var(--accent)", borderColor: "var(--accent)" }}>→ View Proposal</a>
            <a href="https://warpcast.com/supercompute" className="btn btn-outline">Follow on Farcaster</a>
          </div>
        </div>
      </section>

      <section className="section" id="proposal">
        <div className="section-header">
          <div className="label" style={{ color: "var(--accent)" }}>// features</div>
          <div><h2 className="display-md">Solar Punk Proposal</h2></div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 1, background: "var(--border)", border: "1px solid var(--border)" }}>
          {features.map((f) => (
            <div key={f.id} style={{
              background: "var(--bg)", padding: "28px 24px",
              display: "flex", flexDirection: "column",
              transition: "background 0.2s",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div className="label-sm" style={{ color: f.color }}>// {f.label}</div>
                <span style={{
                  fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: "0.1em", textTransform: "uppercase",
                  padding: "2px 8px", border: `1px solid ${f.color}33`, color: f.color,
                }}>
                  {f.tag}
                </span>
              </div>
              <div style={{
                fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, textTransform: "uppercase",
                letterSpacing: "0.02em", marginBottom: 10, color: f.color,
              }}>
                {f.title}
              </div>
              <p style={{ fontSize: 12, color: "var(--fg)", lineHeight: 1.7, flex: 1, marginBottom: 16 }}>
                {f.desc}
              </p>
              {f.link && (
                <a href={f.link} target="_blank" rel="noopener noreferrer" style={{
                  fontFamily: "var(--font-mono)", fontSize: 10, color: f.color,
                  textDecoration: "none", borderBottom: `1px solid ${f.color}44`,
                  alignSelf: "flex-start", paddingBottom: 2,
                }}>
                  → {f.link.replace("https://", "")}
                </a>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <div className="label" style={{ color: "var(--accent)" }}>// roadmap</div>
          <div><h2 className="display-md">Phase 2 Milestones</h2></div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 1, background: "var(--border)", border: "1px solid var(--border)" }}>
          {[
            { phase: "Q3 2026", title: "Token Launch + DAO Genesis", desc: "$QUANTA TGE on Base. DAO constitution vote. Initial staking pools open.", status: "planned" },
            { phase: "Q3 2026", title: "Virtuals Agent Deployment", desc: "Small business agent template on Virtuals Protocol. No-code agent deployment.", status: "planned" },
            { phase: "Q4 2026", title: "Community Liquidity Pools", desc: "Aerodrome LP positions governed by DAO. Yield distribution to stakers.", status: "planned" },
            { phase: "Q4 2026", title: "0xSplits Integration", desc: "Automated revenue splitting for DAO contributors and liquidity providers.", status: "planned" },
            { phase: "Q1 2027", title: "Stateside Compliance Rail", desc: "Full合规 on-ramp/off-ramp via Coinbase. Institutional custody integration.", status: "planned" },
          ].map((m, i) => (
            <div key={i} style={{
              background: "var(--bg)", padding: "18px 24px",
              display: "grid", gridTemplateColumns: "80px 1fr", gap: 20, alignItems: "start",
            }}>
              <div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--accent)", marginBottom: 2 }}>{m.phase}</div>
                <span style={{
                  fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: "0.1em",
                  padding: "2px 6px", border: "1px solid var(--border)", color: "var(--fg)",
                }}>
                  {m.status}
                </span>
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{m.title}</div>
                <p style={{ fontSize: 11, color: "var(--fg)", lineHeight: 1.6 }}>{m.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <div className="label" style={{ color: "var(--accent)" }}>// timeline</div>
          <div><h2 className="display-md">Funding Timeline</h2></div>
        </div>
        <div style={{ position: "relative", paddingLeft: 32 }}>
          <div style={{
            position: "absolute", left: 10, top: 0, bottom: 0, width: 2,
            background: "var(--accent-dim)",
          }} />
          {[
            { name: "NFT", type: "Profile Photo", raise: "Conviction Raise", color: "var(--accent)" },
            { name: "T-Shirt", type: "Community", raise: "Conviction Raise", color: "var(--accent)" },
            { name: "Nomad", type: "Small Business", raise: "Wellbeing Vending", color: "var(--accent)" },
            { name: "HomeSchool", type: "Education", raise: "Conviction Raise", color: "var(--accent)" },
            { name: "OSE", type: "Open Source Ecology", raise: "Serious Raise", color: "var(--accent)" },
            { name: "Vertical Farming", type: "Infrastructure", raise: "Serious Raise", color: "var(--accent)" },
            { name: "DAO", type: "Governance", raise: "A DAO", color: "var(--accent)" },
            { name: "Roaming", type: "Afropunk / Solar Punk", raise: "Final Boss Raise", color: "var(--accent)" },
          ].map((item, i) => (
            <div key={i} style={{
              position: "relative", padding: "20px 0 20px 32px",
              borderBottom: i < 7 ? "1px solid var(--border)" : "none",
            }}>
              <div style={{
                position: "absolute", left: -26, top: 24, width: 14, height: 14,
                borderRadius: "50%", background: "var(--bg)", border: "2px solid var(--accent)",
              }} />
              <div style={{ display: "grid", gridTemplateColumns: "140px 1fr auto", gap: 16, alignItems: "center" }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, color: "var(--accent)" }}>
                  {item.name}
                </div>
                <div>
                  <div style={{ fontSize: 12, color: "var(--fg)", lineHeight: 1.5 }}>{item.type}</div>
                </div>
                <span style={{
                  fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase",
                  padding: "4px 10px", border: "1px solid var(--accent-dim)", color: "var(--accent)",
                  whiteSpace: "nowrap",
                }}>
                  {item.raise}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <div className="label" style={{ color: "var(--accent)" }}>// farcaster</div>
          <div><h2 className="display-md">Live Feed</h2></div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <p style={{ fontSize: 12, color: "var(--fg)", lineHeight: 1.6 }}>
            Latest from the Supercompute channel. Powered by Neynar + Snapchain.
          </p>
        </div>
        <FarcasterFeed fid="" />
      </section>

      <section className="section">
        <div className="section-header">
          <div className="label" style={{ color: "var(--accent)" }}>// links</div>
          <div><h2 className="display-md">Ecosystem</h2></div>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {[
            { label: "Virtuals Protocol", href: "https://app.virtuals.io", desc: "Deploy agents on Base" },
            { label: "0xSplits", href: "https://splits.org", desc: "Streaming revenue splits" },
            { label: "Farcaster", href: "https://warpcast.com/supercompute", desc: "On-chain social" },
            { label: "Aerodrome", href: "https://aerodrome.finance", desc: "Community LP pools" },
            { label: "Base Chain", href: "https://base.org", desc: "Settlement layer" },
            { label: "Tally", href: "https://tally.xyz", desc: "DAO governance" },
          ].map((link) => (
            <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer" style={{
              background: "var(--surface)", border: "1px solid var(--border)", padding: "14px 18px",
              textDecoration: "none", display: "flex", flexDirection: "column", gap: 4,
              minWidth: 180, flex: 1,
            }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--accent)" }}>{link.label}</div>
              <div style={{ fontSize: 11, color: "var(--fg)" }}>{link.desc}</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--accent)", marginTop: 4 }}>→</div>
            </a>
          ))}
        </div>
      </section>

      <Footer />
    </PublicLayout>
  )
}
