import Head from 'next/head'
import Link from 'next/link'

const positions = [
  { pair: 'ETH/USDC', side: 'LONG', entry: '3,247.50', mark: '3,281.90', pnl: '+$34.40', pnlPct: '+1.06%', size: '0.5 ETH', liq: '2,980', roe: '8.2x' },
  { pair: 'WETH/USDC', side: 'SHORT', entry: '3,260.00', mark: '3,248.10', pnl: '+$5.95', pnlPct: '+0.18%', size: '1.2 WETH', liq: '3,520', roe: '5.1x' },
  { pair: 'CBIC/USDC', side: 'LONG', entry: '0.0842', mark: '0.0918', pnl: '+$228.00', pnlPct: '+9.03%', size: '28,000 CBIC', liq: '0.0710', roe: '12.4x' },
]

const orders = [
  { id: 'ORD-7841', pair: 'ETH/USDC', side: 'BUY', type: 'LIMIT', price: '3,195.00', amount: '0.3 ETH', filled: '0.3 ETH', status: 'FILLED' },
  { id: 'ORD-7842', pair: 'WETH/USDC', side: 'SELL', type: 'STOP', price: '3,530.00', amount: '1.2 WETH', filled: '—', status: 'PENDING' },
  { id: 'ORD-7843', pair: 'ETH/USDC', side: 'BUY', type: 'LIMIT', price: '3,170.00', amount: '0.4 ETH', filled: '0.1 ETH', status: 'PARTIAL' },
  { id: 'ORD-7844', pair: 'CBIC/USDC', side: 'BUY', type: 'LIMIT', price: '0.0880', amount: '15,000 CBIC', filled: '—', status: 'OPEN' },
  { id: 'ORD-7845', pair: 'ETH/USDC', side: 'SELL', type: 'LIMIT', price: '3,400.00', amount: '0.5 ETH', filled: '—', status: 'OPEN' },
]

const pairs = [
  { pair: 'ETH/USDC', price: '3,281.90', change: '+1.06%', volume: '$4.2M', hft: true, spread: '0.03%' },
  { pair: 'WETH/USDC', price: '3,248.10', change: '-0.36%', volume: '$1.8M', hft: false, spread: '0.08%' },
  { pair: 'CBIC/USDC', price: '0.0918', change: '+9.03%', volume: '$312K', hft: false, spread: '0.15%' },
  { pair: 'QUANTA/USDC', price: '0.0421', change: '-2.10%', volume: '$89K', hft: false, spread: '0.22%' },
]

const log = [
  { time: '09:41:02', agent: 'CONDOR', msg: 'Position ORD-7841 filled — ETH/USDC LONG @ 3,247.50, size 0.5 ETH' },
  { time: '09:40:58', agent: 'CONDOR', msg: 'CBIC/USDC mark updated — +9.03% unrealized on 28K lot' },
  { time: '09:38:55', agent: 'CONDOR', msg: 'Limit sell placed — ETH/USDC @ 3,400.00, size 0.5 ETH, ORD-7845' },
  { time: '09:35:21', agent: 'CONDOR', msg: 'CBIC/USDC entry limit set @ 0.0880, ORD-7844' },
  { time: '09:28:03', agent: 'CONDOR', msg: 'Partial fill on ETH/USDC buy — 0.1 ETH of 0.4 ETH @ 3,170.00' },
  { time: '09:12:44', agent: 'CONDOR', msg: 'Stop loss placed — WETH/USDC @ 3,530.00, ORD-7842' },
  { time: '08:32:11', agent: 'CONDOR', msg: 'Order ORD-7841 sent — ETH/USDC BUY LIMIT @ 3,195.00, size 0.3 ETH' },
  { time: '08:30:00', agent: 'HERMES', msg: 'Credential check passed — Coinbase API: OK, Infisical: current' },
  { time: '08:29:58', agent: 'CONDOR', msg: 'CONDOR agent online — Hummingbot v2.6.0, connected to Coinbase Advanced' },
]

const agents = [
  { name: 'CONDOR', role: 'Trade Execution', status: 'online', jobs: '12', last: '09:41:02' },
  { name: 'HERMES', role: 'BackOffice', status: 'online', jobs: '3', last: '09:40:00' },
  { name: 'QUANTA', role: 'Operations', status: 'online', jobs: '5', last: '09:38:15' },
]

export default function AdminTradeDesk() {
  return (
    <>
      <Head><title>TradeDesk — SUPERCOMPUTE</title></Head>
      <div className="adminLayout">
        <aside className="adminSidebar">
          <div style={{ fontFamily: 'var(--font-d)', fontSize: '0.9rem', color: 'var(--gold)', marginBottom: '2rem' }}>// ADMIN</div>
          <nav className="adminNav">
            <Link href="/admin">Dashboard</Link>
            <Link href="/admin/projects">Projects</Link>
            <Link href="/admin/school">School</Link>
            <Link href="/admin/consulting">Consulting</Link>
            <Link href="/admin/newsdesk">NewsDesk</Link>
            <Link href="/admin/tradedesk" style={{ color: 'var(--gold)' }}>TradeDesk</Link>
            <Link href="/">← Public Site</Link>
          </nav>
        </aside>

        <main className="adminMain">

          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h1 style={{ fontFamily: 'var(--font-d)', fontSize: '1.75rem', color: 'var(--gold)' }}>// TRADEDESK</h1>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <span style={{ fontFamily: 'var(--font-m)', fontSize: '0.65rem', color: 'var(--success)', background: 'rgba(74,222,128,0.1)', padding: '0.3rem 0.75rem', borderRadius: '4px', border: '1px solid rgba(74,222,128,0.2)' }}>
                ● CONDOR LIVE
              </span>
              <span style={{ fontFamily: 'var(--font-m)', fontSize: '0.65rem', color: 'var(--cyan)', background: 'rgba(56,189,248,0.1)', padding: '0.3rem 0.75rem', borderRadius: '4px', border: '1px solid rgba(56,189,248,0.2)' }}>
                ● Coinbase CONNECTED
              </span>
            </div>
          </div>

          {/* Stats Row */}
          <div className="statsGrid" style={{ marginBottom: '1.5rem' }}>
            {[
              { label: 'Portfolio Value', value: '$12,847.20', sub: '+2.41% today' },
              { label: 'Open Positions', value: '3', sub: '2 long / 1 short' },
              { label: 'Unrealized P&L', value: '+$268.35', sub: 'ETH + CBIC exposure' },
              { label: '24h Volume', value: '$6.4M', sub: 'ETH/USDC + WETH/USDC' },
            ].map(s => (
              <div key={s.label} className="statTile">
                <div className="statLabel">{s.label}</div>
                <div className="statValue" style={{ fontSize: '1.3rem' }}>{s.value}</div>
                <div className="statSub">{s.sub}</div>
              </div>
            ))}
          </div>

          {/* Positions + Order Book */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>

            {/* Positions */}
            <div className="card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontFamily: 'var(--font-d)', color: 'var(--gold)', fontSize: '0.9rem' }}>// POSITIONS</h3>
                <span style={{ fontFamily: 'var(--font-m)', fontSize: '0.6rem', color: 'var(--muted)' }}>Updated just now</span>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-m)', fontSize: '0.7rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--muted)' }}>
                    <th style={{ textAlign: 'left', padding: '0.4rem 0', letterSpacing: '0.1em' }}>PAIR</th>
                    <th style={{ textAlign: 'center', padding: '0.4rem 0', letterSpacing: '0.1em' }}>SIDE</th>
                    <th style={{ textAlign: 'right', padding: '0.4rem 0', letterSpacing: '0.1em' }}>ENTRY</th>
                    <th style={{ textAlign: 'right', padding: '0.4rem 0', letterSpacing: '0.1em' }}>MARK</th>
                    <th style={{ textAlign: 'right', padding: '0.4rem 0', letterSpacing: '0.1em' }}>P&L</th>
                  </tr>
                </thead>
                <tbody>
                  {positions.map(p => (
                    <tr key={p.pair} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '0.6rem 0', color: 'var(--text)', fontWeight: '700' }}>{p.pair}</td>
                      <td style={{ padding: '0.6rem 0', textAlign: 'center' }}>
                        <span style={{ color: p.side === 'LONG' ? 'var(--success)' : 'var(--danger)', fontSize: '0.65rem', letterSpacing: '0.08em' }}>{p.side}</span>
                      </td>
                      <td style={{ padding: '0.6rem 0', textAlign: 'right', color: 'var(--muted)' }}>{p.entry}</td>
                      <td style={{ padding: '0.6rem 0', textAlign: 'right', color: 'var(--text)' }}>{p.mark}</td>
                      <td style={{ padding: '0.6rem 0', textAlign: 'right', color: p.pnl.startsWith('+') ? 'var(--success)' : 'var(--danger)' }}>
                        {p.pnl} <span style={{ fontSize: '0.6rem' }}>{p.pnlPct}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ marginTop: '0.75rem', padding: '0.5rem', background: 'var(--surface-1)', borderRadius: '4px', fontFamily: 'var(--font-m)', fontSize: '0.65rem', color: 'var(--muted)', display: 'flex', justifyContent: 'space-between' }}>
                <span>Total exposure</span>
                <span style={{ color: 'var(--gold)' }}>~$9,420 across 3 pairs</span>
              </div>
            </div>

            {/* Order Book */}
            <div className="card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontFamily: 'var(--font-d)', color: 'var(--gold)', fontSize: '0.9rem' }}>// ORDER BOOK</h3>
                <span style={{ fontFamily: 'var(--font-m)', fontSize: '0.6rem', color: 'var(--cyan)' }}>5 active</span>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-m)', fontSize: '0.7rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--muted)' }}>
                    <th style={{ textAlign: 'left', padding: '0.4rem 0', letterSpacing: '0.1em' }}>ID</th>
                    <th style={{ textAlign: 'center', padding: '0.4rem 0', letterSpacing: '0.1em' }}>PAIR</th>
                    <th style={{ textAlign: 'center', padding: '0.4rem 0', letterSpacing: '0.1em' }}>SIDE</th>
                    <th style={{ textAlign: 'right', padding: '0.4rem 0', letterSpacing: '0.1em' }}>PRICE</th>
                    <th style={{ textAlign: 'right', padding: '0.4rem 0', letterSpacing: '0.1em' }}>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(o => (
                    <tr key={o.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '0.5rem 0', color: 'var(--muted)', fontSize: '0.6rem' }}>{o.id}</td>
                      <td style={{ padding: '0.5rem 0', textAlign: 'center', color: 'var(--text)' }}>{o.pair}</td>
                      <td style={{ padding: '0.5rem 0', textAlign: 'center', color: o.side === 'BUY' ? 'var(--success)' : 'var(--danger)', fontSize: '0.65rem' }}>{o.side}</td>
                      <td style={{ padding: '0.5rem 0', textAlign: 'right', color: 'var(--text)' }}>{o.price}</td>
                      <td style={{ padding: '0.5rem 0', textAlign: 'right' }}>
                        <span style={{
                          fontSize: '0.6rem', letterSpacing: '0.08em',
                          color: o.status === 'FILLED' ? 'var(--success)' : o.status === 'PENDING' ? 'var(--warning)' : 'var(--cyan)',
                          background: o.status === 'FILLED' ? 'rgba(74,222,128,0.1)' : o.status === 'PENDING' ? 'rgba(200,168,75,0.1)' : 'rgba(56,189,248,0.1)',
                          padding: '0.15rem 0.4rem', borderRadius: '3px'
                        }}>{o.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Markets + Agents */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>

            {/* Markets */}
            <div className="card" style={{ padding: '1.25rem' }}>
              <h3 style={{ fontFamily: 'var(--font-d)', color: 'var(--gold)', fontSize: '0.9rem', marginBottom: '1rem' }}>// MARKETS</h3>
              {pairs.map(pair => (
                <div key={pair.pair} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0', borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <span style={{ fontFamily: 'var(--font-m)', fontSize: '0.75rem', color: 'var(--text)' }}>{pair.pair}</span>
                    {pair.hft && <span style={{ fontFamily: 'var(--font-m)', fontSize: '0.55rem', color: 'var(--cyan)', marginLeft: '0.5rem', background: 'rgba(56,189,248,0.1)', padding: '0.1rem 0.35rem', borderRadius: '3px' }}>HFT</span>}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'var(--font-m)', fontSize: '0.75rem', color: 'var(--text)' }}>{pair.price}</div>
                    <div style={{ fontFamily: 'var(--font-m)', fontSize: '0.6rem', color: pair.change.startsWith('+') ? 'var(--success)' : 'var(--danger)' }}>{pair.change}</div>
                  </div>
                  <div style={{ textAlign: 'right', minWidth: '80px' }}>
                    <div style={{ fontFamily: 'var(--font-m)', fontSize: '0.6rem', color: 'var(--muted)' }}>vol {pair.volume}</div>
                    <div style={{ fontFamily: 'var(--font-m)', fontSize: '0.6rem', color: 'var(--muted)' }}>sp {pair.spread}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Agent Monitor */}
            <div className="card" style={{ padding: '1.25rem' }}>
              <h3 style={{ fontFamily: 'var(--font-d)', color: 'var(--gold)', fontSize: '0.9rem', marginBottom: '1rem' }}>// AGENT FLEET</h3>
              {agents.map(a => (
                <div key={a.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0', borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <div style={{ fontFamily: 'var(--font-d)', fontSize: '0.85rem', color: 'var(--gold)' }}>{a.name}</div>
                    <div style={{ fontFamily: 'var(--font-m)', fontSize: '0.6rem', color: 'var(--muted)' }}>{a.role}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'var(--font-m)', fontSize: '0.65rem', color: 'var(--success)' }}>● {a.status}</div>
                    <div style={{ fontFamily: 'var(--font-m)', fontSize: '0.6rem', color: 'var(--muted)' }}>{a.jobs} jobs · {a.last}</div>
                  </div>
                </div>
              ))}
              <div style={{ marginTop: '0.75rem', padding: '0.5rem', background: 'var(--surface-1)', borderRadius: '4px', fontFamily: 'var(--font-m)', fontSize: '0.65rem', color: 'var(--muted)' }}>
                All agents operational — Coinbase + Uniswap V4 connected
              </div>
            </div>
          </div>

          {/* Commerce Log */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontFamily: 'var(--font-d)', color: 'var(--gold)', fontSize: '0.9rem' }}>// COMMERCE LOG</h3>
              <span style={{ fontFamily: 'var(--font-m)', fontSize: '0.6rem', color: 'var(--muted)' }}>Live feed — last 24h</span>
            </div>
            <div style={{ maxHeight: '240px', overflowY: 'auto', fontFamily: 'var(--font-m)', fontSize: '0.65rem' }}>
              {log.map((entry, i) => (
                <div key={i} style={{ display: 'flex', gap: '1rem', padding: '0.4rem 0', borderBottom: '1px solid rgba(26,46,74,0.5)' }}>
                  <span style={{ color: 'var(--muted)', minWidth: '65px' }}>{entry.time}</span>
                  <span style={{ color: 'var(--cyan)', minWidth: '70px' }}>{entry.agent}</span>
                  <span style={{ color: 'var(--text)' }}>{entry.msg}</span>
                </div>
              ))}
            </div>
          </div>

        </main>
      </div>
    </>
  )
}