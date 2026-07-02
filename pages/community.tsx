import Link from "next/link"
import PublicLayout from "../components/PublicLayout"

/* Community / Site Hub — faithful port of templates/site/SiteHub.dc.html.
   Navigable directory of every page. Routes wired to real Next.js paths. */

interface NavCard {
  route: string
  name: string
  desc: string
  href: string
}

const GROUPS: { head: string; cards: NavCard[] }[] = [
  {
    head: "Public · Horizontal Nav",
    cards: [
      { route: "/", name: "Landing", desc: "Coming-soon hero, value pillars, journey progress.", href: "/" },
      { route: "/projects", name: "Projects", desc: "Portfolio showcase across 3 categories.", href: "/projects" },
      { route: "/publishing", name: "Publishing", desc: "Protocol analysis blog + knowledge graph.", href: "/publishing" },
      { route: "/auth", name: "Auth Gate", desc: "Wallet-connect on Base + email fallback.", href: "/auth" },
    ],
  },
  {
    head: "Member · Vertical Sidebar",
    cards: [
      { route: "/app/projects", name: "Projects", desc: "Create & collaborate on initiatives.", href: "/app/projects" },
      { route: "/app/staking", name: "Staking", desc: "Portfolio stats and position tracking.", href: "/app/staking" },
      { route: "/app/publishing", name: "Publishing", desc: "Write articles, upload media, manage drafts.", href: "/app/publishing" },
      { route: "/app/school", name: "School", desc: "Course modules and progress tracking.", href: "/app/school" },
      { route: "/app/token", name: "Token Tracker", desc: "Holdings, transactions, analytics.", href: "/app/token" },
      { route: "/app/article/:id", name: "Article + Graph", desc: "Knowledge graph, timeline, debate, comments.", href: "/app/article/1" },
    ],
  },
  {
    head: "Admin · Vertical Sidebar",
    cards: [
      { route: "/admin", name: "Dashboard", desc: "Stats, activity feed, quick actions.", href: "/admin" },
      { route: "/admin/users", name: "Users", desc: "Roles, permissions, moderation.", href: "/admin/users" },
      { route: "/admin/content", name: "Content", desc: "Approval workflow and flag review.", href: "/admin/content" },
      { route: "/admin/analytics", name: "Analytics", desc: "Traffic, engagement, top pages.", href: "/admin/analytics" },
      { route: "/admin/settings", name: "Settings", desc: "Feature flags, moderation, system.", href: "/admin/settings" },
    ],
  },
]

export default function Community() {
  return (
    <PublicLayout title="SUPERCOMPUTE · Site map" wide>
      <div className="tpl-sitehub">
        <div className="hub-header">
          <div className="eyebrow">./sitemap --supercompute</div>
          <h1 className="hub-title">Supercompute Site</h1>
          <p className="hub-sub">
            Every screen in the platform. Public pages use the horizontal nav; member and
            admin areas use the vertical sidebar.
          </p>
        </div>

        {GROUPS.map((group) => (
          <div key={group.head} className="group">
            <div className="group-head">{group.head}</div>
            <div className="card-grid">
              {group.cards.map((c) => (
                <Link key={c.name + c.route} href={c.href} className="nav-card">
                  <div className="nc-route">{c.route}</div>
                  <div className="nc-name">{c.name}</div>
                  <div className="nc-desc">{c.desc}</div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </PublicLayout>
  )
}
