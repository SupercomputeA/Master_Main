import Link from "next/link"

const modules = [
  { num: "01", name: "Wallets and Self-Custody", duration: "12 lessons · FREE" },
  { num: "02", name: "L1 vs L2 — Base Chain", duration: "8 lessons · FREE" },
  { num: "03", name: "DeFi Primitives", duration: "80 USDC" },
  { num: "04", name: "OpSec and Hardware Keys", duration: "80 USDC" },
  { num: "05", name: "ReFi and Impact", duration: "TBA" },
  { num: "06", name: "Community Building On-Chain", duration: "TBA" },
  { num: "07", name: "Agent and AI Ops", duration: "TBA" },
]

export default function School() {
  return (
    <section className="section" id="school">
      <div className="section-header">
        <div className="label">// ./school --curriculum</div>
        <div><h2 className="display-md">Web3 School</h2></div>
      </div>
      <div className="school-layout">
        <div className="school-modules">
          {modules.map((m) => (
            <div className="mod-row" key={m.num}>
              <div className="mod-num">{m.num}</div>
              <div className="mod-name">{m.name}</div>
              <div className="mod-duration">{m.duration}</div>
            </div>
          ))}
        </div>
        <div className="school-cta">
          <div className="label">// learn by doing</div>
          <h3 className="display-md">Web3<br />School</h3>
          <p>Complete all modules, earn an on-chain NFT credential and unlock TradeDesk access.</p>
          <div className="perks">
            <div className="perk">7 hands-on modules</div>
            <div className="perk">NFT credential on Base</div>
            <div className="perk">Guild.xyz community role</div>
            <div className="perk">TradeDesk unlock</div>
          </div>
          <Link href="/school" className="btn-school">// Start free</Link>
        </div>
      </div>
    </section>
  )
}
