import PublicLayout from "../components/PublicLayout"
import Footer from "../components/Footer"

const inputStyle: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: 12,
  color: "var(--fg)",
  background: "var(--surface)",
  border: "1px solid var(--border)",
  padding: "10px 14px",
  width: "100%",
  outline: "none",
}

const questions = [
  { id: "q1", q: "What type of engagement do you need?", type: "select", options: ["Full-spectrum Web3 Ops", "Smart Contract Development", "Agent Integration", "Treasury Management", "Infrastructure Setup", "Community Growth", "Custom Curriculum", "Monthly Retainer"] },
  { id: "q2", q: "Describe your project or startup in 1-2 sentences.", type: "textarea" },
  { id: "q3", q: "What blockchain ecosystem are you building on?", type: "select", options: ["Base", "Ethereum", "Arbitrum", "Optimism", "Polygon", "Solana", "Other / Not sure"] },
  { id: "q4", q: "Do you have an existing team or are you solo?", type: "select", options: ["Solo founder", "Small team (2-5)", "Growing team (6-15)", "Established org (15+)"] },
  { id: "q5", q: "What's your timeline?", type: "select", options: ["ASAP — within 2 weeks", "Short-term — 1-3 months", "Medium — 3-6 months", "Long-term — 6+ months", "Just exploring for now"] },
  { id: "q6", q: "Do you have funding allocated for this engagement?", type: "select", options: ["Yes — budget approved", "In progress — seeking approval", "Not yet — exploring costs", "Prefers revenue share model"] },
  { id: "q7", q: "What's your primary goal?", type: "textarea" },
  { id: "q8", q: "How did you hear about Supercompute?", type: "select", options: ["Twitter / X", "Farcaster", "Friend / Referral", "GitHub", "Web3 School", "NewsDesk / Press", "Other"] },
]

const salesTiles = [
  { tag: "Strategy", title: "Launch Strategy", price: "0.5 ETH", desc: "Tokenomics design, launch roadmap, and go-to-market for new protocols." },
  { tag: "Contracts", title: "Smart Contract Dev", price: "Custom", desc: "Solidity contracts, audits, and deployment — ERC-20, NFTs, DAO frameworks." },
  { tag: "Agents", title: "Agent Integration", price: "1.0 ETH", desc: "Custom agent deployment on Virtuals or ElizaOS. Fleet management included." },
  { tag: "Treasury", title: "Treasury Ops", price: "0.3 ETH/mo", desc: "Multi-sig management, yield strategies, automated rebalancing." },
  { tag: "Infra", title: "Infrastructure", price: "0.8 ETH", desc: "RPC nodes, IPFS pins, indexer setup, and Cloudflare Workers." },
  { tag: "Growth", title: "Community Growth", price: "0.4 ETH/mo", desc: "On-chain analytics, incentive design, moderation bots." },
  { tag: "School", title: "Custom Curriculum", price: "2.0 ETH", desc: "Tailored Web3 training for your team. From basics to production agents." },
  { tag: "Retainer", title: "Monthly Retainer", price: "3.0 ETH/mo", desc: "Full-spectrum Web3 ops. Priority access, unlimited consultations." },
]

export default function Consulting() {
  return (
    <PublicLayout title="SUPERCOMPUTE · Consulting">
      <section className="hero" id="consulting">
        <div className="hero-kicker">
          <div className="status-dot"></div>
          <span className="label">// consulting</span>
        </div>
        <h1 className="display-xl hero-title">
          HANDS-ON<br /><em>CONSULTING</em>
        </h1>
        <p className="hero-sub">
          I work directly with founders. No account managers, no platform.
          You get the person who built 14 projects and thirteen agents.
        </p>
        <div className="hero-actions">
          <a href="https://calendly.com/ora_mi" className="btn btn-primary">// Book strategy call</a>
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <div className="label">// services</div>
          <div>
            <h2 className="display-md">Engagement Options</h2>
          </div>
        </div>
        <div className="operator-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 1, background: "var(--border)", border: "1px solid var(--border)" }}>
          {salesTiles.map((tile, i) => (
            <div key={i} style={{ background: "var(--bg)", padding: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                <div>
                  <div className="op-tag" style={{ marginBottom: 8 }}>{tile.tag}</div>
                  <div style={{ fontSize: 15, fontWeight: 600 }}>{tile.title}</div>
                </div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--accent)", whiteSpace: "nowrap" }}>{tile.price}</div>
              </div>
              <p style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.6 }}>{tile.desc}</p>
              <button className="btn-connect" style={{ fontSize: 10, padding: "6px 14px", marginTop: 12 }}>Inquire</button>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <div className="label">// intake</div>
          <div><h2 className="display-md">Project Questionnaire</h2></div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 1, background: "var(--border)", border: "1px solid var(--border)" }}>
          {questions.map((item) => (
            <div key={item.id} style={{ background: "var(--bg)", padding: "20px 24px" }}>
              <div className="label-sm" style={{ marginBottom: 8 }}>{item.id.toUpperCase()} — {item.q}</div>
              {item.type === "textarea" ? (
                <textarea rows={3} placeholder="Your answer..." style={inputStyle} />
              ) : (
                <select style={inputStyle} defaultValue="">
                  <option value="" disabled>Select an option</option>
                  {item.options?.map((o) => <option key={o}>{o}</option>)}
                </select>
              )}
            </div>
          ))}
        </div>
        <div style={{ marginTop: 24, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 11, color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
            Responses are confidential and reviewed within 24h
          </div>
          <button className="btn-connect">Submit Questionnaire</button>
        </div>
      </section>

      <Footer />
    </PublicLayout>
  )
}
