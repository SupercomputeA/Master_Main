/* @jsx React.createElement */
/* App UI kit — Terminal Blue (Direction 03 · Terminal Dossier)
 * Mono everywhere. Sidebar = // path rail, topbar = // prompt,
 * cards = sheets, chat = transcript, progress = ASCII fill bar.
 * Token symbol $SCOM is the only place the $ glyph is used.
 */

const NAV_PUBLIC = [
  { id: 'home',       label: 'home' },
  { id: 'about',      label: 'about' },
  { id: 'blog',       label: 'news' },
  { id: 'consulting', label: 'services' },
];
const NAV_MEMBER = [
  { id: 'projects',   label: 'projects' },
  { id: 'staking',    label: 'staking' },
  { id: 'token',      label: 'scom_token' },
  { id: 'assets',     label: 'assets' },
  { id: 'alerts',     label: 'alerts',     badge: { kind: 'num', text: '3' } },
  { id: 'profile',    label: 'profile' },
  { id: 'agentchat',  label: 'agent_chat', badge: { kind: 'num', text: '4' } },
  { id: 'web3school', label: 'school' },
];
const NAV_ADMIN = [
  { id: 'dashboard',  label: 'dashboard',     badge: { kind: 'gold', text: 'A' } },
  { id: 'newsdesk',   label: 'newsdesk_cms',  badge: { kind: 'gold', text: 'A' } },
  { id: 'agentfleet', label: 'agent_fleet',   badge: { kind: 'gold', text: 'A' } },
  { id: 'apiStatus',  label: 'api_status',    badge: { kind: 'gold', text: 'A' } },
];

/* Role identity — shown bottom-left so the operator always knows
 * which surface they're authenticated against. */
const ROLES = {
  admin:     { label: 'admin',     sub: 'full surface · fleet control',     tone: 'gold'  },
  member:    { label: 'member',    sub: 'projects · staking · chat',          tone: 'gold'  },
  student:   { label: 'student',   sub: 'school cohort · 2 of 7 modules',     tone: 'blue'  },
  investor:  { label: 'investor',  sub: 'token holder · staking + reports',   tone: 'gold'  },
  public:    { label: 'public',    sub: 'unauthenticated · read-only',        tone: 'mono'  },
};

function HudFrame() {
  return (
    <React.Fragment>
      <div className="vignette" />
      <div className="hud-corner tl" />
      <div className="hud-corner tr" />
      <div className="hud-corner bl" />
      <div className="hud-corner br" />
    </React.Fragment>
  );
}

function NavItem({ item, active, onClick, signedIn }) {
  const locked = !signedIn && !['home','about','blog','consulting'].includes(item.id);
  const cls = ['nav-item', active ? 'active' : '', locked ? 'locked' : ''].filter(Boolean).join(' ');
  const badge = item.badge
    ? <span className={`nav-badge nb-${item.badge.kind}`}>{item.badge.text}</span>
    : null;
  const lock = locked ? <span className="nav-badge nb-lock">lock</span> : null;
  return (
    <div className={cls} onClick={locked ? undefined : onClick}>
      <span className="arrow">›</span>
      <span>{item.label}</span>
      {badge || lock}
    </div>
  );
}

function Sidebar({ active, onNav, role, signedIn, wallet }) {
  return (
    <nav className="nav">
      <div className="nav-brand">
        <img src="sc-logo.jpg" alt="SC" />
        <div>
          <div className="nav-brand-text">Supercompute</div>
          <div className="nav-brand-sub">phase_1 · base</div>
        </div>
      </div>
      <div className="nav-scroll">
        <div className="nav-section">public</div>
        {NAV_PUBLIC.map(it => (
          <NavItem key={it.id} item={it} active={active === it.id}
                   signedIn={signedIn} onClick={() => onNav(it.id)} />
        ))}
        <div className="nav-div" />
        <div className="nav-section">member</div>
        {NAV_MEMBER.map(it => (
          <NavItem key={it.id} item={it} active={active === it.id}
                   signedIn={signedIn} onClick={() => onNav(it.id)} />
        ))}
        {role === 'admin' && (
          <React.Fragment>
            <div className="nav-div" />
            <div className="nav-section">admin</div>
            {NAV_ADMIN.map(it => (
              <NavItem key={it.id} item={it} active={active === it.id}
                       signedIn={signedIn} onClick={() => onNav(it.id)} />
            ))}
          </React.Fragment>
        )}
      </div>
      <div className="nav-bottom">
        <button className="btn-wallet">
          <span className="prompt">//</span>
          <span>wallet</span>
          <span className="addr">{wallet || '--connect'}</span>
        </button>
        <RoleBadge role={role} signedIn={signedIn} />
      </div>
    </nav>
  );
}

function RoleBadge({ role, signedIn }) {
  const r = signedIn ? (ROLES[role] || ROLES.member) : ROLES.public;
  return (
    <div className={`role-badge tone-${r.tone}`}>
      <div className="role-row">
        <span className="pulse-dot" />
        <span className="role-eyebrow">signed_in_as</span>
      </div>
      <div className="role-name">{r.label}</div>
      <div className="role-sub">{r.sub}</div>
    </div>
  );
}

function Topbar({ path, sub, badge, actions }) {
  return (
    <div className="topbar">
      <div className="tb-prompt">
        <span className="sigil">//</span>
        <span className="path">{path}</span>
        <span className="caret" />
        {sub && <span className="tb-sub">{sub}</span>}
      </div>
      <div className="tb-actions">
        {badge}
        {actions}
      </div>
    </div>
  );
}

function StatTile({ label, value, sub, trend }) {
  return (
    <div className="stat-tile">
      <div className="label">{label}</div>
      <div className="val">{value}</div>
      {sub && <div className={`sub ${trend || ''}`}>{sub}</div>}
    </div>
  );
}

function Dashboard() {
  return (
    <React.Fragment>
      <Topbar
        path={<span className="gold">dashboard</span>}
        sub="admin · phase 1 · base"
        badge={<span className="badge badge-admin">admin</span>}
        actions={<button className="tb-btn primary"><span className="prompt">//</span>new --article</button>}
      />
      <div className="pg-body">
        <h3 className="section-h">platform <span className="dim">--overview</span></h3>
        <div className="grid4" style={{ marginBottom: 32 }}>
          <StatTile label="articles" value="06"     sub="↑ +2 / 7 days" trend="up" />
          <StatTile label="agents"   value="13"     sub="100% uptime" trend="up" />
          <StatTile label="modules"  value="07"     sub="beta · may 2026" />
          <StatTile label="treasury" value="48.2K" sub="USDC · ↑ +3.1% / 30d" trend="up" />
        </div>

        <h3 className="section-h">agents <span className="dim">--active</span></h3>
        <div className="sheet sheet-rows">
          {[
            { n: 'Quanta S',   r: 'NewsDesk',    desc: 'publishing · 6 articles live · queue: 3 drafts',         s: 'active' },
            { n: 'KNIGHT',     r: 'TradeDesk',   desc: 'monitoring · 2 open positions · health factor 2.14',     s: 'active' },
            { n: 'OpenClaw',   r: 'Infra',       desc: 'cross-post queue · 14 scheduled · last run 12m ago',     s: 'active' },
            { n: 'Tutor S',    r: 'School',      desc: '3 modules in review · curriculum lock 87%',              s: 'idle' },
            { n: 'Sentinel',   r: 'OpSec',       desc: 'clean · last scan 3m ago · 0 incidents this quarter',    s: 'active' },
            { n: 'Forge',      r: 'Contracts',   desc: 'dev · staking_v2.sol compiling · base-sepolia',          s: 'dev' },
          ].map(a => (
            <div key={a.n} className="agent-row">
              <span className={`dot ${a.s}`} />
              <div className="body">
                <div className="name">{a.n} <span className="role">· {a.r}</span></div>
                <div className="desc">{a.desc}</div>
              </div>
              <span className={`status status-${a.s}`}>
                {a.s === 'active' ? 'online' : a.s === 'idle' ? 'observer' : 'dev'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </React.Fragment>
  );
}

const ARTICLES = [
  { idx: '06', cat: 'intelligence', title: 'SIWE Auth and the End of Password Logins',          file: 'siwe_auth.md',          date: 'apr 28 2026', read: '7 min' },
  { idx: '05', cat: 'sovereignty',  title: 'Self-Custody at the Edge: Hardware Keys for Operators', file: 'self_custody.md',     date: 'apr 22 2026', read: '9 min' },
  { idx: '04', cat: 'dispatch',     title: 'Phase 1 Dispatch — What Shipped This Week',          file: 'phase1_dispatch.md',    date: 'apr 19 2026', read: '4 min' },
  { idx: '03', cat: 'signal',       title: 'On-Chain Signals: Polymarket vs Prediction Layers',  file: 'onchain_signals.md',    date: 'apr 12 2026', read: '11 min' },
  { idx: '02', cat: 'intelligence', title: 'The Cyborg Agency: 1 Human + 13 Agents',             file: 'cyborg_agency.md',      date: 'apr 04 2026', read: '6 min' },
  { idx: '01', cat: 'sovereignty',  title: 'ENS as Identity for Autonomous Agents',              file: 'ens_identity.md',       date: 'mar 28 2026', read: '8 min' },
];

function NewsDesk() {
  return (
    <React.Fragment>
      <Topbar
        path={<span className="gold">newsdesk</span>}
        sub="curated by Quanta S"
        badge={<span className="badge badge-live">6 live</span>}
        actions={<button className="tb-btn"><span className="prompt">//</span>filter --cat</button>}
      />
      <div className="pg-body">
        <h3 className="section-h">articles <span className="dim">--latest</span></h3>
        <div className="sheet sheet-rows">
          {ARTICLES.map(a => (
            <div key={a.file} className="feed-row">
              <span className="idx">{a.idx}</span>
              <span className={`cat cat-${a.cat}`}>[ {a.cat} ]</span>
              <span className="title">{a.title}<span className="file">· {a.file}</span></span>
              <span className="meta">{a.date} · {a.read}</span>
            </div>
          ))}
        </div>
      </div>
    </React.Fragment>
  );
}

const AGENTS_CHAT = [
  { id: 'quanta',   av: 'QS', name: 'Quanta S',  role: 'NewsDesk' },
  { id: 'knight',   av: 'KN', name: 'KNIGHT',    role: 'TradeDesk' },
  { id: 'openclaw', av: 'OC', name: 'OpenClaw',  role: 'Social' },
  { id: 'tutor',    av: 'TS', name: 'Tutor S',   role: 'School' },
  { id: 'sentinel', av: 'SN', name: 'Sentinel',  role: 'OpSec' },
];

function AgentChat() {
  const [active, setActive] = React.useState('knight');
  const [text, setText] = React.useState('');
  const [msgs, setMsgs] = React.useState([
    { who: 'KNIGHT', t: '14:32', body: 'KNIGHT online. I monitor positions on Base, manage CDP collateral on Spark, and watch Polymarket for asymmetric edges. What do you need?' },
    { who: 'USER',   t: '14:33', body: 'How is the CDP doing?' },
    { who: 'KNIGHT', t: '14:33', body: 'Health factor 2.14 · 0 risk of liquidation. Collateral: 4.2 ETH. Borrowed: 3,200 USDC at 5.4% APR. Want me to refinance to a lower rate?' },
  ]);
  const agent = AGENTS_CHAT.find(a => a.id === active);
  const send = () => {
    if (!text.trim()) return;
    const stamp = new Date().toTimeString().slice(0,5);
    setMsgs([
      ...msgs,
      { who: 'USER', t: stamp, body: text },
      { who: agent.name.toUpperCase(), t: stamp, body: "On it. I'll have a summary in your Alerts panel within the hour." },
    ]);
    setText('');
  };
  return (
    <React.Fragment>
      <Topbar
        path={<span className="gold">agent_chat</span>}
        sub={`session · ${agent.name.toLowerCase()}`}
        badge={<span className="badge badge-claude">claude haiku 4.5</span>}
      />
      <div className="chat-wrap">
        <div className="chat-header">
          <div className="chat-header-label">select --agent</div>
          <div className="chat-agents-row">
            {AGENTS_CHAT.map(a => (
              <button key={a.id}
                className={`agent-chip ${active === a.id ? 'active' : ''}`}
                onClick={() => setActive(a.id)}>
                <span className="av">[{a.av}]</span>{a.name}
              </button>
            ))}
          </div>
        </div>
        <div className="chat-messages">
          {msgs.map((m, i) => {
            const me = m.who === 'USER';
            return (
              <div key={i} className={`chat-block ${me ? 'me' : ''}`}>
                <div className="chat-head">
                  <span className="who-prompt">[</span>
                  {m.who}
                  <span className="who-time">› {m.t}</span>
                  <span className="who-prompt">]</span>
                </div>
                <div className="chat-body">{m.body}</div>
              </div>
            );
          })}
        </div>
        <div className="chat-input-row">
          <span className="gt">›</span>
          <input
            className="chat-input"
            placeholder={`message ${agent.name.toLowerCase()}…`}
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()}
          />
          <button className="chat-send" onClick={send}>
            <span className="prompt">//</span>send
          </button>
        </div>
      </div>
    </React.Fragment>
  );
}

function asciiBar(p) {
  const total = 20;
  const filled = Math.round((p / 100) * total);
  return (
    <span className="prog-ascii">
      <span>{'█'.repeat(filled)}</span>
      <span className="dim">{'░'.repeat(total - filled)}</span>
    </span>
  );
}

function School() {
  const modules = [
    { num: '01', n: 'wallets_and_self_custody.md', desc: 'Hardware keys, seed phrases, recovery.', p: 100 },
    { num: '02', n: 'l1_vs_l2_base.md',            desc: 'Rollups, gas economics, sequencer trust.', p: 100 },
    { num: '03', n: 'defi_primitives.md',          desc: 'AMMs, lending, CDPs.',                   p: 60 },
    { num: '04', n: 'opsec_hardware_keys.md',      desc: 'YubiKey, Ledger, multisig basics.',      p: 25 },
    { num: '05', n: 'agent_automation.md',         desc: 'Building autonomous worker loops.',      p: 0 },
    { num: '06', n: 'refi_strategy.md',            desc: 'Regenerative tokenomics & treasury.',    p: 0 },
    { num: '07', n: 'build_your_own_agent.md',     desc: 'Capstone — ship your first agent.',      p: 0 },
  ];
  return (
    <React.Fragment>
      <Topbar
        path={<span className="gold">school</span>}
        sub="principled web3 education"
        badge={<span className="badge badge-beta">beta</span>}
      />
      <div className="pg-body">
        <div className="school-banner">
          <div>
            <div className="label">your_progress</div>
            <div className="headline">2 of 7 modules <span className="gold">complete</span></div>
            <div className="prog-track"><div className="prog-fill" style={{ width: '28%' }} /></div>
            <div className="note">Complete all 7 modules to mint your on-chain credential and unlock TradeDesk.</div>
          </div>
          <div className="ratio">2<span className="dim">/7</span></div>
        </div>

        <h3 className="section-h">modules <span className="dim">--curriculum</span></h3>
        <div className="sheet sheet-rows">
          {modules.map(m => (
            <div key={m.num} className="module-row">
              <span className="num">{m.num}</span>
              <div>
                <div className="name">{m.n}</div>
                <div className="desc" style={{ fontSize: 11, color: 'var(--mono-blue)', marginTop: 4 }}>{m.desc}</div>
              </div>
              <div className="pct bar-col">{asciiBar(m.p)}</div>
              <div className={`pct ${m.p === 100 ? 'done' : m.p === 0 ? 'locked' : ''}`}>
                {m.p === 100 ? '✓ done' : m.p === 0 ? '─ locked' : `${m.p}%`}
              </div>
            </div>
          ))}
        </div>
      </div>
    </React.Fragment>
  );
}

function AuthOverlay({ onSignIn }) {
  const [tab, setTab] = React.useState('signin');
  return (
    <div className="auth-overlay">
      <div className="auth-card">
        <span className="corner bl" /><span className="corner br" />
        <div className="auth-head">
          <div className="auth-prompt">
            login --supercompute
            <span className="caret" />
          </div>
          <div className="auth-title">authenticate to continue</div>
          <div className="auth-sub">
            Sign in to <span style={{ color: 'var(--cream)' }}>supercompute.io</span> or
            connect your wallet via SIWE to access the member surface.
          </div>
        </div>
        <div className="auth-body">
          <div className="auth-tabs">
            <button
              className={`auth-tab ${tab === 'signin' ? 'active' : ''}`}
              onClick={() => setTab('signin')}>// sign_in</button>
            <button
              className={`auth-tab ${tab === 'signup' ? 'active' : ''}`}
              onClick={() => setTab('signup')}>// sign_up</button>
          </div>
          <input className="auth-input" type="email"    placeholder="email_address" />
          <input className="auth-input" type="password" placeholder="password" />
          <button className="auth-btn" onClick={() => onSignIn('user')}>
            <span className="prompt">//</span>
            {tab === 'signin' ? 'submit' : 'create_account'}
          </button>
          <div className="auth-div">or</div>
          <button className="siwe-btn" onClick={() => onSignIn('user')}>
            <span className="prompt">//</span>siwe --connect_wallet
          </button>
          <div className="auth-demo">
            <button onClick={() => onSignIn('user')}>demo --user</button>
            &nbsp;&nbsp;·&nbsp;&nbsp;
            <button onClick={() => onSignIn('admin')}>demo --admin</button>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, {
  HudFrame, Sidebar, Topbar, RoleBadge, Dashboard, NewsDesk, AgentChat, School, AuthOverlay,
});
