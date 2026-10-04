// components/tradedesk/TradeDesk.tsx
//
// Read-only public surface for supercompute.io/tradedesk. Renders:
//   - Page header with the SUPERCOMPUTE terminal-core aesthetic.
//   - Jurisdictional banner (Hard rule #2: Stock Tokens NOT available in US).
//   - Live chain-status row (chain id, gas token, mode).
//   - Wallet-connection panel (uses wagmi's useAccount — read-only, no
//     signing, no transaction construction).
//   - Stock Token informational table (read-only, no live quotes unless
//     explicitly provided by the host site).
//
// All live writes are gated behind `capabilities.liveWrites`, which is
// false by default. The component never invents chain data; when an
// upstream RPC / oracle is missing it renders an explicit empty state.

"use client"

import { useChainId, useConnect, useConnection, useDisconnect } from "wagmi"
import {
  ROBINHOOD_CHAIN_ID,
  type TradeDeskCapabilities,
  type TradeDeskConnectionState,
  type TradeDeskProps,
} from "./types"
import {
  describeChain,
  isRobinhoodChain,
  isRobinhoodMainnet,
} from "./lib/chain"
import { resolveCapabilities } from "./lib/capabilities"

const DEFAULT_TITLE = "TradeDesk"

function resolveConnectionState(
  connection: ReturnType<typeof useConnection>,
  chainId: number | undefined,
): TradeDeskConnectionState {
  // wagmi 3.x returns a discriminated union with a `status` field plus
  // `address` / `chainId`. The wrong-network state is derived here from
  // chainId because wagmi considers a connection "connected" regardless
  // of which chain the wallet is on.
  switch (connection.status) {
    case "connected":
      if (typeof chainId === "number" && !isRobinhoodChain(chainId)) {
        return { status: "wrong-network", currentChainId: chainId }
      }
      return {
        status: "connected",
        address: connection.address,
        chainId: connection.chainId,
      }
    case "reconnecting":
    case "connecting":
      return { status: "connecting" }
    case "disconnected":
      return { status: "disconnected" }
    default:
      return {
        status: "error",
        message: `Unexpected status: ${String((connection as { status: unknown }).status)}`,
      }
  }
}

export default function TradeDesk({
  mode = "read-only",
  capabilities,
  stockTokens,
  title = DEFAULT_TITLE,
}: TradeDeskProps) {
  const connectionWagmi = useConnection()
  const chainId = useChainId()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()

  const effective: TradeDeskCapabilities = resolveCapabilities(
    mode,
    capabilities,
    false,
  )

  const connection = resolveConnectionState(connectionWagmi, chainId)

  const onRobinhood = isRobinhoodChain(chainId)
  const mainnet = isRobinhoodMainnet(chainId)

  return (
    <section
      data-tradedesk-root
      data-mode={mode}
      style={{
        fontFamily: "var(--font-mono, ui-monospace, SFMono-Regular, monospace)",
        color: "var(--text, #e8e8e8)",
        background: "var(--surface, #0a1330)",
        border: "1px solid var(--border, #1f2a48)",
        padding: "20px 24px",
        maxWidth: 960,
        margin: "0 auto",
      }}
    >
      <header style={{ marginBottom: 16 }}>
        <div
          style={{
            fontSize: 10,
            letterSpacing: 2,
            textTransform: "uppercase",
            color: "var(--muted, #6b7896)",
          }}
        >
          SUPERCOMPUTE · TRADEDESK
        </div>
        <h1
          style={{
            fontSize: 22,
            margin: "4px 0 8px",
            color: "var(--accent, #C9A33A)",
          }}
        >
          {title}
        </h1>
        <div
          style={{
            fontSize: 11,
            color: "var(--muted, #6b7896)",
          }}
        >
          Robinhood Chain · Arbitrum L2 · chain id {ROBINHOOD_CHAIN_ID}
        </div>
      </header>

      {/* Hard rule #2 — jurisdictional banner stays visible on every public
          surface that quotes tokenized equities. */}
      <aside
        role="note"
        aria-label="Jurisdictional notice"
        style={{
          border: "1px solid var(--border-accent, #C9A33A)",
          padding: "10px 14px",
          marginBottom: 16,
          fontSize: 11,
          color: "var(--accent, #C9A33A)",
        }}
      >
        Stock Tokens are NOT available in the United States. US residents see
        informational data only — no quoting, trading, or custody.
      </aside>

      {/* Chain status row */}
      <div
        data-testid="chain-status"
        style={{
          display: "grid",
          gridTemplateColumns: "120px 1fr",
          rowGap: 6,
          columnGap: 12,
          fontSize: 12,
          padding: "12px 0",
          borderTop: "1px solid var(--border, #1f2a48)",
          borderBottom: "1px solid var(--border, #1f2a48)",
          marginBottom: 16,
        }}
      >
        <span style={{ color: "var(--muted, #6b7896)" }}>Mode</span>
        <span data-testid="td-mode">{mode.toUpperCase()}</span>
        <span style={{ color: "var(--muted, #6b7896)" }}>Chain</span>
        <span data-testid="td-chain">{describeChain(chainId)}</span>
        <span style={{ color: "var(--muted, #6b7896)" }}>Gas token</span>
        <span>ETH</span>
        <span style={{ color: "var(--muted, #6b7896)" }}>Live writes</span>
        <span data-testid="td-livewrites">
          {effective.liveWrites ? "enabled" : "disabled"}
        </span>
      </div>

      {/* Wallet panel — read-only hookup. No signing, no tx construction. */}
      <div
        data-testid="wallet-panel"
        style={{
          padding: "12px 14px",
          border: "1px solid var(--border, #1f2a48)",
          marginBottom: 16,
          fontSize: 12,
        }}
      >
        <div
          style={{
            fontSize: 10,
            letterSpacing: 2,
            textTransform: "uppercase",
            color: "var(--muted, #6b7896)",
            marginBottom: 6,
          }}
        >
          Wallet
        </div>
        {renderConnection(connection, connect, connectors, disconnect)}
      </div>

      {/* Stock Tokens informational table. Empty array → explicit empty state. */}
      <div data-testid="stock-tokens">
        <div
          style={{
            fontSize: 10,
            letterSpacing: 2,
            textTransform: "uppercase",
            color: "var(--muted, #6b7896)",
            marginBottom: 6,
          }}
        >
          Stock Tokens · informational
        </div>
        {renderStockTokens(stockTokens)}
      </div>

      <footer
        style={{
          marginTop: 20,
          fontSize: 10,
          color: "var(--muted, #6b7896)",
        }}
      >
        {onRobinhood
          ? mainnet
            ? "Connected to Robinhood Chain mainnet."
            : "Connected to Robinhood Chain testnet."
          : "Not on Robinhood Chain — switch networks to read live state."}
      </footer>
    </section>
  )
}

function renderConnection(
  connection: TradeDeskConnectionState,
  connect: ReturnType<typeof useConnect>["connect"],
  connectors: ReturnType<typeof useConnect>["connectors"],
  disconnect: () => void,
) {
  switch (connection.status) {
    case "disconnected":
      return (
        <button
          type="button"
          onClick={() => {
            const first = connectors[0]
            if (first) connect({ connector: first })
          }}
          style={{
            fontFamily: "inherit",
            background: "var(--accent, #C9A33A)",
            color: "#0a1330",
            border: 0,
            padding: "6px 12px",
            cursor: "pointer",
          }}
        >
          Connect wallet
        </button>
      )
    case "connecting":
      return <span data-testid="td-conn">Connecting…</span>
    case "wrong-network":
      return (
        <span data-testid="td-conn" style={{ color: "var(--accent, #C9A33A)" }}>
          Wrong network (chain id {connection.currentChainId}). Switch to
          Robinhood Chain to continue.
        </span>
      )
    case "connected":
      return (
        <span
          data-testid="td-conn"
          style={{ display: "flex", gap: 12, alignItems: "center" }}
        >
          <code style={{ fontSize: 11 }}>{shorten(connection.address)}</code>
          <button
            type="button"
            onClick={() => disconnect()}
            style={{
              fontFamily: "inherit",
              background: "transparent",
              color: "var(--muted, #6b7896)",
              border: "1px solid var(--border, #1f2a48)",
              padding: "4px 10px",
              cursor: "pointer",
            }}
          >
            Disconnect
          </button>
        </span>
      )
    case "error":
      return (
        <span data-testid="td-conn" style={{ color: "#c93a3a" }}>
          {connection.message}
        </span>
      )
  }
}

function renderStockTokens(
  tokens: TradeDeskProps["stockTokens"],
) {
  if (!tokens || tokens.length === 0) {
    return (
      <div
        data-testid="stock-tokens-empty"
        style={{
          fontSize: 11,
          color: "var(--muted, #6b7896)",
          padding: "10px 0",
        }}
      >
        No tokenized equities configured for this surface. The host site
        supplies rows; this package renders them read-only.
      </div>
    )
  }
  return (
    <table
      style={{
        width: "100%",
        borderCollapse: "collapse",
        fontSize: 12,
      }}
    >
      <thead>
        <tr style={{ textAlign: "left", color: "var(--muted, #6b7896)" }}>
          <th style={{ padding: "6px 8px" }}>Symbol</th>
          <th style={{ padding: "6px 8px" }}>Name</th>
          <th style={{ padding: "6px 8px" }}>Issuer</th>
          <th style={{ padding: "6px 8px", textAlign: "right" }}>Price</th>
          <th style={{ padding: "6px 8px", textAlign: "right" }}>24h</th>
          <th style={{ padding: "6px 8px" }}>Jurisdiction</th>
        </tr>
      </thead>
      <tbody>
        {tokens.map((t) => (
          <tr key={t.symbol} style={{ borderTop: "1px solid var(--border, #1f2a48)" }}>
            <td style={{ padding: "6px 8px", fontWeight: 600 }}>{t.symbol}</td>
            <td style={{ padding: "6px 8px" }}>{t.name}</td>
            <td style={{ padding: "6px 8px" }}>{t.issuer}</td>
            <td style={{ padding: "6px 8px", textAlign: "right" }}>
              {t.priceUsd === null ? "—" : `$${t.priceUsd.toFixed(2)}`}
            </td>
            <td
              style={{
                padding: "6px 8px",
                textAlign: "right",
                color:
                  t.change24h === null
                    ? "var(--muted, #6b7896)"
                    : t.change24h >= 0
                      ? "var(--teal, #2bb673)"
                      : "#c93a3a",
              }}
            >
              {t.change24h === null
                ? "—"
                : `${t.change24h >= 0 ? "+" : ""}${(t.change24h * 100).toFixed(2)}%`}
            </td>
            <td style={{ padding: "6px 8px" }}>{t.jurisdiction}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function shorten(addr: string): string {
  if (addr.length <= 12) return addr
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`
}