import Head from 'next/head'
import Link from 'next/link'
import styles from '@/styles/Home.module.css'

const modules = [
  { num: '01', title: 'DeFi Foundations', desc: 'AMMs, liquidity pools, yield farming, and impermanent loss.', free: true, done: true },
  { num: '02', title: 'On-Chain Identity', desc: 'ENS resolution, wallet architecture, and soul-bound tokens.', free: true, done: true },
  { num: '03', title: 'Agent Systems', desc: 'Autonomous AI agents with on-chain identity and token-gated access.', free: false, done: false },
  { num: '04', title: 'Tokenomics Deep Dive', desc: 'Emission schedules, vesting, treasury management, and governance.', free: false, done: false },
  { num: '05', title: 'Smart Contract Security', desc: 'Auditing patterns, reentrancy guards, and access control.', free: false, done: false },
  { num: '06', title: 'Liquidity Strategy', desc: 'Bootstrapping liquidity, market-making, and token incentives.', free: false, done: false },
  { num: '07', title: 'Protocol Governance', desc: 'DAO structure, voting mechanisms, and on-chain proposals.', free: false, done: false },
]

export default function MemberSchool() {
  const completed = modules.filter(m => m.done).length
  const progress = Math.round((completed / modules.length) * 100)
  return (
    <>
      <Head><title>Web3 School — Supercompute</title></Head>
      <div className={styles.memberLayout}>
        <aside className={styles.memberSidebar}>
          <div style={{ fontFamily: 'var(--font-d)', fontSize: '0.9rem', color: 'var(--gold)', marginBottom: '2rem' }}>// SCHOOL II</div>
          <nav className={styles.memberNav}>
            <Link href="/app/dashboard">Dashboard</Link>
            <Link href="/app/projects">Projects</Link>
            <Link href="/app/staking">Staking</Link>
            <Link href="/app/publishing">Publishing</Link>
            <Link href="/app/school" className="active">School</Link>
            <Link href="/app/token">Token</Link>
            <Link href="/newsdesk">NewsDesk</Link>
            <Link href="/">← Public Site</Link>
          </nav>
        </aside>
        <main className={styles.memberMain}>
          <h1 style={{ fontFamily: 'var(--font-d)', fontSize: '1.75rem', color: 'var(--gold)', marginBottom: '0.5rem' }}>// SCHOOL II</h1>
          <p style={{ fontFamily: 'var(--font-m)', fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '2rem' }}>Member-only advanced curriculum.</p>
          {/* Progress */}
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '1.5rem', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span style={{ fontFamily: 'var(--font-m)', fontSize: '0.75rem', color: 'var(--text)' }}>Course Progress</span>
              <span style={{ fontFamily: 'var(--font-d)', fontSize: '1rem', color: 'var(--gold)' }}>{progress}%</span>
            </div>
            <div style={{ background: 'var(--navy3)', borderRadius: '4px', height: '8px' }}>
              <div style={{ width: `${progress}%`, background: 'var(--gold)', borderRadius: '4px', height: '100%', transition: 'width 0.3s' }} />
            </div>
            <div style={{ fontFamily: 'var(--font-m)', fontSize: '0.7rem', color: 'var(--muted)', marginTop: '0.5rem' }}>{completed} of {modules.length} modules completed</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {modules.map(mod => (
              <div key={mod.num} style={{
                display: 'flex', alignItems: 'center', gap: '1.5rem',
                padding: '1.25rem 1.5rem',
                background: 'var(--card)', border: `1px solid ${mod.done ? 'var(--success)' : 'var(--border)'}`,
                borderRadius: '8px', opacity: mod.done ? 0.7 : 1,
              }}>
                <span style={{ fontFamily: 'var(--font-d)', fontSize: '1.25rem', color: mod.done ? 'var(--success)' : 'var(--gold)', minWidth: '36px' }}>
                  {mod.done ? '✓' : mod.num}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'var(--font-d)', fontSize: '0.95rem', color: 'var(--text)', marginBottom: '0.2rem' }}>{mod.title}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{mod.desc}</div>
                </div>
                <span style={{ fontFamily: 'var(--font-m)', fontSize: '0.65rem', color: mod.done ? 'var(--success)' : 'var(--gold)', letterSpacing: '0.1em', border: `1px solid ${mod.done ? 'var(--success)' : 'var(--gold)'}`, padding: '0.2rem 0.6rem', borderRadius: '4px' }}>
                  {mod.done ? 'COMPLETED' : (mod.free ? 'FREE' : 'MEMBERS')}
                </span>
              </div>
            ))}
          </div>
        </main>
      </div>
    </>
  )
}