/* @jsx React.createElement */
/* Marketing components — Direction 03: Terminal Dossier
 * Approved from home-wireframes.html.
 * Pragmatic consulting-firm voice. No ticker, no Cyborg Agency framing,
 * no token-led narrative. The site is a consulting practice. */

const NAV_LINKS = [
  { id: 'home',       label: '//' },
  { id: 'consulting', label: '//services' },
  { id: 'projects',   label: '//work' },
  { id: 'school',     label: '//school' },
  { id: 'newsdesk',   label: '//news' },
  { id: 'about',      label: '//about' },
];

function HudFrame() {
  return (
    <React.Fragment>
      <div className="vignette" />
      <div className="hud-corner tl" />
      <div className="hud-corner tr" />
      <div className="hud-corner bl" />
      <div className="hud-corner br" />
    </React.Fragment>
  );
}

function TopNav({ active = 'home', onNav }) {
  return (
    <nav className="topnav">
      <div className="topnav-brand">
        <img src="sc-logo.jpg" alt="Supercompute" />
        <span className="topnav-brand-mark">
          Supercompute<span className="dim">.io</span>
        </span>
      </div>
      <div className="topnav-links">
        {NAV_LINKS.map(l => (
          <a
            key={l.id}
            className={'topnav-link' + (l.id === active ? ' active' : '')}
            onClick={() => onNav && onNav(l.id)}
          >{l.label}</a>
        ))}
      </div>
      <button className="cmd-btn solid">
        <span className="prompt">//</span>book --call
      </button>
    </nav>
  );
}

/* ─── HERO ──────────────────────────────────────────── */
function Hero() {
  return (
    <section className="hero">
      <div className="wrap">
        <div className="prompt-line">
          <span>//</span>
          <span className="cmd">whoami</span>
          <span className="caret" />
        </div>

        <div className="hero-output">
          <span className="k">[ name ]</span>
          <span className="v">Supercompute<em> — hands-on web3 operator</em></span>

          <span className="k">[ since ]</span>
          <span className="v">2013<em> · Occupy LA → Base L2</em></span>

          <span className="k">[ stack ]</span>
          <span className="v">Base · Virtuals · Cloudflare · Ledger</span>

          <span className="k">[ status ]</span>
          <span className="v">Booking strategy calls<em> · May 2026</em></span>
        </div>

        <p className="hero-body">
          I work directly with founders launching projects on Base.
          <strong> No anonymous team. No "platform". </strong>
          One operator, hands on the keyboard — tokenomics, agents, OpSec,
          treasury, community ops. Values in order. Pro expansion.
        </p>

        <div className="hero-ctas">
          <button className="cmd-btn solid">
            <span className="prompt">//</span>book --strategy-call
          </button>
          <button className="cmd-btn ghost">
            <span className="prompt">//</span>ls ./work
          </button>
        </div>
      </div>
    </section>
  );
}

/* ─── SERVICES ──────────────────────────────────────── */
const SERVICES = [
  { n: '01', name: 'defi_onboarding.sh', desc: 'Wallet setup, hardware key, OpSec. From zero to self-custody in 90 minutes.', price: '200 USDC', unit: '· 90 min' },
  { n: '02', name: 'agent_buildout.sh',  desc: 'Build a Quanta-style autonomous agent for your protocol. Strategy + delivery.', price: 'from 500 USDC' },
  { n: '03', name: 'token_launch.sh',    desc: 'End-to-end playbook. Tokenomics, contracts on Base, post-launch ops.', price: 'from 3,500 USDC' },
  { n: '04', name: 'refi_strategy.sh',   desc: 'Treasury, runway, regenerative tokenomics for impact-aligned protocols.', price: '400 USDC', unit: '· 2 hr' },
];

function Services() {
  return (
    <section className="section">
      <div className="wrap">
        <div className="prompt-line">
          <span>//</span>
          <span className="cmd">./services <span className="gold">--list</span></span>
        </div>
        <div className="sheet">
          {SERVICES.map(s => (
            <div key={s.n} className="sheet-row">
              <span className="num">{s.n}</span>
              <div className="body">
                <span className="name">{s.name}</span>
                <span className="desc">{s.desc}</span>
              </div>
              <span className="price">
                {s.price}{s.unit && <span className="unit">{s.unit}</span>}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── RECENT PROJECTS ───────────────────────────────── */
const PROJECTS = [
  { tag: 'TOKEN',     status: 'funded',   title: 'The Glyph Foundry',  meta: ['Token launch', '52K USDC raised', '684 backers'] },
  { tag: 'AGENT',     status: 'shipped',  title: 'KNIGHT Open-Source', meta: ['Agent build-out', 'TradeDesk shipped May 2026'] },
  { tag: 'TREASURY',  status: 'ops',      title: 'Bracket Studio',     meta: ['DAO treasury', '1.2M USDC under ops', '0 incidents'] },
  { tag: 'MIGRATION', status: 'shipped',  title: 'Spool Protocol',     meta: ['L1 → Base migration', '48-hour cutover'] },
];

function RecentProjects() {
  return (
    <section className="section">
      <div className="wrap">
        <div className="prompt-line">
          <span>//</span>
          <span className="cmd">./projects <span className="gold">--recent</span> | head -4</span>
        </div>
        <div className="proj-grid">
          {PROJECTS.map(p => (
            <div key={p.title} className="proj-cell">
              <div className="head">
                <span className={'dot' + (p.status === 'ops' ? ' idle' : '')} />
                {p.tag} · {p.status}
              </div>
              <div className="title">{p.title}</div>
              <div className="meta">
                {p.meta.map((m, i) => (
                  <React.Fragment key={i}>
                    {i > 0 && ' · '}
                    <strong>{m}</strong>
                  </React.Fragment>
                ))}
              </div>
              <a className="link">cat ./case-study →</a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── FOUNDER ───────────────────────────────────────── */
function FounderStrip() {
  return (
    <section className="section">
      <div className="wrap">
        <div className="prompt-line">
          <span>//</span>
          <span className="cmd">cat ./operator.md</span>
        </div>
        <div className="founder">
          <div className="founder-photo">
            <span className="label">[ founder photo ]</span>
          </div>
          <div className="founder-meta">
            <div className="role">Operator since 2013</div>
            <div className="name">Hands-on, values in order, pro expansion.</div>
            <p className="bio">
              I started in 2013 — Occupy LA, early DeFi, the long winter.
              Fourteen projects shipped since. I don't outsource the work that
              matters; if you hire me, I'm the one on the keyboard. I help
              founders launch tokens and agents on Base with OpSec that
              actually holds.
            </p>
            <div className="principles">
              <span className="principle">Hands-on</span>
              <span className="principle">Values in order</span>
              <span className="principle">Pro expansion</span>
            </div>
          </div>
          <button className="cmd-btn ghost">
            <span className="prompt">//</span>read --more
          </button>
        </div>
      </div>
    </section>
  );
}

/* ─── NEWSDESK FEED ─────────────────────────────────── */
const NEWS = [
  { cat: 'sovereignty',  title: 'SIWE Auth and the End of Password Logins',    meta: 'Apr 28 · 7 min' },
  { cat: 'dispatch',     title: 'Phase 1 Dispatch — What Shipped This Week',   meta: 'Apr 22 · 4 min' },
  { cat: 'intelligence', title: 'The Cyborg Agency: 1 Human + 13 Agents',      meta: 'Apr 12 · 6 min' },
];

function NewsDeskFeed() {
  return (
    <section className="section">
      <div className="wrap">
        <div className="prompt-line">
          <span>//</span>
          <span className="cmd">./newsdesk <span className="gold">--latest</span></span>
        </div>
        <div className="sheet">
          {NEWS.map(n => (
            <div key={n.title} className="feed-row">
              <span className="cat">[ {n.cat} ]</span>
              <span className="title">{n.title}</span>
              <span className="meta">{n.meta}</span>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 28 }}>
          <button className="cmd-btn ghost">
            <span className="prompt">//</span>subscribe --newsdesk
          </button>
        </div>
      </div>
    </section>
  );
}

/* ─── SCHOOL TEASER ─────────────────────────────────── */
function SchoolTeaser() {
  return (
    <section className="section">
      <div className="wrap">
        <div className="prompt-line">
          <span>//</span>
          <span className="cmd">./school <span className="gold">--curriculum</span></span>
        </div>
        <div className="sheet">
          <div className="sheet-row">
            <span className="num">01</span>
            <div className="body">
              <span className="name">wallets_and_self_custody.md</span>
              <span className="desc">Hardware keys, seed phrases, recovery. 12 lessons.</span>
            </div>
            <span className="price"><span className="unit" style={{ color: '#4ADE80', fontWeight: 700 }}>FREE</span></span>
          </div>
          <div className="sheet-row">
            <span className="num">02</span>
            <div className="body">
              <span className="name">l1_vs_l2_base.md</span>
              <span className="desc">Rollups, gas economics, sequencer trust.</span>
            </div>
            <span className="price"><span className="unit" style={{ color: '#4ADE80', fontWeight: 700 }}>FREE</span></span>
          </div>
          <div className="sheet-row">
            <span className="num">03</span>
            <div className="body">
              <span className="name">defi_primitives.md</span>
              <span className="desc">AMMs, lending, CDPs.</span>
            </div>
            <span className="price">80 USDC</span>
          </div>
          <div className="sheet-row">
            <span className="num">04</span>
            <div className="body">
              <span className="name">opsec_hardware_keys.md</span>
              <span className="desc">YubiKey, Ledger, multisig basics.</span>
            </div>
            <span className="price">80 USDC</span>
          </div>
        </div>
        <div style={{ marginTop: 28 }}>
          <button className="cmd-btn ghost">
            <span className="prompt">//</span>./school --enroll
          </button>
        </div>
      </div>
    </section>
  );
}

/* ─── CLOSING CTA ───────────────────────────────────── */
function ClosingCTA() {
  return (
    <section className="section" style={{ textAlign: 'center', paddingTop: 64, paddingBottom: 64 }}>
      <div className="wrap">
        <div className="prompt-line" style={{ justifyContent: 'center', marginBottom: 20 }}>
          <span>//</span>
          <span className="cmd">./ready --book</span>
        </div>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 28,
          color: 'var(--cream)', lineHeight: 1.4, marginBottom: 14,
          letterSpacing: '.2px'
        }}>
          Thirty minutes. <span style={{ color: 'var(--gold-warm)' }}>No pitch.</span>
        </div>
        <p style={{
          fontFamily: 'var(--font-mono)', fontSize: 14,
          color: 'var(--mono-blue)', maxWidth: 520, margin: '0 auto 32px',
          lineHeight: 1.85,
        }}>
          You bring a problem. I bring 13 years of crypto experience and a
          notebook. If we're a fit, we work together. If not, you leave with
          notes.
        </p>
        <button className="cmd-btn solid" style={{ marginLeft: 0, fontSize: 14, padding: '14px 26px' }}>
          <span className="prompt">//</span>book --strategy-call
        </button>
      </div>
    </section>
  );
}

/* ─── FOOTER ────────────────────────────────────────── */
function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand-block">
          <div className="footer-brand">
            <img src="sc-logo.jpg" alt="" />
            <span className="mark">Supercompute.io</span>
          </div>
          <p className="footer-tag">
            One operator. Hands-on Web3 consulting on Base Chain since 2013.
          </p>
        </div>
        <div className="footer-col">
          <h4>Practice</h4>
          <a>Consulting</a><a>Recent work</a><a>About</a><a>Contact</a>
        </div>
        <div className="footer-col">
          <h4>Publishing</h4>
          <a>NewsDesk</a><a>Web3 School</a><a>$SCOM Token</a>
        </div>
        <div className="footer-col">
          <h4>Connect</h4>
          <a>X / Twitter</a><a>Farcaster</a><a>supercompute.eth</a><a>Calendly</a>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2026 Supercompute · Phase 1 · Base Chain</span>
        <span className="right">// uptime → 99.9% · since may 2026</span>
      </div>
    </footer>
  );
}

Object.assign(window, {
  HudFrame, TopNav, Hero, Services, RecentProjects,
  FounderStrip, NewsDeskFeed, SchoolTeaser, ClosingCTA, Footer,
});
