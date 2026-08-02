import Head from "next/head"
import SolarThemeProvider from "../components/SolarThemeProvider"
import PublicLayout from "../components/PublicLayout"
import Footer from "../components/Footer"

/* /solar-theme-demo — accepts the SOLAR theme tokens inside the Terminal
 * Dossier chrome. Built per docs/solar-theme-integration.md (Option B).
 *
 * The page chrome (horizontal nav, HUD corners, footer) stays Terminal
 * Dossier. The inner content re-skins on SOLAR tokens via SolarThemeProvider.
 *
 * This serves both as a manual-test page and as a "Storybook-equivalent"
 * for the SOLAR theme — the website repo doesn't have a Storybook setup,
 * but this page demonstrates every SOLAR token + class in one place.
 */

const TRAIT_MAT_LABELS = [
  "Aurum",
  "Ferrum",
  "Carbo",
  "Cuprum",
  "Argentum",
  "Plumbum",
  "Stannum",
  "Hydrargyrum",
]

export default function SolarThemeDemo() {
  return (
    <>
      <Head>
        <title>SOLAR Theme Demo · Supercompute</title>
      </Head>

      <PublicLayout title="SUPERCOMPUTE · SOLAR Theme Demo" wide>
        {/* Header — Terminal Dossier chrome (the public layout). Below this
            point we hand off to the SOLAR scope. */}
        <div className="section-header">
          <div className="label">// integration contract</div>
          <div>
            <h1 className="display-md">SOLAR Theme Demo</h1>
            <p style={{ fontSize: 13, color: "var(--muted)", maxWidth: 720, marginTop: 8 }}>
              Below this point the page renders inside <code style={{ color: "var(--accent)" }}>&lt;SolarThemeProvider&gt;</code>.
              The cast-black + gold-leaf palette is the SOLAR token system; the navy + cream chrome
              above (header, HUD corners, footer) is the Terminal Dossier palette. They coexist.
            </p>
          </div>
        </div>

        <SolarThemeProvider>
          {/* Hero card */}
          <div className="solar-card" style={{ marginBottom: "var(--space-lg)" }}>
            <div className="gold-stamp" style={{ marginBottom: "var(--space-md)" }}>
              ◆ Solar Demo · Cast-Black Class
            </div>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(32px, 5vw, 56px)",
                color: "var(--gold-leaf)",
                marginBottom: "var(--space-md)",
                lineHeight: 1.1,
              }}
            >
              Liberation, cast in gold.
            </h2>
            <p
              style={{
                fontFamily: "var(--font-archive)",
                fontSize: 18,
                color: "var(--bone)",
                lineHeight: 1.6,
                maxWidth: 640,
              }}
            >
              The SOLAR design system reads on cast-black grounds with gold-leaf display type, ivory-mark
              body text, and bronze-edge accents. This page demonstrates that it composes with — not against —
              the Terminal Dossier chrome that wraps it.
            </p>
          </div>

          {/* Card variants: solar-card (cast-black) vs bianco-card (linen) */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: "var(--space-lg)",
              marginBottom: "var(--space-lg)",
            }}
          >
            <div className="solar-card">
              <div className="bronze-edge" style={{ marginBottom: "var(--space-md)" }}>
                Class A · Cast-Black
              </div>
              <h3
                style={{
                  fontFamily: "var(--font-display)",
                  color: "var(--gold-leaf)",
                  fontSize: 22,
                  marginBottom: "var(--space-sm)",
                }}
              >
                Solarpunk Sovereignty
              </h3>
              <p style={{ color: "var(--bone)", fontSize: 14, lineHeight: 1.7 }}>
                Cast-black ground, gold-leaf display, bronze-edge strip. Reserved for hero cards,
                specimen mats, and brand stamps.
              </p>
            </div>

            <div className="bianco-card">
              <div className="gold-stamp" style={{ marginBottom: "var(--space-md)" }}>
                Class B · Linen-Bone
              </div>
              <h3
                style={{
                  fontFamily: "var(--font-display)",
                  color: "var(--ink)",
                  fontSize: 22,
                  marginBottom: "var(--space-sm)",
                }}
              >
                Solar · Bianco
              </h3>
              <p style={{ color: "var(--ink)", fontSize: 14, lineHeight: 1.7 }}>
                Linen ground, ink display, gold-leaf-link accent. Used for ivory-mark body blocks,
                long-form essays, and the trait-specimen label.
              </p>
            </div>
          </div>

          {/* Hairline divider — the Gold Rule */}
          <div className="hairline-divider" style={{ margin: "var(--space-xl) 0" }} />

          {/* Trait specimen mats — the 240×240 signature grid */}
          <div className="gold-stamp" style={{ marginBottom: "var(--space-md)" }}>
            ◆ Trait Specimens · 240×240
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
              gap: "var(--space-md)",
              marginBottom: "var(--space-lg)",
            }}
          >
            {TRAIT_MAT_LABELS.map((label) => (
              <div key={label} className="trait-mat">
                <div
                  style={{
                    padding: "var(--space-md)",
                    fontFamily: "var(--font-archive)",
                    fontSize: 12,
                    color: "var(--ink)",
                    textAlign: "center",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {label}
                </div>
              </div>
            ))}
          </div>

          {/* Archive strip + bronze-edge stacks */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "var(--space-md)",
              marginBottom: "var(--space-lg)",
            }}
          >
            <div className="archive-strip">// Archive strip · ash ground, bone label</div>
            <div className="bronze-edge">// Bronze edge · bronze ground, gold-leaf label</div>
          </div>

          {/* Stamps row + gold-leaf-link buttons */}
          <div
            style={{
              display: "flex",
              gap: "var(--space-md)",
              flexWrap: "wrap",
              marginBottom: "var(--space-lg)",
              alignItems: "center",
            }}
          >
            <span className="gold-stamp">Token · $QUANTA</span>
            <span className="gold-stamp">Class · A</span>
            <span className="gold-stamp">Specimen · 02 / 12</span>
            <a href="#" className="gold-leaf-link" onClick={(e) => e.preventDefault()}>
              → View on chain
            </a>
          </div>

          {/* Ivory-mark long-form copy */}
          <div className="ivory-mark" style={{ marginBottom: "var(--space-lg)" }}>
            <h4
              style={{
                fontFamily: "var(--font-display)",
                color: "var(--ink)",
                fontSize: 20,
                marginBottom: "var(--space-sm)",
              }}
            >
              On the Gold Rule
            </h4>
            <p style={{ color: "var(--ink)", fontSize: 14, lineHeight: 1.8 }}>
              Every layout split in the SOLAR system gets a 1px gold-deep hairline. The rule is
              not added — it is the currency. Marks separate, but the metal runs continuous. This
              ivory-mark block is one of the few SOLAR surfaces that sits on linen rather than on
              cast-black; reserved for body copy that needs to read for a long time without gold-leaf
              burning the eye.
            </p>
          </div>

          {/* Status footer — proves the SOLAR scope is closed by the wrapper */}
          <div className="hairline-divider" style={{ margin: "var(--space-lg) 0" }} />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontFamily: "var(--font-label)",
              fontSize: 11,
              color: "var(--gold-deep)",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            <span>◆ End of SOLAR scope</span>
            <span>Mounted via SolarThemeProvider · Option B</span>
          </div>
        </SolarThemeProvider>

        {/* Footer — Terminal Dossier chrome picks up again outside the SOLAR scope. */}
        <div className="section-header" style={{ marginTop: 48 }}>
          <div className="label">// verified</div>
          <div>
            <p style={{ fontSize: 12, color: "var(--muted)", maxWidth: 720 }}>
              Acceptance: contrast holds, fonts load, tokens resolve, no console errors. The Terminal
              Dossier chrome above and below the SOLAR scope is unchanged.
            </p>
          </div>
        </div>

        <Footer />
      </PublicLayout>
    </>
  )
}
