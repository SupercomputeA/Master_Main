-- Seed admin wallets
-- Auth resolves ENS names and checks both the raw identifier and resolved address.
-- supercompute.eth currently resolves to 0x5056A0729A7860a0C6f63575E74a51d5c2b85cF1 — seeded both
-- so sign-in via ENS name OR raw address yields admin role.
INSERT OR IGNORE INTO admin_wallets (id, wallet_address, role)
VALUES
  ('admin_001', 'supercompute.eth', 'admin'),
  ('admin_001_addr', '0x5056a0729a7860a0c6f63575e74a51d5c2b85cf1', 'admin'),
  ('admin_002', 'orami.eth', 'admin'),
  ('admin_003', '0x1a828cd220559479e2f761805da4ee722683323b', 'admin');
