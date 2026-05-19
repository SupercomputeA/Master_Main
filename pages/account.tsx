import Layout from "../components/Layout"
import Footer from "../components/Footer"
import { useAuth } from "../lib/auth"

const modules = [
  { id: "M1", title: "Blockchain Fundamentals", progress: 100, credential: "NFT #001" },
  { id: "M2", title: "Smart Contracts 101", progress: 100, credential: "NFT #002" },
  { id: "M3", title: "DeFi Architecture", progress: 100, credential: "NFT #003" },
  { id: "M4", title: "Web3 Identity & Auth", progress: 100, credential: "NFT #004" },
  { id: "M5", title: "Autonomous Agents", progress: 70, credential: null },
  { id: "M6", title: "Treasury Management", progress: 0, credential: null },
  { id: "M7", title: "Token Engineering", progress: 0, credential: null },
]

const comments = [
  { date: "2026-05-18", author: "0xmone.eth", text: "Great breakdown of the agent economics thesis. The fleet approach makes sense for scaling ops without overhead.", replies: 3 },
  { date: "2026-05-16", author: "defi_maxi.eth", text: "When is the TradeDesk beta opening to stakers? Got 5k SCOM ready to deploy.", replies: 1 },
  { date: "2026-05-14", author: "base_builder.eth", text: "The School module on autonomous agents is exactly what I needed. Clear, practical, with real code examples.", replies: 0 },
  { date: "2026-05-12", author: "anon_ops.eth", text: "Deployed the Base Agent config from StoreFront. Had it running in 20 minutes. Documentation is solid.", replies: 2 },
]

const activityLog = [
  { date: "2026-05-18", action: "Staked 500 $SCOM — 90d lock" },
  { date: "2026-05-15", action: "Completed Module 4 · Solidity Intermediate" },
  { date: "2026-05-12", action: "Voted on Proposal SCP-042" },
  { date: "2026-05-10", action: "Published article: \"Agent Economics\"" },
  { date: "2026-05-08", action: "Minted Genesis Fleet Badge" },
]

export default function Account() {
  const { session, profile, devMode } = useAuth()

  return (
    <Layout title="SUPERCOMPUTE · Profile">
      <section className="hero" id="account">
        <div className="hero-kicker">
          <div className="status-dot"></div>
          <span className="label">// account</span>
        </div>
        <h1 className="display-xl hero-title">
          {profile ? profile.name.toUpperCase() : "CONNECTED"}<br /><em>PROFILE</em>
        </h1>
        <p className="hero-sub">
          Your on-chain identity, activity, and membership across the Supercompute ecosystem.
        </p>
      </section>

      {session ? (
        <>
          <section className="section">
            <div className="section-header">
              <div className="label">// identity</div>
              <div>
                <h2 className="display-md">Account Details</h2>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 1, background: "var(--border)", border: "1px solid var(--border)" }}>
              <div style={{ background: "var(--bg)", padding: "14px 20px", display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 12, color: "var(--muted)" }}>Display Name</span>
                <span style={{ fontSize: 13, color: "var(--fg)" }}>{profile?.name ?? "—"}</span>
              </div>
              <div style={{ background: "var(--bg)", padding: "14px 20px", display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 12, color: "var(--muted)" }}>Role</span>
                <span style={{ fontSize: 13, color: "var(--accent)", textTransform: "capitalize" }}>{profile?.role ?? "member"}</span>
              </div>
              <div style={{ background: "var(--bg)", padding: "14px 20px", display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 12, color: "var(--muted)" }}>Wallet</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--muted)" }}>
                  {session?.startsWith("dev_") ? "0xDev...0000" : "0x742d...f44e"}
                </span>
              </div>
              <div style={{ background: "var(--bg)", padding: "14px 20px", display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 12, color: "var(--muted)" }}>Joined</span>
                <span style={{ fontSize: 13, color: "var(--fg)" }}>March 2024</span>
              </div>
              <div style={{ background: "var(--bg)", padding: "14px 20px", display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 12, color: "var(--muted)" }}>$SCOM Balance</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--accent)" }}>2,450 SCOM</span>
              </div>
              <div style={{ background: "var(--bg)", padding: "14px 20px", display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 12, color: "var(--muted)" }}>Staked</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--accent)" }}>1,200 SCOM (90d lock)</span>
              </div>
              <div style={{ background: "var(--bg)", padding: "14px 20px", display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 12, color: "var(--muted)" }}>Total Staking Rewards</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--accent)" }}>48.5 SCOM</span>
              </div>
              <div style={{ background: "var(--bg)", padding: "14px 20px", display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 12, color: "var(--muted)" }}>NFTs Held</span>
                <span style={{ fontSize: 13, color: "var(--fg)" }}>4 credentials · 1 badge</span>
              </div>
              {devMode && (
                <div style={{ background: "var(--bg)", padding: "14px 20px", display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 12, color: "#888" }}>Session</span>
                  <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "#888", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis" }}>{session.slice(0, 20)}…</span>
                </div>
              )}
            </div>
          </section>

          <section className="section">
            <div className="section-header">
              <div className="label">// school</div>
              <div>
                <h2 className="display-md">Class Progression</h2>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 1, background: "var(--border)", border: "1px solid var(--border)" }}>
              {modules.map((m) => (
                <div key={m.id} style={{ background: "var(--bg)", padding: "14px 20px", display: "grid", gridTemplateColumns: "40px 1fr 60px 80px", gap: 12, alignItems: "center" }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--accent)" }}>{m.id}</span>
                  <span style={{ fontSize: 13 }}>{m.title}</span>
                  <div style={{ height: 4, background: "var(--border)", borderRadius: 2, overflow: "hidden" }}>
                    <div style={{ width: `${m.progress}%`, height: "100%", background: m.progress === 100 ? "var(--accent)" : "#555", borderRadius: 2 }}></div>
                  </div>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, textAlign: "right", color: m.credential ? "var(--accent)" : "#555" }}>
                    {m.credential ?? "—"}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="section">
            <div className="section-header">
              <div className="label">// activity</div>
              <div>
                <h2 className="display-md">Recent Activity</h2>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 1, background: "var(--border)", border: "1px solid var(--border)" }}>
              {activityLog.map((a, i) => (
                <div key={i} style={{ background: "var(--bg)", padding: "14px 20px", display: "grid", gridTemplateColumns: "100px 1fr", gap: 12 }}>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--muted)", paddingTop: 1 }}>{a.date}</div>
                  <div style={{ fontSize: 13 }}>{a.action}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="section">
            <div className="section-header">
              <div className="label">// comments</div>
              <div>
                <h2 className="display-md">Discussion Feed</h2>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 1, background: "var(--border)", border: "1px solid var(--border)" }}>
              {comments.map((c, i) => (
                <div key={i} style={{ background: "var(--bg)", padding: "16px 20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--accent)" }}>{c.author}</span>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--muted)" }}>{c.date}</span>
                  </div>
                  <p style={{ fontSize: 12, color: "var(--fg)", lineHeight: 1.6, marginBottom: 6 }}>{c.text}</p>
                  <div style={{ display: "flex", gap: 16 }}>
                    <button className="btn-connect" style={{ fontSize: 9, padding: "2px 10px", background: "transparent", color: "var(--muted)", borderColor: "var(--border)" }}>
                      Reply ({c.replies})
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      ) : (
        <section className="section">
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "60px 24px", textAlign: "center", color: "var(--muted)", fontSize: 13 }}>
            Connect your wallet and sign in to view your profile.
          </div>
        </section>
      )}

      <Footer />
    </Layout>
  )
}
