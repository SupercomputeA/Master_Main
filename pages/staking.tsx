import PublicLayout from "../components/PublicLayout"
import Footer from "../components/Footer"

/* Staking at Supercompute — infra-staking project surface.
   Copy source: finance handoff t_17fda3ff (2026-09-04). Early-stage brief:
   genesis = 1 DGX Spark + 1 validator node · target = 5x NVIDIA DGX Spark ·
   3 Ethereum validator nodes (32 ETH each) · launch node = funding vehicle
   for the first DGX Spark purchase. No invented yields, dates, addresses,
   or revenue splits — every unknown is a labeled [PLACEHOLDER]. Writer pass
   expected for final copy (name, positioning, timeline). */

const AT_A_GLANCE = [
  { k: "// project", v: "Staking at Supercompute — [PLACEHOLDER: final name]" },
  { k: "// status", v: "Early stage — genesis plan (not yet live)" },
  { k: "// compute genesis", v: "1x NVIDIA DGX Spark" },
  { k: "// compute target", v: "5x NVIDIA DGX Spark" },
  { k: "// validator genesis", v: "1x Ethereum validator node" },
  { k: "// validator target", v: "3x Ethereum validator node" },
  { k: "// bond per node", v: "32 ETH" },
  { k: "// total bond at target", v: "96 ETH (3 x 32)" },
  { k: "// funding vehicle", v: "Launch node → first DGX Spark purchase" },
  { k: "// chain", v: "Ethereum — [PLACEHOLDER: mainnet / testnet]" },
  { k: "// timeline", v: "[PLACEHOLDER: genesis date + milestones]" },
  { k: "// participation", v: "[PLACEHOLDER: how the launch node raises]" },
]

const LOOP = [
  {
    id: "genesis",
    title: "Genesis — one node, one machine",
    desc: "The cluster starts small: a single DGX Spark and a single Ethereum validator node online together. Enough to prove the loop end-to-end before anything scales. [PLACEHOLDER: genesis date]",
  },
  {
    id: "launch-node",
    title: "The launch node funds the first machine",
    desc: "The first validator node doubles as the funding vehicle — its launch is what pays for DGX Spark unit one. Hardware bought by the network, owned by the network. [PLACEHOLDER: instrument structure, target size]",
  },
  {
    id: "bond",
    title: "Validators scale to three",
    desc: "Staking grows to three Ethereum validator nodes — 32 ETH bonded per node, 96 ETH at full strength. Rewards accrue to the network, not a landlord. [PLACEHOLDER: reward split, custody model]",
  },
  {
    id: "compute",
    title: "Compute scales to five",
    desc: "As funding clears, the fleet grows from one DGX Spark to five. More owned hardware, no cloud lock-in — the cluster is a balance-sheet asset the community backs. [PLACEHOLDER: purchase milestones]",
  },
]

const PHASES = [
  {
    n: "0",
    name: "Launch node design",
    build: "Funding vehicle structure for the first DGX Spark purchase — instrument, target, custody, entry mechanics",
    deliverable: "[PLACEHOLDER: structure doc + dates]",
    gate: true,
  },
  {
    n: "1",
    name: "Genesis node + first machine",
    build: "1x DGX Spark online · 1x Ethereum validator node online · launch node fills",
    deliverable: "Hardware purchased · validator signing",
    gate: true,
  },
  {
    n: "2",
    name: "Validator scale",
    build: "1 → 3 Ethereum validator nodes (32 ETH each · 96 ETH bonded)",
    deliverable: "3x validators · rewards flowing",
    gate: true,
  },
  {
    n: "3",
    name: "Compute scale",
    build: "1 → 5 DGX Spark as funding clears",
    deliverable: "5x DGX Spark cluster",
    gate: true,
  },
]

const KNOWN = [
  { k: "genesis", v: "1 DGX Spark · 1 validator node" },
  { k: "compute target", v: "5x NVIDIA DGX Spark" },
  { k: "validator target", v: "3x Ethereum validator nodes" },
  { k: "per-node bond", v: "32 ETH" },
  { k: "funding logic", v: "Launch node → first DGX Spark" },
]

const UNKNOWN = [
  { k: "name / positioning", v: "final project name + one-line story" },
  { k: "timeline", v: "genesis date, milestone gates" },
  { k: "launch instrument", v: "how the funding vehicle raises (node sale / bond / allocation)" },
  { k: "reward split", v: "where validator + compute yield goes" },
  { k: "custody", v: "who signs, which wallet/multisig" },
  { k: "chain + contracts", v: "mainnet vs testnet, contract addresses" },
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

function Meter({ label, now, max, unit }: { label: string; now: string; max: string; unit: string }) {
  return (
    <div style={{ background: "var(--bg)", border: "1px solid var(--border)", padding: "16px 18px" }}>
      <div className="label-sm" style={{ color: "var(--muted)", marginBottom: 10 }}>// {label}</div>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 30, fontWeight: 700, color: "var(--cream)", lineHeight: 1 }}>
        {now}<span style={{ fontSize: 14, color: "var(--muted)", marginLeft: 6 }}>/ {max} {unit}</span>
      </div>
      <div style={{ marginTop: 14, height: 4, background: "var(--border)", position: "relative" }}>
        <div style={{ width: now === "0" ? "2px" : "18%", height: 4, background: "var(--accent)" }} />
      </div>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.12em", color: "var(--accent)", marginTop: 8, textTransform: "uppercase" }}>
        genesis target · static until live
      </div>
    </div>
  )
}

export default function StakingProject() {
  return (
    <PublicLayout title="SUPERCOMPUTE · Staking at Supercompute">
      {/* ============ HERO ============ */}
      <section className="hero" id="staking">
        <div className="hero-kicker">
          <div className="status-dot"></div>
          <span className="label" style={{ color: "var(--accent)" }}>// staking · infrastructure rail</span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--accent)", border: "1px solid var(--accent-dim)", padding: "2px 8px", marginLeft: 8 }}>
            EARLY-STAGE — GENESIS PLAN
          </span>
        </div>
        <h1 className="display-xl hero-title" style={{ fontSize: "clamp(44px, 9vw, 110px)", lineHeight: 0.85, marginBottom: 24 }}>
          STAKING AT<em style={{ color: "var(--accent)" }}> SUPERCOMPUTE</em>
        </h1>
        <p className="hero-sub" style={{ maxWidth: 640, fontSize: 14, color: "var(--fg)" }}>
          <strong>Community-backed Ethereum validators that buy the cluster.</strong>{" "}
          Supercompute's staking rail turns validator rewards into owned hardware —
          starting with one DGX Spark and one validator node, scaling to five machines
          and three validators (96 ETH bonded). The launch node is the funding vehicle
          for the first DGX Spark purchase.
        </p>
      </section>

      {/* ============ SYSTEM SHEET ============ */}
      <section className="section" id="at-a-glance">
        <div className="section-header">
          <div className="label" style={{ color: "var(--accent)" }}>// at a glance</div>
          <div><h2 className="display-md">System Sheet</h2></div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 1, background: "var(--border)", border: "1px solid var(--border)", marginBottom: 28 }}>
          {AT_A_GLANCE.map((row) => (
            <div key={row.k} style={{ background: "var(--bg)", padding: "14px 16px" }}>
              <div className="label-sm" style={{ marginBottom: 4, color: "var(--muted)" }}>{row.k}</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--fg)", lineHeight: 1.5 }}>{row.v}</div>
            </div>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 1, background: "var(--border)", border: "1px solid var(--border)", marginBottom: 12 }}>
          <Meter label="dgx spark compute" now="0" max="5" unit="units" />
          <Meter label="validator nodes" now="0" max="3" unit="nodes" />
          <Meter label="eth bonded" now="0" max="96" unit="ETH" />
          <Meter label="dgx spark funded" now="0" max="1" unit="via launch node" />
        </div>
      </section>

      {/* ============ THE LOOP ============ */}
      <section className="section">
        <div className="section-header">
          <div className="label" style={{ color: "var(--accent)" }}>// how it runs</div>
          <div><h2 className="display-md">The loop</h2></div>
        </div>
        <p style={{ fontSize: 13, color: "var(--fg)", lineHeight: 1.8, maxWidth: 760, marginBottom: 20 }}>
          Stake → own hardware → run the fleet. The loop is designed so the network's own
          rewards become the network's own machines — no cloud rent, no landlord in the middle.
        </p>
        <FeatureGrid items={LOOP} />
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderLeft: "2px solid var(--accent)", padding: "20px 24px" }}>
          <p style={{ fontSize: 12, color: "var(--fg)", lineHeight: 1.7, marginBottom: 0 }}>
            <strong>Early-stage honesty:</strong> nothing above is live yet. The numbers that are
            decided — 1 → 5 DGX Spark, 1 → 3 validators, 32 ETH per node, launch node as the
            funding vehicle — come from the project brief. Everything structural that is not yet
            decided is a labeled [PLACEHOLDER] below. No invented yields, dates, or addresses.
          </p>
        </div>
      </section>

      {/* ============ ROADMAP ============ */}
      <section className="section" id="roadmap">
        <div className="section-header">
          <div className="label" style={{ color: "var(--accent)" }}>// roadmap</div>
          <div><h2 className="display-md">Four phases · gated</h2></div>
        </div>
        <p style={{ fontSize: 13, color: "var(--fg)", lineHeight: 1.8, maxWidth: 760, marginBottom: 20 }}>
          Built the same way every Supercompute project runs: in stages, each one verified
          before the next opens. [PLACEHOLDER: timeline for each gate.]
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 1, background: "var(--border)", border: "1px solid var(--border)", marginBottom: 28 }}>
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
      </section>

      {/* ============ KNOWN / UNKNOWN ============ */}
      <section className="section">
        <div className="section-header">
          <div className="label" style={{ color: "var(--accent)" }}>// ledger</div>
          <div><h2 className="display-md">Decided vs open</h2></div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 1, background: "var(--border)", border: "1px solid var(--border)", marginBottom: 20 }}>
          <div style={{ background: "var(--bg)", padding: "20px 22px" }}>
            <div className="label-sm" style={{ color: "var(--accent)", marginBottom: 12 }}>// decided — from the brief</div>
            {KNOWN.map((k) => (
              <div key={k.k} style={{ marginBottom: 12 }}>
                <div className="label-sm" style={{ color: "var(--muted)", marginBottom: 2 }}>{k.k}</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--fg)" }}>{k.v}</div>
              </div>
            ))}
          </div>
          <div style={{ background: "var(--bg)", padding: "20px 22px" }}>
            <div className="label-sm" style={{ color: "var(--accent)", marginBottom: 12 }}>// open — labeled slots</div>
            {UNKNOWN.map((k) => (
              <div key={k.k} style={{ marginBottom: 12 }}>
                <div className="label-sm" style={{ color: "var(--muted)", marginBottom: 2 }}>{k.k}</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--cream)" }}>[PLACEHOLDER: {k.v}]</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "28px" }}>
          <p style={{ fontSize: 13, color: "var(--fg)", lineHeight: 1.8, marginBottom: 20 }}>
            This page is a scaffold, not a claim. The writer pass will turn it into final copy
            once the project has a name, a timeline, and a launch structure. Until then, the
            only promises on this page are the ones the brief made.
          </p>
          <p style={{ fontSize: 15, color: "var(--cream)", lineHeight: 1.8, marginBottom: 0, fontFamily: "var(--font-mono)" }}>
            The network pays for the machines. The machines run the network.
          </p>
        </div>
      </section>

      <Footer />
    </PublicLayout>
  )
}
