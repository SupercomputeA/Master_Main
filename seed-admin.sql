-- seed-admin.sql — admin_wallets grants. ONE-TIME BACKFILL, not a migration.
--
-- Why this is not under migrations/: the deploy lane re-applies every file in
-- migrations/ on each main/staging deploy. A *grant* that gets re-inserted on every
-- deploy cannot be revoked — deleting the row (SEC-F1's revocation mechanism, and the
-- only one this table has) would be silently undone by the next deploy. Grants are
-- applied deliberately, once, and are auditable here; the schema lives in migrations/.
--
-- Apply: wrangler d1 execute supercompute-db --remote --file=./seed-admin.sql
-- (INSERT OR IGNORE — safe to re-run, additive, never rewrites an existing row)
--
-- ── Two key forms, and which reader honours which ───────────────────────────
-- `admin_wallets.wallet_address` holds BOTH 0x addresses and ENS names, and the readers
-- disagree about what a name means:
--
--   login.js isAdmin()      address row, OR a name in ADMIN_ENS_NAMES that resolves to the
--                           signing wallet (resolves mainnet ENS, dual-binds, byte-exact
--                           compare). A name row therefore grants admin AT LOGIN to that
--                           name's current owner.
--   auth.js  isAdmin()      same shape (byte-exact, no lower() on the column).
--   /api/social/* gate      address rows ONLY, `lower(wallet_address) = ?` (case-insensitive
--                           on the column, which is why the checksummed 0xe7A3Ed04… row
--                           matches there). `sessions.wallet_address` is always a lowercase
--                           0x address (login.js:120), so an ENS-named row can never match it.
--
-- ⇒ An ENS name that is an admin must ALSO have a row for its owner's address, or the
--   owner is login-bridged to admin and simultaneously 403'd out of /api/social/* (the
--   admin UI renders and every call inside it fails). That is SEC-F1b item 1, card
--   t_f750de01, decided as option (a): fix the data, keep the gate strict. The gate does
--   NOT resolve ENS per request — 2-3 mainnet eth_calls on the deny path is an amplifier
--   for any authenticated non-admin, and it would make authorization follow mutable name
--   ownership instead of a revocable row.
--
-- ── Resolution evidence (mainnet block 25980491, 2026-09-14) ────────────────
--   supercompute.eth → 0x5056a0729a7860a0c6f63575e74a51d5c2b85cf1
--     ENS universal resolver via viem getEnsAddress, cross-checked against
--     api.ensideas.com; same address in docs/DECISION-ens-content-layer.md:43,
--     scripts/ipns-contenthash.mjs:103 (the ENS owner that signs the contenthash tx)
--     and the admin_001_addr row below.
--   orami.eth → 0x5536ec4cf7c0ce0dab48444afd1f69f4db2bf6f4
--     same two sources; corroborated on-chain by that address's reverse record, which
--     names itself `orami.eth` (viem getEnsName at block 25980500).
--   orami.base → NOT resolvable from mainnet ENS, and login.js only resolves
--     ADMIN_ENS_NAMES (supercompute.eth / orami.eth) via mainnet, so this row is inert for
--     the login bridge and needs no address row. Revisit if it is ever added to
--     ADMIN_ENS_NAMES.
--
-- Re-verify before trusting the rows below (a name can be re-pointed, and then the address
-- row, not the name, is the grant — the names are conveniences, the addresses are the
-- principals):
--   node --test tests/social/admin-gate.test.js   # [item 1 (a)] cases + the backfill proof
-- To revoke: DELETE FROM admin_wallets WHERE wallet_address = '<row>';
-- (SEC-F1d, card t_30f803f0: functions/api/subscribers.js used to match `wallet_address = ?`
-- byte-exact and was the last authorizing reader that disagreed with the other three; it now
-- sends `lower(wallet_address) = ?` too, so a checksummed row matches on every route. Guarded
-- by tests/api/subscribers-admin.test.js — the four readers, one statement.)

INSERT OR IGNORE INTO admin_wallets (id, wallet_address, role)
VALUES
  ('admin_001', 'supercompute.eth', 'admin'),
  ('admin_001_addr', '0x5056a0729a7860a0c6f63575e74a51d5c2b85cf1', 'admin'),
  ('admin_002', 'orami.eth', 'admin'),
  ('admin_002_addr', '0x5536ec4cf7c0ce0dab48444afd1f69f4db2bf6f4', 'admin'),
  ('admin_003', '0x1a828cd220559479e2f761805da4ee722683323b', 'admin');
