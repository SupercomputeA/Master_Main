import Head from "next/head"
import Link from "next/link"
import { useRouter } from "next/router"
import type { ReactNode } from "react"

/* Public horizontal-nav shell — ported from Navigation.dc.html.
   Used by public pages (landing, projects, publishing, school, community).
   Member/admin areas use the vertical Sidebar (components/Layout.tsx). */

const NAV = [
  { href: "/", label: "Home" },
  { href: "/projects", label: "Projects" },
  { href: "/publishing", label: "NewsDesk" },
  { href: "/school", label: "School" },
  { href: "/community", label: "Community" },
]

function isActive(href: string, path: string): boolean {
  if (href === "/") return path === "/"
  return path === href || path.startsWith(href + "/")
}

export default function PublicLayout({
  children,
  title = "SUPERCOMPUTE",
  wide = false,
}: {
  children: ReactNode
  title?: string
  wide?: boolean
}) {
  const router = useRouter()
  const path = router.asPath.split("#")[0].split("?")[0]

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content="Design with liberation in mind — Web3 tools and knowledge infrastructure for communities." />
      </Head>

      {/* HUD corners bracket the full viewport on public pages */}
      <div className="hud-corner tl" />
      <div className="hud-corner tr" />
      <div className="hud-corner bl" />
      <div className="hud-corner br" />

      <div className="pub-scroll">
        <header className="pub-header">
          <nav className="pub-nav">
            <Link href="/" className="pub-logo">Supercompute</Link>
            <ul className="pub-nav-menu">
              {NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`pub-nav-item${isActive(item.href, path) ? " active" : ""}`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="pub-nav-right">
              <Link href="/auth" className="pub-auth-link">Sign in</Link>
              <Link href="/auth" className="pub-auth-link primary">Join</Link>
            </div>
          </nav>
        </header>

        <div className={wide ? "pub-wide" : undefined}>
          <main className="pub-main">{children}</main>
        </div>
      </div>

      <div className="vignette" />
    </>
  )
}
