import Link from "next/link"
import { useState } from "react"
import ConnectWallet from "./ConnectWallet"
import { useAuth } from "../lib/auth"

type Role = "public" | "member" | "admin"

const navByRole: Record<Role, { href: string; label: string }[]> = {
  public: [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/storefront", label: "StoreFront" },
    { href: "/consulting", label: "Consulting" },
    { href: "/school", label: "School" },
    { href: "/press", label: "Press" },
    { href: "/social", label: "Social" },
  ],
  member: [
    { href: "/projects", label: "Projects" },
    { href: "/staking", label: "Staking" },
    { href: "/publishing", label: "Publishing" },
    { href: "/token", label: "Token" },
    { href: "/account", label: "Profile" },
  ],
  admin: [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/agent", label: "Agent" },
    { href: "/newsdesk", label: "NewsDesk" },
    { href: "/tradedesk", label: "TradeDesk" },
    { href: "/fleet", label: "Agent Fleet" },
  ],
}

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
          {navByRole[role].map((link) => (
            <Link key={link.href} href={link.href} className="nav-link">
              <span>{link.label}</span>
            </Link>
          ))}
        </div>
      </nav>

      <div className="sidebar-footer">
        <ConnectWallet />
      </div>
    </aside>
  )
}
