import PublicLayout from "../../components/PublicLayout"
import Footer from "../../components/Footer"

/* Presence (PRSN) — "POAP with Hermes".
   Community project page. Copy source: writer draft
   (kanban writer t_760f3ce6 → content/drafts/presence-project-page.md),
   which drew only from the Pallas R ProjectDesk Build Brief (2026-09-09)
   and the Building POAPs With EAS research brief. No invented features,
   dates, addresses, or links. Public-good project — no fund/payment surface. */

const AT_A_GLANCE = [
  { k: "// name", v: "Presence — protocol: PRSN" },
  { k: "// license", v: "MIT · self-hostable monorepo" },
  { k: "// claims", v: "Gasless — EIP-712 signed off-chain, $0 fees" },
  { k: "// chain", v: "Base (L2) — testnet first, mainnet after review" },
  { k: "// memory layer", v: "IPFS / Arweave" },
  { k: "// identity", v: "Wallet-free — passkeys / social login" },
  { k: "// rails", v: "EAS · 0xSplits · ENS" },
  { k: "// build model", v: "Five phases · four check-in gates · no auto-chaining" },
]

const PRIMITIVES = [
  {
    id: "gasless",
    title: "Gasless claiming",
    desc: "Organizers sign attendance off-chain with EIP-712 typed signatures. Attendees scan a QR code and walk away with a signed payload — stored locally, at $0 in network fees. No transaction stuck in a mempool during a crowded event. No gas anxiety at the door.",
  },
  {
    id: "qr",
    title: "Dynamic anti-farming QR",
    desc: "The QR rotates — time-limited tokens carrying fresh nonces. A photo of a screen does not work, because a photo does not carry the rotation. You have to be in the room, in the moment, to claim the proof. That is the entire point.",
  },
  {
    id: "soulbound",
    title: "Soulbound by design",
    desc: "Attestations bind to the recipient's address. They are claims, not commodities — no secondary-market resale, no badge farming, no scalping of presence. The proof belongs to the person who earned it.",
  },
  {
    id: "l2sync",
    title: "Optional L2 sync",
    desc: "Claims live off-chain for speed and zero cost; anyone who wants their presence verifiable on-chain can post the attestation to Base — our locked L2 — for a fraction of an NFT mint, where L2 indexers can read it forever.",
  },
]

const MOMENTS = [
  {
    id: "memories",
    title: "Digital memories, attested",
    desc: "POAP had a feature that mattered far beyond the crypto-native crowd: letting people attach real-world media to their badge — photos, voice memos, journal notes — turning a proof of attendance into a proof of experience. Presence rebuilds it properly. Media goes to IPFS or Arweave and gets a permanent address; a second EAS schema attests each memory and points it back at the event's attestation via refUID. Photo, voice, journal — each one a signed line in your record of being alive in that room.",
  },
  {
    id: "timelines",
    title: "Shared event timelines",
    desc: "Because every memory references the event's UID, the app can gather them all — your photos, someone else's voice note, the group shot three people took at once — into one community timeline of the event. The record of the room is bigger than any one person's camera roll.",
  },
  {
    id: "vouching",
    title: "Multi-party vouching",
    desc: "Attendees can attest each other into the record — \"I was here with @mario.\" Presence stops being a single organizer's claim and becomes a web of witnesses. That is how a record earns trust.",
  },
]

const OPEN_RAILS = [
  {
    id: "walletfree",
    title: "Wallet-free onboarding",
    desc: "Most people who show up to things do not have a wallet, and they should not need one to prove they were there. Presence ships social and email login via passkeys and Web3Auth with an embedded wallet underneath — the crypto stays in the machinery where it belongs.",
  },
  {
    id: "hasattended",
    title: "Token gating and governance APIs",
    desc: "Third-party sites, Discord servers, and DAOs can query a GraphQL hasAttended(eventID) — instant, gasless verification against the organizer's signed attestations. Raffles, votes, member access, airdrops: any system that used to check \"do you hold the NFT\" can now check \"were you actually there.\"",
  },
  {
    id: "resolver",
    title: "Optional ERC-721 resolver badge",
    desc: "If someone wants their presence visible in the standard wallet tab, an EAS Resolver contract can mint a light, soulbound ERC-721 badge on attestation — only when the attendee opts in. Wallet display without wallet requirement.",
  },
]

const PHASES = [
  {
    n: "1",
    name: "Contracts & Schemas",
    build: "PresenceEvent + PresenceMoment schemas via the EAS SDK; optional resolver contract",
    deliverable: "packages/contracts/schemas.json · PresenceResolver.sol",
  },
  {
    n: "2",
    name: "Signing Engine & SDK",
    build: "EIP-712 typed-signing generator and validator; rotatable QR token generator",
    deliverable: "@prsn/sdk — off-chain attestations, signature validation, payload compression",
  },
  {
    n: "3",
    name: "Decentralized Storage",
    build: "IPFS/Helia pinning for media and metadata ahead of refUID attestations",
    deliverable: "packages/core/storage.ts — metadata generation, CID hashing",
  },
  {
    n: "4",
    name: "UI & Mobile Web",
    build: "Next.js / PWA — organizer QR stream, attendee camera scanner, capsule gallery",
    deliverable: "apps/web — Wagmi/Viem hooks, social-login passkeys",
  },
  {
    n: "5",
    name: "CI/CD & Integration",
    build: "Burst testing, off-chain signature verification, GraphQL indexer sync",
    deliverable: "GitHub Actions on every commit",
  },
]

const COMMUNITY = [
  {
    t: "Supercompute events",
    d: "When the community gathers, presence becomes a badge — a signed claim that you were in that room, soulbound to you, readable forever.",
  },
  {
    t: "Web3 School classes",
    d: "Attendance in the classes is real attendance. Complete a session, keep the proof. The school has been teaching wallets, DeFi, and ReFi — Presence gives the students a record of the path they walked.",
  },
  {
    t: "Livestreams and NewsDesk check-ins",
    d: "Being present for the broadcast is presence too. Watch live, claim the proof, build a record of having followed the story as it happened.",
  },
  {
    t: "Digital memories",
    d: "The event timeline is not just yours. Photo of the whiteboard, voice note from the after-talk, journal line from the train home — all of it lands in a shared, attested record of what happened, kept by the people who were there.",
  },
  {
    t: "DAOs, Discord servers, and builders",
    d: "If you run a community that needs to know who showed up — for gating, governance, raffles, or just the record — hasAttended() is an open API on open attestations. No permission needed. No company in the middle.",
  },
  {
    t: "Contributors",
    d: "Presence is MIT and built in public. The schema work, the SDK, the storage layer, the UI — every phase is an open hand to anyone who wants to build it with us.",
  },
]

const groupStyle = {
  background: "var(--bg)",
  padding: "20px 24px",
  display: "flex",
  flexDirection: "column",
} as const

const featureTitleStyle = {
  fontFamily: "var(--font-display)",
  fontSize: 16,
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.02em",
  marginBottom: 10,
  color: "var(--accent)",
} as const

const featureDescStyle = {
  fontSize: 12,
  color: "var(--fg)",
  lineHeight: 1.7,
  flex: 1,
  marginBottom: 8,
} as const

function FeatureGrid({ items }: { items: { id: string; title: string; desc: string }[] }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 1, background: "var(--border)", border: "1px solid var(--border)", marginBottom: 28 }}>
      {items.map((f) => (
        <div key={f.id} style={groupStyle}>
          <div className="label-sm" style={{ color: "var(--accent)", marginBottom: 12 }}>// {f.id.replace(/-/g, " ")}</div>
          <div style={featureTitleStyle}>{f.title}</div>
          <p style={featureDescStyle}>{f.desc}</p>
        </div>
      ))}
    </div>
  )
}

export default function PresenceProject() {
  return (
    <PublicLayout title="SUPERCOMPUTE · Presence (PRSN)">
      {/* ============ HERO ============ */}
      <section className="hero" id="presence">
        <div className="hero-kicker">
          <div className="status-dot"></div>
          <span className="label" style={{ color: "var(--accent)" }}>// presence · open-source protocol</span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--accent)", border: "1px solid var(--accent-dim)", padding: "2px 8px", marginLeft: 8 }}>
            PHASE 1 — AT THE GATE
          </span>
        </div>
        <h1 className="display-xl hero-title" style={{ fontSize: "clamp(48px, 10vw, 120px)", lineHeight: 0.85, marginBottom: 24 }}>
          PRESENCE<em style={{ color: "var(--accent)" }}> · PRSN</em>
        </h1>
        <p className="hero-sub" style={{ maxWidth: 640, fontSize: 14, color: "var(--fg)" }}>
          <strong>Open-source, gasless proof of existence and experience.</strong>{" "}
          A build-in-public project from the Supercompute fleet: an open, EAS-native replacement for
          proof-of-attendance badges — built and managed by Hermes agents, staged behind check-in gates,
          and licensed so that no company can ever take it away again.
        </p>
      </section>

      {/* ============ AT A GLANCE ============ */}
      <section className="section" id="at-a-glance">
        <div className="section-header">
          <div className="label" style={{ color: "var(--accent)" }}>// at a glance</div>
          <div><h2 className="display-md">System Sheet</h2></div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 1, background: "var(--border)", border: "1px solid var(--border)" }}>
          {AT_A_GLANCE.map((row) => (
            <div key={row.k} style={{ background: "var(--bg)", padding: "14px 16px" }}>
              <div className="label-sm" style={{ marginBottom: 4, color: "var(--muted)" }}>{row.k}</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--fg)", lineHeight: 1.5 }}>{row.v}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ============ THE DOOR THAT CLOSED ============ */}
      <section className="section">
        <div className="section-header">
          <div className="label" style={{ color: "var(--accent)" }}>// why</div>
          <div><h2 className="display-md">The door that closed</h2></div>
        </div>
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "28px" }}>
          <p style={{ fontSize: 13, color: "var(--fg)", lineHeight: 1.8, marginBottom: 16 }}>
            For a whole era of the web, one small badge meant more than it looked like it meant. A little
            pixel drawing pinned to a wallet — and under it, a fact you could prove: <em>I was there.</em>{" "}
            The conference, the hackathon, the launch party, the DAO call that mattered. Attendance is one
            of the few things that cannot be faked by posting about it afterward, and POAP was the machine
            that minted that truth into something portable.
          </p>
          <p style={{ fontSize: 13, color: "var(--fg)", lineHeight: 1.8, marginBottom: 16 }}>
            Then the machine stopped.
          </p>
          <p style={{ fontSize: 13, color: "var(--fg)", lineHeight: 1.8, marginBottom: 20 }}>
            Legacy POAP is winding down — maintenance mode, no new issuers. Not because people stopped
            showing up to things. Because the company that ran the badges stopped running them. That is the
            failure mode that closed the door: a service millions of organizers, hackathons, and DAOs
            relied on was a service they did not own. It never opened its source. When the operator moved
            on, every badge system built on it lost its future at once.
          </p>
          <p style={{ fontSize: 13, color: "var(--fg)", lineHeight: 1.8, marginBottom: 20 }}>
            And there was a second problem underneath the first, one Mone has said plainly since the day
            this project began:
          </p>
          <blockquote style={{ borderLeft: "2px solid var(--accent)", margin: "0 0 20px 0", padding: "4px 0 4px 20px" }}>
            <p style={{ fontSize: 15, color: "var(--cream)", lineHeight: 1.7, fontFamily: "var(--font-mono)" }}>
              "I never liked that POAP was not open source — we need an open source alternative."
            </p>
          </blockquote>
          <p style={{ fontSize: 13, color: "var(--fg)", lineHeight: 1.8, marginBottom: 0 }}>
            Not a fork. Not a clone with a different logo. An alternative that starts from the answer to
            the question POAP never answered: <em>what happens to your proof of being there when the
            company that issued it is gone?</em>
          </p>
        </div>
      </section>

      {/* ============ THE OPEN GAP ============ */}
      <section className="section">
        <div className="section-header">
          <div className="label" style={{ color: "var(--accent)" }}>// gap</div>
          <div><h2 className="display-md">The open gap</h2></div>
        </div>
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "28px" }}>
          <p style={{ fontSize: 13, color: "var(--fg)", lineHeight: 1.8, marginBottom: 16 }}>
            When a door closes, the people who were walking through it keep walking. The research that
            framed this build put the number of organizers, hackathons, and DAOs left without an active,
            easy-to-use replacement in the millions. They need the same thing POAP gave them — badges,
            claim codes, event pages, proof-of-attendance gating — and they need it from something that
            cannot be switched off by a board decision.
          </p>
          <p style={{ fontSize: 13, color: "var(--fg)", lineHeight: 1.8, marginBottom: 16 }}>
            The replacement exists as infrastructure already. The Ethereum Attestation Service (EAS) treats
            "attendance" not as a token you mint and sell, but as a{" "}
            <strong>structured, cryptographically signed claim</strong> — a statement about the world,
            signed by the organizer who was there to witness it, bound permanently to the person it
            describes. Claims do not need a company to keep existing. They need a schema, a signature, and
            an indexer. None of those can go into maintenance mode and take your history with them.
          </p>
          <p style={{ fontSize: 13, color: "var(--fg)", lineHeight: 1.8, marginBottom: 0 }}>
            That is the architecture Presence is built on. Zero-gas claims. No company-shutdown failure
            mode. Open source, so the thing you depend on is a thing you can read, run, and keep.
          </p>
        </div>
      </section>

      {/* ============ WHAT PRESENCE IS ============ */}
      <section className="section">
        <div className="section-header">
          <div className="label" style={{ color: "var(--accent)" }}>// what</div>
          <div><h2 className="display-md">What Presence is</h2></div>
        </div>
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "28px" }}>
          <p style={{ fontSize: 13, color: "var(--fg)", lineHeight: 1.8, marginBottom: 16 }}>
            <strong>Presence</strong> — short name and protocol handle: <strong>PRSN</strong> — is an
            open-source, gasless proof-of-existence-and-experience app.
          </p>
          <p style={{ fontSize: 13, color: "var(--fg)", lineHeight: 1.8, marginBottom: 16 }}>
            It is MIT-licensed and self-hostable as a monorepo, built on the rails the ecosystem already
            trusts: EAS for attestations, 0xSplits and ENS among the supported services. It is built and
            managed by Hermes agents — the same fleet discipline Supercompute runs everything on: one phase
            at a time, evidence at every gate, no auto-chaining past a checkpoint.
          </p>
          <p style={{ fontSize: 15, color: "var(--cream)", lineHeight: 1.8, marginBottom: 0, fontFamily: "var(--font-mono)" }}>
            Attendance is a record, not a collectible. Presence keeps it that way.
          </p>
        </div>
      </section>

      {/* ============ FEATURE SET ============ */}
      <section className="section">
        <div className="section-header">
          <div className="label" style={{ color: "var(--accent)" }}>// feature set</div>
          <div><h2 className="display-md">The proof itself</h2></div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
          <div className="label" style={{ color: "var(--accent)" }}>01</div>
          <div><h3 style={{ fontSize: 15, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>Attendance primitives</h3></div>
        </div>
        <FeatureGrid items={PRIMITIVES} />

        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
          <div className="label" style={{ color: "var(--accent)" }}>02</div>
          <div><h3 style={{ fontSize: 15, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>Moments — the memory layer</h3></div>
        </div>
        <FeatureGrid items={MOMENTS} />

        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
          <div className="label" style={{ color: "var(--accent)" }}>03</div>
          <div><h3 style={{ fontSize: 15, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>Open rails — built for communities, not lock-in</h3></div>
        </div>
        <FeatureGrid items={OPEN_RAILS} />
      </section>

      {/* ============ ARCHITECTURE ============ */}
      <section className="section">
        <div className="section-header">
          <div className="label" style={{ color: "var(--accent)" }}>// architecture</div>
          <div><h2 className="display-md">Three layers, chosen to outlive any operator</h2></div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 1, background: "var(--border)", border: "1px solid var(--border)", marginBottom: 20 }}>
          <div style={{ background: "var(--bg)", padding: "22px 24px" }}>
            <div className="label-sm" style={{ color: "var(--accent)", marginBottom: 6 }}>// 1 · schemas on base</div>
            <p style={{ fontSize: 13, color: "var(--fg)", lineHeight: 1.8, marginBottom: 12 }}>
              Presence registers two EAS schemas — one for events, one for moments. The event schema is
              lean and verifiable:
            </p>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--cream)", background: "var(--surface)", border: "1px solid var(--border)", padding: "14px 16px", overflowX: "auto", whiteSpace: "nowrap" }}>
              bytes32 eventId, string eventName, uint64 timestamp, string location, bytes32 secretHash
            </div>
            <p style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.7, marginTop: 12, marginBottom: 0 }}>
              — the secret hash is what makes dynamic, anti-farming claims possible. The moment schema
              carries media references (IPFS CIDs) and a <span style={{ fontFamily: "var(--font-mono)", color: "var(--fg)" }}>refUID</span>{" "}
              pointing back to the event attestation.
            </p>
          </div>
          <div style={{ background: "var(--bg)", padding: "22px 24px" }}>
            <div className="label-sm" style={{ color: "var(--accent)", marginBottom: 6 }}>// 2 · off-chain claims, on-chain when you want them</div>
            <p style={{ fontSize: 13, color: "var(--fg)", lineHeight: 1.8, marginBottom: 0 }}>
              Claims are signed off-chain for zero gas; the L2 sync makes verification permanent and
              public on Base. The indexer does the rest.
            </p>
          </div>
          <div style={{ background: "var(--bg)", padding: "22px 24px" }}>
            <div className="label-sm" style={{ color: "var(--accent)", marginBottom: 6 }}>// 3 · storage on IPFS / arweave</div>
            <p style={{ fontSize: 13, color: "var(--fg)", lineHeight: 1.8, marginBottom: 0 }}>
              The memory layer — media and metadata — is pinned to decentralized file stores before any
              attestation references it. Content-addressed, permanent, and not dependent on Presence the
              company — because there is no Presence the company. There is Presence the protocol, and
              anyone can run it.
            </p>
          </div>
        </div>
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderLeft: "2px solid var(--accent)", padding: "20px 24px" }}>
          <p style={{ fontSize: 12, color: "var(--fg)", lineHeight: 1.7, marginBottom: 0 }}>
            The discipline is stated in the build constraints and it is not negotiable:{" "}
            <strong>testnet first</strong> — Base Sepolia (chain 84532) for schema registration and the
            resolver — mainnet only after review. And <strong>no fund or payment features in v1</strong>.
            This is a public-good app. If payments ever come, they arrive through a security gate and a
            human go/no-go — not through scope creep.
          </p>
        </div>
      </section>

      {/* ============ ROADMAP ============ */}
      <section className="section" id="roadmap">
        <div className="section-header">
          <div className="label" style={{ color: "var(--accent)" }}>// roadmap</div>
          <div><h2 className="display-md">Five phases · four gates</h2></div>
        </div>
        <p style={{ fontSize: 13, color: "var(--fg)", lineHeight: 1.8, maxWidth: 760, marginBottom: 20 }}>
          Presence is not built in one heroic push. It is built the way infrastructure should be:{" "}
          <strong>in stages, each one verified before the next starts</strong>. Every phase ends at a
          check-in gate — the executor posts evidence, the fleet verifies, and only then does the next
          phase open. No auto-chaining past a gate. That is the staged completion model this project runs
          on, and it is visible in every status update.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 1, background: "var(--border)", border: "1px solid var(--border)", marginBottom: 20 }}>
          {PHASES.map((p) => (
            <div key={p.n} style={{ background: "var(--bg)", padding: "18px 24px", display: "grid", gridTemplateColumns: "42px 190px 1fr 200px", gap: 16, alignItems: "start" }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700, color: "var(--accent)", opacity: 0.35 }}>{p.n}</div>
              <div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 600, color: "var(--cream)", marginBottom: 2 }}>PHASE {p.n} — {p.name.toUpperCase()}</div>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: "0.1em", padding: "2px 6px", border: "1px solid var(--border)", color: "var(--fg)" }}>
                  CHECK-IN GATE
                </span>
              </div>
              <p style={{ fontSize: 12, color: "var(--fg)", lineHeight: 1.7, margin: 0 }}>{p.build}</p>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--muted)", lineHeight: 1.6 }}>{p.deliverable}</div>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 13, color: "var(--fg)", lineHeight: 1.8, maxWidth: 760, marginBottom: 0 }}>
          The agent build estimate from the research brief is 18–34 hours across the five phases — small
          enough to ship, gated enough to trust. Status as of this page:{" "}
          <strong>kicked off 2026-09-09, with Phase 1 — contracts and schemas — first at the gate.</strong>
        </p>
      </section>

      {/* ============ COMMUNITY ============ */}
      <section className="section">
        <div className="section-header">
          <div className="label" style={{ color: "var(--accent)" }}>// community</div>
          <div><h2 className="display-md">Where the community plugs in</h2></div>
        </div>
        <p style={{ fontSize: 13, color: "var(--fg)", lineHeight: 1.8, maxWidth: 760, marginBottom: 20 }}>
          Presence was not designed in the abstract. It was designed around the rooms Supercompute already
          keeps — and it comes home to them first.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 1, background: "var(--border)", border: "1px solid var(--border)", marginBottom: 28 }}>
          {COMMUNITY.map((c) => (
            <div key={c.t} style={{ background: "var(--bg)", padding: "20px 22px" }}>
              <div style={featureTitleStyle}>{c.t}</div>
              <p style={featureDescStyle}>{c.d}</p>
            </div>
          ))}
        </div>
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "28px" }}>
          <p style={{ fontSize: 13, color: "var(--fg)", lineHeight: 1.8, marginBottom: 20 }}>
            POAP proved that people will carry a small proof of being somewhere, for years, for no other
            reason than that it happened. That instinct was never the problem. The problem was that the
            proof lived inside a company. Presence moves the proof onto infrastructure that belongs to
            everyone — and it starts with the rooms where our own community shows up.
          </p>
          <p style={{ fontSize: 15, color: "var(--cream)", lineHeight: 1.8, marginBottom: 0, fontFamily: "var(--font-mono)" }}>
            If you were there, the record should say so. Forever. That is what we are building — and the
            door is open.
          </p>
        </div>
      </section>

      <Footer />
    </PublicLayout>
  )
}
