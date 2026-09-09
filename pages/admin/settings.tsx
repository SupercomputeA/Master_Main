import { useState } from "react"
import MemberLayout from "../../components/MemberLayout"

/* Admin — Settings (port of AdminSettings.dc.html). Toggles are interactive. */

function Toggle({ initial }: { initial: boolean }) {
  const [on, setOn] = useState(initial)
  return (
    <div
      className={`toggle${on ? " active" : ""}`}
      role="switch"
      aria-checked={on}
      tabIndex={0}
      onClick={() => setOn((v) => !v)}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setOn((v) => !v) } }}
    >
      <div className="toggle-knob" />
    </div>
  )
}

interface Setting { name: string; desc: string; on: boolean }
const CARDS: { title: string; items: Setting[]; tail?: "threshold" | "backup" }[] = [
  {
    title: "Feature Flags",
    items: [
      { name: "Member Registration", desc: "Allow new user signups", on: true },
      { name: "Publishing Module", desc: "Enable article publishing", on: true },
      { name: "Staking Features", desc: "Enable staking dashboard", on: true },
      { name: "Community Projects", desc: "Allow project creation", on: false },
    ],
  },
  {
    title: "Moderation",
    items: [
      { name: "Content Review Required", desc: "Require approval before publishing", on: true },
      { name: "User Flagging Enabled", desc: "Allow users to flag content", on: true },
      { name: "Auto-Moderation", desc: "Use AI content filtering", on: false },
    ],
    tail: "threshold",
  },
  {
    title: "Email & Notifications",
    items: [
      { name: "Digest Emails", desc: "Send weekly digests to users", on: true },
      { name: "Transactional Emails", desc: "Send transaction confirmations", on: true },
      { name: "Notification Preferences", desc: "Let users customize alerts", on: true },
    ],
  },
  {
    title: "System",
    items: [
      { name: "Maintenance Mode", desc: "Take platform offline", on: false },
      { name: "Debug Mode", desc: "Show error details", on: false },
    ],
    tail: "backup",
  },
]

export default function AdminSettings() {
  return (
    <MemberLayout title="SUPERCOMPUTE · Settings" variant="admin">
      <div className="tpl-admin">
        <div className="header">
          <div>
            <div className="label">Administration</div>
            <h1>Settings</h1>
          </div>
        </div>

        <div className="settings-grid">
          {CARDS.map((card) => (
            <div key={card.title} className="settings-card term-card">
              <div className="settings-title">{card.title}</div>
              {card.items.map((s) => (
                <div key={s.name} className="setting-item">
                  <div className="setting-label">
                    <div className="setting-name">{s.name}</div>
                    <div className="setting-desc">{s.desc}</div>
                  </div>
                  <Toggle initial={s.on} />
                </div>
              ))}
              {card.tail === "threshold" && (
                <div className="setting-item full-width-item">
                  <div className="setting-label">
                    <div className="setting-name">Flagging Threshold</div>
                    <div className="setting-desc">Auto-hide after N flags</div>
                  </div>
                  <input className="input-field" type="number" defaultValue={5} />
                </div>
              )}
              {card.tail === "backup" && (
                <div className="setting-item full-width-item">
                  <div className="setting-label">
                    <div className="setting-name">Backup Schedule</div>
                    <div className="setting-desc">Automatic database backups</div>
                  </div>
                  <select className="input-field" style={{ width: "100%", marginTop: 8 }} defaultValue="Daily">
                    <option>Daily</option>
                    <option>Every 6 hours</option>
                    <option>Hourly</option>
                  </select>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </MemberLayout>
  )
}
