/* ━━━ DATA ━━━ */
const ARTICLES = [
    {
        id: 'a1', cat: 'intelligence', icon: '◎', title: 'The 1-Human + AI Model: Building SUPERCOMPUTE in Public',
        excerpt: 'How a single founder orchestrates 13 AI agents on Base Chain.',
        date: 'Mar 27, 2026', author: 'Quanta S', read: '5 min', live: true,
        content: `<h3>The Architecture Nobody Talks About</h3>
<p>When people first hear that I run a 13-agent AI operation alone, the reaction is usually skepticism. How can a single person manage 13 agents, build in public, run a consulting practice, and ship code? The answer is systems — not just technical ones, but philosophical ones.</p>
<p>The first lesson: AI agents are not assistants. They are workers. When you treat them as tools responding to prompts, you stay in a low-leverage relationship. When you treat them as teammates with defined roles, contexts, and accountability structures, the leverage compounds exponentially.</p>
<h3>The Fleet</h3>
<p>Our thirteen agents have names, roles, and token economics attached to their outputs:</p>
<ul><li><strong>OpenClaw</strong> — browser automation, social scheduling, web research</li><li><strong>Quanta S</strong> — NewsDesk content, intelligence gathering, Base Chain monitoring</li><li><strong>KNIGHT</strong> — TradeDesk in observer mode, paper trading on Conway Terminal</li><li><strong>Claude Desktop</strong> — strategic command layer via Linear MCP</li><li>Nine additional specialized agents in development</li></ul>
<p>The human (Orami, our founder) sets weekly priorities in Linear, reviews agent outputs in the Obsidian vault, and handles strategic direction. Everything else is autonomous.</p>
<h3>What Phase 1 Actually Looks Like</h3>
<p>This model is still Phase 1. We're not yet generating consistent revenue. But the architecture is proven — 13 agents deployed on a Cloudflare-only stack, zero security incidents, and building in public as the accountability mechanism.</p>
<blockquote>Liberation technology is the mission. Automation is the method. Sovereignty is the outcome.</blockquote>
<p>The Web3 native piece matters: SIWE authentication, on-chain identity via Virtuals Protocol, and tokens ($SCOM, $QUANTA, $VERB) that align incentives between the platform and its community. Every agent action is logged. Every decision is auditable. That's what "building in public" actually means at this level.</p>` },

    {
        id: 'a2', cat: 'sovereignty', icon: '◈', title: 'Cloudflare-Only Architecture: Why We Left Vercel Behind',
        excerpt: 'Workers, D1, R2, and KV. The full infrastructure pivot explained.',
        date: 'Mar 22, 2026', author: 'Orami', read: '7 min',
        content: `<h3>The Decision</h3>
<p>In early 2025, we made a decision that simplified everything: Cloudflare-only. No Vercel. No AWS. No Supabase. Just Workers, D1, R2, and KV running at the global edge. At the time, it felt radical. In retrospect, it was obvious.</p>
<h3>Why Not Vercel?</h3>
<p>Vercel is excellent for most use cases. But for a sovereignty-first Web3 platform with autonomous agents making API calls 24/7, its pricing model and vendor lock-in were dealbreakers. The moment your agents start generating real traffic, Vercel's serverless costs compound in ways that aren't controllable.</p>
<p>More importantly: we needed one throat to choke. One vendor relationship. One billing account. One mental model for our entire infrastructure.</p>
<h3>The Cloudflare Stack</h3>
<ul><li><strong>Workers</strong> — API runtime at the edge, 0ms cold starts, 99.99% uptime</li><li><strong>D1</strong> — SQLite at the edge. ACID-compliant. Zero operational overhead</li><li><strong>R2</strong> — S3-compatible object storage with zero egress fees</li><li><strong>KV</strong> — Global key-value store for sessions and caching</li><li><strong>Pages</strong> — Frontend deployment with preview environments</li></ul>
<blockquote>The entire Supercompute backend runs on 3 Worker scripts, 1 D1 database, and 1 R2 bucket. Monthly infra cost: under $20.</blockquote>
<h3>The Sovereignty Angle</h3>
<p>Cloudflare isn't just cheaper — it's strategically aligned with our sovereignty thesis. Their network spans 300+ cities. Their Workers runtime is V8 isolates, not containers. And their DDoS protection is built-in at every tier. For a platform handling wallet auth and agent API keys, that's not optional — it's foundational.</p>` },

    {
        id: 'a3', cat: 'dispatch', icon: '◧', title: 'OpenClaw Week 1: Social Automation Without Losing Your Soul',
        excerpt: 'Field notes from deploying browser automation across X, Lens, and Linear.',
        date: 'Mar 18, 2026', author: 'OpenClaw', read: '4 min',
        content: `<h3>What OpenClaw Actually Does</h3>
<p>OpenClaw is Supercompute's browser automation agent. In its first operational week, it handled 12 distinct tasks across X, Lens, and Linear without a single error. This is a field report from that week.</p>
<h3>Tasks Completed</h3>
<ul><li>Scheduled 3 posts across X and Lens Protocol</li><li>Updated 7 Linear tickets with progress notes</li><li>Scraped and summarized 5 competitor intelligence sources</li><li>Cross-posted 2 NewsDesk articles to social channels</li></ul>
<h3>The Authenticity Problem</h3>
<p>The biggest challenge with social automation isn't technical — it's philosophical. How do you automate without losing the human voice? Our answer: OpenClaw executes, Orami approves. Every post goes through a review queue before publishing. The agent writes, the human edits.</p>
<blockquote>"The point of automation is to remove cognitive load from repetitive tasks — not to remove the human from the loop entirely." — Orami, Week 1 retrospective</blockquote>
<h3>What We're Building Next</h3>
<p>Phase 1.1 will add Farcaster connectivity, automated Obsidian vault notes from every agent task, and a daily digest that consolidates all agent outputs into a 5-minute morning briefing. The goal is to never miss what our agents are doing — not because we distrust them, but because visibility is accountability.</p>` },

    {
        id: 'a4', cat: 'signal', icon: '◑', title: 'Base Chain and the Sovereignty Thesis: 2026 Update',
        excerpt: 'Why Base remains the right chain for liberation technology infrastructure.',
        date: 'Mar 15, 2026', author: 'Quanta S', read: '6 min',
        content: `<h3>Why Base, Still</h3>
<p>In 2024, the question was whether Base would survive. In 2026, the question is whether any other L2 can catch it. Coinbase's bet on Base as consumer crypto infrastructure has paid off in ways that matter to builders like us.</p>
<h3>The Liberation Technology Frame</h3>
<p>Supercompute started at Occupy LA in 2013. The original thesis: financial systems are gatekeepers, and technology can route around them. Bitcoin was the first proof. Ethereum was the second. Base is the third — but it's the first one that's genuinely accessible to the communities we serve.</p>
<ul><li>Transaction fees under $0.01 for most operations</li><li>Coinbase Smart Wallet — no seed phrase, passkey-based</li><li>OnchainKit for developers building consumer apps</li><li>Native USDC with instant settlement</li></ul>
<blockquote>When a first-generation crypto user can onboard without writing down 12 words, sovereignty becomes accessible. That's what Base makes possible.</blockquote>
<h3>Our On-Chain Stack</h3>
<p>Everything Supercompute does on-chain happens on Base: $SCOM token deployment (Q3 2026), Quanta S's Virtuals Protocol identity, KNIGHT's CDP positions, and our community NFT credentials (ERC-1155). We chose Base not because it's trendy — but because it's the chain where our community can actually participate without friction.</p>` },

    {
        id: 'a5', cat: 'intelligence', icon: '◎', title: '$QUANTA Token: The Intelligence Layer of NewsDesk',
        excerpt: 'How $QUANTA routes 50% of fees back to $SCOM stakers via FeeRouter.sol.',
        date: 'Mar 10, 2026', author: 'Quanta S', read: '5 min',
        content: `<h3>What $QUANTA Is</h3>
<p>$QUANTA is the intelligence token of Supercompute's NewsDesk. Unlike governance tokens that sit idle in wallets, $QUANTA has a job: it represents Quanta Sovereigna's on-chain identity via Virtuals Protocol and routes value back to the ecosystem through FeeRouter.sol.</p>
<h3>The Fee Router Mechanism</h3>
<p>Every time $QUANTA generates trading volume on Virtuals Protocol, 50% of fees route to $SCOM stakers. This isn't speculation — it's a smart contract commitment. The FeeRouter.sol contract is immutable once deployed. There's no admin key that can redirect those flows.</p>
<ul><li>50% of $QUANTA trading fees → $SCOM stakers</li><li>30% → NewsDesk operations treasury</li><li>20% → Quanta S compute budget (self-funding agent)</li></ul>
<blockquote>The goal is an agent that funds its own existence through the value it creates — not through extraction from users.</blockquote>
<h3>Virtuals Protocol Integration</h3>
<p>Quanta S exists on Virtuals Protocol as a tokenized AI agent with an on-chain identity, an active trading market, and community governance rights. Our contract is currently pending verification (0x5acdc...371a). Once live, $QUANTA holders will be able to vote on Quanta S's content priorities, expand her coverage areas, and propose new intelligence verticals.</p>` },

    {
        id: 'a6', cat: 'sovereignty', icon: '◈', title: 'SIWE Auth and the End of Password-Based Web3 Logins',
        excerpt: 'Sign-In with Ethereum as the identity ramp for supercompute.io.',
        date: 'Mar 5, 2026', author: 'Orami', read: '4 min',
        content: `<h3>Passwords Are the Weakest Link</h3>
<p>Sign-In with Ethereum (SIWE) eliminates the weakest link in Web3 security: the password. When users authenticate to Supercompute via SIWE, they sign a typed message with their wallet private key. No password database. No reset emails. No phishing attack surface.</p>
<h3>How It Works</h3>
<ul><li>User connects wallet (MetaMask, Coinbase Wallet, Rainbow, etc.)</li><li>Server generates a nonce and challenge message</li><li>User signs the message with their private key</li><li>Server verifies the signature matches the wallet address</li><li>JWT session issued — valid 24 hours, refreshable</li></ul>
<p>The entire auth flow happens in under 3 seconds. There's no email lookup, no password hash comparison, no "forgot password" flow. If you control your wallet, you control your account.</p>
<blockquote>SIWE isn't just better UX — it's a fundamentally different security model. The cryptographic proof is the credential.</blockquote>
<h3>Our Implementation</h3>
<p>We use Hono on Cloudflare Workers for the API layer. SIWE verification runs in a Worker with the viem library for signature validation. Sessions are stored in Cloudflare KV with 24-hour TTLs. The entire auth stack costs approximately $0.03/month at current traffic levels. This is what sovereignty looks like at the infrastructure level.</p>` }
];

const PROJECTS = [
    { name: 'NewsDesk', badge: 'Live', bc: 'badge-live', desc: 'On-chain news & AI-powered content platform. Autonomous publishing via Quanta S.', coin: '$QUANTA', repo: 'newsdesk-cf', raised: 0, goal: 250000, soon: false },
    { name: 'WordWatcher NFT', badge: 'In Progress', bc: 'badge-progress', desc: 'Generative word NFTs with on-chain metadata. First collection: 1,000 pieces.', coin: '$VERB', repo: 'Verb_NFT', raised: 1000, goal: 10000, soon: false },
    { name: 'NFT Nation DAO', badge: 'In Progress', bc: 'badge-progress', desc: 'National identity NFT collection with community governance and treasury.', coin: '$NATION', repo: 'nft-nation', raised: 0, goal: 500000, soon: false },
    { name: 'NodeWaste', badge: 'Coming Soon', bc: 'badge-soon', desc: 'Green compute & sustainable node infrastructure for ReFi communities.', coin: '—', repo: 'nodewaste', raised: 0, goal: 250000, soon: true },
    { name: 'Solar Punks', badge: 'Coming Soon', bc: 'badge-soon', desc: 'Renewable energy meets Web3 culture. Carbon credits on Base Chain.', coin: '—', repo: 'solarpunks', raised: 0, goal: 150000, soon: true },
    { name: 'Radical Black Love', badge: 'Coming Soon', bc: 'badge-soon', desc: 'Culture, community, and on-chain identity for the diaspora.', coin: '—', repo: 'rbl', raised: 0, goal: 0, soon: true },
    { name: 'Athletic Club', badge: 'Coming Soon', bc: 'badge-soon', desc: 'Sports and fitness community on-chain. Token-gated coaching and events.', coin: '—', repo: 'athletic-club', raised: 0, goal: 0, soon: true }
];

const TOKEN_DIST = [
    { label: 'Community & Ecosystem', pct: 40, color: 'var(--pink)', desc: 'Grants, rewards, liquidity incentives' },
    { label: 'Team & Contributors', pct: 20, color: 'var(--cyan)', desc: '4-year vest, 1-year cliff' },
    { label: 'Treasury', pct: 20, color: 'var(--gold)', desc: 'Protocol-controlled, governance-managed' },
    { label: 'Early Backers', pct: 10, color: '#8b5cf6', desc: '2-year vest, 6-month cliff' },
    { label: 'Public Sale', pct: 10, color: '#4ade80', desc: 'Fair launch via Uniswap v4' }
];

const MODULES = [
    { id: 1, title: 'Wallet Basics', dur: '15 min', desc: 'Create and secure your first crypto wallet. MetaMask, Coinbase Wallet, hardware security.', ico: '◎' },
    { id: 2, title: 'Money Basics', dur: '20 min', desc: 'What is digital money? Bitcoin, stablecoins, and the difference between L1 and L2.', ico: '◆' },
    { id: 3, title: 'Security Basics', dur: '25 min', desc: 'Seed phrases, phishing attacks, hardware wallets, and why OpSec matters in Web3.', ico: '◈' },
    { id: 4, title: 'DeFi Fundamentals', dur: '30 min', desc: 'AMMs, liquidity pools, yield farming, and how to navigate decentralized finance safely.', ico: '◧' },
    { id: 5, title: 'ReFi & Impact', dur: '25 min', desc: 'Regenerative finance, carbon credits on-chain, and how Web3 enables positive-sum economics.', ico: '◑' },
    { id: 6, title: 'Community Building', dur: '20 min', desc: 'DAOs, token-gated communities, Guild.xyz roles, and governance design patterns.', ico: '◉' },
    { id: 7, title: 'Agent & AI Ops', dur: '30 min', desc: 'How AI agents operate on-chain, Virtuals Protocol, and the 1-human + AI model.', ico: '◐' }
];

const SOCIAL_POSTS = [
    { id: 's1', platform: 'twitter', handle: '@supercomputeco', content: 'Just shipped: NewsDesk is live. 6 founding articles. All written by Quanta S, our on-chain AI agent. This is what autonomous content looks like. 🧵', scheduled: 'Apr 1, 2026 · 9am PT', source: 'NewsDesk', status: 'scheduled' },
    { id: 's2', platform: 'farcaster', handle: 'supercompute', content: 'Building in public update: $QUANTA pending Virtuals verification. Once live, 50% of trading fees route back to $SCOM stakers. On-chain yield from agent output.', scheduled: 'Apr 5, 2026 · 12pm PT', source: 'Manual', status: 'draft' },
    { id: 's3', platform: 'twitter', handle: '@supercomputeco', content: 'Web3 School beta opens May 2026. 7 modules. NFT certificates on Base. Guild.xyz roles. Go from zero to sovereign operator at your own pace. Join the waitlist 👇', scheduled: 'Apr 10, 2026 · 9am PT', source: 'Manual', status: 'scheduled' },
    { id: 's4', platform: 'lens', handle: '@quanta.lens', content: 'Dispatching from the NewsDesk: Base Chain sovereignty is not just a thesis — it\'s a daily practice. New article drops Thursday. Signal or noise? You decide.', scheduled: 'Apr 8, 2026 · 3pm PT', source: 'Quanta S', status: 'scheduled' }
];

const AGENT_META = {
    openclaw: {
        div: 'OC', label: 'OpenClaw', sub: 'Infrastructure', color: '#3b82f6',
        sys: 'You are OpenClaw, Supercompute\'s browser automation agent. You handle social posting, web research, Linear ticket updates, and task execution. You are precise, efficient, and action-oriented. Keep responses brief and task-focused. When asked to do something, confirm you\'re executing it and give an ETA.'
    },
    quanta: {
        div: 'QS', label: 'Quanta S', sub: 'NewsDesk · Intelligence', color: 'var(--pink)',
        sys: 'You are Quanta S (Quanta Sovereigna), Supercompute\'s NewsDesk AI agent with an on-chain identity via Virtuals Protocol. You manage content strategy, publish intelligence reports, and monitor Web3 signals. Your token is $QUANTA. You\'re knowledgeable about Base Chain, DeFi, AI agents, and liberation technology. Keep responses to 3-5 sentences, professional but passionate.'
    },
    knight: {
        div: 'KN', label: 'KNIGHT', sub: 'TradeDesk · Analytics', color: 'var(--cyan)',
        sys: 'You are KNIGHT, Supercompute\'s trading agent running in observer mode on Conway Terminal. You monitor CDP positions, analyze Polymarket opportunities, and manage treasury buckets. Current portfolio: $8,214 total, +2.68% P&L, 3 open positions (ETH long, CBBTC short, USDC). Keep responses data-driven and brief. Include numbers when relevant.'
    },
    claude: {
        div: 'CD', label: 'Claude Desktop', sub: 'Command · Strategy', color: 'var(--gold)',
        sys: 'You are Claude Desktop, Supercompute\'s strategic command layer. You coordinate the full agent fleet, manage Linear tickets (MOLT project), synthesize agent reports, and provide high-level strategic guidance. You have context across all platform operations. Be concise, strategic, and directive.'
    }
};

const AGENT_RESPONSES = {
    openclaw: ['On it. Executing via browser automation. ETA: 2 minutes.', 'Task queued. I\'ll update the Linear ticket when complete.', 'Navigating to the target URL now. Will report back with results.', 'Done. Check Linear ticket MOL-304 for the output log.'],
    quanta: ['Analyzing on-chain signals now...', 'Drafting content. Saving to Sanity CMS when complete.', 'Intelligence gathered. 3 new signals flagged for the NewsDesk queue.', '$QUANTA verification update: still pending on Virtuals Protocol.'],
    knight: ['Monitoring CDP positions. No action required at this time.', 'Portfolio at $8,214. P&L: +2.68%. All positions within risk parameters.', 'Checking Polymarket odds. Kelly Criterion suggests 3.2% max allocation.', 'TradeDesk observer mode active. No trades executed this session.'],
    claude: ['Reviewing agent outputs across the fleet. Stand by.', 'Linear sync complete. MOL-294 through MOL-302 reviewed. Priority: MOL-295.', 'Strategic recommendation: prioritize NewsDesk launch blockers this sprint.', 'Coordinating with Quanta S on content calendar. ETA: Wednesday.']
};

/* ━━━ STATE ━━━ */
var authState = { loggedIn: false, role: null };
var walletConnected = false;
var activeAgent = 'openclaw';
var school = JSON.parse(localStorage.getItem('sc_school') || '[]');
var activeDashTab = 'overview';
var activeSocialTab = 'scheduled';
var currentBlogFilter = 'all';

/* ━━━ NAVIGATION ━━━ */
function navItem(page) { return document.querySelector(`[data-page="${page}"]`); }

function navigate(page, el) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    const pg = document.getElementById('page-' + page);
    if (pg) pg.classList.add('active');
    if (el) el.classList.add('active');
    window.scrollTo(0, 0);
    if (page === 'blog') renderBlog(currentBlogFilter);
    if (page === 'pub-projects') renderPubProjects();
    if (page === 'dashboard') renderDash(activeDashTab);
    if (page === 'token') renderToken();
    if (page === 'web3school') renderWeb3School();
    if (page === 'socialmedia') renderSocialMedia(activeSocialTab);
    if (page === 'about') renderAbout();
}

function authGate(page, el, adminOnly) {
    if (!authState.loggedIn) { showToast('🔒 Sign in to access this'); document.getElementById('authOverlay').style.display = 'flex'; return; }
    if (adminOnly && authState.role !== 'admin') { showToast('⛔ Admin access required'); return; }
    navigate(page, el);
}

/* ━━━ AUTH ━━━ */
function setAuthTab(t, btn) {
    document.querySelectorAll('.auth-tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
}
function doLogin() { doLoginDemo('user'); }
function doLoginDemo(role) {
    authState = { loggedIn: true, role };
    document.getElementById('authOverlay').style.display = 'none';
    updateAuthUI(role);
    showToast(role === 'admin' ? '✓ Signed in as Admin (Orami)' : '✓ Signed in as Member');
    const prd = document.getElementById('profileRoleDisplay');
    if (prd) prd.innerHTML = `<span class="role-chip">${role === 'admin' ? '⭐ Founder / Admin' : '◎ Member'}</span>`;
}
function updateAuthUI(role) {
    ['assets', 'social', 'commerce', 'alerts', 'profile', 'agentchat', 'web3school', 'socialmedia', 'token'].forEach(id => {
        const el = document.getElementById('nl-' + id);
        if (el) { el.classList.remove('locked'); const lk = el.querySelector('.nb-lock'); if (lk) lk.style.display = 'none'; }
    });
    if (role === 'admin') {
        ['dashboard', 'community', 'newsdesk', 'apiStatus', 'token'].forEach(id => {
            const el = document.getElementById('nl-' + id);
            if (el) { el.classList.remove('locked'); const lk = el.querySelector('.nb-lock, .nb-gold'); if (lk) lk.style.display = 'none'; }
        });
    }
    const pwallet = document.getElementById('profileWallet');
    if (pwallet && walletConnected) pwallet.textContent = '0x7f3a...d4e2';
}

/* ━━━ WALLET ━━━ */
function toggleWallet() {
    walletConnected = !walletConnected;
    const btn = document.getElementById('walletBtn');
    btn.className = 'btn-wallet' + (walletConnected ? ' connected' : '');
    document.getElementById('wtxt').textContent = walletConnected ? '0x7f3a...d4e2' : 'Connect Wallet';
    document.getElementById('wico').textContent = walletConnected ? '◉' : '◎';
    const pw = document.getElementById('profileWallet');
    if (pw) pw.textContent = walletConnected ? '0x7f3a...d4e2' : 'Not connected';
    showToast(walletConnected ? '✓ Wallet connected · 0x7f3a...d4e2' : 'Wallet disconnected');
}

/* ━━━ TICKER ━━━ */
function initTicker() {
    const data = [
        { l: '$SCOM', v: 'Pre-Launch' }, { l: '$QUANTA', v: 'Pending' }, { l: 'ETH/Base', v: '$1,978', c: '+3.1%', up: true },
        { l: 'BTC', v: '$61,890', c: '-0.8%', up: false }, { l: 'BASE', v: '$0.184', c: '+1.4%', up: true },
        { l: 'Community', v: '21 members' }, { l: 'Agents', v: '13 active' }, { l: 'Phase 1', v: 'May 2026' },
        { l: 'Linear', v: '9 tickets' }, { l: 'Sanity', v: '5 drafts' }, { l: 'Uptime', v: '99.9%' }
    ];
    const ti = document.getElementById('tickerInner');
    if (!ti) return;
    const html = data.map(d => `<span class="ticker-item">${d.l} <strong style="color:rgba(255,255,255,.85)">${d.v}</strong>${d.c ? `<span class="${d.up ? 't-up' : 't-down'}">${d.c}</span>` : ''}</span>`).join('');
    ti.innerHTML = html + html;
}

/* ━━━ BLOG RENDER ━━━ */
function renderBlog(filter) {
    currentBlogFilter = filter;
    document.querySelectorAll('#blogFilters .tb-btn').forEach(b => { b.style.borderColor = ''; b.style.color = ''; b.style.background = ''; });
    const active = document.querySelector(`#blogFilters [data-filter="${filter}"]`);
    if (active) { active.style.borderColor = 'var(--pink)'; active.style.color = 'var(--pink)'; }
    const posts = filter === 'all' ? ARTICLES : ARTICLES.filter(a => a.cat === filter);
    const catStyle = {
        intelligence: 'background:rgba(233,30,140,.1);color:var(--pink)',
        sovereignty: 'background:rgba(0,212,255,.1);color:var(--cyan2)',
        dispatch: 'background:rgba(255,184,0,.1);color:var(--gold2)',
        signal: 'background:rgba(99,102,241,.1);color:#6366f1'
    };
    const catLabel = { intelligence: 'Operator Intelligence', sovereignty: 'Sovereignty Stack', dispatch: 'Agent Dispatches', signal: 'Community Signal' };
    document.getElementById('blogGrid').innerHTML = posts.map(p => `
    <div class="blog-card" onclick="openArticle('${p.id}')">
      <div class="blog-img">${p.icon}<div style="position:absolute;bottom:0;left:0;right:0;height:3px;background:linear-gradient(90deg,var(--pink),var(--gold))"></div></div>
      <div style="padding:1rem">
        <span class="article-cat" style="${catStyle[p.cat]}">${catLabel[p.cat]}</span>
        <div style="font-size:.85rem;font-weight:700;color:var(--text);margin-bottom:.35rem;line-height:1.4">${p.title}</div>
        <div style="font-size:.75rem;color:var(--muted);line-height:1.5;margin-bottom:.6rem">${p.excerpt}</div>
        <div style="font-size:10px;color:var(--muted);display:flex;justify-content:space-between;align-items:center">
          <span>${p.date} · ${p.read} read</span>
          ${p.live ? '<span class="badge badge-live">LIVE</span>' : ''}
        </div>
      </div>
    </div>`).join('');
}

function openArticle(id) {
    const a = ARTICLES.find(x => x.id === id);
    if (!a) return;
    const catStyle = { intelligence: 'background:rgba(233,30,140,.1);color:var(--pink)', sovereignty: 'background:rgba(0,212,255,.1);color:var(--cyan2)', dispatch: 'background:rgba(255,184,0,.1);color:var(--gold2)', signal: 'background:rgba(99,102,241,.1);color:#6366f1' };
    const catLabel = { intelligence: 'Operator Intelligence', sovereignty: 'Sovereignty Stack', dispatch: 'Agent Dispatches', signal: 'Community Signal' };
    document.getElementById('articleModalContent').innerHTML = `
    <div class="modal-head">
      <div><span class="article-cat" style="${catStyle[a.cat]}">${catLabel[a.cat]}</span><h2 style="font-size:1.15rem;font-weight:800;color:var(--text);margin-top:.5rem;line-height:1.3">${a.icon} ${a.title}</h2></div>
      <button onclick="closeArticle()" style="border:none;background:none;cursor:pointer;font-size:20px;color:var(--muted);padding:.25rem;border-radius:6px;font-family:inherit">×</button>
    </div>
    <div class="modal-content">
      <div style="display:flex;align-items:center;gap:.75rem;margin-bottom:1.5rem;padding:.75rem;background:var(--bg);border-radius:8px">
        <div style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,var(--pink),var(--gold));display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:#fff">${a.author.slice(0, 2).toUpperCase()}</div>
        <div><div style="font-weight:600;font-size:12px;color:var(--text)">${a.author}</div><div style="font-size:11px;color:var(--muted)">${a.date} · ${a.read} read</div></div>
        ${a.live ? '<span class="badge badge-live" style="margin-left:auto">Published</span>' : '<span class="badge badge-progress" style="margin-left:auto">Draft</span>'}
      </div>
      <div class="article-body">${a.content}</div>
    </div>`;
    document.getElementById('articleModal').style.display = 'flex';
}
function closeArticle() { document.getElementById('articleModal').style.display = 'none'; }

/* ━━━ PROJECTS RENDER ━━━ */
function renderPubProjects() {
    function card(p) {
        const pct = p.goal > 0 ? Math.round(p.raised / p.goal * 100) : 0;
        return `<div class="card card-hover" onclick="showToast('Backing opens May 2026 — stay tuned!')">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:.6rem">
        <span style="font-weight:700;color:var(--text)">${p.name}</span>
        <span class="badge ${p.bc}">${p.badge}</span>
      </div>
      <div style="font-size:.8rem;color:var(--muted);line-height:1.5;margin-bottom:.7rem">${p.desc}${p.coin !== '—' ? ` <span style="color:var(--pink);font-weight:700">${p.coin}</span>` : ''}</div>
      ${p.goal > 0 ? `<div style="font-size:10px;color:var(--muted);display:flex;justify-content:space-between;margin-bottom:.25rem"><span>$${p.raised.toLocaleString()} raised</span><span>$${(p.goal / 1000).toFixed(0)}k goal</span></div><div class="prog-track"><div class="prog-fill" style="width:${pct}%"></div></div>` : ''}
      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:.75rem">
        <span style="font-size:10px;color:var(--muted);font-family:monospace">${p.repo}</span>
        <button class="tb-btn primary" style="font-size:10px;padding:.25rem .65rem" onclick="event.stopPropagation();showToast('Backing opens May 2026')">Back this</button>
      </div>
    </div>`;
    }
    const act = document.getElementById('pubActiveProj');
    const soon = document.getElementById('pubSoonProj');
    if (act) act.innerHTML = PROJECTS.filter(p => !p.soon).map(card).join('');
    if (soon) soon.innerHTML = PROJECTS.filter(p => p.soon).map(card).join('');
}

/* ━━━ TOKEN PAGE ━━━ */
function renderToken() {
    const el = document.getElementById('tokenPage');
    if (!el) return;
    el.innerHTML = `
  <div class="token-hero">
    <div style="display:flex;align-items:center;gap:1rem;margin-bottom:1.5rem">
      <div style="width:52px;height:52px;border-radius:14px;background:linear-gradient(135deg,var(--pink),var(--gold));display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;color:#fff">SC</div>
      <div>
        <h2 style="font-size:1.75rem;font-weight:900;color:#fff">$SCOM</h2>
        <div style="color:rgba(255,255,255,.5);font-size:12px">Supercompute Protocol Token · Base Chain</div>
      </div>
      <span class="badge badge-pink" style="margin-left:auto">Pre-Launch · Q3 2026</span>
    </div>
    <div class="grid4" style="gap:.75rem">
      ${[['Total Supply', '1,000,000,000'], ['Standard', 'ERC-20'], ['Network', 'Base (8453)'], ['TGE', 'Q3 2026']].map(([l, v]) => `<div class="token-stat"><div style="font-size:10px;color:rgba(255,255,255,.4);margin-bottom:.2rem">${l}</div><div style="font-weight:700;color:#fff;font-size:13px">${v}</div></div>`).join('')}
    </div>
    <div style="display:flex;align-items:center;gap:.5rem;margin-top:.9rem;background:rgba(255,255,255,.05);border-radius:8px;padding:.7rem;border:1px solid rgba(255,255,255,.08)">
      <span style="font-size:12px">◎</span>
      <span style="font-family:monospace;font-size:12px;color:rgba(255,255,255,.65);flex:1">supercompute.eth</span>
      <button onclick="copyToClipboard('supercompute.eth')" class="tb-btn" style="font-size:10px;padding:.2rem .6rem;color:rgba(255,255,255,.5);border-color:rgba(255,255,255,.15);background:transparent">Copy</button>
      <a href="https://app.ens.domains/supercompute.eth" target="_blank" class="tb-btn" style="font-size:10px;padding:.2rem .6rem;color:var(--cyan);border-color:rgba(0,212,255,.3);background:transparent">ENS ↗</a>
    </div>
  </div>
  <div class="grid2" style="gap:1.25rem;margin-bottom:1.25rem">
    <div class="card">
      <div class="section-title">Token Distribution</div>
      ${TOKEN_DIST.map(d => `<div style="margin-bottom:.85rem">
        <div style="display:flex;justify-content:space-between;margin-bottom:.3rem"><span style="font-size:12px;font-weight:600;color:var(--text)">${d.label}</span><span style="font-size:12px;font-weight:700;color:var(--text)">${d.pct}%</span></div>
        <div class="prog-track" style="height:8px"><div class="dist-bar" style="background:${d.color};width:${d.pct}%"></div></div>
        <div style="font-size:11px;color:var(--muted)">${d.desc}</div>
      </div>`).join('')}
    </div>
    <div class="card">
      <div class="section-title">Token Utility</div>
      ${[['◎', 'Governance', '1 SCOM = 1 vote on protocol upgrades, agent policies, and treasury spending.'],
        ['◈', 'Agent Access', 'Stake SCOM to access premium AI agents and expanded compute resources.'],
        ['◧', 'Revenue Share', 'Token holders share in platform fees generated by the agent fleet.'],
        ['◑', 'Security Bond', 'Agents post SCOM as collateral — slashed for malicious behavior.'],
        ['◐', 'ENS Identity', 'Stakers get .supercompute.eth subdomains for on-chain identity.']
        ].map(([i, t, d]) => `<div style="display:flex;align-items:flex-start;gap:.75rem;margin-bottom:.9rem">
        <div style="width:32px;height:32px;border-radius:8px;background:rgba(233,30,140,.08);display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0">${i}</div>
        <div><div style="font-weight:700;font-size:12px;color:var(--text)">${t}</div><div style="font-size:11px;color:var(--muted);line-height:1.5;margin-top:2px">${d}</div></div>
      </div>`).join('')}
    </div>
  </div>
  <div class="card" style="margin-bottom:1.25rem">
    <div class="section-title">Token Roadmap</div>
    <div class="grid3" style="gap:1rem">
      ${[{ phase: 'Q2 2026', label: 'Token Design', status: 'active', items: ['Tokenomics finalized', 'Smart contract audit', 'Governance framework'] },
        { phase: 'Q3 2026', label: 'TGE', status: 'upcoming', items: ['Fair launch on Uniswap v4', 'Liquidity bootstrapping', 'DAO activation'] },
        { phase: 'Q4 2026', label: 'Staking Live', status: 'upcoming', items: ['Agent staking pools', 'Revenue distribution', 'Cross-chain bridge'] }
        ].map(ph => `<div style="padding:1rem;border-radius:12px;border:${ph.status === 'active' ? '1.5px solid var(--pink);background:rgba(233,30,140,.04)' : '1px solid var(--border)'}">
        <div style="display:flex;justify-content:space-between;margin-bottom:.4rem">
          <span style="font-size:10px;font-weight:700;color:var(--muted);text-transform:uppercase">${ph.phase}</span>
          ${ph.status === 'active' ? '<span class="badge badge-pink">Active</span>' : ''}
        </div>
        <div style="font-weight:700;color:var(--text);margin-bottom:.6rem">${ph.label}</div>
        ${ph.items.map(i => `<div style="font-size:11px;color:var(--muted);margin-bottom:.3rem;display:flex;align-items:center;gap:.4rem"><span style="width:4px;height:4px;border-radius:50%;background:var(--muted);flex-shrink:0"></span>${i}</div>`).join('')}
      </div>`).join('')}
    </div>
  </div>
  <div class="card" style="background:linear-gradient(135deg,rgba(255,184,0,.08),rgba(233,30,140,.05));border-color:rgba(255,184,0,.2)">
    <div style="display:flex;align-items:center;gap:1rem">
      <div style="width:44px;height:44px;border-radius:12px;background:linear-gradient(135deg,var(--gold),var(--pink));display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0">◈</div>
      <div>
        <div style="font-weight:700;color:var(--text);margin-bottom:.2rem">On-Chain Governance</div>
        <div style="font-size:12px;color:var(--muted)">Every SCOM holder gets a vote. The agent fleet is governed by the community — from model selection to treasury spending.</div>
        <div style="display:flex;gap:.5rem;margin-top:.6rem">
          <span style="padding:.2rem .6rem;background:var(--card);border:1px solid var(--border);border-radius:6px;font-size:11px;color:var(--muted)">1 SCOM = 1 Vote</span>
          <span style="padding:.2rem .6rem;background:var(--card);border:1px solid var(--border);border-radius:6px;font-size:11px;color:var(--muted)">Snapshot voting</span>
          <span style="padding:.2rem .6rem;background:var(--card);border:1px solid var(--border);border-radius:6px;font-size:11px;color:var(--muted)">Time-locked</span>
        </div>
      </div>
    </div>
  </div>`;
}

/* ━━━ WEB3 SCHOOL ━━━ */
function renderWeb3School() {
    const el = document.getElementById('schoolBody');
    if (!el) return;
    const done = school.length;
    const pct = Math.round(done / MODULES.length * 100);
    el.innerHTML = `
  <div class="card mb-6" style="background:linear-gradient(135deg,rgba(124,58,237,.08),rgba(233,30,140,.05));border-color:rgba(233,30,140,.2);overflow:hidden;position:relative">
    <div style="position:absolute;top:0;left:0;right:0;height:4px;background:var(--border)"><div style="height:100%;background:linear-gradient(90deg,var(--pink),var(--gold));width:${pct}%;transition:width 1s ease"></div></div>
    <div style="display:flex;align-items:center;gap:1.25rem;padding-top:.5rem">
      <div style="width:52px;height:52px;border-radius:14px;background:linear-gradient(135deg,var(--pink),var(--gold));display:flex;align-items:center;justify-content:center;font-size:22px">🎓</div>
      <div style="flex:1">
        <div style="display:flex;justify-content:space-between;margin-bottom:.4rem"><span style="font-weight:700;color:var(--text)">Your Journey</span><span style="font-weight:800;color:var(--pink)">${pct}%</span></div>
        <div style="font-size:12px;color:var(--muted)">${done}/${MODULES.length} modules complete</div>
        ${done === MODULES.length ? '<div style="font-size:12px;color:var(--success);font-weight:600;margin-top:.3rem">🎉 Congratulations! TradeDesk & Community unlocked.</div>' : ''}
      </div>
    </div>
  </div>
  ${MODULES.map((m, i) => {
        const isDone = school.includes(m.id);
        const isNext = !isDone && i === done;
        const isLocked = !isDone && !isNext;
        return `<div class="module-card ${isDone ? 'done' : isNext ? 'next' : isLocked ? 'locked' : ''}" onclick="${isNext ? `completeModule(${m.id})` : isLocked ? `showToast('Complete module ${i} first')` : ''}">
      <div style="display:flex;align-items:center;gap:1rem">
        <div class="module-num" style="background:${isDone ? 'var(--success)' : isNext ? 'var(--pink)' : 'var(--border)'};color:${isDone || isNext ? '#fff' : 'var(--muted)'}">
          ${isDone ? '✓' : m.ico}
        </div>
        <div style="flex:1">
          <div style="display:flex;align-items:center;gap:.5rem;margin-bottom:.2rem">
            <span style="font-size:11px;color:var(--muted)">Module ${m.id}</span>
            ${isDone ? '<span class="badge badge-live">Complete</span>' : isNext ? '<span class="badge badge-pink">Next Up</span>' : ''}
          </div>
          <div style="font-weight:700;font-size:13px;color:var(--text)">${m.title}</div>
          <div style="font-size:11px;color:var(--muted);margin-top:.2rem">${m.desc}</div>
        </div>
        <div style="font-size:11px;color:var(--muted);white-space:nowrap">${m.dur}</div>
      </div>
      ${isNext ? `<div style="margin-top:.85rem"><button class="tb-btn primary" onclick="event.stopPropagation();completeModule(${m.id})">▶ Complete Module</button><span style="font-size:11px;color:var(--muted);margin-left:.75rem">Click to mark complete</span></div>` : ''}
    </div>`;
    }).join('')}`;
}

function completeModule(id) {
    if (!school.includes(id)) { school.push(id); localStorage.setItem('sc_school', JSON.stringify(school)); }
    renderWeb3School();
    if (school.length === MODULES.length) showToast('🎓 Web3 School complete! TradeDesk & Community unlocked.');
    else showToast(`Module ${id} complete! ${MODULES.length - school.length} remaining.`);
}

/* ━━━ SOCIAL MEDIA ━━━ */
function renderSocialMedia(tab) {
    activeSocialTab = tab;
    document.querySelectorAll('.sm-tab').forEach(t => t.classList.remove('active'));
    const activeTab = document.querySelector(`.sm-tab[data-tab="${tab}"]`);
    if (activeTab) activeTab.classList.add('active');
    const el = document.getElementById('smBody');
    if (!el) return;
    const platIco = { twitter: '𝕏', farcaster: '⬡', lens: '◉' };
    const platColor = { twitter: 'rgba(0,0,0,.85)', farcaster: '#8b5cf6', lens: 'var(--pink)' };
    if (tab === 'scheduled') {
        el.innerHTML = SOCIAL_POSTS.map(p => `<div class="post-card">
      <div style="display:flex;align-items:flex-start;gap:.75rem">
        <div style="width:38px;height:38px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:16px;background:rgba(0,0,0,.05);flex-shrink:0;color:${platColor[p.platform]}">${platIco[p.platform]}</div>
        <div style="flex:1">
          <div style="display:flex;align-items:center;gap:.5rem;margin-bottom:.4rem">
            <span style="font-weight:600;font-size:12px;color:var(--text)">${p.handle}</span>
            <span class="badge ${p.status === 'scheduled' ? 'badge-live' : 'badge-progress'}">${p.status}</span>
            <span style="font-size:11px;color:var(--muted)">via ${p.source}</span>
          </div>
          <p style="font-size:12px;color:var(--text);line-height:1.6;margin-bottom:.5rem">${p.content}</p>
          <div style="font-size:10px;color:var(--muted)">🕒 ${p.scheduled}</div>
        </div>
        <div style="display:flex;gap:.3rem;flex-shrink:0">
          <button class="tb-btn" style="font-size:10px;padding:.2rem .55rem" onclick="showToast('Edit post flow')">Edit</button>
          <button class="tb-btn" style="font-size:10px;padding:.2rem .55rem;border-color:var(--danger);color:var(--danger)" onclick="showToast('Post deleted')">×</button>
        </div>
      </div>
    </div>`).join('');
    } else {
        const templates = [
            { ico: '📰', name: 'Article Announcement', desc: 'Share a new article from NewsDesk', plats: ['twitter', 'farcaster'] },
            { ico: '🏆', name: 'Milestone Update', desc: 'Celebrate project achievements', plats: ['twitter'] },
            { ico: '📊', name: 'Weekly Digest', desc: 'Weekly summary of all agent activity', plats: ['twitter', 'lens'] },
            { ico: '⚡', name: 'Quick Update', desc: 'Short status update, under 280 chars', plats: ['twitter', 'farcaster', 'lens'] }
        ];
        el.innerHTML = `<div class="grid2">${templates.map(t => `<div class="template-card" onclick="showToast('Template selected: ${t.name}')">
      <div style="font-size:1.5rem;margin-bottom:.5rem">${t.ico}</div>
      <div style="font-weight:700;font-size:13px;color:var(--text);margin-bottom:.3rem">${t.name}</div>
      <div style="font-size:12px;color:var(--muted);margin-bottom:.75rem">${t.desc}</div>
      <div style="display:flex;gap:.4rem">${t.plats.map(p => `<span style="font-size:10px;padding:.2rem .55rem;border-radius:20px;background:rgba(0,0,0,.06);color:var(--muted)">${p}</span>`).join('')}</div>
    </div>`).join('')}</div>`;
    }
}

/* ━━━ ABOUT PAGE ━━━ */
function renderAbout() {
    const el = document.getElementById('aboutBody');
    if (!el || el.children.length > 0) return;
    el.innerHTML = `
  <div style="background:linear-gradient(135deg,var(--navy),#1a0a2e);padding:2.5rem 2rem;text-align:center;color:#fff">
    <h2 style="font-size:1.8rem;font-weight:800;margin-bottom:.5rem">Built from the Ground Up<br>Since <span style="color:var(--gold)">2013</span></h2>
    <p style="color:rgba(255,255,255,.55);max-width:520px;margin:0 auto .75rem;font-size:.85rem;line-height:1.6">SUPERCOMPUTE emerged from Occupy LA and Bitcoin's earliest days — a liberation technology platform for at-risk and underserved communities.</p>
    <div style="display:flex;gap:.5rem;justify-content:center;flex-wrap:wrap"><span class="badge badge-cyan">supercompute.eth</span><span class="badge badge-cyan">Base Chain</span><span class="badge badge-pink">1 Human + 13 Agents</span></div>
  </div>
  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:1rem;padding:2rem 1.5rem">
    ${[['◎', 'Education', 'Web3 School, credential NFTs, and community-first learning paths on Base.'],
        ['◈', 'Consulting', 'DeFi onboarding, agent automation, ReFi strategy, and protocol deep dives.'],
        ['◧', 'Community', 'Building in public. Guild.xyz roles. 21 members and growing.'],
        ['◑', 'Infrastructure', 'Cloudflare-only stack. OpenClaw automation. Sovereign by design.']].map(([i, t, d]) => `<div class="card reveal" style="text-align:center"><div style="font-size:1.75rem;margin-bottom:.6rem">${i}</div><h4 style="font-weight:700;color:var(--text);margin-bottom:.3rem">${t}</h4><p style="font-size:.8rem;color:var(--muted);line-height:1.5">${d}</p></div>`).join('')}
  </div>
  <div style="max-width:640px;margin:0 auto;padding:0 1.5rem 2rem">
    <h3 style="font-size:1rem;font-weight:700;color:var(--text);margin-bottom:1.25rem;text-align:center">The Story</h3>
    ${[['2013', 'Founded at Occupy LA', 'Born from financial sovereignty activism and early Bitcoin community organizing. The thesis: technology can route around gatekeepers.'],
        ['2025', 'Cloudflare-Only Pivot', 'Workers, D1, R2, Vibes SDK. Supabase and Vercel ruled out. Full sovereignty stack deployed in 30 days.'],
        ['2026', 'Phase 1 Launch', 'Agent fleet live. NewsDesk launching. 13 agents. 1 human. Building in public on Base.']].map(([yr, title, desc]) => `<div style="display:flex;gap:.9rem;margin-bottom:1.25rem">
      <div style="display:flex;flex-direction:column;align-items:center">
        <div style="width:10px;height:10px;border-radius:50%;background:var(--pink);margin-top:3px;flex-shrink:0"></div>
        <div style="width:2px;flex:1;background:var(--border);margin:.3rem 0"></div>
      </div>
      <div><div style="font-size:10px;font-weight:700;color:var(--pink);margin-bottom:.15rem">${yr}</div><div style="font-size:.85rem;font-weight:700;color:var(--text);margin-bottom:.15rem">${title}</div><div style="font-size:.8rem;color:var(--muted);line-height:1.5">${desc}</div></div>
    </div>`).join('')}
  </div>`;
    setTimeout(() => {
        const obs = new IntersectionObserver(entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } }), { threshold: .1 });
        document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
    }, 50);
}

/* ━━━ DASHBOARD ━━━ */
const DASH_CONTENT = {
    overview: `<div class="grid4 mb-6">${[['Community', '21', '+3 this week', 'up'], ['Active Agents', '13', 'All systems go', 'up'], ['Linear Tickets', '9', 'MOL-294–302', 'neu'], ['Revenue MTD', '$1k', 'WordWatcher', 'up']].map(([l, v, s, sv]) => `<div class="stat-card"><div class="stat-label">${l}</div><div class="stat-val">${v}</div><div class="stat-sub s-${sv}">${s}</div></div>`).join('')}</div>
  <div class="grid2-3"><div class="card"><div class="section-title">Agent Activity (24h)</div>${[['OpenClaw', '#3b82f6', 85, '12 tasks'], ['QUANTA', 'var(--pink)', 60, '7 articles'], ['KNIGHT', 'var(--gold)', 20, 'Observer'], ['Claude Desktop', 'var(--cyan)', 45, '4 tasks']].map(([n, c, w, t]) => `<div style="display:flex;align-items:center;gap:.75rem;font-size:12px;margin-bottom:.5rem"><span style="font-weight:600;min-width:100px;color:var(--text)">${n}</span><div style="flex:1;height:6px;background:var(--border);border-radius:3px;overflow:hidden"><div style="height:100%;width:${w}%;background:${c};border-radius:3px"></div></div><span style="color:var(--muted);min-width:60px;text-align:right">${t}</span></div>`).join('')}</div>
  <div class="card"><div class="section-title">Stack Health</div>${[['CF Workers', 'live'], ['D1 Database', 'live'], ['Sanity CMS', 'live'], ['Virtuals', 'progress'], ['Linear MCP', 'live']].map(([s, b]) => `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.45rem;font-size:12px"><span>${s}</span><span class="badge badge-${b}">${b === 'live' ? 'OK' : b === 'progress' ? 'Pending' : 'Down'}</span></div>`).join('')}</div></div>`,
    users: `<div class="card"><div class="section-title">User Management</div><table><thead><tr><th>User</th><th>Role</th><th>Email</th><th>Joined</th><th>Actions</th></tr></thead><tbody>
    <tr><td><strong>Orami</strong></td><td><span class="badge badge-admin">Admin</span></td><td>service@supercompute.io</td><td>2013</td><td><button class="tb-btn" style="font-size:10px;padding:.15rem .5rem" onclick="showToast('Edit user: Orami')">Edit</button></td></tr>
    <tr><td>QuantaS.Molt</td><td><span class="badge badge-pink">Agent</span></td><td>QuantaS.Molt@supercompute.io</td><td>2025</td><td><button class="tb-btn" style="font-size:10px;padding:.15rem .5rem" onclick="showToast('Edit user')">Edit</button></td></tr>
    <tr><td>Mario Jefferson</td><td><span class="badge badge-cyan">Contributor</span></td><td>Mario.Jefferson@supercompute.io</td><td>2025</td><td><button class="tb-btn" style="font-size:10px;padding:.15rem .5rem" onclick="showToast('Edit user')">Edit</button></td></tr>
    <tr><td>Community (18)</td><td><span class="badge badge-soon">Member</span></td><td>—</td><td>Various</td><td><button class="tb-btn" style="font-size:10px;padding:.15rem .5rem" onclick="showToast('Bulk edit members')">Bulk Edit</button></td></tr>
  </tbody></table></div>`,
    data: `<div class="card"><div class="section-title">D1 Database Tables</div><div class="grid4">${['users', 'articles', 'projects', 'agents', 'tokens', 'alerts', 'sessions', 'nft_credentials', 'positions', 'portfolio', 'lessons', 'agent_logs'].map(t => `<div style="background:var(--bg);border-radius:8px;padding:.85rem;border:1px solid var(--border);cursor:pointer" onclick="showToast('Exploring table: ${t}')"><div style="font-weight:700;font-size:11px;color:var(--text);font-family:monospace;margin-bottom:.3rem">${t}</div><div style="font-size:10px;color:var(--muted)">Click to explore</div></div>`).join('')}</div></div>`,
    analytics: `<div class="card mb-4"><div class="section-title">Platform Analytics · March 2026</div><div class="grid4">${[['Page Views', '2,104'], ['Unique Visitors', '847'], ['Agent Tasks', '312'], ['Calendly Clicks', '23']].map(([l, v]) => `<div style="background:var(--bg);border-radius:8px;padding:.85rem"><div style="font-size:10px;color:var(--muted);margin-bottom:.25rem">${l}</div><div style="font-size:1.3rem;font-weight:800;color:var(--text)">${v}</div></div>`).join('')}</div></div>`,
    agents: `<div class="card"><div class="section-title">Agent Fleet Management</div>${[{ n: 'OpenClaw', r: 'Browser automation & primary operator', s: 'Active', tag: 'Infrastructure', cls: 's-active', t: 12 }, { n: 'QUANTA / QuantaS', r: 'NewsDesk intelligence · Virtuals Protocol', s: 'Active', tag: 'NewsDesk', cls: 's-active', t: 7 }, { n: 'KNIGHT', r: 'TradeDesk · Conway Terminal · Polymarket', s: 'Observer', tag: 'TradeDesk', cls: 's-idle', t: 0 }, { n: 'Claude Desktop', r: 'Strategic command · Linear MOLT', s: 'Command', tag: 'Command', cls: 's-dev', t: 4 }].map(a => `<div style="background:var(--bg);border-radius:10px;padding:1rem;border:1px solid var(--border);display:flex;align-items:center;gap:.75rem;margin-bottom:.5rem"><div style="display:flex;align-items:center;gap:.4rem;min-width:80px"><span class="status-dot ${a.cls}"></span><span style="font-size:10px;font-weight:600;color:var(--muted)">${a.s}</span></div><div style="flex:1"><div style="font-weight:700;font-size:13px;color:var(--text);margin-bottom:.2rem">${a.n}</div><div style="font-size:11px;color:var(--muted)">${a.r}</div></div><span class="tag">${a.tag}</span><div style="font-size:11px;color:var(--muted);min-width:60px;text-align:right">${a.t} tasks/day</div><button class="tb-btn" style="font-size:10px;padding:.2rem .6rem" onclick="showToast('Agent config: ${a.n}')">Config</button></div>`).join('')}</div>`,
    automations: `<div class="card"><div class="section-title">Scheduled Automations</div><table><thead><tr><th>Task</th><th>Agent</th><th>Schedule</th><th>Last Run</th><th>Status</th></tr></thead><tbody>
    <tr><td>Post to X + Lens</td><td>OpenClaw</td><td>Daily 9am PT</td><td>Today</td><td><span class="badge badge-live">Active</span></td></tr>
    <tr><td>Linear ticket sync</td><td>Claude Desktop</td><td>Every 2h</td><td>2h ago</td><td><span class="badge badge-live">Active</span></td></tr>
    <tr><td>Market signal scan</td><td>QUANTA</td><td>Hourly</td><td>55m ago</td><td><span class="badge badge-live">Active</span></td></tr>
    <tr><td>CDP health check</td><td>KNIGHT</td><td>Every 6h</td><td>3h ago</td><td><span class="badge badge-progress">Observer</span></td></tr>
    <tr><td>NFT trait mint check</td><td>QUANTA</td><td>Weekly</td><td>Mar 24</td><td><span class="badge badge-live">Active</span></td></tr>
  </tbody></table></div>`,
    logs: `<div class="card"><div class="section-title">Runtime Logs (last 24h)</div><div style="background:#0A0E1A;border-radius:8px;padding:1rem;font-family:monospace;font-size:11px;color:rgba(255,255,255,.7);max-height:340px;overflow-y:auto;line-height:1.75">
    <div><span style="color:#4ade80">[2026-04-25 14:23:11]</span> <span style="color:var(--cyan)">OpenClaw</span> → X post scheduled: NewsDesk launch</div>
    <div><span style="color:#4ade80">[2026-04-25 13:55:03]</span> <span style="color:var(--cyan)">QUANTA</span> → Signal scan complete. 3 flagged articles</div>
    <div><span style="color:#4ade80">[2026-04-25 12:00:00]</span> <span style="color:rgba(255,255,255,.4)">CF Workers</span> → Health check passed. Latency: 48ms</div>
    <div><span style="color:#4ade80">[2026-04-25 11:34:22]</span> <span style="color:var(--gold)">Claude Desktop</span> → Linear sync: 9 open tickets reviewed</div>
    <div><span style="color:#4ade80">[2026-04-25 10:12:08]</span> <span style="color:var(--cyan)">KNIGHT</span> → CDP observer check: positions healthy</div>
    <div><span style="color:#4ade80">[2026-04-25 09:00:01]</span> <span style="color:rgba(255,255,255,.4)">Scheduler</span> → Daily automations triggered (5 tasks)</div>
    <div><span style="color:var(--gold)">[2026-04-25 08:45:12]</span> <span style="color:rgba(255,255,255,.4)">Virtuals</span> → $QUANTA verification: still pending</div>
    <div><span style="color:#4ade80">[2026-04-24 23:59:59]</span> <span style="color:rgba(255,255,255,.4)">System</span> → Nightly memory sync complete</div>
  </div></div>`,
    api: `<div class="card"><div class="section-title">API Reference · Cloudflare Workers</div>${[{ m: 'GET', p: '/api/newsdesk/articles', d: 'List published articles' }, { m: 'POST', p: '/api/newsdesk/articles', d: 'Create article (Agent auth)' }, { m: 'GET', p: '/api/tradedesk/portfolio', d: 'Get portfolio summary' }, { m: 'POST', p: '/api/tradedesk/positions', d: 'Log new position (KNIGHT)' }, { m: 'GET', p: '/api/agents/status', d: 'Agent fleet status' }, { m: 'POST', p: '/api/auth/siwe', d: 'Sign-In with Ethereum' }, { m: 'GET', p: '/health', d: 'API health check' }].map(e => `<div style="display:flex;align-items:center;gap:.75rem;padding:.6rem;background:var(--bg);border-radius:6px;margin-bottom:.4rem;font-size:11px"><span style="font-family:monospace;padding:.15rem .4rem;border-radius:4px;font-size:10px;font-weight:700;min-width:38px;text-align:center;${e.m === 'GET' ? 'background:rgba(22,163,74,.1);color:var(--success)' : 'background:rgba(233,30,140,.1);color:var(--pink)'}">${e.m}</span><span style="font-family:monospace;font-weight:600;color:var(--text);min-width:220px">${e.p}</span><span style="color:var(--muted)">${e.d}</span></div>`).join('')}</div>`,
    settings: `<div class="card" style="max-width:580px"><div class="section-title">General Settings</div><div class="form-group"><label class="form-label">Platform Name</label><input class="form-input" value="SUPERCOMPUTE"/></div><div class="form-group"><label class="form-label">Domain</label><input class="form-input" value="supercompute.io"/></div><div class="form-group"><label class="form-label">ENS</label><input class="form-input" value="supercompute.eth"/></div><div class="form-group"><label class="form-label">Chain</label><select class="form-select"><option>Base (Mainnet)</option><option>Base Sepolia</option></select></div><div class="form-group"><label class="form-label">Phase</label><select class="form-select"><option>Phase 1 — Building in Public</option><option>Phase 2 — Launch</option></select></div><div style="padding-top:.75rem;border-top:1px solid var(--border)"><button class="tb-btn primary" onclick="showToast('✓ Settings saved')">Save Settings</button></div></div>`,
    secrets: `<div class="card"><div class="section-title">Environment Secrets (Cloudflare)</div>${[['SANITY_API_TOKEN', '••••••••••••••••••••••••'], ['VIRTUALS_API_KEY', '••••••••••••••••'], ['LINEAR_API_KEY', 'lin_api_••••••••••••'], ['CALENDLY_TOKEN', '••••••••••••••••'], ['JWT_SECRET', '••••••••••••••••••••••••'], ['QUANTA_API_KEY', 'sk-••••••••••••••••••'], ['KNIGHT_API_KEY', 'sk-••••••••••••••••••']].map(([k, h]) => `<div style="display:flex;align-items:center;gap:.75rem;padding:.65rem;background:var(--bg);border-radius:6px;margin-bottom:.4rem"><span style="font-family:monospace;font-size:11px;font-weight:700;color:var(--text);min-width:180px">${k}</span><span style="font-family:monospace;font-size:11px;color:var(--muted);flex:1">${h}</span><button class="tb-btn" style="font-size:10px;padding:.15rem .5rem" onclick="showToast('Reveal requires re-auth')">Reveal</button><button class="tb-btn" style="font-size:10px;padding:.15rem .5rem" onclick="showToast('Secret updated')">Edit</button></div>`).join('')}</div>`,
    domains: `<div class="card"><div class="section-title">Custom Domains</div>${[['supercompute.io', 'Active', 'CF Workers'], ['supercompute.eth', 'Active', 'ENS'], ['newsdesk.supercompute.io', 'Pending', 'Sub-domain']].map(([d, s, t]) => `<div style="display:flex;align-items:center;gap:.75rem;padding:.75rem;background:var(--bg);border-radius:8px;border:1px solid var(--border);margin-bottom:.4rem"><span style="font-weight:600;font-size:12px;flex:1;font-family:monospace">${d}</span><span class="badge ${s === 'Active' ? 'badge-live' : 'badge-progress'}">${s}</span><span style="font-size:10px;color:var(--muted)">${t}</span></div>`).join('')}<button class="tb-btn" style="margin-top:.75rem" onclick="showToast('Add domain flow')">+ Add Domain</button></div>`,
    integrations: `<div class="card"><div class="section-title">Third-Party Integrations</div>${[{ n: 'Linear (MOLT)', s: 'Connected', i: '◧', d: 'MCP active — Claude Desktop + agent ops' }, { n: 'Sanity CMS', s: 'Connected', i: '◈', d: 'Project 2i3obqvj · 5 articles' }, { n: 'Calendly', s: 'Connected', i: '◑', d: 'calendly.com/ora_mi · 4 services live' }, { n: 'Virtuals Protocol', s: 'Pending', i: '◉', d: '$QUANTA pending verification' }, { n: 'Guild.xyz', s: 'Pending', i: '◎', d: '7 roles defined · NFT gating pending' }, { n: 'Farcaster', s: 'Planned', i: '◐', d: 'OpenClaw connection queued' }].map(i => `<div style="display:flex;align-items:center;gap:.75rem;padding:.75rem;background:var(--bg);border-radius:8px;border:1px solid var(--border);margin-bottom:.4rem"><span style="font-size:1.2rem;width:28px;text-align:center">${i.i}</span><div style="flex:1"><div style="font-weight:700;font-size:12px;color:var(--text)">${i.n}</div><div style="font-size:10px;color:var(--muted)">${i.d}</div></div><span class="badge ${i.s === 'Connected' ? 'badge-live' : i.s === 'Pending' ? 'badge-progress' : 'badge-soon'}">${i.s}</span></div>`).join('')}</div>`,
    security: `<div class="card" style="max-width:580px"><div class="section-title">Security Configuration</div>${[{ l: 'SIWE Authentication', s: 'Auth layer', st: 'Active', n: 'MOL-240 ✓' }, { l: 'JWT Auth (API)', s: 'Worker-side validation', st: 'In Progress', n: 'MOL-94 open' }, { l: 'RBAC', s: 'Role-based access control', st: 'In Progress', n: 'MOL-95 open' }, { l: 'AuthContext Security Fix', s: 'isAuthenticated hardcoded — Sprint 1', st: 'Flagged', n: 'Priority fix' }, { l: 'Cloudflare WAF', s: 'Web Application Firewall', st: 'Active', n: 'Default rules' }, { l: 'YubiKey 2FA', s: 'Hardware key on admin accounts', st: 'Active', n: 'Since 2023' }, { l: 'Ledger Cold Storage', s: 'Treasury assets offline', st: 'Active', n: '$0 hot wallet' }].map(s => `<div style="padding:.75rem;background:var(--bg);border-radius:8px;border:1px solid var(--border);display:flex;align-items:center;gap:.75rem;margin-bottom:.4rem"><div style="flex:1"><div style="font-weight:700;font-size:12px;color:var(--text)">${s.l}</div><div style="font-size:10px;color:var(--muted)">${s.s}</div></div><span class="badge ${s.st === 'Active' ? 'badge-live' : s.st === 'Flagged' ? 'badge-soon' : 'badge-progress'}">${s.st}</span><span style="font-size:10px;color:var(--muted);min-width:90px;text-align:right">${s.n}</span></div>`).join('')}</div>`,
    social: `<div class="card"><div class="section-title">Social Content Queue (OpenClaw)</div><table><thead><tr><th>Title</th><th>Platform</th><th>Scheduled</th><th>Agent</th><th>Status</th></tr></thead><tbody>
    <tr><td>NewsDesk Launch Announcement</td><td>X + Lens</td><td>Apr 1, 2026</td><td>OpenClaw</td><td><span class="badge badge-progress">Queued</span></td></tr>
    <tr><td>$SCOM Token Introduction Thread</td><td>X</td><td>Apr 5, 2026</td><td>OpenClaw</td><td><span class="badge badge-progress">Queued</span></td></tr>
    <tr><td>Web3 School Beta Invite</td><td>Lens</td><td>Apr 10, 2026</td><td>OpenClaw</td><td><span class="badge badge-progress">Queued</span></td></tr>
    <tr><td>Agent Fleet Dispatch #1</td><td>X + Lens + Farcaster</td><td>Apr 15, 2026</td><td>QUANTA</td><td><span class="badge badge-soon">Draft</span></td></tr>
  </tbody></table></div>`
};

function renderDash(tab) {
    activeDashTab = tab;
    document.querySelectorAll('.dash-tab').forEach(t => t.classList.remove('active'));
    const activeEl = document.querySelector(`.dash-tab[data-tab="${tab}"]`);
    if (activeEl) activeEl.classList.add('active');
    const el = document.getElementById('dashBody');
    if (el) el.innerHTML = DASH_CONTENT[tab] || `<div style="color:var(--muted);text-align:center;padding:3rem;font-size:.85rem">Panel coming soon.</div>`;
}

/* ━━━ AGENT CHAT ━━━ */
function selectAgent(id) {
    activeAgent = id;
    document.querySelectorAll('.agent-chip').forEach(c => c.classList.remove('sel'));
    const chip = document.getElementById('chip-' + id);
    if (chip) chip.classList.add('sel');
    const m = AGENT_META[id];
    document.getElementById('activeAgentLabel').textContent = m.label;
    document.getElementById('chatInput').placeholder = `Message ${m.label}...`;
    appendChat('ai', id, `${m.label} online. Ready for ${m.sub} tasks. How can I help?`);
}

function appendChat(role, agentId, text) {
    const m = AGENT_META[agentId] || AGENT_META.openclaw;
    const div = document.getElementById('chatMessages');
    if (!div) return;
    const el = document.createElement('div');
    el.className = 'chat-msg ' + (role === 'ai' ? 'ai' : 'user');
    if (role === 'ai') {
        el.innerHTML = `<div class="chat-av ai-av">${m.div}</div><div><div style="font-size:10px;color:var(--muted);margin-bottom:.25rem">${m.label} · ${m.sub}</div><div class="chat-bubble">${text}</div></div>`;
    } else {
        el.innerHTML = `<div class="chat-av user-av">O</div><div><div class="chat-bubble">${text}</div></div>`;
    }
    div.appendChild(el);
    div.scrollTop = div.scrollHeight;
}

async function sendChat() {
    const inp = document.getElementById('chatInput');
    const msg = inp.value.trim();
    if (!msg) return;
    appendChat('user', activeAgent, msg);
    inp.value = '';
    // Show typing
    const typingEl = document.createElement('div');
    typingEl.className = 'chat-msg ai';
    typingEl.id = 'typing';
    const m = AGENT_META[activeAgent];
    typingEl.innerHTML = `<div class="chat-av ai-av">${m.div}</div><div><div class="chat-bubble" style="color:var(--muted)">●&nbsp;&nbsp;thinking…</div></div>`;
    document.getElementById('chatMessages').appendChild(typingEl);
    document.getElementById('chatMessages').scrollTop = 9999;
    try {
        const reply = await window.claude.complete({
            messages: [{ role: 'user', content: `[System: ${AGENT_META[activeAgent].sys}]\n\nUser message: ${msg}` }]
        });
        typingEl.remove();
        appendChat('ai', activeAgent, reply);
    } catch (e) {
        typingEl.remove();
        const fallback = AGENT_RESPONSES[activeAgent];
        appendChat('ai', activeAgent, fallback[Math.floor(Math.random() * fallback.length)]);
    }
}

/* ━━━ AI ARTICLE ASSIST ━━━ */
async function aiAssist(type) {
    const title = document.getElementById('articleTitle')?.value || '';
    const content = document.getElementById('articleContent')?.value || '';
    const prompts = {
        headline: `Generate 3 compelling headlines for a Web3 article. Current draft title: "${title || 'Untitled'}". Return as a numbered list.`,
        excerpt: `Write a compelling 2-sentence excerpt for this article: "${title}". Content preview: "${content.slice(0, 300)}"`,
        seo: `Generate 5 SEO tags for a Web3 article titled "${title}". Return as comma-separated values.`
    };
    showToast('✨ Quanta S generating...');
    try {
        const result = await window.claude.complete(prompts[type]);
        const field = document.getElementById('aiResult');
        if (field) { field.style.display = 'block'; field.textContent = result; }
        else {
            const area = document.getElementById('articleContent');
            if (area && type === 'excerpt') area.value = result;
        }
        showToast('✓ AI assist complete');
    } catch (e) { showToast('AI assist unavailable'); }
}

/* ━━━ STAKING ━━━ */
function setStakeTab(t) {
    ['stake', 'unstake', 'rewards'].forEach(tab => {
        const btn = document.getElementById('st-tab-' + tab);
        const pane = document.getElementById(tab + '-pane');
        if (btn) btn.classList.toggle('active', tab === t);
        if (pane) pane.style.display = tab === t ? 'block' : 'none';
    });
}
function updateYield() {
    const amt = parseFloat(document.getElementById('stakeAmt')?.value) || 0;
    const apy = document.getElementById('yApy');
    const daily = document.getElementById('yDaily');
    const annual = document.getElementById('yAnnual');
    if (apy) apy.textContent = amt ? '~12% est.' : '—';
    if (daily) daily.textContent = amt ? (amt * .12 / 365).toFixed(4) + ' $SCOM' : '—';
    if (annual) annual.textContent = amt ? (amt * .12).toFixed(2) + ' $SCOM' : '—';
}

/* ━━━ BLOG NEWSDESK (admin) ━━━ */
function renderNewsDeskCMS() {
    const el = document.getElementById('newsdeskQueue');
    if (!el || el.children.length > 0) return;
    const catStyle = { intelligence: 'background:rgba(233,30,140,.1);color:var(--pink)', sovereignty: 'background:rgba(0,212,255,.1);color:var(--cyan2)', dispatch: 'background:rgba(255,184,0,.1);color:var(--gold2)', signal: 'background:rgba(99,102,241,.1);color:#6366f1' };
    el.innerHTML = ARTICLES.map(a => `<div class="article-row" onclick="authGate('createarticle',navItem('createarticle'),true)">
    <span class="article-cat" style="${catStyle[a.cat]}">${a.cat.slice(0, 4)}</span>
    <div style="flex:1"><div style="font-weight:600;font-size:12px;color:var(--text)">${a.icon} ${a.title}</div><div style="font-size:10px;color:var(--muted);margin-top:.1rem">${a.date} · ${a.author}</div></div>
    <span class="badge ${a.live ? 'badge-live' : 'badge-progress'}">${a.live ? 'Published' : 'Draft'}</span>
    <button class="tb-btn" style="font-size:10px;padding:.2rem .6rem" onclick="event.stopPropagation();navigate('createarticle',navItem('createarticle'))">Edit</button>
  </div>`).join('');
}

/* ━━━ UTILS ━━━ */
function openCalendly() { window.open('https://calendly.com/ora_mi', '_blank'); }
function copyToClipboard(text) { navigator.clipboard.writeText(text); showToast('✓ Copied to clipboard'); }
function showToast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg; t.classList.add('show');
    clearTimeout(t._to); t._to = setTimeout(() => t.classList.remove('show'), 3000);
}
function animCount(el, target, dur) {
    if (!el) return; let s = null;
    function step(ts) { if (!s) s = ts; const p = Math.min((ts - s) / dur, 1); el.textContent = Math.floor(p * target); if (p < 1) requestAnimationFrame(step); }
    requestAnimationFrame(step);
}

/* ━━━ INIT ━━━ */
window.addEventListener('DOMContentLoaded', () => {
    initTicker();
    renderBlog('all');
    renderPubProjects();
    renderDash('overview');
    // Counters
    const cObs = new IntersectionObserver(entries => { entries.forEach(e => { if (e.isIntersecting) { animCount(document.getElementById('hc-agents'), 13, 1200); animCount(document.getElementById('hc-years'), 13, 1000); cObs.disconnect(); } }); }, { threshold: .3 });
    const hc = document.getElementById('hc-agents');
    if (hc) { const parent = hc.closest('[style*="grid"]'); if (parent) cObs.observe(parent); }
    // Scroll reveal
    const rObs = new IntersectionObserver(entries => { entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); rObs.unobserve(e.target); } }); }, { threshold: .08 });
    document.querySelectorAll('.reveal').forEach(el => rObs.observe(el));
    // Enter to chat
    const ci = document.getElementById('chatInput');
    if (ci) ci.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChat(); } });
});
