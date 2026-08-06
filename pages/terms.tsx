import Head from "next/head"
import PublicLayout from "../components/PublicLayout"
import Footer from "../components/Footer"

/* /terms — Terms of Service.
   Source: docs/legal/terms.md (drafted by legal-copy task, pending C2 review).
   Last updated: 2026-08-06 — bump LAST_UPDATED below when this file changes. */
const LAST_UPDATED = "2026-08-06"
const EFFECTIVE_DATE = "2026-08-06"
const POLICY_VERSION = "v1.0"
const TREASURY = "0x1a828cd220559479e2f761805da4ee722683323B"
const USDC_BASE = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"

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
            Operated by <strong>Supercompute</strong>.{" "}
            <span className="updated-line">v{POLICY_VERSION} · Last updated {LAST_UPDATED} · Effective {EFFECTIVE_DATE}</span>
          </p>
        </section>

        <section className="section">
          <div className="legal-stub">
            <p>
              These Terms of Service (&ldquo;Terms&rdquo;) govern your use of the website at
              supercompute.io, the associated API endpoints, the agent-inference service, the
              marketplace, the school surface, and any related products operated by
              Supercompute (&ldquo;Supercompute,&rdquo; &ldquo;we,&rdquo; &ldquo;us&rdquo;). By
              connecting a wallet, signing in, or otherwise using the service, you agree to
              these Terms.
            </p>

            <h2 className="display-md">1. Operator identity</h2>
            <p>
              The service is operated by <strong>Supercompute</strong>. Until a formal
              corporate entity is on file, all references to &ldquo;Supercompute&rdquo; mean
              the unincorporated operator behind the supercompute.io domain and the on-chain
              treasury address below.
            </p>
            <ul>
              <li>
                <strong>On-chain treasury handle:</strong> <code>{TREASURY}</code>{" "}
                (supercompute.eth). All subscription revenue and marketplace settlements
                flow to this address.
              </li>
              <li><strong>Domain of record:</strong> supercompute.io</li>
              <li>
                <strong>Contact:</strong> <a href="mailto:contact@supercompute.io">contact@supercompute.io</a>{" "}
                <em>(proposed; confirm before public launch)</em>
              </li>
            </ul>
            <p>
              We do not represent that a particular LLC, corporation, or other legal entity
              currently exists. If we later incorporate, we will update this section and
              re-publish the Terms.
            </p>

            <h2 className="display-md">2. Eligibility and wallet-first access</h2>
            <p>
              The service is intended for users who can form a binding contract under the
              laws of their jurisdiction. By using the service you represent that you meet
              this requirement.
            </p>
            <p>
              <strong>There is no email-and-password account system.</strong> Authentication
              is wallet-first via <strong>Sign-In With Ethereum (SIWE)</strong>. To create an
              authenticated session you must:
            </p>
            <ol>
              <li>Hold an Ethereum-compatible wallet (EOA or smart wallet) that you control.</li>
              <li>Sign a SIWE message with that wallet; the signed nonce and message are verified server-side and a short-lived session cookie is issued.</li>
              <li>The session cookie expires automatically; you may disconnect at any time by clearing site data or signing out.</li>
            </ol>
            <p>
              We do not ask for, store, or have any ability to recover your private keys,
              seed phrases, or signing material. <strong>If you lose access to your wallet,
              you lose access to your account.</strong> Choose your custody model (hardware
              wallet, self-custody, custodial provider) accordingly.
            </p>
            <p>
              Minors may use the school surface only with the supervision of a parent, legal
              guardian, or educator. See also Section 12 of our Privacy Policy for the
              children&rsquo;s-data posture.
            </p>

            <h2 className="display-md">3. Payments</h2>
            <p>
              <strong>Accepted currency:</strong> USDC on <strong>Base</strong> mainnet only.
              We do not accept ETH, other ERC-20s, fiat, or off-chain payment for service
              fees.
            </p>
            <p>
              <strong>Payment mechanism:</strong> EIP-3009{" "}
              <code>transferWithAuthorization</code>. You sign an authorization in your
              wallet; the on-chain transfer settles from your wallet to our treasury
              address. You authorize each subscription window manually; we do not pull
              funds on a recurring basis without a fresh signature.
            </p>
            <p>
              <strong>Network fees:</strong> You are responsible for any gas (network) fees
              the Base network charges to settle your payment.
            </p>
            <p>
              <strong>Non-custodial architecture:</strong> Supercompute <strong>never</strong>{" "}
              holds your private keys, seed phrases, signing material, or funds in custody
              at any point in the flow. All signing happens in your wallet. We never have
              the ability to move funds on your behalf. You can verify every transaction
              on-chain before signing.
            </p>
            <p>
              <strong>Refunds:</strong> Payments are non-refundable except as required by
              applicable law. Because payments settle on-chain and are not held in our
              custody, chargebacks are not available; if you believe a charge is in error,
              contact us at the address below and we will investigate.
            </p>
            <p>
              <strong>Pricing and tier changes:</strong> Prices and tier benefits may
              change. Active subscription windows remain honored at the price paid;
              subsequent renewals use the price displayed at sign-time. The accepted USDC
              payment contract is <code>{USDC_BASE}</code>.
            </p>

            <h2 className="display-md">4. Token-gated features</h2>
            <p>
              Several features are gated by wallet holdings rather than by account state:
            </p>
            <ul>
              <li><strong>SOLAR PUNK NFT</strong> — holders receive access to certain products, channels, or events.</li>
              <li><strong>School access</strong> — gated by holding a qualifying NFT or ticket; eligibility checked by reading on-chain holdings server-side at request time.</li>
              <li><strong>Marketplace and merch</strong> — access to specific drops, discounts, or pre-orders gated by wallet holdings.</li>
              <li><strong>Consulting tiers</strong> — call availability, depth of engagement, and channel access gated by holding a qualifying NFT or subscription tier.</li>
            </ul>
            <p>
              Gating is enforced by reading on-chain data; if you transfer a qualifying
              token out of your wallet, your access ends. We do not maintain a parallel
              off-chain &ldquo;entitlement&rdquo; database that outlives your holdings.
            </p>
            <p>
              We do not warrant the availability of any specific token-gated feature for
              any specific duration. Tokens may lose, gain, or change gating status at our
              discretion.
            </p>

            <h2 className="display-md">5. Marketplace and merch</h2>
            <p>The marketplace may list physical or digital goods from Supercompute or third-party sellers. The following disclaimers apply:</p>
            <ul>
              <li><strong>Third-party goods:</strong> Goods shipped or fulfilled by third parties are sold subject to that party&rsquo;s own policies. Supercompute passes through manufacturer warranties where applicable but disclaims all other warranties on third-party goods.</li>
              <li><strong>Fulfillment:</strong> Shipping times, customs, and import duties (where applicable) are the responsibility of the seller or shipping carrier. Supercompute is not liable for carrier delays or lost-in-transit items after tracking confirms handoff.</li>
              <li><strong>Pricing and availability:</strong> Prices and inventory shown on the site may change without notice. We may refuse or cancel orders that appear to be errors (e.g., pricing bugs).</li>
              <li><strong>Returns:</strong> Returns are governed by the listing&rsquo;s return policy, which is displayed at checkout. Custom, limited-edition, or digital goods are generally non-returnable.</li>
              <li><strong>No resale for speculation:</strong> You agree not to use the marketplace to scalp, flip-for-resale, or otherwise extract speculative margin in a way that degrades the experience for other users.</li>
            </ul>

            <h2 className="display-md">6. Consulting</h2>
            <p>Where consulting or advisory services are offered (e.g., via embedded Calendly booking):</p>
            <ul>
              <li><strong>Scope of engagement:</strong> Each engagement is governed by a separate scope-of-work document executed before work begins. Nothing on this site constitutes a consulting engagement, an advisory relationship, or an offer to provide one.</li>
              <li><strong>No fiduciary duty:</strong> Supercompute and its operators do not owe you any fiduciary, fiduciary-like, or special duty. The relationship is at-will and commercial.</li>
              <li><strong>No investment, legal, or tax advice:</strong> We do not provide investment, legal, tax, or accounting advice. Any information shared during a consulting engagement is educational or operational in nature; you are responsible for your own decisions and for consulting your own licensed advisors.</li>
              <li><strong>Confidentiality:</strong> Where a mutual NDA is in place, the parties&rsquo; confidentiality obligations are governed by that NDA, not by these Terms.</li>
            </ul>

            <h2 className="display-md">7. Acceptable use</h2>
            <p>You agree not to use the service to:</p>
            <ol>
              <li><strong>Violate any applicable law</strong> — including anti-money-laundering, sanctions, securities, tax, consumer-protection, and export-control laws.</li>
              <li><strong>Abuse the infrastructure</strong> — including denial-of-service, scraping beyond published rate limits, resource exhaustion, or attempts to bypass rate-limiting or quota enforcement.</li>
              <li><strong>Circumvent token-gating</strong> — including by falsifying wallet holdings, Sybil-attacking eligibility checks, or attempting to spoof on-chain state.</li>
              <li><strong>Scrape for resale or training</strong> — including scraping the site, the API, or the agent-inference output to build a competing product, train a competing model, or resell access.</li>
              <li><strong>Submit content you do not have the right to submit</strong> — including infringing, defamatory, harassing, or unlawful content.</li>
              <li><strong>Impersonate</strong> — including impersonating Supercompute, another user, or any third party.</li>
              <li><strong>Attempt to drain or interfere with the treasury or related smart contracts.</strong></li>
              <li><strong>Reverse-engineer or attempt to derive source code</strong> of proprietary components, except to the extent applicable law expressly forbids such a restriction.</li>
            </ol>
            <p>
              We may suspend or terminate access for violations. Where required by law, we
              will provide a reason; otherwise we may act without prior notice if we
              believe harm is imminent.
            </p>

            <h2 className="display-md">8. Intellectual property</h2>
            <p>
              <strong>Your content.</strong> You retain all rights in the content you submit
              through the service (prompts, posts, uploads, etc.). You grant Supercompute a{" "}
              <strong>limited, non-exclusive, royalty-free, worldwide license</strong> to host,
              store, reproduce, transmit, and display that content solely as necessary to
              operate the service for you. This license ends when you delete the content or
              terminate your use, except where retention is required for legal, security, or
              back-up reasons.
            </p>
            <p>
              <strong>Our content and brand.</strong> The service, the brand
              &ldquo;Supercompute,&rdquo; the SOLAR PUNK marks and visuals, the
              agent-inference model weights (where made available for use through the
              service), the underlying software, the design system, and all related
              intellectual property are owned by Supercompute or its licensors. You may not
              copy, redistribute, sell, or create derivative works of these except as
              expressly permitted (e.g., sharing publicly visible links, embedding widgets
              where we provide them).
            </p>
            <p>
              <strong>Feedback.</strong> If you send us feedback or suggestions, we may use
              them without obligation to you.
            </p>

            <h2 className="display-md">9. Disclaimers of warranties</h2>
            <p>
              THE SERVICE IS PROVIDED <strong>&ldquo;AS IS&rdquo;</strong> AND{" "}
              <strong>&ldquo;AS AVAILABLE&rdquo;</strong>, WITHOUT WARRANTIES OF ANY KIND,
              EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO:
            </p>
            <ul>
              <li>Warranties of merchantability, fitness for a particular purpose, and non-infringement.</li>
              <li>Warranties that the service will be uninterrupted, error-free, secure, or free of harmful components.</li>
              <li>Warranties regarding the accuracy, reliability, or completeness of any content, output, or recommendation surfaced through the service, including any output generated by an AI model.</li>
            </ul>
            <p>
              <strong>Web3-specific risks.</strong> Cryptocurrency, smart contracts, public
              blockchains, and token markets are inherently risky. Token prices, network
              availability, bridge security, regulatory treatment, and tax consequences can
              change rapidly. You acknowledge these risks and accept them as your own.
            </p>
            <p>
              <strong>No professional advice.</strong> Nothing on the service is financial,
              legal, investment, tax, medical, or other professional advice.
            </p>
            <p>
              Some jurisdictions do not allow the exclusion of certain warranties; in those
              cases the exclusions above apply to the maximum extent permitted.
            </p>

            <h2 className="display-md">10. Limitation of liability</h2>
            <p>TO THE MAXIMUM EXTENT PERMITTED BY LAW:</p>
            <ul>
              <li><strong>Cap.</strong> Supercompute&rsquo;s total cumulative liability arising out of or relating to the service, these Terms, or your use of the service shall not exceed the greater of (a) the amount you paid to Supercompute in the twelve (12) months immediately preceding the event giving rise to liability, or (b) one hundred US dollars (US$100).</li>
              <li><strong>Excluded damages.</strong> In no event shall Supercompute be liable for any indirect, incidental, special, consequential, punitive, or exemplary damages, including lost profits, lost revenue, lost data, business interruption, or the cost of substitute services, even if advised of the possibility of such damages.</li>
              <li><strong>On-chain loss.</strong> Supercompute is <strong>not</strong> liable for any loss arising from on-chain events outside our direct control, including (a) loss of wallet access, (b) loss of funds from your wallet due to compromised keys, (c) smart-contract exploits on third-party protocols you interact with via links on our site, (d) market volatility in any token, or (e) network congestion, forks, or chain reorgs.</li>
              <li><strong>Failure of essential purpose.</strong> The limitations in this Section 10 apply even if any limited remedy fails of its essential purpose.</li>
            </ul>
            <p>
              Some jurisdictions do not allow the limitation of certain damages; in those
              cases the limitations above apply to the maximum extent permitted.
            </p>

            <h2 className="display-md">11. Indemnification</h2>
            <p>
              You agree to defend, indemnify, and hold harmless Supercompute and its
              operators, contributors, and advisors from and against any third-party claim,
              demand, loss, liability, damage, or expense (including reasonable attorneys&rsquo;
              fees) arising out of or related to (a) your use of the service, (b) your
              violation of these Terms, (c) your violation of any applicable law, or (d) any
              content you submit through the service.
            </p>
            <p>
              We reserve the right to assume exclusive defense and control of any matter
              subject to indemnification by you, at your expense, and you agree to
              cooperate with our defense of those claims.
            </p>

            <h2 className="display-md">12. Governing law</h2>
            <p>
              These Terms are governed by the laws of the <strong>State of Delaware,
              United States of America</strong>, without regard to its conflict-of-laws
              principles. The United Nations Convention on Contracts for the International
              Sale of Goods does not apply.
            </p>
            <p>
              If Supercompute later incorporates in a different jurisdiction, we will
              update this section; until then, Delaware law applies.
            </p>

            <h2 className="display-md">13. Dispute resolution</h2>
            <p>We prefer to resolve disputes informally and quickly. The process is:</p>
            <ol>
              <li>
                <strong>Informal resolution first.</strong> Email{" "}
                <a href="mailto:contact@supercompute.io">contact@supercompute.io</a>{" "}
                <em>(proposed; confirm before public launch)</em> with a description of the
                dispute and how you&rsquo;d like it resolved. We will attempt to resolve it
                within 30 days of receipt.
              </li>
              <li>
                <strong>Arbitration or court.</strong> If we cannot resolve the dispute
                informally, either party may:
                <ul>
                  <li>
                    <strong>(Recommended) Binding arbitration.</strong> Submit the dispute
                    to binding individual arbitration administered by the American
                    Arbitration Association (AAA) under its Commercial Arbitration Rules.
                    The arbitration will be conducted by a single arbitrator in Delaware,
                    in English. The arbitrator may award injunctive relief only in favor of
                    the individual party seeking relief and only to the extent necessary to
                    provide relief warranted by that party&rsquo;s individual claim.
                  </li>
                  <li>
                    <strong>Or, court.</strong> File a claim in the state or federal courts
                    located in Delaware.
                  </li>
                </ul>
              </li>
            </ol>
            <p>
              <strong>Class-action waiver.</strong> Disputes must be brought in an
              individual capacity, not as a class action, consolidated action, or
              representative action. The arbitrator (or court) has no authority to combine
              claims of multiple parties.
            </p>
            <p>
              <strong>Small claims.</strong> Either party may bring an individual action in
              small claims court in Delaware for claims within that court&rsquo;s
              jurisdiction.
            </p>
            <p>
              <strong>Equitable relief.</strong> Notwithstanding the above, either party
              may seek injunctive or other equitable relief in any court of competent
              jurisdiction to protect its intellectual property or confidential
              information.
            </p>
            <div className="legal-flag">
              FLAG FOR LEGAL REVIEW (C2): The arbitration clause above is a recommendation
              and should be confirmed by counsel before public launch. The choice between
              arbitration and court has meaningful business-process consequences (filing
              fees, appeal rights, public record) and should not be defaulted unilaterally.
            </div>

            <h2 className="display-md">14. Changes to these Terms</h2>
            <p>We may update these Terms from time to time. When we do, we will:</p>
            <ol>
              <li>Update the &ldquo;Last updated&rdquo; and &ldquo;Effective date&rdquo; dates at the top of this page.</li>
              <li>For material changes, post a notice on the site (e.g., a banner or an in-app message) before the effective date.</li>
              <li>Maintain a public change-log entry describing what changed and why.</li>
            </ol>
            <p>
              Your continued use of the service after the effective date constitutes
              acceptance of the updated Terms. If you do not agree, you must stop using the
              service before the effective date.
            </p>

            <h2 className="display-md">15. Contact</h2>
            <p>Questions, complaints, or formal notices:</p>
            <ul>
              <li>
                <strong>General and legal:</strong>{" "}
                <a href="mailto:contact@supercompute.io">contact@supercompute.io</a>{" "}
                <em>(proposed; confirm with C2 before public launch)</em>
              </li>
              <li>
                <strong>Privacy / data-protection inquiries:</strong>{" "}
                <a href="mailto:privacy@supercompute.io">privacy@supercompute.io</a>{" "}
                <em>(proposed; mirror of the general inbox until volume warrants splitting)</em>
              </li>
            </ul>
            <p>We aim to acknowledge inquiries within 5 business days.</p>

            <p className="updated-line">
              <em>These Terms are plain-language working drafts for review by counsel (C2)
              before being incorporated into the live /terms page. Sections flagged for
              counsel confirmation are marked with &ldquo;Flag for legal review&rdquo; or
              &ldquo;(proposed; confirm&hellip;)&rdquo; inline.</em>
            </p>
          </div>
        </section>

        <Footer />
      </PublicLayout>
    </>
  )
}
