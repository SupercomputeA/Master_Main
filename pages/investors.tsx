import { useEffect, useState } from "react"
import Head from "next/head"
import Link from "next/link"
import PublicLayout from "../components/PublicLayout"
import Footer from "../components/Footer"

/* /investors — public investor-relations surface for TradeDesk / Robinhood Chain.
 *
 * Scope: narrative + contact + data-room link + metrics mirror. NOT a sale
 * surface, NOT an SEC filing, NOT a securities offering. Every section that
 * needs real numbers from Mone is flagged [PLACEHOLDER].
 *
 * Aesthetic: 80s anime sakuga + telemetry — same Terminal Dossier palette as
 * /tradedesk. We reuse the .tradedesk-card primitives for visual consistency. */

type MetricsResponse = {
  ok?: boolean
  fetchedAt?: string
  chain?: {
    provider?: string
    chainId?: number | null
    expectedChainId?: number
    chainIdMatch?: boolean
    blockNumber?: number | null
    gasPriceGwei?: number | null
    available?: boolean
    error?: string
  }
  supercomputeWallet?: {
    address?: string
    explorer?: string
    txCount?: number | null
    txCountLabel?: string | null
    balanceEth?: number | null
  }
  supercompute?: {
    articles?: number | null
    sessionsActive?: number | null
    investorsContacted?: number | null
  }
  disclaimer?: string
}

const TEAM_PLACEHOLDERS = [
  {
    name: "Mone",
    role: "Founder · Operator",
    bio: "Hands-on Web3 operator since 2013. Built and shipped on every cycle — Bitcoin mining, early DeFi, Base L2, and the agent fleet behind supercompute.io.",
    public: true,
  },
  {
    name: "Agent fleet",
    role: "Autonomous ops",
    bio: "Specialist agents orchestrated via Hermes. Cover research (Quanta S), trading (Knight), ops (Hermes), and content (publishing agents). Full list lives at /fleet.",
    public: true,
  },
  {
    name: "Advisors & partners",
    role: "[PLACEHOLDER]",
    bio: "Advisors and strategic partners to be confirmed by Mone. Will not be listed until written consent + signed engagement is on file.",
    public: false,
  },
]

const FAQ = [
  {
    q: "What is Robinhood Chain?",
    a: "[PLACEHOLDER — Robinhood Chain is a public, permissionless Arbitrum L2 (chain ID 4663) operated by Robinhood. ETH is the native gas token. We use it for the TradeDesk public rail because settlement is cheap and Blockscout is the default explorer.]",
  },
  {
    q: "Why a public rail at all?",
    a: "[PLACEHOLDER — The TradeDesk rail is read-only by design: balances, quotes, and portfolio views against on-chain state. No live swaps, no bridge transactions, no wallet writes. It exists to give the public a verifiable window into what we've built without inviting a regulatory scope we don't want.]",
  },
  {
    q: "What is the agent fleet?",
    a: "[PLACEHOLDER — The fleet is a small set of specialist agents (research, trading, ops, content) orchestrated by Hermes Agent (Nous Research). Each agent runs in an isolated context with its own skill set and its own audit trail. They produce observable artifacts — published articles, transactions, alerts — not autonomous money movement.]",
  },
  {
    q: "How does the revenue model work?",
    a: "[PLACEHOLDER — Mix of consulting retainers (Web3 ops for select DAOs and protocols), marketplace fees on the TradeDesk simulator when live execution is enabled, and content licensing on NewsDesk. We do not charge retail users for read access.]",
  },
  {
    q: "What is the exit?",
    a: "[PLACEHOLDER — Tradeable equity in the operating entity, with a standard 3-year vesting + 1-year cliff. Liquidity path to be determined; the goal is a strategic acquisition or a continued operator-led hold. No token-sale mechanics on-chain.]",
  },
  {
    q: "Who are the competitors?",
    a: "[PLACEHOLDER — Adjacent: Zerion, Zapper, Debank, Robinhood app itself (we are read-only against Robinhood Chain — they would have to launch a similar product to compete directly), and other Base / Robinhood L2 wallets. We differentiate on the agent-fleet surface and the public-rail posture.]",
  },
  {
    q: "Is this an offer to sell securities?",
    a: "No. /investors is a narrative page describing the TradeDesk project and a way to start a conversation. Any actual investment opportunity will be documented separately by counsel.",
  },
]

function Placeholder({ children }: { children: React.ReactNode }) {
  return (
    <span className="investor-placeholder" title="Pending content from the team">
      {children}
    </span>
  )
}

function StatBlock({ label, value, source }: { label: string; value: string | null; source?: string }) {
  return (
    <div className="tradedesk-card">
      <div className="tradedesk-card-header">
        <span className="tradedesk-card-eyebrow">// {label}</span>
        {source && <span className="tradedesk-card-eyebrow" style={{ opacity: 0.6 }}>{source}</span>}
      </div>
      <div className="tradedesk-card-body">
        <div className="tradedesk-metric-value" style={{ fontSize: 28 }}>
          {value ?? "—"}
        </div>
      </div>
    </div>
  )
}

function MetricsBanner() {
  const [data, setData] = useState<MetricsResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetch("/api/investors/metrics", { cache: "no-store" })
      .then((r) => r.json() as Promise<MetricsResponse>)
      .then((d: MetricsResponse) => {
        if (!cancelled) {
          setData(d)
          setLoading(false)
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (loading || !data) {
    return (
      <div className="tradedesk-grid">
        <StatBlock label="supercompute.eth · tx count" value="…" source="live RPC" />
        <StatBlock label="supercompute.eth · balance" value="…" source="live RPC" />
        <StatBlock label="Robinhood Chain · block" value="…" source="chain 4663" />
        <StatBlock label="Articles published" value="…" source="D1" />
      </div>
    )
  }

  const chainBlock = data.chain?.blockNumber ?? null
  const tx = data.supercomputeWallet?.txCountLabel ?? null
  const bal = data.supercomputeWallet?.balanceEth ?? null
  const articles = data.supercompute?.articles ?? null

  return (
    <div className="tradedesk-grid">
      <StatBlock
        label="supercompute.eth · tx count"
        value={tx ?? "—"}
        source={data.supercomputeWallet?.explorer ? "live RPC" : "rpc unavailable"}
      />
      <StatBlock
        label="supercompute.eth · ETH balance"
        value={bal !== null && bal !== undefined ? `${bal} ETH` : "—"}
        source="live RPC"
      />
      <StatBlock
        label="Robinhood Chain · block height"
        value={chainBlock !== null ? chainBlock.toLocaleString() : "—"}
        source={data.chain?.chainIdMatch ? "chain 4663 ✓" : "chain mismatch"}
      />
      <StatBlock
        label="Articles published"
        value={articles !== null && articles !== undefined ? String(articles) : "—"}
        source="D1"
      />
    </div>
  )
}

function ContactForm() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [org, setOrg] = useState("")
  const [ticketSize, setTicketSize] = useState("")
  const [message, setMessage] = useState("")
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState<{ ok?: boolean; error?: string; id?: string; zapier?: string } | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setStatus(null)
    try {
      const res = await fetch("/api/investors/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, org, ticket_size: ticketSize, message }),
      })
      const data = (await res.json()) as { ok?: boolean; error?: string; id?: string; zapier_status?: string }
      if (!res.ok || !data.ok) {
        setStatus({ ok: false, error: data.error ?? `http_${res.status}` })
        return
      }
      setStatus({ ok: true, id: data.id, zapier: data.zapier_status })
      setName(""); setEmail(""); setOrg(""); setTicketSize(""); setMessage("")
    } catch (err) {
      setStatus({ ok: false, error: "network_error" })
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="investor-form" onSubmit={submit}>
      <label>
        <span>Name *</span>
        <input
          required maxLength={120}
          value={name} onChange={(e) => setName(e.target.value)}
          disabled={busy}
        />
      </label>
      <label>
        <span>Email *</span>
        <input
          required type="email" maxLength={200}
          value={email} onChange={(e) => setEmail(e.target.value)}
          disabled={busy}
        />
      </label>
      <label>
        <span>Organization</span>
        <input
          maxLength={200}
          value={org} onChange={(e) => setOrg(e.target.value)}
          disabled={busy}
        />
      </label>
      <label>
        <span>Indicative ticket size</span>
        <input
          maxLength={60}
          placeholder="$TBD"
          value={ticketSize} onChange={(e) => setTicketSize(e.target.value)}
          disabled={busy}
        />
      </label>
      <label>
        <span>Message *</span>
        <textarea
          required maxLength={4000} rows={5}
          value={message} onChange={(e) => setMessage(e.target.value)}
          disabled={busy}
        />
      </label>
      <button type="submit" className="btn btn-primary" disabled={busy}>
        {busy ? "Sending…" : "Send"}
      </button>
      {status && (
        <p className={`investor-status ${status.ok ? "ok" : "err"}`}>
          {status.ok
            ? `Thanks — your message is in. Reference: ${status.id} · CRM handoff: ${status.zapier ?? "skipped"}`
            : `Could not send: ${status.error}. Email hello@supercompute.io if this persists.`}
        </p>
      )}
    </form>
  )
}

export default function Investors() {
  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Supercompute",
    url: "https://supercompute.io/investors",
    logo: "https://supercompute.io/favicon.svg",
    description:
      "Operator-led Web3 consulting, an autonomous agent fleet, and the TradeDesk public rail against Robinhood Chain (chain ID 4663).",
    sameAs: [
      "https://x.com/supercompute_io",
      "https://warpcast.com/supercompute",
      "https://app.ens.domains/supercompute.eth",
    ],
    address: {
      "@type": "PostalAddress",
      addressLocality: "[PLACEHOLDER — city]",
      addressRegion: "[PLACEHOLDER — state]",
      addressCountry: "[PLACEHOLDER — country]",
    },
  }

  return (
    <>
      <Head>
        <title>SUPERCOMPUTE · Investors</title>
        <meta
          name="description"
          content="Investor relations surface for Supercompute — the operator behind the TradeDesk public rail on Robinhood Chain (chain ID 4663). Narrative, traction, team, and a private data room."
        />
        <meta property="og:title" content="Supercompute · Investors" />
        <meta property="og:description" content="The operator behind TradeDesk on Robinhood Chain. Live traction, team, and a private data room." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://supercompute.io/investors" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@supercompute_io" />
        <link rel="canonical" href="https://supercompute.io/investors" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
        />
      </Head>

      <PublicLayout title="SUPERCOMPUTE · Investors" wide>
        <div className="landing">
          <section className="l-hero">
            <div className="l-eyebrow">
              <span><span className="gold">./investors</span> --supercompute</span>
              <span className="l-caret" />
            </div>
            <h1 className="headline">Investors</h1>
            <div className="subheader">TradeDesk · Robinhood Chain · chain 4663</div>
            <p className="hero-copy">
              One operator, one autonomous fleet, one public rail against Robinhood Chain.
              This page is the narrative — actual term sheets come from counsel, not from a button on a website.
            </p>
            <div style={{ marginTop: 32, display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <a href="#contact" className="btn btn-primary">Get in touch</a>
              <Link href="/investors/metrics" className="btn btn-outline">Live metrics</Link>
              <Link href="/investors/faq" className="btn btn-outline">FAQ</Link>
            </div>
          </section>
        </div>

        <div className="tpl-community">
          {/* Section 1 — TL;DR */}
          <section className="section">
            <div className="section-header">
              <div className="label">// 01 · tldr</div>
              <div>
                <h2 className="display-md">Three sentences</h2>
                <p className="hero-copy" style={{ maxWidth: "none" }}>
                  Supercompute is a one-operator Web3 consultancy with an autonomous agent fleet, building
                  read-only public infrastructure against Robinhood Chain mainnet (chain ID 4663). The
                  flagship is the TradeDesk public rail — visible, verifiable, and not a securities
                  offering. <Placeholder>[PLACEHOLDER — round size, valuation, timeline to be confirmed by Mone]</Placeholder>.
                </p>
              </div>
            </div>
          </section>

          {/* Section 2 — The Project */}
          <section className="section">
            <div className="section-header">
              <div className="label">// 02 · the project</div>
              <div>
                <h2 className="display-md">TradeDesk on Robinhood Chain</h2>
                <p>
                  TradeDesk is the public, read-only rail against Robinhood Chain (an Arbitrum L2,
                  chain ID 4663, operated by Robinhood). It surfaces balances, quotes, and a
                  token registry sourced from on-chain reads — never inventing values. The execution
                  simulator returns simulated quotes by design; live wallet writes are explicitly out
                  of scope until a separate, narrowly-scoped approval is granted.
                </p>
                <p>
                  Robinhood Chain mainnet went live with ETH as the native gas token and Blockscout as
                  the default explorer. We picked it because (a) settlement is cheap, (b) the explorer
                  is open, and (c) the chain is permissionless — anyone can verify what we publish.
                </p>
                <p>
                  The rail is in <strong>simulated</strong> execution mode today. That posture is
                  documented at <Link href="/tradedesk">/tradedesk</Link> and is also surfaced by the
                  chain-health card on every page that touches the rail.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3 — What's Built */}
          <section className="section">
            <div className="section-header">
              <div className="label">// 03 · what's built</div>
              <div>
                <h2 className="display-md">Surface area in production</h2>
                <ul className="investor-link-list">
                  <li>
                    <Link href="/tradedesk">/tradedesk</Link> — public rail (read-only · simulated quotes)
                  </li>
                  <li>
                    <Link href="/newsdesk">/newsdesk</Link> — protocol evaluations &amp; on-chain analysis (NewsDesk)
                  </li>
                  <li>
                    <Link href="/fleet">/fleet</Link> — agent fleet roster &amp; live status
                  </li>
                  <li>
                    <Link href="/school">/school</Link> — Web3 School (token-gated curriculum for members)
                  </li>
                  <li>
                    <Link href="/about">/about</Link> — operator timeline + ecosystem entity map
                  </li>
                  <li>
                    <Link href="/investors/metrics">/investors/metrics</Link> — live on-chain &amp; D1 traction
                  </li>
                </ul>
                <p>
                  Source: <a href="https://github.com/SupercomputeA" target="_blank" rel="noreferrer">github.com/SupercomputeA</a> ·
                  <Placeholder> [PLACEHOLDER — audit reports pending; will be added once a firm is engaged.]</Placeholder>
                </p>
              </div>
            </div>
          </section>

          {/* Section 4 — Team */}
          <section className="section">
            <div className="section-header">
              <div className="label">// 04 · team</div>
              <div>
                <h2 className="display-md">Operators, not logos</h2>
                <p>
                  We don't run a logo wall. The team page on this site is the operator + agent fleet
                  only. Advisors and strategic partners will be listed <strong>after</strong> written
                  consent and a signed engagement letter are on file.
                </p>
                <div className="investor-team-grid">
                  {TEAM_PLACEHOLDERS.map((t) => (
                    <div key={t.name} className="tradedesk-card">
                      <div className="tradedesk-card-header">
                        <span className="tradedesk-card-eyebrow">// {t.role}</span>
                        {t.public
                          ? <span className="live-pill"><span className="dot" />public</span>
                          : <span className="live-pill off"><span className="dot" />pending</span>}
                      </div>
                      <div className="tradedesk-card-body">
                        <div style={{ fontSize: 18, color: "var(--gold-warm)", fontFamily: "var(--font-mono)" }}>{t.name}</div>
                        <p>{t.bio}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Section 5 — Traction */}
          <section className="section">
            <div className="section-header">
              <div className="label">// 05 · traction</div>
              <div>
                <h2 className="display-md">Live, on-chain, ungated</h2>
                <p>
                  Every number below is a real read from a public RPC or a count of rows in our D1.
                  If a value is missing, it is missing because the upstream was unavailable — we do
                  not fabricate. A mirror of these numbers lives at{" "}
                  <Link href="/investors/metrics">/investors/metrics</Link> for cold-email linking.
                </p>
                <MetricsBanner />
                <p className="tradedesk-card-meta">
                  Investor-tier wallet holders see an extended dashboard at{" "}
                  <Link href="/investors/traction">/investors/traction</Link> including agent calls/day,
                  unique counterparties, and contract deployments.
                </p>
              </div>
            </div>
          </section>

          {/* Section 6 — The Ask */}
          <section className="section">
            <div className="section-header">
              <div className="label">// 06 · the ask</div>
              <div>
                <h2 className="display-md">Round structure (placeholder)</h2>
                <div className="investor-ask-grid">
                  <div className="tradedesk-card">
                    <div className="tradedesk-card-header">
                      <span className="tradedesk-card-eyebrow">// round size</span>
                    </div>
                    <div className="tradedesk-card-body">
                      <div className="tradedesk-metric-value" style={{ fontSize: 22 }}>
                        <Placeholder>$TBD</Placeholder>
                      </div>
                      <p className="tradedesk-card-meta">SAFE, post-money cap TBD.</p>
                    </div>
                  </div>
                  <div className="tradedesk-card">
                    <div className="tradedesk-card-header">
                      <span className="tradedesk-card-eyebrow">// valuation</span>
                    </div>
                    <div className="tradedesk-card-body">
                      <div className="tradedesk-metric-value" style={{ fontSize: 22 }}>
                        <Placeholder>$TBD</Placeholder>
                      </div>
                      <p className="tradedesk-card-meta">Set by counsel + cap table.</p>
                    </div>
                  </div>
                  <div className="tradedesk-card">
                    <div className="tradedesk-card-header">
                      <span className="tradedesk-card-eyebrow">// use of funds</span>
                    </div>
                    <div className="tradedesk-card-body">
                      <ul className="tradedesk-card-meta" style={{ listStyle: "none", padding: 0, margin: 0, lineHeight: 1.8 }}>
                        <li><Placeholder>[PLACEHOLDER — % engineering]</Placeholder></li>
                        <li><Placeholder>[PLACEHOLDER — % agent infra]</Placeholder></li>
                        <li><Placeholder>[PLACEHOLDER — % growth + content]</Placeholder></li>
                        <li><Placeholder>[PLACEHOLDER — % legal + reserve]</Placeholder></li>
                      </ul>
                    </div>
                  </div>
                  <div className="tradedesk-card">
                    <div className="tradedesk-card-header">
                      <span className="tradedesk-card-eyebrow">// timeline</span>
                    </div>
                    <div className="tradedesk-card-body">
                      <div className="tradedesk-metric-value" style={{ fontSize: 22 }}>
                        <Placeholder>[TBD]</Placeholder>
                      </div>
                      <p className="tradedesk-card-meta">Close target: Mone to confirm.</p>
                    </div>
                  </div>
                </div>
                <p>
                  The four cards above are intentionally <strong>[$TBD]</strong>. They will be
                  populated once Mone signs off on counsel's term sheet. Until then, the contact form
                  below is the right next step.
                </p>
              </div>
            </div>
          </section>

          {/* Section 7 — Contact */}
          <section className="section" id="contact">
            <div className="section-header">
              <div className="label">// 07 · contact</div>
              <div>
                <h2 className="display-md">Start a conversation</h2>
                <p>
                  We read every inbound. Submissions land in our D1 and (when configured) forward to
                  our Zapier CRM. We do not store or forward raw IP — only a SHA-256 hash for spam
                  correlation. If you'd rather email directly, write to{" "}
                  <a href="mailto:hello@supercompute.io">hello@supercompute.io</a>.
                </p>
                <ContactForm />
                <p className="tradedesk-card-meta">
                  If you're an existing investor and want the private data room, head to{" "}
                  <Link href="/investors/data-room">/investors/data-room</Link> after signing in.
                </p>
              </div>
            </div>
          </section>

          {/* FAQ teaser */}
          <section className="section" style={{ borderBottom: "none" }}>
            <div className="section-header">
              <div className="label">// faq</div>
              <div>
                <h2 className="display-md">Questions we get asked</h2>
                <p>
                  The full FAQ lives at <Link href="/investors/faq">/investors/faq</Link>. Answers
                  marked <Placeholder>[PLACEHOLDER]</Placeholder> are intentionally unfilled until
                  the team confirms the language with counsel.
                </p>
                <div className="investor-faq-list">
                  {FAQ.slice(0, 4).map((f, i) => (
                    <details key={i} className="investor-faq-item">
                      <summary>{f.q}</summary>
                      <p>{f.a}</p>
                    </details>
                  ))}
                </div>
                <p style={{ marginTop: 16 }}>
                  <Link href="/investors/faq">Read all questions →</Link>
                </p>
              </div>
            </div>
          </section>

          {/* Disclaimer */}
          <section className="section" style={{ borderBottom: "none", paddingTop: 0 }}>
            <p className="tradedesk-card-warning">
              <strong>Disclaimer.</strong> This page is a public narrative. It is not an offer to sell
              or a solicitation to buy any securities, token, or other instrument. Nothing on this
              page constitutes investment, legal, or tax advice. Any investment opportunity will be
              documented separately by counsel under the applicable securities laws of the relevant
              jurisdiction. Past performance of the public rail is not indicative of future results.
            </p>
            <p className="tradedesk-card-meta" style={{ textAlign: "center", marginTop: 24 }}>
              &copy; 2026 Supercompute · Investor Relations surface · <Placeholder>[legal entity name]</Placeholder>
            </p>
          </section>
        </div>

        <Footer />
      </PublicLayout>
    </>
  )
}