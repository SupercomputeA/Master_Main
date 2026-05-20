export default function Staking() {
  return (
    <section className="section" id="staking" style={{ background: "var(--surface)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
      <div className="section-header">
        <div className="label">// ./stake $SCOM</div>
        <div><h2 className="display-md">$SCOM Token</h2></div>
      </div>
      <div className="stake-grid">
        <div className="stake-cell">
          <div className="stake-val accent">~12%</div>
          <div className="stake-label">Est. APY</div>
        </div>
        <div className="stake-cell">
          <div className="stake-val">—</div>
          <div className="stake-label">TVL</div>
        </div>
        <div className="stake-cell">
          <div className="stake-val">—</div>
          <div className="stake-label">Stakers</div>
        </div>
        <div className="stake-cell" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <a href="#" className="btn-school">Stake</a>
        </div>
      </div>
      <p className="terminal" style={{ marginTop: 16, fontSize: 10, letterSpacing: "0.08em" }}>
        // 50% of all sub-token trading fees route back to $SCOM stakers via FeeRouter.sol. Live on Base · May 2026
      </p>
    </section>
  )
}
