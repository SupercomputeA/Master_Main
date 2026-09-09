# SUPERCOMPUTE — Terms of Service

**Operator:** Supercompute
**Last updated:** 2026-08-06
**Effective date:** 2026-08-06
**On-chain treasury:** `0x1a828cd220559479e2f761805da4ee722683323B` (supercompute.eth)

These Terms of Service ("Terms") govern your use of the website at supercompute.io, the associated API endpoints, the agent-inference service, the marketplace, the school surface, and any related products operated by Supercompute ("Supercompute," "we," "us"). By connecting a wallet, signing in, or otherwise using the service, you agree to these Terms.

---

## 1. Operator identity

The service is operated by **Supercompute**. Until a formal corporate entity is on file, all references to "Supercompute" mean the unincorporated operator behind the supercompute.io domain and the on-chain treasury address above.

- **On-chain treasury handle:** `0x1a828cd220559479e2f761805da4ee722683323B` (supercompute.eth). All subscription revenue and marketplace settlements flow to this address.
- **Domain of record:** supercompute.io
- **Contact:** contact@supercompute.io *(proposed; confirm before public launch)*

We do not represent that a particular LLC, corporation, or other legal entity currently exists. If we later incorporate, we will update this section and re-publish the Terms.

---

## 2. Eligibility and wallet-first access

The service is intended for users who can form a binding contract under the laws of their jurisdiction. By using the service you represent that you meet this requirement.

**There is no email-and-password account system.** Authentication is wallet-first via **Sign-In With Ethereum (SIWE)**. To create an authenticated session you must:

1. Hold an Ethereum-compatible wallet (EOA or smart wallet) that you control.
2. Sign a SIWE message with that wallet; the signed nonce and message are verified server-side and a short-lived session cookie is issued.
3. The session cookie expires automatically; you may disconnect at any time by clearing site data or signing out.

We do not ask for, store, or have any ability to recover your private keys, seed phrases, or signing material. **If you lose access to your wallet, you lose access to your account.** Choose your custody model (hardware wallet, self-custody, custodial provider) accordingly.

Minors may use the school surface only with the supervision of a parent, legal guardian, or educator. See also Section 12 of our Privacy Policy for the children's-data posture.

---

## 3. Payments

**Accepted currency:** USDC on **Base** mainnet only. We do not accept ETH, other ERC-20s, fiat, or off-chain payment for service fees.

**Payment mechanism:** EIP-3009 `transferWithAuthorization`. You sign an authorization in your wallet; the on-chain transfer settles from your wallet to our treasury address. You authorize each subscription window manually; we do not pull funds on a recurring basis without a fresh signature.

**Network fees:** You are responsible for any gas (network) fees the Base network charges to settle your payment.

**Non-custodial architecture:** Supercompute **never** holds your private keys, seed phrases, signing material, or funds in custody at any point in the flow. All signing happens in your wallet. We never have the ability to move funds on your behalf. You can verify every transaction on-chain before signing.

**Refunds:** Payments are non-refundable except as required by applicable law. Because payments settle on-chain and are not held in our custody, chargebacks are not available; if you believe a charge is in error, contact us at the address below and we will investigate.

**Pricing and tier changes:** Prices and tier benefits may change. Active subscription windows remain honored at the price paid; subsequent renewals use the price displayed at sign-time.

---

## 4. Token-gated features

Several features are gated by wallet holdings rather than by account state:

- **SOLAR PUNK NFT** — holders receive access to certain products, channels, or events.
- **School access** — gated by holding a qualifying NFT or ticket; eligibility checked by reading on-chain holdings server-side at request time.
- **Marketplace and merch** — access to specific drops, discounts, or pre-orders gated by wallet holdings.
- **Consulting tiers** — call availability, depth of engagement, and channel access gated by holding a qualifying NFT or subscription tier.

Gating is enforced by reading on-chain data; if you transfer a qualifying token out of your wallet, your access ends. We do not maintain a parallel off-chain "entitlement" database that outlives your holdings.

We do not warrant the availability of any specific token-gated feature for any specific duration. Tokens may lose, gain, or change gating status at our discretion.

---

## 5. Marketplace and merch

The marketplace may list physical or digital goods from Supercompute or third-party sellers. The following disclaimers apply:

- **Third-party goods:** Goods shipped or fulfilled by third parties are sold subject to that party's own policies. Supercompute passes through manufacturer warranties where applicable but disclaims all other warranties on third-party goods.
- **Fulfillment:** Shipping times, customs, and import duties (where applicable) are the responsibility of the seller or shipping carrier. Supercompute is not liable for carrier delays or lost-in-transit items after tracking confirms handoff.
- **Pricing and availability:** Prices and inventory shown on the site may change without notice. We may refuse or cancel orders that appear to be errors (e.g., pricing bugs).
- **Returns:** Returns are governed by the listing's return policy, which is displayed at checkout. Custom, limited-edition, or digital goods are generally non-returnable.
- **No resale for speculation:** You agree not to use the marketplace to scalp, flip-for-resale, or otherwise extract speculative margin in a way that degrades the experience for other users.

---

## 6. Consulting

Where consulting or advisory services are offered (e.g., via embedded Calendly booking):

- **Scope of engagement:** Each engagement is governed by a separate scope-of-work document executed before work begins. Nothing on this site constitutes a consulting engagement, an advisory relationship, or an offer to provide one.
- **No fiduciary duty:** Supercompute and its operators do not owe you any fiduciary, fiduciary-like, or special duty. The relationship is at-will and commercial.
- **No investment, legal, or tax advice:** We do not provide investment, legal, tax, or accounting advice. Any information shared during a consulting engagement is educational or operational in nature; you are responsible for your own decisions and for consulting your own licensed advisors.
- **Confidentiality:** Where a mutual NDA is in place, the parties' confidentiality obligations are governed by that NDA, not by these Terms.

---

## 7. Acceptable use

You agree not to use the service to:

1. **Violate any applicable law** — including anti-money-laundering, sanctions, securities, tax, consumer-protection, and export-control laws.
2. **Abuse the infrastructure** — including denial-of-service, scraping beyond published rate limits, resource exhaustion, or attempts to bypass rate-limiting or quota enforcement.
3. **Circumvent token-gating** — including by falsifying wallet holdings, Sybil-attacking eligibility checks, or attempting to spoof on-chain state.
4. **Scrape for resale or training** — including scraping the site, the API, or the agent-inference output to build a competing product, train a competing model, or resell access.
5. **Submit content you do not have the right to submit** — including infringing, defamatory, harassing, or unlawful content.
6. **Impersonate** — including impersonating Supercompute, another user, or any third party.
7. **Attempt to drain or interfere with the treasury or related smart contracts.**
8. **Reverse-engineer or attempt to derive source code** of proprietary components, except to the extent applicable law expressly forbids such a restriction.

We may suspend or terminate access for violations. Where required by law, we will provide a reason; otherwise we may act without prior notice if we believe harm is imminent.

---

## 8. Intellectual property

**Your content.** You retain all rights in the content you submit through the service (prompts, posts, uploads, etc.). You grant Supercompute a **limited, non-exclusive, royalty-free, worldwide license** to host, store, reproduce, transmit, and display that content solely as necessary to operate the service for you. This license ends when you delete the content or terminate your use, except where retention is required for legal, security, or back-up reasons.

**Our content and brand.** The service, the brand "Supercompute," the SOLAR PUNK marks and visuals, the agent-inference model weights (where made available for use through the service), the underlying software, the design system, and all related intellectual property are owned by Supercompute or its licensors. You may not copy, redistribute, sell, or create derivative works of these except as expressly permitted (e.g., sharing publicly visible links, embedding widgets where we provide them).

**Feedback.** If you send us feedback or suggestions, we may use them without obligation to you.

---

## 9. Disclaimers of warranties

THE SERVICE IS PROVIDED **"AS IS"** AND **"AS AVAILABLE"**, WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO:

- Warranties of merchantability, fitness for a particular purpose, and non-infringement.
- Warranties that the service will be uninterrupted, error-free, secure, or free of harmful components.
- Warranties regarding the accuracy, reliability, or completeness of any content, output, or recommendation surfaced through the service, including any output generated by an AI model.

**Web3-specific risks.** Cryptocurrency, smart contracts, public blockchains, and token markets are inherently risky. Token prices, network availability, bridge security, regulatory treatment, and tax consequences can change rapidly. You acknowledge these risks and accept them as your own.

**No professional advice.** Nothing on the service is financial, legal, investment, tax, medical, or other professional advice.

Some jurisdictions do not allow the exclusion of certain warranties; in those cases the exclusions above apply to the maximum extent permitted.

---

## 10. Limitation of liability

TO THE MAXIMUM EXTENT PERMITTED BY LAW:

- **Cap.** Supercompute's total cumulative liability arising out of or relating to the service, these Terms, or your use of the service shall not exceed the greater of (a) the amount you paid to Supercompute in the twelve (12) months immediately preceding the event giving rise to liability, or (b) one hundred US dollars (US$100).
- **Excluded damages.** In no event shall Supercompute be liable for any indirect, incidental, special, consequential, punitive, or exemplary damages, including lost profits, lost revenue, lost data, business interruption, or the cost of substitute services, even if advised of the possibility of such damages.
- **On-chain loss.** Supercompute is **not** liable for any loss arising from on-chain events outside our direct control, including (a) loss of wallet access, (b) loss of funds from your wallet due to compromised keys, (c) smart-contract exploits on third-party protocols you interact with via links on our site, (d) market volatility in any token, or (e) network congestion, forks, or chain reorgs.
- **Failure of essential purpose.** The limitations in this Section 10 apply even if any limited remedy fails of its essential purpose.

Some jurisdictions do not allow the limitation of certain damages; in those cases the limitations above apply to the maximum extent permitted.

---

## 11. Indemnification

You agree to defend, indemnify, and hold harmless Supercompute and its operators, contributors, and advisors from and against any third-party claim, demand, loss, liability, damage, or expense (including reasonable attorneys' fees) arising out of or related to (a) your use of the service, (b) your violation of these Terms, (c) your violation of any applicable law, or (d) any content you submit through the service.

We reserve the right to assume exclusive defense and control of any matter subject to indemnification by you, at your expense, and you agree to cooperate with our defense of those claims.

---

## 12. Governing law

These Terms are governed by the laws of the **State of Delaware, United States of America**, without regard to its conflict-of-laws principles. The United Nations Convention on Contracts for the International Sale of Goods does not apply.

If Supercompute later incorporates in a different jurisdiction, we will update this section; until then, Delaware law applies.

---

## 13. Dispute resolution

We prefer to resolve disputes informally and quickly. The process is:

1. **Informal resolution first.** Email contact@supercompute.io *(proposed; confirm before public launch)* with a description of the dispute and how you'd like it resolved. We will attempt to resolve it within 30 days of receipt.
2. **Arbitration or court.** If we cannot resolve the dispute informally, either party may:
   - **(Recommended) Binding arbitration.** Submit the dispute to binding individual arbitration administered by the American Arbitration Association (AAA) under its Commercial Arbitration Rules. The arbitration will be conducted by a single arbitrator in Delaware, in English. The arbitrator may award injunctive relief only in favor of the individual party seeking relief and only to the extent necessary to provide relief warranted by that party's individual claim.
   - **Or, court.** File a claim in the state or federal courts located in Delaware.

**Class-action waiver.** Disputes must be brought in an individual capacity, not as a class action, consolidated action, or representative action. The arbitrator (or court) has no authority to combine claims of multiple parties.

**Small claims.** Either party may bring an individual action in small claims court in Delaware for claims within that court's jurisdiction.

**Equitable relief.** Notwithstanding the above, either party may seek injunctive or other equitable relief in any court of competent jurisdiction to protect its intellectual property or confidential information.

**Flag for legal review:** The arbitration clause above is a recommendation and should be confirmed by counsel (C2) before public launch. The choice between arbitration and court has meaningful business-process consequences (filing fees, appeal rights, public record) and should not be defaulted unilaterally.

---

## 14. Changes to these Terms

We may update these Terms from time to time. When we do, we will:

1. Update the "Last updated" and "Effective date" dates at the top of this page.
2. For material changes, post a notice on the site (e.g., a banner or an in-app message) before the effective date.
3. Maintain a public change-log entry describing what changed and why.

Your continued use of the service after the effective date constitutes acceptance of the updated Terms. If you do not agree, you must stop using the service before the effective date.

---

## 15. Contact

Questions, complaints, or formal notices:

- **General and legal:** contact@supercompute.io *(proposed; confirm with C2 before public launch)*
- **Privacy / data-protection inquiries:** privacy@supercompute.io *(proposed; mirror of the general inbox until volume warrants splitting)*

We aim to acknowledge inquiries within 5 business days.

---

*These Terms are plain-language working drafts for review by counsel (C2) before being incorporated into the live /terms page. Sections flagged for counsel confirmation are marked with "Flag for legal review" or "(proposed; confirm…)" inline.*
