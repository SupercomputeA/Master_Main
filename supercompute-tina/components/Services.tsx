const services = [
  { num: "01", name: "defi_onboarding.sh", desc: "Wallet setup, hardware key, OpSec. From zero to self-custody in 90 minutes.", price: "200 USDC", tag: "90 min" },
  { num: "02", name: "agent_buildout.sh", desc: "Build a Quanta-style autonomous agent for your protocol. Strategy + delivery.", price: "from 500 USDC" },
  { num: "03", name: "token_launch.sh", desc: "End-to-end playbook. Tokenomics, contracts on Base, post-launch ops.", price: "from 3,500 USDC" },
  { num: "04", name: "refi_strategy.sh", desc: "Treasury, runway, regenerative tokenomics for impact-aligned protocols.", price: "400 USDC", tag: "2 hr" },
]

export default function Services() {
  return (
    <section className="section" id="consulting">
      <div className="section-header">
        <div className="label">// services</div>
        <div><h2 className="display-md">Practice</h2></div>
      </div>
      <div className="services-list">
        {services.map((svc) => (
          <div className="svc-row" key={svc.num}>
            <div className="svc-num">{svc.num}</div>
            <div className="svc-info">
              <div className="svc-name">{svc.name}</div>
              <div className="svc-desc">{svc.desc}</div>
            </div>
            <div className="svc-price">
              {svc.price}
              {svc.tag && <span> · {svc.tag}</span>}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
