import { useState } from "react"
import PublicLayout from "../../components/PublicLayout"
import Footer from "../../components/Footer"

const tabs = [
  { key: "setup", label: "Setup" },
  { key: "update", label: "Update" },
  { key: "uploads", label: "Uploads" },
]

const stepStyle: React.CSSProperties = {
  fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--accent)",
  border: "1px solid var(--border-accent)", padding: "2px 8px", display: "inline-block", marginBottom: 12,
}

export default function ProjectGuide() {
  const [tab, setTab] = useState("setup")

  return (
    <PublicLayout title="SUPERCOMPUTE · Project Guide">
      <section className="hero" id="project-guide">
        <div className="hero-kicker">
          <div className="status-dot"></div>
          <span className="label">// projects · guide</span>
        </div>
        <h1 className="display-xl hero-title">PROJECT<br /><em>GUIDE</em></h1>
        <p className="hero-sub">How to set up, update, and manage project assets on Supercompute.</p>
      </section>

      <section className="section">
        <div className="section-header">
          <div className="label">// nav</div>
          <div style={{ display: "flex", gap: 1, background: "var(--border)", border: "1px solid var(--border)" }}>
            {tabs.map((t) => (
              <button key={t.key} onClick={() => setTab(t.key)}
                style={{
                  flex: 1, padding: "10px 16px",
                  fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.05em", textTransform: "uppercase",
                  background: tab === t.key ? "var(--accent)" : "var(--bg)",
                  color: tab === t.key ? "var(--bg)" : "var(--muted)",
                  border: "none", cursor: "pointer",
                }}
              >{t.label}</button>
            ))}
          </div>
        </div>

        {tab === "setup" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div style={{ background: "var(--bg)", border: "1px solid var(--border)", padding: "24px" }}>
              <div style={stepStyle}>STEP 1</div>
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>Project Details</div>
              <p style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.6, marginBottom: 16 }}>
                Every project needs a name, tagline, and chain selection. Keep your tagline under 120 characters — it appears on the project card and in search results.
              </p>
              <div style={{ fontSize: 11, color: "var(--muted)", lineHeight: 1.6 }}>
                <span style={{ color: "var(--accent)" }}>●</span> Names are unique across the platform. No duplicates allowed.<br />
                <span style={{ color: "var(--accent)" }}>●</span> Tagline is indexed for search — choose keywords wisely.<br />
                <span style={{ color: "var(--accent)" }}>●</span> Chain selection determines which RPC endpoints are used for agent interactions.
              </div>
            </div>

            <div style={{ background: "var(--bg)", border: "1px solid var(--border)", padding: "24px" }}>
              <div style={stepStyle}>STEP 2</div>
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>Token Configuration</div>
              <p style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.6, marginBottom: 16 }}>
                Each project has its own token. The symbol is auto-derived from the project name, but can be customized. Token supply, price, and distribution model are configurable in the builder.
              </p>
              <div style={{ fontSize: 11, color: "var(--muted)", lineHeight: 1.6 }}>
                <span style={{ color: "var(--accent)" }}>●</span> Initial price is set in ETH. Adjust based on your valuation.<br />
                <span style={{ color: "var(--accent)" }}>●</span> Distribution model affects the vesting schedule.<br />
                <span style={{ color: "var(--accent)" }}>●</span> Token metadata is written on-chain at publish time.
              </div>
            </div>

            <div style={{ background: "var(--bg)", border: "1px solid var(--border)", padding: "24px" }}>
              <div style={stepStyle}>STEP 3</div>
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>Funding & Access</div>
              <p style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.6, marginBottom: 16 }}>
                Set your funding goal, minimum $QUANTA requirement, and access tier. Projects can be public or whitelist-only.
              </p>
              <div style={{ fontSize: 11, color: "var(--muted)", lineHeight: 1.6 }}>
                <span style={{ color: "var(--accent)" }}>●</span> Funding goal is in USD equivalent. Raised amounts are tracked on-chain.<br />
                <span style={{ color: "var(--accent)" }}>●</span> Min $QUANTA requirement gates access to active community members.<br />
                <span style={{ color: "var(--accent)" }}>●</span> Vesting schedules apply to team and early investor allocations only.
              </div>
            </div>

            <div style={{ background: "var(--bg)", border: "1px solid var(--border)", padding: "24px" }}>
              <div style={stepStyle}>STEP 4</div>
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>Media & Assets</div>
              <p style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.6, marginBottom: 16 }}>
                Upload your project logo, banner image, and optional demo video. See the Uploads tab for supported formats and sizing.
              </p>
              <div style={{ fontSize: 11, color: "var(--muted)", lineHeight: 1.6 }}>
                <span style={{ color: "var(--accent)" }}>●</span> Logo: PNG/SVG, max 2MB, 256x256 recommended.<br />
                <span style={{ color: "var(--accent)" }}>●</span> Banner: PNG/WebP, max 5MB, 1200x600 recommended.<br />
                <span style={{ color: "var(--accent)" }}>●</span> Gallery images are uploaded separately after project creation.
              </div>
            </div>

            <div style={{ background: "var(--bg)", border: "1px solid var(--border)", padding: "24px" }}>
              <div style={stepStyle}>STEP 5</div>
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>Review & Publish</div>
              <p style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.6, marginBottom: 16 }}>
                Before publishing, review all details. Once published, the project is visible to members and funding opens. Some fields are immutable after publish.
              </p>
              <div style={{ fontSize: 11, color: "var(--muted)", lineHeight: 1.6 }}>
                <span style={{ color: "var(--accent)" }}>●</span> Changes to token supply, chain, or distribution require operator approval.<br />
                <span style={{ color: "var(--accent)" }}>●</span> Project name can be changed within 7 days of publish.<br />
                <span style={{ color: "var(--accent)" }}>●</span> Publishing triggers on-chain token creation and IPFS metadata storage.
              </div>
            </div>
          </div>
        )}

        {tab === "update" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div style={{ background: "var(--bg)", border: "1px solid var(--border)", padding: "24px" }}>
              <div style={stepStyle}>BASICS</div>
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>Updating Project Info</div>
              <p style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.6, marginBottom: 16 }}>
                Project details can be updated from the project dashboard. Navigate to your project and click "Edit Project" to modify the name, tagline, description, or category.
              </p>
              <div style={{ fontSize: 11, color: "var(--muted)", lineHeight: 1.6 }}>
                <span style={{ color: "var(--accent)" }}>●</span> Name changes are logged in the project history.<br />
                <span style={{ color: "var(--accent)" }}>●</span> Tagline updates trigger a re-index of search results.<br />
                <span style={{ color: "var(--accent)" }}>●</span> Updates are subject to a 24h cooldown to prevent spam.
              </div>
            </div>

            <div style={{ background: "var(--bg)", border: "1px solid var(--border)", padding: "24px" }}>
              <div style={stepStyle}>PROGRESS</div>
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>Updating Milestones & Progress</div>
              <p style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.6, marginBottom: 16 }}>
                Keep the community informed by updating milestone completions. Each project has a progress bar on the project card — tied to milestone checkpoints.
              </p>
              <div style={{ fontSize: 11, color: "var(--muted)", lineHeight: 1.6 }}>
                <span style={{ color: "var(--accent)" }}>●</span> Milestones must be set up at project creation.<br />
                <span style={{ color: "var(--accent)" }}>●</span> Completion is verified by the assigned agent before updating progress.<br />
                <span style={{ color: "var(--accent)" }}>●</span> Agent verification adds an on-chain attestation to each milestone.
              </div>
            </div>

            <div style={{ background: "var(--bg)", border: "1px solid var(--border)", padding: "24px" }}>
              <div style={stepStyle}>FUNDING</div>
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>Adjusting Funding Parameters</div>
              <p style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.6, marginBottom: 16 }}>
                Funding goal and min $QUANTA requirements can be adjusted mid-round, with a 48h notice period displayed to current participants.
              </p>
              <div style={{ fontSize: 11, color: "var(--muted)", lineHeight: 1.6 }}>
                <span style={{ color: "var(--accent)" }}>●</span> Raising the funding goal triggers community notifications.<br />
                <span style={{ color: "var(--accent)" }}>●</span> Lowering min $QUANTA takes effect immediately.<br />
                <span style={{ color: "var(--accent)" }}>●</span> Funding cannot be closed early unless the goal is met.
              </div>
            </div>
          </div>
        )}

        {tab === "uploads" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div style={{ background: "var(--bg)", border: "1px solid var(--border)", padding: "24px" }}>
              <div style={stepStyle}>LOGO</div>
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>Project Logo</div>
              <p style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.6, marginBottom: 12 }}>
                Upload a square logo in PNG or SVG format, max 2MB at 256x256 resolution. The logo appears on the project card, detail page, and in search results.
              </p>
              <p style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.6 }}>
                Upload via the project dashboard. The platform accepts PNG and SVG formats with a 1:1 aspect ratio.
              </p>
            </div>

            <div style={{ background: "var(--bg)", border: "1px solid var(--border)", padding: "24px" }}>
              <div style={stepStyle}>BANNER</div>
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>Banner Image</div>
              <p style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.6, marginBottom: 12 }}>
                A 2:1 banner image displays at the top of the project detail page. Use PNG, WebP, or JPG format, max 5MB at 1200x600 resolution.
              </p>
              <p style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.6 }}>
                Use this space to showcase your project's branding or key visual.
              </p>
            </div>

            <div style={{ background: "var(--bg)", border: "1px solid var(--border)", padding: "24px" }}>
              <div style={stepStyle}>GALLERY</div>
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>Gallery Images</div>
              <p style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.6, marginBottom: 12 }}>
                Upload up to 12 gallery images (PNG, WebP, JPG) with a total of 10MB max. Each image can have an optional caption. They render in a lightbox grid on the project detail page.
              </p>
              <div style={{ fontSize: 11, color: "var(--muted)", lineHeight: 1.6 }}>
                <span style={{ color: "var(--accent)" }}>●</span> Images are pinned to IPFS for permanent storage.<br />
                <span style={{ color: "var(--accent)" }}>●</span> Uploading a new image with the same filename replaces the existing one.<br />
                <span style={{ color: "var(--accent)" }}>●</span> Gallery order can be rearranged via drag-and-drop in the dashboard.
              </div>
            </div>

            <div style={{ background: "var(--bg)", border: "1px solid var(--border)", padding: "24px" }}>
              <div style={stepStyle}>VIDEO</div>
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>Demo Video (Optional)</div>
              <p style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.6, marginBottom: 12 }}>
                Embed a demo video from YouTube, Loom, or IPFS using a URL. Videos are limited to 10 minutes and appear in a dedicated section on the project detail page.
              </p>
              <div style={{ fontSize: 11, color: "var(--muted)", lineHeight: 1.6 }}>
                <span style={{ color: "var(--accent)" }}>●</span> URLs must be HTTPS and from a supported platform.<br />
                <span style={{ color: "var(--accent)" }}>●</span> Video embeds are responsive and play in-page.<br />
                <span style={{ color: "var(--accent)" }}>●</span> IPFS videos are streamed via a gateway with caching.
              </div>
            </div>
          </div>
        )}
      </section>

      <Footer />
    </PublicLayout>
  )
}
