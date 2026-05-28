import Head from 'next/head'
import Link from 'next/link'
import styles from '@/styles/Home.module.css'

const projects = [
  { name: 'Glyph Foundry', ticker: '$GLYPH', stack: 'Solidity · The Graph · Base', status: 'Active', desc: 'On-chain generative art protocol with royalty streaming.' },
  { name: 'Bracket Studio', ticker: '$BRKT', stack: 'ERC-721 · ERC-1155 · Base', status: 'Active', desc: 'Creative studio for on-chain media and IP licensing.' },
  { name: 'Spool Protocol', ticker: '$SPOOL', stack: 'EigenLayer · AVS · Base', status: 'Active', desc: 'Restaking infrastructure for Base Chain validators.' },
]

export default function Projects() {
  return (
    <>
      <Head><title>Projects — Supercompute</title></Head>
      <div className={styles.memberLayout}>
        <aside className={styles.memberSidebar}>
          <div style={{ fontFamily: 'var(--font-d)', fontSize: '0.9rem', color: 'var(--gold)', marginBottom: '2rem' }}>// PROJECTS</div>
          <nav className={styles.memberNav}>
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/app/projects" className="active">Projects</Link>
            <Link href="/app/staking">Staking</Link>
            <Link href="/app/publishing">Publishing</Link>
            <Link href="/app/school">School</Link>
            <Link href="/app/token">Token</Link>
            <Link href="/newsdesk">NewsDesk</Link>
            <Link href="/">← Public Site</Link>
          </nav>
        </aside>
        <main className={styles.memberMain}>
          <h1 style={{ fontFamily: 'var(--font-d)', fontSize: '1.75rem', color: 'var(--gold)', marginBottom: '0.5rem' }}>// PORTFOLIO</h1>
          <p style={{ fontFamily: 'var(--font-m)', fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '2rem' }}>Active projects in the Supercompute ecosystem.</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            {projects.map(p => (
              <div key={p.ticker} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <div>
                    <span style={{ fontFamily: 'var(--font-d)', fontSize: '1.25rem', color: 'var(--text)' }}>{p.name}</span>
                    <span style={{ fontFamily: 'var(--font-m)', fontSize: '0.7rem', color: 'var(--gold)', marginLeft: '0.75rem' }}>{p.ticker}</span>
                  </div>
                  <span style={{ fontFamily: 'var(--font-m)', fontSize: '0.65rem', color: 'var(--success)', letterSpacing: '0.1em' }}>● {p.status}</span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '0.75rem', lineHeight: 1.5 }}>{p.desc}</p>
                <div style={{ fontFamily: 'var(--font-m)', fontSize: '0.65rem', color: 'var(--cyan)', letterSpacing: '0.05em' }}>{p.stack}</div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </>
  )
}