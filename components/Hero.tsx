export default function Hero() {
  return (
    <section className="hero" id="home">
      <div className="hero-kicker">
        <div className="status-dot"></div>
        <span className="label">// operator terminal</span>
      </div>
      <h1 className="display-xl hero-title">
        WEB3<br />BUILT FOR<br /><em>LIBERATION</em>
      </h1>
      <p className="hero-sub">
        One operator, hands on the keyboard since 2013. Building sovereign Web3 infrastructure
        on Base Chain with a fleet of 13 autonomous agents. No anonymous teams. No platform theatre.
      </p>
      <div className="hero-actions">
        <a href="#consulting" className="btn btn-primary">// Book strategy call</a>
        <a href="#fleet" className="btn btn-outline">→ Meet the fleet</a>
      </div>
      <div className="hero-meta">
        <div className="meta-item">
          <div className="label-sm">// Operator since</div>
          <div className="val">2013</div>
        </div>
        <div className="meta-item">
          <div className="label-sm">// Active agents</div>
          <div className="val">13</div>
        </div>
        <div className="meta-item">
          <div className="label-sm">// Chain</div>
          <div className="val">Base L2</div>
        </div>
        <div className="meta-item">
          <div className="label-sm">// Projects shipped</div>
          <div className="val">14</div>
        </div>
      </div>
    </section>
  )
}
