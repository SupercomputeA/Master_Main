import Layout from "@/components/Layout"
import Footer from "@/components/Footer"
import { useAccount, useConnect, useDisconnect } from "wagmi"
import { injected } from "wagmi/connectors"

export default function MintPage() {
  const { address, isConnected } = useAccount()
  const { connect } = useConnect()
  const { disconnect } = useDisconnect()

  const mintPrice = "0.0069 ETH"
  const supply = "1,000 Genesis NFTs"
  const contractAddress = "0x0000000000000000000000000000000000000000" // TBD — contract deploy in progress

  return (
    <Layout title="SUPERCOMPUTE · Mint">
      {/* Hero */}
      <section className="hero" style={{ paddingBottom: 48 }}>
        <div className="hero-kicker">
          <div className="status-dot" style={{ background: "var(--accent)" }}></div>
          <span className="label">// genesis drop</span>
        </div>
        <h1 className="display-xl hero-title">
          QUANTA<br /><em>SOVEREIGNA</em>
        </h1>
        <p className="hero-sub">
          The founding credential of the Protocol University of Base.
          Not a JPEG. Not a yield farm. A sovereign key.
        </p>
      </section>

      {/* Artwork preview */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div style={{
          background: "var(--surface)",
          border: "1px solid var(--border-accent)",
          padding: 32,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 32,
          alignItems: "center"
        }}>
          {/* Left: Artwork */}
          <div style={{ position: "relative" }}>
            <img
              src="https://v3b.fal.media/files/b/0a9b6686/FOB2oPAYsvdkYi19ep4HA_U6ZVaDBj.png"
              alt="QUANTA Sovereigna — SolarPunk 26"
              style={{
                width: "100%",
                borderRadius: 4,
                border: "1px solid var(--border-accent)"
              }}
            />
            <div style={{
              position: "absolute",
              bottom: 12,
              left: 12,
              background: "var(--accent)",
              color: "var(--bg)",
              fontFamily: "var(--font-mono)",
              fontSize: 9,
              letterSpacing: "0.1rem",
              textTransform: "uppercase",
              padding: "4px 10px"
            }}>
              SolarPunk 26
            </div>
          </div>

          {/* Right: Mint UI */}
          <div>
            <div className="label" style={{ marginBottom: 16 }}>// mint status</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 28 }}>
              {[
                { label: "Price", value: mintPrice },
                { label: "Supply", value: supply },
                { label: "Chain", value: "Base" },
                { label: "Standard", value: "ERC-721" },
              ].map(({ label, value }) => (
                <div key={label} style={{
                  display: "flex",
                  justifyContent: "space-between",
                  borderBottom: "1px solid var(--border)",
                  paddingBottom: 8
                }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--muted)", letterSpacing: "0.08rem", textTransform: "uppercase" }}>{label}</span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--accent)" }}>{value}</span>
                </div>
              ))}
            </div>

            {isConnected ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--muted)", marginBottom: 4 }}>
                  Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
                </div>
                <button className="btn btn-primary" style={{ width: "100%", padding: "14px" }}>
                  Mint QUANTA Sovereigna
                </button>
                <button onClick={() => disconnect()} className="btn" style={{ width: "100%" }}>
                  Disconnect
                </button>
                <p style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--muted)", textAlign: "center", marginTop: 4 }}>
                  You are claiming a seat at the table that built the infrastructure the next generation will inherit.
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <button
                  onClick={() => connect({ connector: injected() })}
                  className="btn btn-primary"
                  style={{ width: "100%", padding: "14px" }}
                >
                  Connect Wallet to Mint
                </button>
                <p style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--muted)", textAlign: "center", marginTop: 4 }}>
                  Mint price: {mintPrice} · MetaMask supported
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Utility */}
      <section className="section">
        <div className="section-header">
          <div className="label">// what you hold</div>
          <div>
            <h2 className="display-md">Holder Benefits</h2>
          </div>
        </div>
        <div className="operator-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
          {[
            { tag: "01", title: "Governance Voice", desc: "Vote on protocol upgrades, agent parameters, and treasury allocations with your NFT." },
            { tag: "02", title: "Sovereign Agent Access", desc: "Direct interface with Quanta Sovereigna — your on-chain sovereign AI." },
            { tag: "03", title: "Full Curriculum", desc: "Complete Supercompute education track: WALLET → DeFi → ReFi → INVESTMENTS." },
            { tag: "04", title: "CDP Automation", desc: "Deposit → Mint → Deploy → Accumulate → Burn loop, automated by agents." },
            { tag: "05", title: "NewsDesk Revenue Share", desc: "50% of all mint revenue flows to the $QUANTA treasury, governed by holders." },
            { tag: "06", title: "Early Lineage", desc: "Genesis holders build on-chain reputation that compounds over time." },
          ].map(({ tag, title, desc }) => (
            <div key={tag} className="op-cell">
              <div className="op-tag">{tag}</div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 13, fontWeight: 600, textTransform: "uppercase", marginTop: 10, marginBottom: 8 }}>{title}</div>
              <div style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.65 }}>{desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Not an investment */}
      <section className="section">
        <div style={{
          background: "var(--surface)",
          border: "1px solid var(--border-accent)",
          padding: "28px 32px",
          textAlign: "center"
        }}>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--accent)", letterSpacing: "0.08rem", textTransform: "uppercase", marginBottom: 12 }}>
            Not an investment vehicle.
          </p>
          <p style={{ fontSize: 14, color: "var(--fg)", lineHeight: 1.7, maxWidth: 560, margin: "0 auto" }}>
            QUANTA Sovereigna is a sovereign credential. It grants access to the Supercompute community,
            its educational content, and its collective governance. This is not financial advice.
            This is infrastructure.
          </p>
        </div>
      </section>

      {/* Footer */}
      <div style={{ marginTop: 48, borderTop: "1px solid var(--border)", paddingTop: 24 }}>
        <p style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--accent)", letterSpacing: "0.06rem", textAlign: "center" }}>
          I shine. You shine. We shine.
        </p>
      </div>

      <Footer />
    </Layout>
  )
}