import MemberLayout from "../../components/MemberLayout"

/* Member — Token Tracker (port of MemberToken.dc.html) */

const HOLDINGS = [
  { label: "Total Holdings", value: "$48,240", change: "+12.5% this month" },
  { label: "Portfolio Value", value: "+$5,240", change: "+12.1% this year" },
  { label: "Active Positions", value: "12", change: "3 new this week" },
]

const TXNS = [
  { date: "2 hours ago", type: "Buy", token: "ETH", amount: "2.5", price: "$2,840", total: "$7,100" },
  { date: "1 day ago", type: "Stake", token: "MATIC", amount: "5,000", price: "$0.82", total: "$4,100" },
  { date: "3 days ago", type: "Sell", token: "USDC", amount: "3,000", price: "$1.00", total: "$3,000" },
]

export default function MemberToken() {
  return (
    <MemberLayout
      title="SUPERCOMPUTE · Token Tracker"
      banner={{ icon: "📊", title: "Track & Analyze", sub: "Monitor token holdings, analyze portfolio performance, and stay on top of every transaction and trade." }}
    >
      <div className="page-header">
        <div>
          <div className="header-label">Member Dashboard</div>
          <h1 className="page-title">Token Tracker</h1>
        </div>
      </div>

      <div className="holdings-grid">
        {HOLDINGS.map((h) => (
          <div key={h.label} className="holding-card">
            <div className="holding-label">{h.label}</div>
            <div className="holding-value">{h.value}</div>
            <div className="holding-change">{h.change}</div>
          </div>
        ))}
      </div>

      <table className="transactions-table">
        <thead>
          <tr>
            <th>Date</th><th>Type</th><th>Token</th><th>Amount</th><th>Price</th><th>Total</th>
          </tr>
        </thead>
        <tbody>
          {TXNS.map((t, i) => (
            <tr key={i}>
              <td className="tx-date">{t.date}</td>
              <td className="tx-type">{t.type}</td>
              <td>{t.token}</td>
              <td className="tx-amount">{t.amount}</td>
              <td>{t.price}</td>
              <td className="tx-amount">{t.total}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </MemberLayout>
  )
}
