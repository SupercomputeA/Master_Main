import Link from "next/link"
import { useRouter } from "next/router"
import ConnectWallet from "./ConnectWallet"
import pkg from "../package.json"

interface NavItem {
  href: string
  label: string
  external?: boolean
}

interface NavGroup {
  label?: string
  items: NavItem[]
}

const groups: NavGroup[] = [
  {
    items: [
      { href: "/", label: "Home" },
      { href: "/about", label: "About" },
      { href: "/solar-punk", label: "Solar Punk" },
    ],
  },
  {
    label: "learn",
    items: [
      { href: "/school", label: "School" },
    ],
  },
  {
    label: "build",
    items: [
      { href: "/projects/browse", label: "Projects" },
      { href: "/consulting", label: "Consulting" },
    ],
  },
  {
    label: "economy",
    items: [
      { href: "/token", label: "$SCOM Token" },
      { href: "/staking", label: "Staking" },
      { href: "/storefront", label: "Storefront" },
    ],
  },
  {
    label: "community",
    items: [
      { href: "/social", label: "Social" },
      { href: "https://supercompute.newsdesk.app", label: "NewsDesk ↗", external: true },
    ],
  },
]

function isActive(href: string, current: string): boolean {
  if (href === "/") return current === "/"
  return current === href || current.startsWith(href + "/")
}

export default function Sidebar() {
  const router = useRouter()
  const current = router.asPath.split("#")[0].split("?")[0]

  return (
    <aside className="sidebar">
      <div className="sidebar-top">
        <img src="/SupercomputeLogo.png" alt="SUPERCOMPUTE" className="sidebar-logo" />
        <div className="logo-text-group">
          <Link href="/" className="logo">SUPERCOMPUTE</Link>
          <span className="logo-sub">// v{pkg.version}</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {groups.map((group, gi) => (
          <div key={gi} className="nav-section" style={{ marginTop: gi === 0 ? 0 : 14 }}>
            {group.label && <div className="nav-section-label">{group.label}</div>}
            {group.items.map(item => {
              const active = !item.external && isActive(item.href, current)
              const linkProps = item.external
                ? { href: item.href, target: "_blank", rel: "noopener noreferrer" }
                : { href: item.href }
              const LinkComponent = item.external ? "a" : Link
              return (
                <LinkComponent
                  key={item.href}
                  {...linkProps}
                  className="nav-link"
                  style={active ? {
                    color: "var(--accent)",
                    borderLeft: "2px solid var(--accent)",
                    paddingLeft: 14,
                  } : undefined}
                >
                  <span>{item.label}</span>
                </LinkComponent>
              )
            })}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <ConnectWallet />
      </div>
    </aside>
  )
}
