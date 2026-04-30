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

### 2. Local Development

```bash
# Serve static files locally
npx serve public

# Or use any local server
python -m http.server 8080
```

### 3. Validate Build

```bash
bash validate.sh
```

### 4. Deploy

```bash
# Deploy to Cloudflare Pages
npx wrangler pages deploy public --project-name=artifact-main
```

## CI/CD Setup

### GitHub Actions (Automatic Deploy)

1. **Add Secrets** to your GitHub repo:
   - Go to: Settings → Secrets and variables → Actions
   - Add:
     - `CLOUDFLARE_API_TOKEN` - Your Cloudflare API token
     - `CLOUDFLARE_ACCOUNT_ID` - Your Cloudflare account ID

2. **Push to main** - Deploys automatically

### What CI/CD Does

- ✅ Validates HTML structure
- ✅ Checks required files exist
- ✅ Scans for code issues
- ✅ Deploys to Cloudflare Pages on main branch
- ✅ Runs on every PR and push

## Project Structure

```
/supercompute
├── .github/workflows/ci-cd.yml  # CI/CD pipeline
├── validate.sh                   # Build validation script
├── wrangler.toml                # Cloudflare config
├── package.json                 # Scripts
├── schema.sql                  # D1 database schema
│
├── public/                     # Static assets (deployed)
│   ├── Supercompute.html     # Main SPA
│   ├── sc.css               # Styles
│   ├── sc-app.jsx           # React components
│   └── siwe-client.js       # SIWE auth client
│
└── src/                       # Cloudflare Worker source
    ├── worker.js             # Main entry
    └── api/                  # API routes
        ├── auth.js          # SIWE auth
        ├── articles.js     # NewsDesk API
        ├── staking.js       # Staking API
        └── agents.js        # Agent fleet API
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `CF_ACCOUNT_ID` | Cloudflare account ID |
| `CF_API_TOKEN` | Cloudflare API token |

Set via GitHub secrets or `.dev.vars` for local.

## API Endpoints

| Endpoint | Method | Description |
|---------|--------|-------------|
| `/api/auth/nonce` | GET | Generate SIWE nonce |
| `/api/auth/login` | POST | SIWE login |
| `/api/auth/profile` | GET | Get current user |
| `/api/articles` | GET | List articles |
| `/api/staking` | GET | Get staking stats |
| `/api/agents` | GET | List agents |

## Development Workflow

```bash
# 1. Make changes
code .

# 2. Validate locally
bash validate.sh

# 3. Test locally
npx serve public

# 4. Commit & push
git add . && git commit -m "feat: new feature"
git push origin main

# 5. CI/CD auto-deploys
```

## Troubleshooting

### Site not updating?
- Hard refresh: `Cmd+Shift+R`
- Check: https://dash.cloudflare.com → Pages → artifact-main

### Deployment fails?
- Check GitHub Actions logs
- Verify Cloudflare secrets are set
- Run validate.sh locally first

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React, Vanilla CSS |
| API | Cloudflare Workers |
| Database | Cloudflare D1 |
| Auth | SIWE (EIP-4361) |
| Chain | Base (L2) |

## License

MIT · supercompute.eth · Built in Public