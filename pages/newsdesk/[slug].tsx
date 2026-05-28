import Head from "next/head"
import { useState, useMemo } from "react"
import type { GetStaticPaths, GetStaticProps } from "next"
import { TinaMarkdown } from "tinacms/dist/rich-text"
import type { TinaMarkdownContent } from "tinacms/dist/rich-text"
import Layout from "../../components/Layout"
import Footer from "../../components/Footer"
import { useAuth } from "../../lib/auth"
import { client } from "../../tina/__generated__/client"
import EntityMap from "../../components/entity-map"
import type { EntityMapData } from "../../components/entity-map"
import type { PostQuery } from "../../tina/__generated__/types"

type Comment = {
  id: string
  author: string
  avatar: string
  content: string
  timestamp: string
  kgReference?: {
    nodeId: string
    nodeLabel: string
    note: string
  }
}

const ARTICLE_IMAGE = "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1400&h=500&fit=crop"

const DEMO_GRAPH: EntityMapData = {
  nodes: [
    { id: "off-1", label: "Officer A", type: "person", description: "Badge #12458. Sergeant. Assigned to Precinct 14. 9 years on force.", properties: { badge: "12458", rank: "Sergeant", precinct: "Brooklyn", hireDate: "2015-03-12" } },
    { id: "off-2", label: "Officer B", type: "person", description: "Badge #8934. PO. Assigned to Precinct 14. 6 years on force.", properties: { badge: "8934", rank: "PO", precinct: "Brooklyn", hireDate: "2018-07-22" } },
    { id: "off-3", label: "Officer C", type: "person", description: "Badge #11023. Sergeant. Assigned to Precinct 75. 12 years on force.", properties: { badge: "11023", rank: "SGT", precinct: "Brooklyn", hireDate: "2012-11-05" } },
    { id: "inc-1", label: "Stop 2023", type: "event", description: "Stop and frisk on June 15, 2023 at Nostrand Ave & Atlantic Ave.", datetime: "2023-06-15", location: "Bedford-Stuyvesant" },
    { id: "inc-2", label: "Force 2022", type: "event", description: "Use of force during arrest on November 20, 2022 in Bedford-Stuyvesant.", datetime: "2022-11-20", location: "Bedford-Stuyvesant" },
    { id: "mis-1", label: "Complaint", type: "concept", description: "False statement allegation. Settlement: $0. Filed June 18, 2023.", properties: { type: "false_statement", settlement: "$0" } },
    { id: "mis-2", label: "Allegation", type: "concept", description: "Unjustified force. Settlement: $45,000. Filed November 25, 2022.", properties: { type: "unjustified_force", settlement: "$45,000" } },
    { id: "dept-1", label: "Precinct 14", type: "concept", description: "30 Bergen St, Brooklyn, NY. Covers Bedford-Stuyvesant, Crown Heights.", properties: { address: "30 Bergen St, Brooklyn", borough: "Brooklyn" } },
    { id: "comp-1", label: "CCRB Case", type: "term", description: "CCRB-2023-0892. Sustained. 16-day suspension.", definition: "Civilian Complaint Review Board — independent oversight body that investigates complaints against NYPD officers." },
    { id: "stop-frisk", label: "Stop & Frisk", type: "term", definition: "A practice whereby police temporarily detain, question, and potentially search civilians based on reasonable suspicion." },
    { id: "date-2023", label: "June 2023", type: "date", datetime: "2023-06-15" },
    { id: "date-2022", label: "Nov 2022", type: "date", datetime: "2022-11-20" },
  ],
  edges: [
    { from: "off-1", to: "inc-1", label: "involved_in" },
    { from: "off-1", to: "inc-2", label: "involved_in", weight: 2 },
    { from: "off-2", to: "inc-2", label: "involved_in" },
    { from: "off-3", to: "inc-1", label: "involved_in" },
    { from: "inc-1", to: "mis-1", label: "alleged" },
    { from: "inc-2", to: "mis-2", label: "alleged" },
    { from: "mis-1", to: "comp-1", label: "connected_to" },
    { from: "off-1", to: "dept-1", label: "assigned_to" },
    { from: "off-2", to: "dept-1", label: "assigned_to" },
    { from: "off-3", to: "dept-1", label: "assigned_to" },
    { from: "inc-1", to: "stop-frisk", label: "type_of" },
    { from: "inc-1", to: "date-2023", label: "occurred_on" },
    { from: "inc-2", to: "date-2022", label: "occurred_on" },
  ],
  presets: [
    { id: "overview", label: "Overview", description: "Full entity map" },
    { id: "people", label: "People", filters: ["person"], description: "Officers involved" },
    { id: "timeline", label: "Timeline", filters: ["event", "date"], description: "Chronological view" },
  ],
  narratives: [
    {
      id: "investigation",
      title: "Follow the Pattern",
      description: "Trace the connections from officer to complaint",
      steps: ["off-1", "inc-2", "mis-2", "comp-1", "dept-1"],
    },
  ],
}

const DEMO_COMMENTS: Comment[] = [
  {
    id: "1",
    author: "Marcus Webb",
    avatar: "MW",
    content: "The clustering of complaints in Precinct 14 is significant. Notice how Officer A and Officer B both connect to the same incident.",
    timestamp: "2 hours ago",
    kgReference: { nodeId: "dept-1", nodeLabel: "Precinct 14", note: "High complaint density area" }
  },
  {
    id: "2",
    author: "Sarah Chen",
    avatar: "SC",
    content: "The $45k settlement for the 2022 use of force case seems low given the pattern. Can we cross-reference with the CCRB case outcomes?",
    timestamp: "5 hours ago",
    kgReference: { nodeId: "mis-2", nodeLabel: "Allegation", note: "Settlement amount under review" }
  },
  {
    id: "3",
    author: "James Torres",
    avatar: "JT",
    content: "Officer C's involvement in the stop_and_frisk incident requires further investigation. The description mentions 'subject matched description' which is a common pretext.",
    timestamp: "1 day ago",
    kgReference: { nodeId: "off-3", nodeLabel: "Officer C", note: "Pattern of stops" }
  }
]

export const getStaticPaths: GetStaticPaths = async () => {
  let paths: { params: { slug: string } }[] = []
  try {
    const { data } = await client.queries.postConnection()
    paths = (data.postConnection.edges ?? [])
      .map(e => e?.node?.slug)
      .filter(Boolean)
      .map(slug => ({ params: { slug } }))
  } catch {
    // Tina Cloud not available during build — skip pre-rendering
  }
  return { paths, fallback: 'blocking' }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const slug = params?.slug as string
  try {
    const { data } = await client.queries.post({ relativePath: `${slug}.md` })
    return { props: { data } }
  } catch {
    return { props: { data: null } }
  }
}

export default function ArticleDetail({ data }: { data: PostQuery | null }) {
  const { session } = useAuth()
  const article = data?.post

  if (!article) {
    return (
      <Layout>
        <div style={{ padding: 48, textAlign: 'center' }}>
          <p style={{ color: 'var(--muted)', fontFamily: 'var(--font-mono)', fontSize: 14 }}>
            Article not available. Connect wallet to sync content.
          </p>
        </div>
        <Footer />
      </Layout>
    )
  }

  const [commentText, setCommentText] = useState("")
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null)

  const entityMapData = useMemo((): EntityMapData | null => {
    const kg = article?.knowledgeGraph
    if (kg?.nodes && kg.nodes.length > 0) {
      return {
        nodes: kg.nodes.filter(Boolean).map((n: any) => ({
          id: n.id || "",
          label: n.label || "",
          type: n.type || "concept",
          description: n.description || undefined,
          definition: n.definition || undefined,
          datetime: n.datetime || undefined,
          location: n.location || undefined,
          src: n.src || undefined,
          alt: n.alt || undefined,
          order: n.order ?? undefined,
          prompt: n.prompt || undefined,
        })),
        edges: (kg.edges || []).filter(Boolean).map((e: any) => ({
          from: e.from || "",
          to: e.to || "",
          label: e.label || "",
          weight: e.weight ?? undefined,
        })),
        presets: (kg.presets || []).filter(Boolean).map((p: any) => ({
          id: p.id || "",
          label: p.label || "",
          description: p.description || undefined,
          filters: p.filters ? p.filters.split(",").map((s: string) => s.trim()) : undefined,
          highlightIds: p.highlightIds ? p.highlightIds.split(",").map((s: string) => s.trim()) : undefined,
          focusNodeId: p.focusNodeId || undefined,
        })),
        narratives: (kg.narratives || []).filter(Boolean).map((n: any) => ({
          id: n.id || "",
          title: n.title || "",
          description: n.description || undefined,
          steps: n.steps ? n.steps.split(",").map((s: string) => s.trim()) : [],
        })),
      }
    }
    if (article?.kgQuery) return DEMO_GRAPH
    return null
  }, [article?.knowledgeGraph, article?.kgQuery])

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

        <div style={{ position: "relative", height: "400px", margin: "0 24px", borderRadius: "12px", overflow: "hidden" }}>
          <img src={ARTICLE_IMAGE} alt={article.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "40px 24px 20px", background: "linear-gradient(transparent, rgba(10,14,23,0.95))" }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "rgba(226,232,240,0.7)" }}>
              Interactive entity map — scroll to zoom, drag to pan, pinch on mobile, click nodes for details
            </div>
          </div>
        </div>

        {entityMapData && (
          <section style={{ padding: "0 24px 32px" }}>
            <div style={{ marginBottom: "1rem", display: "flex", alignItems: "center", gap: 12 }}>
              <div className="label" style={{ color: "var(--accent)" }}>// entity map</div>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--muted)" }}>
                {entityMapData.nodes.length} nodes · {entityMapData.edges.length} edges
              </span>
            </div>

            <EntityMap data={entityMapData} height={520} />
          </section>
        )}

        <section className="section">
          <div className="section-header"><div className="label">// article</div><div><h2 className="display-md">{article.title}</h2></div></div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 1, background: "var(--border)", border: "1px solid var(--border)" }}>
            <div style={{ background: "var(--bg)", padding: "32px 28px" }}>
              {blocked ? (
                <div style={{ padding: "60px 24px", textAlign: "center", color: "var(--muted)", fontSize: 13 }}>
                  <div style={{ fontSize: 32, marginBottom: 12 }}>🔒</div>
                  <div style={{ marginBottom: 8 }}>This article is for subscribers only.</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--accent)" }}>Connect your wallet with 500+ $SCOM to unlock.</div>
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
                    {article.seo.keywords.split(",").map((kw: string, i: number) => (
                      <span key={i} style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--muted)", border: "1px solid var(--border)", padding: "3px 8px" }}>{kw.trim()}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {!blocked && (
          <section className="section">
            <div className="section-header"><div className="label">// discussion</div><div><h2 className="display-md">Comments</h2></div></div>

            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
              <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)" }}>
                <textarea
                  placeholder="Add a comment..."
                  style={{ width: "100%", minHeight: 80, background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 8, padding: "12px 16px", fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--fg)", resize: "vertical" }}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                />
                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
                  <button style={{ fontFamily: "var(--font-mono)", fontSize: 11, background: "var(--accent)", color: "var(--bg)", border: "none", padding: "8px 20px", borderRadius: 6, cursor: "pointer" }}>
                    Post Comment
                  </button>
                </div>
              </div>

              <div style={{ padding: "16px 24px" }}>
                {DEMO_COMMENTS.map(comment => (
                  <div key={comment.id} style={{ marginBottom: 20, paddingBottom: 20, borderBottom: "1px solid var(--border)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                      <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--bg)" }}>
                        {comment.avatar}
                      </div>
                      <div>
                        <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--fg)" }}>{comment.author}</div>
                        <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--muted)" }}>{comment.timestamp}</div>
                      </div>
                    </div>
                    <p style={{ fontFamily: "var(--font-m)", fontSize: 13, color: "var(--fg)", lineHeight: 1.6, marginBottom: 12 }}>{comment.content}</p>
                    {comment.kgReference && (
                      <div
                        style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 12px", background: selectedComment?.id === comment.id ? "rgba(201,163,58,0.15)" : "var(--bg)", border: "1px solid var(--border-accent)", borderRadius: 8, cursor: "pointer" }}
                        onClick={() => setSelectedComment(comment)}
                      >
                        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--teal)" }} />
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--teal)" }}>@{comment.kgReference.nodeLabel}</span>
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--muted)" }}>— {comment.kgReference.note}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        <Footer />
      </Layout>
    </>
  )
}