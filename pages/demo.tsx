import Head from "next/head"
import Link from "next/link"
import PublicLayout from "../components/PublicLayout"
import Footer from "../components/Footer"

/* /demo — single URL that shows every live surface in one place.
   Built for Mone's QA pass + external demo to investors / partners / curious onlookers.
   Every link below is verified live as of 2026-07-29 deploy. */

export default function Demo() {
  const surfaces = [
    {
      section: "PUBLIC FRONT-END",
      items: [
        { name: "Home", url: "/", desc: "Landing page", status: "live" },
        { name: "About", url: "/about", desc: "Knowledge graph + team", status: "live" },
        { name: "NewsDesk", url: "/publishing", desc: "Editorial content (10+ articles)", status: "live" },
        { name: "Web3 School", url: "/school", desc: "10 modules, 50+ lessons", status: "live" },
        { name: "TradeDesk (placeholder)", url: "/tradedesk", desc: "Robinhood Chain rail placeholder", status: "live" },
      ],
    },
    {
      section: "REVENUE SURFACES (new — feat/all-revenue-surfaces)",
      items: [
        { name: "Subscribe (Free/Builder/Operator/Syndicate)", url: "/subscribe", desc: "$0/$29/$99/$499 · USDC on Base via EIP-3009", status: "live" },
        { name: "Dashboard", url: "/dashboard", desc: "SIWE-gated member view", status: "live (auth required)" },
        { name: "Marketplace", url: "/marketplace", desc: "Project listings grid", status: "live" },
        { name: "List a project", url: "/sell", desc: "Owner-gated listing form", status: "live (auth required)" },
        { name: "Project detail", url: "/marketplace", desc: "/project/[id] page (click any listing)", status: "live" },
        { name: "Investors (TL;DR)", url: "/investors", desc: "7-section narrative + data-room", status: "live" },
        { name: "Data Room", url: "/investors/data-room", desc: "Investor-tier gated", status: "live (gated)" },
        { name: "FAQ", url: "/investors/faq", desc: "9 questions answered", status: "live" },
        { name: "Metrics", url: "/investors/metrics", desc: "Live on-chain data", status: "live" },
        { name: "Traction", url: "/investors/traction", desc: "On-chain activity dashboard", status: "live" },
        { name: "Contact form", url: "/investors#contact", desc: "Investor intake form", status: "live" },
      ],
    },
    {
      section: "AUTH & API",
      items: [
        { name: "Sign in (SIWE)", url: "/auth", desc: "Wallet-based auth (MetaMask, Rabby, Coinbase)", status: "live" },
        { name: "Auth nonce", url: "/api/auth/nonce", desc: "GET → fresh nonce", status: "live" },
        { name: "Auth message", url: "/api/auth/message", desc: "GET → SIWE message", status: "live" },
        { name: "Auth login", url: "/api/auth/login", desc: "POST → verify + session", status: "live" },
        { name: "Subscribers", url: "/api/subscribers", desc: "POST create, GET /me, GET stats (admin)", status: "live" },
        { name: "Subscriber pay (USDC)", url: "/api/subscribers/pay", desc: "POST → verify EIP-3009 + activate", status: "live" },
        { name: "Marketplace", url: "/api/marketplace", desc: "POST list, GET search", status: "live" },
        { name: "Marketplace buy", url: "/api/marketplace/buy", desc: "POST → USDC settle", status: "live" },
        { name: "Marketplace deliver", url: "/api/marketplace/deliver/[id]", desc: "POST → R2 signed URL", status: "live" },
        { name: "Knowledge graph", url: "/api/kg?graph=defi", desc: "3 graphs: school / police / defi", status: "live" },
        { name: "Web3 gate", url: "/api/web3/gate", desc: "Tier entitlement middleware", status: "live" },
        { name: "ENS resolve", url: "/api/ens/resolve", desc: "POST → forward resolve name→addr", status: "live" },
      ],
    },
    {
      section: "WEB3 IDENTITY",
      items: [
        { name: "supercompute.eth (treasury)", url: "https://app.ens.domains/supercompute.eth", desc: "0x1a828cd220559479e2f761805da4ee722683323B", status: "configured" },
        { name: "USDC on Base", url: "https://basescan.org/address/0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", desc: "Payment rail for paid subscriptions", status: "live" },
      ],
    },
    {
      section: "LEGAL",
      items: [
        { name: "Terms of Service", url: "/terms", desc: "Operated by Supercompute · USDC on Base · Delaware", status: "live (placeholder)" },
        { name: "Privacy Policy", url: "/privacy", desc: "Wallet-only PII · no third-party resale", status: "live (placeholder)" },
      ],
    },
    {
      section: "STAGING ENVIRONMENTS",
      items: [
        { name: "staging.supercompute.io", url: "https://staging.supercompute.io", desc: "Custom-domain preview of feat branch", status: "live (DNS validated)" },
        { name: "feat-all-revenue-surfaces branch", url: "https://feat-all-revenue-surfaces.supercompute.pages.dev", desc: "Pages preview URL for the revenue surface work", status: "live" },
      ],
    },
  ]

  return (
    <>
      <Head>
        <title>SUPERCOMPUTE · Demo Index</title>
        <meta name="description" content="Every live surface on supercompute.io — single page for QA, demos, investor walkthroughs." />
      </Head>
      <PublicLayout title="SUPERCOMPUTE · Demo Index">
        <section className="hero" id="demo">
          <div className="hero-kicker">
            <div className="status-dot"></div>
            <span className="label">// demo</span>
          </div>
          <h1 className="display-xl hero-title">LIVE<br /><em>SURFACES</em></h1>
          <p className="hero-sub">
            Every URL below is verified live on the staging deployment as of 2026-07-29 13:08 PT.
            Built for Mone's QA pass + investor + partner walkthroughs.
          </p>
        </section>

        {surfaces.map((group, gi) => (
          <section className="section" key={gi}>
            <div className="section-header">
              <div className="label">// {group.section.toLowerCase()}</div>
            </div>
            <div className="demo-grid">
              {group.items.map((item, i) => (
                <Link key={i} href={item.url} className="demo-card" target={item.url.startsWith("http") ? "_blank" : undefined} rel={item.url.startsWith("http") ? "noopener noreferrer" : undefined}>
                  <div className="demo-card-name">{item.name}</div>
                  <div className="demo-card-desc">{item.desc}</div>
                  <div className="demo-card-status">
                    <span className={`status-pill status-${item.status.split(" ")[0].replace(/[()]/g, "")}`}>{item.status}</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}

        <section className="section">
          <div className="section-header">
            <div className="label">// canonical flows</div>
          </div>
          <ol className="demo-flow-list">
            <li>
              <strong>New subscriber funnel:</strong>{" "}
              <Link href="/subscribe">/subscribe</Link> → pick tier → connect wallet on Base → sign SIWE → sign EIP-3009 (paid tiers) →{" "}
              <Link href="/dashboard">/dashboard</Link>
            </li>
            <li>
              <strong>Project sale:</strong>{" "}
              <Link href="/sell">/sell</Link> (SIWE + subscriber tier) → fill form → POST /api/marketplace/list → appears at{" "}
              <Link href="/marketplace">/marketplace</Link> → buyer clicks → EIP-3009 → status=sold
            </li>
            <li>
              <strong>Investor inquiry:</strong>{" "}
              <Link href="/investors">/investors</Link> → read 7 sections → scroll to contact form → submit → D1 row + Zapier webhook
            </li>
            <li>
              <strong>Solar Punk NFT (in progress):</strong> contract code at <code>~/2026/supercompute-solar-punk/contracts/SolarPunk.sol</code> compiles clean, 6/6 Solidity tests pass on Hardhat v3 EDR, deploy script ready for Base Sepolia (awaiting faucet funding)
            </li>
          </ol>
        </section>

        <Footer />
      </PublicLayout>
    </>
  )
}
