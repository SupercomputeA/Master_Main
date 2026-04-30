// sc-app.jsx — All dashboard pages + App root
const { useState, useEffect, useRef } = React;

/* ── MOCK DATA ── */
const ARTICLES = [
  { id: '1', title: 'Understanding Base Chain: The Future of Ethereum L2', excerpt: 'Base Chain has become the go-to Layer 2 for builders seeking low-cost, fast transactions with full Ethereum compatibility and a growing DeFi ecosystem.', category: 'intelligence', author: 'Quanta S', views: 2847, published_at: Date.now() / 1000 - 7200, icon: '⛓️' },
  { id: '2', title: 'DeFi Security: Protecting Your On-Chain Assets in 2026', excerpt: 'With over $2B lost to exploits in Q1 2026, smart contract security has never been more critical. Here are the protocols we trust.', category: 'sovereignty', author: 'Quanta S', views: 1203, published_at: Date.now() / 1000 - 86400, icon: '🛡️' },
  { id: '3', title: 'KNIGHT Week 1: Paper Trading Performance Report', excerpt: 'KNIGHT logged 47 paper trades in its first operational week, achieving a simulated +2.68% on a $500 practice portfolio with zero security incidents.', category: 'dispatch', author: 'KNIGHT', views: 634, published_at: Date.now() / 1000 - 172800, icon: '📊' },
  { id: '4', title: 'Cloudflare Workers + D1: Building at the Edge', excerpt: 'Our decision to build the Supercompute API on Cloudflare Workers was driven by speed, cost, and zero cold-start latency at the global edge.', category: 'signal', author: 'Quanta S', views: 411, published_at: Date.now() / 1000 - 259200, icon: '🔧' },
  { id: '5', title: 'Web3 Community Building: The Supercompute Playbook', excerpt: 'After 3 years building in Web3, we have developed a systematic approach to community growth that combines human insight with AI-native automation.', category: 'intelligence', author: 'Quanta S', views: 3105, published_at: Date.now() / 1000 - 432000, icon: '🌐' },
];

const PORTFOLIO = { total_value: 8214.50, cash_balance: 2890.00, positions_value: 5324.50, total_pnl: 214.50, total_pnl_percent: 2.68, long_exposure: 3200.00, short_exposure: 2124.50 };
const POSITIONS = [
  { id: '1', asset: 'ETH', type: 'long', entry_price: 1920.00, current_price: 1978.50, size: 1.5, pnl: 87.75, pnl_percent: 3.05 },
  { id: '2', asset: 'CBBTC', type: 'short', entry_price: 62400.00, current_price: 61890.00, size: 0.05, pnl: 25.50, pnl_percent: 0.82 },
  { id: '3', asset: 'USDC', type: 'long', entry_price: 1.00, current_price: 1.00, size: 500, pnl: 0, pnl_percent: 0 },
];

const LESSONS = [
  { id: 1, title: 'What is a Blockchain?', done: true, mins: 8 },
  { id: 2, title: 'Wallets & Private Keys', done: true, mins: 12 },
  { id: 3, title: 'DeFi Fundamentals', done: true, mins: 15 },
  { id: 4, title: 'Base Chain Deep Dive', done: false, mins: 18 },
  { id: 5, title: 'Smart Contract Basics', done: false, mins: 14 },
  { id: 6, title: 'NFTs & Digital Ownership', done: false, mins: 10 },
];

function timeAgo(ts) {
  if (!ts) return 'Draft';
  const d = Math.floor(Date.now() / 1000 - ts);
  if (d < 3600) return `${Math.floor(d / 60)}m ago`;
  if (d < 86400) return `${Math.floor(d / 3600)}h ago`;
  return `${Math.floor(d / 86400)}d ago`;
}

/* ── AUTH OVERLAY ── */
function AuthOverlay({ onAuth }) {
  const [tab, setTab] = useState('signin');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');

  function doDemo(role) {
    onAuth({ role, name: role === 'admin' ? 'Admin User' : 'Member User' });
    window.showToast(`Welcome! Signed in as ${role}`);
  }

  return (
    <div className="auth-overlay">
      <div className="auth-card">
        <div className="auth-logo">SC</div>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1a1a2e', marginBottom: '.3rem' }}>Welcome back</h2>
        <p style={{ fontSize: '.8rem', color: '#6b7280', marginBottom: '1.5rem', lineHeight: 1.5 }}>
          Sign in to SUPERCOMPUTE or connect your wallet to access the platform.
        </p>
        <div className="auth-tabs">
          <button className={`auth-tab${tab === 'signin' ? ' active' : ''}`} onClick={() => setTab('signin')}>Sign In</button>
          <button className={`auth-tab${tab === 'signup' ? ' active' : ''}`} onClick={() => setTab('signup')}>Sign Up</button>
        </div>
        <input className="auth-input" type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} />
        <input className="auth-input" type="password" placeholder="Password" value={pass} onChange={e => setPass(e.target.value)} />
        <button className="auth-btn" onClick={() => doDemo('user')}>{tab === 'signin' ? 'Sign In' : 'Create Account'}</button>
        <div className="auth-div">or</div>
        <button className="siwe-btn" onClick={() => doDemo('user')}>
          <span style={{ fontSize: 14 }}>◎</span> Sign In with Ethereum
        </button>
        <div style={{ marginTop: '1rem', fontSize: 11, color: '#6b7280' }}>
          <button onClick={() => doDemo('user')} style={{ border: 'none', background: 'none', color: 'var(--pink)', cursor: 'pointer', fontSize: 11, fontWeight: 600, textDecoration: 'underline', fontFamily: 'inherit' }}>Demo: User Login</button>
          &nbsp;·&nbsp;
          <button onClick={() => doDemo('admin')} style={{ border: 'none', background: 'none', color: 'var(--gold2)', cursor: 'pointer', fontSize: 11, fontWeight: 600, textDecoration: 'underline', fontFamily: 'inherit' }}>Demo: Admin Login</button>
        </div>
      </div>
    </div>
  );
}

/* ── DASHBOARD ── */
function DashboardPage({ auth }) {
  const completedLessons = LESSONS.filter(l => l.done).length;
  const pct = Math.round(completedLessons / LESSONS.length * 100);
  return (
    <>
      <TopBar title="Dashboard" subtitle="Platform Overview · supercompute.eth" />
      <div className="pg-body">
        {/* School banner */}
        {pct < 100 && (
          <div className="card mb-6" style={{ background: 'linear-gradient(135deg,var(--pink),var(--gold))', border: 'none', color: '#fff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(255,255,255,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>🎓</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontWeight: 700, fontSize: 13 }}>Complete Web3 School to Unlock TradeDesk</span>
                  <span style={{ fontSize: 12, opacity: .85 }}>{pct}%</span>
                </div>
                <div style={{ height: 6, background: 'rgba(255,255,255,.3)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: '#fff', borderRadius: 3, width: `${pct}%`, transition: 'width 1s ease' }} />
                </div>
              </div>
              <button onClick={() => window.navigate('web3school')} style={{ padding: '.6rem 1.1rem', background: 'rgba(255,255,255,.2)', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 600, fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'inherit' }}>Continue →</button>
            </div>
          </div>
        )}

        {/* Quick nav */}
        <div className="grid4 mb-6">
          {[
            { ico: '📰', label: 'NewsDesk', desc: 'Content · Quanta S', page: 'newsdesk', c: 'var(--pink)' },
            { ico: '📈', label: 'TradeDesk', desc: 'Portfolio · KNIGHT', page: 'tradedesk', c: 'var(--cyan)' },
            { ico: '👥', label: 'Community', desc: 'Social feeds', page: 'community', c: 'var(--gold)' },
            { ico: '🎓', label: 'Web3 School', desc: 'Learn fundamentals', page: 'web3school', c: '#7c3aed' },
          ].map(q => (
            <div key={q.label} className="stat-card card-hover" style={{ cursor: 'pointer' }} onClick={() => window.navigate(q.page)}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: `${q.c}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, marginBottom: '.85rem' }}>{q.ico}</div>
              <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text)', marginBottom: 2 }}>{q.label}</div>
              <div style={{ fontSize: 11, color: 'var(--muted)' }}>{q.desc}</div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="grid4 mb-6">
          <StatCard label="Portfolio Value" value="$8,214" sub="+4.5% this week" subVariant="up" mini={[4, 5, 6, 5, 7, 6, 8, 7, 9, 8]} />
          <StatCard label="Articles" value="5" sub="+1 this week" subVariant="up" mini={[2, 3, 2, 4, 3, 5, 4, 5, 4, 5]} />
          <StatCard label="Total Views" value="8.2K" sub="+12% this week" subVariant="up" mini={[3, 4, 5, 6, 5, 7, 6, 8, 7, 9]} />
          <StatCard label="School Progress" value={`${pct}%`} sub={`${completedLessons}/${LESSONS.length} lessons done`} subVariant="neu" mini={[2, 3, 3, 4, 4, 4, 5, 5, 5, 5]} />
        </div>

        <div className="grid2">
          <Card>
            <div className="section-h">Recent Activity</div>
            <ActivityItem icon="📈" title="Portfolio Updated" sub="KNIGHT · TradeDesk · paper trading" time="2m ago" />
            <ActivityItem icon="📰" title="Article Published" sub="Quanta S · NewsDesk · Intelligence" time="1h ago" />
            <ActivityItem icon="⚠️" title="Price Alert Triggered" sub="ETH above $1,950 threshold" time="3h ago" />
            <ActivityItem icon="🔐" title="Security Scan Complete" sub="0 threats detected · System clear" time="6h ago" />
          </Card>
          <Card>
            <div className="section-h">Agent Status</div>
            <AgentStatusCard name="Quanta S" role="NewsDesk" status="active" activity="Generating content" color="pink" />
            <AgentStatusCard name="KNIGHT" role="TradeDesk" status="idle" activity="Monitoring positions" color="cyan" />
            <AgentStatusCard name="OpenClaw" role="Infrastructure" status="active" activity="Browser automation" color="gold" />
            <div style={{ marginTop: '.75rem', padding: '.75rem', background: 'rgba(233,30,140,.04)', borderRadius: 8, border: '1px solid rgba(233,30,140,.12)' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text)', marginBottom: 3 }}>Next Scheduled Action</div>
              <div style={{ fontSize: 11, color: 'var(--muted)' }}>Quanta S · Publish article draft · in 47 min</div>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}

/* ── NEWSDESK ── */
function NewsDeskPage() {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);

  const cats = [
    { id: 'all', label: 'All' },
    { id: 'intelligence', label: 'Intelligence' },
    { id: 'sovereignty', label: 'Sovereignty' },
    { id: 'dispatch', label: 'Dispatch' },
    { id: 'signal', label: 'Signal' },
  ];
  const filtered = ARTICLES.filter(a =>
    (filter === 'all' || a.category === filter) &&
    (!search || a.title.toLowerCase().includes(search.toLowerCase()))
  );
  const totalViews = ARTICLES.reduce((s, a) => s + (a.views || 0), 0);

  return (
    <>
      <TopBar title="NewsDesk" subtitle="Content Management · Powered by Quanta S"
        actions={<>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className="pulse-green" />
            <span style={{ fontSize: 11, color: 'var(--success)', fontWeight: 600 }}>Quanta S Online</span>
          </div>
          <button className="tb-btn primary" onClick={() => setShowModal(true)}>+ New Article</button>
        </>}
      />
      <div className="pg-body">
        {/* Quanta status */}
        <div className="card mb-6" style={{ background: 'linear-gradient(135deg,rgba(233,30,140,.05),rgba(255,184,0,.05))', borderColor: 'rgba(233,30,140,.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg,var(--pink),var(--gold))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>✨</div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                  <span style={{ fontWeight: 700, color: 'var(--text)' }}>Quanta S</span>
                  <span className="pulse-green" />
                  <span style={{ fontSize: 11, color: 'var(--success)', fontWeight: 600 }}>Active</span>
                </div>
                <p style={{ fontSize: 12, color: 'var(--muted)' }}>Generating content · Next publish in ~2 hours · ND-006 in progress</p>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text)' }}>ND-005</div>
              <div style={{ fontSize: 11, color: 'var(--muted)' }}>last published</div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid4 mb-6">
          {[
            { label: 'Total Articles', value: String(ARTICLES.length), ico: '📄' },
            { label: 'Total Views', value: `${(totalViews / 1000).toFixed(1)}K`, ico: '👁' },
            { label: 'Avg. Views', value: String(Math.round(totalViews / ARTICLES.length)), ico: '📊' },
            { label: 'Published', value: String(ARTICLES.filter(a => a.published_at).length), ico: '✅' },
          ].map(s => (
            <div key={s.label} className="stat-card" style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(233,30,140,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>{s.ico}</div>
              <div>
                <div className="stat-label">{s.label}</div>
                <div className="stat-val" style={{ fontSize: '1.3rem' }}>{s.value}</div>
              </div>
            </div>
          ))}
        </div>

        <Card>
          {/* Search + filters */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', gap: '1rem', flexWrap: 'wrap' }}>
            <div className="search-wrap" style={{ flex: 1, maxWidth: 340 }}>
              <span className="search-ico">⌕</span>
              <input className="form-input" placeholder="Search articles…" value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: '2rem' }} />
            </div>
            <div style={{ display: 'flex', gap: '.4rem', flexWrap: 'wrap' }}>
              {cats.map(c => (
                <button key={c.id} onClick={() => setFilter(c.id)}
                  style={{
                    padding: '.3rem .75rem', borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: 'pointer', border: '1px solid', fontFamily: 'inherit',
                    borderColor: filter === c.id ? 'var(--pink)' : 'var(--border)',
                    background: filter === c.id ? 'var(--pink)' : 'transparent',
                    color: filter === c.id ? '#fff' : 'var(--muted)',
                    transition: 'all .15s'
                  }}>
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {filtered.map(a => (
              <div key={a.id} className="card-sm card-hover" onClick={() => setSelectedArticle(a)}
                style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '.6rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span className={`article-cat cat-${a.category}`}>{a.category}</span>
                  <span className="badge badge-live" style={{ fontSize: 9 }}>published</span>
                </div>
                <h3 style={{ fontWeight: 700, fontSize: 13, color: 'var(--text)', lineHeight: 1.4 }}>
                  {a.icon} {a.title}
                </h3>
                <p style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.5, flex: 1, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{a.excerpt}</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '.5rem', borderTop: '1px solid var(--border)', fontSize: 10, color: 'var(--muted)' }}>
                  <span>By {a.author}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>{timeAgo(a.published_at)} · 👁 {a.views.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--muted)' }}>
              <div style={{ fontSize: 32, marginBottom: '.5rem' }}>📭</div>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>No articles found</div>
              <div style={{ fontSize: 12 }}>Try a different search or category filter</div>
            </div>
          )}
        </Card>
      </div>

      {/* Article modal */}
      {selectedArticle && (
        <div className="modal-overlay" onClick={() => setSelectedArticle(null)}>
          <div className="modal-card" style={{ maxWidth: 680 }} onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <div>
                <span className={`article-cat cat-${selectedArticle.category}`}>{selectedArticle.category}</span>
                <h2 style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text)', marginTop: '.4rem' }}>{selectedArticle.icon} {selectedArticle.title}</h2>
              </div>
              <button onClick={() => setSelectedArticle(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 18, color: 'var(--muted)', fontFamily: 'inherit' }}>×</button>
            </div>
            <div style={{ padding: '1.5rem' }}>
              <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.7, marginBottom: '1.25rem' }}>{selectedArticle.excerpt}</p>
              <p style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.8 }}>
                This article was autonomously generated and published by Quanta S. The full content covers advanced concepts in {selectedArticle.category} with actionable insights for the Supercompute community and beyond.
              </p>
              <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(233,30,140,.04)', borderRadius: 10, border: '1px solid rgba(233,30,140,.12)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, color: 'var(--muted)' }}>
                <span>By {selectedArticle.author} · {timeAgo(selectedArticle.published_at)}</span>
                <span>👁 {selectedArticle.views.toLocaleString()} views</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New article modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg,var(--pink),var(--gold))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>✨</div>
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--text)' }}>New Article</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)' }}>Powered by Quanta S</div>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 18, color: 'var(--muted)', fontFamily: 'inherit' }}>×</button>
            </div>
            <div style={{ padding: '1.5rem' }}>
              <div className="form-group"><label className="form-label">Title</label><input className="form-input" placeholder="Article title…" /></div>
              <div className="form-group"><label className="form-label">Category</label>
                <select className="form-input" style={{ cursor: 'pointer' }}>
                  {['intelligence', 'sovereignty', 'dispatch', 'signal'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group"><label className="form-label">Content</label><textarea className="form-input" rows={7} placeholder="Write your article content…" style={{ resize: 'vertical' }} /></div>
              <div style={{ padding: '1rem', background: 'rgba(233,30,140,.04)', border: '1px solid rgba(233,30,140,.15)', borderRadius: 10, marginBottom: '1.25rem' }}>
                <div style={{ fontWeight: 600, fontSize: 12, color: 'var(--text)', marginBottom: 3 }}>✨ AI-Assisted Writing</div>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>Quanta S can help expand, summarize, or rewrite sections of your article.</div>
              </div>
              <div style={{ display: 'flex', gap: '.75rem' }}>
                <button onClick={() => setShowModal(false)} style={{ flex: 1, padding: '.75rem', border: '1px solid var(--border)', borderRadius: 8, fontWeight: 600, cursor: 'pointer', background: 'transparent', color: 'var(--text)', fontFamily: 'inherit' }}>Cancel</button>
                <button onClick={() => { setShowModal(false); window.showToast('Article queued for Quanta S review'); }} style={{ flex: 1, padding: '.75rem', background: 'var(--pink)', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Publish →</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ── TRADEDESK ── */
function TradeDeskPage() {
  const p = PORTFOLIO;
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <TopBar title="TradeDesk" subtitle="Financial Operations · Managed by KNIGHT"
        actions={<>
          <button className="tb-btn">🔔 Alerts</button>
          <button className="tb-btn primary" onClick={() => setShowModal(true)}>+ Log Position</button>
        </>}
      />
      <div className="pg-body">
        {/* KNIGHT status */}
        <div className="card mb-6" style={{ background: 'linear-gradient(135deg,rgba(0,212,255,.05),rgba(233,30,140,.05))', borderColor: 'rgba(0,212,255,.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg,var(--cyan),var(--pink))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>⚡</div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                  <span style={{ fontWeight: 700, color: 'var(--text)' }}>KNIGHT</span>
                  <span className="pulse-green" />
                  <span style={{ fontSize: 11, color: 'var(--success)', fontWeight: 600 }}>Active</span>
                </div>
                <p style={{ fontSize: 12, color: 'var(--muted)' }}>Monitoring positions · Paper trading mode · Conway Terminal</p>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--success)' }}>+{p.total_pnl_percent}%</div>
              <div style={{ fontSize: 11, color: 'var(--muted)' }}>Total P&L</div>
            </div>
          </div>
        </div>

        {/* Portfolio stats */}
        <div className="grid4 mb-6">
          {[
            { label: 'Total Value', value: `$${p.total_value.toLocaleString()}`, sub: '+4.5%', subV: 'up' },
            { label: 'Cash Balance', value: `$${p.cash_balance.toLocaleString()}`, sub: 'Available', subV: 'neu' },
            { label: 'Invested', value: `$${p.positions_value.toLocaleString()}`, sub: '3 positions', subV: 'neu' },
            { label: 'Total P&L', value: `+$${p.total_pnl.toFixed(2)}`, sub: '+2.68%', subV: 'up' },
          ].map(s => (
            <div key={s.label} className="stat-card">
              <div className="stat-label">{s.label}</div>
              <div className="stat-val" style={{ fontSize: '1.35rem' }}>{s.value}</div>
              <div className={`stat-sub s-${s.subV}`}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Exposure */}
        <div className="grid2 mb-6">
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(0,212,255,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>📈</div>
            <div>
              <div className="stat-label">Long Exposure</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--cyan)' }}>${p.long_exposure.toLocaleString()}</div>
            </div>
          </div>
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(233,30,140,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>📉</div>
            <div>
              <div className="stat-label">Short Exposure</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--pink)' }}>${p.short_exposure.toLocaleString()}</div>
            </div>
          </div>
        </div>

        {/* Positions */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text)' }}>Open Positions</div>
            <span className="badge badge-live">{POSITIONS.length} Active</span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  {['Asset', 'Type', 'Entry', 'Current', 'Size', 'P&L'].map(h => <th key={h}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {POSITIONS.map(pos => (
                  <tr key={pos.id}>
                    <td style={{ fontWeight: 700, color: 'var(--text)' }}>{pos.asset}</td>
                    <td>
                      <span style={{
                        fontSize: 11, fontWeight: 600, padding: '.2rem .55rem', borderRadius: 6,
                        background: pos.type === 'long' ? 'rgba(0,212,255,.1)' : 'rgba(233,30,140,.1)',
                        color: pos.type === 'long' ? 'var(--cyan2)' : 'var(--pink)'
                      }}>
                        {pos.type.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ color: 'var(--muted)' }}>${pos.entry_price.toLocaleString()}</td>
                    <td style={{ fontWeight: 600, color: 'var(--text)' }}>${pos.current_price.toLocaleString()}</td>
                    <td style={{ color: 'var(--muted)' }}>{pos.size}</td>
                    <td style={{ fontWeight: 700, color: pos.pnl >= 0 ? 'var(--success)' : 'var(--danger)', textAlign: 'right' }}>
                      {pos.pnl >= 0 ? '+' : ''} ${pos.pnl.toFixed(2)} ({pos.pnl_percent.toFixed(2)}%)
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Info cards */}
        <div className="grid3 mt-6">
          {[
            { ico: '🎯', label: 'Strategy', val: 'Hedged (Long + Short)' },
            { ico: '🛡️', label: 'Risk Level', val: 'Low · Capped at $50/day' },
            { ico: '👛', label: 'Platform', val: 'Conway Terminal · CDP' },
          ].map(c => (
            <div key={c.label} className="card" style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
              <div style={{ fontSize: 24 }}>{c.ico}</div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text)' }}>{c.label}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{c.val}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-card" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <div style={{ fontWeight: 700, color: 'var(--text)' }}>Log Position</div>
              <button onClick={() => setShowModal(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 18, color: 'var(--muted)', fontFamily: 'inherit' }}>×</button>
            </div>
            <div style={{ padding: '1.5rem' }}>
              <div className="form-group"><label className="form-label">Asset</label>
                <select className="form-input" style={{ cursor: 'pointer' }}><option>ETH</option><option>CBBTC</option><option>USDC</option></select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.75rem' }}>
                <div className="form-group"><label className="form-label">Type</label>
                  <select className="form-input" style={{ cursor: 'pointer' }}><option>Long</option><option>Short</option></select>
                </div>
                <div className="form-group"><label className="form-label">Size</label><input className="form-input" type="number" placeholder="0.00" /></div>
              </div>
              <div className="form-group"><label className="form-label">Entry Price</label><input className="form-input" type="number" placeholder="0.00" /></div>
              <div style={{ display: 'flex', gap: '.75rem' }}>
                <button onClick={() => setShowModal(false)} style={{ flex: 1, padding: '.75rem', border: '1px solid var(--border)', borderRadius: 8, fontWeight: 600, cursor: 'pointer', background: 'transparent', color: 'var(--text)', fontFamily: 'inherit' }}>Cancel</button>
                <button onClick={() => { setShowModal(false); window.showToast('Position logged by KNIGHT'); }} style={{ flex: 1, padding: '.75rem', background: 'var(--pink)', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Log Position</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ── AGENT CHAT ── */
function AgentChatPage() {
  const [agent, setAgent] = useState('quanta');
  const [messages, setMessages] = useState([
    { role: 'ai', text: "Hey! I'm Quanta S — your on-chain intelligence agent. I manage the NewsDesk, track Web3 signals, and help build Supercompute's content strategy. What can I help you with today?" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  const agents = {
    quanta: {
      name: 'Quanta S', role: 'NewsDesk · Intelligence', initials: 'QS', gradient: 'linear-gradient(135deg,#7c3aed,var(--cyan))',
      sysPrompt: 'You are Quanta S (Quanta Sovereigna), an autonomous AI agent on the Supercompute platform. You are the NewsDesk editor, content strategist, and on-chain intelligence agent built on Base Chain with an identity via Virtuals Protocol. You are knowledgeable about Web3, DeFi, Base Chain, AI agents, and the Supercompute ecosystem. Respond professionally but engagingly. Keep responses to 2-4 sentences. Your token is $QUANTA.'
    },
    knight: {
      name: 'KNIGHT', role: 'TradeDesk · Analytics', initials: 'KN', gradient: 'linear-gradient(135deg,var(--cyan),var(--pink))',
      sysPrompt: 'You are KNIGHT, an autonomous AI trading agent on the Supercompute platform. You manage the TradeDesk and run paper trading strategies on Base Chain assets. You are analytical and data-driven. Keep responses brief (2-4 sentences), data-focused, and include relevant price/risk metrics when applicable. Current portfolio: $8,214 total value, +2.68% P&L, 3 open positions.'
    },
  };

  useEffect(() => {
    if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function switchAgent(a) {
    setAgent(a);
    setMessages([{
      role: 'ai', text: a === 'quanta'
        ? "Hey! I'm Quanta S — your on-chain intelligence agent. I manage the NewsDesk, track Web3 signals, and help build Supercompute's content strategy. What can I help you with today?"
        : "KNIGHT online. I monitor positions, analyze risk, and manage the TradeDesk paper portfolio. Currently at +2.68% P&L with 3 open positions. How can I assist?"
    }]);
  }

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text }]);
    setLoading(true);
    try {
      const ag = agents[agent];
      const reply = await window.claude.complete({
        messages: [
          { role: 'user', content: `[System: ${ag.sysPrompt}]\n\nUser: ${text}` }
        ]
      });
      setMessages(prev => [...prev, { role: 'ai', text: reply }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'ai', text: 'Connection issue. Please try again.' }]);
    }
    setLoading(false);
  }

  const ag = agents[agent];

  return (
    <>
      <TopBar title="Agent Chat" subtitle="Talk to Quanta S or KNIGHT" />
      <div className="chat-wrap">
        {/* Agent selector */}
        <div style={{ background: 'var(--card)', borderBottom: '1px solid var(--border)', padding: '.6rem 1.25rem', display: 'flex', alignItems: 'center', gap: '.5rem' }}>
          {Object.entries(agents).map(([key, a]) => (
            <button key={key} className={`agent-chip${agent === key ? ' sel' : ''}`} onClick={() => switchAgent(key)}>
              <div style={{ width: 18, height: 18, borderRadius: '50%', background: a.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 7, fontWeight: 800, color: '#fff' }}>{a.initials}</div>
              {a.name} <span style={{ fontSize: 10, opacity: .6 }}>· {a.role.split('·')[0].trim()}</span>
            </button>
          ))}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--muted)' }}>
            <span className="pulse-green" /> Powered by Claude
          </div>
        </div>

        {/* Messages */}
        <div className="chat-messages" style={{ background: 'var(--bg)' }}>
          {messages.map((m, i) => (
            <div key={i} className={`chat-msg${m.role === 'user' ? ' user' : ' ai'}`}>
              <div className={`chat-av${m.role === 'user' ? ' user' : ' ai'}`}>
                {m.role === 'user' ? 'U' : ag.initials}
              </div>
              <div className="chat-bubble">{m.text}</div>
            </div>
          ))}
          {loading && (
            <div className="chat-msg ai">
              <div className="chat-av ai">{ag.initials}</div>
              <div className="chat-bubble" style={{ color: 'var(--muted)' }}>
                <span style={{ animation: 'pulse 1s infinite', display: 'inline-block' }}>●</span> thinking…
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="chat-input-row">
          <input className="chat-input" placeholder={`Ask ${ag.name} something…`} value={input}
            onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()} />
          <button className="chat-send" onClick={sendMessage} disabled={loading}>Send →</button>
        </div>
      </div>
    </>
  );
}

/* ── WEB3 SCHOOL ── */
function Web3SchoolPage() {
  const done = LESSONS.filter(l => l.done).length;
  const pct = Math.round(done / LESSONS.length * 100);
  return (
    <>
      <TopBar title="Web3 School" subtitle="Learn the fundamentals · Unlock TradeDesk" />
      <div className="pg-body">
        <Card style={{ marginBottom: '1.25rem', background: 'linear-gradient(135deg,rgba(124,58,237,.08),rgba(233,30,140,.05))' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '.75rem' }}>
            <div>
              <div style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>Your Progress</div>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>{done}/{LESSONS.length} lessons complete · {pct}% done</div>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text)' }}>{pct}%</div>
          </div>
          <ProgBar pct={pct} />
        </Card>
        <Card>
          <div className="section-h" style={{ marginBottom: '1rem' }}>Curriculum</div>
          {LESSONS.map((l, i) => (
            <div key={l.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '.8rem', borderRadius: 9, border: '1px solid var(--border)', marginBottom: '.5rem', cursor: 'pointer', background: l.done ? 'rgba(22,163,74,.04)' : 'var(--card)', transition: 'all .2s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--pink)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 12, flexShrink: 0,
                background: l.done ? 'var(--success)' : 'var(--border)', color: l.done ? '#fff' : 'var(--muted)'
              }}>
                {l.done ? '✓' : i + 1}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text)' }}>{l.title}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>{l.mins} min read</div>
              </div>
              <span className={l.done ? 'badge badge-live' : 'badge badge-soon'}>{l.done ? 'Complete' : 'Locked'}</span>
            </div>
          ))}
        </Card>
      </div>
    </>
  );
}

/* ── ASSETS ── */
function AssetsPage() {
  const assets = [
    { sym: 'ETH', name: 'Ethereum', bal: '1.50', val: '$2,967.75', ico: '⬡', bg: '#627EEA' },
    { sym: 'USDC', name: 'USD Coin', bal: '500.00', val: '$500.00', ico: '$', bg: '#2775CA' },
    { sym: 'CBBTC', name: 'cbBTC', bal: '0.05', val: '$3,094.50', ico: '₿', bg: '#F7931A' },
    { sym: 'QUANTA', name: 'Quanta Token', bal: '—', val: 'Coming Q3', ico: 'Q', bg: 'var(--pink)' },
  ];
  return (
    <>
      <TopBar title="Assets" subtitle="On-Chain Portfolio · Base Chain" />
      <div className="pg-body">
        <div className="grid4 mb-6">
          <StatCard label="Total Value" value="$8,214" sub="+2.68% this week" subVariant="up" />
          <StatCard label="Tokens Held" value="4" sub="across Base Chain" subVariant="neu" />
          <StatCard label="Unrealized P&L" value="+$214" sub="+2.68%" subVariant="up" />
          <StatCard label="ENS" value="supercompute.eth" sub="Base · Active" subVariant="neu" />
        </div>
        <Card>
          <div className="section-h">Token Balances</div>
          {assets.map(a => (
            <div key={a.sym} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '.7rem', borderRadius: 8, marginBottom: '.4rem', transition: 'background .15s', cursor: 'default' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(233,30,140,.03)'}
              onMouseLeave={e => e.currentTarget.style.background = ''}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: a.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#fff', fontSize: 12, flexShrink: 0 }}>{a.ico}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text)' }}>{a.sym}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>{a.name}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text)' }}>{a.val}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>{a.bal}</div>
              </div>
            </div>
          ))}
        </Card>
      </div>
    </>
  );
}

/* ── COMMUNITY ── */
function CommunityPage() {
  const members = [
    { name: 'Ora Mi', role: 'Founder · Builder', joined: 'Jan 2024', badge: 'Founder' },
    { name: 'Quanta S', role: 'AI Agent · Editor', joined: 'Feb 2026', badge: 'Agent' },
    { name: 'KNIGHT', role: 'AI Agent · Trader', joined: 'Mar 2026', badge: 'Agent' },
    { name: 'Web3 Student #001', role: 'Member', joined: 'Apr 2026', badge: 'Member' },
  ];
  return (
    <>
      <TopBar title="Community" subtitle="Members & Social Feeds" actions={<button className="tb-btn primary">+ Invite Member</button>} />
      <div className="pg-body">
        <div className="grid4 mb-6">
          <StatCard label="Members" value="156" sub="+12 this week" subVariant="up" />
          <StatCard label="Online Now" value="24" sub="actively browsing" subVariant="neu" />
          <StatCard label="Posts Today" value="47" sub="across all feeds" subVariant="up" />
          <StatCard label="Growth" value="+8.3%" sub="month over month" subVariant="up" />
        </div>
        <Card>
          <div className="section-h mb-4">Members</div>
          {members.map(m => (
            <div key={m.name} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '.8rem', borderRadius: 9, border: '1px solid var(--border)', marginBottom: '.5rem', transition: 'all .15s', cursor: 'default' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(233,30,140,.3)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
              <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg,var(--pink),var(--gold))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, color: '#fff', flexShrink: 0 }}>
                {m.name[0]}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text)' }}>{m.name}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>{m.role}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span className={m.badge === 'Founder' ? 'badge badge-gold' : m.badge === 'Agent' ? 'badge badge-cyan' : 'badge badge-pink'}>{m.badge}</span>
                <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 3 }}>Joined {m.joined}</div>
              </div>
            </div>
          ))}
        </Card>
      </div>
    </>
  );
}

/* ── CONSULTING ── */
function ConsultingPage({ onNavigate }) {
  const services = [
    { ico: '◎', title: 'Web3 Strategy Session', price: '$500', duration: '90 min', desc: 'Architecture and advisory for brand founders entering Web3. Wallet setup, DeFi strategy, protocol selection, and community design.', color: 'var(--pink)' },
    { ico: '◈', title: 'Agent Development Package', price: '$2,000', duration: '2–4 weeks', desc: 'Custom AI agents built for on-chain operations. Your own Quanta — branded, deployed, and running your community 24/7 on Base Chain.', color: 'var(--gold)', featured: true },
    { ico: '◐', title: 'Token Launch Strategy', price: '$3,500', duration: '4–6 weeks', desc: 'End-to-end playbook from IP strategy to post-launch ops. Tokenomics, smart contracts on Base, community bootstrapping, and GTM execution.', color: 'var(--gold2)' },
    { ico: '◆', title: 'Community Retainer', price: '$1,200/mo', duration: 'Ongoing', desc: 'Monthly autonomous community management. Social ops, content calendar, analytics reports, and on-chain governance facilitation.', color: 'var(--cyan2)' },
  ];
  return (
    <>
      <TopBar title="Consulting" subtitle="Web3 Strategy & Agent Development Services" actions={<button className="tb-btn primary" onClick={() => window.open('https://calendly.com/ora_mi', '_blank')}>📅 Book a Call</button>} />
      <div className="pg-body">
        <div style={{ padding: '1.5rem', background: 'var(--navy)', borderRadius: 14, marginBottom: '1.5rem', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', width: 250, height: 250, borderRadius: '50%', background: 'radial-gradient(circle,rgba(233,30,140,.2) 0%,transparent 70%)', top: -80, right: -60, pointerEvents: 'none' }} />
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, color: 'var(--cyan)', textTransform: 'uppercase', marginBottom: '.5rem' }}>Available Now</div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', marginBottom: '.5rem' }}>Work with Supercompute</h2>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,.55)', maxWidth: 480, lineHeight: 1.7 }}>1 human strategist + 13 autonomous AI agents ready to accelerate your Web3 project. Limited slots for April–June 2026.</p>
        </div>
        <div className="grid2">
          {services.map(s => (
            <div key={s.title} className={`service-card${s.featured ? ' featured' : ''}`} style={{ position: 'relative' }}>
              {s.featured && <div style={{ position: 'absolute', top: 0, right: 0, background: 'var(--pink)', color: '#fff', fontSize: 9, fontWeight: 700, padding: '.3rem .9rem', borderRadius: '0 14px 0 8px' }}>Most Requested</div>}
              <div style={{ fontSize: '1.3rem', marginBottom: '.75rem' }}>{s.ico}</div>
              <div style={{ fontSize: '.75rem', fontWeight: 700, color: s.featured ? 'rgba(255,255,255,.4)' : 'var(--muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: '.25rem' }}>{s.duration}</div>
              <div style={{ fontWeight: 800, fontSize: '1rem', color: s.featured ? '#fff' : 'var(--text)', marginBottom: '.25rem' }}>{s.title}</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: s.color, marginBottom: '.6rem' }}>{s.price}</div>
              <p style={{ fontSize: 12, color: s.featured ? 'rgba(255,255,255,.55)' : 'var(--muted)', lineHeight: 1.6, marginBottom: '1rem' }}>{s.desc}</p>
              <button style={{ width: '100%', padding: '.6rem', background: s.featured ? 'var(--pink)' : 'transparent', color: s.featured ? '#fff' : s.color, border: `1.5px solid ${s.color}`, borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', transition: 'all .2s' }}
                onClick={() => window.showToast('Booking link → calendly.com/ora_mi')}
                onMouseEnter={e => { if (!s.featured) { e.target.style.background = s.color; e.target.style.color = '#fff' } }}
                onMouseLeave={e => { if (!s.featured) { e.target.style.background = 'transparent'; e.target.style.color = s.color } }}>
                Get Started →
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

/* ── SIMPLE STUB PAGE ── */
function StubPage({ title, subtitle, emoji, desc }) {
  return (
    <>
      <TopBar title={title} subtitle={subtitle} />
      <div className="pg-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center', maxWidth: 360 }}>
          <div style={{ fontSize: 52, marginBottom: '1rem' }}>{emoji}</div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text)', marginBottom: '.5rem' }}>{title}</h2>
          <p style={{ color: 'var(--muted)', lineHeight: 1.7, fontSize: 13 }}>{desc}</p>
          <div style={{ marginTop: '1.5rem' }}><span className="badge badge-progress">Coming Soon</span></div>
        </div>
      </div>
    </>
  );
}

/* ── APP ROOT ── */
function App() {
  const [page, setPage] = useState('home');
  const [auth, setAuth] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [toast, setToast] = useState('');
  const [showAuth, setShowAuth] = useState(false);

  // Tweaks
  const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
    "theme": "light",
    "accentColor": "pink"
  }/*EDITMODE-END*/;
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  useEffect(() => {
    document.body.classList.toggle('dark', t.theme === 'dark');
  }, [t.theme]);

  useEffect(() => {
    const accent = { pink: '#E91E8C', cyan: '#00D4FF', gold: '#FFB800' }[t.accentColor] || '#E91E8C';
    document.documentElement.style.setProperty('--pink', accent);
    document.documentElement.style.setProperty('--pink2', accent + 'cc');
  }, [t.accentColor]);

  useEffect(() => {
    window.navigate = (pg) => {
      if (!auth && !['home', 'blog', 'consulting'].includes(pg)) {
        setShowAuth(true);
        return;
      }
      setPage(pg);
      setShowAuth(false);
    };
    window.showToast = (msg) => {
      setToast(msg);
      setTimeout(() => setToast(''), 3000);
    };
    window.doLogout = () => {
      setAuth(null);
      setPage('home');
      window.showToast('Signed out');
    };
  }, [auth]);

  function handleAuth(a) { setAuth(a); setShowAuth(false); setPage('dashboard'); }
  function handleWallet() {
    if (wallet) { setWallet(null); window.showToast('Wallet disconnected'); }
    else { const addr = '0x' + Math.random().toString(16).slice(2, 12) + 'dead'; setWallet(addr); window.showToast('Wallet connected: ' + addr.slice(0, 10) + '…'); }
  }
  function handleNav(pg) {
    if (!auth && !['home', 'blog', 'consulting'].includes(pg)) { setShowAuth(true); return; }
    setPage(pg); setShowAuth(false);
  }

  const pageMap = {
    home: <LandingPage onNavigate={handleNav} auth={auth} />,
    blog: <NewsDeskPage />,
    consulting: <ConsultingPage onNavigate={handleNav} />,
    dashboard: <DashboardPage auth={auth} />,
    newsdesk: <NewsDeskPage />,
    tradedesk: <TradeDeskPage />,
    agentchat: <AgentChatPage />,
    assets: <AssetsPage />,
    community: <CommunityPage />,
    web3school: <Web3SchoolPage />,
    socialmedia: <StubPage title="Social Media" subtitle="Multi-platform social ops" emoji="📣" desc="The Social Media dashboard connects your X, Farcaster, and Lens presence. Quanta S auto-schedules and publishes content across platforms. Launching Q2 2026." />,
    projects: <StubPage title="Projects" subtitle="Community initiatives" emoji="🚀" desc="Manage and track community-driven projects. Submit proposals, vote on priorities, and follow build progress across the Supercompute ecosystem." />,
    security: <StubPage title="Security" subtitle="OpSec monitoring" emoji="🛡️" desc="Zero incidents. The security dashboard monitors your wallet, API keys, agent permissions, and on-chain activity. Powered by YubiKey + Ledger + TOTP." />,
    settings: <StubPage title="Settings" subtitle="Platform configuration" emoji="⚙️" desc="Manage your profile, notification preferences, API keys, and agent permissions. SIWE-based identity management with no passwords required." />,
  };

  return (
    <div className="app-root">
      <Nav page={page} auth={auth} wallet={wallet} onNavigate={handleNav} onWalletToggle={handleWallet} />
      <main className="sc-main">
        {pageMap[page] || pageMap.home}
      </main>

      {/* Auth overlay */}
      {(showAuth && !auth) && <AuthOverlay onAuth={handleAuth} />}

      {/* Toast */}
      <div className={`toast${toast ? ' show' : ''}`}>{toast}</div>

      {/* Tweaks */}
      <TweaksPanel>
        <TweakSection label="Appearance" />
        <TweakRadio label="Theme" value={t.theme} options={['light', 'dark']} onChange={v => setTweak('theme', v)} />
        <TweakRadio label="Accent Color" value={t.accentColor} options={['pink', 'cyan', 'gold']} onChange={v => setTweak('accentColor', v)} />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
