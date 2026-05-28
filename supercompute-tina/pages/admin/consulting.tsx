import Head from 'next/head'
import Link from 'next/link'

export default function AdminConsulting() {
  return (
    <>
      <Head><title>Consulting Admin — Supercompute</title></Head>
      <div className="adminLayout">
        <aside className="adminSidebar">
          <div style={{ fontFamily: 'var(--font-d)', fontSize: '0.9rem', color: 'var(--gold)', marginBottom: '2rem' }}>// ADMIN</div>
          <nav className="adminNav">
            <Link href="/admin">Dashboard</Link>
            <Link href="/admin/projects">Projects</Link>
            <Link href="/admin/school">School</Link>
            <Link href="/admin/consulting" className="active">Consulting</Link>
            <Link href="/admin/newsdesk">NewsDesk</Link>
            <Link href="/admin/tradedesk">TradeDesk</Link>
            <Link href="/">← Public Site</Link>
          </nav>
        </aside>
        <main className="adminMain">
          <h1 style={{ fontFamily: 'var(--font-d)', fontSize: '1.75rem', color: 'var(--gold)', marginBottom: '2rem' }}>// CONSULTING ADMIN</h1>

          {/* Stats Row */}
          <div className="statsGrid">
            {[
              { label: 'Total Engagements', value: '4', sub: 'All time' },
              { label: 'Active Engagements', value: '3', sub: 'In progress' },
              { label: 'Pipeline Value', value: '$48K', sub: 'Est. revenue' },
              { label: 'Pending Proposals', value: '2', sub: 'Awaiting response' },
            ].map(s => (
              <div key={s.label} className="statTile">
                <div className="statLabel">{s.label}</div>
                <div className="statValue">{s.value}</div>
                <div className="statSub">{s.sub}</div>
              </div>
            ))}
          </div>

          {/* New Engagement Form */}
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '1.5rem', marginBottom: '1.5rem' }}>
            <h3 style={{ fontFamily: 'var(--font-d)', color: 'var(--gold)', marginBottom: '1.25rem' }}>// NEW ENGAGEMENT</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Client Name</label>
                <input type="text" className="form-input" placeholder="Acme Corp" />
              </div>
              <div className="form-group">
                <label className="form-label">Service Type</label>
                <select className="form-input" defaultValue="">
                  <option value="" disabled>Select service</option>
                  <option>Strategy</option>
                  <option>Technical</option>
                  <option>Implementation</option>
                  <option>Training</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-input" defaultValue="proposal">
                  <option value="proposal">Proposal</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Value ($)</label>
                <input type="number" className="form-input" placeholder="12000" />
              </div>
              <div className="form-group">
                <label className="form-label">Start Date</label>
                <input type="date" className="form-input" />
              </div>
              <div className="form-group">
                <label className="form-label">Agent Assigned</label>
                <select className="form-input" defaultValue="">
                  <option value="" disabled>Select agent</option>
                  <option>HERMES</option>
                  <option>QUANTA</option>
                  <option>CONDOR</option>
                </select>
              </div>
            </div>
            <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button className="form-btn">+ Create Engagement</button>
            </div>
          </div>

          {/* Engagements Table */}
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Client', 'Service', 'Value', 'Start Date', 'Status', 'Agent', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontFamily: 'var(--font-m)', fontSize: '0.65rem', color: 'var(--gold)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { client: 'Vertex Systems', service: 'Strategy', value: '$18,000', date: 'May 15', status: 'Active', agent: 'HERMES' },
                  { client: 'Nexus Labs', service: 'Technical', value: '$12,000', date: 'May 10', status: 'Active', agent: 'QUANTA' },
                  { client: 'Quantum Inc', service: 'Implementation', value: '$24,000', date: 'May 8', status: 'Proposal', agent: 'HERMES' },
                  { client: 'Altuve Co', service: 'Training', value: '$6,000', date: 'Apr 28', status: 'Completed', agent: 'CONDOR' },
                ].map(e => (
                  <tr key={e.client} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '0.75rem 1rem', fontFamily: 'var(--font-m)', fontSize: '0.8rem', color: 'var(--text)' }}>{e.client}</td>
                    <td style={{ padding: '0.75rem 1rem', fontFamily: 'var(--font-m)', fontSize: '0.7rem', color: 'var(--cyan)' }}>{e.service}</td>
                    <td style={{ padding: '0.75rem 1rem', fontFamily: 'var(--font-m)', fontSize: '0.75rem', color: 'var(--gold)' }}>{e.value}</td>
                    <td style={{ padding: '0.75rem 1rem', fontFamily: 'var(--font-m)', fontSize: '0.75rem', color: 'var(--muted)' }}>{e.date}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span style={{
                        fontFamily: 'var(--font-m)', fontSize: '0.65rem',
                        color: e.status === 'Active' ? 'var(--success)' : e.status === 'Proposal' ? 'var(--warning)' : 'var(--muted)',
                        padding: '0.2rem 0.5rem',
                        border: `1px solid ${e.status === 'Active' ? 'var(--success)' : e.status === 'Proposal' ? 'var(--warning)' : 'var(--border)'}`,
                        borderRadius: '3px'
                      }}>{e.status}</span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', fontFamily: 'var(--font-m)', fontSize: '0.7rem', color: 'var(--cyan)' }}>{e.agent}</td>
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