import Head from "next/head"
import Sidebar from "./Sidebar"
import AgentChat from "./AgentChat"
import type { ReactNode } from "react"

export default function Layout({ children, title = "SUPERCOMPUTE · Web3 built for liberation" }: { children: ReactNode; title?: string }) {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content="One operator, hands-on Web3 consulting on Base Chain since 2013." />
      </Head>
      <AgentChat />
      <div style={{ display: "flex", minHeight: "100vh" }}>
        <Sidebar />
        <main className="main">
          {/* HUD corners bracket the main content area (per Terminal Dossier spec) */}
          <div className="hud-corner embed tl" />
          <div className="hud-corner embed tr" />
          <div className="hud-corner embed bl" />
          <div className="hud-corner embed br" />
          {children}
        </main>
      </div>
      {/* Full-viewport vignette (z-index 1) — sits above CRT scanlines */}
      <div className="vignette" />
    </>
  )
}
