import Head from "next/head"
import Sidebar from "./Sidebar"
import type { ReactNode } from "react"

export default function Layout({ children, title = "SUPERCOMPUTE · Web3 built for liberation" }: { children: ReactNode; title?: string }) {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content="One operator, hands-on Web3 consulting on Base Chain since 2013." />
      </Head>
      <div style={{ display: "flex", minHeight: "100vh" }}>
        <Sidebar />
        <main className="main">{children}</main>
      </div>
    </>
  )
}
