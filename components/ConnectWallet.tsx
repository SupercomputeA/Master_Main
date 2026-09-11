"use client"

import { useEffect, useState } from "react"
import { useAuth } from "../lib/auth"
import { useUserProfile } from "../lib/useNeynar"
import { lookupAddress, shortenAddress, getWalletProfile } from "../lib/web3-utils"
import { formatAddress, resolveAvatar } from "../lib/ens"

export default function ConnectWallet() {
  const { profile, authing, connect, disconnect } = useAuth()
  const { user: neynarUser } = useUserProfile()
  const [mounted, setMounted] = useState(false)
  const [ensName, setEnsName] = useState<string | null>(null)
  const [tokenBalance, setTokenBalance] = useState<string | null>(null)
  const [avatar, setAvatar] = useState<string | null>(null)

  const walletAddress = profile?.address || profile?.wallet_address || (profile?.name?.startsWith("0x") ? profile.name : null)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (walletAddress) {
      getWalletProfile(walletAddress).then((p) => {
        setEnsName(p.ens)
        setTokenBalance(p.balance)
      }).catch(() => {})
      // Avatar is best-effort; don't block the UI.
      resolveAvatar(walletAddress).then((a) => setAvatar(a)).catch(() => {})
    } else {
      setEnsName(null)
      setTokenBalance(null)
      setAvatar(null)
    }
  }, [walletAddress])

  if (!mounted) {
    return <div className="btn-connect" style={{ opacity: 0.4 }}>// Connect</div>
  }

  if (authing) {
    return <div className="btn-connect" style={{ opacity: 0.5 }}>// Signing...</div>
  }

  if (profile) {
    // formatAddress prefers ensName, falls back to 0x1a82…323B,
    // so the project wallet always renders as supercompute.eth
    // (or the user's own ENS) once resolved.
    const displayName = formatAddress(walletAddress, ensName || profile.ensName)
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {avatar && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatar}
            alt="ENS avatar"
            width={48}
            height={48}
            style={{ borderRadius: 4, alignSelf: "center", border: "1px solid var(--border-accent)" }}
          />
        )}
        {ensName && (
          <div style={{
            fontFamily: "var(--font-mono)", fontSize: 8, color: "var(--teal)",
            textAlign: "center", letterSpacing: "0.1em", textTransform: "uppercase",
          }}>
            ● ENS resolved
          </div>
        )}
        {neynarUser && (
          <div style={{
            fontFamily: "var(--font-mono)", fontSize: 8, color: "var(--gold)",
            textAlign: "center", letterSpacing: "0.1em", textTransform: "uppercase",
          }}>
            ● {neynarUser.username}
          </div>
        )}
        <div style={{
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          color: "var(--accent)",
          padding: "10px 14px",
          border: "1px solid var(--border-accent)",
          textAlign: "center",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}>
          {displayName}
          {(ensName || profile.ensName) && walletAddress && (
            <div style={{ fontSize: 8, color: "var(--muted)", marginTop: 2 }}>
              {shortenAddress(walletAddress)}
            </div>
          )}
        </div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: "var(--muted)", textAlign: "center" }}>
          {profile.role === "admin" ? "● ADMIN" : "● MEMBER"}
        </div>

        {tokenBalance !== null && (
          <div style={{
            fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--gold-warm)",
            textAlign: "center", padding: "4px 10px", border: "1px solid var(--border)",
            marginTop: 4,
          }}>
            {tokenBalance} $QUANTA
          </div>
        )}

        <button
          onClick={disconnect}
          className="btn-connect"
          style={{ background: "transparent", color: "var(--muted)", borderColor: "var(--border)" }}
        >
          // Disconnect
        </button>
      </div>
    )
  }

  return (
    <button onClick={connect} className="btn-connect">
      // Connect
    </button>
  )
}
