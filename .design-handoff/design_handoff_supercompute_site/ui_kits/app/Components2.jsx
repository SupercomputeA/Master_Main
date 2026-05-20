/* @jsx React.createElement */
/* App UI kit · second batch — Token Overview + Agent Fleet admin.
 * Both rely on Topbar/StatTile/section-h from Components.jsx + the
 * .token-* / .fleet-* / .kill-warn rules in styles.css. */

const SCOM_ALLOC = [
  { name: 'treasury',  pct: 32, lock: 'live',         mono: false },
  { name: 'team',      pct: 22, lock: 'vesting · 24m', mono: false },
  { name: 'public',    pct: 18, lock: 'live',         mono: false },
  { name: 'liquidity', pct: 14, lock: 'live',         mono: true },
  { name: 'agent_ops', pct: 10, lock: 'live',         mono: true },
  { name: 'reserve',   pct:  4, lock: 'locked · 12m', mono: true },
];

const SCOM_TX = [
  { type: 'send',  from: 'treasury.eth',   to: 'agent_ops.eth',  amount: '12,500 SCOM',  when: '14m ago' },
  { type: 'recv',  from: 'public · aerodrome', to: 'treasury.eth',  amount: '+3,840 USDC', when: '2h ago' },
  { type: 'stake', from: '0x9b…1c4',        to: 'staking.scom.eth', amount: '8,200 SCOM', when: '6h ago' },
  { type: 'send',  from: 'treasury.eth',   to: 'liquidity.scom',  amount: '20,000 SCOM', when: '1d ago' },
  { type: 'recv',  from: 'public · aerodrome', to: 'treasury.eth',  amount: '+1,920 USDC', when: '1d ago' },
];

function TokenPage() {
  const [copied, setCopied] = React.useState(false);
  const addr = '0xC0DE7C9A0B…F8a2';
  const copy = () => {
    navigator.clipboard && navigator.clipboard.writeText('0xC0DE7C9A0BAdC0DE7C9A0BAdC0DE7C9A0BF8a2');
    setCopied(true); setTimeout(() => setCopied(false), 1400);
  };
  return (
    <React.Fragment>
      <Topbar
        path={<span className="gold">scom_token</span>}
        sub="phase 1 · base"
        badge={<span className="badge badge-live">live</span>}
        actions={
          <React.Fragment>
            <button className="tb-btn">view contract</button>
            <button className="tb-btn primary">buy on aerodrome</button>
          </React.Fragment>
        }
      />
      <div className="pg-body">

        <div className="token-hero">
          <div>
            <div className="l-eyebrow">scom · token overview</div>
            <div className="symbol">$SCOM<span className="dim">· supercompute</span></div>
            <div className="price">0.0428 <span style={{fontSize:'14px',color:'var(--mono-blue)'}}>USDC</span></div>
            <div className="change">↑ +6.2% / 24h · vol 128.4K USDC</div>
            <div className="contract">
              <span className="lbl">contract</span>
              <span className="addr">{addr}</span>
              <span className="chain">base</span>
              <button className="copy" onClick={copy}>{copied ? 'copied' : 'copy'}</button>
            </div>
          </div>
          <div className="actions">
            <button className="ta primary"><span>buy --aerodrome</span><span className="arrow">→</span></button>
            <button className="ta outline"><span><span className="pr">//</span>stake --scom</span><span className="arrow">→</span></button>
            <button className="ta outline"><span><span className="pr">//</span>add to wallet</span><span className="arrow">↗</span></button>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap: 8, marginTop: 4 }}>
              <div style={{ padding: '10px 12px', border: '1px solid rgba(244,236,216,.10)', background: 'rgba(0,0,0,.18)' }}>
                <div style={{ fontSize: 9, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--mono-blue)', marginBottom: 4 }}>holders</div>
                <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--cream)', letterSpacing: '-.2px' }}>2,184</div>
              </div>
              <div style={{ padding: '10px 12px', border: '1px solid rgba(244,236,216,.10)', background: 'rgba(0,0,0,.18)' }}>
                <div style={{ fontSize: 9, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--mono-blue)', marginBottom: 4 }}>mkt cap</div>
                <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--cream)', letterSpacing: '-.2px' }}>4.28M USDC</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid4" style={{ marginBottom: 32 }}>
          <StatTile label="supply"   value="100M" sub="fully diluted" />
          <StatTile label="circ"     value="42M"  sub="42% live · vesting" />
          <StatTile label="staked"   value="11.4M" sub="↑ 27% APR" trend="up" />
          <StatTile label="treasury" value="48.2K" sub="USDC · ↑ +3.1% / 30d" trend="up" />
        </div>

        <h3 className="section-h">allocation <span className="dim">--breakdown</span></h3>
        <div className="sheet sheet-rows" style={{ marginBottom: 32 }}>
          {SCOM_ALLOC.map(a => (
            <div key={a.name} className="alloc-row">
              <span className="name">{a.name}</span>
              <span className={`bar ${a.mono ? 'mono' : ''}`}><div style={{ width: `${a.pct * 3}%` }} /></span>
              <span className="pct">{a.pct}%</span>
              <span className={`lock ${a.lock.startsWith('live') ? 'live' : a.lock.startsWith('locked') ? 'locked' : ''}`}>
                {a.lock}
              </span>
            </div>
          ))}
        </div>

        <h3 className="section-h">activity <span className="dim">--recent</span></h3>
        <div className="sheet sheet-rows">
          {SCOM_TX.map((t, i) => (
            <div key={i} className="tx-row">
              <span className={`type ${t.type}`}>[ {t.type} ]</span>
              <span className="from">{t.from}</span>
              <span className="to"><span className="dim">→ </span>{t.to}</span>
              <span className="amount">{t.amount}</span>
              <span className="when">{t.when}</span>
            </div>
          ))}
        </div>

      </div>
    </React.Fragment>
  );
}

/* ─── AGENT FLEET (admin) ──────────────────────────── */

const FLEET = [
  { name: 'Quanta S',     role: 'newsdesk',    s: 'online', desc: 'publishing · 6 articles live · queue: 3 drafts',         runs: 142, errs: 0, last: '4m ago' },
  { name: 'KNIGHT',       role: 'tradedesk',   s: 'online', desc: 'monitoring 2 positions · health factor 2.14',            runs: 88,  errs: 0, last: '2m ago' },
  { name: 'OpenClaw',     role: 'infra',       s: 'online', desc: 'cross-post queue · 14 scheduled · last run 12m ago',     runs: 312, errs: 2, last: '12m ago' },
  { name: 'Tutor S',      role: 'school',      s: 'paused', desc: '3 modules in review · waiting on Quanta approval',       runs: 24,  errs: 0, last: '1h ago' },
  { name: 'Sentinel',     role: 'opsec',       s: 'online', desc: 'clean · last scan 3m ago · 0 incidents this quarter',    runs: 1440, errs: 0, last: '3m ago' },
  { name: 'Forge',        role: 'contracts',   s: 'dev',    desc: 'staking_v2.sol compiling · base-sepolia',                runs: 8,   errs: 1, last: '38m ago' },
  { name: 'Bracket',      role: 'treasury',    s: 'online', desc: 'rebalancing CDP collateral · spark spell active',         runs: 56,  errs: 0, last: '18m ago' },
  { name: 'Loom',         role: 'social',      s: 'online', desc: 'thread synthesis · 4 pending review',                     runs: 96,  errs: 0, last: '8m ago' },
  { name: 'Lattice',      role: 'analytics',   s: 'online', desc: 'on-chain index · sync caught up to head',                 runs: 240, errs: 0, last: '1m ago' },
  { name: 'Anvil',        role: 'staking',     s: 'online', desc: 'reward distribution · next epoch in 4h',                  runs: 36,  errs: 0, last: '22m ago' },
  { name: 'Beacon',       role: 'alerts',      s: 'online', desc: 'pushing to telegram · slack · email',                     runs: 128, errs: 0, last: '6m ago' },
  { name: 'Vellum',       role: 'docs',        s: 'error',  desc: 'sphinx build failed · missing token reference',           runs: 12,  errs: 4, last: '2h ago' },
  { name: 'Claude Desktop', role: 'command',   s: 'online', desc: 'strategic command layer · linear coordination',           runs: 18,  errs: 0, last: '5m ago' },
];

function AgentFleet() {
  const online = FLEET.filter(f => f.s === 'online').length;
  const totalRuns = FLEET.reduce((a, b) => a + b.runs, 0);
  const totalErrs = FLEET.reduce((a, b) => a + b.errs, 0);
  return (
    <React.Fragment>
      <Topbar
        path={<span className="gold">agent_fleet</span>}
        sub="13 agents · admin"
        badge={<span className="badge badge-admin">admin</span>}
        actions={
          <React.Fragment>
            <button className="tb-btn">deploy new</button>
            <button className="tb-btn primary">pause all</button>
          </React.Fragment>
        }
      />
      <div className="pg-body">

        <div className="grid4" style={{ marginBottom: 32 }}>
          <StatTile label="fleet"     value="13"        sub={`${online} online · ${FLEET.length - online} other`} trend={FLEET.length === online ? 'up' : ''} />
          <StatTile label="runs"      value={totalRuns.toLocaleString()} sub="last 24h" trend="up" />
          <StatTile label="errors"    value={totalErrs} sub={totalErrs === 0 ? 'clean' : 'needs attn'} trend={totalErrs === 0 ? 'up' : 'down'} />
          <StatTile label="uptime"    value="99.94%"    sub="rolling 30d" trend="up" />
        </div>

        <h3 className="section-h">fleet <span className="dim">--list</span></h3>
        <div className="sheet sheet-rows">
          {FLEET.map(f => (
            <div key={f.name} className="fleet-row">
              <span className={`dot ${f.s}`} />
              <span className="name">{f.name}<span className="role">· {f.role}</span></span>
              <span className="desc">{f.desc}</span>
              <span className="runs">
                {f.runs}<span className="dim"> runs</span>
                {f.errs > 0 && <span className="err"> · {f.errs}!</span>}
              </span>
              <span className="last">{f.last}</span>
              <span className="actions">
                {f.s === 'paused'
                  ? <button className="fb">resume</button>
                  : <button className="fb">pause</button>}
                <button className="fb">logs</button>
                <button className="fb">prompt</button>
                <button className="fb danger">kill</button>
              </span>
            </div>
          ))}
        </div>

        <div className="kill-warn">
          <div>
            <div className="l">danger zone</div>
            <div className="t">Pause the entire fleet</div>
            <div className="s">Halts all 13 agents immediately. Open positions remain on-chain — KNIGHT will not manage liquidation risk while paused. Resume from this panel or via signed admin tx.</div>
          </div>
          <button className="kbtn">kill --all-agents</button>
        </div>

      </div>
    </React.Fragment>
  );
}

Object.assign(window, { TokenPage, AgentFleet });
