"use client"

interface Protocol {
  file: string
  title: string
  protocolNum: string
  status: string | string[]
  metaThemes: string | string[]
  created: string | string[]
}

interface NewsDeskProtocolRowProps {
  p: Protocol
}

const statusColor = (status: string | string[]) => {
  const s = Array.isArray(status) ? status[0] : status
  const map: Record<string, string> = {
    draft: "var(--muted)",
    "in-review": "var(--gold)",
    published: "var(--accent)",
  }
  return map[s] || map.draft
}

export default function NewsDeskProtocolRow({ p }: NewsDeskProtocolRowProps) {
  const metaThemes = Array.isArray(p.metaThemes)
    ? p.metaThemes
    : p.metaThemes
    ? (p.metaThemes as string).split(",")
    : []

  return (
    <a
      href={`/newsdesk/protocols/${p.protocolNum}`}
      style={{
        display: "block",
        background: "var(--bg)",
        padding: "20px 24px",
        cursor: "pointer",
        textDecoration: "none",
      }}
      onMouseEnter={(e) => {
        ;(e.currentTarget as HTMLElement).style.background = "var(--surface)"
      }}
      onMouseLeave={(e) => {
        ;(e.currentTarget as HTMLElement).style.background = "var(--bg)"
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 8,
        }}
      >
        <div style={{ display: "flex", gap: 16, alignItems: "baseline" }}>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              color: "var(--accent)",
              minWidth: 32,
            }}
          >
            #{p.protocolNum}
          </span>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 18,
              color: "var(--fg)",
              textTransform: "uppercase",
            }}
          >
            {p.title}
          </span>
        </div>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 9,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            padding: "4px 8px",
            border: "1px solid var(--border)",
            color: statusColor(p.status as string),
          }}
        >
          {p.status}
        </span>
      </div>

      <div
        style={{
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
          marginTop: 8,
        }}
      >
        {metaThemes.slice(0, 4).map((t: string) => (
          <span
            key={t}
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 8,
              color: "var(--muted)",
              background: "var(--border)",
              padding: "2px 6px",
            }}
          >
            {t.trim()}
          </span>
        ))}
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 9,
            color: "var(--muted)",
            marginLeft: "auto",
          }}
        >
          {p.created !== "—" ? (Array.isArray(p.created) ? p.created[0].slice(0, 10) : (p.created as string).slice(0, 10)) : "—"}
        </span>
      </div>
    </a>
  )
}
