import Head from "next/head"
import PublicLayout from "../components/PublicLayout"
import Footer from "../components/Footer"

/* /terms — Terms of Service stub.
   Full legal copy pending review. The text below covers the structural commitments:
   wallet-only access, USDC-on-Base payments, non-custodial architecture, jurisdiction
   defaults to Delaware (US) until we file elsewhere. */

export default function Terms() {
  return (
    <>
      <Head>
        <title>SUPERCOMPUTE · Terms of Service</title>
        <meta name="description" content="Supercompute Terms of Service — non-custodial, wallet-first, USDC on Base." />
      </Head>
      <PublicLayout title="SUPERCOMPUTE · Terms of Service">
        <section className="hero" id="terms">
          <div className="hero-kicker">
            <div className="status-dot"></div>
            <span className="label">// terms</span>
          </div>
          <h1 className="display-xl hero-title">TERMS OF<br /><em>SERVICE</em></h1>
          <p className="hero-sub">
            Operated by <strong>Supercompute</strong>. Last updated 2026-07-29.
          </p>
        </section>

        <section className="section">
          <div className="legal-stub">
            <p style={{ color: "var(--gold-warm)", fontWeight: 600, marginBottom: 16 }}>
              [PLACEHOLDER] Full Terms of Service pending legal review. The commitments below are operative.
            </p>

            <h2 className="display-md">1. Operator</h2>
            <p>
              Supercompute ("Supercompute", "we", "us") operates the website at supercompute.io
              and the associated API endpoints. The on-chain treasury address is{" "}
              <code>0x1a828cd220559479e2f761805da4ee722683323B</code> (supercompute.eth).
              All subscription revenue settles to this address.
            </p>

            <h2 className="display-md">2. Service description</h2>
            <p>
              Supercompute provides a non-custodial software platform for accessing Web3 tools,
              protocol evaluations, educational content, and an agent-inference API. Users
              authenticate with their own Ethereum wallet (SIWE); we never custody user funds,
              private keys, or seed phrases.
            </p>

            <h2 className="display-md">3. Subscriptions and payment</h2>
            <p>
              Paid tiers (Builder, Operator, Syndicate) require a USDC payment on Base mainnet
              via EIP-3009 transferWithAuthorization. The USDC contract is{" "}
              <code>0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913</code>. Payments are
              non-refundable except as required by applicable law. Subscriptions are 30-day
              windows and do not auto-renew; users sign a new authorization each cycle.
            </p>

            <h2 className="display-md">4. Acceptable use</h2>
            <p>
              You agree not to (a) reverse-engineer the platform, (b) use it to violate
              applicable law, (c) interfere with other users' access, (d) attempt to drain
              the Supercompute treasury or related smart contracts. We reserve the right to
              suspend access for violations.
            </p>

            <h2 className="display-md">5. Disclaimers</h2>
            <p>
              The platform is provided "as is" without warranties of any kind. Cryptocurrency
              markets, smart contract risk, and regulatory uncertainty are inherent to the
              services we offer. Nothing on this site is financial, legal, or investment advice.
            </p>

            <h2 className="display-md">6. Jurisdiction</h2>
            <p>
              Disputes governed by the laws of the State of Delaware, United States, unless
              and until Supercompute incorporates or registers elsewhere. [PLACEHOLDER —
              confirm entity of record before public launch.]
            </p>

            <h2 className="display-md">7. Contact</h2>
            <p>
              Questions: <a href="mailto:legal@supercompute.io">legal@supercompute.io</a>.
              Operator: Supercompute.
            </p>
          </div>
        </section>

        <Footer />
      </PublicLayout>
    </>
  )
}
