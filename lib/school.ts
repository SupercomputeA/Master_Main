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
  done?: boolean
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
  {
    id: "AS-01",
    title: "Agent Systems",
    subtitle: "Autonomous AI Agents on Base",
    description: "Design, deploy, and manage autonomous AI agents with on-chain identity, token-gated access, and multi-agent coordination. Build for Virtuals Protocol and beyond.",
    difficulty: "Intermediate",
    access: "member",
    duration: "4 hours",
    credential: "Agent Systems Graduate",
    icon: "🤖",
    color: "#C9A33A",
    lessons: [
      { id: "AS-01-01", title: "Agent Architecture", description: "Core components of autonomous agents — perception, reasoning, action loops.", duration: "25 min", topics: ["Agent loops", "LLM integration", "Tool use", "Memory systems"] },
      { id: "AS-01-02", title: "On-Chain Identity for Agents", description: "Giving agents wallets, signing capabilities, and on-chain reputation.", duration: "30 min", topics: ["Agent wallets", "Delegated signing", "On-chain attestations", "Reputation tracking"] },
      { id: "AS-01-03", title: "Token-Gated Agent Access", description: "Restricting agent actions and data access based on token holdings.", duration: "25 min", topics: ["Token gating", "$SCOM staking", "Access tiers", "Balance verification"] },
      { id: "AS-01-04", title: "Multi-Agent Coordination", description: "Patterns for multiple agents working together — routing, delegation, consensus.", duration: "35 min", topics: ["Agent routing", "Task delegation", "Consensus mechanisms", "Conflict resolution"] },
      { id: "AS-01-05", title: "Virtuals Protocol Deep Dive", description: "Building and deploying agents on the Virtuals Protocol platform.", duration: "30 min", topics: ["Virtuals framework", "Agent deployment", "Revenue models", "Agent evaluation"] },
      { id: "AS-01-06", title: "Production Operations", description: "Monitoring, logging, alerting, and upgrading agents in production.", duration: "25 min", topics: ["Agent monitoring", "Error recovery", "Version management", "Cost optimization"] },
    ],
  },
  {
    id: "TK-01",
    title: "Tokenomics Deep Dive",
    subtitle: "Design Sustainable Token Economies",
    description: "Master tokenomics design — supply mechanics, emission schedules, vesting, treasury management, and governance. Build token models that create lasting value.",
    difficulty: "Advanced",
    access: "member",
    duration: "5 hours",
    credential: "Tokenomics Architect",
    icon: "⬡",
    color: "#d4af37",
    lessons: [
      { id: "TK-01-01", title: "Supply Mechanics", description: "Total supply, inflation/deflation, mint/burn mechanisms, and supply curves.", duration: "30 min", topics: ["Supply design", "Inflation models", "Burn mechanisms", "Supply caps"] },
      { id: "TK-01-02", title: "Emission Schedules", description: "Designing release schedules for team, investors, community, and ecosystem.", duration: "35 min", topics: ["Vesting schedules", "Linear vs staged", "Cliff periods", "TGE planning"] },
      { id: "TK-01-03", title: "Treasury Management", description: "Managing protocol treasuries — diversification, spending, and sustainability.", duration: "30 min", topics: ["Treasury diversification", "Stablecoin reserves", "Yield strategies", "Spending policies"] },
      { id: "TK-01-04", title: "Governance Design", description: "Token-weighted voting, quorum, delegation, and proposal frameworks.", duration: "30 min", topics: ["Voting mechanisms", "Quorum design", "Delegation", "Proposal lifecycle"] },
      { id: "TK-01-05", title: "Incentive Alignment", description: "Designing incentives that align user behavior with protocol health.", duration: "35 min", topics: ["Staking incentives", "Liquidity mining", "Retroactive rewards", "Sybil resistance"] },
      { id: "TK-01-06", title: "Case Study Analysis", description: "Analyzing real token launches — what worked, what broke, what to avoid.", duration: "40 min", topics: ["Case studies", "Post-mortems", "Modeling tools", "Stress testing"] },
    ],
  },
  {
    id: "SC-01",
    title: "Smart Contract Security",
    subtitle: "Audit-Ready Development",
    description: "Learn smart contract security patterns — common vulnerabilities, auditing methodology, formal verification, and secure development lifecycle for EVM chains.",
    difficulty: "Advanced",
    access: "member",
    duration: "6 hours",
    credential: "Security Auditor",
    icon: "🛡️",
    color: "#ff6b6b",
    lessons: [
      { id: "SC-01-01", title: "Reentrancy & Access Control", description: "Understanding reentrancy attacks and proper access control patterns.", duration: "35 min", topics: ["Reentrancy", "CEI pattern", "Access control", "Ownable patterns"] },
      { id: "SC-01-02", title: "Oracle Manipulation", description: "How oracles get manipulated and how to protect against price oracle attacks.", duration: "30 min", topics: ["TWAP oracles", "Chainlink", "Flash loan attacks", "Manipulation resistance"] },
      { id: "SC-01-03", title: "Integer Overflows & Math", description: "Safe math, precision loss, rounding errors, and Solidity 0.8+ protections.", duration: "25 min", topics: ["Overflow/underflow", "Precision loss", "Rounding errors", "Fixed point math"] },
      { id: "SC-01-04", title: "Auditing Methodology", description: "How professional auditors review contracts — tools, checklists, and reporting.", duration: "40 min", topics: ["Audit scope", "Static analysis", "Fuzzing", "Reporting standards"] },
      { id: "SC-01-05", title: "Formal Verification", description: "Using mathematical proofs to verify contract correctness.", duration: "35 min", topics: ["Formal methods", "Invariants", "Symbolic execution", "Certora / Scribble"] },
      { id: "SC-01-06", title: "Secure Development Lifecycle", description: "Building security into the entire development pipeline from spec to deployment.", duration: "25 min", topics: ["Threat modeling", "Code reviews", "Test coverage", "Bug bounties"] },
    ],
  },
  {
    id: "LQ-01",
    title: "Liquidity Strategy",
    subtitle: "Bootstrapping & Managing Liquidity",
    description: "Strategic approaches to bootstrapping liquidity, market-making, token incentives, and managing LP positions across DEXes on Base.",
    difficulty: "Advanced",
    access: "member",
    duration: "4 hours",
    credential: "Liquidity Strategist",
    icon: "💧",
    color: "#5bc0be",
    lessons: [
      { id: "LQ-01-01", title: "Liquidity Bootstrapping", description: "Strategies for initial liquidity events — LBP, LGE, and initial DEX offerings.", duration: "30 min", topics: ["Liquidity bootstrapping", "Balancer LBP", "Fjord Foundry", "Initial DEX offering"] },
      { id: "LQ-01-02", title: "Concentrated Liquidity", description: "Managing Uniswap V3-style concentrated liquidity positions for maximum efficiency.", duration: "35 min", topics: ["Concentrated liquidity", "Range orders", "Fee tiers", "Rebalancing"] },
      { id: "LQ-01-03", title: "Incentive Design", description: "Designing token incentives to attract and retain liquidity providers.", duration: "30 min", topics: ["LP incentives", "Emission distribution", "Vesting for LPs", "Vote-escrow models"] },
      { id: "LQ-01-04", title: "Stable Pool Management", description: "Managing stablecoin pools, pegged assets, and balancing pool composition.", duration: "25 min", topics: ["Stable pools", "Peg management", "Curve / Aerodrome", "Pool composition"] },
      { id: "LQ-01-05", title: "Cross-Chain Liquidity", description: "Strategies for managing liquidity across multiple chains and bridges.", duration: "30 min", topics: ["Cross-chain liquidity", "Bridge selection", "Wormhole / LayerZero", "Unified liquidity"] },
    ],
  },
  {
    id: "PG-01",
    title: "Protocol Governance",
    subtitle: "DAOs, Voting & Proposals",
    description: "Design and participate in on-chain governance systems — DAO structures, voting mechanisms, proposal lifecycles, and community coordination.",
    difficulty: "Intermediate",
    access: "member",
    duration: "3 hours",
    credential: "Governance Specialist",
    icon: "🏛️",
    color: "#d4af37",
    lessons: [
      { id: "PG-01-01", title: "DAO Structures", description: "Different DAO models — token-based, multi-sig, hybrid, and legal wrappers.", duration: "25 min", topics: ["Token DAOs", "Multi-sig DAOs", "Hybrid models", "Legal structures"] },
      { id: "PG-01-02", title: "Voting Mechanisms", description: "Quadratic voting, conviction voting, token-weighted voting, and delegation.", duration: "30 min", topics: ["Token-weighted voting", "Quadratic voting", "Conviction voting", "Delegate systems"] },
      { id: "PG-01-03", title: "Proposal Lifecycle", description: "From temperature check to on-chain execution — the full proposal pipeline.", duration: "25 min", topics: ["Temperature checks", "RFC process", "Voting periods", "Execution & timelocks"] },
      { id: "PG-01-04", title: "Treasury Governance", description: "Managing DAO treasuries through proposals, multi-sig, and streaming payments.", duration: "30 min", topics: ["Treasury proposals", "Multi-sig execution", "Streaming payments", "Accounting & reporting"] },
      { id: "PG-01-05", title: "Community Coordination", description: "Tools and practices for effective community governance and participation.", duration: "20 min", topics: ["Discussion forums", "Governance tools", "Participation incentives", "Conflict resolution"] },
    ],
  },
  {
    id: "BC-01",
    title: "Base Chain Fundamentals",
    subtitle: "The L2 Powering Supercompute",
    description: "Understand Base — Coinbase's L2 built on the OP Stack. Learn how it works, why it matters, and how to build on it. Gas fees, bridging, sequencers, and the Base ecosystem.",
    difficulty: "Beginner",
    access: "free",
    duration: "2.5 hours",
    credential: null,
    icon: "🔵",
    color: "#6FA3E5",
    lessons: [
      { id: "BC-01-01", title: "What is Base?", description: "Base architecture, the OP Stack, and Coinbase's role as sequencer.", duration: "20 min", topics: ["Layer 2", "OP Stack", "Rollups", "Coinbase"] },
      { id: "BC-01-02", title: "Bridging to Base", description: "How to move assets from Ethereum to Base — official bridge vs third-party.", duration: "25 min", topics: ["Official bridge", "Third-party bridges", "Bridge risk", "Gas costs"] },
      { id: "BC-01-03", title: "Gas on Base", description: "How gas works on L2, why it's cheaper, and optimization techniques.", duration: "20 min", topics: ["Gas fees", "EIP-1559", "L1 data costs", "Calldata optimization"] },
      { id: "BC-01-04", title: "Base Ecosystem", description: "Key protocols and projects building on Base — Aerodrome, Uniswap, Compound, and more.", duration: "30 min", topics: ["Aerodrome", "Uniswap V3", "Compound", "Base ecosystem map"] },
      { id: "BC-01-05", title: "Building on Base", description: "Developer tooling, RPC endpoints, testnets, and deployment patterns for Base.", duration: "25 min", topics: ["RPC endpoints", "Base Sepolia", "Hardhat/Foundry", "Deployment scripts"] },
      { id: "BC-01-06", title: "Base vs Other L2s", description: "Comparing Base to Arbitrum, Optimism, zkSync — trade-offs and use cases.", duration: "20 min", topics: ["Arbitrum", "Optimism", "zkSync", "L2 comparison"] },
    ],
  },
  {
    id: "NM-01",
    title: "NFTs & Digital Ownership",
    subtitle: "Beyond JPEGs — Utility, Credentials, and Rights",
    description: "Understand NFTs as more than collectibles — soul-bound tokens, on-chain credentials, access passes, and digital rights management. Build with ERC-721 and ERC-1155.",
    difficulty: "Intermediate",
    access: "free",
    duration: "3 hours",
    credential: null,
    icon: "🖼️",
    color: "#C9A33A",
    lessons: [
      { id: "NM-01-01", title: "NFT Standards", description: "ERC-721, ERC-1155, and ERC-404 — what each does and when to use them.", duration: "25 min", topics: ["ERC-721", "ERC-1155", "ERC-404", "Standard selection"] },
      { id: "NM-01-02", title: "Soul-Bound Tokens", description: "Non-transferable NFTs for credentials, identity, and achievements.", duration: "30 min", topics: ["SBTs", "Credential design", "On-chain identity", "Attestations"] },
      { id: "NM-01-03", title: "Metadata & Storage", description: "How NFT metadata works — IPFS, Arweave, on-chain vs off-chain storage.", duration: "25 min", topics: ["IPFS", "Arweave", "On-chain metadata", "Permanent storage"] },
      { id: "NM-01-04", title: "NFT Access Systems", description: "Token-gating with NFTs — access passes, membership tiers, and gating strategies.", duration: "30 min", topics: ["Token gating", "Access control", "Membership tiers", "Balance checks"] },
      { id: "NM-01-05", title: "Dynamic NFTs", description: "NFTs that change based on on-chain or off-chain data — use cases and implementation.", duration: "25 min", topics: ["Dynamic metadata", "Oracle integration", "Evolving NFTs", "Game state"] },
      { id: "NM-01-06", title: "Deploying an NFT", description: "Step-by-step: deploy, mint, and verify an NFT contract on Base.", duration: "35 min", topics: ["Contract deployment", "Minting", "Verification", "Basescan"] },
    ],
  },
  {
    id: "DA-01",
    title: "Data & Analytics On-Chain",
    subtitle: "Reading the Blockchain Like a Database",
    description: "Query, analyze, and visualize on-chain data. Learn to use Dune, The Graph, and direct RPC calls to extract insights from smart contract events and state.",
    difficulty: "Intermediate",
    access: "free",
    duration: "3.5 hours",
    credential: null,
    icon: "📊",
    color: "#6FA3E5",
    lessons: [
      { id: "DA-01-01", title: "Reading Blockchain Data", description: "Blocks, transactions, logs, and events — the raw data layer of EVM chains.", duration: "25 min", topics: ["Blocks", "Transactions", "Logs", "Events", "ABI decoding"] },
      { id: "DA-01-02", title: "Dune Analytics", description: "Writing SQL queries against on-chain data with Dune.", duration: "35 min", topics: ["Dune", "SQL", "Dashboards", "Data tables"] },
      { id: "DA-01-03", title: "The Graph Protocol", description: "Indexing smart contract data with subgraphs for fast querying.", duration: "30 min", topics: ["Subgraphs", "GraphQL", "Indexing", "Entity mapping"] },
      { id: "DA-01-04", title: "Direct RPC Queries", description: "Using eth_call, eth_getLogs, and batch requests for custom data extraction.", duration: "30 min", topics: ["eth_call", "eth_getLogs", "Batch requests", "Multicall"] },
      { id: "DA-01-05", title: "Token Analytics", description: "Tracking transfers, holders, volume, and liquidity for ERC-20 tokens.", duration: "25 min", topics: ["Transfer events", "Holder counts", "Volume tracking", "Pool analytics"] },
      { id: "DA-01-06", title: "Building Dashboards", description: "Create real-time dashboards for protocol metrics using on-chain data.", duration: "30 min", topics: ["Dashboard design", "Real-time data", "Visualization", "Alerting"] },
    ],
  },
  {
    id: "ID-01",
    title: "On-Chain Identity",
    subtitle: "ENS, SBTs, and Decentralized Identity",
    description: "Build identity systems on-chain — ENS names, soul-bound tokens, attestations, and decentralized identifiers. Self-sovereign identity for Web3.",
    difficulty: "Intermediate",
    access: "free",
    duration: "2.5 hours",
    credential: null,
    icon: "🪪",
    color: "#5bc0be",
    lessons: [
      { id: "ID-01-01", title: "ENS Deep Dive", description: "How Ethereum Name Service works — registration, resolution, and records.", duration: "25 min", topics: ["ENS", "Namehash", "Resolution", "Reverse records"] },
      { id: "ID-01-02", title: "Decentralized Identifiers", description: "DIDs, verifiable credentials, and self-sovereign identity standards.", duration: "30 min", topics: ["DIDs", "W3C VC", "Self-sovereign identity", "Attestations"] },
      { id: "ID-01-03", title: "Soul-Bound Identity", description: "Using non-transferable tokens for persistent on-chain identity.", duration: "25 min", topics: ["SBTs", "Identity tokens", "Reputation", "Attestation schema"] },
      { id: "ID-01-04", title: "Sign-In with Ethereum (SIWE)", description: "How SIWE works — message format, verification, and session management.", duration: "30 min", topics: ["SIWE", "Message signing", "Session management", "Nonce verification"] },
      { id: "ID-01-05", title: "Identity for Agents", description: "Giving AI agents on-chain identity — wallets, signing, and reputation.", duration: "20 min", topics: ["Agent wallets", "Delegated signing", "Agent identity", "Reputation"] },
    ],
  },
]

export const modulesByAccess = {
  free: modules.filter(m => m.access === "free"),
  member: modules.filter(m => m.access === "member"),
}

export function getModule(id: string): SchoolModule | undefined {
  return modules.find(m => m.id === id)
}

export function getLesson(moduleId: string, lessonId: string): { module: SchoolModule; lesson: Lesson } | undefined {
  const mod = modules.find(m => m.id === moduleId)
  if (!mod) return
  const lesson = mod.lessons.find(l => l.id === lessonId)
  if (!lesson) return
  return { module: mod, lesson }
}
