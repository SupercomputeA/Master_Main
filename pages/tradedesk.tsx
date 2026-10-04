import dynamic from "next/dynamic"
import Link from "next/link"
import PublicLayout from "../components/PublicLayout"
import Footer from "../components/Footer"

/**
 * /tradedesk — the Supercompute investment rail.
 *
 * This is NOT a chain demo. It is the public entry for the Robinhood Chain
 * community asset — a new capital-formation rail started from zero on chain 4663.
 * The mounted TradeDesk component is the capability/proof section — read-only,
 * no live writes.
 *
 * Boundaries (enforced, not optional):
 *  1. Robinhood credentials never touch this surface — public = link-out only.
 *  2. No investment-advice framing — state what the rail is, link out, do not
 *     advise or imply returns.
 *  3. Component charter: mode="read-only", no live writes, jurisdiction banner
 *     stays, no fabricated chain data.
 *  4. Separation: the Robinhood Chain community asset and the company $QUANTA
 *     back-end services token are different rails. $QUANTA never appears here.
 */

const TradeDesk = dynamic(() => import("../components/TradeDeskMount"), {
  ssr: false,
  loading: () => <TradeDeskSkeleton />,
})

function TradeDeskSkeleton() {
  return (
    <div
      data-tradedesk-skeleton
      style={{
        border: "1px solid var(--border)",
        padding: "20px 24px",
        maxWidth: 960,
        margin: "0 auto",
        color: "var(--mono-blue)",
        fontFamily: "var(--font-mono)",
        fontSize: 13,
      }}
    >
      <span className="label">// hydrating TradeDesk...</span>
    </div>
  )
}

export default function TradeDeskPage() {
  return (
    <PublicLayout title="SUPERCOMPUTE · TradeDesk" wide>
      {/* ─── Rail narrative ─────────────────────────────────────────── */}
      <section className="section" aria-labelledby="rail-title">
        <div className="section-header">
          <div className="label">// investment rail · robinhood chain 4663</div>
          <div>
            <h1 id="rail-title" className="display-md">TradeDesk</h1>
          </div>
        </div>

        <div className="landing" style={{ maxWidth: 720, margin: "0 auto" }}>
          <p className="hero-copy" style={{ fontSize: 15, lineHeight: 1.8 }}>
            TradeDesk is the public surface for the Supercompute Robinhood Chain
            community asset. The rail is being started from zero on chain 4663:
            a read-only desk where the community can verify on-chain activity and
            follow the asset as it launches. The company $QUANTA token is a
            separate back-end services rail and does not appear here.
          </p>

          {/* Community asset — no live token CTA until the asset launches */}
          <div style={{
            marginTop: 32,
            marginBottom: 32,
            padding: 24,
            border: "1px solid var(--border)",
            background: "var(--navy)",
          }}>
            <div className="label" style={{ marginBottom: 12 }}>
              // community asset · robinhood chain 4663
            </div>
            <h2 className="display-sm" style={{ marginBottom: 8 }}>
              Robinhood Chain Asset
            </h2>
            <p style={{ color: "var(--mono-blue)", fontSize: 13, lineHeight: 1.7, marginBottom: 16 }}>
              The community asset does not exist yet. When it launches, this rail
              will point to the Robinhood Chain token address and trade surface.
              Until then the desk stays read-only and no capital is solicited.
            </p>
            <a
              href="https://robinhoodchain.blockscout.com"
              className="btn btn-outline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Robinhood Chain Explorer ↗
            </a>
          </div>

          {/* Robinhood entry — link-out only, no proxied auth */}
          <div style={{
            marginTop: 16,
            marginBottom: 32,
            padding: 24,
            border: "1px solid var(--border)",
            background: "var(--navy)",
          }}>
            <div className="label" style={{ marginBottom: 12 }}>
              // treasury · robinhood
            </div>
            <h2 className="display-sm" style={{ marginBottom: 8 }}>
              Robinhood Treasury
            </h2>
            <p style={{ color: "var(--mono-blue)", fontSize: 13, lineHeight: 1.7, marginBottom: 16 }}>
              The Supercompute Robinhood account is the holding leg of the rail.
              Sign in to Robinhood directly through their own site; any internal
              operations dashboard lives on a separate, authenticated route.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <a
                href="https://robinhood.com/signup"
                className="btn btn-outline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Open a Robinhood account ↗
              </a>
              <a
                href="https://robinhood.com/login"
                className="btn btn-outline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Log in to Robinhood ↗
              </a>
            </div>
          </div>

          {/* Livestream presence */}
          <div style={{
            marginTop: 16,
            marginBottom: 32,
            padding: 24,
            border: "1px solid var(--border)",
            background: "var(--navy)",
          }}>
            <div className="label" style={{ marginBottom: 12 }}>
              // livestream
            </div>
            <h2 className="display-sm" style={{ marginBottom: 8 }}>
              Live Streams
            </h2>
            <p style={{ color: "var(--mono-blue)", fontSize: 13, lineHeight: 1.7, marginBottom: 16 }}>
              The rail is announced during Supercompute livestreams. Follow the
              official channels for the stream schedule and the asset launch.
            </p>
            <Link href="/social" className="btn btn-outline">
              Follow Supercompute →
            </Link>
          </div>

          {/* Disclaimer */}
          <div style={{
            marginTop: 24,
            padding: "16px 20px",
            border: "1px solid var(--border)",
            fontSize: 11,
            color: "var(--mono-blue)",
            lineHeight: 1.7,
          }}>
            <strong style={{ color: "var(--gold-warm)" }}>Disclaimer:</strong>{" "}
            This page describes a planned community asset on Robinhood Chain. The
            asset has not launched and no token is being offered or sold here. This
            is not investment advice, and nothing on this page is a recommendation
            to buy, sell, or hold any security or digital asset.
          </div>
        </div>
      </section>

      {/* ─── Capability / proof: mounted TradeDesk component (read-only) ─── */}
      <section className="section" aria-labelledby="tradedesk-mount-title">
        <div className="section-header">
          <div className="label">// capability · robinhood chain · 4663 · read-only</div>
          <div>
            <h2 id="tradedesk-mount-title" className="display-md">
              Chain Read Surface
            </h2>
          </div>
        </div>

        <p style={{
          color: "var(--mono-blue)",
          fontSize: 13,
          lineHeight: 1.7,
          maxWidth: 720,
          margin: "0 auto 24px",
        }}>
          The mounted TradeDesk component provides a live, read-only view of
          Robinhood Chain (4663). No write operations are available in this mode —
          the surface is proof of capability, not an execution terminal.
        </p>

        <TradeDesk />
      </section>

      {/* ─── Chain proof endpoint ───────────────────────────────────── */}
      <section className="section" style={{ borderBottom: "none" }}>
        <div className="section-header">
          <div className="label">// api · live proof</div>
          <div>
            <h2 className="display-sm">Chain Proof</h2>
          </div>
        </div>
        <div style={{ textAlign: "center", padding: "16px 0" }}>
          <Link
            href="/api/web3/chain"
            className="btn btn-outline"
            style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}
          >
            GET /api/web3/chain →
          </Link>
          <p style={{
            color: "var(--mono-blue)",
            fontSize: 11,
            marginTop: 12,
            lineHeight: 1.6,
          }}>
            Live proof endpoint: returns chainId + blockNumber from the Robinhood
            Chain RPC. Verifies the rail is connected.
          </p>
        </div>
      </section>

      <Footer />
    </PublicLayout>
  )
}
