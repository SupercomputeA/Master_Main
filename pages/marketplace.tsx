import Head from "next/head"
import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import PublicLayout from "../components/PublicLayout"
import Footer from "../components/Footer"
import { useAuth } from "../lib/auth"

/* Marketplace — public index of project listings available for sale.
   Loads /api/marketplace, filters by status/category/chain, renders a grid.
   Empty state shows a "Be the first to list" CTA. */

type Listing = {
  id: string
  owner: string
  title: string
  tagline: string | null
  description: string
  category: string | null
  chain: string
  priceUsdc: string
  priceStock: { symbol: string; amount: string } | null
  splitAddress: string | null
  splitRecipients: { address: string; percentBps: number }[] | null
  deliverableKind: string
  license: string
  status: "live" | "sold" | "coming-soon" | "removed"
  soldTo: string | null
  createdAt: number
}

type Filter = "all" | "live" | "sold" | "coming-soon"
type CategoryFilter = "all" | "app" | "agent" | "data" | "course" | "design" | "service"
type ChainFilter = "all" | "base" | "robinhood"

function formatUsdc(price: string): string {
  // USDC = 6 decimals. "$" + price/1e6 with 2-decimal grouping.
  const n = Number(price)
  if (!Number.isFinite(n)) return price
  const dollars = n / 1_000_000
  return `$${dollars.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function shortAddr(addr: string | null | undefined): string {
  if (!addr) return "—"
  if (addr.length < 12) return addr
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`
}

function StatusBadge({ status }: { status: Listing["status"] }) {
  const cls =
    status === "live" ? "mp-badge mp-badge-live" :
    status === "sold" ? "mp-badge mp-badge-sold" :
    status === "coming-soon" ? "mp-badge mp-badge-soon" :
    "mp-badge"
  const label =
    status === "live" ? "● LIVE" :
    status === "sold" ? "✕ SOLD" :
    status === "coming-soon" ? "◌ COMING SOON" :
    "REMOVED"
  return <span className={cls}>{label}</span>
}

export default function Marketplace() {
  const { profile, session } = useAuth()
  const isAuthenticated = !!session
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<Filter>("live")
  const [category, setCategory] = useState<CategoryFilter>("all")
  const [chain, setChain] = useState<ChainFilter>("all")
  const [search, setSearch] = useState("")

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    fetch("/api/marketplace")
      .then(r => r.json().then((b: unknown) => ({ status: r.status, body: b as { listings?: Listing[]; error?: string } })))
      .then(({ status, body }) => {
        if (cancelled) return
        if (status >= 400) {
          setError(body?.error || "Failed to load marketplace")
          setListings([])
        } else {
          setListings(Array.isArray(body.listings) ? body.listings : [])
        }
      })
      .catch(err => {
        if (cancelled) return
        setError(err instanceof Error ? err.message : "Network error")
        setListings([])
      })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return listings.filter(l => {
      if (filter !== "all" && l.status !== filter) return false
      if (category !== "all" && l.category !== category) return false
      if (chain !== "all" && l.chain !== chain) return false
      if (q) {
        const hay = `${l.title} ${l.tagline || ""} ${l.description}`.toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })
  }, [listings, filter, category, chain, search])

  return (
    <PublicLayout title="SUPERCOMPUTE · Marketplace" wide>
      <Head>
        <title>SUPERCOMPUTE · Marketplace</title>
        <meta name="description" content="Buy and sell sovereign-built projects on the Supercompute marketplace. Pay with USDC, receive deliverables on-chain." />
      </Head>

      <div className="vignette" />

      <main className="mp-shell">
        <header className="mp-header">
          <div className="eyebrow">./marketplace --live<span className="caret" /></div>
          <h1 className="mp-title">Marketplace</h1>
          <p className="mp-sub">
            Projects built on Supercompute — list your work for sale, or buy with USDC.
            {" "}<span className="mp-sub-dim">Royalty splits route via 0xSplits on Base / Robinhood Chain.</span>
          </p>

          <div className="mp-cta-row">
            <Link href="/sell" className="btn-cta btn-cta-gold">
              {isAuthenticated ? "// List a project" : "// Sign in to list"}
            </Link>
            <a href="#filters" className="btn-cta btn-cta-ghost">// Browse listings</a>
          </div>
        </header>

        <section id="filters" className="mp-filters">
          <div className="mp-filter-group">
            <label className="mp-filter-label">status</label>
            <select className="mp-select" value={filter} onChange={e => setFilter(e.target.value as Filter)}>
              <option value="live">live</option>
              <option value="sold">sold</option>
              <option value="coming-soon">coming soon</option>
              <option value="all">all</option>
            </select>
          </div>
          <div className="mp-filter-group">
            <label className="mp-filter-label">category</label>
            <select className="mp-select" value={category} onChange={e => setCategory(e.target.value as CategoryFilter)}>
              <option value="all">all</option>
              <option value="app">app</option>
              <option value="agent">agent</option>
              <option value="data">data</option>
              <option value="course">course</option>
              <option value="design">design</option>
              <option value="service">service</option>
            </select>
          </div>
          <div className="mp-filter-group">
            <label className="mp-filter-label">chain</label>
            <select className="mp-select" value={chain} onChange={e => setChain(e.target.value as ChainFilter)}>
              <option value="all">all</option>
              <option value="base">base</option>
              <option value="robinhood">robinhood</option>
            </select>
          </div>
          <div className="mp-filter-group mp-filter-search">
            <label className="mp-filter-label">search</label>
            <input
              className="mp-input"
              type="text"
              placeholder="grep —title, tag, body…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </section>

        <section className="mp-meta">
          <span>{loading ? "loading…" : `${filtered.length} listings${filter !== "all" ? ` (${filter})` : ""}`}</span>
          {profile?.address && (
            <span className="mp-meta-dim">signed in · {shortAddr(profile.address)}</span>
          )}
        </section>

        {error && (
          <div className="mp-error">
            <strong>// marketplace error</strong>
            <div>{error}</div>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <section className="mp-empty">
            <div className="eyebrow">// empty state<span className="caret" /></div>
            <h2>Be the first to list.</h2>
            <p>
              No projects on the marketplace yet. If you've built something on Supercompute,
              you can list it for sale — set a USDC price, license terms, and a 0xSplits
              revenue split.
            </p>
            <Link href="/sell" className="btn-cta btn-cta-gold">
              {isAuthenticated ? "// Create a listing" : "// Sign in to list"}
            </Link>
          </section>
        )}

        {!loading && filtered.length > 0 && (
          <section className="mp-grid">
            {filtered.map(l => (
              <article key={l.id} className={`mp-card mp-card-${l.status}`}>
                <div className="mp-card-top">
                  <StatusBadge status={l.status} />
                  <span className="mp-card-chain">{l.chain}</span>
                </div>
                <h3 className="mp-card-title">{l.title}</h3>
                {l.tagline && <p className="mp-card-tag">{l.tagline}</p>}
                <p className="mp-card-desc">{l.description.slice(0, 140)}{l.description.length > 140 ? "…" : ""}</p>
                <div className="mp-card-meta">
                  <span className="mp-card-owner">by {shortAddr(l.owner)}</span>
                  {l.category && <span className="mp-card-cat">[{l.category}]</span>}
                </div>
                <div className="mp-card-foot">
                  <div className="mp-card-price">
                    <span className="mp-card-price-num">{formatUsdc(l.priceUsdc)}</span>
                    <span className="mp-card-price-unit">USDC{l.priceStock ? ` · +${l.priceStock.amount} ${l.priceStock.symbol}` : ""}</span>
                  </div>
                  <Link href={`/project/${l.id}`} className="btn-cta btn-cta-ghost btn-cta-sm">
                    {l.status === "live" ? "// Buy" : "// View"}
                  </Link>
                </div>
              </article>
            ))}
          </section>
        )}

        <section className="mp-footnote">
          <div className="mp-footnote-grid">
            <div>
              <div className="eyebrow">// settlement<span className="caret" /></div>
              <p>
                USDC payment via EIP-3009 <code>transferWithAuthorization</code>. Buyer signs
                off-chain; settlement posts the tx hash on-chain.
              </p>
            </div>
            <div>
              <div className="eyebrow">// splits<span className="caret" /></div>
              <p>
                Revenue routes through 0xSplits SplitMain. Default platform fee: <strong>2.5%</strong>
                {" "}→ supercompute.eth (PLACEHOLDER pending founder approval).
              </p>
            </div>
            <div>
              <div className="eyebrow">// disputes<span className="caret" /></div>
              <p>
                Refund policy and dispute process coming soon. For now: contact
                <a href="mailto:marketplace@supercompute.eth"> marketplace@supercompute.eth</a>.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </PublicLayout>
  )
}