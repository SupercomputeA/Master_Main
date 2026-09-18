import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import MemberLayout from "../../components/MemberLayout"
import AdminGate from "../../components/AdminGate"
import { useAuth } from "../../lib/auth"

/* Admin — Social Command Center (/app/social)
 *
 * Operator surface for every rail Supercompute publishes on. Rail-ordered:
 * protocol rails (Farcaster / Lens / Nostr / Bluesky) before web2 mirrors
 * (X / TikTok / Substack / YouTube).
 *
 * Data is REAL. Every read/write below goes through /api/social/*, which is
 * admin-gated server-side (session + role) and reads connection state straight
 * from Cloudflare env — a rail with no credentials renders NEEDS KEY, never a
 * fabricated CONNECTED. Publishing without credentials returns a dry-run with
 * the missing variable named; nothing is ever reported as posted unless an
 * adapter actually got a 2xx back.
 */

type Rail = {
  id: string
  platform: string
  tier: "protocol" | "web2"
  handle: string | null
  adapter: string
  notes: string | null
  last_post_at: number | null
  status: "connected" | "needs_key" | "manual" | string
  mode: string
  required_env: string[]
  present_env: string[]
  missing_env: string[]
  coverage: number
}

type QueueItem = {
  id: string
  body: string
  platforms: string
  status: string
  scheduled_at: number | null
  posted_at: number | null
  results: string | null
  created_by: string | null
  created_at: number
}

type DispatchResult = { platform: string; ok: boolean; mode: string; detail: string; url?: string }

const CHAR_LIMIT: Record<string, number> = {
  farcaster: 1024,
  bluesky: 300,
  x: 280,
  tiktok: 2200,
  substack: 20000,
  lens: 5000,
  nostr: 1000,
  youtube: 5000,
}

const STATUS_COLOR: Record<string, string> = {
  connected: "#4ADE80",
  needs_key: "#FF6B6B",
  manual: "var(--gold-warm)",
  unsupported: "var(--mono-blue)",
}

const QUEUE_COLOR: Record<string, string> = {
  posted: "#4ADE80",
  partial: "var(--hud-yellow)",
  failed: "#FF6B6B",
  dry_run: "var(--mono-blue)",
  scheduled: "var(--gold-warm)",
  draft: "var(--mono-blue)",
}

const CSS = `
.sc-globe { width:110px; height:110px; border-radius:50%; border:1px solid var(--gold-warm); position:relative; flex-shrink:0; }
.sc-globe-lat { position:absolute; left:0; right:0; top:50%; border:1px solid rgba(201,163,58,.35); border-radius:50%; }
.sc-globe-lat.l1 { height:14px; margin-top:-7px; }
.sc-globe-lat.l2 { height:40px; margin-top:-20px; }
.sc-globe-lat.l3 { height:70px; margin-top:-35px; }
.sc-globe-mer { position:absolute; top:0; bottom:0; left:50%; width:56px; margin-left:-28px; border:1px solid rgba(111,163,229,.45); border-radius:50%; animation:sc-mer 7s linear infinite; }
.sc-globe-core { position:absolute; inset:0; border-radius:50%; overflow:hidden; }
.sc-globe-sweep { position:absolute; top:0; bottom:0; width:22px; background:rgba(201,163,58,.18); animation:sc-sweep 4.5s linear infinite; }
.sc-led { display:inline-block; width:6px; height:6px; border-radius:50%; }
.sc-led.on { animation:sc-blink 1.6s ease-in-out infinite; }
.sc-gauge { display:flex; gap:2px; }
.sc-seg { width:9px; height:12px; border:1px solid rgba(201,163,58,.25); }
.sc-seg.on { background:var(--gold-warm); border-color:var(--gold-warm); }
.sc-seg.on.warn { background:#FF6B6B; border-color:#FF6B6B; }
.sc-track { position:relative; height:26px; border:1px solid var(--border); background:rgba(255,255,255,.02); overflow:hidden; }
.sc-track-line { position:absolute; top:50%; left:0; right:0; height:1px; background:rgba(201,163,58,.3); }
.sc-track-dot { position:absolute; top:50%; width:9px; height:9px; margin-top:-4.5px; border-radius:50%; background:var(--gold-warm); box-shadow:0 0 6px rgba(201,163,58,.8); }
.sc-track-run { position:absolute; top:0; bottom:0; width:2px; background:var(--mono-blue); opacity:.5; animation:sc-run 3.2s linear infinite; }
@keyframes sc-mer { 0% { transform:scaleX(1); } 25% { transform:scaleX(.12); } 50% { transform:scaleX(1); } 75% { transform:scaleX(.12); } 100% { transform:scaleX(1); } }
@keyframes sc-sweep { 0% { left:-24px; } 100% { left:110px; } }
@keyframes sc-blink { 0%,100% { opacity:1; } 50% { opacity:.2; } }
@keyframes sc-run { 0% { left:0; } 100% { left:100%; } }
@media (prefers-reduced-motion: reduce) {
  .sc-globe-mer, .sc-globe-sweep, .sc-led.on, .sc-track-run { animation:none !important; }
}
`

function ts(unix: number | null | undefined): string {
  if (!unix) return "—"
  return new Date(unix * 1000).toISOString().replace("T", " ").slice(0, 16) + "Z"
}

function parseResults(raw: string | null): DispatchResult[] {
  if (!raw) return []
  try {
    const v = JSON.parse(raw)
    return Array.isArray(v) ? v : []
  } catch {
    return []
  }
}

function railsOf(raw: string): string[] {
  try {
    const v = JSON.parse(raw)
    return Array.isArray(v) ? v : []
  } catch {
    return []
  }
}

function SegmentGauge({ coverage, warn }: { coverage: number; warn?: boolean }) {
  const filled = Math.max(0, Math.min(10, Math.round(coverage * 10)))
  return (
    <div className="sc-gauge" title={`${filled}/10 credentials present`}>
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className={`sc-seg${i < filled ? " on" : ""}${i < filled && warn ? " warn" : ""}`} />
      ))}
    </div>
  )
}

function MetricCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="stat-card term-card">
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {sub && <div className="stat-change" style={{ color: "var(--mono-blue)" }}>{sub}</div>}
    </div>
  )
}

function CommandCenter() {
  const { session } = useAuth()
  const [rails, setRails] = useState<Rail[]>([])
  const [queue, setQueue] = useState<QueueItem[]>([])
  const [telemetry, setTelemetry] = useState<{ rails_total: number; rails_connected: number; rails_needs_key: number; rails_manual: number } | null>(null)
  const [loadError, setLoadError] = useState<{ status: number; message: string } | null>(null)
  const [flash, setFlash] = useState<string | null>(null)
  const [busy, setBusy] = useState<string | null>(null)

  const [draft, setDraft] = useState("")
  const [targets, setTargets] = useState<string[]>([])
  const [scheduleAt, setScheduleAt] = useState("")

  const api = useCallback(
    async (path: string, opts: { method?: string; body?: unknown } = {}): Promise<{ status: number; data: any }> => {
      const headers: Record<string, string> = {}
      if (session) headers.Authorization = `Bearer ${session}`
      if (opts.body) headers["Content-Type"] = "application/json"
      const res = await fetch(`/api/social${path}`, {
        method: opts.method || "GET",
        headers,
        body: opts.body ? JSON.stringify(opts.body) : undefined,
      })
      const data = await res.json().catch(() => ({ error: `non-JSON response (HTTP ${res.status})` }))
      return { status: res.status, data }
    },
    [session]
  )

  const load = useCallback(async () => {
    if (!session) return
    const [accounts, q, health] = await Promise.all([
      api("/accounts"),
      api("/queue"),
      api("/health"),
    ])
    const first = accounts.status !== 200 ? accounts : q.status !== 200 ? q : health
    if (first.status === 401 || first.status === 403) {
      setLoadError({ status: first.status, message: first.data?.error || "access denied" })
      return
    }
    setLoadError(null)
    if (accounts.status === 200) setRails(accounts.data.accounts || [])
    if (q.status === 200) setQueue(q.data.queue || [])
    if (health.status === 200) setTelemetry(health.data.telemetry || null)
  }, [api, session])

  useEffect(() => {
    load()
  }, [load])

  const railById = useMemo(() => {
    const m: Record<string, Rail> = {}
    for (const r of rails) m[r.id] = r
    return m
  }, [rails])

  const protocolRails = rails.filter((r) => r.tier === "protocol")
  const web2Rails = rails.filter((r) => r.tier !== "protocol")

  const overLimit = targets.filter((t) => draft.length > (CHAR_LIMIT[t] || 5000))
  const queueDepth = queue.filter((q) => q.status === "draft" || q.status === "scheduled").length
  const posted = queue.filter((q) => q.status === "posted" || q.status === "partial").length
  const scheduled = queue.filter((q) => q.status === "scheduled").length

  function toggleTarget(id: string) {
    setTargets((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]))
  }

  async function enqueue(asDraft: boolean) {
    if (!draft.trim() || targets.length === 0) {
      setFlash("// add body text and pick at least one rail")
      return
    }
    setBusy("compose")
    setFlash(null)
    const scheduled_at = !asDraft && scheduleAt ? Math.floor(new Date(scheduleAt).getTime() / 1000) : null
    const r = await api("/queue", { method: "POST", body: { body: draft.trim(), platforms: targets, scheduled_at } })
    if (r.status === 201) {
      setFlash(`// queued ${r.data.item.id} — ${targets.length} rail(s), ${r.data.item.status}`)
      setDraft("")
      setTargets([])
      setScheduleAt("")
      await load()
    } else {
      setFlash(`// queue failed (HTTP ${r.status}): ${r.data?.error || "unknown"}`)
    }
    setBusy(null)
  }

  async function dispatch(item: QueueItem, dryRun: boolean) {
    setBusy(item.id + (dryRun ? ":dry" : ":live"))
    setFlash(null)
    const r = await api("/publish", { method: "POST", body: { id: item.id, dry_run: dryRun } })
    if (r.status === 200) {
      const summary = (r.data.results || []).map((x: DispatchResult) => `${x.platform}:${x.mode}${x.ok ? "✓" : ""}`).join("  ")
      setFlash(`// ${item.id} → ${r.data.status} — ${summary}`)
      await load()
    } else {
      setFlash(`// dispatch failed (HTTP ${r.status}): ${r.data?.error || "unknown"}`)
    }
    setBusy(null)
  }

  async function setStatus(item: QueueItem, status: string) {
    setBusy(item.id + ":" + status)
    await api("/queue/update", { method: "POST", body: { id: item.id, status } })
    await load()
    setBusy(null)
  }

  async function remove(item: QueueItem) {
    setBusy(item.id + ":del")
    await api("/queue/delete", { method: "POST", body: { id: item.id } })
    setFlash(`// deleted ${item.id}`)
    await load()
    setBusy(null)
  }

  if (loadError) {
    return (
      <div className="school-gate">
        <div className="sg-lock">⛔</div>
        <div className="sg-title">Access denied by the API</div>
        <p className="sg-note">
          /api/social returned HTTP {loadError.status} — {loadError.message}. This surface is admin-only;
          re-authenticate with an admin wallet, or ask an operator to add yours to the D1 allow-list.
        </p>
        <div className="sg-actions">
          <Link href="/auth" className="sg-btn solid">Re-authenticate</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="tpl-admin">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      {/* ── command header ─────────────────────────────────────────────── */}
      <div className="header">
        <div>
          <div className="label">Administration · rail operations</div>
          <h1>Social Command Center</h1>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--mono-blue)", marginTop: 10 }}>
            {rails.length} rails registered · {telemetry ? `${telemetry.rails_connected} connected / ${telemetry.rails_needs_key} awaiting key / ${telemetry.rails_manual} manual` : "telemetry loading…"}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--mono-blue)", textAlign: "right", lineHeight: 1.9 }}>
            <div><span className="sc-led on" style={{ background: "var(--gold-warm)", boxShadow: "0 0 6px var(--gold-warm)" }} /> DISPATCH BUS · ARMED</div>
            <div><span className="sc-led on" style={{ background: "#4ADE80", boxShadow: "0 0 6px #4ADE80" }} /> QUEUE · {queueDepth} PENDING</div>
            <div><span className="sc-led" style={{ background: "#FF6B6B" }} /> NO-KEY RAILS · {rails.filter((r) => r.status === "needs_key").length}</div>
          </div>
          <div className="sc-globe">
            <div className="sc-globe-lat l1" />
            <div className="sc-globe-lat l2" />
            <div className="sc-globe-lat l3" />
            <div className="sc-globe-mer" />
            <div className="sc-globe-core"><div className="sc-globe-sweep" /></div>
          </div>
        </div>
      </div>

      {/* ── telemetry ──────────────────────────────────────────────────── */}
      <div className="stats-grid">
        <MetricCard label="Rails Connected" value={`${telemetry?.rails_connected ?? 0}/${telemetry?.rails_total ?? rails.length}`} sub="credentials present server-side" />
        <MetricCard label="Queue Depth" value={String(queueDepth)} sub="draft + scheduled" />
        <MetricCard label="Scheduled" value={String(scheduled)} sub="awaiting dispatch window" />
        <MetricCard label="Dispatched" value={String(posted)} sub="posted or partial" />
      </div>

      {flash && (
        <div className="ed-msg" style={{ textAlign: "left", marginBottom: 24, color: "var(--gold-warm)", fontFamily: "var(--font-mono)", fontSize: 11 }}>
          {flash}
        </div>
      )}

      {/* ── rail health (protocol tier) ─────────────────────────────────── */}
      <div className="card-title">Rail health · protocol rails (censorship-resistant first)</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 1, background: "var(--border)", border: "1px solid var(--border)", marginBottom: 32 }}>
        {protocolRails.length === 0 && <div className="content-item" style={{ background: "var(--surface-0)" }}><div className="content-desc">No rails loaded — apply migrations/0002_social_command_center.sql to seed the registry.</div></div>}
        {protocolRails.map((r) => <RailCard key={r.id} rail={r} />)}
      </div>

      <div className="card-title">Rail health · web2 mirrors (reach, never source of truth)</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 1, background: "var(--border)", border: "1px solid var(--border)", marginBottom: 32 }}>
        {web2Rails.map((r) => <RailCard key={r.id} rail={r} />)}
      </div>

      {/* ── composer ────────────────────────────────────────────────────── */}
      <div className="card-title">Composer · one vector, many rails</div>
      <div className="term-card" style={{ padding: 24, marginBottom: 32, position: "relative" }}>
        <textarea
          className="filter-input"
          style={{ width: "100%", minHeight: 132, resize: "vertical", fontFamily: "var(--font-mono)", fontSize: 13, marginBottom: 16 }}
          placeholder="// compose the dispatch — this text is sent verbatim to every selected rail"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />

        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 14 }}>
          {rails.map((r) => {
            const limit = CHAR_LIMIT[r.id] || 5000
            const over = draft.length > limit
            return (
              <button
                key={r.id}
                onClick={() => toggleTarget(r.id)}
                className={`mod-btn${targets.includes(r.id) ? " approve" : ""}`}
                style={over && targets.includes(r.id) ? { borderColor: "#FF6B6B", color: "#FF6B6B" } : undefined}
                title={`${r.mode} · limit ${limit} chars`}
              >
                {r.tier === "protocol" ? "◈ " : "◇ "}{r.platform.split(" / ")[0]} · {draft.length}/{limit}
              </button>
            )
          })}
        </div>

        <div className="sc-track" style={{ marginBottom: 16 }}>
          <div className="sc-track-line" />
          <div className="sc-track-run" />
          {rails.map((r, i) => {
            const step = rails.length > 1 ? (i / (rails.length - 1)) * 92 + 3 : 50
            const on = targets.includes(r.id)
            return (
              <div
                key={r.id}
                className="sc-track-dot"
                style={{
                  left: `${step}%`,
                  background: on ? "var(--gold-warm)" : "var(--border)",
                  boxShadow: on ? "0 0 6px rgba(201,163,58,.8)" : "none",
                }}
                title={r.platform}
              />
            )
          })}
        </div>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <input
            className="filter-input"
            type="datetime-local"
            value={scheduleAt}
            onChange={(e) => setScheduleAt(e.target.value)}
            style={{ maxWidth: 240 }}
          />
          <button className="qa-btn" disabled={busy === "compose"} onClick={() => enqueue(false)}>
            {busy === "compose" ? "…" : scheduleAt ? "Schedule dispatch" : "Queue for dispatch"}
          </button>
          <button className="mod-btn" disabled={busy === "compose"} onClick={() => enqueue(true)}>Save as draft</button>
          <button className="mod-btn" onClick={() => { setDraft(""); setTargets([]); setScheduleAt("") }}>Clear</button>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--mono-blue)" }}>
            {targets.length} rail(s) targeted{overLimit.length ? ` · over limit: ${overLimit.join(", ")}` : ""}
          </span>
        </div>
      </div>

      {/* ── queue ───────────────────────────────────────────────────────── */}
      <div className="card-title">Queue · {queue.length} item(s) in social_queue (D1)</div>
      <div className="content-list">
        {queue.length === 0 && (
          <div className="content-item term-card">
            <div className="content-main"><div className="content-desc">Queue empty. Compose above to write the first row.</div></div>
          </div>
        )}
        {queue.map((item) => {
          const results = parseResults(item.results)
          const platforms = railsOf(item.platforms)
          return (
            <div key={item.id} className="content-item term-card">
              <div className="content-main">
                <div className="content-header">
                  <div className="content-title">{item.body.slice(0, 96)}{item.body.length > 96 ? "…" : ""}</div>
                  <div className="content-status" style={{ color: QUEUE_COLOR[item.status] || "var(--mono-blue)" }}>{item.status}</div>
                </div>
                <div className="content-meta">
                  <span>{item.id}</span>
                  <span>{platforms.map((p) => railById[p]?.platform.split(" / ")[0] || p).join(" → ")}</span>
                </div>
                <div className="content-desc" style={{ fontSize: 11 }}>
                  <div>created {ts(item.created_at)} · scheduled {ts(item.scheduled_at)} · posted {ts(item.posted_at)}</div>
                  {results.length > 0 && (
                    <div style={{ marginTop: 6, fontFamily: "var(--font-mono)", fontSize: 10 }}>
                      {results.map((r) => (
                        <div key={r.platform}>
                          <span style={{ color: STATUS_COLOR[r.mode === "live" && r.ok ? "connected" : r.mode === "dry-run" ? "unsupported" : "manual"] }}>
                            [{r.mode}]
                          </span>{" "}
                          {r.platform} — {r.detail}
                          {r.url ? <> · <a href={r.url} target="_blank" rel="noreferrer" style={{ color: "var(--gold-warm)" }}>open</a></> : null}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="content-actions">
                  <button className="mod-btn approve" disabled={!!busy} onClick={() => dispatch(item, false)}>
                    {busy === item.id + ":live" ? "…" : "Dispatch"}
                  </button>
                  <button className="mod-btn" disabled={!!busy} onClick={() => dispatch(item, true)}>
                    {busy === item.id + ":dry" ? "…" : "Dry run"}
                  </button>
                  <button className="mod-btn" disabled={!!busy} onClick={() => setStatus(item, "draft")}>Hold</button>
                  <button className="mod-btn" disabled={!!busy} onClick={() => setStatus(item, "scheduled")}>Mark scheduled</button>
                  <button className="mod-btn reject" disabled={!!busy} onClick={() => remove(item)}>
                    {busy === item.id + ":del" ? "…" : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* ── credentials sheet ───────────────────────────────────────────── */}
      <div className="card-title" style={{ marginTop: 40 }}>Credentials sheet · [PLACEHOLDER] slots per rail</div>
      <table className="users-table">
        <thead>
          <tr>
            <th>Rail</th>
            <th>Tier</th>
            <th>Adapter</th>
            <th>Env vars the adapter reads</th>
            <th>State</th>
          </tr>
        </thead>
        <tbody>
          {rails.map((r) => (
            <tr key={r.id}>
              <td style={{ color: "var(--cream)", fontWeight: 700 }}>{r.platform}<div style={{ fontSize: 10, color: "var(--mono-blue)" }}>{r.handle || "[PLACEHOLDER: handle]"}</div></td>
              <td>{r.tier === "protocol" ? "PROTOCOL" : "MIRROR"}</td>
              <td>
                {r.adapter}
                <div style={{ fontSize: 10, color: "var(--mono-blue)" }}>{r.mode}</div>
              </td>
              <td style={{ fontFamily: "var(--font-mono)", fontSize: 10 }}>
                {r.required_env.length === 0 ? "— none (manual)" : r.required_env.map((n) => (
                  <div key={n} style={{ color: r.present_env.includes(n) ? "#4ADE80" : "#FF6B6B" }}>
                    {r.present_env.includes(n) ? "✓" : "○"} {n}
                  </div>
                ))}
              </td>
              <td style={{ color: STATUS_COLOR[r.status] || "var(--mono-blue)", fontWeight: 700 }}>
                {r.status === "connected" ? "CONNECTED" : r.status === "needs_key" ? "NEED KEY" : r.status === "manual" ? "MANUAL" : String(r.status).toUpperCase()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p style={{ fontSize: 11, color: "var(--mono-blue)", lineHeight: 1.8, marginTop: 16, maxWidth: 900 }}>
        Set these variables in the Cloudflare Pages project (Settings → Environment variables). The API reports only
        whether a variable is present — values are never read back by the browser or returned by this endpoint.
        Rails with no credentials stay in dry-run: the dispatch is recorded, the post is not sent.
      </p>
    </div>
  )
}

function RailCard({ rail }: { rail: Rail }) {
  const color = STATUS_COLOR[rail.status] || "var(--mono-blue)"
  const label = rail.status === "connected" ? "CONNECTED" : rail.status === "needs_key" ? "NEED KEY" : rail.status === "manual" ? "MANUAL" : String(rail.status).toUpperCase()
  return (
    <div style={{ background: "var(--bg)", padding: "20px 22px", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div className="label-sm" style={{ color: "var(--gold-warm)" }}>
          // {rail.id} · {rail.tier === "protocol" ? "protocol" : "web2 mirror"}
        </div>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: ".1em", padding: "2px 7px", border: `1px solid ${color}`, color }}>
          <span className={`sc-led${label === "CONNECTED" ? " on" : ""}`} style={{ background: color, marginRight: 5, boxShadow: label === "CONNECTED" ? `0 0 6px ${color}` : "none" }} />
          {label}
        </span>
      </div>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 700, textTransform: "uppercase", color: "var(--cream)", marginBottom: 4 }}>
        {rail.platform}
      </div>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--mono-blue)", marginBottom: 12 }}>
        {rail.handle || "[PLACEHOLDER: handle]"} · adapter {rail.adapter}
      </div>
      <div style={{ marginBottom: 10 }}>
        <SegmentGauge coverage={rail.coverage} warn={rail.status === "needs_key"} />
      </div>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--mono-blue)", lineHeight: 1.8, marginBottom: 10 }}>
        <div>{rail.mode}</div>
        <div>last post: {ts(rail.last_post_at)}</div>
        {rail.missing_env.length > 0 && <div style={{ color: "#FF6B6B" }}>missing: {rail.missing_env.join(", ")}</div>}
        {rail.required_env.length > 0 && rail.missing_env.length === 0 && <div style={{ color: "#4ADE80" }}>all {rail.required_env.length} vars present</div>}
      </div>
      {rail.notes && (
        <div style={{ fontSize: 10.5, color: "rgba(244,236,216,.6)", lineHeight: 1.7, borderTop: "1px solid var(--border)", paddingTop: 10 }}>
          {rail.notes}
        </div>
      )}
    </div>
  )
}

export default function AdminSocialCommandCenter() {
  return (
    <MemberLayout title="SUPERCOMPUTE · Social Command Center" variant="admin" wide>
      <AdminGate
        title="Social Command Center — admin only"
        note="The command center controls live publishing to every Supercompute rail. Sign in with an admin wallet (D1 allow-list) to compose, queue and dispatch."
      >
        <CommandCenter />
      </AdminGate>
    </MemberLayout>
  )
}
