// components/tradedesk/lib/capabilities.ts
//
// Capability defaults + sanity-check. Hard rule #1 from the tradedesk
// profile: live writes require explicit user sign-off. The component MUST
// refuse to ship a `liveWrites: true` capability without the matching
// runtime approval flag — and that flag is set by the host site, never
// derived from the URL.

import type { TradeDeskCapabilities, TradeDeskMode } from "../types"

export const DEFAULT_CAPABILITIES: TradeDeskCapabilities = {
  equitiesInfo: true,
  simulatedSwap: false,
  liveReads: true,
  liveWrites: false,
}

/**
 * Resolve the effective capability set for the component.
 *
 * @param mode          Operating posture for the surface.
 * @param overrides     Caller-supplied capability overrides (e.g. from the host site).
 * @param approvedLive  Set to true ONLY when the host site has recorded
 *                      explicit user sign-off + Security gate clearance
 *                      (task t_117ac6c6). Default false.
 */
export function resolveCapabilities(
  mode: TradeDeskMode,
  overrides: Partial<TradeDeskCapabilities> | undefined,
  approvedLive: boolean,
): TradeDeskCapabilities {
  const merged: TradeDeskCapabilities = {
    ...DEFAULT_CAPABILITIES,
    ...(overrides ?? {}),
  }

  // Hard rule: `liveWrites` cannot be enabled from a caller override alone.
  if (merged.liveWrites && !(mode === "live" && approvedLive)) {
    merged.liveWrites = false
  }

  // Hard rule: `simulatedSwap` is fine in `simulated` or `read-only` mode,
  // never in `live` mode without explicit approval.
  if (mode === "live" && merged.simulatedSwap && !approvedLive) {
    merged.simulatedSwap = false
  }

  return merged
}