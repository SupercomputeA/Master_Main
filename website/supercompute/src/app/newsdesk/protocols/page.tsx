import Layout from "@/components/Layout"
import Footer from "@/components/Footer"
import fs from "fs"
import path from "path"
import NewsDeskProtocolRow from "@/components/NewsDeskProtocolRow"

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
      if (currentKey) fm[currentKey] = currentValue.trim()
      currentKey = kvMatch[1]
      currentValue = kvMatch[2]
    } else if (line.startsWith("  ") && currentKey) {
      currentValue += "\n" + line.trim()
    }
  }
  if (currentKey) fm[currentKey] = currentValue.trim()
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
      const titleMatch = content.match(/^#\s+(.+)/m)
      const title = titleMatch ? titleMatch[1] : file.replace(".md", "")
      const numMatch = file.match(/ND-PROTOCOL-(\d+)/)
      const protocolNum = numMatch ? numMatch[1] : "—"

      return {
        file,
        title,
        protocolNum,
        status: String(fm.status || "draft"),
        metaThemes: fm.meta_themes || "",
        signals: fm.signals || "",
        type: fm.type || "protocol-evaluation",
        created: fm.created || "—",
        tags: fm.tags || "",
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

export default function NewsDeskProtocolsPage() {
  return (
    <Layout title="SUPERCOMPUTE · Protocol Evaluation Series">
      <section className="hero" id="newsdesk">
        <div className="hero-kicker">
          <div className="status-dot"></div>
          <span className="label">// newsdesk · protocol-series</span>
        </div>
        <h1 className="display-xl hero-title">
          Protocol<br />
          <em>Evaluations</em>
        </h1>
        <p className="hero-sub">
          Every protocol documented. Every position declared.
          Counter-narrative infrastructure for the on-chain era.
        </p>
      </section>

      {/* Publishing Signals Banner */}
      <section className="section">
        <div className="section-header">
          <div className="label">// signals</div>
          <div>
            <h2 className="display-md">Publishing Position</h2>
          </div>
        </div>
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            padding: "16px 20px",
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
          }}
        >
          {[
            ["Black", true],
            ["Anti-Capitalist", true],
            ["Pro-Earth", true],
            ["No Borders", true],
            ["Anti-Patriarchy", true],
            ["Anti-Racial Chauvinism", true],
            ["Pro-Technology", true],
            ["Pro-AI", true],
            ["Pro-Future Earth", true],
          ].map(([sig, active]) => (
            <span
              key={sig as string}
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 9,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                padding: "4px 10px",
                border: "1px solid var(--border)",
                color: active ? "var(--accent)" : "var(--muted)",
                background: active ? "transparent" : "transparent",
              }}
            >
              {active ? "✓" : "—"} {sig}
            </span>
          ))}
        </div>
      </section>

      {/* Protocol List */}
      <section className="section">
        <div className="section-header">
          <div className="label">// series</div>
          <div>
            <h2 className="display-md">The Protocol Series</h2>
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
              }}
            >
              // PROTOCOLS LOADING
            </div>
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
            {protocols.map((p) => (
              <NewsDeskProtocolRow key={p.file} p={p} />
            ))}
          </div>
        )}
      </section>

      {/* 8-Layer Post Section */}
      <section className="section">
        <div className="section-header">
          <div className="label">// model</div>
          <div>
            <h2 className="display-md">The 8-Layer Post</h2>
          </div>
        </div>
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            padding: "20px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: 1,
            backgroundImage:
              "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(212,175,55,0.03) 10px, rgba(212,175,55,0.03) 20px)",
          }}
        >
          {[
            { layer: "01", name: "Editorial", desc: "The story sourced, human" },
            { layer: "02", name: "Epistemic", desc: "Knowledge graph depth 1+2" },
            { layer: "03", name: "Community", desc: "Counter-narrative defense" },
            { layer: "04", name: "Collectible", desc: "NFT sourcing map" },
            { layer: "05", name: "Financial", desc: "Mint revenue sharing" },
            { layer: "06", name: "Identity", desc: "Contributor styled graph" },
            { layer: "07", name: "Reputation", desc: "On-chain score compounding" },
            { layer: "08", name: "Historical", desc: "Growing desk lineage" },
          ].map((l) => (
            <div
              key={l.layer}
              style={{
                background: "var(--bg)",
                padding: "14px 16px",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 9,
                  color: "var(--accent)",
                  marginBottom: 4,
                }}
              >
                // {l.layer}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 13,
                  color: "var(--fg)",
                  textTransform: "uppercase",
                  marginBottom: 4,
                }}
              >
                {l.name}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 9,
                  color: "var(--muted)",
                }}
              >
                {l.desc}
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </Layout>
  )
}