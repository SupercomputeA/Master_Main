import { useEffect, useState } from "react"
import Link from "next/link"
import Head from "next/head"
import PublicLayout from "../components/PublicLayout"
import Footer from "../components/Footer"
import { useAuth } from "../lib/auth"
import { getTier } from "../lib/tiers"
import type { SubscriberRow } from "../lib/tiers"

/* /dashboard — Member dashboard. Shows the user's subscriber row (real DB data),
   entitled surfaces, expiry, and quick links into the gated surfaces.
   - PublicLayout (not MemberLayout) so the funnel end-state is a public-facing
     dashboard, not nested behind /app. MemberLayout is for /app/* surfaces.
   - AuthGate-style: server-rendered lock panel until session confirmed. */

function formatDate(epochSeconds: number | null): string {
  if (!epochSeconds) return "—"
  return new Date(epochSeconds * 1000).toISOString().slice(0, 10)
}

function statusBadge(status: string, expired: boolean): { label: string; tone: "ok" | "warn" | "bad" } {
  if (status === "active" && !expired) return { label: "ACTIVE", tone: "ok" }
  if (status === "active" && expired) return { label: "EXPIRED", tone: "bad" }
  if (status === "pending") return { label: "PENDING · PAYMENT", tone: "warn" }
  if (status === "expired") return { label: "EXPIRED", tone: "bad" }
  if (status === "cancelled") return { label: "CANCELLED", tone: "warn" }
  return { label: status.toUpperCase(), tone: "warn" }
}

export default function Dashboard() {
  const { session, profile } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [subscriber, setSubscriber] = useState<SubscriberRow | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (!session) {
      setSubscriber(null)
      return
    }
    let cancelled = false
    setLoading(true)
    setError(null)
    fetch("/api/subscribers/me", { headers: { Authorization: `Bearer ${session}` } })
      .then(r => r.json() as Promise<{ subscriber: SubscriberRow | null }>)
      .then(data => {
        if (cancelled) return
        setSubscriber(data.subscriber || null)
        setLoading(false)
      })
      .catch(e => {
        if (cancelled) return
        setError(e instanceof Error ? e.message : String(e))
        setLoading(false)
      })
    return () => { cancelled = true }
  }, [session])

  const tier = subscriber ? getTier(subscriber.tier as any) : null
  const expired = subscriber?.expires_at ? subscriber.expires_at < Math.floor(Date.now() / 1000) : false
  const badge = subscriber ? statusBadge(subscriber.status, expired) : null

  return (
    <>
      <Head>
        <title>SUPERCOMPUTE · Dashboard</title>
      </Head>

      <PublicLayout title="SUPERCOMPUTE · Dashboard">
        <section className="hero" id="dashboard">
          <div className="hero-kicker">
            <div className="status-dot"></div>
            <span className="label">// dashboard</span>
          </div>
          <h1 className="display-xl hero-title">
            MEMBER<br /><em>DASHBOARD</em>
          </h1>
          <p className="hero-sub">
            Your subscription, entitled surfaces, and the on-ramps into every Supercompute module.
          </p>
        </section>

        {!mounted ? (
          <section className="section">
            <div className="dashboard-locked">// loading session…</div>
          </section>
        ) : !session ? (
          <section className="section">
            <div className="dashboard-locked">
              <div className="dashboard-locked-icon">🔒</div>
              <h2 className="display-md">Sign in to view your dashboard</h2>
              <p className="muted-text">
                Wallet-first auth. Connect on Base and we'll surface your subscription row.
              </p>
              <div style={{ marginTop: 24, display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
                <Link href="/auth" className="btn-connect">// SIGN IN</Link>
                <Link href="/subscribe" className="btn-connect" style={{ background: "transparent", color: "var(--gold-warm)" }}>
                  // NEW HERE? SUBSCRIBE →
                </Link>
              </div>
            </div>
          </section>
        ) : (
          <>
            {/* IDENTITY */}
            <section className="section">
              <div className="section-header">
                <div className="label">// identity</div>
                <div>
                  <h2 className="display-md">Account</h2>
                </div>
              </div>
              <div className="dashboard-grid">
                <div className="dashboard-cell">
                  <div className="dashboard-cell-label">Display Name</div>
                  <div className="dashboard-cell-value">{profile?.name ?? "—"}</div>
                </div>
                <div className="dashboard-cell">
                  <div className="dashboard-cell-label">Role</div>
                  <div className="dashboard-cell-value" style={{ color: "var(--gold-warm)" }}>
                    {profile?.role ?? "member"}
                  </div>
                </div>
                <div className="dashboard-cell">
                  <div className="dashboard-cell-label">Wallet</div>
                  <div className="dashboard-cell-value mono small">
                    {profile?.wallet_address || profile?.address || "0x—"}
                  </div>
                </div>
              </div>
            </section>

            {/* SUBSCRIPTION */}
            <section className="section">
              <div className="section-header">
                <div className="label">// subscription</div>
                <div>
                  <h2 className="display-md">Membership</h2>
                </div>
              </div>

              {loading ? (
                <div className="dashboard-locked">// loading subscription…</div>
              ) : error ? (
                <div className="dashboard-locked" style={{ color: "var(--danger, #E74C3C)" }}>
                  // error: {error}
                </div>
              ) : !subscriber ? (
                <div className="dashboard-locked">
                  <p className="muted-text">
                    No subscription row yet. Pick a tier to join.
                  </p>
                  <Link href="/subscribe" className="btn-connect" style={{ marginTop: 16 }}>
                    // SUBSCRIBE →
                  </Link>
                </div>
              ) : (
                <>
                  <div className="dashboard-grid">
                    <div className="dashboard-cell">
                      <div className="dashboard-cell-label">Tier</div>
                      <div className="dashboard-cell-value">
                        {tier?.name ?? subscriber.tier}
                        {tier?.priceLabel && (
                          <span style={{ fontSize: 11, color: "var(--mono-blue)", marginLeft: 8 }}>
                            {tier.priceLabel}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="dashboard-cell">
                      <div className="dashboard-cell-label">Status</div>
                      <div className={`dashboard-cell-value status-${badge?.tone}`}>
                        {badge?.label}
                      </div>
                    </div>
                    <div className="dashboard-cell">
                      <div className="dashboard-cell-label">Joined</div>
                      <div className="dashboard-cell-value mono">
                        {formatDate(subscriber.joined_at)}
                      </div>
                    </div>
                    <div className="dashboard-cell">
                      <div className="dashboard-cell-label">Expires</div>
                      <div className="dashboard-cell-value mono">
                        {subscriber.expires_at ? formatDate(subscriber.expires_at) : "—"}
                      </div>
                    </div>
                    <div className="dashboard-cell">
                      <div className="dashboard-cell-label">Source</div>
                      <div className="dashboard-cell-value mono">{subscriber.source ?? "web"}</div>
                    </div>
                    <div className="dashboard-cell">
                      <div className="dashboard-cell-label">Inference / day</div>
                      <div className="dashboard-cell-value mono">
                        {tier?.inferencePerDay === -1 ? "∞" : tier?.inferencePerDay ?? 0}
                      </div>
                    </div>
                  </div>

                  {/* ENTITLED SURFACES */}
                  {tier && (
                    <div style={{ marginTop: 32 }}>
                      <div className="label">// entitled surfaces</div>
                      <ul className="dashboard-surfaces">
                        {tier.surfaces.map((s, i) => (
                          <li key={i} className="dashboard-surface">
                            <span className="dashboard-surface-dot" />
                            <span className="dashboard-surface-label">{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {subscriber.status === "pending" && (
                    <div className="dashboard-note">
                      // Payment rails are PLACEHOLDER — your tier is recorded but not active.
                      Wire USDC/Base, ETH/Base, or TradeDesk stock-tokens to flip status to <code>active</code>.
                    </div>
                  )}

                  {expired && subscriber.status === "active" && (
                    <div className="dashboard-note">
                      // Subscription expired. Renew at <Link href="/subscribe">/subscribe</Link>.
                    </div>
                  )}
                </>
              )}
            </section>

            {/* QUICK LINKS */}
            <section className="section">
              <div className="section-header">
                <div className="label">// jump to</div>
                <div>
                  <h2 className="display-md">Surfaces</h2>
                </div>
              </div>
              <div className="dashboard-links">
                <Link className="dashboard-link" href="/publishing">NewsDesk →</Link>
                <Link className="dashboard-link" href="/knowledge-graph">Knowledge Graph →</Link>
                <Link className="dashboard-link" href="/school">Web3 School →</Link>
                <Link className="dashboard-link" href="/tradedesk">TradeDesk →</Link>
                <Link className="dashboard-link" href="/account">Account Profile →</Link>
                <Link className="dashboard-link" href="/app">Member Home →</Link>
              </div>
            </section>
          </>
        )}

        <Footer />
      </PublicLayout>
    </>
  )
}