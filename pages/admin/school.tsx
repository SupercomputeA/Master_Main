import Head from 'next/head'
import Link from 'next/link'
import styles from '@/styles/Home.module.css'

export default function AdminSchool() {
  return (
    <>
      <Head><title>School Admin — Supercompute</title></Head>
      <div className={styles.adminLayout}>
        <aside className={styles.adminSidebar}>
          <div style={{ fontFamily: 'var(--font-d)', fontSize: '0.9rem', color: 'var(--gold)', marginBottom: '2rem' }}>// ADMIN</div>
          <nav className={styles.adminNav}>
            <Link href="/admin">Dashboard</Link>
            <Link href="/admin/projects">Projects</Link>
            <Link href="/admin/school" className="active">School</Link>
            <Link href="/admin/consulting">Consulting</Link>
            <Link href="/admin/newsdesk">NewsDesk</Link>
            <Link href="/admin/tradedesk">TradeDesk</Link>
            <Link href="/">← Public Site</Link>
          </nav>
        </aside>
        <main className={styles.adminMain}>
          <h1 style={{ fontFamily: 'var(--font-d)', fontSize: '1.75rem', color: 'var(--gold)', marginBottom: '2rem' }}>// SCHOOL ADMIN</h1>
          <div className={styles.statsGrid} style={{ marginBottom: '2rem' }}>
            {[
              { label: 'Total Modules', value: '7', sub: '2 free, 5 members' },
              { label: 'Free Modules', value: '2', sub: 'Public access' },
              { label: 'Members Only', value: '5', sub: 'Token-gated' },
              { label: 'Avg. Completion', value: '0%', sub: 'Launching soon' },
            ].map(s => (
              <div key={s.label} className={styles.statTile}>
                <div className={styles.statLabel}>{s.label}</div>
                <div className={styles.statValue}>{s.value}</div>
                <div className={styles.statSub}>{s.sub}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
            <button className={styles.formBtn}>+ NEW MODULE</button>
          </div>
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden', marginBottom: '2rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['#', 'Module Title', 'Description', 'Access', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontFamily: 'var(--font-m)', fontSize: '0.65rem', color: 'var(--gold)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { num: '01', title: 'DeFi Foundations', desc: 'AMMs, liquidity pools, yield farming, and impermanent loss.', access: 'FREE', status: 'Published' },
                  { num: '02', title: 'On-Chain Identity', desc: 'ENS resolution, wallet architecture, and soul-bound tokens.', access: 'FREE', status: 'Published' },
                  { num: '03', title: 'Agent Systems', desc: 'Autonomous AI agents with on-chain identity and token-gated access.', access: 'MEMBERS', status: 'Published' },
                  { num: '04', title: 'Tokenomics Deep Dive', desc: 'Emission schedules, vesting, treasury management, and governance.', access: 'MEMBERS', status: 'Published' },
                  { num: '05', title: 'Smart Contract Security', desc: 'Auditing patterns, reentrancy guards, and access control.', access: 'MEMBERS', status: 'Published' },
                  { num: '06', title: 'Liquidity Strategy', desc: 'Bootstrapping liquidity, market-making, and token incentives.', access: 'MEMBERS', status: 'Published' },
                  { num: '07', title: 'Protocol Governance', desc: 'DAO structure, voting mechanisms, and on-chain proposals.', access: 'MEMBERS', status: 'Published' },
                ].map(m => (
                  <tr key={m.num} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '0.75rem 1rem', fontFamily: 'var(--font-d)', fontSize: '1rem', color: 'var(--gold)' }}>{m.num}</td>
                    <td style={{ padding: '0.75rem 1rem', fontFamily: 'var(--font-m)', fontSize: '0.8rem', color: 'var(--text)' }}>{m.title}</td>
                    <td style={{ padding: '0.75rem 1rem', fontFamily: 'var(--font-m)', fontSize: '0.75rem', color: 'var(--muted)', maxWidth: 300 }}>{m.desc}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span style={{
                        fontFamily: 'var(--font-m)', fontSize: '0.65rem',
                        color: m.access === 'FREE' ? 'var(--success)' : 'var(--gold)',
                        padding: '0.2rem 0.5rem',
                        border: `1px solid ${m.access === 'FREE' ? 'var(--success)' : 'var(--gold)'}`,
                        borderRadius: '3px'
                      }}>{m.access}</span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span style={{ fontFamily: 'var(--font-m)', fontSize: '0.65rem', color: 'var(--success)', padding: '0.2rem 0.5rem', border: '1px solid var(--success)', borderRadius: '3px' }}>{m.status}</span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span style={{ fontFamily: 'var(--font-m)', fontSize: '0.7rem', color: 'var(--cyan)', cursor: 'pointer' }}>Edit</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '1.5rem' }}>
            <h3 style={{ fontFamily: 'var(--font-d)', color: 'var(--gold)', marginBottom: '1rem' }}>// CREATE NEW MODULE</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ fontFamily: 'var(--font-m)', fontSize: '0.7rem', color: 'var(--muted)', display: 'block', marginBottom: '0.5rem' }}>MODULE TITLE</label>
                <input type="text" placeholder="e.g. DeFi Foundations" className={styles.formInput} />
              </div>
              <div>
                <label style={{ fontFamily: 'var(--font-m)', fontSize: '0.7rem', color: 'var(--muted)', display: 'block', marginBottom: '0.5rem' }}>MODULE NUMBER</label>
                <input type="text" placeholder="e.g. 08" className={styles.formInput} />
              </div>
            </div>
            <div style={{ marginTop: '1rem' }}>
              <label style={{ fontFamily: 'var(--font-m)', fontSize: '0.7rem', color: 'var(--muted)', display: 'block', marginBottom: '0.5rem' }}>DESCRIPTION</label>
              <textarea placeholder="Module description..." rows={3} className={styles.formInput} style={{ resize: 'vertical' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
              <div>
                <label style={{ fontFamily: 'var(--font-m)', fontSize: '0.7rem', color: 'var(--muted)', display: 'block', marginBottom: '0.5rem' }}>ACCESS LEVEL</label>
                <select className={styles.formInput}>
                  <option value="free">FREE — Public Access</option>
                  <option value="members">MEMBERS — Token-Gated</option>
                </select>
              </div>
              <div>
                <label style={{ fontFamily: 'var(--font-m)', fontSize: '0.7rem', color: 'var(--muted)', display: 'block', marginBottom: '0.5rem' }}>STATUS</label>
                <select className={styles.formInput}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
            </div>
            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
              <button className={styles.formBtn}>CREATE MODULE</button>
              <button className={styles.formBtnSecondary}>CANCEL</button>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}