import Head from 'next/head'
import Link from 'next/link'
import { useState } from 'react'
import styles from '@/styles/Home.module.css'

// SIWE placeholder — Web3 wallet connect goes here
function WalletConnect() {
  const [connected, setConnected] = useState(false)
  const [wallet, setWallet] = useState('')

  const connect = async () => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      try {
        const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' })
        setWallet(accounts[0])
        setConnected(true)
      } catch (e) {
        console.error(e)
      }
    }
  }

  if (connected) {
    return (
      <div style={{ fontFamily: 'var(--font-m)', fontSize: '0.75rem', color: 'var(--gold)' }}>
        ● {wallet.slice(0, 6)}...{wallet.slice(-4)}
      </div>
    )
  }
  return (
    <button onClick={connect} className={styles.navCta} style={{ textDecoration: 'none' }}>
      Connect Wallet
    </button>
  )
}

export default function Dashboard() {
  return (
    <>
      <Head><title>Dashboard — Supercompute</title></Head>
      <div className={styles.memberLayout}>
        <aside className={styles.memberSidebar}>
          <div style={{ fontFamily: 'var(--font-d)', fontSize: '0.9rem', color: 'var(--gold)', marginBottom: '2rem' }}>// SUPERCOMPUTE</div>
          <nav className={styles.memberNav}>
            <Link href="/app/dashboard" className="active">Dashboard</Link>
            <Link href="/app/projects">Projects</Link>
            <Link href="/app/staking">Staking</Link>
            <Link href="/app/publishing">Publishing</Link>
            <Link href="/app/school">School</Link>
            <Link href="/app/token">Token</Link>
            <Link href="/newsdesk">NewsDesk</Link>
            <Link href="/">← Public Site</Link>
          </nav>
          <div style={{ marginTop: 'auto', paddingTop: '2rem', borderTop: '1px solid var(--border)' }}>
            <WalletConnect />
          </div>
        </aside>
        <main className={styles.memberMain}>
          <h1 style={{ fontFamily: 'var(--font-d)', fontSize: '1.75rem', color: 'var(--gold)', marginBottom: '2rem' }}>// COMMAND CENTER</h1>
          <div className={styles.statsGrid}>
            <div className={styles.statTile}>
              <div className={styles.statLabel}>Portfolio Value</div>
              <div className={styles.statValue}>$0.00</div>
              <div className={styles.statSub}>Base Chain</div>
            </div>
            <div className={styles.statTile}>
              <div className={styles.statLabel}>Staked $QUANTA</div>
              <div className={styles.statValue}>0</div>
              <div className={styles.statSub}>Active</div>
            </div>
            <div className={styles.statTile}>
              <div className={styles.statLabel}>Agent Fleet</div>
              <div className={styles.statValue}>3</div>
              <div className={styles.statSub}>All Operational</div>
            </div>
            <div className={styles.statTile}>
              <div className={styles.statLabel}>NewsDesk</div>
              <div className={styles.statValue}>5</div>
              <div className={styles.statSub}>Articles</div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '1.5rem' }}>
              <h3 style={{ fontFamily: 'var(--font-d)', color: 'var(--gold)', marginBottom: '1rem' }}>// AGENT STATUS</h3>
              {[
                { name: 'HERMES', role: 'BackOffice', status: '● Operational', color: 'var(--success)' },
                { name: 'QUANTA', role: 'Operations', status: '● Operational', color: 'var(--success)' },
                { name: 'CONDOR', role: 'Trade', status: '● Operational', color: 'var(--success)' },
              ].map(agent => (
                <div key={agent.name} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontFamily: 'var(--font-m)', fontSize: '0.8rem' }}>{agent.name} <span style={{ color: 'var(--muted)' }}>{agent.role}</span></span>
                  <span style={{ fontFamily: 'var(--font-m)', fontSize: '0.75rem', color: agent.color }}>{agent.status}</span>
                </div>
              ))}
            </div>
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '1.5rem' }}>
              <h3 style={{ fontFamily: 'var(--font-d)', color: 'var(--gold)', marginBottom: '1rem' }}>// RECENT DISPATCHES</h3>
              {[
                { title: 'Welcome to Supercompute', date: 'May 19' },
                { title: 'Token Gating Deep Dive', date: 'May 18' },
                { title: 'NewsDesk is Live', date: 'May 17' },
              ].map(post => (
                <div key={post.title} style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ fontFamily: 'var(--font-m)', fontSize: '0.8rem' }}>{post.title}</div>
                  <div style={{ fontFamily: 'var(--font-m)', fontSize: '0.65rem', color: 'var(--muted)' }}>{post.date}</div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </>
  )
}