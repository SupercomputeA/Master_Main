export type Difficulty = "Beginner" | "Intermediate" | "Advanced"
export type Access = "free" | "member"

export interface Lesson {
  id: string
  title: string
  description: string
  duration: string
  topics: string[]
}

export interface SchoolModule {
  id: string
  title: string
  subtitle: string
  description: string
  difficulty: Difficulty
  access: Access
  duration: string
  lessons: Lesson[]
  credential: string | null
  icon: string
  color: string
}

export const modules: SchoolModule[] = [
  {
    id: "WS-01",
    title: "Wallet Security",
    subtitle: "Protect Your Keys, Protect Your Assets",
    description: "Master the fundamentals of wallet security — seed phrases, hardware wallets, multi-sig setups, phishing prevention, and disaster recovery. Every Web3 user's first essential skill.",
    difficulty: "Beginner",
    access: "free",
    duration: "2 hours",
    credential: null,
    icon: "🔐",
    color: "#5bc0be",
    lessons: [
      { id: "WS-01-01", title: "How Wallets Work", description: "Public/private key pairs, seed phrases, and address derivation.", duration: "15 min", topics: ["Public keys", "Private keys", "Seed phrases", "Address derivation"] },
      { id: "WS-01-02", title: "Hot vs Cold Storage", description: "Trade-offs between convenience and security for different wallet types.", duration: "20 min", topics: ["Hot wallets", "Cold wallets", "Hardware wallets", "Paper wallets"] },
      { id: "WS-01-03", title: "Phishing & Scams", description: "How to identify and avoid common Web3 phishing attacks and social engineering.", duration: "25 min", topics: ["Phishing识别", "Social engineering", "Fake dApps", "Approval scams"] },
      { id: "WS-01-04", title: "Multi-Sig Setup", description: "Configuring multi-signature wallets for team and high-value accounts.", duration: "30 min", topics: ["Multi-sig basics", "Gnosis Safe", "Signer management", "Recovery options"] },
      { id: "WS-01-05", title: "Disaster Recovery", description: "What to do when things go wrong — lost keys, compromised devices, emergency actions.", duration: "20 min", topics: ["Recovery phrases", "Social recovery", "Emergency procedures", "Insurance"] },
      { id: "WS-01-06", title: "Wallet Hygiene", description: "Daily habits and best practices for keeping your wallets safe long-term.", duration: "10 min", topics: ["Regular checks", "Permissions audit", "Address book", "Backup routines"] },
    ],
  },
  {
    id: "RF-01",
    title: "Regenerative Finance (ReFi)",
    subtitle: "Finance That Heals, Not Extracts",
    description: "Explore how blockchain can fund ecological regeneration, carbon markets, and community-owned infrastructure. ReFi aligns capital with planetary health.",
    difficulty: "Intermediate",
    access: "free",
    duration: "3 hours",
    credential: null,
    icon: "🌱",
    color: "#4ade80",
    lessons: [
      { id: "RF-01-01", title: "What is ReFi?", description: "The philosophy and economics of regenerative finance vs extractive finance.", duration: "20 min", topics: ["Regenerative economics", "Externalities", "Tokenized ecosystems", "Mission alignment"] },
      { id: "RF-01-02", title: "Carbon Markets On-Chain", description: "How tokenized carbon credits work and the major protocols in the space.", duration: "30 min", topics: ["Carbon credits", "Verification", "Toucan Protocol", "KlimaDAO"] },
      { id: "RF-01-03", title: "Tokenized Ecological Assets", description: "Representing natural capital — trees, soil, water — as on-chain assets.", duration: "25 min", topics: ["Natural capital", "Asset tokenization", "Measurement & reporting", "Liquidity pools"] },
      { id: "RF-01-04", title: "Community-Owned Infrastructure", description: "DAOs and cooperatives building public goods with ReFi principles.", duration: "25 min", topics: ["Public goods funding", "Gitcoin", "Retroactive funding", "Community DAOs"] },
      { id: "RF-01-05", title: "ReFi on Base", description: "Active ReFi projects building on Base Chain and how to participate.", duration: "20 min", topics: ["Base ecosystem", "ReFi projects", "Participation guide", "Resources"] },
    ],
  },
  {
    id: "DF-01",
    title: "Decentralized Finance (DeFi)",
    subtitle: "Banking Without Banks",
    description: "Learn the core primitives of DeFi — AMMs, lending markets, yield strategies, and risk management. Practical knowledge for participating in on-chain finance.",
    difficulty: "Intermediate",
    access: "free",
    duration: "4 hours",
    credential: null,
    icon: "⬡",
    color: "#d4af37",
    lessons: [
      { id: "DF-01-01", title: "AMMs & Liquidity Pools", description: "How automated market makers work and the dynamics of providing liquidity.", duration: "30 min", topics: ["AMM mechanics", "Constant product", "Impermanent loss", "Liquidity depth"] },
      { id: "DF-01-02", title: "Lending & Borrowing", description: "Decentralized lending protocols, collateralization ratios, and liquidation risk.", duration: "30 min", topics: ["Over-collateralization", "Variable rates", "Liquidation", "Compound / Aave"] },
      { id: "DF-01-03", title: "Yield Farming Strategies", description: "How to responsibly farm yields across protocols while managing risk.", duration: "35 min", topics: ["LP fees", "Incentive tokens", "Auto-compounding", "Risk assessment"] },
      { id: "DF-01-04", title: "L2 Bridges & Migration", description: "Moving assets between chains, bridge security, and L2 economics.", duration: "25 min", topics: ["Bridges", "Canonical vs third-party", "Base migration", "Gas optimization"] },
      { id: "DF-01-05", title: "DeFi Risk Management", description: "Identifying and mitigating smart contract risk, oracle risk, and systemic risk.", duration: "30 min", topics: ["Smart contract risk", "Oracles", "Audit review", "Position sizing"] },
      { id: "DF-01-06", title: "DeFi on Base", description: "Overview of the Base DeFi ecosystem: Aerodrome, Uniswap V3, Compound, and more.", duration: "20 min", topics: ["Base protocols", "TVL distribution", "Yield comparison", "Getting started"] },
    ],
  },
  {
    id: "CV-01",
    title: "Core Values",
    subtitle: "Principles That Guide This Work",
    description: "The philosophical foundation of Supercompute. Understand the values that shape principled Web3 work — sovereignty, transparency, regeneration, and community.",
    difficulty: "Beginner",
    access: "free",
    duration: "1.5 hours",
    credential: null,
    icon: "✦",
    color: "#5bc0be",
    lessons: [
      { id: "CV-01-01", title: "Sovereign Infrastructure", description: "Why owning your own infrastructure matters for long-term freedom.", duration: "15 min", topics: ["Self-sovereignty", "Infrastructure ownership", "Centralization risks", "Exit to community"] },
      { id: "CV-01-02", title: "Principled Building", description: "Building for liberation over extraction — how to align incentives with values.", duration: "20 min", topics: ["Value alignment", "Token design ethics", "Community-first", "Long-term thinking"] },
      { id: "CV-01-03", title: "Transparency by Default", description: "Why building in public creates trust and better outcomes.", duration: "15 min", topics: ["Open source", "On-chain verification", "Public logs", "Accountability"] },
      { id: "CV-01-04", title: "Regenerative Practice", description: "How ReFi principles apply to personal practice, not just protocol design.", duration: "20 min", topics: ["Personal sustainability", "Community care", "Knowledge sharing", "Mentorship cycles"] },
    ],
  },
]

export const modulesByAccess = {
  free: modules.filter(m => m.access === "free"),
  member: modules.filter(m => m.access === "member"),
}
