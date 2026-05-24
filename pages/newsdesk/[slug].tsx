import { useRouter } from "next/router"
import Head from "next/head"
import type { GetStaticPaths, GetStaticProps } from "next"
import { TinaMarkdown } from "tinacms/dist/rich-text"
import type { TinaMarkdownContent } from "tinacms/dist/rich-text"
import Layout from "../../components/Layout"
import Footer from "../../components/Footer"
import { useAuth } from "../../lib/auth"
import { client } from "../../tina/__generated__/client"
import type { PostQuery } from "../../tina/__generated__/types"

export const getStaticPaths: GetStaticPaths = async () => {
  const { data } = await client.queries.postConnection()
  const paths = (data.postConnection.edges ?? [])
    .map(e => e?.node?.slug)
    .filter(Boolean)
    .map(slug => ({ params: { slug } }))
  return { paths, fallback: false }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const slug = params?.slug as string
  const { data } = await client.queries.post({ relativePath: `${slug}.md` })
  return { props: { data } }
}

export default function ArticleDetail({ data }: { data: PostQuery }) {
  const router = useRouter()
  const { session } = useAuth()
  const article = data.post

  if (!article) {
    return (
      <Layout title="SUPERCOMPUTE · Article">
        <section className="section">
          <div style={{ padding: "60px 24px", textAlign: "center", color: "var(--muted)", fontSize: 13 }}>Article not found.</div>
        </section>
      </Layout>
    )
  }

  const isGated = article.access === "subscriber"
  const blocked = isGated && !session

  return (
    <>
      <Head>
        <title>{article.seo?.title ?? article.title}</title>
        <meta name="description" content={article.seo?.description ?? article.excerpt ?? ""} />
        <meta name="keywords" content={article.seo?.keywords ?? ""} />
        <meta property="og:title" content={article.seo?.title ?? article.title} />
        <meta property="og:description" content={article.seo?.description ?? article.excerpt ?? ""} />
        {article.seo?.ogImage && <meta property="og:image" content={article.seo.ogImage} />}
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>

      <Layout title={article.seo?.title ?? article.title}>
        <section className="hero" id="article-detail">
          <div className="hero-kicker">
            <div className="status-dot"></div>
            <span className="label">// {article.category}</span>
            {isGated && <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--accent)", border: "1px solid var(--border-accent)", padding: "2px 8px", marginLeft: 8 }}>SUBSCRIBER</span>}
          </div>
          <h1 className="display-xl hero-title" style={{ fontSize: "clamp(28px, 5vw, 48px)" }}>{article.title}</h1>
          <div className="hero-meta" style={{ marginTop: 16 }}>
            <div className="meta-item"><div className="label-sm">// Author</div><div className="val" style={{ color: "var(--accent)" }}>{article.author}</div></div>
            <div className="meta-item"><div className="label-sm">// Published</div><div className="val">{article.date}</div></div>
            <div className="meta-item"><div className="label-sm">// Category</div><div className="val" style={{ color: article.category === "PROTOCOL_EVAL" ? "var(--teal)" : "var(--accent)" }}>{article.category}</div></div>
          </div>
        </section>

        <section className="section">
          <div className="section-header"><div className="label">// article</div><div><h2 className="display-md">{article.title}</h2></div></div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 1, background: "var(--border)", border: "1px solid var(--border)" }}>
            <div style={{ background: "var(--bg)", padding: "32px 28px" }}>
              {blocked ? (
                <div style={{ padding: "60px 24px", textAlign: "center", color: "var(--muted)", fontSize: 13 }}>
                  <div style={{ fontSize: 32, marginBottom: 12 }}>🔒</div>
                  <div style={{ marginBottom: 8 }}>This article is for subscribers only.</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--accent)" }}>
                    Connect your wallet with 500+ $SCOM to unlock.
                  </div>
                </div>
              ) : article.body ? (
                <div style={{ fontSize: 13, color: "var(--fg)", lineHeight: 1.8 }}>
                  <TinaMarkdown content={article.body as TinaMarkdownContent} />
                </div>
              ) : (
                <div style={{ padding: "40px 24px", textAlign: "center", color: "var(--muted)", fontSize: 12 }}>No content.</div>
              )}
            </div>

            <div style={{ background: "var(--bg)", padding: "24px 20px", borderLeft: "1px solid var(--border)" }}>
              <div className="label-sm" style={{ marginBottom: 12 }}>// Details</div>
              <div style={{ fontSize: 11, color: "var(--muted)", lineHeight: 2 }}>
                <div><strong style={{ color: "var(--accent)" }}>Status:</strong> {article.status}</div>
                <div><strong style={{ color: "var(--accent)" }}>Access:</strong> {article.access}</div>
                <div><strong style={{ color: "var(--accent)" }}>Author:</strong> {article.author}</div>
                <div><strong style={{ color: "var(--accent)" }}>Date:</strong> {article.date}</div>
              </div>

              {article.seo?.keywords && (
                <div style={{ marginTop: 20 }}>
                  <div className="label-sm" style={{ marginBottom: 8 }}>// Tags</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {article.seo.keywords.split(",").map((kw, i) => (
                      <span key={i} style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--muted)", border: "1px solid var(--border)", padding: "3px 8px" }}>
                        {kw.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {!blocked && article.protocolEval && (
          <section className="section">
            <div className="section-header"><div className="label">// protocol eval</div><div><h2 className="display-md">Protocol Evaluation</h2></div></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, background: "var(--border)", border: "1px solid var(--border)" }}>
              <div style={{ background: "var(--bg)", padding: "20px" }}>
                <div className="label-sm" style={{ marginBottom: 4 }}>// Protocol</div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 700, color: "var(--accent)" }}>{article.protocolEval.protocol}</div>
                <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{article.protocolEval.chain} · {article.protocolEval.category}</div>
              </div>
              <div style={{ background: "var(--bg)", padding: "20px" }}>
                <div className="label-sm" style={{ marginBottom: 4 }}>// TVL</div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 700, color: "var(--accent)" }}>{article.protocolEval.tvl}</div>
              </div>
              <div style={{ background: "var(--bg)", padding: "20px" }}>
                <div className="label-sm" style={{ marginBottom: 4 }}>// Risk Score</div>
                <div style={{
                  fontFamily: "var(--font-mono)", fontSize: 20, fontWeight: 700,
                  color: article.protocolEval.riskScore === "Low" ? "var(--teal)" :
                         article.protocolEval.riskScore === "Medium" ? "var(--accent)" :
                         article.protocolEval.riskScore === "High" ? "#ff6b35" : "#ff3333",
                }}>{article.protocolEval.riskScore}</div>
              </div>
              <div style={{ background: "var(--bg)", padding: "20px" }}>
                <div className="label-sm" style={{ marginBottom: 4 }}>// Recommendation</div>
                <div style={{
                  fontFamily: "var(--font-mono)", fontSize: 20, fontWeight: 700,
                  color: article.protocolEval.recommendation === "Invest" ? "var(--teal)" :
                         article.protocolEval.recommendation === "Monitor" ? "var(--accent)" :
                         "#ff6b35",
                }}>{article.protocolEval.recommendation}</div>
              </div>
              <div style={{ background: "var(--bg)", padding: "20px" }}>
                <div className="label-sm" style={{ marginBottom: 4 }}>// Audit</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--fg)" }}>{article.protocolEval.audit}</div>
                <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 2 }}>Audited by: {article.protocolEval.auditedBy}</div>
              </div>
              <div style={{ background: "var(--bg)", padding: "20px" }}>
                <div className="label-sm" style={{ marginBottom: 4 }}>// Launch</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 14, color: "var(--fg)" }}>{article.protocolEval.launchDate}</div>
              </div>
            </div>
          </section>
        )}

        {!blocked && article.knowledgeGraph && (
          <section className="section">
            <div className="section-header"><div className="label">// knowledge graph</div><div><h2 className="display-md">Entity Map</h2></div></div>
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "28px 24px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                <div>
                  <div className="label-sm" style={{ marginBottom: 8 }}>Nodes ({(article.knowledgeGraph.nodes ?? []).length})</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    {(article.knowledgeGraph.nodes ?? []).filter(Boolean).map((n) => (
                      <div key={n!.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", background: "var(--bg)", border: "1px solid var(--border)" }}>
                        <span style={{
                          width: 8, height: 8, borderRadius: "50%",
                          background: n!.type === "protocol" ? "var(--accent)" :
                                      n!.type === "token" ? "var(--teal)" :
                                      n!.type === "agent" ? "#ff6b35" :
                                      n!.type === "person" ? "#a855f7" : "var(--muted)",
                        }}></span>
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--fg)" }}>{n!.id}</span>
                        <span style={{ fontSize: 9, color: "var(--muted)", marginLeft: "auto" }}>{n!.type}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="label-sm" style={{ marginBottom: 8 }}>Edges ({(article.knowledgeGraph.edges ?? []).length})</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    {(article.knowledgeGraph.edges ?? []).filter(Boolean).map((e, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", background: "var(--bg)", border: "1px solid var(--border)" }}>
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--accent)" }}>{e!.from}</span>
                        <span style={{ fontSize: 9, color: "var(--muted)" }}>→</span>
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--teal)" }}>{e!.to}</span>
                        <span style={{ fontSize: 9, color: "var(--muted)", marginLeft: "auto", fontStyle: "italic" }}>{e!.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        <Footer />
      </Layout>
    </>
  )
}
