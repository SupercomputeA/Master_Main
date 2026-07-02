import Head from "next/head"
import Link from "next/link"
import { useRouter } from "next/router"
import type { ReactNode } from "react"

/* Member/Admin vertical-sidebar shell — ported from NavigationVertical.dc.html.
   Used by /app/* (member) and /admin/* (admin) pages. */

interface NavItem { href: string; label: string }
interface NavGroup { label: string; items: NavItem[] }

const MEMBER_GROUPS: NavGroup[] = [
  {
    label: "Dashboard",
    items: [
      { href: "/app", label: "Home" },
      { href: "/app/projects", label: "Projects" },
      { href: "/app/staking", label: "Staking" },
      { href: "/app/publishing", label: "Publishing" },
    ],
  },
  {
    label: "Community",
    items: [
      { href: "/app/school", label: "School" },
      { href: "/app/article/1", label: "Discussions" },
      { href: "/publishing", label: "Resources" },
    ],
  },
  {
    label: "Portfolio",
    items: [
      { href: "/app/token", label: "Token Tracker" },
      { href: "/admin/analytics", label: "Analytics" },
      { href: "/app/token", label: "Transactions" },
    ],
  },
]

const ADMIN_GROUPS: NavGroup[] = [
  {
    label: "Admin",
    items: [
      { href: "/admin", label: "Dashboard" },
      { href: "/admin/users", label: "Users" },
      { href: "/admin/content", label: "Content" },
      { href: "/admin/analytics", label: "Analytics" },
      { href: "/admin/settings", label: "Settings" },
    ],
  },
  {
    label: "Member",
    items: [
      { href: "/app", label: "Member Home" },
      { href: "/app/projects", label: "Projects" },
    ],
  },
]

export interface Banner { icon: string; title: string; sub: string }

function isActive(href: string, path: string): boolean {
  if (href === "/app" || href === "/admin") return path === href
  return path === href || path.startsWith(href + "/")
}

export default function MemberLayout({
  children,
  title = "SUPERCOMPUTE",
  variant = "member",
  banner,
  wide = false,
}: {
  children: ReactNode
  title?: string
  variant?: "member" | "admin"
  banner?: Banner
  wide?: boolean
}) {
  const router = useRouter()
  const path = router.asPath.split("#")[0].split("?")[0]
  const groups = variant === "admin" ? ADMIN_GROUPS : MEMBER_GROUPS

  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>

      <aside className="mem-sidebar">
        <Link href="/app" className="mem-logo">Supercompute</Link>
        <nav>
          {groups.map((group) => (
            <div key={group.label} className="mem-nav-section">
              <div className="mem-nav-label">{group.label}</div>
              <ul className="mem-nav-menu">
                {group.items.map((item, i) => (
                  <li key={item.href + i}>
                    <Link
                      href={item.href}
                      className={`mem-nav-item${isActive(item.href, path) ? " active" : ""}`}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
        <div className="mem-nav-footer">
          <ul className="mem-user-menu">
            <li><Link href="/admin/settings" className="mem-user-item">Settings</Link></li>
            <li><Link href="/admin" className="mem-user-item">Admin Panel</Link></li>
            <li><Link href="/auth" className="mem-user-item">Sign Out</Link></li>
          </ul>
        </div>
      </aside>

      <main className={`mem-main${wide ? " mem-wide" : ""}`}>
        <div className="hud-corner embed tl" />
        <div className="hud-corner embed tr" />
        <div className="hud-corner embed bl" />
        <div className="hud-corner embed br" />
        <div className="mem-inner">
          <div className="tpl-member">
            {banner && (
              <div className="mem-banner">
                <div className="mem-banner-in">
                  <div className="mem-banner-icon">{banner.icon}</div>
                  <h1 className="mem-banner-title">{banner.title}</h1>
                  <p className="mem-banner-sub">{banner.sub}</p>
                </div>
              </div>
            )}
            {children}
          </div>
        </div>
      </main>

      <div className="vignette" />
    </>
  )
}
