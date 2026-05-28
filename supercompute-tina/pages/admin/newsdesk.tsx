import Head from 'next/head'
import Link from 'next/link'
import styles from '@/styles/Home.module.css'

export default function AdminNewsDesk() {
  return (
    <>
      <Head><title>NewsDesk Admin — Supercompute</title></Head>
      <div className={styles.adminLayout}>
        <aside className={styles.adminSidebar}>
          <div style={{ fontFamily: 'var(--font-d)', fontSize: '0.9rem', color: 'var(--gold)', marginBottom: '2rem' }}>// ADMIN</div>
          <nav className={styles.adminNav}>
            <Link href="/admin">Dashboard</Link>
            <Link href="/admin/projects">Projects</Link>
            <Link href="/admin/school">School</Link>
            <Link href="/admin/consulting">Consulting</Link>
            <Link href="/admin/newsdesk" className="active">NewsDesk</Link>
            <Link href="/admin/tradedesk">TradeDesk</Link>
            <Link href="/">← Public Site</Link>
          </nav>
        </aside>
        <main className={styles.adminMain}>
          <h1 style={{ fontFamily: 'var(--font-d)', fontSize: '1.75rem', color: 'var(--gold)', marginBottom: '2rem' }}>// NEWSDESK ADMIN</h1>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
            <button className={styles.formBtn}>+ NEW ARTICLE</button>
          </div>
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Title', 'Category', 'Author', 'Status', 'Date', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontFamily: 'var(--font-m)', fontSize: '0.65rem', color: 'var(--gold)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { title: 'Welcome to Supercompute', cat: 'INTELLIGENCE', author: 'Quanta Sovereigna', status: 'Published', date: 'May 19' },
                  { title: 'Token Gating Deep Dive', cat: 'SIGNAL', author: 'Hermes', status: 'Published', date: 'May 18' },
                  { title: 'NewsDesk is Live', cat: 'DISPATCH', author: 'NewsDesk Lead', status: 'Published', date: 'May 17' },
                  { title: 'On-Chain Identity', cat: 'SOVEREIGNTY', author: 'Quanta Sovereigna', status: 'Published', date: 'May 16' },
                ].map(a => (
                  <tr key={a.title} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '0.75rem 1rem', fontFamily: 'var(--font-m)', fontSize: '0.8rem', color: 'var(--text)' }}>{a.title}</td>
                    <td style={{ padding: '0.75rem 1rem', fontFamily: 'var(--font-m)', fontSize: '0.7rem', color: 'var(--cyan)' }}>{a.cat}</td>
                    <td style={{ padding: '0.75rem 1rem', fontFamily: 'var(--font-m)', fontSize: '0.75rem', color: 'var(--muted)' }}>{a.author}</td>
                    <td style={{ padding: '0.75rem 1rem' }}><span style={{ fontFamily: 'var(--font-m)', fontSize: '0.65rem', color: 'var(--success)', padding: '0.2rem 0.5rem', border: '1px solid var(--success)', borderRadius: '3px' }}>{a.status}</span></td>
                    <td style={{ padding: '0.75rem 1rem', fontFamily: 'var(--font-m)', fontSize: '0.75rem', color: 'var(--muted)' }}>{a.date}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span style={{ fontFamily: 'var(--font-m)', fontSize: '0.7rem', color: 'var(--cyan)', cursor: 'pointer' }}>Edit</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </>
  )
}