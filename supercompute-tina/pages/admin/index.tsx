import Head from 'next/head'
import Link from 'next/link'
import styles from '@/styles/Home.module.css'

export default function AdminDashboard() {
  return (
    <>
      <Head><title>Admin — Supercompute</title></Head>
      <div className={styles.adminLayout}>
        <aside className={styles.adminSidebar}>
          <div style={{ fontFamily: 'var(--font-d)', fontSize: '0.9rem', color: 'var(--gold)', marginBottom: '2rem' }}>// ADMIN</div>
          <nav className={styles.adminNav}>
            <Link href="/admin">Dashboard</Link>
            <Link href="/admin/projects">Projects</Link>
            <Link href="/admin/school">School</Link>
            <Link href="/admin/consulting">Consulting</Link>
            <Link href="/admin/newsdesk">NewsDesk</Link>
            <Link href="/admin/tradedesk">TradeDesk</Link>
            <Link href="/">← Public Site</Link>
          </nav>
        </aside>
        <main className={styles.adminMain}>
          <h1 style={{ fontFamily: 'var(--font-d)', fontSize: '1.75rem', color: 'var(--gold)', marginBottom: '2rem' }}>// COMMAND CENTER</h1>
          <div className={styles.statsGrid}>
            {[
              { label: 'Total Articles', value: '5', sub: 'NewsDesk' },
              { label: 'School Modules', value: '7', sub: '2 free, 5 members' },
              { label: 'Active Projects', value: '4', sub: 'On Base' },
              { label: 'Agents Online', value: '3', sub: 'All operational' },
            ].map(s => (
              <div key={s.label} className={styles.statTile}>
                <div className={styles.statLabel}>{s.label}</div>
                <div className={styles.statValue}>{s.value}</div>
                <div className={styles.statSub}>{s.sub}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '1.5rem' }}>
              <h3 style={{ fontFamily: 'var(--font-d)', color: 'var(--gold)', marginBottom: '1rem' }}>// QUICK ACTIONS</h3>
              {[
                { label: '+ New Article', href: '/admin/newsdesk' },
                { label: '+ New Module', href: '/admin/school' },
                { label: '+ New Project', href: '/admin/projects' },
                { label: '+ New Engagement', href: '/admin/consulting' },
              ].map(a => (
                <div key={a.label} style={{ marginBottom: '0.5rem' }}>
                  <Link href={a.href} style={{ fontFamily: 'var(--font-m)', fontSize: '0.8rem', color: 'var(--cyan)' }}>{a.label} →</Link>
                </div>
              ))}
            </div>
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '1.5rem' }}>
              <h3 style={{ fontFamily: 'var(--font-d)', color: 'var(--gold)', marginBottom: '1rem' }}>// AGENT FLEET</h3>
              {[
                { name: 'HERMES', role: 'BackOffice', status: '● Operational', color: 'var(--success)' },
                { name: 'QUANTA', role: 'Operations', status: '● Operational', color: 'var(--success)' },
                { name: 'CONDOR', role: 'Trade', status: '● Operational', color: 'var(--success)' },
              ].map(a => (
                <div key={a.name} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontFamily: 'var(--font-m)', fontSize: '0.75rem' }}>{a.name} <span style={{ color: 'var(--muted)' }}>{a.role}</span></span>
                  <span style={{ fontFamily: 'var(--font-m)', fontSize: '0.7rem', color: a.color }}>{a.status}</span>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </>
  )
}