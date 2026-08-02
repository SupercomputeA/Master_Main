import Head from "next/head"
import PublicLayout from "../components/PublicLayout"
import Footer from "../components/Footer"

/* /privacy — Privacy Policy stub.
   Non-custodial: we collect wallet addresses, IP addresses for rate limiting,
   and any email addresses submitted via the /subscribe lead-capture form.
   We do not collect name, address, SSN, or any PII beyond what users voluntarily
   submit. No third-party trackers beyond PostHog (anonymized) and Cloudflare Analytics. */

export default function Privacy() {
  return (
    <>
      <Head>
        <title>SUPERCOMPUTE · Privacy Policy</title>
        <meta name="description" content="Supercompute Privacy Policy — wallet-first, minimal data, no third-party resale." />
      </Head>
      <PublicLayout title="SUPERCOMPUTE · Privacy Policy">
        <section className="hero" id="privacy">
          <div className="hero-kicker">
            <div className="status-dot"></div>
            <span className="label">// privacy</span>
          </div>
          <h1 className="display-xl hero-title">PRIVACY<br /><em>POLICY</em></h1>
          <p className="hero-sub">
            Operated by <strong>Supercompute</strong>. Last updated 2026-07-29.
          </p>
        </section>

        <section className="section">
          <div className="legal-stub">
            <p style={{ color: "var(--gold-warm)", fontWeight: 600, marginBottom: 16 }}>
              [PLACEHOLDER] Full Privacy Policy pending legal review. The data practices below are operative.
            </p>

            <h2 className="display-md">1. Data we collect</h2>
            <ul>
              <li>Wallet addresses (when you authenticate via SIWE or subscribe)</li>
              <li>Email addresses (only if you submit the lead-capture form on /subscribe)</li>
              <li>IP addresses and request metadata (Cloudflare Workers runtime, retained 30 days)</li>
              <li>On-chain transaction hashes (when you pay for a subscription)</li>
            </ul>

            <h2 className="display-md">2. Data we do NOT collect</h2>
            <ul>
              <li>Private keys, seed phrases, or any signing material — these never leave your wallet</li>
              <li>Name, address, phone, government ID, or financial account details</li>
              <li>Browsing history outside of supercompute.io</li>
            </ul>

            <h2 className="display-md">3. How we use data</h2>
            <p>
              Wallet addresses power authentication and subscription state. Email addresses
              (when provided) are used solely for tier-launch notifications. On-chain hashes
              are used as payment receipts. IP addresses power rate limiting and abuse
              prevention. No data is sold to third parties, ever.
            </p>

            <h2 className="display-md">4. Third-party services</h2>
            <ul>
              <li><strong>Cloudflare</strong> — CDN, Workers runtime, DDoS protection (privacy policy: cloudflare.com/privacypolicy)</li>
              <li><strong>PostHog</strong> — anonymized product analytics, opt-out via cookie banner (privacy policy: posthog.com/privacy)</li>
              <li><strong>Base / Ethereum public RPCs</strong> — read-only blockchain queries, no account required</li>
            </ul>

            <h2 className="display-md">5. Your rights</h2>
            <p>
              You may request export or deletion of your subscriber record at any time by
              emailing <a href="mailto:privacy@supercompute.io">privacy@supercompute.io</a>.
              Wallet-derived subscription state cannot be deleted without deleting the wallet
              itself — that record lives on-chain, not in our database.
            </p>

            <h2 className="display-md">6. Contact</h2>
            <p>
              Data Protection inquiries: <a href="mailto:privacy@supercompute.io">privacy@supercompute.io</a>.
              Operator: Supercompute.
            </p>
          </div>
        </section>

        <Footer />
      </PublicLayout>
    </>
  )
}
