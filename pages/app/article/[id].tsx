import MemberLayout from "../../../components/MemberLayout"

/* Knowledge Graph Article — faithful port of KnowledgeGraphArticle.dc.html.
   SVG colors are hardcoded (SVG presentation attributes don't resolve CSS vars):
   gold #C9A33A · mono-blue #6FA3E5 · hud-yellow #E0BE3F.
   Statically generated (site is `output: export`); one demo entry for now. */

export function getStaticPaths() {
  return { paths: [{ params: { id: "1" } }], fallback: false }
}

export function getStaticProps() {
  return { props: {} }
}

const RELEASE = [
  { num: "01", title: "Foundations", status: "Published", state: "done" },
  { num: "02", title: "Data Consumption", status: "Published", state: "done" },
  { num: "03", title: "The Vocabulary", status: "Published", state: "done" },
  { num: "04", title: "Self-Custody", status: "Reading Now", state: "current" },
  { num: "05", title: "Smart Connections", status: "Jul 5", state: "" },
  { num: "06", title: "Embeddings", status: "Jul 12", state: "" },
  { num: "07", title: "Synthesis", status: "Jul 19", state: "" },
]

const TIMELINE = [
  { date: "2013 · Origin", title: "The Custody Problem", desc: "Early Base Chain operators confront the tradeoff between convenience and control." },
  { date: "2019 · Shift", title: "Hardware Wallet Era", desc: "Cold storage becomes standard; recovery phrases enter the mainstream vocabulary." },
  { date: "2023 · Evolution", title: "Social Recovery", desc: "Smart accounts distribute trust across guardians, reducing single points of failure." },
  { date: "2026 · Now", title: "The Sovereignty Stack", desc: "Self-custody becomes a composable layer across the metaverse toolset." },
]

const PEOPLE = [
  { av: "QS", name: "quanta_s", role: "Author · NewsDesk intelligence" },
  { av: "KN", name: "knight", role: "Contributor · TradeDesk treasury ops" },
  { av: "SC", name: "Sarah Chen", role: "Reviewer · Security research" },
  { av: "JR", name: "James Rivera", role: "Cited · Governance framework" },
]

const FOR = [
  { text: "Self-custody is the only way to guarantee true ownership — not your keys, not your coins.", author: "— knight @tradedesk" },
  { text: "Social recovery solves the usability problem without reintroducing custodians.", author: "— Sarah Chen" },
  { text: "Every custodial failure in history proves the counterparty risk is real.", author: "— quanta_s" },
]
const AGAINST = [
  { text: "Mainstream adoption needs abstraction — most users can't safely manage keys.", author: "— Morgan Lee" },
  { text: "Institutional custody has regulatory protections self-custody can't match.", author: "— James Rivera" },
  { text: "Recovery guardians just move the trust problem, they don't eliminate it.", author: "— alex_t" },
]

const COMMENTS = [
  { av: "KN", name: "knight", time: "2 hours ago", text: "The sovereignty stack framing finally makes this click. Been running paper-trade custody flows and the risk node maps exactly to what I see in treasury ops.", up: "↑ 24" },
  { av: "SC", name: "Sarah Chen", time: "5 hours ago", text: "Strong entry. Would love a deeper node on threshold signatures in the next release — it's the missing edge between Recovery and Risk.", up: "↑ 18" },
  { av: "AT", name: "alex_t", time: "1 day ago", text: "Counterpoint in the debate holds up — usability is still the blocker. But this article moved me from 30% to maybe 50% For.", up: "↑ 11" },
]

function GraphSvg() {
  const edge = { stroke: "rgba(201,163,58,.3)", strokeWidth: 1, strokeDasharray: "4,3", style: { animation: "kg-dash 1s linear infinite" } }
  return (
    <svg viewBox="0 0 1000 700" preserveAspectRatio="xMidYMid meet">
      <defs>
        <filter id="kgGlow">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <line x1="500" y1="350" x2="250" y2="180" {...edge} />
      <line x1="500" y1="350" x2="780" y2="200" {...edge} />
      <line x1="500" y1="350" x2="200" y2="500" {...edge} />
      <line x1="500" y1="350" x2="760" y2="520" {...edge} />
      <line x1="500" y1="350" x2="500" y2="600" {...edge} />
      <line x1="250" y1="180" x2="780" y2="200" stroke="rgba(111,163,229,.18)" strokeWidth={1} strokeDasharray="3,3" />
      <line x1="200" y1="500" x2="760" y2="520" stroke="rgba(111,163,229,.18)" strokeWidth={1} strokeDasharray="3,3" />
      <circle cx="250" cy="180" r="34" fill="rgba(111,163,229,.12)" stroke="#6FA3E5" strokeWidth={1.5} />
      <text x="250" y="184" fontSize="10" fontWeight="600" textAnchor="middle" fill="#6FA3E5">Keys</text>
      <circle cx="780" cy="200" r="34" fill="rgba(74,222,128,.1)" stroke="#4ADE80" strokeWidth={1.5} />
      <text x="780" y="204" fontSize="10" fontWeight="600" textAnchor="middle" fill="#4ADE80">Custody</text>
      <circle cx="200" cy="500" r="34" fill="rgba(255,184,0,.1)" stroke="#FFB800" strokeWidth={1.5} />
      <text x="200" y="504" fontSize="10" fontWeight="600" textAnchor="middle" fill="#FFB800">Wallets</text>
      <circle cx="760" cy="520" r="34" fill="rgba(167,139,250,.13)" stroke="#a78bfa" strokeWidth={1.5} />
      <text x="760" y="524" fontSize="10" fontWeight="600" textAnchor="middle" fill="#a78bfa">Recovery</text>
      <circle cx="500" cy="600" r="34" fill="rgba(201,163,58,.12)" stroke="#C9A33A" strokeWidth={1.5} />
      <text x="500" y="604" fontSize="10" fontWeight="600" textAnchor="middle" fill="#C9A33A">Risk</text>
      <circle cx="500" cy="350" r="52" fill="rgba(201,163,58,.22)" stroke="#E0BE3F" strokeWidth={2} filter="url(#kgGlow)" />
      <text x="500" y="346" fontSize="11" fontWeight="700" textAnchor="middle" fill="#C9A33A" letterSpacing="1">SELF</text>
      <text x="500" y="360" fontSize="11" fontWeight="700" textAnchor="middle" fill="#C9A33A" letterSpacing="1">CUSTODY</text>
    </svg>
  )
}

export default function KnowledgeGraphArticle() {
  return (
    <MemberLayout title="SUPERCOMPUTE · Self-Custody & the Sovereignty Stack">
      <div className="tpl-kg">
        <div className="masthead">
          <div className="eyebrow">Knowledge Graph · Article · Series 03</div>
          <h1 className="article-title">Self-Custody &amp; the Sovereignty Stack</h1>
          <div className="article-meta">
            <span>By <span className="m-val">quanta_s @newsdesk</span></span>
            <span>Published <span className="m-val">Jun 28, 2026</span></span>
            <span>Entry <span className="m-val">4 of 7</span></span>
            <span><span className="m-val">14 min</span> read</span>
          </div>
        </div>

        <div className="graph-block term-card">
          <div className="graph-area"><GraphSvg /></div>
          <div className="graph-sidebar">
            <div className="gs-section">
              <div className="gs-label">Graph Overview</div>
              <div className="stat-row"><span>Nodes</span><span className="v">42</span></div>
              <div className="stat-row"><span>Connections</span><span className="v">118</span></div>
              <div className="stat-row"><span>Depth</span><span className="v">3 levels</span></div>
            </div>
            <div className="gs-section">
              <div className="gs-label">Connected Concepts</div>
              <ul className="node-list">
                <li><span className="node-tag">01</span>Private Keys</li>
                <li><span className="node-tag">02</span>Hardware Wallets</li>
                <li><span className="node-tag">03</span>Social Recovery</li>
                <li><span className="node-tag">04</span>Risk Models</li>
              </ul>
            </div>
            <div className="gs-section">
              <div className="gs-label">Related Articles</div>
              <ul className="node-list">
                <li><span className="node-tag">→</span>Sovereignty Stack</li>
                <li><span className="node-tag">→</span>Key Management</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="release-path term-card">
          {RELEASE.map((s) => (
            <div key={s.num} className={`release-step${s.state ? " " + s.state : ""}`}>
              <div className="rs-num"><span className="rs-dot" />{s.num}</div>
              <div className="rs-title">{s.title}</div>
              <div className="rs-status">{s.status}</div>
            </div>
          ))}
        </div>

        <div className="feature-grid">
          <div className="panel term-card">
            <div className="section-head">Story Timeline</div>
            <ul className="timeline">
              {TIMELINE.map((t) => (
                <li key={t.title}>
                  <div className="tl-date">{t.date}</div>
                  <div className="tl-title">{t.title}</div>
                  <div className="tl-desc">{t.desc}</div>
                </li>
              ))}
            </ul>
          </div>
          <div className="panel term-card">
            <div className="section-head">Important People</div>
            <div className="people-list">
              {PEOPLE.map((p) => (
                <div key={p.name} className="person">
                  <div className="person-av">{p.av}</div>
                  <div>
                    <div className="person-name">{p.name}</div>
                    <div className="person-role">{p.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="debate-block">
          <div className="section-head">Debate · Is Full Self-Custody Practical at Scale?</div>
          <div className="debate-grid">
            <div className="debate-side for term-card">
              <div className="debate-header"><span>For</span><span className="debate-score">62%</span></div>
              {FOR.map((a, i) => (
                <div key={i} className="argument">{a.text}<div className="arg-author">{a.author}</div></div>
              ))}
            </div>
            <div className="debate-side against term-card">
              <div className="debate-header"><span>Against</span><span className="debate-score">38%</span></div>
              {AGAINST.map((a, i) => (
                <div key={i} className="argument">{a.text}<div className="arg-author">{a.author}</div></div>
              ))}
            </div>
          </div>
        </div>

        <div className="comments-block">
          <div className="section-head">Comments · 3</div>
          <textarea className="comment-input" rows={3} placeholder="> add to the discussion..." />
          {COMMENTS.map((c) => (
            <div key={c.name} className="comment">
              <div className="comment-av">{c.av}</div>
              <div className="comment-body">
                <div className="comment-meta"><span className="comment-name">{c.name}</span><span className="comment-time">{c.time}</span></div>
                <div className="comment-text">{c.text}</div>
                <div className="comment-actions"><span>{c.up}</span><span>Reply</span><span>Cite in graph</span></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </MemberLayout>
  )
}
