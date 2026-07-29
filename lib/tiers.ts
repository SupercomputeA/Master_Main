// lib/tiers.ts — TypeScript mirror of lib/tiers.js. Kept in sync manually.
// Self-contained: no imports of types from lib/tiers.js (would conflict with local declarations).

export type TierId = "free" | "builder" | "operator" | "syndicate" | "lead";

export interface Tier {
  id: TierId;
  name: string;
  tagline: string;
  priceLabel: string;
  priceCents: number;
  paymentRail: "usdc-base" | null;
  features: string[];
  surfaces: string[];
  inferencePerDay: number;
  order: number;
  highlight?: boolean;
}

export const TIERS: Tier[] = [
  {
    id: "free",
    name: "Free",
    tagline: "Read + listen. Public feed.",
    priceLabel: "$0",
    priceCents: 0,
    paymentRail: null,
    features: [
      "Public articles (NewsDesk)",
      "Knowledge graph — read-only",
      "Subscribe to email dispatch",
      "School Module 1 — first chapter free",
    ],
    surfaces: ["public", "newsdesk", "knowledge-graph:read", "school:m1:preview"],
    inferencePerDay: 0,
    order: 0,
  },
  {
    id: "builder",
    name: "Builder",
    tagline: "Ship agents + read the full KG.",
    priceLabel: "$29 / mo",
    priceCents: 2900,
    paymentRail: "usdc-base",
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
    priceLabel: "$99 / mo",
    priceCents: 9900,
    paymentRail: "usdc-base",
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
    priceLabel: "$499 / mo",
    priceCents: 49900,
    paymentRail: "usdc-base",
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

export function isValidTier(id: string): id is TierId {
  return TIER_IDS.includes(id as TierId);
}

export function getTier(id: string): Tier {
  return TIERS.find(t => t.id === id) || TIERS[0];
}

export function isPaidTier(id: string): boolean {
  const t = getTier(id);
  return t.priceCents > 0;
}

export interface PaymentConfig {
  rail: "usdc-base";
  chainId: number;
  usdcContract: `0x${string}`;
  treasury: `0x${string}`;
  usdcDecimals: number;
}

export const PAYMENT_CONFIG: PaymentConfig = {
  rail: "usdc-base",
  chainId: 8453,
  usdcContract: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  treasury: "0x1a828cd220559479e2f761805da4ee722683323B",
  usdcDecimals: 6,
};

export function entitlementsFor(row: any) {
  if (!row) return null;
  if (row.status !== "active") return null;
  if (row.expires_at && row.expires_at < Math.floor(Date.now() / 1000)) return null;
  const tier = getTier(row.tier);
  return { tier, surfaces: tier.surfaces, inferencePerDay: tier.inferencePerDay, active: true };
}

export interface SubscriberRow {
  id: string;
  wallet_address: string | null;
  email: string | null;
  tier: TierId | "lead";
  status: "active" | "pending" | "expired" | "cancelled";
  joined_at: number;
  expires_at: number | null;
  payment_rail: "usdc-base" | null;
  payment_tx_hash: string | null;
  notes: string | null;
  updated_at: number;
  source?: string;
  metadata?: string | null;
}

export function defaultExpirySeconds(tier: string): number | null {
  switch (tier) {
    case "free":
    case "lead":
      return null;
    case "builder":
    case "operator":
    case "syndicate":
      return 30 * 24 * 60 * 60;
    default:
      return null;
  }
}
