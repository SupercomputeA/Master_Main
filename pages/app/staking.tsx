import MemberLayout from "../../components/MemberLayout"

/* Member — Staking (port of MemberStaking.dc.html) */

const STATS = [
  { label: "Total Staked", value: "$245.8K" },
  { label: "Annual Yield", value: "12.4%" },
  { label: "Earned to Date", value: "$18.2K" },
  { label: "Active Positions", value: "8" },
]

const POSITIONS = [
  { title: "Ethereum", rows: [["Amount Staked", "32 ETH"], ["Current Yield", "3.2% APY"], ["Earned", "$5,240"]] },
  { title: "Polygon", rows: [["Amount Staked", "10,000 MATIC"], ["Current Yield", "8.5% APY"], ["Earned", "$3,120"]] },
]

export default function MemberStaking() {
  return (
    <MemberLayout
      title="SUPERCOMPUTE · Staking"
      banner={{ icon: "💰", title: "Stake & Earn", sub: "Monitor your staking positions, track yield across protocols, and optimize your passive income strategy." }}
    >
      <div className="page-header">
        <div>
          <div className="header-label">Member Dashboard</div>
          <h1 className="page-title">Staking Portfolio</h1>
        </div>
      </div>

      <div className="stats-grid">
        {STATS.map((s) => (
          <div key={s.label} className="stat-card">
            <div className="stat-label">{s.label}</div>
            <div className="stat-value">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="positions-grid">
        {POSITIONS.map((pos) => (
          <div key={pos.title} className="position-card">
            <div className="position-header">
              <div className="position-title">{pos.title}</div>
              <div className="position-status">Active</div>
            </div>
            {pos.rows.map(([label, value]) => (
              <div key={label} className="position-detail">
                <span className="position-detail-label">{label}</span>
                <span className="position-detail-value">{value}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </MemberLayout>
  )
}
