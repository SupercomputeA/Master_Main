import Layout from "../components/Layout"
import Footer from "../components/Footer"

const inventory = [
  { sku: "AGENT-BASE-01", name: "Base Agent Deployment", price: "0.5 ETH", stock: 8, desc: "Pre-configured autonomous agent on Base chain." },
  { sku: "CONTRACT-AUDIT-01", name: "Smart Contract Audit", price: "2.0 ETH", stock: 3, desc: "Full audit with automated fuzz testing + report." },
  { sku: "TREASURY-PRO-01", name: "Treasury Management Setup", price: "1.5 ETH", stock: 5, desc: "Multi-sig treasury with automated rebalancing." },
  { sku: "SCOM-STAKE-01", name: "$SCOM Staking Vault", price: "100 SCOM", stock: 50, desc: "Stake $SCOM with tiered APY and lock options." },
  { sku: "FLEET-ACCESS-01", name: "Fleet Agent API Key", price: "0.1 ETH/mo", stock: 20, desc: "Access to all 13 agents via unified API." },
  { sku: "SCHOOL-MOD-01", name: "Web3 School Module Pass", price: "0.05 ETH", stock: 100, desc: "Single module access with certification." },
]

export default function StoreFront() {
  return (
    <Layout title="SUPERCOMPUTE · StoreFront">
      <section className="hero" id="storefront">
        <div className="hero-kicker">
          <div className="status-dot"></div>
          <span className="label">// storefront</span>
        </div>
        <h1 className="display-xl hero-title">
          SOVEREIGN<br /><em>INFRASTRUCTURE</em>
        </h1>
        <p className="hero-sub">
          Consulting, agents, and on-chain tooling for Web3 founders.
          Everything here is something we&apos;ve shipped ourselves.
        </p>
      </section>

      <section className="section">
        <div className="section-header">
          <div className="label">// inventory</div>
          <div>
            <h2 className="display-md">Available Products</h2>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 1, background: "var(--border)", border: "1px solid var(--border)" }}>
          <div style={{ background: "var(--surface)", padding: "10px 20px", display: "grid", gridTemplateColumns: "140px 1fr 80px 70px 100px", gap: 12, fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--muted)", textTransform: "uppercase" }}>
            <div>SKU</div>
            <div>Item</div>
            <div>Price</div>
            <div>Stock</div>
            <div></div>
          </div>
          {inventory.map((item, i) => (
            <div key={i} style={{ background: "var(--bg)", padding: "16px 20px", display: "grid", gridTemplateColumns: "140px 1fr 80px 70px 100px", gap: 12, alignItems: "center" }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--accent)" }}>{item.sku}</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{item.name}</div>
                <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{item.desc}</div>
              </div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--accent)" }}>{item.price}</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: item.stock > 10 ? "var(--muted)" : "var(--accent)" }}>
                {item.stock}
              </div>
              <button className="btn-connect" style={{ fontSize: 10, padding: "6px 12px" }}>Add to Cart</button>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <div className="label">// checkout</div>
          <div>
            <h2 className="display-md">Your Cart</h2>
          </div>
        </div>
        <div style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          padding: "40px 24px",
          textAlign: "center",
        }}>
          <div style={{ fontSize: 14, color: "var(--muted)", marginBottom: 12 }}>Cart is empty</div>
          <p style={{ fontSize: 12, color: "var(--muted)", maxWidth: 360, margin: "0 auto" }}>
            Connect your wallet and add items from inventory above to place an order.
            Checkout processes on-chain via smart contract.
          </p>
        </div>
      </section>

      <Footer />
    </Layout>
  )
}
