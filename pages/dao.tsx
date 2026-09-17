import Link from "next/link"
import PublicLayout from "../components/PublicLayout"
import Footer from "../components/Footer"

/* DAO presence page — Commonwealth (Common) rail.
   Status is HONEST: profile live, community launching, domain + API pending.
   Governance feed renders live data once the API key lands (tRPC /api/v1). */

const PROFILE_URL = "https://common.xyz/profile/id/135539"

const TRACKS = [
  {
    id: "PROFILE",
    label: "Common profile",
    status: "LIVE",
    statusClass: "status-live",
    note: "common.xyz/profile/id/135539",
    url: PROFILE_URL,
  },
  {
    id: "COMMUNITY",
    label: "Community launch",
    status: "PENDING",
    statusClass: "status-pending",
    note: "Base 8453 · name Supercompute",
  },
  {
    id: "DOMAIN",
    label: "Custom domain",
    status: "PENDING",
    statusClass: "status-pending",
    note: "dao.supercompute.io",
  },
  {
    id: "API",
    label: "Governance feed",
    status: "PENDING",
    statusClass: "status-pending",
    note: "x-api-key requested",
  },
]

export default function Dao() {
  return (
    <PublicLayout title="SUPERCOMPUTE · DAO">
      <div className="landing">
        <section className="l-hero" style={{ paddingBottom: 32 }}>
          <span className="section-label">// commonwealth</span>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              color: "var(--gold-warm)",
              fontSize: "clamp(2rem, 5vw, 3.25rem)",
              margin: "8px 0 16px",
            }}
          >
            DAO
          </h1>
          <p
            style={{
              maxWidth: 640,
              color: "var(--muted)",
              fontFamily: "var(--font-mono)",
              fontSize: "0.875rem",
              lineHeight: 1.7,
            }}
          >
            SUPERCOMPUTE is a web3 company built to empower people to protect
            themselves from disaster capitalism and greed. We are here to
            realign with the earth and support ourselves while we do it.
            Non-custodial is a core value — we never hold your keys.
          </p>
          <p style={{ marginTop: 12, maxWidth: 640, color: "var(--muted)", fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>
            v1 · governance rail live on Common (Commonwealth)
          </p>
          <div style={{ marginTop: 24, display: "flex", gap: 16, flexWrap: "wrap" }}>
            <a
              href={PROFILE_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-block",
                border: "1px solid var(--gold-warm)",
                color: "var(--gold-warm)",
                fontFamily: "var(--font-mono)",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                padding: "8px 24px",
                textDecoration: "none",
              }}
            >
              Open on Common →
            </a>
          </div>
        </section>

        <section style={{ marginBottom: 48 }}>
          <span className="section-label">// launch status</span>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 20,
              marginTop: 16,
            }}
          >
            {TRACKS.map((t) => (
              <div key={t.id} className="card" style={{ background: "var(--bg-secondary, #111827)" }}>
                <div className="card-title">{t.id}</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.875rem", color: "var(--text-primary, #f0ebe0)" }}>
                  {t.label}
                </div>
                <div
                  style={{
                    marginTop: 8,
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.75rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color:
                      t.status === "LIVE"
                        ? "#4ADE80"
                        : "var(--gold-warm)",
                  }}
                >
                  {t.status}
                </div>
                <div style={{ marginTop: 8, fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--muted)" }}>
                  {t.url ? (
                    <a href={t.url} target="_blank" rel="noopener noreferrer" style={{ color: "var(--mono-blue)" }}>
                      {t.note}
                    </a>
                  ) : (
                    t.note
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section style={{ marginBottom: 48 }}>
          <span className="section-label">// governance feed</span>
          <div className="card" style={{ marginTop: 16, background: "var(--bg-secondary, #111827)" }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--muted)", lineHeight: 1.7 }}>
              Live polls, threads, and vote tallies from the Common community
              will render here via the Common tRPC API (/api/v1 · x-api-key).
              <br />
              <span style={{ color: "var(--gold-warm)" }}>FEED PENDING — API ACCESS REQUESTED 2026-08-11</span>
            </div>
          </div>
        </section>

        <section style={{ marginBottom: 48 }}>
          <span className="section-label">// treasury</span>
          <div className="card" style={{ marginTop: 16, background: "var(--bg-secondary, #111827)" }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--muted)", lineHeight: 1.7 }}>
              Treasury address and token allocation published after the
              community coin launch decision. Non-custodial: funds remain in
              the community treasury contract, never in our custody.
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </PublicLayout>
  )
}
