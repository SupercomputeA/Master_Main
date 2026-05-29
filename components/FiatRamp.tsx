"use client"

import React, { useState } from "react"
import { useAccount } from "wagmi"

interface FiatRampProps {
  mode?: "buy" | "sell" | "both"
  defaultAmount?: number
  onSuccess?: (txHash: string) => void
  onClose?: () => void
}

export function FiatRamp({ mode = "both", defaultAmount, onSuccess, onClose }: FiatRampProps) {
  const { address, isConnected } = useAccount()
  const [amount, setAmount] = useState(defaultAmount || 100)
  const [selectedProvider, setSelectedProvider] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)

  const providers = [
    {
      id: "moonpay",
      name: "Moonpay",
      icon: "🌙",
      description: "Credit card, bank transfer",
      supportedCoins: ["ETH", "BASE", "USDC"],
    },
    {
      id: "transak",
      name: "Transak",
      icon: "💱",
      description: "Credit card, Apple Pay",
      supportedCoins: ["ETH", "BASE", "USDC"],
    },
    {
      id: "onramps",
      name: "Onramps",
      icon: "⚡",
      description: "Instant ACH, debit card",
      supportedCoins: ["ETH", "BASE"],
    },
  ]

  const handleOpenRamp = async (providerId: string) => {
    if (!address) return

    setIsLoading(true)
    setSelectedProvider(providerId)

    try {
      const baseUrl = `https://${providerId}.com`
      const params = new URLSearchParams({
        apiKey:
          providerId === "moonpay"
            ? process.env.NEXT_PUBLIC_MOONPAY_KEY || ""
            : process.env.NEXT_PUBLIC_TRANSAK_KEY || "",
        walletAddress: address,
        currencyCode: "USD",
        amount: amount.toString(),
        redirectURL: typeof window !== "undefined" ? window.location.origin : "",
      })

      window.open(`${baseUrl}?${params.toString()}`, "_blank", "noopener")
      onSuccess?.("")
    } catch (err) {
      console.error("Ramp error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isConnected) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.icon}>💰</div>
          <h3 style={styles.title}>Connect Wallet</h3>
          <p style={styles.description}>Connect your wallet to buy or sell crypto</p>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h3 style={styles.title}>Buy & Sell Crypto</h3>
          <p style={styles.description}>Fast, simple on/off ramps powered by Neynar</p>
        </div>

        <div style={styles.amountSection}>
          <label style={styles.label}>Amount (USD)</label>
          <div style={styles.amountInput}>
            <span style={styles.currency}>$</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              style={styles.input}
              min="1"
              max="10000"
            />
          </div>
          <div style={styles.quickAmounts}>
            {[50, 100, 250, 500, 1000].map((a) => (
              <button
                key={a}
                className={`${styles.quickAmount} ${amount === a ? styles.active : ""}`}
                onClick={() => setAmount(a)}
              >
                ${a}
              </button>
            ))}
          </div>
        </div>

        <div style={styles.providers}>
          <label style={styles.label}>Select Provider</label>
          {providers.map((provider) => (
            <button
              key={provider.id}
              className={`${styles.provider} ${
                selectedProvider === provider.id ? styles.selected : ""
              }`}
              onClick={() => handleOpenRamp(provider.id)}
              disabled={isLoading}
            >
              <span style={styles.providerIcon}>{provider.icon}</span>
              <div style={styles.providerInfo}>
                <span style={styles.providerName}>{provider.name}</span>
                <span style={styles.providerDesc}>{provider.description}</span>
              </div>
              <span style={styles.coins}>
                {provider.supportedCoins.slice(0, 2).join(", ")}
              </span>
            </button>
          ))}
        </div>

        <div style={styles.note}>
          <p>Powered by Neynar. Third-party providers handle transactions.</p>
        </div>

        {onClose && (
          <button style={styles.closeButton} onClick={onClose}>
            Close
          </button>
        )}
      </div>
    </div>
  )
}

export function FiatRampModal({
  isOpen,
  onClose,
  mode = "both",
}: {
  isOpen: boolean
  onClose: () => void
  mode?: "buy" | "sell" | "both"
}) {
  if (!isOpen) return null

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modalContent}>
        <button style={styles.modalClose} onClick={onClose}>
          ×
        </button>
        <FiatRamp mode={mode} onClose={onClose} />
      </div>
    </div>
  )
}

export function FiatRampButton({ className, style }: { className?: string; style?: React.CSSProperties }) {
  const [isOpen, setIsOpen] = useState(false)
  const hasKeys = Boolean(process.env.NEXT_PUBLIC_MOONPAY_KEY || process.env.NEXT_PUBLIC_TRANSAK_KEY)

  if (!hasKeys) {
    return (
      <>
        <button className={className} style={style} onClick={() => setIsOpen(true)}>
          💰 Buy Crypto · soon
        </button>
        {isOpen && (
          <div style={styles.modalOverlay} onClick={() => setIsOpen(false)}>
            <div style={{ ...styles.modalContent, textAlign: "center" }} onClick={e => e.stopPropagation()}>
              <button style={styles.modalClose} onClick={() => setIsOpen(false)}>×</button>
              <div style={{ fontSize: 40, marginBottom: 12 }}>💰</div>
              <h3 style={styles.title}>Fiat Ramps · Coming Soon</h3>
              <p style={{ ...styles.description, marginTop: 8 }}>
                Buy crypto with credit card, bank transfer, or Apple Pay — coming soon to Supercompute.
              </p>
              <p style={{ fontSize: 11, color: "var(--muted)", marginTop: 16 }}>
                Powered by MoonPay + Transak. We'll let members know when it's live.
              </p>
            </div>
          </div>
        )}
      </>
    )
  }

  return (
    <>
      <button className={className} style={style} onClick={() => setIsOpen(true)}>
        💰 Buy Crypto
      </button>
      <FiatRampModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  )
}

const styles = {
  container: {
    padding: "16px",
  },
  card: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "12px",
    padding: "24px",
    maxWidth: "480px",
    margin: "0 auto",
  },
  header: {
    textAlign: "center" as const,
    marginBottom: "24px",
  },
  icon: {
    fontSize: "40px",
    marginBottom: "12px",
  },
  title: {
    fontSize: "18px",
    fontWeight: 700,
    color: "var(--text)",
    margin: "0 0 4px 0",
  },
  description: {
    fontSize: "13px",
    color: "var(--muted)",
    margin: 0,
  },
  amountSection: {
    marginBottom: "24px",
  },
  label: {
    display: "block",
    fontSize: "11px",
    fontWeight: 600,
    color: "var(--muted)",
    textTransform: "uppercase" as const,
    letterSpacing: "0.05em",
    marginBottom: "8px",
  },
  amountInput: {
    display: "flex",
    alignItems: "center",
    background: "var(--bg)",
    border: "1px solid var(--border)",
    borderRadius: "8px",
    padding: "12px 16px",
  },
  currency: {
    fontSize: "18px",
    fontWeight: 600,
    color: "var(--muted)",
    marginRight: "4px",
  },
  input: {
    flex: 1,
    background: "transparent",
    border: "none",
    outline: "none",
    fontSize: "18px",
    fontWeight: 600,
    color: "var(--text)",
    width: "100%",
  },
  quickAmounts: {
    display: "flex",
    gap: "6px",
    marginTop: "8px",
  },
  quickAmount: {
    flex: 1,
    padding: "6px",
    background: "var(--bg)",
    border: "1px solid var(--border)",
    borderRadius: "4px",
    fontSize: "12px",
    color: "var(--text)",
    cursor: "pointer",
    transition: "border-color 0.2s",
  },
  active: {
    borderColor: "var(--accent)",
    background: "var(--accent)",
    color: "#fff",
  },
  providers: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "8px",
    marginBottom: "16px",
  },
  provider: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 16px",
    background: "var(--bg)",
    border: "1px solid var(--border)",
    borderRadius: "8px",
    cursor: "pointer",
    textAlign: "left" as const,
    transition: "border-color 0.2s",
    width: "100%",
  },
  selected: {
    borderColor: "var(--accent)",
  },
  providerIcon: {
    fontSize: "24px",
  },
  providerInfo: {
    flex: 1,
    display: "flex",
    flexDirection: "column" as const,
  },
  providerName: {
    fontSize: "14px",
    fontWeight: 600,
    color: "var(--text)",
  },
  providerDesc: {
    fontSize: "11px",
    color: "var(--muted)",
  },
  coins: {
    fontSize: "10px",
    color: "var(--muted)",
    background: "var(--border)",
    padding: "2px 6px",
    borderRadius: "4px",
  },
  note: {
    textAlign: "center" as const,
  },
  noteText: {
    fontSize: "11px",
    color: "var(--muted)",
    margin: 0,
  },
  closeButton: {
    width: "100%",
    marginTop: "16px",
    padding: "10px",
    background: "transparent",
    border: "1px solid var(--border)",
    borderRadius: "6px",
    fontSize: "13px",
    color: "var(--muted)",
    cursor: "pointer",
  },
  modalOverlay: {
    position: "fixed" as const,
    inset: 0,
    background: "rgba(0, 0, 0, 0.7)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modalContent: {
    position: "relative" as const,
    background: "var(--surface)",
    borderRadius: "12px",
    padding: "24px",
    maxWidth: "480px",
    width: "90%",
    maxHeight: "90vh",
    overflowY: "auto" as const,
  },
  modalClose: {
    position: "absolute" as const,
    top: "12px",
    right: "12px",
    width: "28px",
    height: "28px",
    background: "var(--bg)",
    border: "1px solid var(--border)",
    borderRadius: "50%",
    fontSize: "18px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "var(--muted)",
  },
}