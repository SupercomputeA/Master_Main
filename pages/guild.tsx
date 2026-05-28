import Head from "next/head"
import { useGuildMemberships } from "@/lib/ens"
import { useAccount } from "wagmi"

const SUPERCOMPUTE_GUILD_ID = 12345

export default function GuildPage() {
  const { address, isConnected } = useAccount()
  const { data: guilds, isLoading } = useGuildMemberships()

  return (
    <>
      <Head>
        <title>Guild — Supercompute</title>
        <meta name="description" content="Join the Supercompute community on Guild.xyz" />
      </Head>
      <div style={{ padding: "24px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ marginBottom: 32 }}>
          <span className="label">// guild</span>
          <h1 style={{ fontSize: 32, fontWeight: 700, color: "var(--text)", margin: "8px 0" }}>
            Supercompute Guild
          </h1>
          <p style={{ color: "var(--muted)", fontSize: 14 }}>
            Token-gated community access via Guild.xyz
          </p>
        </div>

        {!isConnected ? (
          <div style={styles.connectPrompt}>
            <span style={styles.icon}>🔗</span>
            <h2 style={{ color: "var(--text)", margin: "0 0 8px 0" }}>Connect Your Wallet</h2>
            <p style={{ color: "var(--muted)", margin: 0 }}>
              Connect your wallet to check your guild membership and roles
            </p>
          </div>
        ) : isLoading ? (
          <div style={styles.loading}>Loading guild data...</div>
        ) : (
          <div style={styles.grid}>
            <div style={styles.card}>
              <h3 style={{ color: "var(--text)", margin: "0 0 8px 0" }}>Your Guilds</h3>
              {!guilds || guilds.length === 0 ? (
                <p style={{ color: "var(--muted)" }}>
                  You are not a member of any guilds yet.
                </p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {guilds.map((guild) => (
                    <div key={guild.id} style={styles.guildItem}>
                      <span style={{ color: "var(--text)", fontWeight: 600 }}>{guild.name}</span>
                      <a
                        href={`https://guild.xyz/${guild.urlName}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: "var(--accent)", fontSize: 12 }}
                      >
                        View →
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={styles.card}>
              <h3 style={{ color: "var(--text)", margin: "0 0 8px 0" }}>Join Supercompute Guild</h3>
              <p style={{ color: "var(--muted)", fontSize: 13, marginBottom: 16 }}>
                Access member-only content, participate in governance, and connect with the
                community.
              </p>
              <a
                href="https://guild.xyz/supercompute"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-block",
                  padding: "10px 20px",
                  background: "var(--accent)",
                  color: "#fff",
                  borderRadius: 6,
                  textDecoration: "none",
                  fontWeight: 600,
                  fontSize: 13,
                }}
              >
                Open Guild.xyz →
              </a>
            </div>

            <div style={styles.card}>
              <h3 style={{ color: "var(--text)", margin: "0 0 8px 0" }}>Guild Stats</h3>
              <div style={styles.stats}>
                <div style={styles.stat}>
                  <span style={styles.statValue}>{guilds?.length || 0}</span>
                  <span style={styles.statLabel}>Guilds</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

const styles = {
  connectPrompt: {
    textAlign: "center" as const,
    padding: "48px 24px",
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 8,
  },
  loading: {
    textAlign: "center" as const,
    padding: "48px 24px",
    color: "var(--muted)",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: 16,
  },
  card: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 8,
    padding: 20,
  },
  guildItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "8px 12px",
    background: "var(--bg)",
    borderRadius: 6,
  },
  stats: {
    display: "flex",
    gap: 24,
  },
  stat: {
    display: "flex",
    flexDirection: "column" as const,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 700,
    color: "var(--accent)",
  },
  statLabel: {
    fontSize: 11,
    color: "var(--muted)",
    textTransform: "uppercase" as const,
    letterSpacing: "0.1em",
  },
  icon: {
    fontSize: 48,
    display: "block",
    marginBottom: 16,
  },
}