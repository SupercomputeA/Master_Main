import Head from 'next/head'
import Link from 'next/link'
import { useState } from 'react'
import styles from '@/styles/Home.module.css'

const allocation = [
  { label: 'Community Rewards', pct: 35, color: 'var(--gold)' },
  { label: 'Team & Contributors', pct: 20, color: 'var(--cyan)' },
  { label: 'Treasury', pct: 25, color: 'var(--success)' },
  { label: 'Liquidity Bootstrapping', pct: 15, color: 'var(--eth-blue)' },
  { label: 'Ecosystem Fund', pct: 5, color: 'var(--pink)' },
]

const txHistory = [
  { type: 'Stake', amount: '500 $QUANTA', address: '0xea94...f328', time: '2 min ago' },
  { type: 'Reward Claim', amount: '+42.5 $QUANTA', address: '0xea94...f328', time: '1 hr ago' },
  { type: 'Transfer In', amount: '+200 $QUANTA', address: '0x3f7a...b901', time: '3 hr ago' },
  { type: 'Governance Vote', amount: 'Cast', address: '0xea94...f328', time: '1 day ago' },
]

export default function Token() {
  const [wallet] = useState('')
  return (
    <>
      <Head><title>$QUANTA — Supercompute</title></Head>
      <div className={styles.memberLayout}>
        <aside className={styles.memberSidebar}>
          <div style={{ fontFamily: 'var(--font-d)', fontSize: '0.9rem', color: 'var(--gold)', marginBottom: '2rem' }}>// $QUANTA</div>
          <nav className={styles.memberNav}>
            <Link href="/app/dashboard">Dashboard</Link>
            <Link href="/app/projects">Projects</Link>
            <Link href="/app/staking">Staking</Link>
            <Link href="/app/publishing">Publishing</Link>
            <Link href="/app/school">School</Link>
            <Link href="/app/token" className="active">Token</Link>
            <Link href="/newsdesk">NewsDesk</Link>
            <Link href="/">← Public Site</Link>
          </nav>
        </aside>
        <main className={styles.memberMain}>
          {/* Token Hero */}
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '2rem', marginBottom: '2rem', textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-m)', fontSize: '0.7rem', color: 'var(--muted)', letterSpacing: '0.2em', marginBottom: '0.5rem' }}>// COMMUNITY TOKEN</div>
            <h1 style={{ fontFamily: 'var(--font-d)', fontSize: '3.5rem', color: 'var(--gold)', marginBottom: '0.25rem' }}>$QUANTA</h1>
            <p style={{ fontFamily: 'var(--font-m)', fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '1.5rem' }}>Base Chain · ERC-20 · Governance</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
              <div><div style={{ fontFamily: 'var(--font-m)', fontSize: '0.65rem', color: 'var(--muted)', letterSpacing: '0.1em' }}>PRICE</div><div style={{ fontFamily: 'var(--font-d)', fontSize: '1.5rem', color: 'var(--text)' }}>—</div></div>
              <div><div style={{ fontFamily: 'var(--font-m)', fontSize: '0.65rem', color: 'var(--muted)', letterSpacing: '0.1em' }}>MARKET CAP</div><div style={{ fontFamily: 'var(--font-d)', fontSize: '1.5rem', color: 'var(--text)' }}>—</div></div>
              <div><div style={{ fontFamily: 'var(--font-m)', fontSize: '0.65rem', color: 'var(--muted)', letterSpacing: '0.1em' }}>STAKED</div><div style={{ fontFamily: 'var(--font-d)', fontSize: '1.5rem', color: 'var(--success)' }}>0</div></div>
              <div><div style={{ fontFamily: 'var(--font-m)', fontSize: '0.65rem', color: 'var(--muted)', letterSpacing: '0.1em' }}>HOLDERS</div><div style={{ fontFamily: 'var(--font-d)', fontSize: '1.5rem', color: 'var(--text)' }}>—</div></div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            {/* Allocation */}
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '1.5rem' }}>
              <h3 style={{ fontFamily: 'var(--font-d)', color: 'var(--gold)', marginBottom: '1.5rem' }}>// ALLOCATION</h3>
              {allocation.map(item => (
                <div key={item.label} style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span style={{ fontFamily: 'var(--font-m)', fontSize: '0.75rem', color: 'var(--text)' }}>{item.label}</span>
                    <span style={{ fontFamily: 'var(--font-m)', fontSize: '0.75rem', color: item.color }}>{item.pct}%</span>
                  </div>
                  <div style={{ background: 'var(--navy3)', borderRadius: '3px', height: '6px' }}>
                    <div style={{ width: `${item.pct}%`, background: item.color, borderRadius: '3px', height: '100%' }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Tx History */}
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '1.5rem' }}>
              <h3 style={{ fontFamily: 'var(--font-d)', color: 'var(--gold)', marginBottom: '1.5rem' }}>// RECENT ACTIVITY</h3>
              {txHistory.map(tx => (
                <div key={tx.time} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0', borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <div style={{ fontFamily: 'var(--font-m)', fontSize: '0.75rem', color: 'var(--text)' }}>{tx.type}</div>
                    <div style={{ fontFamily: 'var(--font-m)', fontSize: '0.65rem', color: 'var(--muted)' }}>{tx.address}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'var(--font-m)', fontSize: '0.75rem', color: tx.amount.startsWith('+') ? 'var(--success)' : 'var(--text)' }}>{tx.amount}</div>
                    <div style={{ fontFamily: 'var(--font-m)', fontSize: '0.65rem', color: 'var(--muted)' }}>{tx.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Staking CTA */}
          <div style={{ marginTop: '1.5rem', background: 'linear-gradient(135deg, var(--gold-dim), rgba(56,189,248,0.05))', border: '1px solid var(--gold)', borderRadius: '8px', padding: '2rem', textAlign: 'center' }}>
            <h3 style={{ fontFamily: 'var(--font-d)', fontSize: '1.5rem', color: 'var(--gold)', marginBottom: '0.75rem' }}>Stake $QUANTA</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '1.5rem' }}>Earn rewards by staking your tokens. Governance voting rights unlock at 100 $QUANTA staked.</p>
            <Link href="/app/staking" className={styles.btnPrimary} style={{ display: 'inline-block' }}>Go to Staking</Link>
          </div>
        </main>
      </div>
    </>
  )
}