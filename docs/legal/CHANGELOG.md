# Legal Policy Changelog

Track every change to the published Terms of Service and Privacy Policy. When you
publish a new version, bump `POLICY_VERSION` and `LAST_UPDATED` in the corresponding
`.tsx` file under `pages/`, add an entry below, and re-deploy.

## v1.1 — 2026-08-06

Mission-driven framing pass. Adds a "Why we exist" (Terms) / "Why we collect so
little" (Privacy) section as Section 0 above the existing v1.0 structure.
Also bumps `POLICY_VERSION` from v1.0 → v1.1 in both `.tsx` files.

- `pages/terms.tsx` — Section 0: positions the product against "disaster
  capitalism and greed," affirms non-custodial core value ("your keys stay
  yours, your data stays yours"), and adds a pro-AI transparency clause
  ("AI is a tool for human empowerment — openly, not hidden"). TikTok
  Content Posting API requires the public Terms URL to be on file; this
  pass was driven by that compliance gap.
- `pages/privacy.tsx` — Section 0: same mission framing; binds data
  collection to it ("we collect the minimum required to run the service,
  keep it for the shortest time we need it, and never sell it") and
  re-states the pro-AI posture under the same minimal-data rule.

No legal substance changed in Sections 1–15 (Terms) or 1–13 (Privacy). All
inline `FLAG FOR LEGAL REVIEW` markers and `(proposed; confirm with C2)`
inbox choices remain and are still pending counsel sign-off.

## v1.0 — 2026-08-06

Initial publication.

- **Terms of Service (`pages/terms.tsx`)** — first public draft.
  - 15 sections, structural commitments: wallet-first SIWE auth, USDC on Base
    only (EIP-3009 `transferWithAuthorization`), non-custodial architecture,
    on-chain treasury `0x1a828cd220559479e2f761805da4ee722683323B` (supercompute.eth),
    Delaware governing law, AAA arbitration recommendation.
  - Operator identity kept as "Supercompute" (unincorporated) until a formal
    entity is on file.
  - Inline `FLAG FOR LEGAL REVIEW` block on the arbitration clause (Section 13).
  - Copy drafted from `docs/legal-drafts/terms.md` (legal-copy task
    `t_5cfef313`); front-end integration from the recovered template at
    `b62c3f1` (page-only: `pages/terms.tsx`).

- **Privacy Policy (`pages/privacy.tsx`)** — first public draft.
  - 13 sections, minimal-collection stance: wallet address, optional email,
    IP/request metadata, SIWE nonce, on-chain tx hashes. No name, phone, address,
    KYC, biometric, or payment-card data.
  - Third-party processors: Cloudflare and PostHog only. No Google Analytics,
    no Facebook Pixel, no ad networks.
  - GDPR / CCPA / COPPA posture explicit.
  - Inline `(proposed; confirm with C2)` markers on inbox choice
    (`privacy@supercompute.io`, `contact@supercompute.io`,
    `security@supercompute.io`). On-chain transparency note (Section 6).
  - Copy drafted from `docs/legal-drafts/privacy.md` (legal-copy task
    `t_5cfef313`); front-end integration from the recovered template at
    `b62c3f1` (page-only: `pages/privacy.tsx`).

- **Front-end integration (`docs/legal/{terms,privacy}.md`)** — canonical
  markdown drafts copied into the repo at `/legal/` so the integrator sees the
  source of truth alongside the rendered `.tsx` pages.

- **Site integrations**
  - New `components/PublicLayout.tsx` — clean public-area shell (no sidebar,
    no AgentChat) so legal pages render without auth chrome. Reuses the
    existing Terminal Dossier baseline styles.
  - `styles/globals.css` — added `display-xl`, `display-md`, `public-shell`,
    `public-main`, `legal-stub`, and table/blockquote utility styles used by
    the two pages.
  - `components/Footer.tsx` — new "Legal" link column at `/terms` and
    `/privacy`.

**Pending C2 sign-off before general-public launch:**
- Delaware arbitration clause (Section 13 of ToS).
- Inbox choices: `contact@`, `privacy@`, `security@supercompute.io`.
- Definition of "Supercompute" as the unincorporated operator.

**Process for future revisions:**
1. Update `docs/legal/terms.md` and/or `docs/legal/privacy.md` (canonical copy).
2. Bump `POLICY_VERSION` and `LAST_UPDATED` constants at the top of the
   corresponding `pages/*.tsx` file.
3. Reflect the change in the `.tsx` body.
4. Add a new entry under this changelog.
5. Open a PR to `develop` with the fleet template. C2 review required.
