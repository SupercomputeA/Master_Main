# Pattern sheets

Two long pages, every state laid out as a tile. Built specifically for the surfaces where dev agents struggle most.

| File | Covers |
|---|---|
| `web3-patterns.html` | Wallet pill (4 states), connect modal, SIWE auth (5 states), tx toasts (3), tx modal (2), balance bar, staking (3), project-back (3) |
| `cms-patterns.html` | Article editor, editor states (empty/AI/validation/conflict), schedule + cross-post pickers, article library list, empty/loading/error, Web3 School module list |

## How to use

1. Open the sheet in the Design System tab.
2. Find the tile that matches the state your agent is implementing.
3. Right-click → inspect, or open the source file. Markup is intentionally minimal so it copy-pastes cleanly.
4. The chrome (border, status badge, footer caption) is for the spec sheet only — strip it when lifting.

## Conventions

- **Tile = one state.** Idle / pending / success / error / edge are each their own tile.
- **Title row** says the human name + a `STATE` chip + a sequence letter (A/B/C…).
- **Tile foot** is the one-liner spec — when to use, where it lives, what triggers it.
- **States use the project palette** — pink for default + active, gold/warning for pending, green/success for confirmed, red/danger for errors, grey for draft/locked.

## Not yet in the codebase

These tiles are NEW (marked with the pink `NEW` chip in the head):
- Connect modal wallet picker
- SIWE 5-step sequence (idle → pending → verified → rejected → server-fail)
- Tx toast trio + tx modal pair
- Balance bar
- Project-back card (open / funded / claim)
- Editor empty / AI-working / validation / conflict states
- Schedule + cross-post modals
- Library row failed state + skeleton + error
