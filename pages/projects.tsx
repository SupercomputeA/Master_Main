import Layout from "../components/Layout"
import Footer from "../components/Footer"
import { useAuth } from "../lib/auth"
import Link from "next/link"
import { useState } from "react"

const wizardSteps = [
  { num: 1, label: "Ideation", desc: "Define project scope, goals, and tokenomics." },
  { num: 2, label: "Build", desc: "Develop smart contracts, agent integration, and UI." },
  { num: 3, label: "Audit", desc: "Security review, milestone verification, and agent attestation." },
  { num: 4, label: "Launch", desc: "Deploy on-chain, open funding, and begin operations." },
  { num: 5, label: "Operate", desc: "Ongoing management, milestone updates, and community engagement." },
]

const projects = [
  { id: "quanta-s", name: "Quanta S", tagline: "Autonomous agent managing DeFi positions on Base", step: 5, status: "Operate", statusColor: "var(--teal)" },
  { id: "openclaw", name: "OpenClaw", tagline: "Decentralized yield aggregation protocol", step: 5, status: "Operate", statusColor: "var(--teal)" },
  { id: "tradedesk", name: "TradeDesk", tagline: "Multi-chain trading terminal with agent execution", step: 3, status: "Audit", statusColor: "var(--accent)" },
  { id: "agent-fleet", name: "Agent Fleet API", tagline: "Unified API for all 13 Supercompute agents", step: 4, status: "Launch", statusColor: "var(--accent)" },
  { id: "staking-vaults", name: "Staking Vaults", tagline: "Automated yield strategies with multi-sig security", step: 5, status: "Operate", statusColor: "var(--teal)" },
]

const builderSteps = [
  { num: 1, label: "Project Details" },
  { num: 2, label: "Token Config" },
  { num: 3, label: "Funding & Access" },
  { num: 4, label: "Media & Assets" },
  { num: 5, label: "Review & Publish" },
]

export default function Projects() {
  const { session, isAdmin } = useAuth()
  const [tab, setTab] = useState<"dashboard" | "create">("dashboard")
  const [step, setStep] = useState(1)
  const [tokenName, setTokenName] = useState("")
  const [tokenSymbol, setTokenSymbol] = useState("")
  const [projectName, setProjectName] = useState("")

  const updateTokenSymbol = (name: string) => {
    setProjectName(name)
    if (name) {
      const words = name.split(" ")
      const sym = words.map(w => w[0]).join("").toUpperCase().slice(0, 5)
      setTokenSymbol(`$${sym}`)
    }
  }

  return (
    <Layout title="SUPERCOMPUTE · Projects">
      <section className="hero" id="projects">
        <div className="hero-kicker">
          <div className="status-dot"></div>
          <span className="label">// projects</span>
        </div>
        <h1 className="display-xl hero-title">
          PROJECT<br /><em>DASHBOARD</em>
        </h1>
        <p className="hero-sub">
          Manage projects from ideation through launch and operations.
          Each project has an assigned agent, a token, and on-chain milestones.
        </p>
      </section>

      <div style={{ display: "flex", gap: 0, borderBottom: "1px solid var(--border)", padding: "0 24px", marginBottom: 0 }}>
        {(["dashboard", "create"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            style={{
              fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase",
              padding: "10px 20px", background: "transparent", color: tab === t ? "var(--accent)" : "var(--muted)",
              border: "none", borderBottom: tab === t ? "2px solid var(--accent)" : "2px solid transparent",
              cursor: "pointer",
            }}
          >
            {t === "dashboard" ? "// Dashboard" : "// Create Project"}
          </button>
        ))}
        {session && tab === "dashboard" && (
          <Link href="/projects/builder" className="btn-connect" style={{ marginLeft: "auto", fontSize: 9, padding: "6px 14px", alignSelf: "center" }}>+ New Project</Link>
        )}
      </div>

      {tab === "dashboard" && (
        <>
          <section className="section">
            <div className="section-header">
              <div className="label">// lifecycle</div>
              <div><h2 className="display-md">Project Lifecycle Wizard</h2></div>
            </div>
            <div style={{ display: "flex", gap: 1, background: "var(--border)", border: "1px solid var(--border)", marginBottom: 48 }}>
              {wizardSteps.map((s, i) => (
                <div key={s.num} style={{
                  flex: 1, background: "var(--bg)", padding: "20px 16px",
                  borderRight: i < wizardSteps.length - 1 ? "1px solid var(--border)" : "none",
                }}>
                  <div style={{
                    fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--accent)",
                    border: "1px solid var(--border-accent)", padding: "2px 8px", display: "inline-block", marginBottom: 8,
                  }}>STEP {s.num}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4, color: "var(--fg)" }}>{s.label}</div>
                  <div style={{ fontSize: 10, color: "var(--muted)", lineHeight: 1.5 }}>{s.desc}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="section">
            <div className="section-header">
              <div className="label">// portfolio</div>
              <div><h2 className="display-md">Active Projects</h2></div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 1, background: "var(--border)", border: "1px solid var(--border)" }}>
              {projects.map((p) => (
                <div key={p.id} style={{ background: "var(--bg)", padding: 0 }}>
                  <div style={{ height: 100, background: "linear-gradient(135deg, var(--surface) 0%, var(--bg-alt) 100%)", display: "flex", alignItems: "center", justifyContent: "center", borderBottom: "1px solid var(--border)", position: "relative", overflow: "hidden" }}>
                    <div style={{ position: "absolute", top: 12, right: 12, fontFamily: "var(--font-mono)", fontSize: 8, color: p.statusColor, border: "1px solid var(--border)", padding: "2px 8px" }}>{p.status}</div>
                    <div style={{ position: "absolute", top: 12, left: 12, fontFamily: "var(--font-mono)", fontSize: 8, color: "var(--muted)", border: "1px solid var(--border)", padding: "2px 8px" }}>STEP {p.step}/5</div>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 700, color: "var(--accent)", opacity: 0.2 }}>{p.name.toUpperCase()}</div>
                  </div>
                  <div style={{ padding: "18px 20px" }}>
                    <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: "var(--muted)", lineHeight: 1.5, marginBottom: 12 }}>{p.tagline}</div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--accent)", border: "1px solid var(--border-accent)", padding: "3px 8px" }}>// agent assigned</span>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--muted)", border: "1px solid var(--border)", padding: "3px 8px" }}>on-chain</span>
                    </div>
                    <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
                      <Link href={`/projects/${p.id}`} className="btn-connect" style={{ fontSize: 10, padding: "6px 14px", textDecoration: "none" }}>View →</Link>
                      <span className="btn-connect" style={{ fontSize: 10, padding: "6px 14px", opacity: 0.6, cursor: "default" }}>Update</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {tab === "create" && (
        <section className="section">
          <div className="section-header">
            <div className="label">// wizard</div>
            <div><h2 className="display-md">Create a Project</h2></div>
          </div>

          <div style={{ display: "flex", gap: 1, background: "var(--border)", border: "1px solid var(--border)", marginBottom: 24 }}>
            {builderSteps.map((s) => (
              <div key={s.num} style={{
                flex: 1, background: "var(--bg)", padding: "14px 12px", textAlign: "center",
                borderBottom: s.num === step ? "2px solid var(--accent)" : "2px solid transparent",
                opacity: s.num === step ? 1 : s.num < step ? 0.6 : 0.3
              }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: s.num === step ? "var(--accent)" : "var(--muted)", marginBottom: 4 }}>STEP {s.num}</div>
                <div style={{ fontSize: 11, fontWeight: 600 }}>{s.label}</div>
              </div>
            ))}
          </div>

          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "28px" }}>
            {step === 1 && (
              <div>
                <div className="display-md" style={{ marginBottom: 20 }}>Project Details</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: 16 }}>
                  <div>
                    <div className="label-sm" style={{ marginBottom: 6 }}>Project Name</div>
                    <input type="text" placeholder="e.g. Quanta S v2" style={inputStyle} value={projectName} onChange={e => updateTokenSymbol(e.target.value)} />
                  </div>
                  <div>
                    <div className="label-sm" style={{ marginBottom: 6 }}>Category</div>
                    <select style={inputStyle} defaultValue="">
                      <option value="" disabled>Select</option>
                      <option>Agent</option><option>DeFi</option><option>Infra</option><option>App</option><option>Education</option><option>Media</option><option>Commerce</option><option>Ops</option>
                    </select>
                  </div>
                  <div>
                    <div className="label-sm" style={{ marginBottom: 6 }}>Chain</div>
                    <select style={inputStyle} defaultValue="Base">
                      <option>Base</option><option>Ethereum</option><option>Arbitrum</option><option>Optimism</option><option>Polygon</option>
                    </select>
                  </div>
                  <div>
                    <div className="label-sm" style={{ marginBottom: 6 }}>Status</div>
                    <select style={inputStyle} defaultValue="Draft">
                      <option>Draft</option><option>Active</option><option>Beta</option>
                    </select>
                  </div>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <div className="label-sm" style={{ marginBottom: 6 }}>Tagline</div>
                  <input type="text" placeholder="Short description for the project card" style={inputStyle} />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <div className="label-sm" style={{ marginBottom: 6 }}>Description</div>
                  <textarea rows={4} placeholder="Full project description, problem statement, and solution..." style={{ ...inputStyle, resize: "vertical" }} />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <div className="label-sm" style={{ marginBottom: 6 }}>GitHub / Docs Link</div>
                  <input type="text" placeholder="https://github.com/..." style={inputStyle} />
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <div className="display-md" style={{ marginBottom: 20 }}>Token Configuration</div>
                <div style={{ background: "var(--bg-alt)", border: "1px solid var(--border)", padding: "16px", marginBottom: 20, fontSize: 12, color: "var(--muted)" }}>
                  Each project gets its own token. Members must hold $QUANTA to invest. Projects set their own token supply and price.
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: 16 }}>
                  <div>
                    <div className="label-sm" style={{ marginBottom: 6 }}>Token Name</div>
                    <input type="text" placeholder="e.g. Quanta Token" style={inputStyle} value={tokenName} onChange={e => setTokenName(e.target.value)} />
                  </div>
                  <div>
                    <div className="label-sm" style={{ marginBottom: 6 }}>Token Symbol</div>
                    <input type="text" placeholder="$QNTA" style={inputStyle} value={tokenSymbol} onChange={e => setTokenSymbol(e.target.value.toUpperCase())} />
                  </div>
                  <div>
                    <div className="label-sm" style={{ marginBottom: 6 }}>Total Supply</div>
                    <input type="text" placeholder="e.g. 10,000,000" style={inputStyle} />
                  </div>
                  <div>
                    <div className="label-sm" style={{ marginBottom: 6 }}>Initial Price ($)</div>
                    <input type="text" placeholder="e.g. 0.042" style={inputStyle} />
                  </div>
                  <div>
                    <div className="label-sm" style={{ marginBottom: 6 }}>Public Sale %</div>
                    <input type="text" placeholder="e.g. 40" style={inputStyle} />
                  </div>
                  <div>
                    <div className="label-sm" style={{ marginBottom: 6 }}>Vesting (months)</div>
                    <input type="number" placeholder="e.g. 24" style={inputStyle} />
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <div className="display-md" style={{ marginBottom: 20 }}>Funding & Access</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: 16 }}>
                  <div>
                    <div className="label-sm" style={{ marginBottom: 6 }}>Funding Goal ($)</div>
                    <input type="text" placeholder="e.g. 500,000" style={inputStyle} />
                  </div>
                  <div>
                    <div className="label-sm" style={{ marginBottom: 6 }}>Minimum Investment ($)</div>
                    <input type="text" placeholder="e.g. 100" style={inputStyle} />
                  </div>
                  <div>
                    <div className="label-sm" style={{ marginBottom: 6 }}>$QUANTA Required</div>
                    <input type="number" placeholder="e.g. 100" style={inputStyle} />
                  </div>
                  <div>
                    <div className="label-sm" style={{ marginBottom: 6 }}>Funding Round</div>
                    <select style={inputStyle} defaultValue="">
                      <option value="" disabled>Select round</option>
                      <option>Seed</option><option>Private</option><option>Public</option><option>Community</option>
                    </select>
                  </div>
                  <div>
                    <div className="label-sm" style={{ marginBottom: 6 }}>Start Date</div>
                    <input type="date" style={inputStyle} />
                  </div>
                  <div>
                    <div className="label-sm" style={{ marginBottom: 6 }}>End Date</div>
                    <input type="date" style={inputStyle} />
                  </div>
                </div>
                <div>
                  <div className="label-sm" style={{ marginBottom: 6 }}>Fund Allocation</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {[{ label: "Development", pct: 40 }, { label: "Marketing", pct: 20 }, { label: "Operations", pct: 15 }, { label: "Liquidity", pct: 15 }, { label: "Reserve", pct: 10 }].map((item) => (
                      <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <span style={{ fontSize: 12, minWidth: 100, color: "var(--muted)" }}>{item.label}</span>
                        <div style={{ flex: 1, height: 4, background: "var(--border)", borderRadius: 2, overflow: "hidden" }}>
                          <div style={{ width: `${item.pct}%`, height: "100%", background: "var(--accent)", borderRadius: 2 }}></div>
                        </div>
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--accent)", minWidth: 30, textAlign: "right" }}>{item.pct}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div>
                <div className="display-md" style={{ marginBottom: 20 }}>Media & Assets</div>
                <div style={{ background: "var(--bg-alt)", border: "1px solid var(--border)", padding: "40px", textAlign: "center", marginBottom: 20 }}>
                  <div style={{ fontSize: 32, color: "var(--accent)", marginBottom: 8 }}>+</div>
                  <div style={{ fontSize: 12, color: "var(--muted)" }}>Upload project photo / logo</div>
                  <div style={{ fontSize: 10, color: "var(--muted)", fontFamily: "var(--font-mono)", marginTop: 4 }}>PNG, SVG, JPG · Max 5MB</div>
                  <button className="btn-connect" style={{ marginTop: 16, fontSize: 10, padding: "6px 18px" }}>Choose File</button>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div>
                    <div className="label-sm" style={{ marginBottom: 6 }}>Logo / Avatar URL</div>
                    <input type="text" placeholder="ipfs://..." style={inputStyle} />
                  </div>
                  <div>
                    <div className="label-sm" style={{ marginBottom: 6 }}>Banner URL</div>
                    <input type="text" placeholder="ipfs://..." style={inputStyle} />
                  </div>
                </div>
                <div style={{ marginTop: 16 }}>
                  <div className="label-sm" style={{ marginBottom: 6 }}>Gallery (one per line)</div>
                  <textarea rows={3} placeholder="ipfs://Qm...&#10;ipfs://Qm...&#10;https://..." style={{ ...inputStyle, resize: "vertical" }} />
                </div>
                <div style={{ marginTop: 16 }}>
                  <div className="label-sm" style={{ marginBottom: 6 }}>Documentation (whitepaper / deck)</div>
                  <input type="text" placeholder="ipfs://..." style={inputStyle} />
                </div>
              </div>
            )}

            {step === 5 && (
              <div>
                <div className="display-md" style={{ marginBottom: 20 }}>Review & Publish</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 1, background: "var(--border)", border: "1px solid var(--border)", marginBottom: 20 }}>
                  <div style={{ background: "var(--bg)", padding: "14px 20px", display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 12, color: "var(--muted)" }}>Project</span>
                    <span style={{ fontSize: 13 }}>{projectName || "—"}</span>
                  </div>
                  <div style={{ background: "var(--bg)", padding: "14px 20px", display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 12, color: "var(--muted)" }}>Token</span>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--accent)" }}>{tokenName || "—"} ({tokenSymbol || "—"})</span>
                  </div>
                  <div style={{ background: "var(--bg)", padding: "14px 20px", display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 12, color: "var(--muted)" }}>QUANTA Gate</span>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 13 }}>100 $QUANTA</span>
                  </div>
                  <div style={{ background: "var(--bg)", padding: "14px 20px", display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 12, color: "var(--muted)" }}>Funding Goal</span>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--accent)" }}>$500,000</span>
                  </div>
                  <div style={{ background: "var(--bg)", padding: "14px 20px", display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 12, color: "var(--muted)" }}>Agents Assigned</span>
                    <span style={{ fontSize: 13 }}>3 (HERMES, vQuanta, Condor)</span>
                  </div>
                </div>
                <div style={{ background: "var(--bg-alt)", border: "1px solid var(--border)", padding: "16px", marginBottom: 20, fontSize: 12, color: "var(--muted)" }}>
                  Publishing will deploy the project token contract on Base and make it available for member investment. This action is on-chain and cannot be undone.
                </div>
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24 }}>
              <button onClick={() => setStep(Math.max(1, step - 1))} className="btn-connect" style={{ background: "transparent", color: "var(--muted)", borderColor: "var(--border)", visibility: step > 1 ? "visible" : "hidden" }}>← Back</button>
              <button onClick={() => { if (step < 5) setStep(step + 1); else alert("Project published! Token deployed on Base Chain.") }} className="btn-connect">{step === 5 ? "Publish Project →" : "Next Step →"}</button>
            </div>
          </div>
        </section>
      )}

      <Footer />
    </Layout>
  )
}

const inputStyle: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: 12,
  color: "var(--fg)",
  background: "var(--bg)",
  border: "1px solid var(--border)",
  padding: "8px 12px",
  width: "100%",
  outline: "none",
}
