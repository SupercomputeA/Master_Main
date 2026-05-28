import { useState, useEffect } from "react"

export default function FarcasterFeed({ fid }: { fid?: string }) {
  const [casts, setCasts] = useState<any[] | null>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!fid) return
    fetch(`/api/farcaster/casts?fid=${fid}&limit=5`)
      .then(r => r.json())
      .then((d: any) => {
        if (d.casts) setCasts(d.casts)
        else if (d.error) setError(d.error)
        else setCasts([])
      })
      .catch(e => setError(e.message))
  }, [fid])

  if (!fid) {
    return (
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "24px" }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--muted)" }}>
          Set FID to display live Farcaster feed.
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "24px" }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--muted)" }}>
          Feed unavailable: {error}
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
