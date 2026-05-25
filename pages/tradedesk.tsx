import Layout from "../components/Layout"
import Footer from "../components/Footer"
import { useState } from "react"
import { getSwapQuote } from "../lib/web3-utils"

const tokens = [
  { symbol: "USDC", address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" },
  { symbol: "WETH", address: "0x4200000000000000000000000000000000000006" },
  { symbol: "CBIC", address: "0x2Ae3F1Ec7F1F9442cfE37d567D334Fe80B7f8845" },
  { symbol: "$QUANTA", address: "0x0000000000000000000000000000000000000000" },
]

export default function TradeDesk() {
  const [fromToken, setFromToken] = useState(tokens[0])
  const [toToken, setToToken] = useState(tokens[1])
  const [amount, setAmount] = useState("")
  const [quote, setQuote] = useState<{ fromAmount: string; toAmount: string; price: string; route: string } | null>(null)
  const [quoting, setQuoting] = useState(false)

  const fetchQuote = async () => {
    if (!amount || Number(amount) <= 0) return
    setQuoting(true)
    const result = await getSwapQuote(fromToken.address, toToken.address, amount)
    setQuote(result)
    setQuoting(false)
  }

  const swapTokens = () => {
    setFromToken(toToken)
    setToToken(fromToken)
    setQuote(null)
  }

  return (
    <Layout title="SUPERCOMPUTE · TradeDesk">
      <section className="hero" id="tradedesk">
        <div className="hero-kicker">
          <div className="status-dot"></div>
          <span className="label">// admin · tradedesk</span>
        </div>
        <h1 className="display-xl hero-title">
          TRADE<br /><em>DESK</em>
        </h1>
        <p className="hero-sub">
          DeFi operations via Condor agent. CDP management, treasury ops,
          swap execution, and Polymarket monitoring on Base Chain.
        </p>
        <div className="hero-meta">
          <div className="meta-item"><div className="label-sm">// Status</div><div className="val">Observer</div></div>
          <div className="meta-item"><div className="label-sm">// Monitor</div><div className="val">24/7</div></div>
          <div className="meta-item"><div className="label-sm">// Chain</div><div className="val">Base</div></div>
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <div className="label">// swap</div>
          <div><h2 className="display-md">DEX Swap</h2></div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, background: "var(--border)", border: "1px solid var(--border)" }}>
          <div style={{ background: "var(--bg)", padding: "28px" }}>
            <div style={{ marginBottom: 20 }}>
              <div className="label-sm" style={{ marginBottom: 6 }}>From</div>
              <div style={{ display: "flex", gap: 8 }}>
                <select value={fromToken.symbol} onChange={e => setFromToken(tokens.find(t => t.symbol === e.target.value)!)}
                  style={selectStyle}>
                  {tokens.map(t => <option key={t.symbol}>{t.symbol}</option>)}
                </select>
                <input type="text" placeholder="0.0" value={amount} onChange={e => setAmount(e.target.value)}
                  style={{ ...inputStyle, flex: 1 }} />
              </div>
            </div>

            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <button onClick={swapTokens} className="btn-connect" style={{ fontSize: 10, padding: "4px 12px", background: "transparent", color: "var(--muted)", borderColor: "var(--border)" }}>
                ↓ ↑
              </button>
            </div>

            <div style={{ marginBottom: 20 }}>
              <div className="label-sm" style={{ marginBottom: 6 }}>To</div>
              <div style={{ display: "flex", gap: 8 }}>
                <select value={toToken.symbol} onChange={e => setToToken(tokens.find(t => t.symbol === e.target.value)!)}
                  style={selectStyle}>
                  {tokens.map(t => <option key={t.symbol}>{t.symbol}</option>)}
                </select>
                <input type="text" placeholder="0.0" value={quote?.toAmount ?? ""} readOnly
                  style={{ ...inputStyle, flex: 1, color: quote ? "var(--accent)" : "var(--muted)" }} />
              </div>
            </div>

            <button onClick={fetchQuote} disabled={quoting || !amount}
              className="btn-connect" style={{ width: "100%", fontSize: 11, padding: "12px", textAlign: "center" }}>
              {quoting ? "Quoting..." : "Get Quote"}
            </button>
          </div>

          <div style={{ background: "var(--bg)", padding: "28px", borderLeft: "1px solid var(--border)" }}>
            <div className="label-sm" style={{ marginBottom: 12 }}>// quote details</div>
            {quote ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                  <span style={{ color: "var(--muted)" }}>From</span>
                  <span>{quote.fromAmount} {fromToken.symbol}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                  <span style={{ color: "var(--muted)" }}>To</span>
                  <span style={{ color: "var(--accent)" }}>{quote.toAmount} {toToken.symbol}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                  <span style={{ color: "var(--muted)" }}>Route</span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--teal)" }}>{quote.route}</span>
                </div>
                <div style={{ borderTop: "1px solid var(--border)", paddingTop: 12, marginTop: 12 }}>
                  <button className="btn-connect" style={{ width: "100%", fontSize: 11, padding: "12px", textAlign: "center" }}>
                    Execute Swap →
                  </button>
                </div>
                <div style={{ fontSize: 9, color: "var(--muted)", fontFamily: "var(--font-mono)", marginTop: 8 }}>
                  Slippage: 2% · Gas: estimated · Network: Base
                </div>
              </div>
            ) : (
              <div style={{ padding: "40px 0", textAlign: "center", color: "var(--muted)", fontSize: 12 }}>
                Enter an amount and get a quote to see swap details.
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </Layout>
  )
}

const inputStyle: React.CSSProperties = {
  fontFamily: "var(--font-mono)", fontSize: 14, color: "var(--fg)",
  background: "var(--bg)", border: "1px solid var(--border)",
  padding: "10px 12px", outline: "none", width: "100%",
}

const selectStyle: React.CSSProperties = {
  fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--fg)",
  background: "var(--surface)", border: "1px solid var(--border)",
  padding: "10px 12px", outline: "none", minWidth: 110,
}
