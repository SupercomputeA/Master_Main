import type { GetStaticProps } from "next"
import Link from "next/link"
import Layout from "../components/Layout"
import Footer from "../components/Footer"
import { getAllProjects, type Project } from "../lib/content"

export const getStaticProps: GetStaticProps = async () => {
  const projects = await getAllProjects()
  return { props: { projects } }
}

export default function Token({ projects }: { projects: Project[] }) {
  const projectTokens = projects.filter(p => p.tokenSymbol)
  const totalTVL = projects.reduce((sum, p) => {
    const n = Number((p.tvl || "0").replace(/[^0-9.]/g, "")) || 0
    const isM = (p.tvl || "").toLowerCase().includes("m")
    const isK = (p.tvl || "").toLowerCase().includes("k")
    return sum + n * (isM ? 1_000_000 : isK ? 1_000 : 1)
  }, 0)
  const totalRaised = projects.reduce((sum, p) => sum + (p.raised || 0), 0)
  const totalInvestors = projects.reduce((sum, p) => sum + (p.investors || 0), 0)

  return (
    <Layout title="SUPERCOMPUTE · $SCOM Token">
      <section className="hero" id="token">
        <div className="hero-kicker">
          <div className="status-dot" />
          <span className="label">// token</span>
        </div>
        <h1 className="display-xl hero-title">
          $SCOM<br /><em>TOKEN</em>
        </h1>
        <p className="hero-sub">
          Builder coin on Base Chain. Rewards stakers from protocol revenue.
          Live Q3 2026. Stake to earn a share of trading fees.
        </p>
        <div className="hero-meta">
          <div className="meta-item">
            <div className="label-sm">// Network</div>
            <div className="val">Base L2</div>
          </div>
          <div className="meta-item">
            <div className="label-sm">// Est. APY</div>
            <div className="val">~12%</div>
          </div>
          <div className="meta-item">
            <div className="label-sm">// Launch</div>
            <div className="val">Q3 2026</div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <div className="label">// ecosystem</div>
          <div><h2 className="display-md">Ecosystem Stats</h2></div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1, background: "var(--border)", border: "1px solid var(--border)" }}>
          <div style={{ background: "var(--bg)", padding: "20px" }}>
            <div className="label-sm" style={{ marginBottom: 4 }}>// Projects</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 700, color: "var(--accent)" }}>{projects.length}</div>
            <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>active in ecosystem</div>
          </div>
          <div style={{ background: "var(--bg)", padding: "20px" }}>
            <div className="label-sm" style={{ marginBottom: 4 }}>// Project Tokens</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 700, color: "var(--accent)" }}>{projectTokens.length}</div>
            <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>sub-tokens issued</div>
          </div>
          <div style={{ background: "var(--bg)", padding: "20px" }}>
            <div className="label-sm" style={{ marginBottom: 4 }}>// Total Raised</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 700, color: "var(--accent)" }}>${(totalRaised / 1000).toFixed(0)}K</div>
            <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>{totalInvestors} investors</div>
          </div>
          <div style={{ background: "var(--bg)", padding: "20px" }}>
            <div className="label-sm" style={{ marginBottom: 4 }}>// Ecosystem TVL</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 700, color: "var(--accent)" }}>
              ${totalTVL >= 1_000_000 ? (totalTVL / 1_000_000).toFixed(1) + "M" : (totalTVL / 1000).toFixed(0) + "K"}
            </div>
            <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>across all projects</div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <div className="label">// project tokens</div>
          <div><h2 className="display-md">Sub-Tokens</h2></div>
        </div>
        {projectTokens.length === 0 ? (
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "40px", textAlign: "center", color: "var(--muted)", fontSize: 12 }}>
            No project tokens yet.
          </div>
        ) : (
          <div style={{ background: "var(--bg)", border: "1px solid var(--border)", overflow: "hidden" }}>
            <div style={{ background: "var(--surface)", padding: "10px 16px", display: "grid", gridTemplateColumns: "100px 1fr 90px 90px 90px 80px", gap: 12, fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              <div>Token</div>
              <div>Project</div>
              <div>Price</div>
              <div>TVL</div>
              <div>Investors</div>
              <div></div>
            </div>
            {projectTokens.map(p => (
              <div key={p.slug} style={{ padding: "12px 16px", display: "grid", gridTemplateColumns: "100px 1fr 90px 90px 90px 80px", gap: 12, alignItems: "center", borderTop: "1px solid var(--border)" }}>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--accent)" }}>{p.tokenSymbol}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{p.title}</div>
                  <div style={{ fontSize: 10, color: "var(--muted)" }}>{p.tagline}</div>
                </div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--accent)" }}>{p.tokenPrice}</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>{p.tvl}</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>{p.investors}</div>
                <Link href={`/projects/${p.slug}`} className="btn-connect" style={{ fontSize: 9, padding: "4px 10px", textDecoration: "none", textAlign: "center" }}>
                  View →
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="section">
        <div className="section-header">
          <div className="label">// stake</div>
          <div><h2 className="display-md">Stake $SCOM</h2></div>
        </div>
        <div style={{ background: "var(--surface)", border: "1px solid var(--border-accent)", padding: "60px 32px", textAlign: "center" }}>
          <div style={{ fontSize: 32, marginBottom: 16 }}>⏳</div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 22, color: "var(--accent)", marginBottom: 12 }}>
            Coming after $SCOM TGE
          </div>
          <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6, maxWidth: 460, margin: "0 auto" }}>
            Staking opens after the $SCOM token generation event. Follow{" "}
            <a href="https://twitter.com/supercompute_io" target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)" }}>
              @supercompute_io
            </a>{" "}
            for the date.
          </p>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--muted)", marginTop: 24, letterSpacing: "0.1em", textTransform: "uppercase" }}>
            // staking module · not yet armed
          </div>
        </div>
      </section>

      <Footer />
    </Layout>
  )
}
