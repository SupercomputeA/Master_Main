# Archived Pages

Pages here are **not deployed**. The `_` prefix is excluded from Next.js routing.

## Why archived

These pages were either off-style (older design iterations) or belong to separate products
that have their own deployments.

## What's here

| Path | Reason | Lives elsewhere |
|------|--------|-----------------|
| `newsdesk/` | Own product | `feat/supercompute-publishing` branch → `supercompute.newsdesk.app` |
| `knowledge-graph.tsx` | Belongs to NewsDesk | Same as above |
| `admin/` | Off-style admin pages from earlier iteration | — |
| `eddesk.tsx` | Off-style | — |
| `tradedesk.tsx` | Off-style | — |
| `dashboard.tsx` | Off-style | — |
| `press.tsx` | Off-style | — |

## Restoring

If you need one back:

```bash
git mv pages/_archive/<name> pages/<name>
```

Then check it against the current design brief before shipping.
