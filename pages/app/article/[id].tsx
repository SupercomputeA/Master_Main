import MemberLayout from "../../../components/MemberLayout"
import KgTemplate, { type KgGraph } from "../../../components/kg/KgTemplate"

/* Knowledge Graph Article — uses the shared KgTemplate (articles graph).
   The template model: one renderer, any graph. See components/kg/KgTemplate.tsx. */

const FALLBACK: KgGraph = {
  nodes: [
    { id: "art-01", label: "Self-Custody & the Sovereignty Stack", type: "article", description: "Knowledge Graph article, Series 03, Entry 4 of 7." },
    { id: "art-02", label: "Sovereignty Stack", type: "article" },
    { id: "art-03", label: "Key Management", type: "article" },
    { id: "ac-sc", label: "SELF-CUSTODY", type: "concept", level: "core" },
    { id: "ac-keys", label: "Keys", type: "concept" },
    { id: "ac-custody", label: "Custody", type: "concept" },
    { id: "ac-wallets", label: "Wallets", type: "concept" },
    { id: "ac-recovery", label: "Recovery", type: "concept" },
    { id: "ac-risk", label: "Risk", type: "concept" },
    { id: "ac-private-keys", label: "Private Keys", type: "concept" },
    { id: "ac-hardware-wallets", label: "Hardware Wallets", type: "concept" },
    { id: "ac-social-recovery", label: "Social Recovery", type: "concept" },
    { id: "ac-risk-models", label: "Risk Models", type: "concept" },
    { id: "rl-01", label: "Foundations", type: "release", num: "01", description: "Published" },
    { id: "rl-02", label: "Data Consumption", type: "release", num: "02", description: "Published" },
    { id: "rl-03", label: "The Vocabulary", type: "release", num: "03", description: "Published" },
    { id: "rl-04", label: "Self-Custody", type: "release", num: "04", description: "Reading Now" },
    { id: "rl-05", label: "Smart Connections", type: "release", num: "05", description: "Jul 5" },
    { id: "rl-06", label: "Embeddings", type: "release", num: "06", description: "Jul 12" },
    { id: "rl-07", label: "Synthesis", type: "release", num: "07", description: "Jul 19" },
    { id: "tl-2013", label: "The Custody Problem", type: "milestone", description: "2013 · Origin. Early Base Chain operators confront the tradeoff between convenience and control." },
    { id: "tl-2019", label: "Hardware Wallet Era", type: "milestone", description: "2019 · Shift. Cold storage becomes standard." },
    { id: "tl-2023", label: "Social Recovery", type: "milestone", description: "2023 · Evolution. Smart accounts distribute trust across guardians." },
    { id: "tl-2026", label: "The Sovereignty Stack", type: "milestone", description: "2026 · Now. Self-custody becomes a composable layer." },
    { id: "p-quanta", label: "quanta_s", type: "person", description: "Author · NewsDesk intelligence" },
    { id: "p-knight", label: "knight", type: "person", description: "Contributor · TradeDesk treasury ops" },
    { id: "p-sarah", label: "Sarah Chen", type: "person", description: "Reviewer · Security research" },
    { id: "p-james", label: "James Rivera", type: "person", description: "Cited · Governance framework" },
    { id: "p-morgan", label: "Morgan Lee", type: "person", description: "Debate · Against" },
    { id: "p-alex", label: "alex_t", type: "person", description: "Debate · Against" },
    { id: "arg-for-1", label: "Self-custody is the only way to guarantee true ownership", type: "argument", stance: "for", description: "— knight @tradedesk" },
    { id: "arg-for-2", label: "Social recovery solves the usability problem without reintroducing custodians.", type: "argument", stance: "for", description: "— Sarah Chen" },
    { id: "arg-for-3", label: "Every custodial failure in history proves the counterparty risk is real.", type: "argument", stance: "for", description: "— quanta_s" },
    { id: "arg-against-1", label: "Mainstream adoption needs abstraction — most users can't safely manage keys.", type: "argument", stance: "against", description: "— Morgan Lee" },
    { id: "arg-against-2", label: "Institutional custody has regulatory protections self-custody can't match.", type: "argument", stance: "against", description: "— James Rivera" },
    { id: "arg-against-3", label: "Recovery guardians just move the trust problem, they don't eliminate it.", type: "argument", stance: "against", description: "— alex_t" },
    { id: "cmt-1", label: "The sovereignty stack framing finally makes this click. Been running paper-trade custody flows and the risk node maps exactly to what I see in treasury ops.", type: "comment", description: "knight · 2 hours ago", up: 24 },
    { id: "cmt-2", label: "Strong entry. Would love a deeper node on threshold signatures in the next release — it's the missing edge between Recovery and Risk.", type: "comment", description: "Sarah Chen · 5 hours ago", up: 18 },
    { id: "cmt-3", label: "Counterpoint in the debate holds up — usability is still the blocker. But this article moved me from 30% to maybe 50% For.", type: "comment", description: "alex_t · 1 day ago", up: 11 },
  ],
  edges: [
    ["art-01", "ac-sc"], ["art-01", "ac-keys"], ["art-01", "ac-custody"], ["art-01", "ac-wallets"], ["art-01", "ac-recovery"], ["art-01", "ac-risk"],
    ["ac-sc", "ac-keys"], ["ac-sc", "ac-custody"], ["ac-sc", "ac-wallets"], ["ac-sc", "ac-recovery"], ["ac-sc", "ac-risk"],
    ["ac-keys", "ac-private-keys"], ["ac-wallets", "ac-hardware-wallets"], ["ac-recovery", "ac-social-recovery"], ["ac-risk", "ac-risk-models"],
    ["rl-01", "rl-02"], ["rl-02", "rl-03"], ["rl-03", "rl-04"], ["rl-04", "rl-05"], ["rl-05", "rl-06"], ["rl-06", "rl-07"],
    ["tl-2013", "tl-2019"], ["tl-2019", "tl-2023"], ["tl-2023", "tl-2026"],
  ],
}

export default function KnowledgeGraphArticle() {
  return (
    <MemberLayout title="SUPERCOMPUTE · Self-Custody & the Sovereignty Stack">
      <KgTemplate
        config={{
          graphId: "articles",
          title: "Self-Custody & the Sovereignty Stack",
          eyebrow: "Knowledge Graph · Article · Series 03",
          meta: { author: "quanta_s @newsdesk", date: "Jun 28, 2026", entry: "4 of 7", read: "14 min" },
          hubType: "article",
          fallback: FALLBACK,
          debateQuestion: "Debate · Is Full Self-Custody Practical at Scale?",
        }}
      />
    </MemberLayout>
  )
}
