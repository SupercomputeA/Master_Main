import { useEffect, useState } from "react"
import Head from "next/head"
import Link from "next/link"
import PublicLayout from "../../components/PublicLayout"
import Footer from "../../components/Footer"

/* /investors/faq — public accordion of common investor questions.
 * Many answers are flagged [PLACEHOLDER] until counsel/team confirms. */

const FAQ = [
  {
    q: "What is Robinhood Chain?",
    a: "Robinhood Chain is a public, permissionless Arbitrum L2 (chain ID 4663) operated by Robinhood. ETH is the native gas token and Blockscout is the default block explorer. It uses standard Arbitrum stack components (sequencer + fraud proofs) and settles to Ethereum L1. We chose it because settlement is cheap, the explorer is open, and the chain is permissionless — anyone can verify what we publish.",
  },
  {
    q: "Why is TradeDesk read-only by default?",
    a: "Because the rail exists to give the public a verifiable window into what's been built on Robinhood Chain — not to invite a regulatory scope that we don't want. Balances, quotes, and the token registry all come from on-chain reads. Swap quotes return simulated routes until live execution is enabled with explicit approval.",
  },
  {
    q: "What is the agent fleet?",
    a: "A small set of specialist agents orchestrated by Hermes Agent. Each agent runs in an isolated context with its own skill set and audit trail. The public roster lives at /fleet; the operator-facing status lives at the Hermes kanban. The fleet produces observable artifacts — published articles, transactions, alerts — not autonomous money movement.",
  },
  {
    q: "How does the revenue model work?",
    a: "Three streams: (1) consulting retainers for Web3 ops at select DAOs and protocols; (2) marketplace fees on the TradeDesk simulator when live execution is enabled; (3) content licensing on NewsDesk. We do not charge retail users for read access.",
  },
  {
    q: "What is the exit?",
    a: "Tradeable equity in the operating entity, with a standard 3-year vesting + 1-year cliff. Liquidity path to be determined; the goal is a strategic acquisition or a continued operator-led hold. There is no token-sale mechanics on-chain.",
  },
  {
    q: "Who are the competitors?",
    a: "Adjacent: Zerion, Zapper, Debank, Robinhood's own app, and other Base / Robinhood L2 wallets. We differentiate on the agent-fleet surface, the public-rail posture (verifiable on-chain, never fake values), and the operator-led editorial cadence of NewsDesk.",
  },
  {
    q: "What is your regulatory posture?",
    a: "We are not registered with the SEC, FINRA, or any non-US equivalent. /investors is a public narrative — not an offer to sell or a solicitation to buy any security. Any investment opportunity will be documented separately by counsel under the applicable securities laws.",
  },
  {
    q: "What is the data room?",
    a: "A gated section at /investors/data-room containing the pitch deck, financial model, cap table, technical architecture, and audit reports. Access requires a wallet with users.role = 'investor' or 'admin'. If you're a current investor and don't have access, email hello@supercompute.io.",
  },
  {
    q: "How do I contact the team?",
    a: "Use the form at the bottom of /investors. It writes to D1 and (when configured) forwards to our Zapier CRM. Email directly to hello@supercompute.io if you'd rather skip the form.",
  },
  {
    q: "Is this an offer to sell securities?",
    a: "No. This page is a public narrative describing the TradeDesk project and a way to start a conversation. Nothing on this site constitutes investment, legal, or tax advice.",
  },
]

export default function InvestorsFAQ() {
  const [open, setOpen] = useState<number | null>(0)
  return (
    <>
      <Head>
        <title>Supercompute · Investor FAQ</title>
        <meta
          name="description"
          content="Common questions from prospective investors about Supercompute, TradeDesk on Robinhood Chain, the agent fleet, and the data room."
        />
        <link rel="canonical" href="https://supercompute.io/investors/faq" />
      </Head>

      <PublicLayout title="SUPERCOMPUTE · Investor FAQ" wide>
        <div className="landing">
          <section className="l-hero">
            <div className="l-eyebrow">
              <span><span className="gold">./investors/faq</span> --public</span>
              <span className="l-caret" />
            </div>
            <h1 className="headline">Investor FAQ</h1>
            <div className="subheader">What we get asked. What we actually answer.</div>
            <p className="hero-copy">
              Answers that depend on counsel or that we haven't decided on yet are flagged{" "}
              <span className="investor-placeholder">[PLACEHOLDER]</span>. Don't read silence as evasion —
              read it as "we'd rather confirm than guess."
            </p>
          </section>
        </div>

        <div className="tpl-community">
          <section className="section">
            <div className="section-header">
              <div className="label">// questions</div>
              <div>
                <div className="investor-faq-list">
                  {FAQ.map((f, i) => (
                    <div key={i} className="investor-faq-item" style={{ borderColor: open === i ? "var(--gold-warm)" : undefined }}>
                      <div
                        onClick={() => setOpen(open === i ? null : i)}
                        style={{ cursor: "pointer", fontFamily: "var(--font-mono)", fontSize: 13, color: open === i ? "var(--gold-warm)" : "var(--cream)" }}
                      >
                        {open === i ? "▾" : "▸"} {f.q}
                      </div>
                      {open === i && <p>{f.a}</p>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="section" style={{ borderBottom: "none" }}>
            <p style={{ textAlign: "center" }}>
              <Link href="/investors" className="btn btn-outline">← Back to /investors</Link>
            </p>
          </section>
        </div>

        <Footer />
      </PublicLayout>
    </>
  )
}