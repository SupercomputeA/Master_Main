import Head from 'next/head'
import Link from 'next/link'
import styles from '@/styles/Home.module.css'

export default function Staking() {
  return (
    <>
      <Head><title>Staking — Supercompute</title></Head>
      <div className={styles.memberLayout}>
        <aside className={styles.memberSidebar}>
          <div style={{ fontFamily: 'var(--font-d)', fontSize: '0.9rem', color: 'var(--gold)', marginBottom: '2rem' }}>// STAKING</div>
          <nav className={styles.memberNav}>
            <Link href="/app/dashboard">Dashboard</Link>
            <Link href="/app/projects">Projects</Link>
            <Link href="/app/staking" className="active">Staking</Link>
            <Link href="/app/publishing">Publishing</Link>
            <Link href="/app/school">School</Link>
            <Link href="/app/token">Token</Link>
            <Link href="/newsdesk">NewsDesk</Link>
            <Link href="/">← Public Site</Link>
          </nav>
        </aside>
        <main className={styles.memberMain}>
          <h1 style={{ fontFamily: 'var(--font-d)', fontSize: '1.75rem', color: 'var(--gold)', marginBottom: '2rem' }}>// STAKING</h1>
          {/* Stats */}
          <div className={styles.statsGrid} style={{ marginBottom: '2rem' }}>
            <div className={styles.statTile}>
              <div className={styles.statLabel}>Your Stake</div>
              <div className={styles.statValue}>0</div>
              <div className={styles.statSub}>$QUANTA</div>
            </div>
            <div className={styles.statTile}>
              <div className={styles.statLabel}>Pending Rewards</div>
              <div className={styles.statValue}>0</div>
              <div className={styles.statSub}>$QUANTA</div>
            </div>
            <div className={styles.statTile}>
              <div className={styles.statLabel}>APY</div>
              <div className={styles.statValue}>—</div>
              <div className={styles.statSub}>%</div>
            </div>
            <div className={styles.statTile}>
              <div className={styles.statLabel}>Governance</div>
              <div className={styles.statValue}>NO</div>
              <div className={styles.statSub}>100+ required</div>
            </div>
          </div>
          {/* Staking form */}
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '2rem', maxWidth: 500 }}>
            <h3 style={{ fontFamily: 'var(--font-d)', color: 'var(--gold)', marginBottom: '1.5rem' }}>// STAKE $QUANTA</h3>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Amount to Stake</label>
              <input type="text" placeholder="0 $QUANTA" className={styles.formInput} />
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className={styles.formBtn} style={{ flex: 1 }}>STAKE</button>
              <button style={{ padding: '0.75rem 1.5rem', border: '1px solid var(--border)', borderRadius: '4px', fontFamily: 'var(--font-m)', fontSize: '0.8rem', color: 'var(--muted)', background: 'transparent' }}>UNSTAKE</button>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}