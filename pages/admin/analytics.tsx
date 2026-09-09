import MemberLayout from "../../components/MemberLayout"

/* Admin — Analytics (port of AdminAnalytics.dc.html) */

const METRICS = [
  { label: "Page Views", value: "142K", change: "+18% this week" },
  { label: "Unique Users", value: "8,240", change: "+9% this week" },
  { label: "Avg Session Duration", value: "4m 32s", change: "+22 sec from last week" },
  { label: "Bounce Rate", value: "34%", change: "-2% from last week" },
]

const BARS = [
  { label: "W1", h: 42 }, { label: "W2", h: 58 }, { label: "W3", h: 51 }, { label: "W4", h: 67 },
  { label: "W5", h: 74 }, { label: "W6", h: 69 }, { label: "W7", h: 88 }, { label: "W8", h: 100 },
]

const TOP_PAGES = [
  { name: "Home", pct: 100, value: "32.2K" },
  { name: "Projects", pct: 78, value: "25.1K" },
  { name: "Publishing", pct: 64, value: "20.6K" },
  { name: "School", pct: 51, value: "16.4K" },
]

const ENGAGEMENT = [
  { name: "Articles Published", pct: 85, value: "284" },
  { name: "Projects Created", pct: 62, value: "156" },
  { name: "Course Completions", pct: 48, value: "342" },
  { name: "Community Comments", pct: 91, value: "1,248" },
]

function StatList({ rows }: { rows: { name: string; pct: number; value: string }[] }) {
  return (
    <div className="stat-list">
      {rows.map((r) => (
        <div key={r.name} className="a-stat-row">
          <span className="stat-name">{r.name}</span>
          <div className="stat-bar"><div className="stat-bar-fill" style={{ width: `${r.pct}%` }} /></div>
          <span className="a-stat-val">{r.value}</span>
        </div>
      ))}
    </div>
  )
}

export default function AdminAnalytics() {
  return (
    <MemberLayout title="SUPERCOMPUTE · Analytics" variant="admin" wide>
      <div className="tpl-admin">
        <div className="header">
          <div>
            <div className="label">Administration</div>
            <h1>Analytics</h1>
          </div>
        </div>

        <div className="metric-grid">
          {METRICS.map((m) => (
            <div key={m.label} className="metric-card term-card">
              <div className="metric-label">{m.label}</div>
              <div className="metric-value">{m.value}</div>
              <div className="metric-change">{m.change}</div>
            </div>
          ))}
        </div>

        <div className="chart-grid">
          <div className="chart-card term-card">
            <div className="chart-title">Traffic Overview · Last 30 Days</div>
            <div className="bar-chart">
              {BARS.map((b) => (
                <div key={b.label} className="bar-col">
                  <div className="bar" style={{ height: `${b.h}%` }} />
                  <div className="bar-label">{b.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="chart-card term-card">
            <div className="chart-title">Top Pages</div>
            <StatList rows={TOP_PAGES} />
          </div>
        </div>

        <div style={{ marginTop: 28 }}>
          <div className="chart-card term-card">
            <div className="chart-title">Engagement Metrics</div>
            <StatList rows={ENGAGEMENT} />
          </div>
        </div>
      </div>
    </MemberLayout>
  )
}
