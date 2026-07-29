// lib/tiers.js — Tier definitions mirror, importable from CF Pages Functions.
// The canonical TypeScript source is lib/tiers.ts — kept in sync manually.
// Single source of truth for tier metadata — used by /subscribe page,
// /api/subscribers, and /api/web3/gate.

export const TIERS = [
  {
    id: "free",
    name: "Free",
    tagline: "Read + listen. Public feed.",
    priceLabel: "$0",
    features: [
      "Public articles (NewsDesk)",
      "Knowledge graph — read-only",
      "Subscribe to email dispatch",
    ],
    surfaces: ["public", "newsdesk", "knowledge-graph:read"],
    inferencePerDay: 0,
    order: 0,
  },
  {
    id: "builder",
    name: "Builder",
    tagline: "Ship agents + read the full KG.",
    priceLabel: "$29 / mo · PLACEHOLDER",
    features: [
      "Everything in Free",
      "Knowledge graph — full read",
      "5 agent-inference calls / day",
      "School Module 1 (Blockchain Fundamentals)",
      "Discord — #builders channel",
    ],
    surfaces: ["public", "newsdesk", "knowledge-graph:read", "knowledge-graph:query", "school:m1", "agents:basic"],
    inferencePerDay: 5,
    order: 1,
    highlight: true,
  },
  {
    id: "operator",
    name: "Operator",
    tagline: "Run the fleet. Stack the protocol.",
    priceLabel: "$99 / mo · PLACEHOLDER",
    features: [
      "Everything in Builder",
      "100 agent-inference calls / day",
      "Full School curriculum (all modules)",
      "Staking dashboard + alerts",
      "TradeDesk beta (read-only)",
      "Quarterly operator call",
    ],
    surfaces: ["public", "newsdesk", "knowledge-graph:read", "knowledge-graph:query", "school:all", "agents:pro", "staking", "tradedesk:read"],
    inferencePerDay: 100,
    order: 2,
  },
  {
    id: "syndicate",
    name: "Syndicate",
    tagline: "Co-author the protocol. Ship with us.",
    priceLabel: "$499 / mo · PLACEHOLDER",
    features: [
      "Everything in Operator",
      "Unlimited agent-inference",
      "Direct line to core team",
      "Co-authorship on Supercompute research",
      "Token-gated Guild.xyz role",
      "Founders syndicate dinner (annual)",
    ],
    surfaces: ["public", "newsdesk", "knowledge-graph:read", "knowledge-graph:query", "school:all", "agents:unlimited", "staking", "tradedesk:read", "tradedesk:write", "research"],
    inferencePerDay: -1,
    order: 3,
  },
];

export const TIER_IDS = TIERS.map(t => t.id);

export function isValidTier(id) {
  return TIER_IDS.includes(id);
}

export function getTier(id) {
  return TIERS.find(t => t.id === id) || TIERS[0];
}

/** Compute active entitlements for a subscriber row.
 *  Returns null if no subscriber row, no wallet, expired, or cancelled.
 *  Active rows → resolved tier with `surfaces` and `inferencePerDay`. */
export function entitlementsFor(row) {
  if (!row) return null;
  if (row.status !== "active") return null;
  if (row.expires_at && row.expires_at < Math.floor(Date.now() / 1000)) return null;
  const tier = getTier(row.tier);
  return { tier, surfaces: tier.surfaces, inferencePerDay: tier.inferencePerDay, active: true };
}

/** Map a tier to a default expiry (seconds from now). Free + lead → null.
 *  Placeholder durations — confirm pricing cadence with user. */
export function defaultExpirySeconds(tier) {
  switch (tier) {
    case "free":
    case "lead":
      return null;
    case "builder":
    case "operator":
    case "syndicate":
      return 30 * 24 * 60 * 60;  // 30-day placeholder
    default:
      return null;
  }
}