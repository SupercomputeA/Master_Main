import Link from "next/link"
import { useState } from "react"
import ConnectWallet from "./ConnectWallet"
import { useAuth } from "../lib/auth"

type Role = "public" | "member" | "admin"

type NavItem = { href: string; label: string; sub?: { href: string; label: string }[] }

const publicNav: NavItem[] = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/storefront", label: "StoreFront" },
  { href: "/consulting", label: "Consulting" },
  { href: "/school", label: "School" },
  { href: "/press", label: "Press" },
  { href: "/social", label: "Social", sub: [
    { href: "/social/livestreaming", label: "LiveStream" },
  ]},
]

const memberNav: NavItem[] = [
  { href: "/projects", label: "Projects" },
  { href: "/app/dashboard", label: "Dashboard" },
  { href: "/app/social", label: "Social Hub" },
  { href: "/staking", label: "Staking" },
  { href: "/publishing", label: "Publishing" },
  { href: "/token", label: "Token" },
  { href: "/account", label: "Profile" },
]

const adminNav: NavItem[] = [
  { href: "/admin", label: "Command Center" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/agent", label: "Agent" },
  { href: "/newsdesk", label: "NewsDesk" },
  { href: "/tradedesk", label: "TradeDesk" },
  { href: "/fleet", label: "Agent Fleet" },
]

export default function Sidebar() {
  const { isAdmin } = useAuth()
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
        <button
          onClick={() => setRole("public")}
          style={{
            flex: 1,
            fontFamily: "var(--font-mono)",
            fontSize: 9,
            letterSpacing: "0.1rem",
            textTransform: "uppercase",
            background: role === "public" ? "var(--accent)" : "transparent",
            color: role === "public" ? "var(--bg)" : "var(--muted)",
            border: "1px solid var(--border)",
            padding: "6px 8px",
            cursor: "pointer",
          }}
        >
          Public
        </button>
        <button
          onClick={() => setRole("member")}
          style={{
            flex: 1,
            fontFamily: "var(--font-mono)",
            fontSize: 9,
            letterSpacing: "0.1rem",
            textTransform: "uppercase",
            background: role === "member" ? "var(--accent)" : "transparent",
            color: role === "member" ? "var(--bg)" : "var(--muted)",
            border: "1px solid var(--border)",
            padding: "6px 8px",
            cursor: "pointer",
          }}
        >
          Member
        </button>
        {isAdmin && (
          <button
            onClick={() => setRole("admin")}
            style={{
              flex: 1,
              fontFamily: "var(--font-mono)",
              fontSize: 9,
              letterSpacing: "0.1rem",
              textTransform: "uppercase",
              background: role === "admin" ? "var(--accent)" : "transparent",
              color: role === "admin" ? "var(--bg)" : "var(--muted)",
              border: "1px solid var(--border)",
              padding: "6px 8px",
              cursor: "pointer",
            }}
          >
            Admin
          </button>
        )}
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section">
          <div className="nav-section-label">{role}</div>
          {(role === "public" ? publicNav : role === "member" ? memberNav : adminNav).map((link) => (
            <div key={link.href}>
              <Link href={link.href} className="nav-link">
                <span>{link.label}</span>
              </Link>
              {link.sub && link.sub.map((sub) => (
                <Link key={sub.href} href={sub.href} className="nav-link" style={{ paddingLeft: 32, fontSize: 11, opacity: 0.7 }}>
                  <span>{sub.label}</span>
                </Link>
              ))}
            </div>
          ))}
        </div>
      </nav>

      <div className="sidebar-footer">
        <ConnectWallet />
      </div>
    </aside>
  )
}
