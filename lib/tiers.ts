// lib/tiers.ts — Tier definitions, entitlements, and helpers.
// Single source of truth for tier metadata — used by /subscribe page,
// /api/subscribers, and /api/web3/gate.
//
// ⚠ THIS FILE IS A TYPESCRIPT MIRROR. The runtime source is lib/tiers.js
// (CF Pages Functions can't load .ts at runtime). Keep both in sync.
// Pricing here is PLACEHOLDER — confirm with user before going live.
// TradeDesk payment rail integration lives in the tradedesk profile.

import { TIERS as _TIERS, TIER_IDS as _TIER_IDS, isValidTier as _isValidTier, getTier as _getTier, entitlementsFor as _entitlementsFor, defaultExpirySeconds as _defaultExpirySeconds } from "./tiers.js"

export type TierId = "free" | "builder" | "operator" | "syndicate" | "lead"

export interface Tier {
  id: TierId
  name: string
  tagline: string
  /** PLACEHOLDER price — confirm with user before launch */
  priceLabel: string
  /** tier feature list */
  features: string[]
  /** entitled surfaces (used by /api/web3/gate) */
  surfaces: string[]
  /** agent-inference call budget per day (placeholder) */
  inferencePerDay: number
  /** order in the funnel (0 = first) */
  order: number
  highlight?: boolean
}

export interface SubscriberRow {
  id: string
  wallet_address: string | null
  email: string | null
  tier: string
  status: string
  joined_at: number
  expires_at: number | null
  source: string | null
  tx_hash: string | null
  metadata: string | null
  updated_at: number
}

export interface Entitlements {
  tier: Tier
  surfaces: string[]
  inferencePerDay: number
  active: boolean
}

export const TIERS: Tier[] = _TIERS as Tier[]
export const TIER_IDS: TierId[] = _TIER_IDS as TierId[]

export function isValidTier(id: string): id is TierId {
  return _isValidTier(id)
}

export function getTier(id: TierId): Tier {
  return _getTier(id) as Tier
}

/** Compute active entitlements for a subscriber row.
 *  Returns null if no subscriber row, no wallet, expired, or cancelled.
 *  Active rows → resolved tier with `surfaces` and `inferencePerDay`. */
export function entitlementsFor(row: SubscriberRow | null | undefined): Entitlements | null {
  return _entitlementsFor(row) as Entitlements | null
}

/** Map a tier to a default expiry (seconds from now). Free + lead → null.
 *  Placeholder durations — confirm pricing cadence with user. */
export function defaultExpirySeconds(tier: TierId): number | null {
  return _defaultExpirySeconds(tier) as number | null
}