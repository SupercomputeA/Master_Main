import MemberLayout from "../../components/MemberLayout"

/* Member — School (port of MemberSchool.dc.html) */

type Status = "progress" | "notstarted" | "done"
const COURSES: { icon: string; title: string; desc: string; modules: string; status: Status }[] = [
  { icon: "🔗", title: "Blockchain Fundamentals", desc: "Master the core concepts of blockchain technology, distributed ledgers, and consensus mechanisms.", modules: "5 modules", status: "progress" },
  { icon: "💰", title: "DeFi Protocol Design", desc: "Learn how decentralized finance protocols work, from AMMs to lending platforms and yield strategies.", modules: "6 modules", status: "notstarted" },
  { icon: "🏛️", title: "DAO Governance", desc: "Explore decentralized governance models, voting systems, and community coordination structures.", modules: "4 modules", status: "done" },
  { icon: "🔐", title: "Smart Contract Security", desc: "Essential security practices for smart contracts, vulnerability patterns, and audit methodologies.", modules: "5 modules", status: "notstarted" },
]

function StatusTag({ status }: { status: Status }) {
  if (status === "done") return <span className="course-status done">Completed</span>
  if (status === "progress") return <span className="course-status progress">In Progress</span>
  return <span className="course-status progress">Not Started</span>
}

export default function MemberSchool() {
  return (
    <MemberLayout
      title="SUPERCOMPUTE · Web3 School"
      banner={{ icon: "🎓", title: "Learn & Master", sub: "Unlock Web3 knowledge through structured courses, practical modules, and community-driven education." }}
    >
      <div className="page-header">
        <div>
          <div className="header-label">Member Dashboard</div>
          <h1 className="page-title">Web3 School</h1>
        </div>
      </div>

      <div className="progress-card">
        <div className="progress-label">Overall Progress</div>
        <div className="progress-percent">45%</div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: "45%" }} />
        </div>
      </div>

      <div className="courses-grid">
        {COURSES.map((c) => (
          <div key={c.title} className="course-card">
            <div className="course-icon">{c.icon}</div>
            <div className="course-title">{c.title}</div>
            <div className="course-desc">{c.desc}</div>
            <div className="course-meta">
              <span>{c.modules}</span>
              <StatusTag status={c.status} />
            </div>
          </div>
        ))}
      </div>
    </MemberLayout>
  )
}
