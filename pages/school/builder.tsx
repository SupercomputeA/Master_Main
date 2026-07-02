import Layout from "../../components/Layout"
import PublicLayout from "../../components/PublicLayout"
import Footer from "../../components/Footer"
import AuthGate from "../../components/AuthGate"
import { useAuth } from "../../lib/auth"
import { modules, type SchoolModule, type Lesson } from "../../lib/school"
import { useState } from "react"

const emptyLesson = (moduleId: string, n: number): Lesson => ({
  id: `${moduleId}-${String(n).padStart(2, "0")}`,
  title: "",
  description: "",
  duration: "20 min",
  topics: [],
})

export default function SchoolBuilder() {
  const { session } = useAuth()
  const [step, setStep] = useState(1)
  const [title, setTitle] = useState("")
  const [subtitle, setSubtitle] = useState("")
  const [desc, setDesc] = useState("")
  const [difficulty, setDifficulty] = useState<"Beginner" | "Intermediate" | "Advanced">("Beginner")
  const [access, setAccess] = useState<"free" | "member">("free")
  const [icon, setIcon] = useState("✦")
  const [lessons, setLessons] = useState<Lesson[]>([])

  const addLesson = () => {
    const n = lessons.length + 1
    const mid = title.slice(0, 2).toUpperCase() || "XX"
    setLessons([...lessons, emptyLesson(mid, n)])
  }

  const updateLesson = (i: number, field: keyof Lesson, val: string) => {
    const copy = [...lessons]
    ;(copy[i] as any)[field] = field === "topics" ? val.split(",").map(s => s.trim()) : val
    setLessons(copy)
  }

  const removeLesson = (i: number) => setLessons(lessons.filter((_, idx) => idx !== i))

  if (!session) {
    return (
      <PublicLayout title="SUPERCOMPUTE · Course Builder">
        <section className="hero" id="school-builder">
          <div className="hero-kicker"><div className="status-dot"></div><span className="label">// school · builder</span></div>
          <h1 className="display-xl hero-title">COURSE<br /><em>BUILDER</em></h1>
          <p className="hero-sub">Sign in with your wallet to create and manage school modules.</p>
        </section>
        <section className="section" style={{ borderBottom: "none" }}>
          <AuthGate
            title="Course Builder is members-only"
            note="Sign in to create and manage school modules."
          >
            <div />
          </AuthGate>
        </section>
        <Footer />
      </PublicLayout>
    )
  }

  return (
    <Layout title="SUPERCOMPUTE · Course Builder">
      <section className="hero" id="school-builder">
        <div className="hero-kicker"><div className="status-dot"></div><span className="label">// school · builder</span></div>
        <h1 className="display-xl hero-title">COURSE<br /><em>BUILDER</em></h1>
        <p className="hero-sub">Define modules with lessons, topics, and credentials. Add to `lib/school.ts` to publish.</p>
      </section>

      <section className="section">
        <div className="section-header">
          <div className="label">// data model</div>
          <div>
            <h2 className="display-md">Module Schema</h2>
          </div>
        </div>
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "20px 24px", fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--muted)", lineHeight: 1.7, overflow: "auto" }}>
          <pre>{`interface SchoolModule {
  id: string          // unique identifier (e.g. "WS-01")
  title: string       // display name
  subtitle: string    // short tagline
  description: string // full description
  difficulty: "Beginner" | "Intermediate" | "Advanced"
  access: "free" | "member"
  duration: string    // estimated time (e.g. "2 hours")
  lessons: Lesson[]   // array of lesson objects
  credential: string | null  // NFT credential name
  icon: string        // emoji or symbol
  color: string       // hex accent color
}

interface Lesson {
  id: string          // unique lesson ID
  title: string       // lesson display name
  description: string // what the lesson covers
  duration: string    // estimated time
  topics: string[]    // key topics covered
}`}</pre>
          <p style={{ marginTop: 12, fontSize: 10, color: "var(--accent)" }}>
            Add modules to <strong>lib/school.ts</strong> — update the exports array. New modules appear automatically on /school.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <div className="label">// builder</div>
          <div>
            <h2 className="display-md">Create a Module</h2>
          </div>
        </div>
        <div style={{ display: "flex", gap: 1, background: "var(--border)", border: "1px solid var(--border)", marginBottom: 24 }}>
          {[
            { num: 1, label: "Module Info" },
            { num: 2, label: "Lessons & Topics" },
            { num: 3, label: "Review Output" },
          ].map((s) => (
            <div key={s.num} style={{
              flex: 1, background: "var(--bg)", padding: "14px 12px", textAlign: "center",
              borderBottom: s.num === step ? "2px solid var(--accent)" : "2px solid transparent",
              opacity: s.num === step ? 1 : s.num < step ? 0.6 : 0.3,
            }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: s.num === step ? "var(--accent)" : "var(--muted)", marginBottom: 4 }}>STEP {s.num}</div>
              <div style={{ fontSize: 11, fontWeight: 600 }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "28px" }}>
          {step === 1 && (
            <div>
              <div className="display-md" style={{ marginBottom: 20 }}>Module Information</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                <div>
                  <div className="label-sm" style={{ marginBottom: 6 }}>Module Title</div>
                  <input type="text" placeholder="e.g. Wallet Security" style={inputStyle} value={title} onChange={e => setTitle(e.target.value)} />
                </div>
                <div>
                  <div className="label-sm" style={{ marginBottom: 6 }}>Subtitle</div>
                  <input type="text" placeholder="Protect Your Keys, Protect Your Assets" style={inputStyle} value={subtitle} onChange={e => setSubtitle(e.target.value)} />
                </div>
                <div>
                  <div className="label-sm" style={{ marginBottom: 6 }}>Difficulty</div>
                  <select style={inputStyle} value={difficulty} onChange={e => setDifficulty(e.target.value as any)}>
                    <option>Beginner</option><option>Intermediate</option><option>Advanced</option>
                  </select>
                </div>
                <div>
                  <div className="label-sm" style={{ marginBottom: 6 }}>Access</div>
                  <select style={inputStyle} value={access} onChange={e => setAccess(e.target.value as any)}>
                    <option value="free">Free — Public Access</option>
                    <option value="member">Member — Token-Gated</option>
                  </select>
                </div>
                <div>
                  <div className="label-sm" style={{ marginBottom: 6 }}>Icon (emoji)</div>
                  <input type="text" placeholder="🔐 🌱 ⬡ ✦" style={inputStyle} value={icon} onChange={e => setIcon(e.target.value)} />
                </div>
                <div>
                  <div className="label-sm" style={{ marginBottom: 6 }}>ID prefix (e.g. WS)</div>
                  <input type="text" placeholder="WS" style={inputStyle} value={title ? title.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) : ""} readOnly />
                </div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <div className="label-sm" style={{ marginBottom: 6 }}>Description</div>
                <textarea rows={3} placeholder="Module overview and learning objectives..." style={{ ...inputStyle, resize: "vertical" }} value={desc} onChange={e => setDesc(e.target.value)} />
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <div className="display-md" style={{ marginBottom: 20 }}>Lessons & Topics</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {lessons.map((l, i) => (
                  <div key={i} style={{ background: "var(--bg)", border: "1px solid var(--border)", padding: "16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                      <span className="label-sm">Lesson {i + 1} · {l.id}</span>
                      <button onClick={() => removeLesson(i)} className="btn-connect" style={{ fontSize: 9, padding: "2px 8px", background: "transparent", color: "var(--danger)", borderColor: "var(--danger)" }}>Remove</button>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
                      <input type="text" placeholder="Lesson title" style={inputStyle} value={l.title} onChange={e => updateLesson(i, "title", e.target.value)} />
                      <input type="text" placeholder="Duration (e.g. 15 min)" style={inputStyle} value={l.duration} onChange={e => updateLesson(i, "duration", e.target.value)} />
                    </div>
                    <input type="text" placeholder="Description" style={{ ...inputStyle, marginBottom: 8 }} value={l.description} onChange={e => updateLesson(i, "description", e.target.value)} />
                    <input type="text" placeholder="Topics (comma separated: Key pairs, Seed phrases, Addresses)" style={inputStyle} value={l.topics.join(", ")} onChange={e => updateLesson(i, "topics", e.target.value)} />
                  </div>
                ))}
                <button onClick={addLesson} className="btn-connect" style={{ fontSize: 10, padding: "8px 18px", background: "transparent", color: "var(--accent)", borderColor: "var(--border-accent)", alignSelf: "flex-start" }}>
                  + Add Lesson
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <div className="display-md" style={{ marginBottom: 20 }}>Generated Module</div>
              <div style={{ background: "var(--bg)", border: "1px solid var(--border)", padding: "20px", fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--muted)", lineHeight: 1.6, overflow: "auto" }}>
                <pre>{`{
  id: "${title ? title.slice(0, 2).toUpperCase() : "XX"}-01",
  title: "${title || "..."}",
  subtitle: "${subtitle || "..."}",
  description: "${desc || "..."}",
  difficulty: "${difficulty}",
  access: "${access}",
  icon: "${icon}",
  color: "var(--mono-blue)",
  lessons: [${lessons.map((l, i) => `
    {
      id: "${l.id || "XX-0" + (i + 1)}",
      title: "${l.title || "..."}",
      description: "${l.description || "..."}",
      duration: "${l.duration}",
      topics: [${l.topics.map(t => `"${t}"`).join(", ")}],
    },`).join("")}
  ],
  credential: null,
}`}</pre>
              </div>
              <div style={{ marginTop: 16, background: "var(--bg-alt)", border: "1px solid var(--border)", padding: "16px", fontSize: 12, color: "var(--muted)" }}>
                Copy this object into <strong style={{ color: "var(--accent)" }}>lib/school.ts</strong> under the <strong style={{ color: "var(--accent)" }}>modules</strong> array. The page will automatically pick it up.
              </div>
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24 }}>
            <button onClick={() => setStep(Math.max(1, step - 1))} className="btn-connect" style={{ background: "transparent", color: "var(--muted)", borderColor: "var(--border)", visibility: step > 1 ? "visible" : "hidden" }}>← Back</button>
            <button onClick={() => step < 3 ? setStep(step + 1) : alert("Module data ready for lib/school.ts!")} className="btn-connect">{step === 3 ? "Copy & Done" : "Next →"}</button>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <div className="label">// existing</div>
          <div>
            <h2 className="display-md">Published Modules</h2>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 1, background: "var(--border)", border: "1px solid var(--border)" }}>
          {modules.map((m) => (
            <div key={m.id} style={{ background: "var(--bg)", padding: "14px 20px", display: "grid", gridTemplateColumns: "40px 30px 1fr 60px 60px 100px", gap: 12, alignItems: "center" }}>
              <span style={{ fontSize: 14 }}>{m.icon}</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--accent)" }}>{m.id}</span>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{m.title}</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: m.color }}>{m.difficulty}</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: m.access === "free" ? "var(--accent)" : "#888" }}>{m.access.toUpperCase()}</span>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--muted)" }}>{m.lessons.length} lessons</div>
            </div>
          ))}
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
  background: "var(--bg)",
  border: "1px solid var(--border)",
  padding: "8px 12px",
  width: "100%",
  outline: "none",
}
