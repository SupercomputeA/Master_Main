import { useEffect, useState } from "react"
import Head from "next/head"
import Link from "next/link"
import PublicLayout from "../../components/PublicLayout"
import Footer from "../../components/Footer"

/* /investors/data-room — gated list of investor documents.
 * Requires users.role = 'investor' or 'admin'. The tier check happens both
 * client-side (here, for UX) and server-side (in /api/investors/data-room).
 * Treat this page as "show the lock; show the menu if unlocked." */

type DataRoomDoc = {
  id: string
  title: string
  filename: string
  blurb: string
  audience: string
  available: boolean
  url: string | null
  placeholder: boolean
}

type DataRoomResponse =
  | {
      ok: true
      tier: string
      wallet: string
      r2Configured: boolean
      docs: DataRoomDoc[]
      disclaimer: string
    }
  | { ok: false; error: string; hint?: string }

export default function InvestorsDataRoom() {
  const [session, setSession] = useState<string | null>(null)
  const [response, setResponse] = useState<DataRoomResponse | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return
    const s = window.localStorage.getItem("session")
    setSession(s)
  }, [])

  useEffect(() => {
    if (!session) return
    setLoading(true)
    fetch("/api/investors/data-room", {
      headers: { Authorization: `Bearer ${session}` },
      cache: "no-store",
    })
      .then((r) => r.json() as Promise<DataRoomResponse>)
      .then((d) => {
        setResponse(d)
        setLoading(false)
      })
      .catch(() => {
        setResponse({ ok: false, error: "network_error" })
        setLoading(false)
      })
  }, [session])

  const locked = !session || (response && response.ok === false)
  const isUnlocked = response?.ok === true

  return (
    <>
      <Head>
        <title>Supercompute · Investor Data Room</title>
        <meta name="description" content="Private investor documents — pitch deck, financial model, cap table, technical architecture, audit reports." />
        <meta name="robots" content="noindex, nofollow" />
        <link rel="canonical" href="https://supercompute.io/investors/data-room" />
      </Head>

      <PublicLayout title="SUPERCOMPUTE · Data Room" wide>
        <div className="landing">
          <section className="l-hero">
            <div className="l-eyebrow">
              <span><span className="gold">./investors/data-room</span> --private</span>
              <span className="l-caret" />
            </div>
            <h1 className="headline">Data Room</h1>
            <div className="subheader">Investor tier required</div>
            <p className="hero-copy">
              Pitch deck, financial model, cap table, technical architecture, and audit reports.
              Access is gated by wallet tier (<code>users.role = investor</code>). Not a current investor?
              Use the contact form on <Link href="/investors">/investors</Link>.
            </p>
          </section>
        </div>

        <div className="tpl-community">
          <section className="section">
            <div className="section-header">
              <div className="label">// access</div>
              <div>
                {!session && (
                  <div className="investor-locked">
                    <h3>Sign in required</h3>
                    <p>
                      Connect a wallet that has been granted the investor tier. The session is checked
                      against <code>/api/auth/profile</code>; the tier is enforced server-side.
                    </p>
                    <div className="investor-locked-actions">
                      <Link href="/auth" className="btn btn-primary">Sign in</Link>
                      <Link href="/investors#contact" className="btn btn-outline">Request access</Link>
                    </div>
                  </div>
                )}

                {session && loading && (
                  <p className="tradedesk-skel">Checking tier…</p>
                )}

                {session && response && response.ok === false && (
                  <div className="investor-locked">
                    <h3>Wrong tier</h3>
                    <p>
                      {response.hint ?? "Your wallet does not have investor access. If this is wrong, contact the team."}
                    </p>
                    <div className="investor-locked-actions">
                      <Link href="/auth" className="btn btn-outline">Switch wallet</Link>
                      <Link href="/investors#contact" className="btn btn-primary">Request access</Link>
                    </div>
                  </div>
                )}

                {isUnlocked && (
                  <>
                    <p className="tradedesk-card-meta">
                      Tier: <strong style={{ color: "var(--gold-warm)" }}>{response.tier}</strong> ·
                      Wallet: <code>{response.wallet.slice(0, 6)}…{response.wallet.slice(-4)}</code> ·
                      R2: {response.r2Configured ? "wired" : "not configured"}
                    </p>
                    <div className="investor-doc-list">
                      {response.docs.map((d) => (
                        <div key={d.id} className="investor-doc">
                          <h4>{d.title}</h4>
                          <span className="investor-doc-meta">audience: {d.audience}</span>
                          <p>{d.blurb}</p>
                          <div className="investor-doc-actions">
                            {d.available && d.url ? (
                              <a href={d.url} target="_blank" rel="noreferrer">Download</a>
                            ) : (
                              <a className="disabled" title="Document not yet uploaded — check back soon">
                                {d.placeholder ? "Awaiting upload" : "Unavailable"}
                              </a>
                            )}
                            {d.placeholder && (
                              <span className="investor-placeholder">[PLACEHOLDER]</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="tradedesk-card-warning" style={{ marginTop: 18 }}>
                      <strong>Confidential.</strong> {response.disclaimer}
                    </p>
                  </>
                )}

                {!locked && !isUnlocked && !loading && (
                  <p className="tradedesk-card-warning">
                    Could not load the data room. Refresh or email hello@supercompute.io if this persists.
                  </p>
                )}
              </div>
            </div>
          </section>

          <section className="section" style={{ borderBottom: "none" }}>
            <p style={{ textAlign: "center" }}>
              <Link href="/investors" className="btn btn-outline">← Back to /investors</Link>
            </p>
          </section>
        </div>

        <Footer />
      </PublicLayout>
    </>
  )
}