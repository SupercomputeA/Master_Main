# Archive

Pages here are **not deployed**. This directory lives outside `pages/` so Next.js
doesn't even scan it for module resolution, and it's excluded from `tsconfig.json`
so type checks skip it too.

## Why archived

These pages were either off-style (older design iterations) or belong to separate
products that have their own deployments.

## What's here

| Path | Reason | Lives elsewhere |
|------|--------|-----------------|
| `newsdesk/` | Now its own product | `SupercomputeA/supercompute-publishing` |
| `knowledge-graph.tsx` | Belongs to the publishing app | Same as above |
| `app/{projects,publishing,school,social,staking,token}.tsx` | Duplicates of public routes. Replaced by single routes with in-page wallet/token gates. | Merged into `pages/{projects/browse,school,social,staking,token}.tsx` |

(Other early-iteration pages — admin/, eddesk, tradedesk, dashboard, press —
were deleted in origin/main during reconciliation and never made it here.)

## Restoring

If you need one back:

```bash
git mv _archive/<name> pages/<name>
```

Then update its import paths (these files were originally in `pages/`, so paths
like `"../components/Layout"` need to become `"../components/Layout"` again from
the destination — which they already are if restoring to `pages/`).

Check against the current design brief before shipping.
