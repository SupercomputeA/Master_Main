import Head from "next/head"
import type { ReactNode } from "react"

/* PublicLayout — clean public-area shell for read-only pages (legal, terms, privacy).
   Drops the in-app chrome (Sidebar / AgentChat) so legal copy is not visually embedded
   alongside authenticated surfaces. Inherits the same Terminal Dossier baseline:
   monospace type, terminal framing, gold accents, status dot. Body rendered as a
   single <main> so the existing .hero / .section / .footer-grid styles apply. */
export default function PublicLayout({
  children,
  title = "SUPERCOMPUTE · Web3 built for liberation",
}: {
  children: ReactNode
  title?: string
}) {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content="Supercompute — non-custodial, wallet-first, USDC on Base." />
      </Head>
      <div className="public-shell">
        <main className="main public-main">{children}</main>
      </div>
    </>
  )
}
