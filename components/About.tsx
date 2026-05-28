export default function About() {
  return (
    <section className="section" id="about">
      <div className="section-header">
        <div className="label">// whoami</div>
        <div>
          <h2 className="display-md">Operator since 2013</h2>
          <p style={{ color: "var(--muted)", fontSize: 13, lineHeight: 1.7, marginTop: 8 }}>
            I started in 2013 — Occupy LA, early DeFi, the long winter. Fourteen projects shipped since.
            I don&apos;t outsource the work that matters; if you hire me, I&apos;m the one on the keyboard.
          </p>
        </div>
      </div>
      <div className="operator-grid">
        <div className="op-cell">
          <div className="op-tag">Operator</div>
          <div className="op-stat">14</div>
          <div className="op-stat-label">Projects Shipped</div>
        </div>
        <div className="op-cell">
          <div className="op-tag">Chain</div>
          <div className="op-stat">Base L2</div>
          <div className="op-stat-label">Primary Network</div>
        </div>
        <div className="op-cell" style={{ gridColumn: "1 / -1" }}>
          <div className="op-tag">Doctrine</div>
          <p className="op-bio" style={{ fontSize: 13, lineHeight: 1.75, color: "var(--muted)" }}>
            <strong>Hands-on.</strong> I work directly with founders launching projects on Base.{' '}
            <strong>Values in order.</strong> No speculative plays, no roadmap theatre, no platform promises.{' '}
            <strong>Pro expansion.</strong> I help protocols scale their operations with real agents on real chains.
          </p>
        </div>
      </div>
    </section>
  )
}
