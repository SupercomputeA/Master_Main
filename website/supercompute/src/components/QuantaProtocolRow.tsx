"use client"

interface Protocol {
  file: string
  title: string
  protocolNum: string
  status: string | string[]
  metaThemes: string | string[]
  created: string | string[]
}

interface QuantaProtocolRowProps {
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

export default function QuantaProtocolRow({ p }: QuantaProtocolRowProps) {
  const metaThemes = Array.isArray(p.metaThemes)
    ? p.metaThemes
    : p.metaThemes
    ? (p.metaThemes as string).split(",")
    : []

  return (
    <div
      style={{
        background: "var(--bg)",
        padding: "16px 20px",
        display: "grid",
        gridTemplateColumns: "60px 1fr 90px 1fr 80px",
        gap: 16,
        alignItems: "center",
        cursor: "pointer",
      }}
      onClick={() => window.open(`/newsdesk/protocols/${p.protocolNum}`, "_blank")}
      onMouseEnter={(e) => {
        ;(e.currentTarget as HTMLElement).style.background = "var(--surface)"
      }}
      onMouseLeave={(e) => {
        ;(e.currentTarget as HTMLElement).style.background = "var(--bg)"
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
            color: statusColor(p.status as string),
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
        {metaThemes.slice(0, 3).map((t: string) => (
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
        {p.created !== "—" ? (Array.isArray(p.created) ? p.created[0].slice(0, 10) : (p.created as string).slice(0, 10)) : "—"}
      </div>
    </div>
  )
}
