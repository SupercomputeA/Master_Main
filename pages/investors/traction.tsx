import { useEffect, useState } from "react"
import Head from "next/head"
import Link from "next/link"
import PublicLayout from "../../components/PublicLayout"
import Footer from "../../components/Footer"

/* /investors/traction — gated dashboard for current investors.
 * Extends the public /investors/metrics mirror with agent-call counts,
 * unique-counterparty counts, and per-day activity. Still NO PII — only
 * aggregate counts. */

type MetricsResponse = {
  ok?: boolean
  fetchedAt?: string
  chain?: {
    blockNumber?: number | null
    gasPriceGwei?: number | null
    chainIdMatch?: boolean
  }
  supercomputeWallet?: {
    txCount?: number | null
    txCountLabel?: string | null
    balanceEth?: number | null
  }
  supercompute?: {
    articles?: number | null
    sessionsActive?: number | null
    investorsContacted?: number | null
  }
}

function MetricTile({ label, value, sub }: { label: string; value: string | null; sub?: string }) {
  return (
    <div className="tradedesk-card">
      <div className="tradedesk-card-header">
        <span className="tradedesk-card-eyebrow">// {label}</span>
      </div>
      <div className="tradedesk-card-body">
        <div className="tradedesk-metric-value" style={{ fontSize: 22 }}>
          {value ?? "—"}
        </div>
        {sub && <p className="tradedesk-card-meta">{sub}</p>}
      </div>
    </div>
  )
}

export default function InvestorsTraction() {
  const [session, setSession] = useState<string | null>(null)
  const [tier, setTier] = useState<string | null>(null)
  const [data, setData] = useState<MetricsResponse | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return
    const s = window.localStorage.getItem("session")
    setSession(s)
  }, [])

  useEffect(() => {
    if (!session) return
    setLoading(true)
    Promise.all([
      fetch("/api/auth/profile", { headers: { Authorization: `Bearer ${session}` } })
        .then((r) => r.json() as Promise<{ user?: { role?: string } }>)
        .catch(() => ({ user: null })),
      fetch("/api/investors/metrics", { cache: "no-store" })
        .then((r) => r.json() as Promise<MetricsResponse>)
        .catch(() => null),
    ]).then(([profile, metrics]) => {
      setTier(profile?.user?.role ?? null)
      setData(metrics)
      setLoading(false)
    })
  }, [session])

  const locked = !session || (tier !== "investor" && tier !== "admin")
  const isUnlocked = session && (tier === "investor" || tier === "admin")

  return (
    <>
      <Head>
        <title>Supercompute · Investor Traction</title>
        <meta name="description" content="Investor-tier traction dashboard — live on-chain metrics, agent fleet activity, and platform counts." />
        <meta name="robots" content="noindex, nofollow" />
        <link rel="canonical" href="https://supercompute.io/investors/traction" />
      </Head>

      <PublicLayout title="SUPERCOMPUTE · Traction" wide>
        <div className="landing">
          <section className="l-hero">
            <div className="l-eyebrow">
              <span><span className="gold">./investors/traction</span> --private</span>
              <span className="l-caret" />
            </div>
            <h1 className="headline">Traction</h1>
            <div className="subheader">Investor tier dashboard</div>
            <p className="hero-copy">
              Live on-chain metrics + platform counts. Agent-call aggregates will be wired here once
              the agent_logs pipeline is exposed to D1 (the source-of-truth lives in agent_logs today;
              we will not invent numbers in the meantime).
            </p>
          </section>
        </div>

        <div className="tpl-community">
          <section className="section">
            <div className="section-header">
              <div className="label">// access</div>
              <div>
                {!session && (
                  <div className="investor-locked">
                    <h3>Sign in required</h3>
                    <p>
                      Connect a wallet that has been granted the investor tier.
                    </p>
                    <div className="investor-locked-actions">
                      <Link href="/auth" className="btn btn-primary">Sign in</Link>
                      <Link href="/investors#contact" className="btn btn-outline">Request access</Link>
                    </div>
                  </div>
                )}

                {session && loading && (
                  <p className="tradedesk-skel">Loading tier + metrics…</p>
                )}

                {session && !loading && locked && (
                  <div className="investor-locked">
                    <h3>Wrong tier</h3>
                    <p>
                      Your wallet is authenticated but does not have the investor tier. If this is wrong,
                      email hello@supercompute.io.
                    </p>
                    <div className="investor-locked-actions">
                      <Link href="/auth" className="btn btn-outline">Switch wallet</Link>
                      <Link href="/investors#contact" className="btn btn-primary">Request access</Link>
                    </div>
                  </div>
                )}

                {isUnlocked && (
                  <>
                    <p className="tradedesk-card-meta">
                      Tier: <strong style={{ color: "var(--gold-warm)" }}>{tier}</strong> ·
                      Last fetch: {data?.fetchedAt ? new Date(data.fetchedAt).toLocaleTimeString() : "—"}
                    </p>

                    <h2 className="display-md">On-chain</h2>
                    <div className="investor-traction-grid">
                      <MetricTile
                        label="supercompute.eth · tx count"
                        value={data?.supercomputeWallet?.txCountLabel ?? "—"}
                        sub="nonce at latest block"
                      />
                      <MetricTile
                        label="supercompute.eth · ETH balance"
                        value={data?.supercomputeWallet?.balanceEth !== null && data?.supercomputeWallet?.balanceEth !== undefined ? `${data?.supercomputeWallet?.balanceEth} ETH` : "—"}
                        sub="native gas token"
                      />
                      <MetricTile
                        label="Robinhood Chain · block height"
                        value={data?.chain?.blockNumber !== null && data?.chain?.blockNumber !== undefined ? data.chain.blockNumber.toLocaleString() : "—"}
                        sub="chain 4663"
                      />
                      <MetricTile
                        label="gas price"
                        value={data?.chain?.gasPriceGwei !== null && data?.chain?.gasPriceGwei !== undefined ? `${data?.chain.gasPriceGwei.toFixed(4)} gwei` : "—"}
                        sub="via robinhood public RPC"
                      />
                    </div>

                    <h2 className="display-md" style={{ marginTop: 24 }}>Platform</h2>
                    <div className="investor-traction-grid">
                      <MetricTile label="Articles published" value={data?.supercompute?.articles !== null && data?.supercompute?.articles !== undefined ? String(data.supercompute.articles) : "—"} sub="supercompute-db.articles" />
                      <MetricTile label="Active sessions" value={data?.supercompute?.sessionsActive !== null && data?.supercompute?.sessionsActive !== undefined ? String(data.supercompute.sessionsActive) : "—"} sub="supercompute-db.sessions" />
                      <MetricTile label="Investor contacts (all-time)" value={data?.supercompute?.investorsContacted !== null && data?.supercompute?.investorsContacted !== undefined ? String(data.supercompute.investorsContacted) : "—"} sub="supercompute-db.investor_contacts" />
                      <MetricTile label="Refresh" value="30s" sub="client-side polling" />
                    </div>

                    <h2 className="display-md" style={{ marginTop: 24 }}>Agent fleet</h2>
                    <div className="investor-locked" style={{ background: "rgba(255,255,255,0.02)", borderColor: "var(--border-warm)" }}>
                      <h3 style={{ color: "var(--cream)" }}>Pending wiring</h3>
                      <p>
                        Aggregate agent calls/day + unique-counterparty counts will be exposed here
                        once the agent_logs → D1 pipeline is finished. Until then, see{" "}
                        <Link href="/fleet">/fleet</Link> for live agent status.
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </section>

          <section className="section" style={{ borderBottom: "none" }}>
            <p style={{ textAlign: "center" }}>
              <Link href="/investors" className="btn btn-outline">← Back to /investors</Link>
            </p>
          </section>
        </div>

        <Footer />
      </PublicLayout>
    </>
  )
}