import Link from "next/link"

const navSections = [
  {
    label: "Public",
    links: [
      { href: "#home", label: "Home" },
      { href: "#storefront", label: "StoreFront" },
      { href: "#consulting", label: "Consulting" },
      { href: "#school", label: "School I" },
      { href: "#social", label: "Social" },
      { href: "#streaming", label: "LiveStream" },
      { href: "#press", label: "Press" },
    ],
  },
  {
    label: "Member",
    links: [
      { href: "#projects", label: "Projects" },
      { href: "#staking", label: "Staking" },
      { href: "#publishing", label: "Publishing" },
      { href: "#school-ii", label: "School II" },
      { href: "#token", label: "Token" },
    ],
  },
  {
    label: "Admin",
    links: [
      { href: "#dashboard", label: "Dashboard" },
      { href: "#admin-projects", label: "Projects" },
      { href: "#admin-school", label: "School" },
      { href: "#admin-consulting", label: "Consulting" },
      { href: "#newsdesk", label: "NewsDesk" },
      { href: "#tradedesk", label: "TradeDesk" },
    ],
  },
]

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-top">
        <img src="/SupercomputeLogo.png" alt="SUPERCOMPUTE" className="sidebar-logo" />
        <div className="logo-text-group">
          <Link href="/" className="logo">SUPERCOMPUTE</Link>
          <span className="logo-sub">// operator</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navSections.map((section) => (
          <div className="nav-section" key={section.label}>
            <div className="nav-section-label">{section.label}</div>
            {section.links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="nav-link"
              >
                <span>{link.label}</span>
              </Link>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <a href="#" className="btn-connect">// Connect</a>
      </div>
    </aside>
  )
}
