import Head from 'next/head'
import Link from 'next/link'
import styles from '@/styles/Home.module.css'

export default function Publishing() {
  return (
    <>
      <Head><title>Publishing — Supercompute</title></Head>
      <div className={styles.memberLayout}>
        <aside className={styles.memberSidebar}>
          <div style={{ fontFamily: 'var(--font-d)', fontSize: '0.9rem', color: 'var(--gold)', marginBottom: '2rem' }}>// PUBLISHING</div>
          <nav className={styles.memberNav}>
            <Link href="/app/dashboard">Dashboard</Link>
            <Link href="/app/projects">Projects</Link>
            <Link href="/app/staking">Staking</Link>
            <Link href="/app/publishing" className="active">Publishing</Link>
            <Link href="/app/school">School</Link>
            <Link href="/app/token">Token</Link>
            <Link href="/newsdesk">NewsDesk</Link>
            <Link href="/">← Public Site</Link>
          </nav>
        </aside>
        <main className={styles.memberMain}>
          <h1 style={{ fontFamily: 'var(--font-d)', fontSize: '1.75rem', color: 'var(--gold)', marginBottom: '0.5rem' }}>// PUBLISHING</h1>
          <p style={{ fontFamily: 'var(--font-m)', fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '2rem' }}>Submit articles to NewsDesk. Requires 100 $QUANTA to publish.</p>
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '2rem' }}>
            <h3 style={{ fontFamily: 'var(--font-d)', color: 'var(--gold)', marginBottom: '1.5rem' }}>// NEW ARTICLE</h3>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Title</label>
              <input type="text" placeholder="Article title" className={styles.formInput} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Category</label>
              <select className={styles.formInput}>
                <option>INTELLIGENCE</option>
                <option>SOVEREIGNTY</option>
                <option>DISPATCH</option>
                <option>SIGNAL</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Excerpt</label>
              <input type="text" placeholder="Brief summary..." className={styles.formInput} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Body (Markdown)</label>
              <textarea placeholder="Write your article..." className={styles.formInput} rows={12} style={{ fontFamily: 'var(--font-m)', resize: 'vertical' }} />
            </div>
            <div className={styles.formGroup}>
              <button className={styles.formBtn}>SUBMIT FOR REVIEW</button>
            </div>
            <p style={{ fontFamily: 'var(--font-m)', fontSize: '0.7rem', color: 'var(--muted)', marginTop: '0.5rem' }}>Articles are reviewed by the NewsDesk editorial team before publication.</p>
          </div>
        </main>
      </div>
    </>
  )
}