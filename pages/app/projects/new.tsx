import { useRouter } from "next/router"
import { useState } from "react"
import Link from "next/link"
import MemberLayout from "../../../components/MemberLayout"

/* New Project — net-new screen (no template shipped; designed in Terminal
   Dossier). Creates against local state for now; wire to POST /api/projects. */

export default function NewProject() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [icon, setIcon] = useState("🎯")
  const [desc, setDesc] = useState("")
  const [status, setStatus] = useState("active")
  const [collaborators, setCollaborators] = useState("")
  const [msg, setMsg] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setMsg(null)
    try {
      // Best-effort persist; API may not exist yet in this environment.
      await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, icon, description: desc, status, collaborators: collaborators.split(",").map((s) => s.trim()).filter(Boolean) }),
      }).catch(() => {})
      setMsg("// project created — returning to your projects…")
      setTimeout(() => router.push("/app/projects"), 700)
    } finally {
      setBusy(false)
    }
  }

  return (
    <MemberLayout
      title="SUPERCOMPUTE · New Project"
      banner={{ icon: "🎯", title: "New Project", sub: "Spin up a new initiative. Name it, describe the mission, and invite collaborators to build in the open." }}
    >
      <div className="tpl-form">
        <div className="page-header">
          <div className="header-left">
            <div className="header-label">Member Dashboard</div>
            <h1 className="page-title">Create Project</h1>
          </div>
        </div>

        <form className="form-card term-card" onSubmit={handleSubmit}>
          <div className="f-row">
            <div className="field">
              <label className="f-label" htmlFor="name">Project name</label>
              <input id="name" className="f-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Sovereignty Stack" required />
            </div>
            <div className="field">
              <label className="f-label" htmlFor="icon">Icon</label>
              <input id="icon" className="f-input" value={icon} onChange={(e) => setIcon(e.target.value)} placeholder="🎯" maxLength={4} />
              <div className="f-hint">A single emoji or glyph.</div>
            </div>
          </div>

          <div className="field">
            <label className="f-label" htmlFor="desc">Description</label>
            <textarea id="desc" className="f-textarea" value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="What is this project and what does success look like?" required />
          </div>

          <div className="f-row">
            <div className="field">
              <label className="f-label" htmlFor="status">Status</label>
              <select id="status" className="f-select" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div className="field">
              <label className="f-label" htmlFor="collab">Collaborators</label>
              <input id="collab" className="f-input" value={collaborators} onChange={(e) => setCollaborators(e.target.value)} placeholder="quanta_s, knight" />
              <div className="f-hint">Comma-separated handles.</div>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-solid" disabled={busy}>{busy ? "Creating…" : "Create project"}</button>
            <Link href="/app/projects" className="btn-ghost">Cancel</Link>
          </div>

          {msg && <div className="form-msg">{msg}</div>}
        </form>
      </div>
    </MemberLayout>
  )
}
