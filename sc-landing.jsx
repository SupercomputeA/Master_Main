// sc-landing.jsx — Full public landing page
const { useState, useEffect } = React;

const TICKER_DATA = [
    { sym: 'ETH', price: '$1,978.50', chg: '+3.05%', up: true },
    { sym: 'BTC', price: '$61,890', chg: '-0.82%', up: false },
    { sym: 'BASE', price: '$0.1842', chg: '+1.4%', up: true },
    { sym: 'USDC', price: '$1.000', chg: '0.00%', up: true },
    { sym: '$QUANTA', price: '—', chg: 'Coming', up: true },
    { sym: '$SCOM', price: '—', chg: 'Q3 2026', up: true },
    { sym: '$VERB', price: '—', chg: 'Q4 2026', up: true },
];

function Ticker() {
    const items = [...TICKER_DATA, ...TICKER_DATA];
    return (
        <div className="ticker-wrap">
            <div className="ticker-inner">
                {items.map((t, i) => (
                    <span key={i} className="ticker-item">
                        <span style={{ fontWeight: 700, color: 'rgba(255,255,255,.8)' }}>{t.sym}</span>
                        <span>{t.price}</span>
                        <span className={t.up ? 't-up' : 't-down'}>{t.chg}</span>
                        <span style={{ color: 'rgba(255,255,255,.15)', margin: '0 .5rem' }}>|</span>
                    </span>
                ))}
            </div>
        </div>
    );
}

function LandingPage({ onNavigate, auth }) {
    useEffect(() => {
        const obs = new IntersectionObserver(entries =>
            entries.forEach(e => e.isIntersecting && e.target.classList.add('visible')),
            { threshold: 0.12 }
        );
        document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
        return () => obs.disconnect();
    }, []);

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
            <Ticker />

            {/* HERO */}
            <div style={{ background: 'var(--navy)', position: 'relative', overflow: 'hidden', padding: '4.5rem 2rem 4rem', textAlign: 'center' }}>
                <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle,rgba(233,30,140,.18) 0%,transparent 70%)', top: -150, right: -80, pointerEvents: 'none', animation: 'blobMove 9s ease-in-out infinite alternate' }} />
                <div style={{ position: 'absolute', width: 380, height: 380, borderRadius: '50%', background: 'radial-gradient(circle,rgba(0,212,255,.12) 0%,transparent 70%)', bottom: -80, left: -60, pointerEvents: 'none', animation: 'blobMove 12s ease-in-out infinite alternate-reverse' }} />

                <div className="fade-up" style={{ display: 'inline-flex', alignItems: 'center', gap: '.5rem', background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.12)', color: 'rgba(255,255,255,.7)', fontSize: 11, padding: '.35rem 1rem', borderRadius: 20, marginBottom: '1.75rem', position: 'relative' }}>
                    <span className="pulse-dot" /> Institutional-Grade Cyborg Agency · Phase 1 Live
                </div>

                <h1 className="fade-up fade-d1" style={{ fontSize: 'clamp(1.9rem,4.5vw,3.4rem)', fontWeight: 900, color: '#fff', lineHeight: 1.08, marginBottom: '1.1rem', letterSpacing: '-.5px', position: 'relative' }}>
                    Stop manually managing<br />
                    your <span style={{ color: 'var(--pink)' }}>Web3 community.</span><br />
                    <span style={{ color: 'var(--gold)' }}>Hire a Cyborg Agency.</span>
                </h1>

                <p className="fade-up fade-d2" style={{ fontSize: '1rem', color: 'rgba(255,255,255,.55)', maxWidth: 540, margin: '0 auto 2.25rem', lineHeight: 1.7, position: 'relative' }}>
                    1 human strategist. 13 autonomous AI agents. Institutional-grade OpSec.<br />
                    We build, deploy, and manage your on-chain operations.
                </p>

                <div className="fade-up fade-d3" style={{ display: 'flex', gap: '.75rem', justifyContent: 'center', flexWrap: 'wrap', position: 'relative' }}>
                    <button onClick={() => onNavigate('consulting')} style={{ padding: '.8rem 1.75rem', background: 'var(--pink)', color: '#fff', border: 'none', borderRadius: 9, fontSize: 14, fontWeight: 700, cursor: 'pointer', letterSpacing: .1, transition: 'all .2s' }}
                        onMouseEnter={e => { e.target.style.background = 'var(--pink2)'; e.target.style.transform = 'translateY(-1px)' }}
                        onMouseLeave={e => { e.target.style.background = 'var(--pink)'; e.target.style.transform = '' }}>
                        Book a Strategy Session
                    </button>
                    <button onClick={() => { const el = document.getElementById('agents-section'); if (el) el.scrollTop = 0; onNavigate('agentchat'); }}
                        style={{ padding: '.8rem 1.75rem', background: 'rgba(255,255,255,.07)', color: '#fff', border: '1px solid rgba(255,255,255,.18)', borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'all .2s' }}
                        onMouseEnter={e => e.target.style.background = 'rgba(255,255,255,.12)'}
                        onMouseLeave={e => e.target.style.background = 'rgba(255,255,255,.07)'}>
                        Talk to an Agent →
                    </button>
                </div>
            </div>

            {/* TRACTION BAR */}
            <div style={{ background: '#0d1221', borderBottom: '1px solid rgba(255,255,255,.06)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)' }}>
                    {[
                        ['13', 'Active Autonomous Agents'],
                        ['100%', 'Self-Funded Agentic Compute'],
                        ['0', 'Security Breaches · Ledger + YubiKey'],
                        ['3+', 'Years Building in Web3'],
                    ].map(([val, lbl], i) => (
                        <div key={i} style={{ padding: '1.35rem 1rem', textAlign: 'center', borderRight: i < 3 ? '1px solid rgba(255,255,255,.06)' : 'none' }}>
                            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#fff', letterSpacing: -1 }}>{val}</div>
                            <div style={{ fontSize: 10, color: 'var(--cyan)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginTop: '.25rem' }}>{lbl}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* PROTOCOL STACK */}
            <div style={{ background: 'var(--card)', padding: '2rem 1.5rem', borderBottom: '1px solid var(--border)', textAlign: 'center' }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '1.5rem' }}>Deployed On · Powered By · Built With</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
                    {[
                        { lbl: 'Base', bg: '#0052FF', abbr: 'B' },
                        { lbl: 'Virtuals', bg: 'linear-gradient(135deg,#7c3aed,#4f46e5)', abbr: 'V' },
                        { lbl: 'Anthropic', bg: '#CC785C', abbr: 'A' },
                        { lbl: 'Cloudflare', bg: '#F38020', abbr: 'CF' },
                        { lbl: 'ENS', bg: '#5284FF', abbr: 'ENS' },
                        { lbl: 'Stripe', bg: '#635BFF', abbr: 'S' },
                    ].map(({ lbl, bg, abbr }) => (
                        <div key={lbl} style={{ display: 'flex', alignItems: 'center', gap: '.5rem', opacity: .7, transition: 'opacity .2s', cursor: 'default' }}
                            onMouseEnter={e => e.currentTarget.style.opacity = 1}
                            onMouseLeave={e => e.currentTarget.style.opacity = .7}>
                            <div style={{ width: 28, height: 28, borderRadius: '50%', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 900, color: '#fff', flexShrink: 0 }}>{abbr}</div>
                            <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--text)' }}>{lbl}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* QUANTA SECTION */}
            <div style={{ background: 'linear-gradient(135deg,var(--navy) 0%,#14042e 100%)', padding: '3rem 2rem', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', width: 350, height: 350, borderRadius: '50%', background: 'radial-gradient(circle,rgba(99,102,241,.2) 0%,transparent 70%)', top: -100, left: -80, pointerEvents: 'none' }} />
                <div style={{ maxWidth: 860, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem', alignItems: 'center' }}>
                    <div>
                        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, color: 'var(--cyan)', textTransform: 'uppercase', marginBottom: '.75rem' }}>Meet Your New On-Chain Workforce</div>
                        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', lineHeight: 1.2, marginBottom: '1rem' }}>
                            Quanta Sovereigna.<br /><span style={{ color: 'var(--gold)' }}>Your first AI agent hire.</span>
                        </h2>
                        <p style={{ fontSize: '.875rem', color: 'rgba(255,255,255,.55)', lineHeight: 1.75, marginBottom: '1.5rem' }}>
                            We don't just prompt AI — we deploy autonomous workers. Quanta S is our active on-chain agent capable of managing content, scheduling compute, and running daily operations 24/7.
                        </p>
                        {['Autonomous content creation & publishing', 'Programmable virtual card compute scheduling', 'On-chain identity via Virtuals Protocol', 'Daily ops: socials, reporting, community'].map(f => (
                            <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '.6rem', fontSize: '.82rem', color: 'rgba(255,255,255,.6)', marginBottom: '.55rem' }}>
                                <span style={{ width: 16, height: 16, borderRadius: '50%', background: 'rgba(74,222,128,.15)', border: '1px solid rgba(74,222,128,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, color: '#4ade80', flexShrink: 0 }}>✓</span>
                                {f}
                            </div>
                        ))}
                        <button onClick={() => onNavigate('consulting')} style={{ marginTop: '1.25rem', padding: '.75rem 1.5rem', background: 'var(--pink)', color: '#fff', border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all .2s' }}
                            onMouseEnter={e => e.target.style.background = 'var(--pink2)'}
                            onMouseLeave={e => e.target.style.background = 'var(--pink)'}>
                            Build One for Your Protocol →
                        </button>
                    </div>

                    {/* Quanta mockup card */}
                    <div style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 16, padding: '1.25rem', backdropFilter: 'blur(4px)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem', marginBottom: '1rem', paddingBottom: '.75rem', borderBottom: '1px solid rgba(255,255,255,.08)' }}>
                            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#7c3aed,var(--cyan))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 800, color: '#fff' }}>QS</div>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: 12, color: '#fff' }}>Quanta Sovereigna</div>
                                <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)' }}>Virtuals Protocol · Base</div>
                            </div>
                            <span style={{ marginLeft: 'auto', fontSize: 9, background: 'rgba(74,222,128,.12)', color: '#4ade80', border: '1px solid rgba(74,222,128,.25)', padding: '.2rem .55rem', borderRadius: 20, fontWeight: 700 }}>LIVE</span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.5rem', marginBottom: '.75rem' }}>
                            {[['Tasks Today', '12'], ['Token', '$QUANTA'], ['Articles', '5'], ['Uptime', '99.9%']].map(([l, v]) => (
                                <div key={l} style={{ background: 'rgba(255,255,255,.04)', borderRadius: 8, padding: '.65rem' }}>
                                    <div style={{ fontSize: 9, color: 'rgba(255,255,255,.35)', marginBottom: .2, textTransform: 'uppercase', letterSpacing: .6 }}>{l}</div>
                                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: l === 'Token' ? 'var(--gold)' : l === 'Uptime' ? '#4ade80' : '#fff' }}>{v}</div>
                                </div>
                            ))}
                        </div>
                        <div style={{ fontSize: 10, color: 'rgba(255,255,255,.3)', marginBottom: '.5rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: .7 }}>Latest Activity</div>
                        {[
                            ['var(--cyan)', 'Published: Cloudflare Architecture post'],
                            ['#4ade80', 'Scheduled: X thread · Apr 25 9am PT'],
                            ['var(--gold)', 'Signal scan: 3 articles flagged'],
                        ].map(([c, t]) => (
                            <div key={t} style={{ display: 'flex', alignItems: 'center', gap: '.5rem', fontSize: 11, color: 'rgba(255,255,255,.55)', marginBottom: .4 }}>
                                <span style={{ width: 5, height: 5, borderRadius: '50%', background: c, flexShrink: 0 }} />{t}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* SERVICES LADDER */}
            <div style={{ background: 'var(--bg)', padding: '3rem 2rem', borderTop: '1px solid var(--border)' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, color: 'var(--pink)', textTransform: 'uppercase', marginBottom: '.5rem' }}>Services</div>
                    <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text)', marginBottom: '.4rem' }}>The Engagement Ladder</h2>
                    <p style={{ fontSize: '.875rem', color: 'var(--muted)', maxWidth: 460, margin: '0 auto' }}>Start where you are. Scale to where you need to be.</p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: '1.25rem', maxWidth: 860, margin: '0 auto' }}>
                    {[
                        { ico: '◎', sub: 'Web3 Consulting', price: 'From $500', desc: 'Architecture and advisory for brand founders entering the Web3 ecosystem. Wallet setup, DeFi strategy, protocol selection.', btn: 'Book a Session →', c: 'var(--pink)', featured: false },
                        { ico: '◈', sub: 'Agent Development', price: 'From $2,000', desc: 'Custom AI agents built for on-chain operations. Your own Quanta — branded, deployed, running your community 24/7.', btn: 'Start Building →', c: 'var(--gold)', featured: true },
                        { ico: '◐', sub: 'Token Launch Strategy', price: 'From $3,500', desc: 'End-to-end playbook from IP strategy to post-launch ops. Tokenomics, smart contracts on Base, community bootstrapping.', btn: 'Plan Your Launch →', c: 'var(--gold2)', featured: false },
                    ].map(s => (
                        <div key={s.sub} className={`service-card${s.featured ? ' featured' : ''}`}>
                            {s.featured && <div style={{ position: 'absolute', top: 0, right: 0, background: 'var(--pink)', color: '#fff', fontSize: 9, fontWeight: 700, padding: '.3rem .9rem', borderRadius: '0 14px 0 8px', letterSpacing: .5 }}>Most Requested</div>}
                            <div style={{ width: 40, height: 40, borderRadius: 10, background: `rgba(${s.featured ? '233,30,140' : '255,184,0'},.15)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', marginBottom: '1rem' }}>{s.ico}</div>
                            <div style={{ fontSize: '.75rem', fontWeight: 700, color: s.featured ? 'rgba(255,255,255,.4)' : 'var(--muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: '.35rem' }}>{s.sub}</div>
                            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: s.c, marginBottom: '.5rem' }}>{s.price}</div>
                            <p style={{ fontSize: '.82rem', color: s.featured ? 'rgba(255,255,255,.55)' : 'var(--muted)', lineHeight: 1.6, marginBottom: '1.25rem' }}>{s.desc}</p>
                            <button onClick={() => onNavigate('consulting')}
                                style={{ width: '100%', padding: '.65rem', background: s.featured ? 'var(--pink)' : 'transparent', color: s.featured ? '#fff' : s.c, border: `1.5px solid ${s.c}`, borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all .2s', fontFamily: 'inherit' }}
                                onMouseEnter={e => { if (!s.featured) { e.target.style.background = s.c; e.target.style.color = '#fff' } }}
                                onMouseLeave={e => { if (!s.featured) { e.target.style.background = 'transparent'; e.target.style.color = s.c } }}>
                                {s.btn}
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* AGENT FLEET */}
            <div id="agents-section" style={{ background: 'var(--card)', padding: '3rem 2rem', borderTop: '1px solid var(--border)' }}>
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, color: 'var(--pink)', textTransform: 'uppercase', marginBottom: '.5rem' }}>Agent Fleet</div>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text)' }}>13 Agents. One Command.</h2>
                    <p style={{ fontSize: '.82rem', color: 'var(--muted)', maxWidth: 440, margin: '.3rem auto 0' }}>Your operations don't stop. Neither do ours.</p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '.75rem', maxWidth: 860, margin: '0 auto 1.25rem' }}>
                    {[
                        { name: 'OpenClaw', role: 'Infrastructure', status: 'Active', desc: 'Browser automation & primary operator. Runs your social, outreach, and web tasks.', cls: 's-active' },
                        { name: 'Quanta S', role: 'NewsDesk', status: 'Active', desc: 'NewsDesk intelligence + public identity on Virtuals. Your on-chain editor-in-chief.', cls: 's-active' },
                        { name: 'KNIGHT', role: 'TradeDesk', status: 'Observer', desc: 'TradeDesk on Conway Terminal. CDP management, treasury, Polymarket ops.', cls: 's-idle' },
                        { name: 'Claude Desktop', role: 'Command', status: 'Command', desc: 'Strategic command layer. Connects Linear, coordinates the full fleet.', cls: 's-dev' },
                    ].map(a => (
                        <div key={a.name} className="agent-card">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '.4rem', marginBottom: '.6rem' }}>
                                <span className={`status-dot ${a.cls}`} />
                                <span style={{ fontSize: 10, color: a.cls === 's-active' ? 'var(--success)' : a.cls === 's-idle' ? 'var(--warning)' : '#3b82f6', fontWeight: 600 }}>{a.status}</span>
                            </div>
                            <div style={{ fontWeight: 700, color: 'var(--text)', marginBottom: '.2rem' }}>{a.name}</div>
                            <div style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.4, marginBottom: '.6rem' }}>{a.desc}</div>
                            <span className="tag">{a.role}</span>
                        </div>
                    ))}
                </div>
                <div style={{ textAlign: 'center' }}>
                    <button onClick={() => onNavigate('agentchat')} style={{ padding: '.7rem 1.5rem', background: 'transparent', color: 'var(--text)', border: '1.5px solid var(--border)', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all .2s', fontFamily: 'inherit' }}
                        onMouseEnter={e => { e.target.style.borderColor = 'var(--pink)'; e.target.style.color = 'var(--pink)' }}
                        onMouseLeave={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.color = 'var(--text)' }}>
                        Talk to an Agent →
                    </button>
                </div>
            </div>

            {/* FOOTER */}
            <div style={{ background: ' var(--navy)', padding: '1.5rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                    <div className="nav-avatar" style={{ width: 28, height: 28, fontSize: 8 }}>SC</div>
                    <span style={{ color: '#fff', fontWeight: 700, fontSize: 13 }}>SUPERCOMPUTE</span>
                    <span style={{ color: 'rgba(255,255,255,.3)', fontSize: 11 }}>· supercompute.eth · Base Chain</span>
                </div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,.3)' }}>© 2026 Supercompute · Phase 1 · 1 Human + 13 Agents</div>
            </div>
        </div>
    );
}

Object.assign(window, { LandingPage });
