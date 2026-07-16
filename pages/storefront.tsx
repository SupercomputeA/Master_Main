import PublicLayout from "../components/PublicLayout"
import Footer from "../components/Footer"
import { useState } from "react"

type InventoryItem = {
  sku: string
  name: string
  price: string
  stock: number
  desc: string
  image: string
}

const inventory: InventoryItem[] = [
  { sku: "AGENT-BASE-01", name: "Base Agent Deployment", price: "0.5 ETH", stock: 8, desc: "Pre-configured autonomous agent on Base chain.", image: "https://placehold.co/400x300/0a1330/C9A33A?text=Agent+Deployment" },
  { sku: "CONTRACT-AUDIT-01", name: "Smart Contract Audit", price: "2.0 ETH", stock: 3, desc: "Full audit with automated fuzz testing + report.", image: "https://placehold.co/400x300/0a1330/C9A33A?text=Contract+Audit" },
  { sku: "TREASURY-PRO-01", name: "Treasury Management Setup", price: "1.5 ETH", stock: 5, desc: "Multi-sig treasury with automated rebalancing.", image: "https://placehold.co/400x300/0a1330/C9A33A?text=Treasury+Mgmt" },
  { sku: "SCOM-STAKE-01", name: "$QUANTA Staking Vault", price: "100 QUANTA", stock: 50, desc: "Stake $QUANTA with tiered APY and lock options.", image: "https://placehold.co/400x300/0a1330/C9A33A?text=Staking+Vault" },
  { sku: "FLEET-ACCESS-01", name: "Fleet Agent API Key", price: "0.1 ETH/mo", stock: 20, desc: "Access to all 13 fleet agents via unified API.", image: "https://placehold.co/400x300/0a1330/C9A33A?text=Fleet+API" },
  { sku: "SCHOOL-MOD-01", name: "Web3 School Module Pass", price: "0.05 ETH", stock: 100, desc: "Single module access with certification.", image: "https://placehold.co/400x300/0a1330/C9A33A?text=School+Pass" },
]

type CartItem = { sku: string; quantity: number }

export default function StoreFront() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [checkoutStep, setCheckoutStep] = useState<"cart" | "review" | "confirm" | "done">("cart")

  const addToCart = (sku: string) => {
    setCart(prev => {
      const existing = prev.find(c => c.sku === sku)
      if (existing) return prev.map(c => c.sku === sku ? { ...c, quantity: c.quantity + 1 } : c)
      return [...prev, { sku, quantity: 1 }]
    })
  }

  const updateQty = (sku: string, qty: number) => {
    if (qty <= 0) return setCart(prev => prev.filter(c => c.sku !== sku))
    setCart(prev => prev.map(c => c.sku === sku ? { ...c, quantity: qty } : c))
  }

  const removeFromCart = (sku: string) => {
    setCart(prev => prev.filter(c => c.sku !== sku))
  }

  const cartTotal = cart.reduce((sum, c) => {
    const item = inventory.find(i => i.sku === c.sku)
    const priceNum = parseFloat(item?.price.replace(/[^0-9.]/g, "") || "0")
    return sum + priceNum * c.quantity
  }, 0)

  const cartCount = cart.reduce((sum, c) => sum + c.quantity, 0)

  return (
    <PublicLayout title="SUPERCOMPUTE · Storefront">
      <section className="hero" id="storefront">
        <div className="hero-kicker">
          <div className="status-dot"></div>
          <span className="label">// storefront</span>
          {cartCount > 0 && (
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--accent)", border: "1px solid var(--accent-dim)", padding: "2px 8px", marginLeft: 8 }}>
              {cartCount} in cart
            </span>
          )}
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
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 1, background: "var(--border)", border: "1px solid var(--border)" }}>
          {inventory.map((item) => (
            <div key={item.sku} style={{ background: "var(--bg)", padding: 0, display: "flex", flexDirection: "column" }}>
              <div style={{ height: 140, background: `url(${item.image}) center/cover no-repeat`, borderBottom: "1px solid var(--border)", display: "flex", alignItems: "flex-end", padding: 10 }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: "var(--accent)", background: "rgba(10,19,48,0.8)", border: "1px solid var(--border)", padding: "2px 6px" }}>
                  {item.sku}
                </span>
              </div>
              <div style={{ padding: "16px 18px", flex: 1, display: "flex", flexDirection: "column" }}>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{item.name}</div>
                <div style={{ fontSize: 11, color: "var(--muted)", lineHeight: 1.5, marginBottom: 12, flex: 1 }}>{item.desc}</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--accent)" }}>{item.price}</span>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--muted)", marginLeft: 8 }}>stock: {item.stock}</span>
                  </div>
                  <button onClick={() => addToCart(item.sku)} className="btn-connect" style={{ fontSize: 10, padding: "6px 14px" }}>
                    + Cart
                  </button>
                </div>
              </div>
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

        {checkoutStep === "done" ? (
          <div style={{ background: "var(--surface)", border: "1px solid var(--teal)", padding: "60px 24px", textAlign: "center" }}>
            <div style={{ fontSize: 32, color: "var(--teal)", marginBottom: 12 }}>●</div>
            <div className="display-md" style={{ marginBottom: 8 }}>Order Submitted</div>
            <p style={{ fontSize: 12, color: "var(--muted)", maxWidth: 400, margin: "0 auto" }}>
              Your order is being processed on-chain. Check your wallet for the transaction receipt.
              You&apos;ll receive a confirmation once finalized.
            </p>
            <button onClick={() => { setCart([]); setCheckoutStep("cart") }} className="btn-connect" style={{ marginTop: 20, fontSize: 10, padding: "8px 20px" }}>
              ← Back to Store
            </button>
          </div>
        ) : cart.length === 0 ? (
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "60px 24px", textAlign: "center" }}>
            <div style={{ fontSize: 14, color: "var(--muted)", marginBottom: 12 }}>Cart is empty</div>
            <p style={{ fontSize: 12, color: "var(--muted)", maxWidth: 360, margin: "0 auto" }}>
              Add items from inventory above to place an order.
              Checkout processes on-chain via smart contract.
            </p>
          </div>
        ) : (
          <div>
            {checkoutStep === "cart" && (
              <div>
                <div style={{ display: "flex", flexDirection: "column", gap: 1, background: "var(--border)", border: "1px solid var(--border)" }}>
                  <div style={{ background: "var(--surface)", padding: "10px 20px", display: "grid", gridTemplateColumns: "1fr 80px 100px 100px", gap: 12, fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--muted)", textTransform: "uppercase" }}>
                    <div>Item</div>
                    <div>Price</div>
                    <div>Qty</div>
                    <div></div>
                  </div>
                  {cart.map((c) => {
                    const item = inventory.find(i => i.sku === c.sku)!
                    return (
                      <div key={c.sku} style={{ background: "var(--bg)", padding: "14px 20px", display: "grid", gridTemplateColumns: "1fr 80px 100px 100px", gap: 12, alignItems: "center" }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600 }}>{item.name}</div>
                          <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--accent)" }}>{item.sku}</div>
                        </div>
                        <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--accent)" }}>{item.price}</div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <button onClick={() => updateQty(c.sku, c.quantity - 1)} style={{ fontFamily: "var(--font-mono)", fontSize: 12, background: "transparent", color: "var(--muted)", border: "1px solid var(--border)", padding: "2px 8px", cursor: "pointer" }}>−</button>
                          <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, minWidth: 20, textAlign: "center" }}>{c.quantity}</span>
                          <button onClick={() => updateQty(c.sku, c.quantity + 1)} style={{ fontFamily: "var(--font-mono)", fontSize: 12, background: "transparent", color: "var(--muted)", border: "1px solid var(--border)", padding: "2px 8px", cursor: "pointer" }}>+</button>
                        </div>
                        <button onClick={() => removeFromCart(c.sku)} className="btn-connect" style={{ fontSize: 9, padding: "4px 10px", background: "transparent", color: "var(--danger)", borderColor: "var(--danger)" }}>Remove</button>
                      </div>
                    )
                  })}
                </div>
                <div style={{ marginTop: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--accent)" }}>
                    Total: {cartTotal.toFixed(2)} ETH
                  </div>
                  <button onClick={() => setCheckoutStep("review")} className="btn-connect" style={{ fontSize: 11, padding: "10px 24px" }}>
                    Review Order →
                  </button>
                </div>
              </div>
            )}

            {checkoutStep === "review" && (
              <div style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "28px" }}>
                <div className="display-md" style={{ marginBottom: 20 }}>Order Review</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 1, background: "var(--border)", border: "1px solid var(--border)", marginBottom: 20 }}>
                  {cart.map((c) => {
                    const item = inventory.find(i => i.sku === c.sku)!
                    return (
                      <div key={c.sku} style={{ background: "var(--bg)", padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <div style={{ fontSize: 13 }}>{item.name} × {c.quantity}</div>
                          <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--accent)" }}>{item.sku}</div>
                        </div>
                        <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--accent)" }}>
                          {(parseFloat(item.price.replace(/[^0-9.]/g, "")) * c.quantity).toFixed(2)} ETH
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "0 20px", marginBottom: 20 }}>
                  <span style={{ fontSize: 13, color: "var(--muted)" }}>Total</span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 16, color: "var(--accent)" }}>{cartTotal.toFixed(2)} ETH</span>
                </div>
                <div style={{ background: "var(--bg-alt)", border: "1px solid var(--border)", padding: "16px", marginBottom: 20, fontSize: 12, color: "var(--muted)" }}>
                  Connect your wallet to confirm. Payment processes on-chain via smart contract.
                  Gas fees apply. No refunds once confirmed.
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <button onClick={() => setCheckoutStep("cart")} className="btn-connect" style={{ background: "transparent", color: "var(--muted)", borderColor: "var(--border)", fontSize: 10, padding: "8px 18px" }}>← Edit Cart</button>
                  <button onClick={() => setCheckoutStep("confirm")} className="btn-connect" style={{ fontSize: 11, padding: "10px 24px" }}>Confirm & Pay →</button>
                </div>
              </div>
            )}

            {checkoutStep === "confirm" && (
              <div>
                <div style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "28px", marginBottom: 16 }}>
                  <div className="display-md" style={{ marginBottom: 16 }}>Confirm Transaction</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 1, background: "var(--border)", border: "1px solid var(--border)", marginBottom: 20 }}>
                    <div style={{ background: "var(--bg)", padding: "14px 20px", display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 12, color: "var(--muted)" }}>Items</span>
                      <span style={{ fontSize: 13 }}>{cartCount}</span>
                    </div>
                    <div style={{ background: "var(--bg)", padding: "14px 20px", display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 12, color: "var(--muted)" }}>Total</span>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--accent)" }}>{cartTotal.toFixed(2)} ETH</span>
                    </div>
                    <div style={{ background: "var(--bg)", padding: "14px 20px", display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 12, color: "var(--muted)" }}>Network</span>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--accent)" }}>Base Chain</span>
                    </div>
                    <div style={{ background: "var(--bg)", padding: "14px 20px", display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 12, color: "var(--muted)" }}>Wallet</span>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--muted)" }}>Connected</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <button onClick={() => setCheckoutStep("review")} className="btn-connect" style={{ background: "transparent", color: "var(--muted)", borderColor: "var(--border)", fontSize: 10, padding: "8px 18px" }}>← Back</button>
                    <button onClick={() => setCheckoutStep("done")} className="btn-connect" style={{ fontSize: 11, padding: "10px 24px" }}>Submit Order ✓</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      <Footer />
    </PublicLayout>
  )
}
