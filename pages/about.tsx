import Link from "next/link"
import PublicLayout from "../components/PublicLayout"
import Footer from "../components/Footer"

const timeline = [
  { year: "2013", event: "Occupy LA — First exposure to crypto. Started mining and building on Bitcoin." },
  { year: "2016", event: "Ethereum discovery. Began writing smart contracts and contributing to early DeFi protocols." },
  { year: "2018", event: "Survived the crypto winter. Built treasury management tools for DAOs." },
  { year: "2020", event: "DeFi Summer. Shipped first yield aggregation protocol. Onboarded 200+ farmers." },
  { year: "2022", event: "Base Chain launch. Migrated all operations to L2. Began agent development." },
  { year: "2024", event: "First autonomous agent (OpenClaw) deployed. Fleet expanded to 3 agents." },
  { year: "2025", event: "Quanta S launched on Virtuals Protocol. NewsDesk goes live." },
  { year: "2026", event: "Phase 1 complete. $QUANTA token, Web3 School, TradeDesk all operational." },
]

function GNode({ x, y, r, color, fill, label }: { x: number; y: number; r: number; color: string; fill: string; label: string }) {
  return (
    <>
      <circle cx={x} cy={y} r={r} fill={fill} stroke={color} strokeWidth={1.5} />
      <text x={x} y={y + 4} fontSize="9.5" fontWeight={600} textAnchor="middle" fill={color} fontFamily="var(--font-mono)">{label}</text>
    </>
  )
}

/* Supercompute ecosystem entity map — one operator at the hub, platforms as
   satellites, with a few cross-links. Static SVG in the Terminal Dossier palette. */
function EcosystemGraph() {
  const edge = { stroke: "rgba(201,163,58,.3)", strokeWidth: 1, strokeDasharray: "4,3" }
  const ring = { stroke: "rgba(111,163,229,.18)", strokeWidth: 1, strokeDasharray: "3,3" }
  const nodes = [
    { x: 500, y: 110, r: 34, color: "#6FA3E5", fill: "rgba(111,163,229,.12)", label: "Base" },
    { x: 775, y: 205, r: 36, color: "#C9A33A", fill: "rgba(201,163,58,.12)", label: "NewsDesk" },
    { x: 855, y: 405, r: 34, color: "#E0BE3F", fill: "rgba(224,190,63,.12)", label: "TradeDesk" },
    { x: 690, y: 590, r: 36, color: "#4ADE80", fill: "rgba(74,222,128,.1)", label: "School" },
    { x: 310, y: 590, r: 36, color: "#a78bfa", fill: "rgba(167,139,250,.13)", label: "Agents" },
    { x: 145, y: 405, r: 34, color: "#C9A33A", fill: "rgba(201,163,58,.12)", label: "$QUANTA" },
    { x: 225, y: 205, r: 34, color: "#6FA3E5", fill: "rgba(111,163,229,.12)", label: "Projects" },
  ]
  return (
    <svg viewBox="0 0 1000 700" preserveAspectRatio="xMidYMid meet" style={{ width: "100%", height: "auto", display: "block" }}>
      <defs>
        <filter id="kgGlowAbout"><feGaussianBlur stdDeviation="3" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
      </defs>
      {nodes.map((n) => <line key={`e${n.label}`} x1="500" y1="350" x2={n.x} y2={n.y} {...edge} />)}
      <line x1="225" y1="205" x2="775" y2="205" {...ring} />
      <line x1="145" y1="405" x2="310" y2="590" {...ring} />
      <line x1="690" y1="590" x2="855" y2="405" {...ring} />
      {nodes.map((n) => <GNode key={n.label} {...n} />)}
      <circle cx="500" cy="350" r="52" fill="rgba(201,163,58,.22)" stroke="#E0BE3F" strokeWidth={2} filter="url(#kgGlowAbout)" />
      <text x="500" y="346" fontSize="11" fontWeight={700} textAnchor="middle" fill="#C9A33A" letterSpacing="1" fontFamily="var(--font-mono)">ONE</text>
      <text x="500" y="361" fontSize="11" fontWeight={700} textAnchor="middle" fill="#C9A33A" letterSpacing="1" fontFamily="var(--font-mono)">OPERATOR</text>
    </svg>
  )
}

export default function About() {
  return (
    <PublicLayout title="SUPERCOMPUTE · About us">
      <div className="landing">
        <section className="l-hero">
          <div className="l-eyebrow">
            <span><span className="gold">./about</span> --supercompute</span>
            <span className="l-caret" />
          </div>
          <h1 className="headline">About us</h1>
          <div className="subheader">One operator since 2013</div>
          <p className="hero-copy">
            Not a company. Not a DAO. One person doing hands-on Web3 work for founders who
            ship. Fourteen projects, thirteen agents, zero incidents.
          </p>
          <div style={{ marginTop: 32, display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/auth" className="btn btn-primary">Work with us</Link>
            <Link href="/publishing" className="btn btn-outline">NewsDesk</Link>
          </div>
        </section>
      </div>

      <section className="section">
        <div className="section-header">
          <div className="label">// doctrine</div>
          <div>
            <h2 className="display-md">How I Work</h2>
          </div>
        </div>
        <div className="operator-grid">
          <div className="op-cell">
            <div className="op-tag">Hands-on</div>
            <p className="op-bio" style={{ fontSize: 13, lineHeight: 1.75, color: "var(--muted)" }}>
              I don&apos;t outsource the work. If you hire me, I&apos;m the one
              writing contracts, configuring agents, and managing your treasury.
            </p>
          </div>
          <div className="op-cell">
            <div className="op-tag">Values</div>
            <p className="op-bio" style={{ fontSize: 13, lineHeight: 1.75, color: "var(--muted)" }}>
              Principled before profitable. Liberation over extraction. No
              speculative plays, no roadmap theatre, no empty promises.
            </p>
          </div>
          <div className="op-cell">
            <div className="op-tag">Pro Expansion</div>
            <p className="op-bio" style={{ fontSize: 13, lineHeight: 1.75, color: "var(--muted)" }}>
              I build for scale. Every project is designed to grow beyond
              the initial scope — with agents, automation, and on-chain ops.
            </p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <div className="label">// timeline</div>
          <div>
            <h2 className="display-md">The Journey</h2>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 1, background: "var(--border)", border: "1px solid var(--border)" }}>
          {timeline.map((t, i) => (
            <div key={i} style={{ background: "var(--bg)", padding: "18px 24px", display: "grid", gridTemplateColumns: "80px 1fr", gap: 20, alignItems: "start" }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, color: "var(--accent)" }}>{t.year}</div>
              <div style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6 }}>{t.event}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <div className="label">// knowledge graph</div>
          <div>
            <h2 className="display-md">Knowledge Graph</h2>
            <p style={{ fontSize: 13, color: "var(--mono-blue)", marginTop: 8, maxWidth: 560, lineHeight: 1.7 }}>
              New here? A knowledge graph maps how things connect. This is all of Supercompute at
              a glance — one operator at the center, wired to every platform on Base. Follow a line
              to see what connects to what.
            </p>
          </div>
        </div>

        <div style={{ border: "1px solid var(--border-warm)", background: "#060b1c", position: "relative", overflow: "hidden", marginBottom: 24 }}>
          <div style={{ maxWidth: 780, margin: "0 auto", padding: "20px 16px" }}>
            <EcosystemGraph />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 1, border: "1px solid var(--border)", background: "var(--border)" }}>
          {[
            { color: "#C9A33A", label: "One Operator", desc: "Hands-on Web3 since 2013. The person behind every project — writing contracts, running agents, managing treasuries." },
            { color: "#6FA3E5", label: "Base", desc: "Every operation runs on Base, Ethereum's L2. Low-cost, fast, on-chain." },
            { color: "#6FA3E5", label: "Projects", desc: "A portfolio of shipped Web3 tools and initiatives, owned by the communities they serve." },
            { color: "#C9A33A", label: "NewsDesk", desc: "The publishing hub — protocol evaluations, project releases, class subjects, and live streaming." },
            { color: "#4ADE80", label: "School", desc: "Principled Web3 education with on-chain NFT credentials. Start free, scale up." },
            { color: "#E0BE3F", label: "TradeDesk", desc: "On-chain trading and desk automation. Coming soon, gated to $QUANTA holders." },
            { color: "#a78bfa", label: "Agents", desc: "An autonomous agent fleet handling on-chain operations around the clock." },
            { color: "#C9A33A", label: "$QUANTA", desc: "The token. Stake to unlock member modules, desk tiers, and gated content." },
          ].map((n) => (
            <div key={n.label} style={{ background: "var(--site-bg)", padding: "18px 20px", display: "flex", gap: 12 }}>
              <span style={{ flexShrink: 0, width: 10, height: 10, borderRadius: "50%", marginTop: 4, background: n.color, boxShadow: `0 0 8px ${n.color}66` }} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--cream)", marginBottom: 4 }}>{n.label}</div>
                <div style={{ fontSize: 11, color: "var(--mono-blue)", lineHeight: 1.6 }}>{n.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </PublicLayout>
  )
}
