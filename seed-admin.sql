-- Seed admin wallets
-- Auth resolves ENS names and checks both the raw identifier and resolved address
INSERT OR IGNORE INTO admin_wallets (id, wallet_address, role)
VALUES
  ('admin_001', 'supercompute.eth', 'admin'),
  ('admin_002', 'orami.eth', 'admin'),
  ('admin_003', '0x1a828cd220559479e2f761805da4ee722683323b', 'admin');
