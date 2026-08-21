"use client"

// components/TradeDeskMount.tsx
//
// Thin client-only wrapper that sets the explicit read-only posture for
// the TradeDesk surface at /tradedesk. The actual component is loaded
// with `next/dynamic({ ssr: false })` in pages/tradedesk.tsx so that the
// wagmi hooks inside don't run during `next export` prerender.

import TradeDesk from "@supercompute/tradedesk/components/tradedesk"

export default function TradeDeskMount() {
  return <TradeDesk mode="read-only" />
}
