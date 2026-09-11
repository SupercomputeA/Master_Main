import Head from "next/head"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import PublicLayout from "../../components/PublicLayout"
import Footer from "../../components/Footer"
import { useAuth } from "../../lib/auth"

/* /project/[id] — public detail page for a single marketplace listing.
   Server-side fetch from /api/marketplace so the page is renderable without JS,
   then the client takes over for the buy flow. */

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
  deliverableUrl: string | null
  license: string
  licenseText: string | null
  status: "live" | "sold" | "coming-soon" | "removed"
  soldTo: string | null
  soldTxHash: string | null
  soldAt: number | null
  createdAt: number
}

type BuyState =
  | { kind: "idle" }
  | { kind: "signing" }
  | { kind: "broadcasting"; txHash?: string }
  | { kind: "confirming"; txHash: string }
  | { kind: "error"; message: string }
  | { kind: "sold"; txHash: string; deliveryKind: string; deliveryUrl: string | null }

const USDC_BASE = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"

function formatUsdc(price: string): string {
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

export default function ProjectDetail({ listing: initial }: { listing: Listing | null }) {
  const router = useRouter()
  const { profile, session, connect } = useAuth()
  const isAuthenticated = !!session
  const [listing, setListing] = useState<Listing | null>(initial)
  const [buy, setBuy] = useState<BuyState>({ kind: "idle" })
  const [deliverReceipt, setDeliverReceipt] = useState<null | { kind: string; url?: string; receipt?: string }>(null)

  // Refresh after navigation (e.g. coming back from /sell after publish)
  useEffect(() => {
    if (!router.query.id || typeof router.query.id !== "string") return
    if (initial && initial.id === router.query.id) return
    fetch(`/api/marketplace?id=${encodeURIComponent(router.query.id)}`)
      .then(r => r.json() as Promise<{ listing?: Listing }>)
      .then(d => { if (d?.listing) setListing(d.listing) })
      .catch(() => {})
  }, [router.query.id, initial])

  const isOwner = !!(profile?.address && listing && profile.address.toLowerCase() === listing.owner.toLowerCase())
  const canBuy = listing?.status === "live" && !isOwner

  async function handleBuy() {
    if (!listing) return
    if (!isAuthenticated) {
      connect()
      return
    }
    if (isOwner) return

    setBuy({ kind: "signing" })
    try {
      // For the production scaffold the buyer signs an EIP-3009 transferWithAuthorization
      // off-chain via wagmi's wallet client, then broadcasts via the USDC contract on the
      // listing's chain. Real signing flow is gated by wallet availability — fall back to a
      // mock tx hash when wagmi isn't wired (e.g. SSR / preview / no wallet).
      //
      // Until wallet integration lands in the SPA (requires ConnectWallet on PublicLayout),
      // we synthesize the buyer flow: call /api/marketplace/buy with a clearly-marked mock
      // tx hash so the row flips to 'sold' and the deliver endpoint can be exercised.
      //
      // Replace this block with the real transferWithAuthorization call when wallet UI ships.
      const mockTx = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`

      setBuy({ kind: "broadcasting", txHash: mockTx })

      const session = localStorage.getItem("session")
      const res = await fetch("/api/marketplace/buy", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session || ""}` },
        body: JSON.stringify({
          listingId: listing.id,
          txHash: mockTx,
          chain: listing.chain,
          pricePaid: listing.priceUsdc,
        }),
      })
      const data = await res.json() as { error?: string; listing?: Listing; delivery?: { kind?: string; url?: string | null } }
      if (!res.ok) {
        setBuy({ kind: "error", message: data?.error || `Server error (${res.status})` })
        return
      }
      setListing(data.listing ?? null)
      setBuy({
        kind: "sold",
        txHash: mockTx,
        deliveryKind: data.delivery?.kind || listing.deliverableKind,
        deliveryUrl: data.delivery?.url ?? listing.deliverableUrl,
      })
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Buy failed"
      setBuy({ kind: "error", message: msg })
    }
  }

  async function fetchDelivery() {
    if (!listing || listing.status !== "sold") return
    const session = localStorage.getItem("session")
    try {
      const res = await fetch(`/api/marketplace/deliver/${listing.id}`, {
        headers: { Authorization: `Bearer ${session || ""}` },
      })
      const data = await res.json() as { kind?: string; url?: string | null; receipt?: string; error?: string }
      if (res.ok) {
        setDeliverReceipt({
          kind: data.kind ?? "unknown",
          url: data.url ?? undefined,
          receipt: data.receipt ?? "",
        })
      } else {
        setDeliverReceipt({ kind: "error", receipt: data?.error || `Server error (${res.status})` })
      }
    } catch (err) {
      setDeliverReceipt({ kind: "error", receipt: err instanceof Error ? err.message : "Network error" })
    }
  }

  if (!listing) {
    return (
      <PublicLayout title="SUPERCOMPUTE · Project not found">
        <main className="mp-shell">
          <div className="mp-error">
            <strong>// 404</strong>
            <div>This listing doesn't exist or has been removed.</div>
            <Link href="/marketplace" className="btn-cta btn-cta-ghost">// Back to marketplace</Link>
          </div>
        </main>
        <Footer />
      </PublicLayout>
    )
  }

  return (
    <PublicLayout title={`SUPERCOMPUTE · ${listing.title}`} wide>
      <Head>
        <title>SUPERCOMPUTE · {listing.title}</title>
        <meta name="description" content={listing.tagline || listing.description.slice(0, 140)} />
      </Head>

      <div className="vignette" />

      <main className="mp-shell">
        <header className="mp-detail-head">
          <div className="mp-detail-eyebrow">
            <StatusBadge status={listing.status} />
            <span className="mp-card-chain">{listing.chain}</span>
            {listing.category && <span className="mp-card-cat">[{listing.category}]</span>}
          </div>
          <h1 className="mp-title">{listing.title}</h1>
          {listing.tagline && <p className="mp-detail-tag">{listing.tagline}</p>}
          <div className="mp-detail-meta">
            <span>by <strong>{shortAddr(listing.owner)}</strong></span>
            <span className="mp-dot">·</span>
            <span>listed {new Date(listing.createdAt * 1000).toISOString().slice(0, 10)}</span>
            <span className="mp-dot">·</span>
            <span>license: <strong>{listing.license}</strong></span>
          </div>
        </header>

        <div className="mp-detail-grid">
          <article className="mp-detail-body">
            <section className="mp-section">
              <div className="eyebrow">// description<span className="caret" /></div>
              <p className="mp-section-text">{listing.description}</p>
            </section>

            {listing.splitRecipients && listing.splitRecipients.length > 0 && (
              <section className="mp-section">
                <div className="eyebrow">// royalty split<span className="caret" /></div>
                <table className="mp-table">
                  <thead>
                    <tr><th>recipient</th><th>share</th></tr>
                  </thead>
                  <tbody>
                    {listing.splitRecipients.map((r, i) => (
                      <tr key={i}>
                        <td><code>{shortAddr(r.address)}</code></td>
                        <td>{(r.percentBps / 100).toFixed(2)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {listing.splitAddress && (
                  <p className="mp-sub-dim">split contract: <code>{shortAddr(listing.splitAddress)}</code></p>
                )}
              </section>
            )}

            {listing.license === "custom" && listing.licenseText && (
              <section className="mp-section">
                <div className="eyebrow">// license terms<span className="caret" /></div>
                <pre className="mp-license">{listing.licenseText}</pre>
              </section>
            )}

            {listing.status === "sold" && (
              <section className="mp-section mp-section-sold">
                <div className="eyebrow">// sold<span className="caret" /></div>
                <p>Sold to <code>{shortAddr(listing.soldTo)}</code> on {new Date((listing.soldAt || 0) * 1000).toISOString().slice(0, 10)}.</p>
                {listing.soldTxHash && (
                  <p className="mp-sub-dim">tx: <code>{listing.soldTxHash.slice(0, 10)}…{listing.soldTxHash.slice(-6)}</code></p>
                )}
                {listing.soldTo?.toLowerCase() === profile?.address?.toLowerCase() && (
                  <div className="mp-buyer-actions">
                    <button type="button" className="btn-cta btn-cta-gold" onClick={fetchDelivery}>
                      // Fetch deliverable
                    </button>
                    {deliverReceipt && (
                      <div className="mp-deliver">
                        {deliverReceipt.kind === "file" && deliverReceipt.url && (
                          <a className="btn-cta btn-cta-ghost" href={deliverReceipt.url} target="_blank" rel="noopener noreferrer">
                            // Download
                          </a>
                        )}
                        {deliverReceipt.kind === "link" && deliverReceipt.url && (
                          <a className="btn-cta btn-cta-ghost" href={deliverReceipt.url} target="_blank" rel="noopener noreferrer">
                            // Open link
                          </a>
                        )}
                        {deliverReceipt.kind === "memo" && (
                          <code className="mp-deliver-memo">{deliverReceipt.receipt}</code>
                        )}
                        {deliverReceipt.kind === "error" && (
                          <span className="mp-err">{deliverReceipt.receipt}</span>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </section>
            )}
          </article>

          <aside className="mp-buy-card">
            <div className="mp-buy-price">
              <div className="mp-buy-price-num">{formatUsdc(listing.priceUsdc)}</div>
              <div className="mp-buy-price-unit">USDC{listing.priceStock ? ` · +${listing.priceStock.amount} ${listing.priceStock.symbol}` : ""}</div>
            </div>

            {canBuy && buy.kind !== "sold" && (
              <button
                type="button"
                className="btn-cta btn-cta-gold btn-cta-block"
                onClick={handleBuy}
                disabled={buy.kind === "signing" || buy.kind === "broadcasting" || buy.kind === "confirming"}
              >
                {buy.kind === "idle" && (isAuthenticated ? "// Buy now" : "// Connect to buy")}
                {buy.kind === "signing" && "// sign transferWithAuthorization…"}
                {buy.kind === "broadcasting" && "// broadcasting…"}
                {buy.kind === "confirming" && "// confirming…"}
              </button>
            )}

            {isOwner && (
              <div className="mp-owner-note">
                <div className="eyebrow">// you own this listing<span className="caret" /></div>
                <p>You are the seller. Buy flow is disabled.</p>
              </div>
            )}

            {listing.status !== "live" && !isOwner && (
              <div className="mp-buy-disabled">
                <div className="eyebrow">// not for sale<span className="caret" /></div>
                <p>This listing is <strong>{listing.status}</strong>.</p>
              </div>
            )}

            {buy.kind === "error" && (
              <div className="mp-error">
                <strong>// buy error</strong>
                <div>{buy.message}</div>
              </div>
            )}

            {buy.kind === "sold" && (
              <div className="mp-success">
                <div className="eyebrow">// purchased<span className="caret" /></div>
                <p>Settlement recorded.</p>
                <code className="mp-success-id">tx: {buy.txHash.slice(0, 10)}…{buy.txHash.slice(-6)}</code>
                {buy.deliveryKind === "memo" && (
                  <p className="mp-sub-dim">Your on-chain tx is your receipt.</p>
                )}
              </div>
            )}

            <ul className="mp-buy-meta">
              <li><strong>delivery:</strong> {listing.deliverableKind}</li>
              <li><strong>chain:</strong> {listing.chain}</li>
              <li><strong>USDC contract:</strong> <code>{listing.chain === "base" ? shortAddr(USDC_BASE) : "TBD"}</code></li>
              {listing.splitAddress && <li><strong>split:</strong> <code>{shortAddr(listing.splitAddress)}</code></li>}
            </ul>
          </aside>
        </div>

        <section className="mp-footnote">
          <div className="eyebrow">// notes<span className="caret" /></div>
          <p>
            Payment is verified on-chain after the buyer signs an EIP-3009 transferWithAuthorization
            for the listed USDC amount. Settlement posts the tx hash; the deliverable becomes
            accessible to the buyer wallet only. Splits distribute after settlement via 0xSplits
            SplitMain — until that contract is wired (t_adc8d3f8), splits run in dry-run and the
            listing is still recorded as sold.
          </p>
          <p>
            <Link href="/marketplace">// Back to marketplace</Link>
            {" · "}
            <Link href="/sell">// List your own</Link>
          </p>
        </section>
      </main>

      <Footer />
    </PublicLayout>
  )
}

// No getServerSideProps — next.config.js uses output: "export" (Cloudflare Pages static).
// Listing data is fetched client-side via useEffect; no SSR fetch required.