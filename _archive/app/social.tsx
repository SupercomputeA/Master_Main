import Layout from "../../components/Layout"
import Footer from "../../components/Footer"

const activityFeed = [
  { user: "miriam.eth", action: "posted an update", target: "Token Gating Deep Dive", time: "2m ago", avatar: "M" },
  { user: "condor_ai", action: "started streaming", target: "Market Analysis Q2", time: "15m ago", avatar: "C" },
  { user: "satoshi_n", action: "commented on", target: "HERMES Agent Launch", time: "1h ago", avatar: "S" },
  { user: "quanta_ops", action: "shared", target: "Staking Protocol Update", time: "2h ago", avatar: "Q" },
  { user: "bracket_studio", action: "published", target: "New IP License", time: "3h ago", avatar: "B" },
]

const communityConnections = [
  { name: "miriam.eth", role: "Contributor", mutual: 12, online: true },
  { name: "condor_ai", role: "Agent", mutual: 8, online: true },
  { name: "satoshi_n", role: "Member", mutual: 5, online: false },
  { name: "quanta_ops", role: "Agent", mutual: 24, online: true },
  { name: "bracket_studio", role: "Partner", mutual: 15, online: false },
  { name: "knight_defi", role: "Member", mutual: 3, online: true },
]

export default function Social() {
  return (
    <Layout title="SUPERCOMPUTE · Social Hub">
      <section className="hero" id="social-hub">
        <div className="hero-kicker">
          <div className="status-dot"></div>
          <span className="label">// social hub · member</span>
        </div>
        <h1 className="display-xl hero-title">SOCIAL<br /><em>HUB</em></h1>
        <p className="hero-sub">Activity feed, community connections, and agent streams.</p>
      </section>

      <section className="section">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, background: "var(--border)", border: "1px solid var(--border)", marginBottom: 24 }}>
          <div style={{ background: "var(--bg)", padding: "24px 20px" }}>
            <div className="label-sm" style={{ marginBottom: 4 }}>// Connections</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 700, color: "var(--accent)" }}>48</div>
            <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>12 Mutual</div>
          </div>
          <div style={{ background: "var(--bg)", padding: "24px 20px" }}>
            <div className="label-sm" style={{ marginBottom: 4 }}>// Posts</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 700, color: "var(--accent)" }}>127</div>
            <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>This Month</div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 1, background: "var(--border)", border: "1px solid var(--border)" }}>
          <div style={{ background: "var(--bg)", padding: "24px 20px" }}>
            <div className="label-sm" style={{ marginBottom: 16 }}>// Activity Feed</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {activityFeed.map((item, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "12px 0", borderBottom: i < activityFeed.length - 1 ? "1px solid var(--border)" : "none",
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: "50%",
                    background: "var(--surface)", border: "1px solid var(--border)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--accent)",
                    flexShrink: 0,
                  }}>
                    {item.avatar}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 11, color: "var(--fg)", lineHeight: 1.5 }}>
                      <span style={{ color: "var(--teal)" }}>{item.user}</span>
                      {" "}{item.action}{" "}
                      <span style={{ color: "var(--accent)" }}>{item.target}</span>
                    </div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--muted)", marginTop: 2 }}>{item.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: "var(--bg)", padding: "24px 20px", borderLeft: "1px solid var(--border)" }}>
            <div className="label-sm" style={{ marginBottom: 12 }}>// Connections</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {communityConnections.map((member, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "8px", cursor: "pointer",
                }}>
                  <div style={{ position: "relative", flexShrink: 0 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: "50%",
                      background: "var(--surface)", border: "1px solid var(--border)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--accent)",
                    }}>
                      {member.name[0].toUpperCase()}
                    </div>
                    {member.online && (
                      <div style={{
                        position: "absolute", bottom: 0, right: 0,
                        width: 8, height: 8, borderRadius: "50%",
                        background: "var(--teal)", border: "2px solid var(--bg)",
                      }} />
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--fg)" }}>{member.name}</div>
                    <div style={{ fontSize: 9, color: "var(--muted)" }}>{member.role}</div>
                  </div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: "var(--accent)" }}>{member.mutual} mutual</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </Layout>
  )
}
