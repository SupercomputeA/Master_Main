import MemberLayout from "../../components/MemberLayout"

/* Admin — Dashboard (port of AdminDashboard.dc.html) */

const STATS = [
  { label: "Active Users", value: "2,847", change: "+12% from last week" },
  { label: "Published Content", value: "384", change: "+28 this week" },
  { label: "Community Projects", value: "156", change: "+8 this week" },
  { label: "Engagement Rate", value: "68%", change: "+4% from last month" },
]

const ACTIVITY = [
  { type: "New User Signup", time: "@user_4291 joined 2 hours ago" },
  { type: "Article Published", time: '"DeFi Protocol Deep Dive" posted 4 hours ago' },
  { type: "Project Created", time: 'New project "Web3 Infrastructure" 6 hours ago' },
  { type: "Course Completed", time: '3 users completed "Blockchain Fundamentals"' },
  { type: "Flagged Content", time: "1 comment flagged for review 8 hours ago" },
]

const ACTIONS = ["Manage Users", "Review Content", "Feature Settings", "View Analytics", "Moderation Queue", "System Logs"]

export default function AdminDashboard() {
  return (
    <MemberLayout title="SUPERCOMPUTE · Admin Dashboard" variant="admin" wide>
      <div className="tpl-admin">
        <div className="header">
          <div>
            <div className="label">Administration</div>
            <h1>Dashboard</h1>
          </div>
        </div>

        <div className="stats-grid">
          {STATS.map((s) => (
            <div key={s.label} className="stat-card term-card">
              <div className="stat-label">{s.label}</div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-change">{s.change}</div>
            </div>
          ))}
        </div>

        <div className="content-grid">
          <div className="activity-card term-card">
            <div className="card-title">Recent Activity</div>
            {ACTIVITY.map((a, i) => (
              <div key={i} className="activity-item">
                <div className="activity-text">
                  <div className="activity-type">{a.type}</div>
                  <div className="activity-time">{a.time}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="activity-card term-card">
            <div className="card-title">Quick Actions</div>
            <div className="quick-actions">
              {ACTIONS.map((a) => (
                <button key={a} className="qa-btn">{a}</button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </MemberLayout>
  )
}
