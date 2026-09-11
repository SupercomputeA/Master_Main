import Link from "next/link"
import { useEffect, useState, type ReactNode } from "react"
import { useAuth } from "../lib/auth"

/* AdminGate — server-truth admin gate for operator surfaces under /app/*.
   Same shape as AuthGate, plus the role check. Every /api/social/* route
   re-checks the role server-side, so this is the UX layer, not the control:
   hiding the children keeps admin telemetry out of a non-admin's bundle
   render, the 401/403 from the API is what actually stops the data.

   States:
     no session            → sign-in panel
     session, no profile    → "verifying clearance" (profile fetch in flight)
     session, role !== admin→ denied panel (names the signed-in identity)
     admin                  → children
*/
export default function AdminGate({
  children,
  title = "Admin access required",
  note = "This is the operator surface for the Supercompute rail stack. Sign in with an admin wallet to continue.",
}: {
  children: ReactNode
  title?: string
  note?: string
}) {
  const { session, profile, isAdmin } = useAuth()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  if (!mounted) return <div className="school-gate"><div className="sg-lock">◍</div><div className="sg-title">checking clearance…</div></div>

  if (session && isAdmin) return <>{children}</>

  if (session && !profile) {
    return (
      <div className="school-gate">
        <div className="sg-lock">◍</div>
        <div className="sg-title">Verifying clearance</div>
        <p className="sg-note">
          Session found — resolving your role against the D1 allow-list. If this panel does not clear,
          the session is stale: sign in again.
        </p>
        <div className="sg-actions">
          <Link href="/auth" className="sg-btn solid">Re-authenticate</Link>
        </div>
      </div>
    )
  }

  const denied = Boolean(session && profile && !isAdmin)

  return (
    <div className="school-gate">
      <div className="sg-lock">🔒</div>
      <div className="sg-title">{denied ? "Denied — admin role required" : title}</div>
      <p className="sg-note">
        {denied
          ? `Signed in as ${profile?.name || "unknown"} (role: ${profile?.role || "user"}). The social command center is restricted to admin wallets.`
          : note}
      </p>
      <div className="sg-actions">
        <Link href="/auth" className="sg-btn solid">{denied ? "Switch wallet" : "Sign in"}</Link>
        <Link href="/app" className="sg-btn ghost">Member home</Link>
      </div>
    </div>
  )
}
