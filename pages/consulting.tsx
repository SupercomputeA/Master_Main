import Layout from "../components/Layout"
import Footer from "../components/Footer"

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
    <Layout title="SUPERCOMPUTE · Consulting">
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

      <Footer />
    </Layout>
  )
}
