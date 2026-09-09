# SUPERCOMPUTE — Privacy Policy

**Operator:** Supercompute
**Last updated:** 2026-08-06
**Effective date:** 2026-08-06
**On-chain treasury:** `0x1a828cd220559479e2f761805da4ee722683323B` (supercompute.eth)

This Privacy Policy explains what data Supercompute ("Supercompute," "we," "us") collects, why we collect it, what we do with it, and what choices you have. The short version: we collect the minimum needed to run a non-custodial, wallet-first service, we don't sell your data, and we don't track you across the web.

---

## 1. Operator identity

The service is operated by **Supercompute**. Until a formal corporate entity is on file, all references to "Supercompute" mean the unincorporated operator behind the supercompute.io domain and the on-chain treasury address above.

- **Domain of record:** supercompute.io
- **On-chain treasury handle:** `0x1a828cd220559479e2f761805da4ee722683323B` (supercompute.eth)
- **Privacy contact:** privacy@supercompute.io *(proposed; confirm before public launch)*

---

## 2. Data we collect

We collect only what is necessary to operate the service.

| Category | What | When | Where stored |
|---|---|---|---|
| Wallet address | Public Ethereum address (0x…) | When you sign in via SIWE or submit the /subscribe form | D1 (Cloudflare) |
| Email address (optional) | Email string | Only when you voluntarily submit it via the /subscribe lead-capture form | D1 (Cloudflare) |
| IP address and request metadata | Source IP, user-agent, request path, response status, byte count | Every HTTP request, by default of the Cloudflare Workers runtime | Cloudflare logs, retained ~30 days |
| On-chain transaction data | Tx hashes, log events, block numbers tied to your wallet | When you interact with our smart contracts (subscriptions, marketplace) | On-chain (public) and our off-chain payment-receipt index |
| SIWE session data | Signed nonce, issued-at, expiration | During sign-in; ephemeral | D1 (short-lived session cookie + nonce record) |

We do **not** collect names, phone numbers, postal addresses, government IDs, financial-account details (beyond what blockchain transactions publicly show), biometric data, or any special-category data.

---

## 3. Data we do NOT collect

State this explicitly because it matters for a wallet-first product:

- **No names.** We never ask for your legal name. Any "display name" is chosen by you and stored as you entered it (or omitted entirely).
- **No phone numbers.** Not collected; not requested.
- **No postal addresses.** Not collected. (Shipping addresses for marketplace orders, where required, are collected at checkout by the fulfillment partner — see Section 5.)
- **No KYC data.** No government ID, no SSN, no passport, no driver's license, no selfie, no proof of address.
- **No biometric data.** Not collected; not processed.
- **No payment-card data.** We do not accept card payments; USDC on Base is the only payment rail. Card networks and PCI-DSS are not in scope.
- **No cross-site browsing data.** We do not place tracking that follows you off supercompute.io.

---

## 4. Cookies and trackers

We use a minimal set of cookies and trackers, all first-party or privacy-respecting:

- **Cloudflare Analytics** — aggregate, privacy-preserving request analytics built into the Cloudflare Workers runtime. No per-user profile is built; no cross-site tracking.
- **PostHog** — anonymized product analytics. We do not enable PostHog's cross-site tracking features; we do not enable session recording on pages that include wallet addresses or input fields. PostHog is loaded only after consent where required by your jurisdiction, and we honor **Do-Not-Track** signals.
- **No Google Analytics.** Not used; not loaded.
- **No Facebook Pixel.** Not used; not loaded.
- **No ad networks.** Not used; not loaded.
- **No third-party advertising cookies.** Not used; not loaded.

Functional cookies we do set: a short-lived SIWE session cookie, and a cookie-consent preference cookie if your jurisdiction requires one. Both are first-party and serve the service directly.

---

## 5. How we use data

We use the data we collect for a small, well-defined set of purposes:

1. **Authentication and session management.** Wallet address + signed nonce → short-lived session. SIWE nonces are single-use and expire.
2. **Subscription delivery.** Wallet address + on-chain payment → tier entitlement. Subscription email (if provided) → tier-launch and product-update notifications.
3. **Fraud and abuse prevention.** IP address and request metadata → rate-limiting, bot detection, treasury-protection.
4. **Aggregated analytics.** Anonymized usage data (PostHog, Cloudflare) → understanding which features are used, where to invest engineering effort.
5. **Legal and compliance.** Retain logs as required to respond to lawful requests, defend claims, and meet tax/audit obligations.

**We do not sell your data.** We do not rent, lease, or license your data to third parties for their own purposes.

**We do not share data except:**

- **(a) Service providers.** Cloudflare (hosting, edge, security) and PostHog (analytics) act as processors under confidentiality obligations. Their use is limited to providing services to us. They may not use your data for their own purposes.
- **(b) Legal compulsion.** When we believe in good faith that disclosure is necessary to comply with a law, subpoena, court order, or other valid legal process; to enforce these Terms; or to protect the rights, property, or safety of Supercompute, our users, or others.
- **(c) Corporate transactions.** If Supercompute is acquired, merged, or sells substantially all assets, your data may be transferred as part of that transaction, subject to the same protections in this Policy.

We do not provide wallet addresses, email addresses, or any user data to data brokers. Ever.

---

## 6. On-chain transparency

Public blockchains are public by design. **Transactions you send to the Supercompute treasury are visible on-chain**, and the link between your wallet address and the action is part of the public record regardless of any policy we write here.

This means:

- Anyone can see that wallet `0xAbc…` paid USDC to `0x1a828cd220559479e2f761805da4ee722683323B` on a given date.
- Anyone can see which wallet owns which NFT.
- We cannot "delete" an on-chain transaction. We can only delete the off-chain data tied to it.

If you want to reduce this linkability, use a fresh wallet for the service. That is your choice and your responsibility; we do not mix or pool user wallets.

---

## 7. Data retention

| Data | Retention |
|---|---|
| Cloudflare request logs (IP, user-agent, path, status, byte count) | ~30 days, then deleted or fully aggregated |
| Subscription email (if provided) | Until you unsubscribe or request deletion |
| SIWE nonce / session record | Session expiry (ephemeral) |
| On-chain payment receipts | Indefinite (the chain is the receipt) |
| PostHog analytics events | Per PostHog's default retention; we configure a 90-day maximum |

After the retention period above, data is either deleted or fully aggregated such that no individual can be re-identified. We do not retain data "just in case."

---

## 8. Your rights

You have the following rights, subject to applicable law and the limitations below:

- **Right to know.** What we collect, why, and who we share with — that is this Policy.
- **Right to access.** Request a copy of the off-chain personal data we hold about you (e.g., the email address you submitted).
- **Right to correct.** Correct inaccurate data we hold about you.
- **Right to delete.** Delete the off-chain data we hold about you. We will honor deletion within 30 days except where retention is required for legal, security, or audit reasons.
- **Right to opt out of "sale."** We do not sell data, so this right is moot — but it is preserved here for clarity.

**Limitations tied to wallet-first design:**

- We cannot delete your wallet-derived on-chain history; it is public and outside our control.
- We can delete the off-chain email subscription record, but your wallet's history of payments remains on-chain.
- Pseudonymous "deletion" of a wallet-derived record is impossible without deleting the wallet itself.

**For EU/UK users (GDPR).** The legal bases for processing are: (a) performance of a contract (auth, subscriptions); (b) legitimate interests (security, fraud prevention, aggregated analytics); (c) consent (PostHog analytics and the optional email subscription). You have the right to lodge a complaint with your supervisory authority.

**For California users (CCPA / CPRA).** You have the right to know, delete, correct, and limit use of sensitive personal information. We do not collect "sensitive personal information" as defined by the CPRA (no SSN, no precise geolocation, no racial/ethnic data, no health data, etc.). We do not sell or share personal information for cross-context behavioral advertising.

**To exercise any of these rights**, email privacy@supercompute.io *(proposed; confirm with C2 before public launch)* with the wallet address you signed in with and a description of the request.

---

## 9. Children's policy

The school surface may be used by minors in the course of educational activity, under the supervision of a parent, legal guardian, or educator.

We do not knowingly collect personal data from children under 13 (the COPPA threshold in the United States). The /subscribe lead-capture form is not directed at children; the SIWE flow requires a self-custodied wallet, which is not a product directed at minors.

If we learn that we have collected personal data from a child under 13 in violation of this Policy, we will delete it as soon as possible. If you believe a child under 13 has submitted data to us, contact privacy@supercompute.io and we will investigate and delete.

---

## 10. International data transfers

Supercompute is operated from the United States. If you use the service from outside the United States, your data will be transferred to and processed in the United States and at the edge of the Cloudflare global network.

Where required (e.g., for EU/UK users), we rely on the European Commission's Standard Contractual Clauses (SCCs) as the legal basis for cross-border transfer, and on Cloudflare's and PostHog's data-processing addenda as processor safeguards. Cloudflare and PostHog both maintain their own GDPR / DPA documentation; you may request copies via the contact below.

---

## 11. Security

We take reasonable measures to protect the data we hold:

- All traffic to and from the service is encrypted in transit (TLS, via Cloudflare).
- The D1 database and the Workers runtime are isolated per request.
- We do not log wallet signatures or private keys; signing happens client-side, in your wallet.
- Access to off-chain data is restricted to operators who need it.

**No method of transmission or storage is 100% secure.** We cannot guarantee absolute security. If we learn of a breach affecting your personal data, we will notify you where required by law.

If you discover a vulnerability, please disclose it responsibly to security@supercompute.io *(proposed; confirm with C2)*.

---

## 12. Changes to this Policy

We may update this Privacy Policy from time to time. When we do, we will:

1. Update the "Last updated" and "Effective date" dates at the top of this page.
2. For material changes (a new category of data collected, a new third party receiving data, a new purpose), post a notice on the site and, if you have provided an email, notify you by email before the effective date.
3. Maintain a public change-log entry describing what changed and why.

Your continued use of the service after the effective date constitutes acceptance of the updated Policy. If you do not agree, you may stop using the service; existing data will be handled under the Policy in effect at the time of collection, except where retroactive application is required by law.

---

## 13. Contact

Privacy and data-protection inquiries:

- **Privacy:** privacy@supercompute.io *(proposed; confirm with C2 before public launch)*
- **General:** contact@supercompute.io *(proposed; mirror of the privacy inbox until volume warrants splitting)*

We aim to acknowledge inquiries within 5 business days.

---

*This Privacy Policy is a plain-language working draft for review by counsel (C2) before being incorporated into the live /privacy page. Items flagged for counsel confirmation are marked with "Flag for legal review" or "(proposed; confirm…)" inline.*
