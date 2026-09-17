import PublicLayout from "../components/PublicLayout"
import Footer from "../components/Footer"
import FarcasterFeed from "../components/FarcasterFeed"

/* Social — rail-ordered aggregation surface.
   Doctrine: censorship-resistant protocol rails FIRST, web2 mirrors SECOND.
   Web2 handles/API keys are reachable copies for distribution; the protocol
   rails are the source of truth. Unknown identifiers are [PLACEHOLDER] slots —
   nothing invented. Farcaster is wired live through /api/farcaster (Neynar
   proxy; the key stays server-side). */

const FARCASTER_FID = process.env.NEXT_PUBLIC_FARCASTER_FID || ""

const TIER_1 = [
  {
    id: "farcaster",
    name: "Farcaster",
    proto: "protocol · Farcaster / Snapchain",
    status: FARCASTER_FID ? "LIVE — feed wired" : "AWAITING FID",
    statusOk: Boolean(FARCASTER_FID),
    handle: "warpcast.com/supercompute",
    href: "https://warpcast.com/supercompute",
    why: "Signed messages on an open protocol — no platform owner can delete the account or the graph. The feed below reads straight from the protocol via our own server-side proxy.",
  },
  {
    id: "lens",
    name: "Lens",
    proto: "protocol · Lens",
    status: "LANE OPEN — handle pending",
    statusOk: false,
    handle: "[PLACEHOLDER: lens handle]",
    href: "https://lens.xyz",
    why: "Second protocol rail: portable identity and posts that travel with the wallet, not the app. Wired next once the handle is claimed.",
  },
  {
    id: "nostr",
    name: "Nostr",
    proto: "protocol · relay-based",
    status: "LANE OPEN — npub pending",
    statusOk: false,
    handle: "[PLACEHOLDER: npub]",
    href: "https://nostr.com",
    why: "Keypair-signed notes on relays we don't own. The most censorship-resistant rail in the stack: there is no company to shut off — only relays to read from.",
  },
]

const TIER_2 = [
  {
    id: "x",
    name: "X",
    handle: "@supercompute_io",
    href: "https://x.com/supercompute_io",
    note: "Mirror for reach — announcements reposted for the timeline crowd.",
  },
  {
    id: "youtube",
    name: "YouTube",
    handle: "[PLACEHOLDER: channel]",
    href: "",
    note: "Mirror for long-form. Livestream landing page already exists at /social/livestreaming.",
  },
  {
    id: "web2-note",
    name: "NewsDesk",
    handle: "supercompute.newsdesk.app",
    href: "https://supercompute.newsdesk.app",
    note: "Our own publishing surface — not a rented platform. Articles syndicate out to the mirrors above.",
  },
]

const IDENTITY = [
  { rail: "ENS", value: "supercompute.eth", state: "LIVE" },
  { rail: "Wallet", value: "0x1a828cd220559479e2f761805da4ee722683323B", state: "LIVE" },
  { rail: "Farcaster", value: "supercompute", state: FARCASTER_FID ? "WIRED" : "FID PENDING" },
  { rail: "X", value: "@supercompute_io", state: "LIVE" },
  { rail: "Lens", value: "[PLACEHOLDER]", state: "OPEN" },
  { rail: "Nostr", value: "[PLACEHOLDER: npub]", state: "OPEN" },
]

const cardStyle = {
  background: "var(--bg)",
  padding: "22px 24px",
  display: "flex",
  flexDirection: "column",
} as const

export default function Social() {
  return (
    <PublicLayout title="SUPERCOMPUTE · Social">
      {/* ============ HERO ============ */}
      <section className="hero" id="social">
        <div className="hero-kicker">
          <div className="status-dot"></div>
          <span className="label" style={{ color: "var(--accent)" }}>// social · rail-ordered</span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--accent)", border: "1px solid var(--accent-dim)", padding: "2px 8px", marginLeft: 8 }}>
            PROTOCOL RAILS FIRST
          </span>
        </div>
        <h1 className="display-xl hero-title" style={{ fontSize: "clamp(44px, 9vw, 110px)", lineHeight: 0.85, marginBottom: 24 }}>
          SOCIAL<em style={{ color: "var(--accent)" }}> RAILS</em>
        </h1>
        <p className="hero-sub" style={{ maxWidth: 660, fontSize: 14, color: "var(--fg)" }}>
          <strong>Every rail we publish on, ordered by how hard it is to silence.</strong>{" "}
          Protocol rails first — Farcaster, Lens, Nostr — where identity is a keypair and the
          graph lives on open infrastructure. Web2 mirrors second: copies for reach, never the
          source of truth. One platform going away does not take the record with it.
        </p>
      </section>

      {/* ============ PRIORITY ORDER ============ */}
      <section className="section" id="priority">
        <div className="section-header">
          <div className="label" style={{ color: "var(--accent)" }}>// rail doctrine</div>
          <div><h2 className="display-md">Censorship-resistant first, reach second</h2></div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 1, background: "var(--border)", border: "1px solid var(--border)", marginBottom: 28 }}>
          <div style={cardStyle}>
            <div className="label-sm" style={{ color: "var(--accent)", marginBottom: 10 }}>// 01 — protocol rails</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, color: "var(--accent)", marginBottom: 8 }}>
              OWNED BY KEYS, NOT COMPANIES
            </div>
            <p style={{ fontSize: 12, color: "var(--fg)", lineHeight: 1.75, margin: 0 }}>
              Publishing, identity, and the follow graph live on open protocols. The fleet reads
              and writes through our own infrastructure — a server-side proxy we control, not an
              app we rent. This tier is where the real record is kept.
            </p>
          </div>
          <div style={cardStyle}>
            <div className="label-sm" style={{ color: "var(--accent)", marginBottom: 10 }}>// 02 — web2 mirrors</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, color: "var(--cream)", marginBottom: 8 }}>
              REACH WITHOUT DEPENDENCE
            </div>
            <p style={{ fontSize: 12, color: "var(--fg)", lineHeight: 1.75, margin: 0 }}>
              X, YouTube, and friends get mirrored copies for distribution. Useful for reach,
              never load-bearing. If a mirror disappears, the protocol rails still hold the
              canonical thread — that ordering is the whole point.
            </p>
          </div>
        </div>
      </section>

      {/* ============ TIER 1 ============ */}
      <section className="section" id="protocol-rails">
        <div className="section-header">
          <div className="label" style={{ color: "var(--accent)" }}>// tier 01 · protocol rails</div>
          <div><h2 className="display-md">Censorship-resistant rails</h2></div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 1, background: "var(--border)", border: "1px solid var(--border)", marginBottom: 20 }}>
          {TIER_1.map((r) => (
            <div key={r.id} style={cardStyle}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div className="label-sm" style={{ color: "var(--accent)" }}>// {r.id}</div>
                <span style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 8,
                  letterSpacing: "0.1em",
                  padding: "2px 6px",
                  border: `1px solid ${r.statusOk ? "var(--accent)" : "var(--border)"}`,
                  color: r.statusOk ? "var(--accent)" : "var(--muted)",
                }}>
                  {r.status}
                </span>
              </div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, textTransform: "uppercase", color: "var(--cream)", marginBottom: 4 }}>
                {r.name}
              </div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--muted)", marginBottom: 12, letterSpacing: "0.08em" }}>
                {r.proto}
              </div>
              <p style={{ fontSize: 12, color: "var(--fg)", lineHeight: 1.75, flex: 1, marginBottom: 14 }}>{r.why}</p>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border)", paddingTop: 12 }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--fg)" }}>{r.handle}</span>
                <a href={r.href} target="_blank" rel="noreferrer" style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--accent)", textDecoration: "none" }}>
                  follow →
                </a>
              </div>
            </div>
          ))}
        </div>

        {!FARCASTER_FID && (
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderLeft: "2px solid var(--accent)", padding: "16px 20px", marginBottom: 20 }}>
            <p style={{ fontSize: 12, color: "var(--fg)", lineHeight: 1.7, margin: 0 }}>
              <strong>[PLACEHOLDER: NEXT_PUBLIC_FARCASTER_FID]</strong> — the live Farcaster feed
              below activates as soon as the project FID is set (env) and{" "}
              <strong>NEYNAR_API_KEY</strong> is provisioned in Cloudflare. The proxy route is
              already wired; nothing else to build.
            </p>
          </div>
        )}

        <div className="label-sm" style={{ color: "var(--muted)", marginBottom: 10 }}>// live feed · farcaster (via our /api/farcaster proxy)</div>
        <FarcasterFeed fid={FARCASTER_FID} />
      </section>

      {/* ============ TIER 2 ============ */}
      <section className="section" id="mirrors">
        <div className="section-header">
          <div className="label" style={{ color: "var(--accent)" }}>// tier 02 · web2 mirrors</div>
          <div><h2 className="display-md">Reach mirrors</h2></div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 1, background: "var(--border)", border: "1px solid var(--border)", marginBottom: 20 }}>
          {TIER_2.map((m) => (
            <div key={m.id} style={cardStyle}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, textTransform: "uppercase", color: "var(--cream)" }}>{m.name}</div>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: "0.1em", padding: "2px 6px", border: "1px solid var(--border)", color: "var(--muted)" }}>
                  MIRROR
                </span>
              </div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: m.href ? "var(--fg)" : "var(--muted)", marginBottom: 10 }}>
                {m.href ? (
                  <a href={m.href} target="_blank" rel="noreferrer" style={{ color: "var(--accent)", textDecoration: "none" }}>{m.handle}</a>
                ) : (
                  m.handle
                )}
              </div>
              <p style={{ fontSize: 12, color: "var(--fg)", lineHeight: 1.75, margin: 0 }}>{m.note}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ============ IDENTITY SHEET ============ */}
      <section className="section" id="identity">
        <div className="section-header">
          <div className="label" style={{ color: "var(--accent)" }}>// identity sheet</div>
          <div><h2 className="display-md">One identity, many rails</h2></div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 1, background: "var(--border)", border: "1px solid var(--border)" }}>
          {IDENTITY.map((row) => (
            <div key={row.rail} style={{ background: "var(--bg)", padding: "12px 20px", display: "grid", gridTemplateColumns: "140px 1fr 120px", gap: 12, alignItems: "center" }}>
              <div className="label-sm" style={{ color: "var(--muted)" }}>{row.rail}</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--fg)", overflowWrap: "anywhere" }}>{row.value}</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.1em", color: row.state === "LIVE" || row.state === "WIRED" ? "var(--accent)" : "var(--muted)", textAlign: "right" }}>
                {row.state}
              </div>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.7, marginTop: 16, maxWidth: 760 }}>
          ENS is the anchor: every rail above should resolve back to{" "}
          <span style={{ fontFamily: "var(--font-mono)", color: "var(--fg)" }}>supercompute.eth</span> — that is
          what makes the identity portable across protocols instead of platform-dependent.
        </p>
      </section>

      <Footer />
    </PublicLayout>
  )
}
