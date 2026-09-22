import { useState, useEffect } from "react"
import { classifyFeedResponse } from "../lib/farcaster-feed"

export default function FarcasterFeed({ fid }: { fid?: string }) {
  const [casts, setCasts] = useState<any[] | null>(null)
  const [notice, setNotice] = useState("")

  useEffect(() => {
    if (!fid) return
    let cancelled = false

    // Exactly one request per page load — no polling, no retry loop
    // (card t_2b6083b9).
    ;(async () => {
      try {
        const r = await fetch(`/api/farcaster/casts?fid=${fid}&limit=5`)

        // The status is inspected BEFORE the body is trusted. An upstream
        // Neynar failure arrives as 401/429/5xx carrying {"message":"…"} — a
        // body with neither `casts` nor `error` — so reading the body alone
        // rendered a down rail as "No recent casts." on a public page. A
        // non-JSON body (edge error page) degrades on the status alone.
        let body: unknown = null
        try {
          body = await r.json()
        } catch {
          body = null
        }
        if (cancelled) return

        const outcome = classifyFeedResponse(r.status, body)
        if (outcome.kind === "casts") {
          setCasts(outcome.casts)
          setNotice("")
        } else {
          setNotice(outcome.message)
        }
      } catch (e) {
        if (cancelled) return
        const msg = e instanceof Error ? e.message : String(e)
        setNotice(`// rail unreachable — ${msg}`)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [fid])

  if (!fid) {
    return (
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "24px" }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--muted)" }}>
          // rail pending — set NEXT_PUBLIC_FARCASTER_FID to stream the protocol feed
        </div>
      </div>
    )
  }

  if (notice) {
    return (
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "24px" }}>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            color: "var(--muted)",
            lineHeight: 1.7,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {notice}
        </div>
      </div>
    )
  }

  if (!casts) {
    return (
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "24px" }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--muted)" }}>Loading feed...</div>
      </div>
    )
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 1, background: "var(--border)", border: "1px solid var(--border)" }}>
      {casts.length === 0 ? (
        // Reached ONLY from a successful response carrying `casts: []` — a
        // genuinely quiet account (classifyFeedResponse never routes a failure
        // here).
        <div style={{ background: "var(--bg)", padding: "24px", textAlign: "center", color: "var(--muted)", fontSize: 12 }}>
          No recent casts.
        </div>
      ) : (
        casts.map((cast: any, i: number) => (
          <div key={cast.hash || i} style={{ background: "var(--bg)", padding: "16px 20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {cast.author?.pfp_url && (
                  <img src={cast.author.pfp_url} alt="" style={{ width: 24, height: 24, borderRadius: "50%", objectFit: "cover" }} />
                )}
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--accent)" }}>
                  {cast.author?.display_name || cast.author?.username || "farcaster"}
                </span>
              </div>
              {cast.timestamp && (
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--muted)" }}>
                  {new Date(cast.timestamp).toLocaleDateString()}
                </span>
              )}
            </div>
            <p style={{ fontSize: 12, color: "var(--fg)", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
              {cast.text}
            </p>
            <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--muted)" }}>
                ♥ {cast.reactions?.likes_count || 0}
              </span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--muted)" }}>
                ↻ {cast.reactions?.recasts_count || 0}
              </span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--muted)" }}>
                💬 {cast.replies?.count || 0}
              </span>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
