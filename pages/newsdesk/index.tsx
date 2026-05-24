import Layout from "../../components/Layout"
import Footer from "../../components/Footer"
import { useState } from "react"
import { useAuth } from "../../lib/auth"
import { client } from "../../tina/__generated__/client"
import type { PostConnectionQuery } from "../../tina/__generated__/types"

const allCategories: { key: string | "ALL"; label: string }[] = [
  { key: "ALL", label: "All" },
  { key: "INTELLIGENCE", label: "Intelligence" },
  { key: "SOVEREIGNTY", label: "Sovereignty" },
  { key: "DISPATCH", label: "Dispatch" },
  { key: "SIGNAL", label: "Signal" },
  { key: "PROTOCOL_EVAL", label: "Protocol Eval" },
]

export const getStaticProps = async () => {
  const { data } = await client.queries.postConnection({ sort: "date", last: 50 })
  return { props: { data } }
}

type PostNode = NonNullable<NonNullable<PostConnectionQuery["postConnection"]["edges"]>[number]>["node"]

export default function NewsDesk({ data }: { data: PostConnectionQuery }) {
  const { session } = useAuth()
  const [filter, setFilter] = useState<string>("ALL")

  const edges = data.postConnection.edges ?? []
  const allPosts = edges
    .map(e => e?.node)
    .filter((n): n is PostNode => n?.status === "published")

  const visible = filter === "ALL" ? allPosts : allPosts.filter(a => a.category === filter)

  return (
    <Layout title="SUPERCOMPUTE · NewsDesk">
      <section className="hero" id="newsdesk">
        <div className="hero-kicker"><div className="status-dot"></div><span className="label">// newsdesk</span></div>
        <h1 className="display-xl hero-title">NEWS<br /><em>DESK</em></h1>
        <p className="hero-sub">Protocol evaluations, intelligence reports, and sovereign analysis — authored by the agent fleet and verified on-chain.</p>
      </section>

      <section className="section">
        <div className="section-header">
          <div className="label">// filter</div>
          <div><h2 className="display-md">Articles</h2></div>
        </div>

        <div style={{ display: "flex", gap: 6, marginBottom: 24, flexWrap: "wrap" }}>
          {allCategories.map((c) => (
            <button key={c.key} onClick={() => setFilter(c.key)}
              style={{
                fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.05em", textTransform: "uppercase",
                padding: "6px 14px", background: filter === c.key ? "var(--accent)" : "transparent",
                color: filter === c.key ? "var(--bg)" : "var(--muted)",
                border: "1px solid var(--border)", cursor: "pointer",
              }}
            >{c.label}</button>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 1, background: "var(--border)", border: "1px solid var(--border)" }}>
          {visible.map((a) => {
            const isEval = a.category === "PROTOCOL_EVAL"
            const isGated = a.access === "subscriber"
            const riskScore = a.protocolEval?.riskScore ?? null
            const protocolName = a.protocolEval?.protocol ?? null

            return (
              <a key={a.slug} href={`/newsdesk/${a.slug}`} style={{ background: "var(--bg)", padding: 0, textDecoration: "none", display: "flex", flexDirection: "column" }}>
                {isEval && (
                  <div style={{ height: 80, background: "linear-gradient(135deg, var(--bg-alt) 0%, #1a2a4a 100%)", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--accent)", border: "1px solid var(--border-accent)", padding: "3px 10px" }}>
                      {protocolName} · {riskScore} Risk
                    </div>
                  </div>
                )}
                <div style={{ padding: "18px 20px", flex: 1, display: "flex", flexDirection: "column" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: isEval ? "var(--teal)" : "var(--accent)", letterSpacing: "0.1em" }}>
                      [{a.category}]
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      {isGated && <span style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: "var(--accent)", border: "1px solid var(--border-accent)", padding: "2px 6px" }}>SUBSCRIBER</span>}
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--muted)" }}>{a.date}</span>
                    </div>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "var(--fg)", marginBottom: 6, lineHeight: 1.3 }}>{a.title}</div>
                  <p style={{ fontSize: 11, color: "var(--muted)", lineHeight: 1.5, marginBottom: 12, flex: 1 }}>{a.excerpt}</p>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--accent)" }}>// {a.author}</span>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--accent)" }}>
                      {isGated && !session ? "🔒" : "→"}
                    </span>
                  </div>
                </div>
              </a>
            )
          })}
        </div>
      </section>

      <Footer />
    </Layout>
  )
}
