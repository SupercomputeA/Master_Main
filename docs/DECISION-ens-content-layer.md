# DECISION — ENS Content Layer (2026-08-10)

**Status:** CHECKPOINTED — approved position, implementation pending.
**Decision maker:** Mario (mone). **Executor:** C2 / Builder fleet.

## Position (the plan we approved)

**B + D combined:**

1. **B — contenthash → IPNS** (content rail)
   - Publish static export to IPFS; set `contenthash: ipns://<key>` on supercompute.eth
   - Fleet rotates CID under the same key without touching the ENS record
   - Permissionless reads: anyone resolves supercompute.eth via any ENS gateway
   - Custody: IPNS key with security profile (Bitwarden), same discipline as D1 token

2. **D — EAS attestations on Base** (authorship rail)
   - Every article carries on-chain attestation:
     "published by supercompute.eth, authored by Quanta Sovereigna"
   - Schema on Base (our chain); permissionless verification forever
   - Trust layer for the writer pipeline: readers can prove authorship

**Optional later:** C — CCIP-read / ERC-3668 if we want resolution to serve D1-backed
dynamic content instead of static pins.

## Why this combination

- Base-friendly (both rails on our chain / ecosystem)
- Custody-manageable with existing fleet discipline (Bitwarden via security)
- Kills the "we're the only ones who can serve/verify" problem
- Matches the publishing loop: writer drafts → build → pin → key update → live

## Checkpoint / run-back criteria

If any of the following changes, **run it back** (re-evaluate position):

- [ ] Content needs to be dynamically served from D1 (not static pins) → consider C
- [ ] IPFS pinning cost/custody becomes a burden → consider C or drop B
- [ ] EAS attestation schema on Base proves costly or wrong fit → keep B only
- [ ] We need subname-based article addressing (article-N.supercompute.eth) → extend B

## Current functional state (must stay working)

- supercompute.eth resolves → 0x5056a0729a7860a0c6f63575e74a51d5c2b85cf1 (verified live)
- text record: url = https://supercompute.io
- Site: Cloudflare Pages (supercompute.io), D1 articles, admin moderation, writer pipeline
- D1 token secured (cfut_..., D1:Edit only, stored condor/.env)
- Drafts synced: 24 draft + 20 published articles in D1

## Implementation steps (when we green-light)

1. IPFS pin step in build (nft.storage / pinata free tier)
2. IPNS key generation + custody with security profile
3. contenthash set on supercompute.eth (one tx)
4. EAS schema deploy on Base + attestation step in writer handoff
5. Verify: resolve via ENS gateway shows content; article attestation verifiable

## Reference

- Prior ENS evaluation (2026-08-10): resolve/owner/resolver verified live;
  gap = content layer was mock (now real via D1/admin work); reverse-lookup
  endpoint shape fix still open (/api/web3/resolve?address= → name required)
