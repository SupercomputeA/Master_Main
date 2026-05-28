import Head from "next/head"
import Sidebar from "./Sidebar"
import AgentChat from "./AgentChat"
import type { ReactNode } from "react"

export default function Layout({ children, title = "SUPERCOMPUTE · Publishing" }: { children: ReactNode; title?: string }) {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content="Agent-powered news publishing. One post, every platform." />
      </Head>
      <AgentChat />
      <div style={{ display: "flex", minHeight: "100vh" }}>
        <Sidebar />
        <main className="main">{children}</main>
      </div>
    </>
  )
}
