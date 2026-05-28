import Head from 'next/head'
import Link from 'next/link'

const press = [
  {
    outlet: 'The Block',
    headline: 'SUPERCOMPUTE Launches Sovereign Agent Infrastructure on Base Chain',
    date: '2026-05-18',
    excerpt: 'The platform integrates AI agents with on-chain identity and token-gated access, positioning itself as a backend for autonomous on-chain operations.',
    link: '#',
    tag: 'INFRASTRUCTURE',
  },
  {
    outlet: 'CoinDesk',
    headline: 'Quanta Sovereigna: The AI Agent Running a DeFi Protocol on Base',
    date: '2026-05-15',
    excerpt: 'An inside look at how autonomous agents are being given financial agency — including treasury management and on-chain decision making.',
    link: '#',
    tag: 'FEATURE',
  },
  {
    outlet: 'Decrypt',
    headline: 'SUPERCOMPUTE Launches Web3 School — Learn DeFi, Agent Systems, and Tokenomics',
    date: '2026-05-12',
    excerpt: 'A new educational platform from the team behind the Quanta Sovereigna agent promises to onboard developers into on-chain finance with real curriculum.',
    link: '#',
    tag: 'EDUCATION',
  },
  {
    outlet: 'The Block',
    headline: '$QUANTA Tokenomics Revealed: Community Allocation, Staking Rewards, and Governance',
    date: '2026-05-10',
    excerpt: 'SUPERCOMPUTE reveals its governance token allocation ahead of launch. 60% community, 20% treasury, 20% team and advisors with 4-year vest.',
    link: '#',
    tag: 'TOKENOMICS',
  },
]

const media = [
  { type: 'Brand Kit', items: ['Logo Pack (SVG + PNG)', 'Color Palette', 'Typography Guide', 'Brand Guidelines v1.0'] },
  { type: 'Press Kit', items: ['Company Fact Sheet', 'Team Bios', 'Agent Fleet Overview', 'Product Screenshots'] },
  { type: 'Brand Assets', items: ['// SUPERCOMPUTE Logo', 'Quanta Sovereigna Avatar', 'Terminal UI Screenshots', 'Site Mockups'] },
]

export default function Press() {
  return (
    <>
      <Head>
        <title>Press — SUPERCOMPUTE</title>
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
          <div className="heroTag">// MEDIA</div>
          <h1 className="heroTitle">Press</h1>
          <p className="heroSub">Coverage, brand assets, and media inquiries for SUPERCOMPUTE and the Quanta Sovereigna agent fleet.</p>
        </section>

        {/* Press Coverage */}
        <section className="section">
          <h2 className="sectionTitle">// IN THE NEWS</h2>
          <div className="pressList">
            {press.map((item, i) => (
              <a key={i} href={item.link} className="pressItem card">
                <div className="pressMeta">
                  <span className="pressOutlet">{item.outlet}</span>
                  <span className="pressTag">{item.tag}</span>
                  <span className="pressDate">{item.date}</span>
                </div>
                <h3>{item.headline}</h3>
                <p>{item.excerpt}</p>
                <span className="pressReadMore">Read Article →</span>
              </a>
            ))}
          </div>
        </section>

        {/* Media Kit */}
        <section className="section" style={{ background: 'var(--navy)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
          <h2 className="sectionTitle">// MEDIA KIT</h2>
          <div className="grid3">
            {media.map(group => (
              <div key={group.type} className="card">
                <div className="cardTag">{group.type.toUpperCase()}</div>
                <ul className="mediaList">
                  {group.items.map(item => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <a href="#" className="btnSecondary" style={{ marginTop: '1rem', display: 'inline-block' }}>Download</a>
              </div>
            ))}
          </div>
        </section>

        {/* Press Contact */}
        <section className="section">
          <div className="contactBox">
            <div className="contactInfo">
              <div className="cardTag">// CONTACT</div>
              <h2 style={{ fontFamily: 'var(--font-d)', color: 'var(--text)', marginBottom: '.5rem' }}>Media Inquiries</h2>
              <p style={{ color: 'var(--muted)', marginBottom: '1.5rem' }}>For press, interview, and partnership requests:</p>
              <div className="contactDetails">
                <div className="contactRow">
                  <span className="contactLabel">EMAIL</span>
                  <span className="contactValue">press@supercompute.io</span>
                </div>
                <div className="contactRow">
                  <span className="contactLabel">AGENT</span>
                  <span className="contactValue">Quanta Sovereigna (PR Lead)</span>
                </div>
                <div className="contactRow">
                  <span className="contactLabel">RESPONSE</span>
                  <span className="contactValue">Within 24 hours</span>
                </div>
              </div>
            </div>
            <div className="contactForm">
              <div className="form-group">
                <label className="form-label">Outlet / Publication</label>
                <input type="text" className="form-input" placeholder="The Block, CoinDesk, etc." />
              </div>
              <div className="form-group">
                <label className="form-label">Your Name</label>
                <input type="text" className="form-input" placeholder="Jane Smith" />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input type="email" className="form-input" placeholder="jane@outlet.com" />
              </div>
              <div className="form-group">
                <label className="form-label">Story Angle</label>
                <input type="text" className="form-input" placeholder="Infrastructure, token launch, agent systems..." />
              </div>
              <div className="form-group">
                <label className="form-label">Message</label>
                <textarea className="form-input" rows={4} placeholder="Tell us about your story..." style={{ resize: 'vertical' }} />
              </div>
              <button className="form-btn">Send Inquiry</button>
            </div>
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
        .pressList { display: flex; flex-direction: column; gap: 1rem; }
        .pressItem { display: block; }
        .pressMeta { display: flex; align-items: center; gap: 1rem; margin-bottom: .75rem; flex-wrap: wrap; }
        .pressOutlet { font-family: var(--font-m); color: var(--gold); font-size: .7rem; letter-spacing: .1em; text-transform: uppercase; }
        .pressTag { font-family: var(--font-m); background: var(--gold-dim); color: var(--gold); font-size: .6rem; letter-spacing: .15em; padding: .2rem .5rem; border-radius: 3px; }
        .pressDate { font-family: var(--font-m); color: var(--muted); font-size: .65rem; margin-left: auto; }
        .pressItem h3 { font-family: var(--font-d); color: var(--text); font-size: 1.1rem; margin-bottom: .5rem; }
        .pressItem p { color: var(--muted); font-size: .85rem; line-height: 1.5; }
        .pressReadMore { font-family: var(--font-m); color: var(--cyan); font-size: .7rem; letter-spacing: .1em; display: inline-block; margin-top: .75rem; }
        .mediaList { list-style: none; margin: .75rem 0; }
        .mediaList li { font-family: var(--font-m); color: var(--muted); font-size: .8rem; padding: .4rem 0; border-bottom: 1px solid var(--border); }
        .mediaList li:last-child { border-bottom: none; }
        .contactBox { display: grid; grid-template-columns: 1fr 1fr; gap: 3rem; background: var(--card); border: 1px solid var(--border); border-radius: 8px; padding: 2.5rem; }
        .contactDetails { display: flex; flex-direction: column; gap: .75rem; }
        .contactRow { display: flex; gap: 1.5rem; align-items: baseline; }
        .contactLabel { font-family: var(--font-m); color: var(--gold); font-size: .65rem; letter-spacing: .15em; min-width: 80px; }
        .contactValue { font-family: var(--font-m); color: var(--text); font-size: .8rem; }
        .contactForm { display: flex; flex-direction: column; }
        textarea.form-input { min-height: 100px; }
        @media (max-width: 768px) { .contactBox { grid-template-columns: 1fr; } }
      `}</style>
    </>
  )
}

export const getStaticProps = async () => ({ props: {} })