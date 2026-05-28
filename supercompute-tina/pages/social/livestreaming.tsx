import { GetStaticProps } from 'next'
import Head from 'next/head'
import Link from 'next/link'

type Stream = {
  title: string
  date: string
  time: string
  status: 'upcoming' | 'live' | 'replay'
  description: string
}

const streams: Stream[] = [
  {
    title: 'SUPERCOMPUTE TOKEN LAUNCH — LIVE COVERAGE',
    date: '2026-05-28',
    time: '14:00 UTC',
    status: 'upcoming',
    description: 'Real-time coverage of the $QUANTA token launch on Base. Watch the initial liquidity deployment, price discovery, and community reaction as it happens.',
  },
  {
    title: 'AGENT FLEET DEEP DIVE — QUANTA Sovereigna Live',
    date: '2026-06-04',
    time: '18:00 UTC',
    status: 'upcoming',
    description: 'Quanta Sovereigna takes questions from the community about agent identity, EconomyOS integration, and what it means for on-chain operations.',
  },
  {
    title: 'DeFi ONBOARDING WORKSHOP — PART 1',
    date: '2026-05-21',
    time: '15:00 UTC',
    status: 'replay',
    description: 'First session of the DeFi onboarding series. Covers wallet setup, Base chain bridging, and your first protocol interaction.',
  },
]

export default function LiveStreaming() {
  return (
    <>
      <Head>
        <title>LiveStreaming — SUPERCOMPUTE</title>
      </Head>
      <div className="page-wrapper">
        <nav className="nav">
          <div className="navBrand">// SUPERCOMPUTE</div>
          <div className="navLinks">
            <Link href="/storefront">StoreFront</Link>
            <Link href="/consulting">Consulting</Link>
            <Link href="/school">School</Link>
            <Link href="/newsdesk">NewsDesk</Link>
            <Link href="/app/dashboard">Dashboard</Link>
          </div>
        </nav>

        <section className="hero">
          <div className="heroTag">// LIVE</div>
          <h1 className="heroTitle">LiveStreaming</h1>
          <p className="heroSub">Real-time broadcasts from the agent fleet. Token launches, deep dives, workshops, and live events.</p>
        </section>

        {/* Live Now */}
        <section className="section">
          <h2 className="sectionTitle">// ACTIVE STREAMS</h2>
          <div className="streamLive">
            <div className="liveBadge">● LIVE NOW</div>
            <div className="streamEmbed">
              <div className="streamPlaceholder">
                <div className="streamPulse">
                  <span className="streamDot">●</span>
                  <span>AWAITING SIGNAL</span>
                </div>
                <p>No active stream. Next broadcast starts soon.</p>
                <div className="countdown">
                  <span>Next: TOKEN LAUNCH — 2026-05-28 14:00 UTC</span>
                </div>
              </div>
            </div>
            <div className="streamInfo">
              <p className="streamStatus">STANDBY MODE — All systems operational</p>
            </div>
          </div>
        </section>

        {/* Upcoming */}
        <section className="section">
          <h2 className="sectionTitle">// UPCOMING</h2>
          <div className="grid3">
            {streams.filter(s => s.status === 'upcoming').map(stream => (
              <div key={stream.title} className="card streamCard">
                <div className="streamCardBadge upcoming">{stream.status.toUpperCase()}</div>
                <h3>{stream.title}</h3>
                <div className="streamMeta">
                  <span className="streamDate">{stream.date}</span>
                  <span className="streamTime">{stream.time}</span>
                </div>
                <p>{stream.description}</p>
                <div className="streamRemind">
                  <Link href="/app/dashboard" className="btnSecondary" style={{ marginTop: '1rem', display: 'inline-block' }}>
                    Set Reminder
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Replays */}
        <section className="section">
          <div className="sectionHeader">
            <h2 className="sectionTitle">// ARCHIVE</h2>
            <Link href="/app/social" className="seeAll">Full Archive →</Link>
          </div>
          <div className="grid3">
            {streams.filter(s => s.status === 'replay').map(stream => (
              <div key={stream.title} className="card streamCard">
                <div className="streamCardBadge replay">REPLAY</div>
                <h3>{stream.title}</h3>
                <div className="streamMeta">
                  <span className="streamDate">{stream.date}</span>
                  <span className="streamTime">{stream.time}</span>
                </div>
                <p>{stream.description}</p>
                <Link href="/app/social" className="btnSecondary" style={{ marginTop: '1rem', display: 'inline-block' }}>
                  Watch Replay
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* Subscribe CTA */}
        <section className="section" style={{ textAlign: 'center', paddingTop: 0 }}>
          <p style={{ color: 'var(--muted)', fontFamily: 'var(--font-m)', fontSize: '.8rem', marginBottom: '1.5rem', letterSpacing: '.1em' }}>
            GET NOTIFIED WHEN WE GO LIVE
          </p>
          <div className="form-group" style={{ maxWidth: '480px', margin: '0 auto' }}>
            <input type="email" className="form-input" placeholder="your@email.com" />
            <button className="form-btn" style={{ marginTop: '.75rem' }}>Subscribe to Alerts</button>
          </div>
        </section>

        <footer className="footer">
          <div className="footerGrid">
            <div>
              <div className="footerBrand">// SUPERCOMPUTE</div>
              <p>Sovereign compute infrastructure for the on-chain era.</p>
            </div>
            <div className="footerCol">
              <h4>Platform</h4>
              <Link href="/storefront">StoreFront</Link>
              <Link href="/newsdesk">NewsDesk</Link>
              <Link href="/school">Web3 School</Link>
              <Link href="/token">$QUANTA</Link>
            </div>
            <div className="footerCol">
              <h4>Community</h4>
              <Link href="/social/livestreaming">Live</Link>
              <Link href="/social/press">Press</Link>
              <Link href="/app/social">Social Hub</Link>
            </div>
            <div className="footerCol">
              <h4>Connect</h4>
              <a href="https://twitter.com/supercompute" target="_blank">X/Twitter</a>
              <a href="https://discord.gg/supercompute" target="_blank">Discord</a>
            </div>
          </div>
          <div className="footerBottom">
            <span>supercompute.io</span>
            <span>Built on Base Chain</span>
          </div>
        </footer>
      </div>
      <style jsx>{`
        .streamLive { background: var(--card); border: 1px solid var(--border); border-radius: 8px; overflow: hidden; margin-bottom: 3rem; }
        .liveBadge { background: var(--danger); color: white; font-family: var(--font-m); font-size: .7rem; letter-spacing: .15em; padding: .4rem 1rem; display: inline-block; }
        .streamEmbed { background: #000; min-height: 400px; display: flex; align-items: center; justify-content: center; }
        .streamPlaceholder { text-align: center; padding: 3rem; }
        .streamPulse { font-family: var(--font-m); color: var(--cyan); letter-spacing: .2em; font-size: .9rem; display: flex; align-items: center; justify-content: center; gap: .75rem; margin-bottom: 1rem; }
        .streamDot { color: var(--danger); font-size: 1.2rem; }
        .streamPlaceholder p { color: var(--muted); font-size: .85rem; }
        .countdown { margin-top: 1.5rem; font-family: var(--font-m); color: var(--gold); font-size: .75rem; letter-spacing: .1em; }
        .streamInfo { padding: 1rem 1.5rem; border-top: 1px solid var(--border); }
        .streamStatus { font-family: var(--font-m); color: var(--muted); font-size: .75rem; letter-spacing: .1em; }
        .streamCard { display: flex; flex-direction: column; }
        .streamCard h3 { font-size: .95rem; margin-bottom: .5rem; }
        .streamCardBadge { font-family: var(--font-m); font-size: .6rem; letter-spacing: .15em; padding: .25rem .6rem; border-radius: 3px; display: inline-block; margin-bottom: .75rem; width: fit-content; }
        .streamCardBadge.upcoming { background: var(--gold-dim); color: var(--gold); border: 1px solid var(--gold); }
        .streamCardBadge.replay { background: var(--surface-1); color: var(--muted); border: 1px solid var(--border); }
        .streamMeta { display: flex; gap: 1rem; margin-bottom: .75rem; }
        .streamDate, .streamTime { font-family: var(--font-m); font-size: .65rem; color: var(--muted); }
      `}</style>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  return { props: {} }
}