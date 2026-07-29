import type { GetStaticProps } from "next"
import Link from "next/link"
import PublicLayout from "../components/PublicLayout"
import Footer from "../components/Footer"
import { getAllProjects, type Project } from "../lib/content"

export const getStaticProps: GetStaticProps = async () => {
  const projects = await getAllProjects()
  return { props: { projects } }
}

export default function Token({ projects }: { projects: Project[] }) {
  const projectTokens = projects.filter(p => p.tokenSymbol)

  return (
    <PublicLayout title="SUPERCOMPUTE · Token">
      <section className="hero" id="token">
        <div className="hero-kicker">
          <div className="status-dot" />
          <span className="label">// token</span>
        </div>
        <h1 className="display-xl hero-title">
          $QUANTA<br /><em>TOKEN</em>
        </h1>
        <p className="hero-sub">
          The builder coin on Base Chain. Not yet deployed — pre-TGE.
          Token gating is live and reads on-chain balances. When QUANTA launches,
          stakers earn from protocol revenue.
        </p>
        <div className="hero-meta">
          <div className="meta-item">
            <div className="label-sm">// Network</div>
            <div className="val">Base L2</div>
          </div>
          <div className="meta-item">
            <div className="label-sm">// Contract</div>
            <div className="val" style={{ fontSize: 10, fontFamily: "var(--font-mono)" }}>0x5ACD…371A</div>
          </div>
          <div className="meta-item">
            <div className="label-sm">// Status</div>
            <div className="val">Pre-TGE</div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <div className="label">// ecosystem</div>
          <div><h2 className="display-md">Ecosystem Status</h2></div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1, background: "var(--border)", border: "1px solid var(--border)" }}>
          <div style={{ background: "var(--bg)", padding: "20px" }}>
            <div className="label-sm" style={{ marginBottom: 4 }}>// Projects</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 700, color: "var(--accent)" }}>{projects.length}</div>
            <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>in development</div>
          </div>
          <div style={{ background: "var(--bg)", padding: "20px" }}>
            <div className="label-sm" style={{ marginBottom: 4 }}>// Project Tokens</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 700, color: "var(--accent)" }}>{projectTokens.length}</div>
            <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>planned, none deployed</div>
          </div>
          <div style={{ background: "var(--bg)", padding: "20px" }}>
            <div className="label-sm" style={{ marginBottom: 4 }}>// Capital Raised</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 700, color: "var(--accent)" }}>$0</div>
            <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>self-funded, no external raise</div>
          </div>
          <div style={{ background: "var(--bg)", padding: "20px" }}>
            <div className="label-sm" style={{ marginBottom: 4 }}>// TVL</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 700, color: "var(--accent)" }}>$0</div>
            <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>pre-launch</div>
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
            <div style={{ background: "var(--surface)", padding: "10px 16px", display: "grid", gridTemplateColumns: "100px 1fr 90px 90px 80px", gap: 12, fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              <div>Token</div>
              <div>Project</div>
              <div>Price</div>
              <div>Status</div>
              <div></div>
            </div>
            {projectTokens.map(p => (
              <div key={p.slug} style={{ padding: "12px 16px", display: "grid", gridTemplateColumns: "100px 1fr 90px 90px 80px", gap: 12, alignItems: "center", borderTop: "1px solid var(--border)" }}>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--accent)" }}>{p.tokenSymbol}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{p.title}</div>
                  <div style={{ fontSize: 10, color: "var(--muted)" }}>{p.tagline}</div>
                </div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--muted)" }}>{p.tokenPrice || "pre-TGE"}</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--muted)" }}>pre-TGE</div>
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
            Coming after QUANTA TGE
          </div>
          <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6, maxWidth: 460, margin: "0 auto" }}>
            Staking opens after the QUANTA token generation event. Follow{" "}
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
    </PublicLayout>
  )
}
