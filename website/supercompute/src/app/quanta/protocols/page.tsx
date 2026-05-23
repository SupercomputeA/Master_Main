import Layout from "@/components/Layout"
import Link from "next/link"
import fs from "fs"
import path from "path"

const PROTOCOLS_DIR = "/Users/QSMolt/TSM II/TCM II/HQ II/04 NewsDesk/Protocol Evaluation"

function parseFrontmatter(content: string) {
  const fm: Record<string, string | string[]> = {}
  const match = content.match(/^---\n([\s\S]*?)\n---/)
  if (!match) return fm
  const lines = match[1].split("\n")
  let currentKey = ""
  let currentValue = ""

  for (const line of lines) {
    const kvMatch = line.match(/^(\w+):\s*(.*)/)
    if (kvMatch) {
      if (currentKey) {
        fm[currentKey] = currentValue.trim()
      }
      currentKey = kvMatch[1]
      currentValue = kvMatch[2]
    } else if (line.startsWith("  ") && currentKey) {
      currentValue += "\n" + line.trim()
    }
  }
  if (currentKey) {
    fm[currentKey] = currentValue.trim()
  }
  return fm
}

function getProtocols() {
  try {
    if (!fs.existsSync(PROTOCOLS_DIR)) return []
    const files = fs.readdirSync(PROTOCOLS_DIR).filter((f) => f.endsWith(".md"))

    return files.map((file) => {
      const fullPath = path.join(PROTOCOLS_DIR, file)
      const content = fs.readFileSync(fullPath, "utf-8")
      const fm = parseFrontmatter(content)

      // Extract title from first H1
      const titleMatch = content.match(/^#\s+(.+)/m)
      const title = titleMatch ? titleMatch[1] : file.replace(".md", "")
      // Extract protocol number
      const numMatch = file.match(/ND-PROTOCOL-(\d+)/)
      const protocolNum = numMatch ? numMatch[1] : "—"

      return {
        file,
        title,
        protocolNum,
        status: String(fm.status || "draft"),
        metaThemes: fm.meta_themes || "",
        type: fm.type || "protocol-evaluation",
        created: fm.created || "—",
      }
    })
  } catch {
    return []
  }
}

const protocols = getProtocols()

const statusColor = (status: string) => {
  const map: Record<string, string> = {
    draft: "var(--muted)",
    "in-review": "var(--gold)",
    published: "var(--accent)",
  }
  return map[status] || map.draft
}

export default function QuantProtocolsPage() {
  return (
    <Layout title="SUPERCOMPUTE · Protocol Evaluations">
      <section className="hero">
        <div className="hero-kicker">
          <div className="status-dot"></div>
          <span className="label">// quanta · protocols</span>
        </div>
        <h1 className="display-xl hero-title">
          Protocol<br />
          <em>Evaluations</em>
        </h1>
        <p className="hero-sub">
          The NewsDesk Protocol Evaluation series.
          Every protocol documented. Every position declared.
        </p>
      </section>

      <section className="section">
        <div className="section-header">
          <div className="label">// newsdesk · protocol-series</div>
          <div>
            <h2 className="display-md">Series</h2>
          </div>
        </div>

        {protocols.length === 0 ? (
          <div
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              padding: "40px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                color: "var(--muted)",
                marginBottom: 8,
              }}
            >
              // NO PROTOCOLS FOUND
            </div>
            <p
              style={{
                color: "var(--muted)",
                fontFamily: "var(--font-m)",
                fontSize: "0.8rem",
              }}
            >
              Create protocols at{" "}
              <code
                style={{ color: "var(--accent)", fontSize: "0.75rem" }}
              >
                HQ II/04 NewsDesk/Protocol Evaluation/
              </code>
            </p>
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 1,
              background: "var(--border)",
              border: "1px solid var(--border)",
            }}
          >
            {/* Table Header */}
            <div
              style={{
                background: "var(--bg-alt)",
                padding: "10px 20px",
                display: "grid",
                gridTemplateColumns: "60px 1fr 90px 1fr 80px",
                gap: 16,
                fontFamily: "var(--font-mono)",
                fontSize: 9,
                letterSpacing: "0.1em",
                color: "var(--muted)",
                textTransform: "uppercase",
              }}
            >
              <div>// #</div>
              <div>// Protocol</div>
              <div>// Status</div>
              <div>// Meta Themes</div>
              <div>// Date</div>
            </div>

            {/* Rows */}
            {protocols.map((p) => (
              <div
                key={p.file}
                style={{
                  background: "var(--bg)",
                  padding: "16px 20px",
                  display: "grid",
                  gridTemplateColumns: "60px 1fr 90px 1fr 80px",
                  gap: 16,
                  alignItems: "center",
                  cursor: "pointer",
                }}
                onClick={() =>
                  window.open(
                    `/newsdesk/protocols/${p.protocolNum}`,
                    "_blank"
                  )
                }
                onMouseEnter={(e) => {
                  ;(
                    e.currentTarget as HTMLElement
                  ).style.background = "var(--surface)"
                }}
                onMouseLeave={(e) => {
                  ;(e.currentTarget as HTMLElement).style.background =
                    "var(--bg)"
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 10,
                    color: "var(--accent)",
                  }}
                >
                  {p.protocolNum}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: 14,
                    color: "var(--fg)",
                    textTransform: "uppercase",
                  }}
                >
                  {p.title}
                </div>
                <div>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 9,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      padding: "4px 8px",
                      border: "1px solid var(--border)",
                      color:
                        statusColor(p.status as string)
                    }}
                  >
                    {p.status}
                  </span>
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 9,
                    color: "var(--muted)",
                    display: "flex",
                    gap: 6,
                    flexWrap: "wrap",
                  }}
                >
                  {(Array.isArray(p.metaThemes)
                    ? p.metaThemes
                    : p.metaThemes
                    ? p.metaThemes.split(",")
                    : []
                  )
                    .slice(0, 3)
                    .map((t: string) => (
                      <span
                        key={t}
                        style={{
                          background: "var(--border)",
                          padding: "2px 6px",
                        }}
                      >
                        {t.trim()}
                      </span>
                    ))}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 10,
                    color: "var(--muted)",
                  }}
                >
                  {p.created !== "—" ? p.created.slice(0, 10) : "—"}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="section">
        <div className="section-header">
          <div className="label">// quick-create</div>
          <div>
            <h2 className="display-md">Start New Protocol</h2>
          </div>
        </div>
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            padding: "20px",
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <a href="/newsdesk" className="btn btn-gold">
            Open NewsDesk CMS →
          </a>
          <a href="/app/quanta" className="btn">
            ← Back to Quanta
          </a>
        </div>
      </section>
    </Layout>
  )
}