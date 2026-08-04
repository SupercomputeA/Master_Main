import SolarThemeProvider from "../../components/SolarThemeProvider"
import PublicLayout from "../../components/PublicLayout"
import Footer from "../../components/Footer"

export default function SolarPunk() {
  return (
    <PublicLayout title="SUPERCOMPUTE · Solar Punk">
      <section className="hero" style={{
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: "-40%", right: "-10%", width: "600px", height: "600px",
          borderRadius: "50%", background: "radial-gradient(circle, rgba(212,175,55,0.12) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", bottom: "-30%", left: "-5%", width: "400px", height: "400px",
          borderRadius: "50%", background: "radial-gradient(circle, rgba(212,175,55,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        <div style={{ position: "relative", zIndex: 1 }}>
          <div className="hero-kicker">
            <div className="status-dot"></div>
            <span className="label" style={{ color: "var(--accent)" }}>// solar punk · spb</span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--accent)", border: "1px solid var(--accent-dim)", padding: "2px 8px", marginLeft: 8 }}>
              CANON
            </span>
          </div>
          <h1 className="display-xl hero-title" style={{ fontSize: "clamp(48px, 10vw, 120px)", lineHeight: 0.85, marginBottom: 24 }}>
            SOLAR<br /><em style={{ color: "var(--accent)" }}>PUNK</em>
          </h1>
          <p className="hero-sub" style={{ maxWidth: 600, fontSize: 14, color: "var(--fg)" }}>
            SPB character sheets and approved NFT assets. Sacred iconography rendered in the SOLAR canon.
          </p>
        </div>
      </section>

      <SolarThemeProvider>
        {/* Character Sheets */}
        <section className="section" id="character-sheets">
          <div className="section-header">
            <div className="label" style={{ color: "var(--gold-leaf)" }}>// assets</div>
            <div><h2 className="display-md" style={{ fontFamily: "var(--font-display)", color: "var(--gold-leaf)" }}>SPB Character Sheets</h2></div>
          </div>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--bone)", marginBottom: 32, maxWidth: 600, lineHeight: 1.7 }}>
            Full-range character sheets — male and female — in the SPB sacred iconography style.
            Gold + ivory + deep brown palette. Anime-influenced semi-realistic rendering.
          </p>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(480px, 1fr))",
            gap: 24,
          }}>
            <div className="solar-card" style={{ padding: 0, overflow: "hidden" }}>
              <img
                src="/projects/solar-punk/spb-sheet-male-full-range.jpg"
                width={608}
                height={1088}
                loading="lazy"
                alt="SPB Male Character Sheet — Full Range"
                style={{ width: "100%", height: "auto", display: "block" }}
              />
              <div style={{ padding: "12px 16px", borderTop: "var(--gold-rule)" }}>
                <span className="gold-stamp">SPB Sheet — Male — Full Range</span>
              </div>
            </div>
            <div className="solar-card" style={{ padding: 0, overflow: "hidden" }}>
              <img
                src="/projects/solar-punk/spb-sheet-female-full-range.jpg"
                width={608}
                height={1088}
                loading="lazy"
                alt="SPB Female Character Sheet — Full Range"
                style={{ width: "100%", height: "auto", display: "block" }}
              />
              <div style={{ padding: "12px 16px", borderTop: "var(--gold-rule)" }}>
                <span className="gold-stamp">SPB Sheet — Female — Full Range</span>
              </div>
            </div>
          </div>
        </section>

        <div className="hairline-divider" style={{ margin: "48px 0" }} />

        {/* Rare NFT Art */}
        <section className="section" id="rare-art">
          <div className="section-header">
            <div className="label" style={{ color: "var(--gold-leaf)" }}>// nft</div>
            <div><h2 className="display-md" style={{ fontFamily: "var(--font-display)", color: "var(--gold-leaf)" }}>Star-Crossed Lovers — Rare</h2></div>
          </div>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--bone)", marginBottom: 32, maxWidth: 600, lineHeight: 1.7 }}>
            The Star-Crossed Lovers rare NFT triptych. Three canonical views of the SPB romantic arc.
          </p>
          <div className="bianco-card" style={{ padding: "32px", marginBottom: 32 }}>
            <img
              src="/projects/solar-punk/spb-rare-star-crossed-lovers.jpg"
              width={768}
              height={1360}
              loading="lazy"
              alt="Star-Crossed Lovers — Rare NFT"
              style={{ width: "100%", height: "auto", display: "block", borderRadius: "var(--radius-sm)" }}
            />
            <div style={{ marginTop: 16, textAlign: "center" }}>
              <span className="bronze-edge">Star-Crossed Lovers — Rare</span>
            </div>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
            gap: 24,
          }}>
            <div className="solar-card" style={{ padding: 0, overflow: "hidden" }}>
              <img
                src="/projects/solar-punk/spb-lovers-1-first-glance.jpg"
                width={768}
                height={1360}
                loading="lazy"
                alt="SPB Lovers — First Glance"
                style={{ width: "100%", height: "auto", display: "block" }}
              />
              <div style={{ padding: "12px 16px", borderTop: "var(--gold-rule)" }}>
                <span className="gold-stamp">Lovers I — First Glance</span>
              </div>
            </div>
            <div className="solar-card" style={{ padding: 0, overflow: "hidden" }}>
              <img
                src="/projects/solar-punk/spb-lovers-2-secret-rendezvous.jpg"
                width={768}
                height={1360}
                loading="lazy"
                alt="SPB Lovers — Secret Rendezvous"
                style={{ width: "100%", height: "auto", display: "block" }}
              />
              <div style={{ padding: "12px 16px", borderTop: "var(--gold-rule)" }}>
                <span className="gold-stamp">Lovers II — Secret Rendezvous</span>
              </div>
            </div>
          </div>
        </section>

        <div className="hairline-divider" style={{ margin: "48px 0" }} />

        {/* Style Sheet */}
        <section className="section" id="style-sheet">
          <div className="section-header">
            <div className="label" style={{ color: "var(--gold-leaf)" }}>// spec</div>
            <div><h2 className="display-md" style={{ fontFamily: "var(--font-display)", color: "var(--gold-leaf)" }}>SPB Character Style Sheet</h2></div>
          </div>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--bone)", marginBottom: 32, maxWidth: 600, lineHeight: 1.7 }}>
            Full HTML style reference documenting the SPB canon specifications — palette, typography, iconography, and composition rules.
          </p>
          <div className="solar-card" style={{ padding: 0, overflow: "hidden" }}>
            <iframe
              src="/projects/solar-punk/spb-character-style-sheet.html"
              title="SPB Character Style Sheet"
              style={{
                width: "100%",
                height: "80vh",
                border: "none",
                display: "block",
                background: "white",
              }}
            />
            <div style={{ padding: "12px 16px", borderTop: "var(--gold-rule)" }}>
              <a
                href="/projects/solar-punk/spb-character-style-sheet.html"
                target="_blank"
                rel="noopener noreferrer"
                className="gold-leaf-link"
                style={{ display: "inline-block" }}
              >
                → Open Full Screen
              </a>
            </div>
          </div>
        </section>
      </SolarThemeProvider>

      <Footer />
    </PublicLayout>
  )
}