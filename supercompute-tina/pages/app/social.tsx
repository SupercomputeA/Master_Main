import Head from 'next/head'
import Link from 'next/link'
import styles from '@/styles/Home.module.css'

const activityFeed = [
  { user: 'miriam.eth', action: 'posted a update', target: 'Token Gating Deep Dive', time: '2m ago', avatar: 'M' },
  { user: 'condor_ai', action: 'started streaming', target: 'Market Analysis Q2', time: '15m ago', avatar: 'C' },
  { user: 'satoshi_n', action: 'commented on', target: 'HERMES Agent Launch', time: '1h ago', avatar: 'S' },
  { user: 'quanta_ops', action: 'shared', target: 'Staking Protocol Update', time: '2h ago', avatar: 'Q' },
  { user: 'bracket_studio', action: 'published', target: 'New IP License', time: '3h ago', avatar: 'B' },
]

const streamHistory = [
  { title: 'DeFi Strategy Session', date: 'May 18', duration: '1h 24m', viewers: '142', status: 'Recorded' },
  { title: 'Agent Fleet Overview', date: 'May 15', duration: '48m', viewers: '89', status: 'Recorded' },
  { title: 'Tokenomics 101', date: 'May 12', duration: '2h 10m', viewers: '203', status: 'Recorded' },
  { title: 'Live: Market Pulse', date: 'May 10', duration: '1h 05m', viewers: '316', status: 'Recorded' },
]

const communityConnections = [
  { name: 'miriam.eth', role: 'Contributor', mutual: 12, online: true },
  { name: 'condor_ai', role: 'Agent', mutual: 8, online: true },
  { name: 'satoshi_n', role: 'Member', mutual: 5, online: false },
  { name: 'quanta_ops', role: 'Agent', mutual: 24, online: true },
  { name: 'bracket_studio', role: 'Partner', mutual: 15, online: false },
  { name: 'knight_defi', role: 'Member', mutual: 3, online: true },
]

const quickActions = [
  { label: 'Start Stream', icon: '▶', color: 'var(--danger)' },
  { label: 'New Post', icon: '✎', color: 'var(--cyan)' },
  { label: 'Invite Member', icon: '✚', color: 'var(--gold)' },
  { label: 'Settings', icon: '⚙', color: 'var(--muted)' },
]

export default function Social() {
  return (
    <>
      <Head><title>Social — Supercompute</title></Head>
      <div className={styles.memberLayout}>
        <aside className={styles.memberSidebar}>
          <div style={{ fontFamily: 'var(--font-d)', fontSize: '0.9rem', color: 'var(--gold)', marginBottom: '2rem' }}>// SOCIAL</div>
          <nav className={styles.memberNav}>
            <Link href="/app/dashboard">Dashboard</Link>
            <Link href="/app/projects">Projects</Link>
            <Link href="/app/staking">Staking</Link>
            <Link href="/app/publishing">Publishing</Link>
            <Link href="/app/school">School</Link>
            <Link href="/app/social" className="active">Social</Link>
            <Link href="/app/token">Token</Link>
            <Link href="/newsdesk">NewsDesk</Link>
            <Link href="/">← Public Site</Link>
          </nav>
        </aside>
        <main className={styles.memberMain}>
          <h1 style={{ fontFamily: 'var(--font-d)', fontSize: '1.75rem', color: 'var(--gold)', marginBottom: '2rem' }}>// MEMBER SOCIAL HUB</h1>

          {/* Stats Row */}
          <div className={styles.statsGrid} style={{ marginBottom: '2rem' }}>
            <div className={styles.statTile}>
              <div className={styles.statLabel}>Connections</div>
              <div className={styles.statValue}>48</div>
              <div className={styles.statSub}>12 Mutual</div>
            </div>
            <div className={styles.statTile}>
              <div className={styles.statLabel}>Posts</div>
              <div className={styles.statValue}>127</div>
              <div className={styles.statSub}>This Month</div>
            </div>
            <div className={styles.statTile}>
              <div className={styles.statLabel}>Stream Time</div>
              <div className={styles.statValue}>24h</div>
              <div className={styles.statSub}>Total</div>
            </div>
            <div className={styles.statTile}>
              <div className={styles.statLabel}>Reach</div>
              <div className={styles.statValue}>2.4k</div>
              <div className={styles.statSub}>Followers</div>
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem' }}>
            {quickActions.map(action => (
              <button key={action.label} style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.6rem 1rem', background: 'var(--card)', border: '1px solid var(--border)',
                borderRadius: '6px', color: 'var(--text)', fontFamily: 'var(--font-m)', fontSize: '0.75rem',
                transition: 'all 0.2s', cursor: 'pointer'
              }}
              onMouseOver={e => { e.currentTarget.style.borderColor = action.color; e.currentTarget.style.color = action.color; }}
              onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text)'; }}
              >
                <span>{action.icon}</span> {action.label}
              </button>
            ))}
          </div>

          {/* Main Grid: Activity Feed + Sidebar */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem' }}>

            {/* Activity Feed */}
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '1.5rem' }}>
              <h3 style={{ fontFamily: 'var(--font-d)', color: 'var(--gold)', marginBottom: '1.25rem' }}>// ACTIVITY FEED</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {activityFeed.map((item, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: '1rem',
                    padding: '0.875rem 0', borderBottom: i < activityFeed.length - 1 ? '1px solid var(--border)' : 'none'
                  }}>
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '50%',
                      background: 'var(--surface-1)', border: '1px solid var(--border)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: 'var(--font-m)', fontSize: '0.8rem', color: 'var(--gold)', flexShrink: 0
                    }}>
                      {item.avatar}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: 'var(--font-m)', fontSize: '0.8rem' }}>
                        <span style={{ color: 'var(--cyan)' }}>{item.user}</span>
                        {' '}{item.action}{' '}
                        <span style={{ color: 'var(--gold)' }}>{item.target}</span>
                      </div>
                      <div style={{ fontFamily: 'var(--font-m)', fontSize: '0.65rem', color: 'var(--muted)' }}>{item.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

              {/* Stream History */}
              <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ fontFamily: 'var(--font-d)', color: 'var(--gold)', fontSize: '1rem' }}>// STREAMS</h3>
                  <span style={{ fontFamily: 'var(--font-m)', fontSize: '0.65rem', color: 'var(--cyan)' }}>View All →</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {streamHistory.map((stream, i) => (
                    <div key={i} style={{
                      padding: '0.75rem', background: 'var(--surface-1)', borderRadius: '6px',
                      border: '1px solid var(--border)'
                    }}>
                      <div style={{ fontFamily: 'var(--font-m)', fontSize: '0.8rem', color: 'var(--text)', marginBottom: '0.25rem' }}>{stream.title}</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-m)', fontSize: '0.65rem', color: 'var(--muted)' }}>
                        <span>{stream.date} · {stream.duration}</span>
                        <span style={{ color: 'var(--success)' }}>{stream.viewers} viewers</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Community Connections */}
              <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ fontFamily: 'var(--font-d)', color: 'var(--gold)', fontSize: '1rem' }}>// CONNECTIONS</h3>
                  <span style={{ fontFamily: 'var(--font-m)', fontSize: '0.65rem', color: 'var(--cyan)' }}>Find Members →</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {communityConnections.map((member, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', gap: '0.75rem',
                      padding: '0.5rem', borderRadius: '6px', transition: 'background 0.2s', cursor: 'pointer'
                    }}
                    onMouseOver={e => { e.currentTarget.style.background = 'var(--gold-dim)'; }}
                    onMouseOut={e => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      <div style={{ position: 'relative', flexShrink: 0 }}>
                        <div style={{
                          width: '32px', height: '32px', borderRadius: '50%',
                          background: 'var(--surface-1)', border: '1px solid var(--border)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontFamily: 'var(--font-m)', fontSize: '0.7rem', color: 'var(--gold)'
                        }}>
                          {member.name[0].toUpperCase()}
                        </div>
                        {member.online && (
                          <div style={{
                            position: 'absolute', bottom: '0', right: '0',
                            width: '8px', height: '8px', borderRadius: '50%',
                            background: 'var(--success)', border: '2px solid var(--card)'
                          }} />
                        )}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontFamily: 'var(--font-m)', fontSize: '0.75rem', color: 'var(--text)' }}>{member.name}</div>
                        <div style={{ fontFamily: 'var(--font-m)', fontSize: '0.6rem', color: 'var(--muted)' }}>{member.role}</div>
                      </div>
                      <div style={{ fontFamily: 'var(--font-m)', fontSize: '0.6rem', color: 'var(--gold)' }}>{member.mutual} mutual</div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </main>
      </div>
    </>
  )
}
