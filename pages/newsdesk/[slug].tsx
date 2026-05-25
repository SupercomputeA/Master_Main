import { useRouter } from "next/router"
import Head from "next/head"
import { useState, useEffect, useRef } from "react"
import type { GetStaticPaths, GetStaticProps } from "next"
import { TinaMarkdown } from "tinacms/dist/rich-text"
import type { TinaMarkdownContent } from "tinacms/dist/rich-text"
import Layout from "../../components/Layout"
import Footer from "../../components/Footer"
import { useAuth } from "../../lib/auth"
import { client } from "../../tina/__generated__/client"
import KnowledgeGraph from "../../components/KnowledgeGraph"
import KGChat from "../../components/KGChat"
import type { PostQuery } from "../../tina/__generated__/types"

type KGNode = {
  id: string
  label: string
  type: string
  description?: string
  properties?: Record<string, string>
}

type KGEdge = [string, string, string?]

type GraphData = {
  nodes: KGNode[]
  edges: KGEdge[]
}

type Comment = {
  id: string
  author: string
  avatar: string
  content: string
  timestamp: string
  kgReference?: {
    nodeId: string
    nodeLabel: string
    x: number
    y: number
    note: string
  }
}

const TYPE_COLORS: Record<string, string> = {
  officer: "#f59e0b",
  incident: "#0ea5e9",
  misconduct: "#ef4444",
  department: "#8b5cf6",
  complaint: "#06b6d4",
  protocol: "#10b981",
  agent: "#ff6b35",
  project: "#a855f7",
  token: "#fbbf24",
  member: "#60a5fa",
  default: "#64748b",
}

const ARTICLE_IMAGE = "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1400&h=500&fit=crop"

const DEMO_GRAPH: GraphData = {
  nodes: [
    { id: "off-1", label: "Officer A", type: "officer", description: "Badge #12458. Sergeant. Assigned to Precinct 14. 9 years on force.", properties: { badge: "12458", rank: "Sergeant", precinct: "Brooklyn", hireDate: "2015-03-12" } },
    { id: "off-2", label: "Officer B", type: "officer", description: "Badge #8934. PO. Assigned to Precinct 14. 6 years on force.", properties: { badge: "8934", rank: "PO", precinct: "Brooklyn", hireDate: "2018-07-22" } },
    { id: "off-3", label: "Officer C", type: "officer", description: "Badge #11023. Sergeant. Assigned to Precinct 75. 12 years on force.", properties: { badge: "11023", rank: "SGT", precinct: "Brooklyn", hireDate: "2012-11-05" } },
    { id: "inc-1", label: "Stop 2023", type: "incident", description: "Stop and frisk on June 15, 2023 at Nostrand Ave & Atlantic Ave. Subject matched description.", properties: { type: "stop_and_frisk", date: "2023-06-15", location: "Bedford-Stuyvesant" } },
    { id: "inc-2", label: "Force 2022", type: "incident", description: "Use of force during arrest on November 20, 2022 in Bedford-Stuyvesant.", properties: { type: "use_of_force", date: "2022-11-20", location: "Bedford-Stuyvesant" } },
    { id: "mis-1", label: "Complaint", type: "misconduct", description: "False statement allegation. Settlement: $0. Filed June 18, 2023.", properties: { type: "false_statement", settlement: "$0", date: "2023-06-18" } },
    { id: "mis-2", label: "Allegation", type: "misconduct", description: "Unjustified force. Settlement: $45,000. Filed November 25, 2022.", properties: { type: "unjustified_force", settlement: "$45,000", date: "2022-11-25" } },
    { id: "dept-1", label: "Precinct 14", type: "department", description: "30 Bergen St, Brooklyn, NY. Covers Bedford-Stuyvesant, Crown Heights.", properties: { address: "30 Bergen St, Brooklyn", borough: "Brooklyn" } },
    { id: "comp-1", label: "CCRB Case", type: "complaint", description: "CCRB-2023-0892. Sustained. 16-day suspension. Allegation: excessive force.", properties: { caseNumber: "CCRB-2023-0892", status: "sustained", outcome: "16-day suspension" } },
  ],
  edges: [
    ["off-1", "inc-1", "involved_in"],
    ["off-1", "inc-2", "involved_in"],
    ["off-2", "inc-2", "involved_in"],
    ["off-3", "inc-1", "involved_in"],
    ["inc-1", "mis-1", "alleged"],
    ["inc-2", "mis-2", "alleged"],
    ["mis-1", "comp-1", "connected_to"],
    ["off-1", "dept-1", "assigned_to"],
    ["off-2", "dept-1", "assigned_to"],
    ["off-3", "dept-1", "assigned_to"],
  ],
}

const DEMO_COMMENTS: Comment[] = [
  {
    id: "1",
    author: "Marcus Webb",
    avatar: "MW",
    content: "The clustering of complaints in Precinct 14 is significant. Notice how Officer A and Officer B both connect to the same incident.",
    timestamp: "2 hours ago",
    kgReference: { nodeId: "dept-1", nodeLabel: "Precinct 14", x: 0.5, y: 0.15, note: "High complaint density area" }
  },
  {
    id: "2",
    author: "Sarah Chen",
    avatar: "SC",
    content: "The $45k settlement for the 2022 use of force case seems low given the pattern. Can we cross-reference with the CCRB case outcomes?",
    timestamp: "5 hours ago",
    kgReference: { nodeId: "mis-2", nodeLabel: "Allegation", x: 0.85, y: 0.7, note: "Settlement amount under review" }
  },
  {
    id: "3",
    author: "James Torres",
    avatar: "JT",
    content: "Officer C's involvement in the stop_and_frisk incident requires further investigation. The description mentions 'subject matched description' which is a common pretext.",
    timestamp: "1 day ago",
    kgReference: { nodeId: "off-3", nodeLabel: "Officer C", x: 0.5, y: 0.7, note: "Pattern of stops" }
  }
]

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

  const [graphData, setGraphData] = useState<GraphData | null>(null)
  const [selectedNode, setSelectedNode] = useState<KGNode | null>(null)
  const [kgLoading, setKgLoading] = useState(true)
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null)
  const [commentText, setCommentText] = useState("")
  const kgRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (article?.kgQuery && article.access !== "subscriber") {
      const timer = setTimeout(() => {
        setGraphData(DEMO_GRAPH)
        setKgLoading(false)
      }, 800)
      return () => clearTimeout(timer)
    } else {
      setKgLoading(false)
    }
  }, [article?.kgQuery])

  const handleNodeClick = (node: KGNode) => {
    setSelectedNode(node)
    setSelectedComment(null)
  }

  const handleCommentKGRef = (comment: Comment) => {
    setSelectedComment(comment)
    setSelectedNode(null)
    const node = graphData?.nodes.find(n => n.id === comment.kgReference?.nodeId)
    if (node) {
      setSelectedNode(node)
    }
  }

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
              Interactive knowledge graph — scroll to zoom, drag to pan, click nodes for details
            </div>
          </div>
        </div>

{!kgLoading && graphData && (
          <section style={{ padding: "0 24px 32px" }}>
            <div style={{ marginBottom: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div className="label" style={{ color: "var(--accent)" }}>// entity map</div>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--muted)" }}>
                  {graphData.nodes.length} nodes · {graphData.edges.length} edges
                </span>
              </div>
              {selectedNode && (
                <button
                  onClick={() => setSelectedNode(null)}
                  style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--muted)", background: "transparent", border: "1px solid var(--border)", padding: "4px 12px", cursor: "pointer" }}
                >
                  Close
                </button>
              )}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: selectedNode ? "1fr 380px" : "1fr", gap: 16, alignItems: "start" }}>
              <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid rgba(50,60,80,0.5)", background: "#0a0f17" }}>
                <KnowledgeGraph
                  data={graphData}
                  height={520}
                  onNodeClick={handleNodeClick}
                  selectedNodeId={selectedNode?.id || null}
                />
              </div>

              {selectedNode && (
                <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                      <div style={{ width: 12, height: 12, borderRadius: "50%", background: TYPE_COLORS[selectedNode.type] || TYPE_COLORS.default }} />
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--muted)", textTransform: "uppercase" }}>{selectedNode.type}</span>
                    </div>
                    <h3 style={{ fontFamily: "var(--font-display)", fontSize: 20, color: "var(--accent)", marginBottom: 12 }}>{selectedNode.label}</h3>
                    {selectedNode.description && (
                      <p style={{ fontFamily: "var(--font-m)", fontSize: 13, color: "var(--fg)", lineHeight: 1.6, marginBottom: 16 }}>{selectedNode.description}</p>
                    )}
                    {selectedNode.properties && (
                      <div style={{ borderTop: "1px solid var(--border)", paddingTop: 12, marginTop: 12 }}>
                        <div className="label-sm" style={{ marginBottom: 8, color: "var(--accent)" }}>// properties</div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                          {Object.entries(selectedNode.properties).map(([key, value]) => (
                            <div key={key} style={{ display: "flex", justifyContent: "space-between", fontFamily: "var(--font-mono)", fontSize: 11 }}>
                              <span style={{ color: "var(--muted)" }}>{key}</span>
                              <span style={{ color: "var(--fg)" }}>{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <div style={{ marginTop: 16, borderTop: "1px solid var(--border)", paddingTop: 12 }}>
                      <div className="label-sm" style={{ marginBottom: 8, color: "var(--accent)" }}>// connections</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {graphData.edges.filter(e => e[0] === selectedNode.id || e[1] === selectedNode.id).map((e, i) => {
                          const otherId = e[0] === selectedNode.id ? e[1] : e[0]
                          const otherNode = graphData.nodes.find(n => n.id === otherId)
                          return (
                            <div key={i} style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--teal)", background: "var(--bg)", border: "1px solid var(--border)", padding: "4px 8px", borderRadius: 4 }}>
                              {otherNode?.label} ({e[2]})
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>

                  <KGChat graphData={graphData} selectedNodeId={selectedNode.id} />
                </div>
              )}
            </div>

            {!kgLoading && (
              <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
                {graphData.nodes.map(n => (
                  <div key={n.id} style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 10px", background: selectedNode?.id === n.id ? "var(--accent)" : "var(--bg)", border: "1px solid var(--border)", borderRadius: 20, cursor: "pointer", transition: "all 0.2s" }}
                    onClick={() => handleNodeClick(n)}
                  >
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: TYPE_COLORS[n.type] || TYPE_COLORS.default }} />
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: selectedNode?.id === n.id ? "var(--bg)" : "var(--fg)" }}>{n.label}</span>
                  </div>
                ))}
              </div>
            )}
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
                    {article.seo.keywords.split(",").map((kw, i) => (
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
                  placeholder="Add a comment... reference nodes in the KG by clicking them first."
                  style={{ width: "100%", minHeight: 80, background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 8, padding: "12px 16px", fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--fg)", resize: "vertical" }}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
                  {selectedNode && (
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--teal)" }}>Citing:</span>
                      <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 8px", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 4 }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: TYPE_COLORS[selectedNode.type] }} />
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--fg)" }}>{selectedNode.label}</span>
                      </div>
                    </div>
                  )}
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
                        onClick={() => handleCommentKGRef(comment)}
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