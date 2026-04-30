# SUPERCOMPUTE · Web3 Platform

Sovereign AI-native platform on Base Chain — NewsDesk intelligence, DeFi operations, consulting, and principled Web3 education.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Cloudflare Stack                        │
├─────────────────────────────────────────────────────────────┤
│  Workers (API)  │  D1 (SQLite)  │  KV (Sessions)  │  R2 (Storage)  │
│  Pages (Frontend)  │  Access (Auth)  │  Durable Objects  │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                      Frontend                                │
│  Supercompute.html (React via CDN + Babel)                   │
│  sc-app.jsx · sc-landing.jsx · sc-shared.jsx                 │
└─────────────────────────────────────────────────────────────┘
```

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Cloudflare account (`wrangler` CLI)

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Cloudflare

```bash
# Login to Cloudflare
npx wrangler login

# Create D1 database
npx wrangler d1 create supercompute

# Get the database ID from output, then add to wrangler.toml
```

### 3. Push Database Schema

```bash
# Local development
npx wrangler d1 execute supercompute --local --file=schema.sql

# Production (after first deploy)
npx wrangler d1 execute supercompute --env production --file=schema.sql
```

### 4. Start Dev Server

```bash
# API + local D1
npm run dev

# Or static files only (for frontend dev)
npx serve public
```

### 5. Deploy

```bash
# Deploy worker + site
npm run deploy

# Or just pages
npm run deploy:pages
```

## Project Structure

```
/supercompute
├── wrangler.toml          # Cloudflare config (Workers + D1 + site)
├── package.json            # Scripts & deps
├── tsconfig.json          # TypeScript config
├── schema.sql             # D1 database schema
├── _headers              # Cloudflare Pages headers
├── _redirects            # Cloudflare Pages redirects
│
├── public/                # Static assets (served by Workers)
│   ├── Supercompute.html # Main SPA
│   ├── sc.css            # Styles
│   ├── sc-app.jsx        # React components (dashboard)
│   ├── sc-landing.jsx   # React components (landing)
│   ├── sc-shared.jsx    # React components (shared)
│   ├── sc-logic.js      # Frontend logic & data
│   └── _headers        # Cache & security headers
│
└── src/                  # Cloudflare Worker source
    ├── worker.js         # Main entry point
    ├── api/
    │   ├── auth.js      # SIWE authentication
    │   ├── articles.js # NewsDesk API
    │   ├── staking.js   # Staking API
    │   └── agents.js    # Agent fleet API
    └── utils/
        ├── siwe.js      # SIWE message generation
        └── wallet.js    # Wallet connection helpers
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `CF_ACCOUNT_ID` | Cloudflare account ID | Yes |
| `CF_API_TOKEN` | Cloudflare API token | Yes |

Set via `wrangler.toml` or `.dev.vars`.

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/nonce` | GET | Generate SIWE login nonce |
| `/api/auth/message` | GET | Get SIWE message to sign |
| `/api/auth/login` | POST | Verify signature, create session |
| `/api/auth/profile` | GET | Get current user |
| `/api/auth/logout` | POST | Destroy session |
| `/api/articles` | GET | List NewsDesk articles |
| `/api/staking` | GET | Get staking stats |
| `/api/agents` | GET | List agent fleet |

## SIWE Authentication Flow

```
1. User clicks "Connect Wallet"
       │
       ▼
2. Frontend requests /api/auth/nonce
       │
       ▼
3. Frontend gets nonce + generates SIWE message
       │
       ▼
4. User signs message with wallet
       │
       ▼
5. Frontend POSTs to /api/auth/login with:
   { address, signature, nonce }
       │
       ▼
6. Backend verifies, stores session,
   returns JWT in response
       │
       ▼
7. Frontend stores JWT, includes in
   Authorization: Bearer <token> header
```

## Deployment

### Staging

```bash
wrangler deploy --env staging
```

### Production

```bash
wrangler deploy --env production
```

### Create Preview

```bash
npm run preview
```

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Babel (in-browser), Vanilla CSS |
| API Runtime | Cloudflare Workers, Hono |
| Database | Cloudflare D1 (SQLite) |
| Sessions | Cloudflare KV |
| Storage | Cloudflare R2 |
| Auth | SIWE (EIP-4361) |
| Chain | Base (L2) |

## Development

### Adding a New API Route

1. Create `/src/api/your-route.js`
2. Import in `/src/worker.js`
3. Add route matching in the fetch handler
4. Deploy

### Updating Schema

```bash
# Edit schema.sql, then:
npx wrangler d1 execute supercompute --local --file=schema.sql
```

### Testing SIWE Locally

Use MetaMask or Coinbase Wallet browser extension. The worker will verify signatures against connected wallet.

## Known Limitations

- SIWE signature verification uses simplified validation in dev mode
- For production, add proper EIP-191 signature recovery with `viem`
- D1 local mode requires `sqlite3` installed

## License

MIT · supercompute.eth · Built in Public