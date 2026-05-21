import Layout from "../../components/Layout"
import Footer from "../../components/Footer"

const questions = [
  { id: "q1", q: "What type of engagement do you need?", type: "select", options: ["Full-spectrum Web3 Ops", "Smart Contract Development", "Agent Integration", "Treasury Management", "Infrastructure Setup", "Community Growth", "Custom Curriculum", "Monthly Retainer"] },
  { id: "q2", q: "Describe your project or startup in 1-2 sentences.", type: "textarea" },
  { id: "q3", q: "What blockchain ecosystem are you building on?", type: "select", options: ["Base", "Ethereum", "Arbitrum", "Optimism", "Polygon", "Solana", "Other / Not sure"] },
  { id: "q4", q: "Do you have an existing team or are you solo?", type: "select", options: ["Solo founder", "Small team (2-5)", "Growing team (6-15)", "Established org (15+)"] },
  { id: "q5", q: "What's your timeline?", type: "select", options: ["ASAP — within 2 weeks", "Short-term — 1-3 months", "Medium — 3-6 months", "Long-term — 6+ months", "Just exploring for now"] },
  { id: "q6", q: "Do you have funding allocated for this engagement?", type: "select", options: ["Yes — budget approved", "In progress — seeking approval", "Not yet — exploring costs", "Prefers revenue share model"] },
  { id: "q7", q: "What's your primary goal?", type: "textarea" },
  { id: "q8", q: "How did you hear about Supercompute?", type: "select", options: ["Twitter / X", "Farcaster", "Friend / Referral", "GitHub", "Web3 School", "NewsDesk / Press", "Other"] },
]

export default function ConsultingQuestionnaire() {
  return (
    <Layout title="SUPERCOMPUTE · Consulting Questionnaire">
      <section className="hero" id="consulting-q">
        <div className="hero-kicker">
          <div className="status-dot"></div>
          <span className="label">// consulting · intake</span>
        </div>
        <h1 className="display-xl hero-title">
          PROJECT<br /><em>QUESTIONNAIRE</em>
        </h1>
        <p className="hero-sub">
          Tell me about your project. Every engagement starts with a conversation — this helps me prepare.
        </p>
      </section>

      <section className="section">
        <div className="section-header">
          <div className="label">// intake</div>
          <div>
            <h2 className="display-md">Discovery Form</h2>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 1, background: "var(--border)", border: "1px solid var(--border)" }}>
          {questions.map((item) => (
            <div key={item.id} style={{ background: "var(--bg)", padding: "20px 24px" }}>
              <div className="label-sm" style={{ marginBottom: 8 }}>{item.id.toUpperCase()} — {item.q}</div>
              {item.type === "textarea" ? (
                <textarea rows={3} placeholder="Your answer..." style={inputStyle} />
              ) : (
                <select style={inputStyle} defaultValue="">
                  <option value="" disabled>Select an option</option>
                  {item.options?.map((o) => <option key={o}>{o}</option>)}
                </select>
              )}
            </div>
          ))}
        </div>
        <div style={{ marginTop: 24, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 11, color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
            Responses are confidential and reviewed within 24h
          </div>
          <button className="btn-connect">Submit Questionnaire</button>
        </div>
      </section>

      <Footer />
    </Layout>
  )
}

const inputStyle: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: 12,
  color: "var(--fg)",
  background: "var(--surface)",
  border: "1px solid var(--border)",
  padding: "10px 14px",
  width: "100%",
  outline: "none",
}
