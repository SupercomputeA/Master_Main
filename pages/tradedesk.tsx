import dynamic from "next/dynamic"
import PublicLayout from "../components/PublicLayout"
import Footer from "../components/Footer"

/**
 * Public TradeDesk mount.
 *
 * The component remains owned by SupercomputeA/supercompute-tradedesk. The
 * website provides global wagmi/query providers in pages/_app.tsx and owns
 * this Terminal Dossier chrome via PublicLayout.
 *
 * The component is loaded with `ssr: false` because it reaches into the
 * wagmi provider context (`useConnection`, `useChainId`) at render time.
 * `next export` prerenders pages to static HTML without a provider in scope,
 * so the wagmi calls would throw `WagmiProviderNotFoundError` during the
 * build. Skipping SSR means the static export renders the chrome only and
 * the component hydrates in the browser where the real provider lives.
 *
 * The `mode="read-only"` posture is set inside components/TradeDeskMount.tsx
 * so it remains the single source of truth for how the surface is exposed
 * to the website.
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
      <section className="section" aria-labelledby="tradedesk-mount-title">
        <div className="section-header">
          <div className="label">// robinhood chain · 4663 · read-only</div>
          <div>
            <h1 id="tradedesk-mount-title" className="display-md">TradeDesk</h1>
          </div>
        </div>

        <TradeDesk />
      </section>
      <Footer />
    </PublicLayout>
  )
}
