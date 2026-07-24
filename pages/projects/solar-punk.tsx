import dynamic from "next/dynamic"
import Layout from "../../components/Layout"
import Footer from "../../components/Footer"

const FarcasterFeed = dynamic(() => import("../../components/FarcasterFeed"), { ssr: false })

// ──────────────────────────────────────────────────────────────────────────
// INK_NOMAD — canonical specs
//   • Solidity 0.8.24 / Foundry
//   • ERC-721A (gas) + ERC-2981 (royalty) + ERC-4906 (metadata refresh)
//   • One canonical silhouette, 4 modular trait slots:
//       HAND · FOREARM · ELBOW · UPPER_ARM
//   • On-chain: only baseHash (bytes4) + owner
//   • Level + visuals composed off-chain at /api/metadata/[tokenId]
//   • Level curve driven by Supercompute Guild Points (consume, never store)
//   • Hard rules: no duplicate XP system, no on-chain art, OZ-only standards
// ──────────────────────────────────────────────────────────────────────────

const architectures = [
  {
    id: "contract",
    label: "01 · Contract",
    title: "ERC-721A + 2981 + 4906",
    tag: "SHIPPED",
    tagColor: "var(--color-sage)",
    desc: "Solidity 0.8.24, Foundry, OpenZeppelin. safeMint / safeMintBatch / packBaseHash / emitMetadataRefresh. 17/17 tests pass. Royalty default 5%, owner-tunable to 10%. Max supply owner-tunable until reveal. No level math on-chain.",
    monogram: "0x4e1b…/InkNomad.sol",
  },
  {
    id: "traits",
    label: "02 · Modularity",
    title: "4 Slot baseHash",
    tag: "SHIPPED",
    tagColor: "var(--color-sage)",
    desc: "Packed bytes4 = HAND | FOREARM << 8 | ELBOW << 16 | UPPER_ARM << 24. Catalog: 6×4×4×3 = 288 valid combinations. Overflow silently clamps so the on-chain hash stays flexible without breaking display.",
    monogram: "0x00010203",
  },
  {
    id: "metadata",
    label: "03 · Endpoint",
    title: "/api/metadata/[tokenId]",
    tag: "LIVE",
    tagColor: "var(--color-teal)",
    desc: "Reads owner + baseHash on-chain via viem. Fetches Guild Points from guild.xyz/supercompute server-side. Composes a 1024×1024 SVG with stable-per-token glitch scan lines and a level-driven aura. Returns ERC-721 JSON with data:image/svg+xml;base64 image.",
    monogram: "GET /api/metadata/1",
  },
  {
    id: "level",
    label: "04 · Level Curve",
    title: "Guild Points → Level",
    tag: "WIRED",
    tagColor: "var(--color-teal)",
    desc: "level = floor(sqrt(points / 100)). Stored nowhere on-chain — composed at metadata fetch. ERC-4906 BatchMetadataUpdate event lets OpenSea/Reservoir refresh on every level bump without burning gas.",
    monogram: "level(4218) = 6",
  },
  {
    id: "page",
    label: "05 · Character Page",
    title: "/character",
    tag: "BUILT",
    tagColor: "var(--color-sage)",
    desc: "Wallet-gated (wagmi + RainbowKit). Reads balanceOf → tokenOfOwnerByIndex → /api/metadata. Renders PFP + trait breakdown panel. No holder → mint CTA. View on OpenSea deep link.",
    monogram: "GET /character",
  },
  {
    id: "mcp",
    label: "06 · MCP Server",
    title: "Virtuals Agent Wallet",
    tag: "NEXT",
    tagColor: "var(--color-sienna)",
    desc: "Tiny MCP server exposing mint_nft / get_balance / transfer_nft against InkNomad.sol. Lets the Virtuals agent drive mints with the user's wallet. Path: ~/2026/ink-nomad-mcp/.",
    monogram: "tools: mint, balance, transfer",
  },
]

const milestones = [
  {
    phase: "Jul 2026",
    title: "Contract + Tests shipped (17/17)",
    desc: "Solidity scaffold, Foundry build, full test coverage. baseHash packing verified.",
    status: "done",
  },
  {
    phase: "Jul 2026",
    title: "Anvil e2e (deploy + mint + readback)",
    desc: "Deployed at 0x5fbdb2315678afecb367f032d93f642f64180aa3 on chain 31337. Token #1 minted to 0x7099…79C8. ownerOf/balanceOf/tokenURI/baseHashOf all verified via cast.",
    status: "done",
  },
  {
    phase: "Jul 2026",
    title: "Metadata endpoint + SVG composer",
    desc: "Dynamic ERC-721 JSON with composed SVG image. Guild Points reader against guild.xyz v2. Trait catalog (17 entries, 288 unique combinations).",
    status: "done",
  },
  {
    phase: "Jul 2026",
    title: "/character page scaffold",
    desc: "wagmi reads + RainbowKit connect. Mint CTA placeholder. OpenSea deep link.",
    status: "done",
  },
  {
    phase: "Aug 2026",
    title: "Real art per slot (cyberpunk)",
    desc: "Replace placeholder geometry with modular SVG <path> art per trait entry. Composer stays the same — contract unchanged.",
    status: "next",
  },
  {
    phase: "Aug 2026",
    title: "Deploy Base Sepolia",
    desc: "real PRIVATE_KEY + BASESCAN_API_KEY from Mone → public Basescan link → mainnet after audit.",
    status: "next",
  },
  {
    phase: "Aug 2026",
    title: "MCP server → Virtuals launch",
    desc: "Agent wallet mint flow. Public 'Powered by Virtuals' on the launch page.",
    status: "next",
  },
]

// 5 rendered SVG variants for the gallery — different baseHash + level
// Each shows that the composer actually swings based on chain state.
const galleryVariants = [
  { id: 1, baseHash: "0x00010203", level: 7, palette: "Fingers · Chrome · Magnetic · Shoulder" },
  { id: 2, baseHash: "0x04030201", level: 12, palette: "MechGrip · Plated · Pneumatic · Bulwark" },
  { id: 3, baseHash: "0x01020300", level: 4, palette: "Solder · Cabled · Servo · Slim" },
  { id: 4, baseHash: "0x05000000", level: 18, palette: "Holo · Carbon · Fixed · Shoulder" },
  { id: 5, baseHash: "0x02010101", level: 9, palette: "Claw · Chrome · Servo · Bulwark" },
]

export default function SolarPunkInkNomad() {
  return (
    <Layout title="SUPERCOMPUTE · Solar Punk · INK_NOMAD">
      {/* ═══════════════════════════════════════════════════════════════════
          HERO
          ═══════════════════════════════════════════════════════════════════ */}
      <section className="hero" id="solar-punk" style={{ position: "relative", overflow: "hidden" }}>
        <div style={{
          position: "absolute", top: "-40%", right: "-10%", width: "600px", height: "600px",
          borderRadius: "50%", background: "radial-gradient(circle, rgba(0,212,184,0.12) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", bottom: "-30%", left: "-5%", width: "400px", height: "400px",
          borderRadius: "50%", background: "radial-gradient(circle, rgba(232,200,122,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        <div style={{ position: "relative", zIndex: 1 }}>
          <div className="hero-kicker">
            <div className="status-dot"></div>
            <span className="label" style={{ color: "var(--color-teal)" }}>// solar punk · build v0.1</span>
            <span style={{
              fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--color-sage)",
              border: "1px solid var(--color-sage)", padding: "2px 8px", marginLeft: 8,
            }}>
              PHASE 1 · SHIPPED
            </span>
          </div>
          <h1 className="display-xl hero-title" style={{ fontSize: "clamp(48px, 10vw, 120px)", lineHeight: 0.85, marginBottom: 24 }}>
            INK<br /><em style={{ color: "var(--color-teal)" }}>NOMAD</em>
          </h1>
          <p className="hero-sub" style={{ maxWidth: 620, fontSize: 14, color: "var(--color-text-primary)" }}>
            Modular cyberpunk character. 1 canonical silhouette, 4 modular limbs.
            Level curves from Supercompute Guild Points. ERC-721A + 2981 + 4906 on Base.
            Composed off-chain at request time.
          </p>

          <div className="hero-actions" style={{ marginTop: 32, display: "flex", gap: 12, flexWrap: "wrap" }}>
            <a href="#architecture" className="btn btn-primary" style={{ background: "var(--color-gold)", borderColor: "var(--color-gold)", color: "var(--color-bg-primary)" }}>→ Architecture</a>
            <a href="#gallery" className="btn btn-outline">Rendered Variants</a>
            <a href="#milestones" className="btn btn-outline">Build Log</a>
            <a href="/character" className="btn btn-outline">/character ↗</a>
          </div>

          <div style={{ marginTop: 40, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16 }}>
            {[
              { k: "Standards", v: "ERC-721A · 2981 · 4906" },
              { k: "Tests", v: "17 / 17 passing" },
              { k: "Slots", v: "4 modular limbs" },
              { k: "Combos", v: "288 valid" },
              { k: "Network", v: "Base (Chain ID 8453)" },
              { k: "Royalty", v: "5% default · 10% max" },
            ].map(m => (
              <div key={m.k} style={{
                border: "1px solid var(--color-border)",
                background: "var(--color-bg-secondary)",
                padding: "14px 16px",
              }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-text-muted)" }}>
                  {m.k}
                </div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--color-gold)", marginTop: 4 }}>
                  {m.v}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          ARCHITECTURE — what we built
          ═══════════════════════════════════════════════════════════════════ */}
      <section className="section" id="architecture">
        <div className="section-header">
          <div className="label" style={{ color: "var(--color-teal)" }}>// architecture</div>
          <div><h2 className="display-md">Solar Punk / INK_NOMAD Stack</h2></div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: 1, background: "var(--color-border)", border: "1px solid var(--color-border)" }}>
          {architectures.map((a) => (
            <div key={a.id} style={{ background: "var(--color-bg-primary)", padding: "28px 24px", display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div className="label-sm" style={{ color: "var(--color-teal)" }}>// {a.label}</div>
                <span style={{
                  fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: "0.1em",
                  textTransform: "uppercase", padding: "2px 8px",
                  border: `1px solid ${a.tagColor}55`, color: a.tagColor,
                }}>
                  {a.tag}
                </span>
              </div>
              <div style={{
                fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700,
                textTransform: "uppercase", letterSpacing: "0.02em",
                marginBottom: 10, color: "var(--color-gold)",
              }}>
                {a.title}
              </div>
              <p style={{ fontSize: 12, color: "var(--color-text-primary)", lineHeight: 1.7, flex: 1, marginBottom: 16 }}>
                {a.desc}
              </p>
              <div style={{
                fontFamily: "var(--font-mono)", fontSize: 10,
                color: "var(--color-teal)", borderTop: "1px solid var(--color-border-subtle)",
                paddingTop: 10,
              }}>
                {a.monogram}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          GALLERY — rendered characters from the composer
          ═══════════════════════════════════════════════════════════════════ */}
      <section className="section" id="gallery">
        <div className="section-header">
          <div className="label" style={{ color: "var(--color-teal)" }}>// rendered</div>
          <div><h2 className="display-md">Composer Output · 5 Variants</h2></div>
        </div>
        <p style={{ fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 24, maxWidth: 720, lineHeight: 1.7 }}>
          These SVGs are produced by <code style={{ color: "var(--color-teal)" }}>composeCharacterSvg({`{ tokenId, traits, level }`})</code> in
          <code style={{ color: "var(--color-teal)" }}> lib/inkNomadTraits.ts</code>. Each variant shows a different
          baseHash combination at a different level — the aura opacity scales with level, the glitch scan lines
          are seeded by tokenId, and the limb geometry swaps color per trait choice.
        </p>

        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))",
          gap: 16, border: "1px solid var(--color-border)",
        }}>
          {galleryVariants.map((v) => (
            <div key={v.id} style={{
              background: "var(--color-bg-secondary)",
              border: "1px solid var(--color-border-subtle)",
              padding: 16,
            }}>
              <div style={{ position: "relative", aspectRatio: "1 / 1", marginBottom: 12, overflow: "hidden", border: "1px solid var(--color-border-subtle)" }}>
                <img
                  src={`/solar-punk/ink_nomad_${v.id}.svg`}
                  alt={`INK_NOMAD #${v.id}`}
                  style={{ width: "100%", height: "100%", display: "block" }}
                />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--color-gold)" }}>
                  INK_NOMAD #{String(v.id).padStart(4, "0")}
                </div>
                <div style={{
                  fontFamily: "var(--font-mono)", fontSize: 9,
                  letterSpacing: "0.1em", padding: "2px 6px",
                  border: "1px solid var(--color-teal)", color: "var(--color-teal)",
                }}>
                  LEVEL {v.level}
                </div>
              </div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--color-teal-dim)" }}>
                baseHash {v.baseHash}
              </div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--color-text-secondary)", marginTop: 4, fontStyle: "italic" }}>
                {v.palette}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          MILESTONES — build log
          ═══════════════════════════════════════════════════════════════════ */}
      <section className="section" id="milestones">
        <div className="section-header">
          <div className="label" style={{ color: "var(--color-teal)" }}>// build log</div>
          <div><h2 className="display-md">Milestones</h2></div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 1, background: "var(--color-border)", border: "1px solid var(--color-border)" }}>
          {milestones.map((m, i) => (
            <div key={i} style={{
              background: "var(--color-bg-primary)", padding: "18px 24px",
              display: "grid", gridTemplateColumns: "100px 1fr 100px", gap: 20, alignItems: "start",
            }}>
              <div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--color-teal)", marginBottom: 2 }}>
                  {m.phase}
                </div>
                <span style={{
                  fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: "0.1em",
                  padding: "2px 6px",
                  border: `1px solid ${m.status === "done" ? "var(--color-sage)" : "var(--color-sienna)"}`,
                  color: m.status === "done" ? "var(--color-sage)" : "var(--color-sienna)",
                }}>
                  {m.status}
                </span>
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4, color: "var(--color-text-primary)" }}>{m.title}</div>
                <p style={{ fontSize: 11, color: "var(--color-text-secondary)", lineHeight: 1.6 }}>{m.desc}</p>
              </div>
              <div style={{ textAlign: "right" }}>
                <span style={{
                  fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--color-text-muted)",
                  letterSpacing: "0.05em",
                }}>
                  {String(i + 1).padStart(2, "0")} / {String(milestones.length).padStart(2, "0")}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          PRINCIPLES — what we don't do
          ═══════════════════════════════════════════════════════════════════ */}
      <section className="section">
        <div className="section-header">
          <div className="label" style={{ color: "var(--color-teal)" }}>// principles</div>
          <div><h2 className="display-md">Hard Rules, Respected</h2></div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 1, background: "var(--color-border)", border: "1px solid var(--color-border)" }}>
          {[
            { num: "01", t: "No duplicate XP", d: "Level comes from guild.xyz/supercompute. The contract stores zero level math. ERC-4906 refreshes marketplace metadata when Guild Points change." },
            { num: "02", t: "No on-chain art", d: "Art is IPFS / endpoint-served SVG. Contract stores only the bytes4 baseHash pointing into the trait catalog." },
            { num: "03", t: "OZ-only standards", d: "ERC-721A (gas), ERC-2981 (royalty), ERC-4906 (metadata refresh). No proprietary shadows of token standards." },
            { num: "04", t: "Royalty capped", d: "5% default, max 10%. Owner-tunable at any time via setRoyaltyInfo(receiver, bps)." },
            { num: "05", t: "Clean code first", d: "Art deferred until final assets land. Composer stays the only art-touching surface — zero contract changes for art swaps." },
            { num: "06", t: "One canonical silhouette", d: "288 modular combos but 1 body. Modular at the limb slots, canonical at the figure — same visual fingerprint, different limbs." },
          ].map((p) => (
            <div key={p.num} style={{ background: "var(--color-bg-primary)", padding: "20px" }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--color-text-muted)", letterSpacing: "0.1em" }}>
                RULE {p.num}
              </div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 14, color: "var(--color-gold)", marginTop: 6, marginBottom: 8, textTransform: "uppercase" }}>
                {p.t}
              </div>
              <p style={{ fontSize: 11, color: "var(--color-text-secondary)", lineHeight: 1.6 }}>
                {p.d}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          FARCASTER feed (keep parity with old page)
          ═══════════════════════════════════════════════════════════════════ */}
      <section className="section">
        <div className="section-header">
          <div className="label" style={{ color: "var(--color-teal)" }}>// farcaster</div>
          <div><h2 className="display-md">Live Feed</h2></div>
        </div>
        <FarcasterFeed fid="" />
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          LINKS
          ═══════════════════════════════════════════════════════════════════ */}
      <section className="section">
        <div className="section-header">
          <div className="label" style={{ color: "var(--color-teal)" }}>// links</div>
          <div><h2 className="display-md">Ecosystem</h2></div>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {[
            { label: "Virtuals Protocol", href: "https://app.virtuals.io", desc: "Agent wallet · MCP target" },
            { label: "Guild.xyz", href: "https://guild.xyz/supercompute", desc: "Level source (no duplicate XP)" },
            { label: "Base Chain", href: "https://base.org", desc: "Settlement layer" },
            { label: "OpenZeppelin", href: "https://docs.openzeppelin.com", desc: "Contract standards" },
            { label: "Chiru Labs · ERC-721A", href: "https://github.com/chiru-labs/ERC721A", desc: "Gas-optimized batch mint" },
            { label: "Foundry", href: "https://getfoundry.sh", desc: "Solidity toolchain" },
          ].map((link) => (
            <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer" style={{
              background: "var(--color-bg-secondary)", border: "1px solid var(--color-border)",
              padding: "14px 18px", textDecoration: "none",
              display: "flex", flexDirection: "column", gap: 4,
              minWidth: 200, flex: 1,
            }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--color-teal)" }}>{link.label}</div>
              <div style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>{link.desc}</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--color-gold)", marginTop: 4 }}>→</div>
            </a>
          ))}
        </div>
      </section>

      <Footer />
    </Layout>
  )
}
