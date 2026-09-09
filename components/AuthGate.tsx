import Link from "next/link"
import { useEffect, useState, type ReactNode } from "react"
import { useAuth } from "../lib/auth"

/* Gates classwork behind login. Default (server-rendered / logged-out) shows
   the lock panel; children only render once a client session is confirmed —
   so no coursework leaks before login, and the vertical member nav never
   appears to logged-out visitors. */
export default function AuthGate({
  children,
  title = "Members only",
  note = "Sign in or create an account to access the curriculum.",
}: {
  children: ReactNode
  title?: string
  note?: string
}) {
  const { session } = useAuth()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  if (mounted && session) return <>{children}</>

  return (
    <div className="school-gate term-card">
      <div className="sg-lock">🔒</div>
      <div className="sg-title">{title}</div>
      <p className="sg-note">{note}</p>
      <div className="sg-actions">
        <Link href="/auth" className="sg-btn solid">Sign in</Link>
        <Link href="/auth" className="sg-btn ghost">Join free</Link>
      </div>
    </div>
  )
}
