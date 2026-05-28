"use client"

import { useEffect, useState } from "react"
import Layout from "../../components/Layout"
import Footer from "../../components/Footer"
import { useAuth } from "../../lib/auth"
import { getStakingStats, getStakingPosition } from "../../lib/web3-utils"

export default function AppStaking() {
  const { session, profile } = useAuth()
  const [stats, setStats] = useState({ apy: 0, tvl: 0, stakers: 0, rewardsDistributed: 0 })
  const [position, setPosition] = useState({ stakedAmount: "0", pendingRewards: "0", lastClaim: null as string | null })
  const [stakeInput, setStakeInput] = useState("")

  useEffect(() => {
    getStakingStats().then(setStats).catch(() => {})
  }, [])

  useEffect(() => {
    if (profile?.name && profile.name.startsWith("0x")) {
      getStakingPosition(profile.name).then(setPosition).catch(() => {})
    }
  }, [profile])

  return (
    <Layout title="SUPERCOMPUTE · Staking">
      <section className="hero" id="app-staking">
        <div className="hero-kicker"><div className="status-dot"></div><span className="label">// app · staking</span></div>
        <h1 className="display-xl hero-title">STAKE<br /><em>$QUANTA</em></h1>
        <p className="hero-sub">Stake $QUANTA to earn rewards, unlock governance, and access gated content. Rewards accrue from protocol revenue share.</p>
        <div className="hero-meta">
          <div className="meta-item"><div className="label-sm">// APY</div><div className="val" style={{ color: "var(--accent)" }}>{stats.apy > 0 ? `${stats.apy}%` : "—"}</div></div>
          <div className="meta-item"><div className="label-sm">// TVL</div><div className="val">{stats.tvl > 0 ? `${stats.tvl.toLocaleString()} $QUANTA` : "—"}</div></div>
          <div className="meta-item"><div className="label-sm">// Stakers</div><div className="val">{stats.stakers > 0 ? stats.stakers : "—"}</div></div>
          <div className="meta-item"><div className="label-sm">// Distributed</div><div className="val" style={{ color: "var(--teal)" }}>{stats.rewardsDistributed > 0 ? `${stats.rewardsDistributed.toLocaleString()} $SCOM` : "—"}</div></div>
        </div>
      </section>

      <section className="section">
        <div className="section-header"><div className="label">// position</div><div><h2 className="display-md">Your Stake</h2></div></div>
        {session ? (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1, background: "var(--border)", border: "1px solid var(--border)" }}>
            <div style={{ background: "var(--bg)", padding: "24px 20px" }}>
              <div className="label-sm" style={{ marginBottom: 4 }}>Staked</div>
              <div className="display-md" style={{ fontSize: 28, color: "var(--accent)" }}>{position.stakedAmount}</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--muted)", marginTop: 4 }}>$QUANTA</div>
            </div>
            <div style={{ background: "var(--bg)", padding: "24px 20px" }}>
              <div className="label-sm" style={{ marginBottom: 4 }}>Pending Rewards</div>
              <div className="display-md" style={{ fontSize: 28, color: "var(--teal)" }}>{position.pendingRewards}</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--muted)", marginTop: 4 }}>$QUANTA</div>
            </div>
            <div style={{ background: "var(--bg)", padding: "24px 20px" }}>
              <div className="label-sm" style={{ marginBottom: 4 }}>Governance</div>
              <div className="display-md" style={{ fontSize: 28, color: Number(position.stakedAmount) >= 100 ? "var(--teal)" : "var(--muted)" }}>
                {Number(position.stakedAmount) >= 100 ? "YES" : "NO"}
              </div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--muted)", marginTop: 4 }}>100+ required</div>
            </div>
          </div>
        ) : (
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "40px 24px", textAlign: "center", color: "var(--muted)", fontSize: 13 }}>
            Connect your wallet to view staking position.
          </div>
        )}
      </section>

      <section className="section">
        <div className="section-header"><div className="label">// actions</div><div><h2 className="display-md">Stake $QUANTA</h2></div></div>
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "28px", maxWidth: 500 }}>
          <div style={{ marginBottom: 16 }}>
            <div className="label-sm" style={{ marginBottom: 6 }}>Amount</div>
            <input type="text" placeholder="0 $QUANTA" value={stakeInput} onChange={e => setStakeInput(e.target.value)}
              style={{
                fontFamily: "var(--font-mono)", fontSize: 14, color: "var(--fg)",
                background: "var(--bg)", border: "1px solid var(--border)",
                padding: "10px 14px", width: "100%", outline: "none",
              }}
            />
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <button className="btn-connect" style={{ flex: 1, fontSize: 11, padding: "10px" }}>STAKE</button>
            <button className="btn-connect" style={{ flex: 1, fontSize: 11, padding: "10px", background: "transparent", color: "var(--muted)", borderColor: "var(--border)" }}>UNSTAKE</button>
          </div>
          <div style={{ marginTop: 16, fontSize: 10, color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
            {stats.apy > 0 ? `Estimated APY: ${stats.apy}%` : "Staking contract pending deployment on Base"}
          </div>
        </div>
      </section>

      <Footer />
    </Layout>
  )
}
