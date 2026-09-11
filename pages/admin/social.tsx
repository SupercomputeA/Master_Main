import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import MemberLayout from "../../components/MemberLayout"
import { useAuth } from "../../lib/auth"

/* Admin — Social Command Center.
   Ops room for every Supercompute rail: Warpcast/Farcaster, Lens, Nostr,
   Bluesky (protocols) + X, TikTok, Substack, YouTube (mirrors).
   Real queue reads/writes against /api/social/* (D1-backed, admin-gated).
   Nothing is ever reported as posted unless an adapter actually posted —
   credential-less adapters return dry-run with the reason. */

type Account = {
  id: string
  platform: string
  tier: string
  handle: string | null
  adapter: string
  status: string
  env_status: string
  env_mode: string
  last_post_at: number | null
}

type QueueItem = {
  id: string
  body: string
  platforms: string
  status: string
  scheduled_at: number | null
  posted_at: number | null
  results: string | null
  created_at: number
}

const CRED_SHEET = [
  { platform: "Warpcast / Farcaster", env: "NEYNAR_API_KEY + NEYNAR_SIGNER_UUID + NEXT_PUBLIC_FARCASTER_FID", note: "read via proxy, write via signer" },
  { platform: "Bluesky", env: "BLUESKY_HANDLE + BLUESKY_APP_PASSWORD", note: "app password, not account password" },
  { platform: "X / Twitter", env: "X_API_KEY + X_API_SECRET + X_ACCESS_TOKEN + X_ACCESS_SECRET", note: "OAuth 1.0a user context" },
  { platform: "TikTok", env: "TIKTOK_ACCESS_TOKEN", note: "status-only in v1" },
  { platform: "YouTube", env: "YOUTUBE_API_KEY", note: "uploads need OAuth later" },
  { platform: "Lens", env: "[PLACEHOLDER: LENS_API_KEY + handle]", note: "lane open" },
  { platform: "Nostr", env: "NOSTR_NSEC", note: "relay writes" },
  { platform: "Substack", env: "—", note: "no public write API: export + manual publish" },
]

function statusColor(status: string): string {
  if (status === "connected") return "var(--accent)"
  if (status === "manual") return "var(--mono-blue)"
  return "var(--hud-yellow)"
}

export default function AdminSocial() {
  const { session, isAdmin } = useAuth()
  const [accounts, setAccounts] = useState<Account[]>([])
  const [queue, setQueue] = useState<QueueItem[]>([])
  const [body, setBody] = useState("")
  const [selected, setSelected] = useState<string[]>(["farcaster"])
  const [scheduledAt, setScheduledAt] = useState("")
  const [msg, setMsg] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [counts, setCounts] = useState<{ status: string; n: number }[]>([])

  const api = useCallback(
    async (path: string, init?: RequestInit): Promise<any> => {
      const res = await fetch(`/api/social${path}`, {
        ...init,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session ?? ""}`,
          ...(init?.headers || {}),
        },
      })
      if (!res.ok) {
        const detail: any = await res.json().catch(() => ({}))
        throw new Error(detail?.error || `request failed (${res.status})`)
      }
      return res.json()
    },
    [session]
  )

  const load = useCallback(async () => {
    if (!session || !isAdmin) return
    try {
      const [a, q, h] = await Promise.all([api("/accounts"), api("/queue"), api("/health")])
      setAccounts(a.accounts || [])
      setQueue(q.queue || [])
      setCounts(h.queue_counts || [])
    } catch (e) {
      setMsg(`// ${e instanceof Error ? e.message : String(e)}`)
    }
  }, [api, session, isAdmin])

  useEffect(() => { load() }, [load])

  async function queueItem(dryRun: boolean) {
    if (!body.trim() || selected.length === 0) {
      setMsg("// need post text + at least one platform")
      return
    }
    setBusy(true)
    setMsg(null)
    try {
      const payload: Record<string, unknown> = { body: body.trim(), platforms: selected }
      if (scheduledAt) payload.scheduled_at = Math.floor(new Date(scheduledAt).getTime() / 1000)
      const created = await api("/queue", { method: "POST", body: JSON.stringify(payload) })
      if (dryRun && created?.item?.id) {
        const res = await api("/publish", { method: "POST", body: JSON.stringify({ id: created.item.id }) })
        setMsg(`// queued ${created.item.id} — dispatch: ${res.status}`)
      } else {
        setMsg(`// queued ${created?.item?.id || "item"}`)
      }
      setBody("")
      setScheduledAt("")
      load()
    } catch (e) {
      setMsg(`// ${e instanceof Error ? e.message : String(e)}`)
    }
    setBusy(false)
  }

  async function dispatchItem(id: string) {
    setBusy(true)
    try {
      const res = await api("/publish", { method: "POST", body: JSON.stringify({ id }) })
      setMsg(`// ${id} → ${res.status}`)
      load()
    } catch (e) {
      setMsg(`// ${e instanceof Error ? e.message : String(e)}`)
    }
    setBusy(false)
  }

  async function setStatus(id: string, status: string) {
    try {
      await api("/queue/update", { method: "POST", body: JSON.stringify({ id, status }) })
      load()
    } catch (e) {
      setMsg(`// ${e instanceof Error ? e.message : String(e)}`)
    }
  }

  if (!session) {
    return (
      <MemberLayout title="SUPERCOMPUTE · Social Command" variant="admin" wide>
        <div className="page-header">
          <div>
            <div className="header-label">Administration</div>
            <h1 className="page-title">Social Command Center</h1>
          </div>
        </div>
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderLeft: "2px solid var(--accent)", padding: "24px" }}>
          <p style={{ fontSize: 13, color: "var(--fg)", lineHeight: 1.7, marginBottom: 12 }}>
            This surface reads and writes the publish queue. Sign in with an admin wallet to open it.
          </p>
          <Link href="/auth" style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--accent)" }}>
            // connect wallet →
          </Link>
        </div>
      </MemberLayout>
    )
  }

  if (!isAdmin) {
    return (
      <MemberLayout title="SUPERCOMPUTE · Social Command" variant="admin" wide>
        <div className="page-header">
          <div>
            <div className="header-label">Administration</div>
            <h1 className="page-title">Social Command Center</h1>
          </div>
        </div>
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderLeft: "2px solid var(--hud-yellow)", padding: "24px" }}>
          <p style={{ fontSize: 13, color: "var(--fg)", lineHeight: 1.7, margin: 0 }}>
            Signed in, but this wallet is not on the admin allow-list. The API enforces the same rule
            server-side — no queue reads or writes without the admin role.
          </p>
        </div>
      </MemberLayout>
    )
  }

  const connected = accounts.filter((a) => a.env_status === "connected").length

  return (
    <MemberLayout title="SUPERCOMPUTE · Social Command" variant="admin" wide>
      <div className="page-header">
        <div>
          <div className="header-label">Administration</div>
          <h1 className="page-title">Social Command Center</h1>
        </div>
      </div>

      {/* telemetry */}
      <div className="stats-grid">
        <div className="stat-card term-card">
          <div className="stat-label">Rails Connected</div>
          <div className="stat-value">{connected}/{accounts.length || 8}</div>
          <div className="stat-change">env-verified, never assumed</div>
        </div>
        <div className="stat-card term-card">
          <div className="stat-label">Queue</div>
          <div className="stat-value">{queue.length}</div>
          <div className="stat-change">{counts.map((c) => `${c.status}:${c.n}`).join(" · ") || "empty"}</div>
        </div>
        <div className="stat-card term-card">
          <div className="stat-label">Protocol Rails</div>
          <div className="stat-value">{accounts.filter((a) => a.tier === "protocol").length}</div>
          <div className="stat-change">farcaster · lens · nostr · bluesky</div>
        </div>
        <div className="stat-card term-card">
          <div className="stat-label">Mirrors</div>
          <div className="stat-value">{accounts.filter((a) => a.tier === "web2").length}</div>
          <div className="stat-change">x · tiktok · substack · youtube</div>
        </div>
      </div>

      {msg && (
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "12px 16px", marginBottom: 20, fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--accent)" }}>
          {msg}
        </div>
      )}

      {/* connection matrix */}
      <div className="section-header" style={{ marginBottom: 12 }}>
        <div className="label" style={{ color: "var(--accent)" }}>// rail matrix</div>
        <div><h2 className="display-md">Accounts &amp; adapters</h2></div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 1, background: "var(--border)", border: "1px solid var(--border)", marginBottom: 28 }}>
        {accounts.map((a) => (
          <div key={a.id} style={{ background: "var(--bg)", padding: "12px 18px", display: "grid", gridTemplateColumns: "180px 150px 1fr 120px 110px", gap: 12, alignItems: "center" }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--cream)" }}>{a.platform}</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--muted)" }}>{a.handle || "[PLACEHOLDER]"}</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--fg)" }}>{a.env_mode}</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.08em", color: statusColor(a.env_status) }}>
              {a.env_status.toUpperCase()}
            </div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--muted)", textAlign: "right" }}>
              {a.last_post_at ? new Date(a.last_post_at * 1000).toLocaleDateString() : "no posts yet"}
            </div>
          </div>
        ))}
      </div>

      {/* composer */}
      <div className="section-header" style={{ marginBottom: 12 }}>
        <div className="label" style={{ color: "var(--accent)" }}>// composer</div>
        <div><h2 className="display-md">Draft &amp; dispatch</h2></div>
      </div>
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: 20, marginBottom: 28 }}>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="// post text — protocol rails first, mirrors second"
          rows={5}
          style={{ width: "100%", background: "var(--bg)", border: "1px solid var(--border)", color: "var(--fg)", fontFamily: "var(--font-mono)", fontSize: 12, padding: 12, resize: "vertical", marginBottom: 12 }}
        />
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
          {accounts.map((a) => {
            const on = selected.includes(a.id)
            return (
              <button
                key={a.id}
                type="button"
                onClick={() => setSelected(on ? selected.filter((s) => s !== a.id) : [...selected, a.id])}
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  padding: "6px 10px",
                  cursor: "pointer",
                  background: on ? "var(--accent-dim)" : "var(--bg)",
                  border: `1px solid ${on ? "var(--accent)" : "var(--border)"}`,
                  color: on ? "var(--cream)" : "var(--muted)",
                }}
              >
                {a.tier === "protocol" ? "◈ " : "◇ "}{a.platform.split(" / ")[0]}
              </button>
            )
          })}
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <input
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--fg)", fontFamily: "var(--font-mono)", fontSize: 11, padding: "8px 10px" }}
          />
          <button type="button" disabled={busy} onClick={() => queueItem(false)}
            style={{ fontFamily: "var(--font-mono)", fontSize: 11, padding: "9px 16px", background: "var(--accent)", color: "var(--navy)", border: "1px solid var(--accent)", cursor: "pointer" }}>
            queue
          </button>
          <button type="button" disabled={busy} onClick={() => queueItem(true)}
            style={{ fontFamily: "var(--font-mono)", fontSize: 11, padding: "9px 16px", background: "transparent", color: "var(--accent)", border: "1px solid var(--accent)", cursor: "pointer" }}>
            queue + dispatch
          </button>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--muted)" }}>
            dispatch is dry-run unless the platform&apos;s credentials are set
          </span>
        </div>
      </div>

      {/* queue */}
      <div className="section-header" style={{ marginBottom: 12 }}>
        <div className="label" style={{ color: "var(--accent)" }}>// queue</div>
        <div><h2 className="display-md">Publish queue</h2></div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 1, background: "var(--border)", border: "1px solid var(--border)", marginBottom: 28 }}>
        {queue.length === 0 ? (
          <div style={{ background: "var(--bg)", padding: "20px", fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--muted)" }}>
            // queue empty — draft something above
          </div>
        ) : (
          queue.map((q) => (
            <div key={q.id} style={{ background: "var(--bg)", padding: "14px 18px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 8 }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--muted)" }}>
                  {q.id} · {q.platforms} · created {new Date(q.created_at * 1000).toLocaleString()}
                </span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.08em", color: q.status === "posted" ? "var(--accent)" : "var(--hud-yellow)" }}>
                  {q.status.toUpperCase()}
                </span>
              </div>
              <p style={{ fontSize: 12, color: "var(--fg)", lineHeight: 1.6, marginBottom: 10, whiteSpace: "pre-wrap" }}>{q.body}</p>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button type="button" disabled={busy} onClick={() => dispatchItem(q.id)} style={{ fontFamily: "var(--font-mono)", fontSize: 10, padding: "5px 10px", background: "transparent", border: "1px solid var(--accent)", color: "var(--accent)", cursor: "pointer" }}>
                  dispatch
                </button>
                <button type="button" onClick={() => setStatus(q.id, "posted")} style={{ fontFamily: "var(--font-mono)", fontSize: 10, padding: "5px 10px", background: "transparent", border: "1px solid var(--border)", color: "var(--muted)", cursor: "pointer" }}>
                  mark posted
                </button>
                <button type="button" onClick={() => setStatus(q.id, "draft")} style={{ fontFamily: "var(--font-mono)", fontSize: 10, padding: "5px 10px", background: "transparent", border: "1px solid var(--border)", color: "var(--muted)", cursor: "pointer" }}>
                  back to draft
                </button>
              </div>
              {q.results && (
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--muted)", marginTop: 8, overflowWrap: "anywhere" }}>{q.results}</div>
              )}
            </div>
          ))
        )}
      </div>

      {/* credentials */}
      <div className="section-header" style={{ marginBottom: 12 }}>
        <div className="label" style={{ color: "var(--accent)" }}>// credentials</div>
        <div><h2 className="display-md">Slots to fill (Cloudflare env)</h2></div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 1, background: "var(--border)", border: "1px solid var(--border)" }}>
        {CRED_SHEET.map((row) => (
          <div key={row.platform} style={{ background: "var(--bg)", padding: "12px 18px", display: "grid", gridTemplateColumns: "200px 1fr 220px", gap: 12 }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--cream)" }}>{row.platform}</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--accent)", overflowWrap: "anywhere" }}>{row.env}</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--muted)" }}>{row.note}</div>
          </div>
        ))}
      </div>
    </MemberLayout>
  )
}
