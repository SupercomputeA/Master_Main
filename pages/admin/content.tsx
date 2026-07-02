import MemberLayout from "../../components/MemberLayout"

/* Admin — Content Moderation (port of AdminContent.dc.html) */

interface Item {
  thumb: string
  title: string
  status: string
  by: string
  when: string
  desc: string
  flags?: string
  actions: { label: string; kind?: "approve" | "reject" }[]
}

const ITEMS: Item[] = [
  {
    thumb: "📝", title: "Understanding DeFi Risks", status: "Pending Review",
    by: "By Sarah Chen", when: "Submitted 2 hours ago",
    desc: "A comprehensive analysis of common risks in decentralized finance protocols and strategies for risk mitigation.",
    actions: [{ label: "Approve", kind: "approve" }, { label: "Reject", kind: "reject" }, { label: "Request Changes" }],
  },
  {
    thumb: "💬", title: "Discussion: Future of Governance", status: "Flagged",
    by: "By James Rivera", when: "Posted 5 hours ago",
    desc: "Community discussion about decentralized governance models and their implications for DAOs.",
    flags: "⚠️ Flagged by 3 users for moderation",
    actions: [{ label: "Review Flags" }, { label: "Hide" }, { label: "Remove", kind: "reject" }],
  },
  {
    thumb: "🎓", title: "Web3 Security Best Practices", status: "Published",
    by: "By Alex Thompson", when: "Published 1 day ago",
    desc: "Practical security guidance for protecting digital assets and managing private keys securely.",
    actions: [{ label: "Edit" }, { label: "Unpublish", kind: "reject" }],
  },
]

export default function AdminContent() {
  return (
    <MemberLayout title="SUPERCOMPUTE · Content Moderation" variant="admin" wide>
      <div className="tpl-admin">
        <div className="header">
          <div>
            <div className="label">Administration</div>
            <h1>Content Moderation</h1>
          </div>
        </div>

        <div className="content-list">
          {ITEMS.map((item) => (
            <div key={item.title} className="content-item term-card">
              <div className="content-thumbnail">{item.thumb}</div>
              <div className="content-main">
                <div className="content-header">
                  <div className="content-title">{item.title}</div>
                  <div className="content-status">{item.status}</div>
                </div>
                <div className="content-meta">
                  <span>{item.by}</span>
                  <span>{item.when}</span>
                </div>
                <div className="content-desc">{item.desc}</div>
                {item.flags && <div className="content-flags">{item.flags}</div>}
                <div className="content-actions">
                  {item.actions.map((a) => (
                    <button key={a.label} className={`mod-btn${a.kind ? " " + a.kind : ""}`}>{a.label}</button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </MemberLayout>
  )
}
