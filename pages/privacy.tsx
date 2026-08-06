import Head from "next/head"
import PublicLayout from "../components/PublicLayout"
import Footer from "../components/Footer"

/* /privacy — Privacy Policy.
   Source: docs/legal/privacy.md (drafted by legal-copy task, pending C2 review).
   Last updated: 2026-08-06 — bump LAST_UPDATED below when this file changes. */
const LAST_UPDATED = "2026-08-06"
const EFFECTIVE_DATE = "2026-08-06"
const POLICY_VERSION = "v1.0"
const TREASURY = "0x1a828cd220559479e2f761805da4ee722683323B"

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
            Operated by <strong>Supercompute</strong>.{" "}
            <span className="updated-line">v{POLICY_VERSION} · Last updated {LAST_UPDATED} · Effective {EFFECTIVE_DATE}</span>
          </p>
        </section>

        <section className="section">
          <div className="legal-stub">
            <p>
              This Privacy Policy explains what data Supercompute (&ldquo;Supercompute,&rdquo;
              {" "}&ldquo;we,&rdquo; &ldquo;us&rdquo;) collects, why we collect it, what we do
              with it, and what choices you have. The short version: we collect the minimum
              needed to run a non-custodial, wallet-first service, we don&rsquo;t sell your
              data, and we don&rsquo;t track you across the web.
            </p>

            <h2 className="display-md">1. Operator identity</h2>
            <p>
              The service is operated by <strong>Supercompute</strong>. Until a formal
              corporate entity is on file, all references to &ldquo;Supercompute&rdquo; mean
              the unincorporated operator behind the supercompute.io domain and the on-chain
              treasury address below.
            </p>
            <ul>
              <li><strong>Domain of record:</strong> supercompute.io</li>
              <li>
                <strong>On-chain treasury handle:</strong> <code>{TREASURY}</code>{" "}
                (supercompute.eth)
              </li>
              <li>
                <strong>Privacy contact:</strong>{" "}
                <a href="mailto:privacy@supercompute.io">privacy@supercompute.io</a>{" "}
                <em>(proposed; confirm before public launch)</em>
              </li>
            </ul>

            <h2 className="display-md">2. Data we collect</h2>
            <p>We collect only what is necessary to operate the service.</p>
            <table>
              <thead>
                <tr>
                  <th>Category</th>
                  <th>What</th>
                  <th>When</th>
                  <th>Where stored</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Wallet address</td>
                  <td>Public Ethereum address (0x&hellip;)</td>
                  <td>When you sign in via SIWE or submit the /subscribe form</td>
                  <td>D1 (Cloudflare)</td>
                </tr>
                <tr>
                  <td>Email address (optional)</td>
                  <td>Email string</td>
                  <td>Only when you voluntarily submit it via the /subscribe lead-capture form</td>
                  <td>D1 (Cloudflare)</td>
                </tr>
                <tr>
                  <td>IP address and request metadata</td>
                  <td>Source IP, user-agent, request path, response status, byte count</td>
                  <td>Every HTTP request, by default of the Cloudflare Workers runtime</td>
                  <td>Cloudflare logs, retained ~30 days</td>
                </tr>
                <tr>
                  <td>On-chain transaction data</td>
                  <td>Tx hashes, log events, block numbers tied to your wallet</td>
                  <td>When you interact with our smart contracts (subscriptions, marketplace)</td>
                  <td>On-chain (public) and our off-chain payment-receipt index</td>
                </tr>
                <tr>
                  <td>SIWE session data</td>
                  <td>Signed nonce, issued-at, expiration</td>
                  <td>During sign-in; ephemeral</td>
                  <td>D1 (short-lived session cookie + nonce record)</td>
                </tr>
              </tbody>
            </table>
            <p>
              We do <strong>not</strong> collect names, phone numbers, postal addresses,
              government IDs, financial-account details (beyond what blockchain transactions
              publicly show), biometric data, or any special-category data.
            </p>

            <h2 className="display-md">3. Data we do NOT collect</h2>
            <p>State this explicitly because it matters for a wallet-first product:</p>
            <ul>
              <li><strong>No names.</strong> We never ask for your legal name. Any &ldquo;display name&rdquo; is chosen by you and stored as you entered it (or omitted entirely).</li>
              <li><strong>No phone numbers.</strong> Not collected; not requested.</li>
              <li><strong>No postal addresses.</strong> Not collected. (Shipping addresses for marketplace orders, where required, are collected at checkout by the fulfillment partner — see Section 5.)</li>
              <li><strong>No KYC data.</strong> No government ID, no SSN, no passport, no driver&rsquo;s license, no selfie, no proof of address.</li>
              <li><strong>No biometric data.</strong> Not collected; not processed.</li>
              <li><strong>No payment-card data.</strong> We do not accept card payments; USDC on Base is the only payment rail. Card networks and PCI-DSS are not in scope.</li>
              <li><strong>No cross-site browsing data.</strong> We do not place tracking that follows you off supercompute.io.</li>
            </ul>

            <h2 className="display-md">4. Cookies and trackers</h2>
            <p>We use a minimal set of cookies and trackers, all first-party or privacy-respecting:</p>
            <ul>
              <li><strong>Cloudflare Analytics</strong> — aggregate, privacy-preserving request analytics built into the Cloudflare Workers runtime. No per-user profile is built; no cross-site tracking.</li>
              <li><strong>PostHog</strong> — anonymized product analytics. We do not enable PostHog&rsquo;s cross-site tracking features; we do not enable session recording on pages that include wallet addresses or input fields. PostHog is loaded only after consent where required by your jurisdiction, and we honor <strong>Do-Not-Track</strong> signals.</li>
              <li><strong>No Google Analytics.</strong> Not used; not loaded.</li>
              <li><strong>No Facebook Pixel.</strong> Not used; not loaded.</li>
              <li><strong>No ad networks.</strong> Not used; not loaded.</li>
              <li><strong>No third-party advertising cookies.</strong> Not used; not loaded.</li>
            </ul>
            <p>
              Functional cookies we do set: a short-lived SIWE session cookie, and a
              cookie-consent preference cookie if your jurisdiction requires one. Both are
              first-party and serve the service directly.
            </p>

            <h2 className="display-md">5. How we use data</h2>
            <p>We use the data we collect for a small, well-defined set of purposes:</p>
            <ol>
              <li><strong>Authentication and session management.</strong> Wallet address + signed nonce → short-lived session. SIWE nonces are single-use and expire.</li>
              <li><strong>Subscription delivery.</strong> Wallet address + on-chain payment → tier entitlement. Subscription email (if provided) → tier-launch and product-update notifications.</li>
              <li><strong>Fraud and abuse prevention.</strong> IP address and request metadata → rate-limiting, bot detection, treasury-protection.</li>
              <li><strong>Aggregated analytics.</strong> Anonymized usage data (PostHog, Cloudflare) → understanding which features are used, where to invest engineering effort.</li>
              <li><strong>Legal and compliance.</strong> Retain logs as required to respond to lawful requests, defend claims, and meet tax/audit obligations.</li>
            </ol>
            <p>
              <strong>We do not sell your data.</strong> We do not rent, lease, or license
              your data to third parties for their own purposes.
            </p>
            <p><strong>We do not share data except:</strong></p>
            <ul>
              <li><strong>(a) Service providers.</strong> Cloudflare (hosting, edge, security) and PostHog (analytics) act as processors under confidentiality obligations. Their use is limited to providing services to us. They may not use your data for their own purposes.</li>
              <li><strong>(b) Legal compulsion.</strong> When we believe in good faith that disclosure is necessary to comply with a law, subpoena, court order, or other valid legal process; to enforce these Terms; or to protect the rights, property, or safety of Supercompute, our users, or others.</li>
              <li><strong>(c) Corporate transactions.</strong> If Supercompute is acquired, merged, or sells substantially all assets, your data may be transferred as part of that transaction, subject to the same protections in this Policy.</li>
            </ul>
            <p>
              We do not provide wallet addresses, email addresses, or any user data to data
              brokers. Ever.
            </p>

            <h2 className="display-md">6. On-chain transparency</h2>
            <p>
              Public blockchains are public by design. <strong>Transactions you send to the
              Supercompute treasury are visible on-chain</strong>, and the link between
              your wallet address and the action is part of the public record regardless
              of any policy we write here.
            </p>
            <p>This means:</p>
            <ul>
              <li>Anyone can see that wallet <code>0xAbc&hellip;</code> paid USDC to <code>{TREASURY}</code> on a given date.</li>
              <li>Anyone can see which wallet owns which NFT.</li>
              <li>We cannot &ldquo;delete&rdquo; an on-chain transaction. We can only delete the off-chain data tied to it.</li>
            </ul>
            <p>
              If you want to reduce this linkability, use a fresh wallet for the service.
              That is your choice and your responsibility; we do not mix or pool user
              wallets.
            </p>

            <h2 className="display-md">7. Data retention</h2>
            <table>
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Retention</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Cloudflare request logs (IP, user-agent, path, status, byte count)</td>
                  <td>~30 days, then deleted or fully aggregated</td>
                </tr>
                <tr>
                  <td>Subscription email (if provided)</td>
                  <td>Until you unsubscribe or request deletion</td>
                </tr>
                <tr>
                  <td>SIWE nonce / session record</td>
                  <td>Session expiry (ephemeral)</td>
                </tr>
                <tr>
                  <td>On-chain payment receipts</td>
                  <td>Indefinite (the chain is the receipt)</td>
                </tr>
                <tr>
                  <td>PostHog analytics events</td>
                  <td>Per PostHog&rsquo;s default retention; we configure a 90-day maximum</td>
                </tr>
              </tbody>
            </table>
            <p>
              After the retention period above, data is either deleted or fully aggregated
              such that no individual can be re-identified. We do not retain data
              &ldquo;just in case.&rdquo;
            </p>

            <h2 className="display-md">8. Your rights</h2>
            <p>You have the following rights, subject to applicable law and the limitations below:</p>
            <ul>
              <li><strong>Right to know.</strong> What we collect, why, and who we share with — that is this Policy.</li>
              <li><strong>Right to access.</strong> Request a copy of the off-chain personal data we hold about you (e.g., the email address you submitted).</li>
              <li><strong>Right to correct.</strong> Correct inaccurate data we hold about you.</li>
              <li><strong>Right to delete.</strong> Delete the off-chain data we hold about you. We will honor deletion within 30 days except where retention is required for legal, security, or audit reasons.</li>
              <li><strong>Right to opt out of &ldquo;sale.&rdquo;</strong> We do not sell data, so this right is moot — but it is preserved here for clarity.</li>
            </ul>
            <p><strong>Limitations tied to wallet-first design:</strong></p>
            <ul>
              <li>We cannot delete your wallet-derived on-chain history; it is public and outside our control.</li>
              <li>We can delete the off-chain email subscription record, but your wallet&rsquo;s history of payments remains on-chain.</li>
              <li>Pseudonymous &ldquo;deletion&rdquo; of a wallet-derived record is impossible without deleting the wallet itself.</li>
            </ul>
            <p>
              <strong>For EU/UK users (GDPR).</strong> The legal bases for processing are:
              (a) performance of a contract (auth, subscriptions); (b) legitimate interests
              (security, fraud prevention, aggregated analytics); (c) consent (PostHog
              analytics and the optional email subscription). You have the right to lodge a
              complaint with your supervisory authority.
            </p>
            <p>
              <strong>For California users (CCPA / CPRA).</strong> You have the right to
              know, delete, correct, and limit use of sensitive personal information. We do
              not collect &ldquo;sensitive personal information&rdquo; as defined by the CPRA
              (no SSN, no precise geolocation, no racial/ethnic data, no health data, etc.).
              We do not sell or share personal information for cross-context behavioral
              advertising.
            </p>
            <p>
              <strong>To exercise any of these rights</strong>, email{" "}
              <a href="mailto:privacy@supercompute.io">privacy@supercompute.io</a>{" "}
              <em>(proposed; confirm with C2 before public launch)</em> with the wallet
              address you signed in with and a description of the request.
            </p>

            <h2 className="display-md">9. Children&rsquo;s policy</h2>
            <p>
              The school surface may be used by minors in the course of educational
              activity, under the supervision of a parent, legal guardian, or educator.
            </p>
            <p>
              We do not knowingly collect personal data from children under 13 (the COPPA
              threshold in the United States). The /subscribe lead-capture form is not
              directed at children; the SIWE flow requires a self-custodied wallet, which
              is not a product directed at minors.
            </p>
            <p>
              If we learn that we have collected personal data from a child under 13 in
              violation of this Policy, we will delete it as soon as possible. If you
              believe a child under 13 has submitted data to us, contact{" "}
              <a href="mailto:privacy@supercompute.io">privacy@supercompute.io</a> and we
              will investigate and delete.
            </p>

            <h2 className="display-md">10. International data transfers</h2>
            <p>
              Supercompute is operated from the United States. If you use the service from
              outside the United States, your data will be transferred to and processed in
              the United States and at the edge of the Cloudflare global network.
            </p>
            <p>
              Where required (e.g., for EU/UK users), we rely on the European
              Commission&rsquo;s Standard Contractual Clauses (SCCs) as the legal basis for
              cross-border transfer, and on Cloudflare&rsquo;s and PostHog&rsquo;s
              data-processing addenda as processor safeguards. Cloudflare and PostHog both
              maintain their own GDPR / DPA documentation; you may request copies via the
              contact below.
            </p>

            <h2 className="display-md">11. Security</h2>
            <p>We take reasonable measures to protect the data we hold:</p>
            <ul>
              <li>All traffic to and from the service is encrypted in transit (TLS, via Cloudflare).</li>
              <li>The D1 database and the Workers runtime are isolated per request.</li>
              <li>We do not log wallet signatures or private keys; signing happens client-side, in your wallet.</li>
              <li>Access to off-chain data is restricted to operators who need it.</li>
            </ul>
            <p>
              <strong>No method of transmission or storage is 100% secure.</strong> We
              cannot guarantee absolute security. If we learn of a breach affecting your
              personal data, we will notify you where required by law.
            </p>
            <p>
              If you discover a vulnerability, please disclose it responsibly to{" "}
              <a href="mailto:security@supercompute.io">security@supercompute.io</a>{" "}
              <em>(proposed; confirm with C2)</em>.
            </p>

            <h2 className="display-md">12. Changes to this Policy</h2>
            <p>We may update this Privacy Policy from time to time. When we do, we will:</p>
            <ol>
              <li>Update the &ldquo;Last updated&rdquo; and &ldquo;Effective date&rdquo; dates at the top of this page.</li>
              <li>For material changes (a new category of data collected, a new third party receiving data, a new purpose), post a notice on the site and, if you have provided an email, notify you by email before the effective date.</li>
              <li>Maintain a public change-log entry describing what changed and why.</li>
            </ol>
            <p>
              Your continued use of the service after the effective date constitutes
              acceptance of the updated Policy. If you do not agree, you may stop using
              the service; existing data will be handled under the Policy in effect at the
              time of collection, except where retroactive application is required by law.
            </p>

            <h2 className="display-md">13. Contact</h2>
            <p>Privacy and data-protection inquiries:</p>
            <ul>
              <li>
                <strong>Privacy:</strong>{" "}
                <a href="mailto:privacy@supercompute.io">privacy@supercompute.io</a>{" "}
                <em>(proposed; confirm with C2 before public launch)</em>
              </li>
              <li>
                <strong>General:</strong>{" "}
                <a href="mailto:contact@supercompute.io">contact@supercompute.io</a>{" "}
                <em>(proposed; mirror of the privacy inbox until volume warrants splitting)</em>
              </li>
            </ul>
            <p>We aim to acknowledge inquiries within 5 business days.</p>

            <p className="updated-line">
              <em>This Privacy Policy is a plain-language working draft for review by
              counsel (C2) before being incorporated into the live /privacy page. Items
              flagged for counsel confirmation are marked with &ldquo;Flag for legal
              review&rdquo; or &ldquo;(proposed; confirm&hellip;)&rdquo; inline.</em>
            </p>
          </div>
        </section>

        <Footer />
      </PublicLayout>
    </>
  )
}
