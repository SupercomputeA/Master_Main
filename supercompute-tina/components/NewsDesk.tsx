const articles = [
  { cat: "Sovereignty", title: "SIWE Auth and the End of Password Logins", meta: "Apr 28 · 7 min read" },
  { cat: "Dispatch", title: "Phase 1 Dispatch — What Shipped This Week", meta: "Apr 22 · 4 min read" },
  { cat: "Intelligence", title: "The Cyborg Agency: 1 Human + 13 Agents", meta: "Apr 12 · 6 min read" },
]

export default function NewsDesk() {
  return (
    <section className="section" id="newsdesk">
      <div className="section-header">
        <div className="label">// ./newsdesk --latest</div>
        <div><h2 className="display-md">NewsDesk</h2></div>
      </div>
      <div className="news-grid">
        {articles.map((a, i) => (
          <div className="news-card" key={i}>
            <div className="news-cat">{a.cat}</div>
            <div className="news-title">{a.title}</div>
            <div className="news-meta">{a.meta}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
