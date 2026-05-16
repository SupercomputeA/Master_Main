# Supercompute Web3 Auth + CMS Rebuild

## What to build

Build a proper Web3 CMS on Cloudflare Workers + D1:
- SIWE (EIP-4361) wallet auth with real EIP-191 signature verification
- Admin allowlist — only whitelisted wallets get admin access
- Articles CRUD wired to D1 (replace current mock data)
- Projects CRUD for the public projects section
- Admin panel UI (simple HTML/JS, wallet-connect only, no passwords)

## Tech stack

- Cloudflare Workers (API)
- Cloudflare D1 (database — binding name: `DB`)
- SIWE (EIP-4361) for wallet auth
- viem for EIP-191 signature verification (import from npm)
- Wrangler CLI for deploy

## Files

### Modify
- `schema.sql` — add `admin_wallets` table, `projects` table
- `wrangler.toml` — add D1 binding `DB`, add `pages_build_output_dir = "public"`
- `src/api/auth.js` — fix signature verification, check admin allowlist, rate limiting
- `src/api/articles.js` — replace static mock with D1 queries, add auth-gated writes
- `src/api/projects.js` — NEW file, CRUD for projects
- `src/worker.js` — wire new routes

### Create
- `public/admin/index.html` — admin panel (wallet sign-in, article editor, project manager)
- `src/utils/siwe.js` — if not already complete (check first)

## Schema changes

```sql
-- Add to schema.sql
CREATE TABLE admin_wallets (
  id TEXT PRIMARY KEY,
  wallet_address TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'admin',
  created_at INTEGER DEFAULT (unixepoch())
);

CREATE TABLE projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  ticker TEXT,
  stack TEXT,
  description TEXT,
  status TEXT DEFAULT 'active',
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch())
);
```

## Auth flow

1. `GET /api/auth/nonce` → returns nonce (stored in KV with 10min TTL)
2. Client: wallet signs SIWE message with nonce
3. `POST /api/auth/login` with `{ address, signature, nonce }` → verify EIP-191, check admin allowlist, create session, return session token
4. All CMS writes require `Authorization: Bearer <session>` header

## Security requirements

- Wallet addresses normalized to lowercase before all DB operations
- EIP-191 signature verification using viem `verifyMessage` (NOT just logging)
- Admin routes: check session wallet is in `admin_wallets` table (role=admin)
- CORS: lock to supercompute.io in production
- Rate limit: block wallet after 5 failed login attempts for 15 minutes (track in KV)
- No secrets in code — use `wrangler secret put`
- Input sanitization on all text fields before DB insert

## Admin panel

- Single HTML file at `public/admin/index.html`
- Wallet sign-in via SIWE (same flow as API)
- Article editor: title, category (dropdown), excerpt, content (textarea)
- Project manager: name, ticker, stack, description, status
- No passwords — wallet-only auth
- Serves from Cloudflare Pages at `/admin/`

## Articles API endpoints

```
GET    /api/articles          — list (public, no auth)
GET    /api/articles/:id      — get one (public)
POST   /api/articles          — create (admin only)
PUT    /api/articles/:id      — update (admin only)
DELETE /api/articles/:id      — delete (admin only)
```

## Projects API endpoints

```
GET    /api/projects          — list (public)
POST   /api/projects          — create (admin only)
PUT    /api/projects/:id      — update (admin only)
DELETE /api/projects/:id      — delete (admin only)
```