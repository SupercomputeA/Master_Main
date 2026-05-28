import Link from "next/link"
import { useRouter } from "next/router"
import ConnectWallet from "./ConnectWallet"
import { GuildMembershipBadge } from "./GuildAccess"

type NavItem = { href: string; label: string }

const nav: NavItem[] = [
  { href: "/", label: "Feed" },
  { href: "/newsdesk", label: "NewsDesk" },
  { href: "/compose", label: "Compose" },
  { href: "/knowledge-graph", label: "Entity Map" },
]

const secondary: NavItem[] = [
  { href: "/storefront", label: "StoreFront" },
  { href: "/guild", label: "Guild" },
]

export default function Sidebar() {
  const router = useRouter()

  return (
    <aside className="sidebar">
      <div className="sidebar-top">
        <img src="/SupercomputeLogo.png" alt="SUPERCOMPUTE" className="sidebar-logo" />
        <div className="logo-text-group">
          <Link href="/" className="logo">SUPERCOMPUTE</Link>
          <span className="logo-sub">// publishing</span>
        </div>
      </div>

      <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: "0.15rem", textTransform: "uppercase", color: "var(--accent)" }}>
          agent-powered news
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section">
          <div className="nav-section-label">publish</div>
          {nav.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="nav-link"
              style={router.pathname === link.href || router.pathname.startsWith(link.href + "/") ? { color: "var(--accent)" } : undefined}
            >
              <span>{link.label}</span>
            </Link>
          ))}
        </div>

        <div className="nav-section" style={{ marginTop: 16 }}>
          <div className="nav-section-label">apps</div>
          {secondary.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="nav-link"
              style={router.pathname === link.href ? { color: "var(--accent)" } : undefined}
            >
              <span>{link.label}</span>
            </Link>
          ))}
        </div>

        <div className="nav-section" style={{ marginTop: 16 }}>
          <div className="nav-section-label">export</div>
          <div style={{ padding: "4px 16px", fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--muted)", lineHeight: 2 }}>
            <div>X / Twitter</div>
            <div>Farcaster</div>
            <div>Lens Protocol</div>
            <div>Mirror</div>
          </div>
        </div>
      </nav>

      <div className="sidebar-footer">
        <GuildMembershipBadge />
        <ConnectWallet />
      </div>
    </aside>
  )
}
