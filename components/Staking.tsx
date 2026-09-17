"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { getStakingStats } from "../lib/web3-utils"

export default function Staking() {
  const [stats, setStats] = useState({ apy: 0, tvl: 0, stakers: 0, rewardsDistributed: 0 })

  useEffect(() => {
    getStakingStats().then(setStats).catch(() => {})
  }, [])

  return (
    <section className="section" id="staking" style={{ background: "var(--surface)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
      <div className="section-header">
        <div className="label">// ./stake $QUANTA</div>
        <div><h2 className="display-md">$QUANTA Token</h2></div>
      </div>
      <div className="stake-grid">
        <div className="stake-cell">
          <div className="stake-val accent">{stats.apy > 0 ? `${stats.apy}%` : "—"}</div>
          <div className="stake-label">Est. APY</div>
        </div>
        <div className="stake-cell">
          <div className="stake-val">{stats.tvl > 0 ? `${stats.tvl.toLocaleString()} $QUANTA` : "—"}</div>
          <div className="stake-label">TVL</div>
        </div>
        <div className="stake-cell">
          <div className="stake-val">{stats.stakers > 0 ? stats.stakers : "—"}</div>
          <div className="stake-label">Stakers</div>
        </div>
        <div className="stake-cell" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Link href="/staking" className="btn-school">Stake</Link>
        </div>
      </div>
      <p className="terminal" style={{ marginTop: 16, fontSize: 10, letterSpacing: "0.08em" }}>
        // 50% of all sub-token trading fees route back to $QUANTA stakers via FeeRouter.sol. Live on Base · May 2026
        {stats.rewardsDistributed > 0 && ` · ${stats.rewardsDistributed.toLocaleString()} $QUANTA distributed`}
      </p>
    </section>
  )
}
