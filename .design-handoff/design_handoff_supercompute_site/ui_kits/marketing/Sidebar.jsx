/* @jsx React.createElement */
/* Sidebar — shared by marketing + app surfaces */
const NAV_PUBLIC = [
  { id: 'home', icon: '⌂', label: 'Home' },
  { id: 'about', icon: '◎', label: 'About' },
  { id: 'social-feed', icon: '◉', label: 'Social Content' },
  { id: 'blog', icon: '▤', label: 'Blog' },
  { id: 'consulting', icon: '◑', label: 'Consulting' },
];
const NAV_MEMBER = [
  { id: 'projects', icon: '◧', label: 'Projects', locked: true },
  { id: 'staking', icon: '◈', label: 'Staking', locked: true },
  { id: 'token', icon: '◆', label: '$SCOM Token', locked: true },
  { id: 'assets', icon: '◆', label: 'Assets', locked: true },
  { id: 'social', icon: '◉', label: 'Social Feed', locked: true },
  { id: 'alerts', icon: '◎', label: 'Alerts', badge: { kind: 'num', text: '3' } },
  { id: 'profile', icon: '◐', label: 'Profile', locked: true },
  { id: 'agentchat', icon: '◈', label: 'Agent Chat', badge: { kind: 'num', text: '4' } },
  { id: 'web3school', icon: '◎', label: 'Web3 School', locked: true },
  { id: 'socialmedia', icon: '◧', label: 'Social Media', locked: true },
];
const NAV_ADMIN = [
  { id: 'dashboard', icon: '▣', label: 'Dashboard', badge: { kind: 'gold', text: 'A' } },
  { id: 'community', icon: '◈', label: 'Community', badge: { kind: 'gold', text: 'A' } },
  { id: 'newsdesk', icon: '◧', label: 'NewsDesk CMS', badge: { kind: 'gold', text: 'A' } },
  { id: 'apiStatus', icon: '◐', label: 'API Status', badge: { kind: 'gold', text: 'A' } },
];

function NavItem({ item, active, onClick }) {
  const cls = ['nav-item', active ? 'active' : '', item.locked ? 'locked' : ''].filter(Boolean).join(' ');
  const badge = item.badge && (
    <span className={`nav-badge nb-${item.badge.kind}`}>{item.badge.text}</span>
  );
  const lockBadge = item.locked && <span className="nav-badge nb-lock">🔒</span>;
  return (
    <div className={cls} onClick={onClick}>
      <span className="nav-ico">{item.icon}</span>
      {item.label}
      {badge || lockBadge}
    </div>
  );
}

function Sidebar({ active, onNav, role = 'user', wallet }) {
  return (
    <nav className="nav">
      <div className="nav-brand">
        <img src="sc-logo.jpg" alt="SC" />
        <div>
          <div className="nav-brand-text">SUPERCOMPUTE</div>
          <div className="nav-brand-sub">Phase 1 · Base Chain</div>
        </div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '.5rem' }}>
        <div className="nav-section">Public</div>
        {NAV_PUBLIC.map(it => <NavItem key={it.id} item={it} active={active === it.id} onClick={() => onNav(it.id)} />)}
        <div className="nav-div" />
        <div className="nav-section">Member</div>
        {NAV_MEMBER.map(it => <NavItem key={it.id} item={it} active={active === it.id} onClick={() => onNav(it.id)} />)}
        {role === 'admin' && (
          <>
            <div className="nav-div" />
            <div className="nav-section">Admin</div>
            {NAV_ADMIN.map(it => <NavItem key={it.id} item={it} active={active === it.id} onClick={() => onNav(it.id)} />)}
          </>
        )}
      </div>
      <div className="nav-bottom">
        <button className="btn-wallet">
          <span>◎</span><span>{wallet || 'Connect Wallet'}</span>
        </button>
        <div className="bip-badge">
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span className="pulse-dot" />
            <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,.85)', letterSpacing: '.3px' }}>BUILDING IN PUBLIC</span>
          </div>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,.35)', marginTop: 2, lineHeight: 1.4 }}>
            1 builder · 13 agents<br />Phase 1: May 2026
          </div>
        </div>
      </div>
    </nav>
  );
}

window.Sidebar = Sidebar;
