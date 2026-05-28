const projects = [
  { type: "TOKEN", name: "The Glyph Foundry", detail: "Token launch · 52K USDC raised · 684 backers", tags: [{ label: "Funded", cls: "success" }, { label: "Base", cls: "" }] },
  { type: "AGENT", name: "KNIGHT Open-Source", detail: "Agent build-out · TradeDesk shipped May 2026", tags: [{ label: "Shipped", cls: "active" }, { label: "TradeDesk", cls: "" }] },
  { type: "TREASURY", name: "Bracket Studio", detail: "DAO treasury ops · 1.2M USDC under ops · 0 incidents", tags: [{ label: "Live", cls: "active" }, { label: "On-chain", cls: "" }] },
  { type: "MIGRATION", name: "Spool Protocol", detail: "L1 → Base migration · 48-hour cutover", tags: [{ label: "Done", cls: "success" }, { label: "Base", cls: "" }] },
]

export default function Projects() {
  return (
    <section className="section" id="projects">
      <div className="section-header">
        <div className="label">// ls ./work</div>
        <div><h2 className="display-md">Recent Work</h2></div>
      </div>
      <div className="projects-list">
        {projects.map((proj, i) => (
          <div className="proj-row" key={i}>
            <div className="proj-type">{proj.type}</div>
            <div>
              <div className="proj-name">{proj.name}</div>
              <div className="proj-detail">{proj.detail}</div>
            </div>
            <div className="proj-tags">
              {proj.tags.map((tag, j) => (
                <span className={`tag ${tag.cls}`} key={j}>{tag.label}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
