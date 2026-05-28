"use client"

import { useGuildMemberships, useGuildMember, useGuildRoles } from "@/lib/ens"
import { useAccount } from "wagmi"
import { base } from "wagmi/chains"

interface GuildAccessPanelProps {
  guildId: number
  requiredRoles?: number[]
  gatedContent: React.ReactNode
  fallbackContent?: React.ReactNode
}

function GuildRoleBadge({ roleId }: { roleId: number }) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 8px",
        background: "var(--pink)",
        color: "#fff",
        borderRadius: "4px",
        fontSize: "10px",
        fontWeight: 700,
        textTransform: "uppercase",
      }}
    >
      Role #{roleId}
    </span>
  )
}

export function GuildAccessPanel({
  guildId,
  requiredRoles = [],
  gatedContent,
  fallbackContent,
}: GuildAccessPanelProps) {
  const { address, isConnected } = useAccount()
  const { data: member, isLoading: memberLoading } = useGuildMember(guildId)
  const { data: roles, isLoading: rolesLoading } = useGuildRoles(guildId)

  if (!isConnected) {
    return (
      <div style={styles.container}>
        <div style={styles.locked}>
          <span style={styles.lockIcon}>🔒</span>
          <p style={styles.message}>Connect wallet to verify guild membership</p>
        </div>
      </div>
    )
  }

  if (memberLoading || rolesLoading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Verifying membership...</div>
      </div>
    )
  }

  if (!member) {
    return (
      <div style={styles.container}>
        {fallbackContent ??
          <div style={styles.locked}>
            <span style={styles.lockIcon}>🔒</span>
            <p style={styles.message}>Join the Supercompute guild to access</p>
            <a
              href="https://guild.xyz/supercompute"
              target="_blank"
              rel="noopener noreferrer"
              style={styles.link}
            >
              Join Guild.xyz →
            </a>
          </div>}
      </div>
    )
  }

  const hasAccess = requiredRoles.length === 0 || requiredRoles.some((r) => roles?.includes(r))

  if (!hasAccess) {
    return (
      <div style={styles.container}>
        {fallbackContent ??
          <div style={styles.locked}>
            <span style={styles.lockIcon}>🔒</span>
            <p style={styles.message}>You need specific roles to access this content</p>
            <div style={styles.roles}>
              {requiredRoles.map((r) => (
                <GuildRoleBadge key={r} roleId={r} />
              ))}
            </div>
          </div>}
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.granted}>
        <span style={styles.checkIcon}>✓</span>
        <p style={styles.message}>Guild member access granted</p>
        {roles && roles.length > 0 && (
          <div style={styles.roles}>
            {roles.map((r) => (
              <GuildRoleBadge key={r} roleId={r} />
            ))}
          </div>
        )}
      </div>
      {gatedContent}
    </div>
  )
}

export function GuildMembershipBadge() {
  const { address, isConnected } = useAccount()
  const { data: guilds, isLoading } = useGuildMemberships()

  if (!isConnected) return null

  if (isLoading) {
    return <span style={styles.badge}>Loading...</span>
  }

  if (!guilds || guilds.length === 0) return null

  return (
    <span style={styles.badge}>
      🛡️ {guilds.length} Guild{guilds.length > 1 ? "s" : ""}
    </span>
  )
}

export function GuildGateIndicator({ guildId }: { guildId: number }) {
  const { address, isConnected } = useAccount()
  const { data: member } = useGuildMember(guildId)

  if (!isConnected) return <span style={styles.indicator}>⚪</span>
  if (!member) return <span style={styles.indicator}>⚪</span>

  return <span style={styles.indicator}>🟢</span>
}

const styles = {
  container: {
    padding: "16px",
    borderRadius: "8px",
    border: "1px solid var(--border)",
    background: "var(--surface)",
  },
  locked: {
    textAlign: "center" as const,
    padding: "24px",
  },
  granted: {
    textAlign: "center" as const,
    padding: "12px",
    marginBottom: "12px",
  },
  loading: {
    textAlign: "center" as const,
    color: "var(--muted)",
    padding: "24px",
  },
  lockIcon: {
    fontSize: "32px",
    display: "block",
    marginBottom: "8px",
  },
  checkIcon: {
    fontSize: "24px",
    display: "block",
    marginBottom: "4px",
    color: "var(--green)",
  },
  message: {
    color: "var(--text)",
    margin: "0 0 12px 0",
    fontSize: "14px",
  },
  link: {
    color: "var(--accent)",
    textDecoration: "none",
    fontSize: "13px",
    fontWeight: 600,
  },
  roles: {
    display: "flex",
    gap: "6px",
    justifyContent: "center",
    flexWrap: "wrap" as const,
    marginTop: "8px",
  },
  badge: {
    fontSize: "10px",
    padding: "2px 6px",
    background: "var(--border)",
    borderRadius: "4px",
    color: "var(--text)",
  },
  indicator: {
    fontSize: "10px",
  },
}