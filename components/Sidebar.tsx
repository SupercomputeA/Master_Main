import Link from "next/link"
import { useState } from "react"

type Role = "public" | "member" | "admin"

const navByRole: Record<Role, { href: string; label: string }[]> = {
  public: [
    { href: "/", label: "Home" },
    { href: "/storefront", label: "StoreFront" },
    { href: "/consulting", label: "Consulting" },
    { href: "/school", label: "School" },
    { href: "/social", label: "Social" },
  ],
  member: [
    { href: "/projects", label: "Projects" },
    { href: "/staking", label: "Staking" },
    { href: "/publishing", label: "Publishing" },
    { href: "/token", label: "Token" },
  ],
  admin: [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/newsdesk", label: "NewsDesk" },
    { href: "/tradedesk", label: "TradeDesk" },
    { href: "/fleet", label: "Agent Fleet" },
  ],
}

const roles: { key: Role; label: string }[] = [
  { key: "public", label: "Public" },
  { key: "member", label: "Member" },
  { key: "admin", label: "Admin" },
]

export default function Sidebar() {
  const [role, setRole] = useState<Role>("public")

  return (
    <aside className="sidebar">
      <div className="sidebar-top">
        <img src="/SupercomputeLogo.png" alt="SUPERCOMPUTE" className="sidebar-logo" />
        <div className="logo-text-group">
          <Link href="/" className="logo">SUPERCOMPUTE</Link>
          <span className="logo-sub">// operator</span>
        </div>
      </div>

      <div style={{ display: "flex", gap: 0, borderBottom: "1px solid var(--border)", padding: "8px 12px" }}>
        {roles.map((r) => (
          <button
            key={r.key}
            onClick={() => setRole(r.key)}
            style={{
              flex: 1,
              fontFamily: "var(--font-mono)",
              fontSize: 9,
              letterSpacing: "0.1rem",
              textTransform: "uppercase",
              background: role === r.key ? "var(--accent)" : "transparent",
              color: role === r.key ? "var(--bg)" : "var(--muted)",
              border: "1px solid var(--border)",
              padding: "6px 8px",
              cursor: "pointer",
            }}
          >
            {r.label}
          </button>
        ))}
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section">
          <div className="nav-section-label">{role}</div>
          {navByRole[role].map((link) => (
            <Link key={link.href} href={link.href} className="nav-link">
              <span>{link.label}</span>
            </Link>
          ))}
        </div>
      </nav>

      <div className="sidebar-footer">
        <a href="#" className="btn-connect">// Connect</a>
      </div>
    </aside>
  )
}
