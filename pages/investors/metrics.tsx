import { useEffect, useState } from "react"
import Head from "next/head"
import Link from "next/link"
import PublicLayout from "../../components/PublicLayout"
import Footer from "../../components/Footer"

/* /investors/metrics — public, ungated traction mirror.
 * Suitable for linking in cold emails; no PII, no auth required. */

type MetricsResponse = {
  ok?: boolean
  fetchedAt?: string
  chain?: {
    provider?: string
    chainId?: number | null
    expectedChainId?: number
    chainIdMatch?: boolean
    blockNumber?: number | null
    gasPriceGwei?: number | null
    available?: boolean
    error?: string
  }
  supercomputeWallet?: {
    address?: string
    explorer?: string
    txCount?: number | null
    txCountLabel?: string | null
    balanceEth?: number | null
  }
  supercompute?: {
    articles?: number | null
    sessionsActive?: number | null
    investorsContacted?: number | null
  }
  disclaimer?: string
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

export default function InvestorsMetrics() {
  const [data, setData] = useState<MetricsResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    function tick() {
      fetch("/api/investors/metrics", { cache: "no-store" })
        .then((r) => r.json() as Promise<MetricsResponse>)
        .then((d) => {
          if (!cancelled) {
            setData(d)
            setLoading(false)
          }
        })
        .catch(() => {
          if (!cancelled) setLoading(false)
        })
    }
    tick()
    const id = setInterval(tick, 30_000)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [])

  const tx = data?.supercomputeWallet?.txCountLabel ?? null
  const bal = data?.supercomputeWallet?.balanceEth ?? null
  const block = data?.chain?.blockNumber ?? null
  const gas = data?.chain?.gasPriceGwei ?? null
  const articles = data?.supercompute?.articles ?? null
  const sessions = data?.supercompute?.sessionsActive ?? null
  const investorsContacted = data?.supercompute?.investorsContacted ?? null
  const fetchedAt = data?.fetchedAt ?? null
  const chainMatch = data?.chain?.chainIdMatch ?? false

  return (
    <>
      <Head>
        <title>Supercompute · Live Metrics</title>
        <meta
          name="description"
          content="Live, ungated metrics for the Supercompute public rail — Robinhood Chain block height, supercompute.eth on-chain activity, and platform counts."
        />
        <meta property="og:title" content="Supercompute · Live Metrics" />
        <meta property="og:description" content="Live traction: Robinhood Chain block height, supercompute.eth tx count, ETH balance, and platform counts." />
        <link rel="canonical" href="https://supercompute.io/investors/metrics" />
      </Head>

      <PublicLayout title="SUPERCOMPUTE · Live Metrics" wide>
        <div className="landing">
          <section className="l-hero">
            <div className="l-eyebrow">
              <span><span className="gold">./investors/metrics</span> --public</span>
              <span className="l-caret" />
            </div>
            <h1 className="headline">Live Metrics</h1>
            <div className="subheader">No login. No PII. Refresh every 30s.</div>
            <p className="hero-copy">
              Every number below is a real read from a public RPC or a row count in our D1.
              When an upstream is unavailable the field is reported as <code>—</code> — we never fabricate.
            </p>
            <div style={{ marginTop: 24, display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/investors" className="btn btn-outline">← Back to narrative</Link>
              <a href="/api/investors/metrics" target="_blank" rel="noreferrer" className="btn btn-outline">Raw JSON</a>
            </div>
          </section>
        </div>

        <div className="tpl-community">
          <section className="section">
            <div className="section-header">
              <div className="label">// chain · robinhood-mainnet</div>
              <div>
                <h2 className="display-md">On-chain</h2>
                {loading && <p className="tradedesk-skel">Reading chain…</p>}
                <div className="investor-traction-grid">
                  <MetricTile
                    label="block height"
                    value={block !== null ? block.toLocaleString() : "—"}
                    sub={chainMatch ? "chain 4663 ✓" : (data?.chain?.available === false ? "rpc unavailable" : "chain mismatch")}
                  />
                  <MetricTile
                    label="gas price"
                    value={gas !== null ? `${gas.toFixed(4)} gwei` : "—"}
                    sub="via robinhood public RPC"
                  />
                  <MetricTile
                    label="supercompute.eth · tx count"
                    value={tx ?? "—"}
                    sub="nonce at latest block"
                  />
                  <MetricTile
                    label="supercompute.eth · ETH balance"
                    value={bal !== null ? `${bal} ETH` : "—"}
                    sub="native gas token"
                  />
                </div>
                <p className="tradedesk-card-meta">
                  Wallet: <a href={data?.supercomputeWallet?.explorer ?? "#"} target="_blank" rel="noreferrer" className="mono-link">{data?.supercomputeWallet?.address ?? "0x1a828cd220559479e2f761805da4ee722683323B"}</a>
                </p>
              </div>
            </div>
          </section>

          <section className="section">
            <div className="section-header">
              <div className="label">// platform · d1</div>
              <div>
                <h2 className="display-md">Platform counts</h2>
                <div className="investor-traction-grid">
                  <MetricTile label="Articles published" value={articles !== null ? String(articles) : "—"} sub="supercompute-db.articles" />
                  <MetricTile label="Active sessions" value={sessions !== null ? String(sessions) : "—"} sub="supercompute-db.sessions" />
                  <MetricTile label="Investor contacts (all-time)" value={investorsContacted !== null ? String(investorsContacted) : "—"} sub="supercompute-db.investor_contacts" />
                  <MetricTile
                    label="Fetched"
                    value={fetchedAt ? new Date(fetchedAt).toLocaleTimeString() : "—"}
                    sub="UTC ISO on the response"
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="section" style={{ borderBottom: "none" }}>
            <p className="tradedesk-card-warning">
              <strong>Methodology.</strong> On-chain reads come from the public Robinhood Chain RPC
              (<code>rpc.mainnet.chain.robinhood.com</code>) and are cached for 60s. Platform
              counts come from a live D1 query. No on-chain writes are performed by this page.
            </p>
            <p style={{ textAlign: "center", marginTop: 18 }}>
              <Link href="/investors" className="btn btn-outline">← Back to /investors</Link>
            </p>
          </section>
        </div>

        <Footer />
      </PublicLayout>
    </>
  )
}