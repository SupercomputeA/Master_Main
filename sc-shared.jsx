// sc-shared.jsx — Nav, TopBar, Card, Badge, StatCard + shared utilities
const { useState, useEffect } = React;

const NAV_ITEMS = {
    public: [
        { id: 'home', label: 'Home', ico: '⌂' },
        { id: 'blog', label: 'Blog', ico: '▤' },
        { id: 'consulting', label: 'Consulting', ico: '◑' },
    ],
    member: [
        { id: 'dashboard', label: 'Dashboard', ico: '▣', badge: null },
        { id: 'newsdesk', label: 'NewsDesk', ico: '◧', badge: { cls: 'nb-pink', txt: 'Live' } },
        { id: 'tradedesk', label: 'TradeDesk', ico: '◈', badge: { cls: 'nb-lock', txt: '🔒' } },
        { id: 'assets', label: 'Assets', ico: '◆', badge: null },
        { id: 'agentchat', label: 'Agent Chat', ico: '◉', badge: { cls: 'nb-num', txt: '2' } },
        { id: 'socialmedia', label: 'Social', ico: '◐', badge: { cls: 'nb-lock', txt: '🔒' } },
    ],
    admin: [
        { id: 'community', label: 'Community', ico: '◈', badge: { cls: 'nb-gold', txt: 'A' } },
        { id: 'web3school', label: 'Web3 School', ico: '◎', badge: { cls: 'nb-gold', txt: 'A' } },
        { id: 'projects', label: 'Projects', ico: '◧', badge: { cls: 'nb-gold', txt: 'A' } },
        { id: 'security', label: 'Security', ico: '◐', badge: { cls: 'nb-gold', txt: 'A' } },
        { id: 'settings', label: 'Settings', ico: '◑', badge: { cls: 'nb-gold', txt: 'A' } },
    ]
};

function Nav({ page, auth, wallet, onNavigate, onWalletToggle }) {
    const isAdmin = auth && auth.role === 'admin';

    function NavItem({ item, section }) {
        const active = page === item.id;
        const adminSection = section === 'admin';
        const memberLocked = section === 'member' && !auth;
        const adminLocked = section === 'admin' && !isAdmin;

        function handleClick() {
            if (memberLocked) { window.showToast('Sign in to access member features'); return; }
            if (adminLocked) { window.showToast('Admin access required'); return; }
            onNavigate(item.id);
        }

        return (
            <div
                className={`nav-item${active ? (adminSection ? ' admin-act' : ' active') : ''}`}
                onClick={handleClick}
            >
                <span className="nav-ico">{item.ico}</span>
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.badge && (
                    <span className={`nav-badge ${item.badge.cls}`}>{item.badge.txt}</span>
                )}
                {(memberLocked || adminLocked) && !item.badge && (
                    <span className="nav-badge nb-lock">🔒</span>
                )}
            </div>
        );
    }

    return (
        <nav className="sc-nav">
            {/* Brand */}
            <div className="nav-brand">
                <div className="nav-avatar">SC</div>
                <div>
                    <div className="nav-brand-text">SUPERCOMPUTE</div>
                    <div className="nav-brand-sub">Phase 1 · Base Chain</div>
                </div>
            </div>

            {/* Public */}
            <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '.5rem' }}>
                <div className="nav-section">Public</div>
                {NAV_ITEMS.public.map(item => <NavItem key={item.id} item={item} section="public" />)}

                <div className="nav-div" />
                <div className="nav-section">Member</div>
                {NAV_ITEMS.member.map(item => <NavItem key={item.id} item={item} section="member" />)}

                {(isAdmin) && <>
                    <div className="nav-div" />
                    <div className="nav-section">Admin</div>
                    {NAV_ITEMS.admin.map(item => <NavItem key={item.id} item={item} section="admin" />)}
                </>}

                {!isAdmin && <>
                    <div className="nav-div" />
                    <div className="nav-section">Admin</div>
                    {NAV_ITEMS.admin.map(item => (
                        <div key={item.id} className="nav-item" style={{ opacity: .4, cursor: 'default' }}
                            onClick={() => window.showToast('Admin access required')}>
                            <span className="nav-ico">{item.ico}</span>
                            <span style={{ flex: 1 }}>{item.label}</span>
                            <span className="nav-badge nb-gold">{item.badge?.txt}</span>
                        </div>
                    ))}
                </>}
            </div>

            {/* Bottom */}
            <div className="nav-bottom">
                <button
                    className={`btn-wallet${wallet ? ' connected' : ''}`}
                    onClick={onWalletToggle}
                >
                    <span style={{ fontSize: 12 }}>◎</span>
                    {wallet ? `${wallet.slice(0, 6)}...${wallet.slice(-4)}` : 'Connect Wallet'}
                </button>

                <div className="bip-badge" style={{ marginTop: '.4rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <span className="pulse-dot" />
                        <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,.85)', letterSpacing: .3 }}>
                            {auth ? 'AGENTS ONLINE' : 'BUILDING IN PUBLIC'}
                        </span>
                    </div>
                    <div style={{ fontSize: 9, color: 'rgba(255,255,255,.35)', marginTop: 2, lineHeight: 1.4 }}>
                        {auth ? 'KNIGHT · Quanta S · Quick' : '1 builder · 13 agents'}
                    </div>
                </div>

                {auth && (
                    <div style={{ marginTop: '.4rem', padding: '.4rem .5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 11, color: 'rgba(255,255,255,.5)' }}>
                            {auth.role === 'admin' ? '⭐ ' : ''}{auth.name}
                        </span>
                        <span
                            style={{ fontSize: 10, color: 'rgba(255,255,255,.3)', cursor: 'pointer', textDecoration: 'underline' }}
                            onClick={() => window.doLogout()}
                        >sign out</span>
                    </div>
                )}
            </div>
        </nav>
    );
}

function TopBar({ title, subtitle, actions, tabs, activeTab, onTabChange }) {
    return (
        <>
            <div className="topbar">
                <div>
                    <div className="topbar-title">{title}</div>
                    {subtitle && <div className="topbar-sub">{subtitle}</div>}
                </div>
                {actions && <div className="topbar-actions">{actions}</div>}
            </div>
            {tabs && (
                <div className="dash-tabs">
                    {tabs.map(t => (
                        <div key={t} className={`dash-tab${activeTab === t ? ' active' : ''}`} onClick={() => onTabChange(t)}>{t}</div>
                    ))}
                </div>
            )}
        </>
    );
}

function Card({ children, className = '', style = {} }) {
    return (
        <div className={`card ${className}`} style={style}>{children}</div>
    );
}

function Badge({ variant = 'live', children }) {
    return <span className={`badge badge-${variant}`}>{children}</span>;
}

function StatCard({ label, value, sub, subVariant = 'neu', mini }) {
    const bars = mini || [4, 6, 5, 7, 5, 8, 6, 9, 7, 8];
    return (
        <div className="stat-card">
            <div className="stat-label">{label}</div>
            <div className="stat-val">{value}</div>
            {sub && <div className={`stat-sub s-${subVariant}`}>{sub}</div>}
            <div className="mini-chart" style={{ marginTop: '.5rem' }}>
                {bars.map((h, i) => (
                    <div key={i} className="mini-bar" style={{ height: `${h * 3.5}px` }} />
                ))}
            </div>
        </div>
    );
}

function ActivityItem({ icon, title, sub, time }) {
    return (
        <div className="card-sm card-hover" style={{ display: 'flex', alignItems: 'center', gap: '.75rem', marginBottom: '.5rem' }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(233,30,140,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 13 }}>
                {icon}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 12, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>{sub}</div>
            </div>
            <div style={{ fontSize: 10, color: 'var(--muted)', flexShrink: 0 }}>{time}</div>
        </div>
    );
}

function AgentStatusCard({ name, role, status, activity, color }) {
    const dotClass = status === 'active' ? 's-active' : status === 'idle' ? 's-idle' : 's-dev';
    const colorMap = { pink: 'rgba(233,30,140,.1)', cyan: 'rgba(0,212,255,.1)', gold: 'rgba(255,184,0,.1)' };
    return (
        <div className="card-sm" style={{ display: 'flex', alignItems: 'center', gap: '.75rem', marginBottom: '.5rem', background: `${colorMap[color] || 'rgba(233,30,140,.05)'}`, border: '1px solid var(--border)' }}>
            <span className={`status-dot ${dotClass}`} style={{ marginLeft: 2 }} />
            <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 12, color: 'var(--text)' }}>{name}</div>
                <div style={{ fontSize: 10, color: 'var(--muted)' }}>{role} · {activity}</div>
            </div>
            <span className="badge badge-live" style={{ fontSize: 9 }}>{status}</span>
        </div>
    );
}

function ProgBar({ pct }) {
    return (
        <div className="prog-track">
            <div className="prog-fill" style={{ width: `${pct}%` }} />
        </div>
    );
}

Object.assign(window, { Nav, TopBar, Card, Badge, StatCard, ActivityItem, AgentStatusCard, ProgBar });
