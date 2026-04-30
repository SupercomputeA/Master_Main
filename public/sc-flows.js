/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   sc-flows.js — Project Investment · Blog Compose · Booking
                 + Create Project · Add Asset · New Post
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

/* ━━━ PROJECT DATA ━━━ */
const PROJECT_DETAIL = {
    newsdesk: {
        id: 'newsdesk', name: 'NewsDesk', coin: '$QUANTA', badge: 'Live', bc: 'badge-live',
        tagline: 'The on-chain intelligence layer for Web3 operators.',
        desc: 'NewsDesk is Supercompute\'s autonomous content platform. Powered by Quanta S, it publishes intelligence reports, sovereignty stack updates, and agent dispatches. Content is written by AI agents, reviewed by humans, and cross-posted to X, Lens, and Farcaster automatically.',
        raised: 0, goal: 250000, backers: 0, chain: 'Base', token: '$QUANTA',
        contract: '0x5acdc...371a', repo: 'newsdesk-cf', phase: 'Phase 1',
        team: [{ name: 'Orami', role: 'Founder' }, { name: 'Quanta S', role: 'AI Editor' }, { name: 'OpenClaw', role: 'Distribution' }],
        tiers: [
            { name: 'Signal Reader', price: 50, token: 500, perks: ['NewsDesk access', '$QUANTA airdrop', 'Signal category early access'], color: 'var(--muted)' },
            { name: 'Intelligence Operator', price: 250, token: 3000, perks: ['All Signal perks', 'Agent Chat priority', 'Monthly briefing call', 'Discord role'], color: 'var(--cyan2)' },
            { name: 'Founding Backer', price: 1000, token: 15000, perks: ['All Operator perks', 'Founding NFT credential', 'Name in changelog', 'Direct Quanta S access'], color: 'var(--pink)' },
        ],
        milestones: [
            { date: 'Jan 2026', title: 'Architecture designed', done: true, desc: 'Cloudflare Workers + D1 + Sanity CMS stack finalized.' },
            { date: 'Feb 2026', title: 'Quanta S deployed', done: true, desc: 'Agent live on Virtuals Protocol. Content pipeline active.' },
            { date: 'Mar 2026', title: '6 founding articles published', done: true, desc: 'All founding content written and queued in Sanity.' },
            { date: 'Apr 2026', title: 'Public launch', done: false, desc: 'NewsDesk goes live at supercompute.io/newsdesk.' },
            { date: 'May 2026', title: '$QUANTA TGE', done: false, desc: 'Token launch on Base. Backer airdrop distributed.' },
            { date: 'Q3 2026', title: 'API for third-party publishers', done: false, desc: 'Open the NewsDesk API to external Web3 media.' },
        ],
        updates: [
            { date: 'Apr 25, 2026', author: 'Quanta S', title: 'Launch countdown: 6 days out', body: 'All 6 founding articles are live in Sanity CMS. OpenClaw has the social queue loaded. API status: green across the board.' },
            { date: 'Apr 18, 2026', author: 'Orami', title: '$QUANTA contract submitted to Virtuals', body: 'Verification pending. Contract 0x5acdc...371a is in the Virtuals review queue. ETA: 7-10 days.' },
            { date: 'Mar 27, 2026', author: 'Quanta S', title: 'Article #6 published', body: 'The SIWE auth piece is live. All founding content complete. Moving to distribution phase.' },
        ]
    },
    wordwatcher: {
        id: 'wordwatcher', name: 'WordWatcher NFT', coin: '$VERB', badge: 'In Progress', bc: 'badge-progress',
        tagline: 'Generative word NFTs with on-chain metadata on Base.',
        desc: 'WordWatcher is a generative NFT collection where every piece is a typographic composition built from words with cultural weight. 1,000 pieces. On-chain metadata. $VERB token economics. 50% of secondary royalties route to the community treasury.',
        raised: 1000, goal: 10000, backers: 7, chain: 'Base', token: '$VERB',
        contract: 'Pending deployment', repo: 'Verb_NFT', phase: 'Phase 1',
        team: [{ name: 'Orami', role: 'Creative Director' }, { name: 'OpenClaw', role: 'Mint automation' }, { name: 'KNIGHT', role: 'Treasury' }],
        tiers: [
            { name: 'Early Collector', price: 100, token: 1000, perks: ['1 WordWatcher NFT', '$VERB whitelist', 'Discord Collector role'], color: 'var(--muted)' },
            { name: 'Word Patron', price: 500, token: 6000, perks: ['5 NFTs', '$VERB whitelist', 'Trait vote access', 'Patron NFT credential'], color: 'var(--gold2)' },
            { name: 'Genesis Backer', price: 2000, token: 30000, perks: ['20 NFTs', '$VERB founding allocation', 'Named word slot', 'Revenue share'], color: 'var(--pink)' },
        ],
        milestones: [
            { date: 'Dec 2025', title: 'Concept & wordlist finalized', done: true, desc: '1,000 word candidates curated across culture, activism, and technology.' },
            { date: 'Feb 2026', title: 'Generative engine built', done: true, desc: 'On-chain SVG renderer complete. Metadata schema locked.' },
            { date: 'Mar 2026', title: 'First $1k raised', done: true, desc: '7 backers. Genesis round open.' },
            { date: 'May 2026', title: 'Smart contract audit', done: false, desc: 'ERC-1155 contract going through audit. Launching post-audit.' },
            { date: 'Jun 2026', title: 'Public mint', done: false, desc: '1,000 piece mint on Base. $VERB TGE to follow.' },
        ],
        updates: [
            { date: 'Apr 22, 2026', author: 'Orami', title: 'Contract audit partner confirmed', body: 'Working with a Base-native audit firm. Timeline: 3-4 weeks. Mint date targeting June 15.' },
            { date: 'Mar 30, 2026', author: 'Orami', title: 'Genesis round hits $1k', body: '7 backers in. Thank you. Every backer gets a founding NFT credential on Base.' },
        ]
    },
    nftnation: {
        id: 'nftnation', name: 'NFT Nation DAO', coin: '$NATION', badge: 'In Progress', bc: 'badge-progress',
        tagline: 'National identity NFTs with on-chain governance and treasury.',
        desc: 'NFT Nation DAO creates digital nation-state identities as NFTs. Each nation has its own treasury, governance token, and community. Citizens vote on policies, allocate treasury funds, and participate in cross-nation diplomacy. All on Base.',
        raised: 0, goal: 500000, backers: 0, chain: 'Base', token: '$NATION',
        contract: 'In design', repo: 'nft-nation', phase: 'Pre-seed',
        team: [{ name: 'Orami', role: 'Protocol Architect' }, { name: 'TBD', role: 'Governance Lead' }, { name: 'TBD', role: 'Contract Dev' }],
        tiers: [
            { name: 'Citizen', price: 200, token: 2000, perks: ['1 Nation NFT', 'Governance rights', 'Treasury participation'], color: 'var(--muted)' },
            { name: 'Delegate', price: 1000, token: 12000, perks: ['5 Nation NFTs', 'Delegate status', 'Committee access', 'Revenue share'], color: 'var(--cyan2)' },
            { name: 'Founding Nation', price: 5000, token: 75000, perks: ['Nation genesis rights', 'Treasury seed', 'Protocol governance', 'Advisor status'], color: 'var(--pink)' },
        ],
        milestones: [
            { date: 'Q2 2026', title: 'Whitepaper published', done: false, desc: 'Full governance and economic design document.' },
            { date: 'Q3 2026', title: 'Prototype DAO live on testnet', done: false, desc: 'Governance, treasury, and voting mechanisms tested.' },
            { date: 'Q4 2026', title: 'Genesis nations mint', done: false, desc: 'First 7 nations available for community founding.' },
        ],
        updates: []
    }
};

/* ━━━ BLOG DRAFT STATE ━━━ */
var blogDrafts = JSON.parse(localStorage.getItem('sc_drafts') || '[]');
var editingDraftId = null;
var currentProjectId = null;
var bookingState = { service: null, date: null, time: null };

/* ━━━ PROJECT DETAIL ━━━ */
function openProject(id) {
    currentProjectId = id;
    const p = PROJECT_DETAIL[id];
    if (!p) { showToast('Project details coming soon'); return; }
    renderProjectDetail(p);
    navigate('project-detail', null);
}

function renderProjectDetail(p) {
    const el = document.getElementById('projectDetailBody');
    if (!el) return;
    const pct = p.goal > 0 ? Math.min(Math.round(p.raised / p.goal * 100), 100) : 0;
    el.innerHTML = `
  <!-- HERO -->
  <div style="background:linear-gradient(135deg,var(--navy),#1a0a2e);padding:2rem 1.5rem;color:#fff;position:relative;overflow:hidden">
    <div style="position:absolute;width:300px;height:300px;border-radius:50%;background:radial-gradient(circle,rgba(233,30,140,.2) 0%,transparent 70%);top:-100px;right:-60px;pointer-events:none"></div>
    <div style="display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:1rem;position:relative">
      <div>
        <div style="display:flex;align-items:center;gap:.75rem;margin-bottom:.75rem">
          <div style="width:48px;height:48px;border-radius:12px;background:linear-gradient(135deg,var(--pink),var(--gold));display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:800;color:#fff">${p.name[0]}</div>
          <div>
            <div style="font-weight:800;font-size:1.2rem;color:#fff">${p.name}</div>
            <div style="font-size:12px;color:rgba(255,255,255,.5)">${p.chain} · ${p.token} · ${p.phase}</div>
          </div>
          <span class="badge ${p.bc}" style="margin-left:.5rem">${p.badge}</span>
        </div>
        <p style="font-size:.9rem;color:rgba(255,255,255,.65);max-width:520px;line-height:1.7">${p.tagline}</p>
      </div>
      <div style="display:flex;flex-direction:column;gap:.5rem;flex-shrink:0">
        <button onclick="openInvestFlow('${p.id}')" style="padding:.75rem 1.5rem;background:var(--pink);color:#fff;border:none;border-radius:9px;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;transition:all .2s" onmouseenter="this.style.background='var(--pink2)'" onmouseleave="this.style.background='var(--pink)'">Back this project →</button>
        <button onclick="navigate('pub-projects',navItem('pub-projects'))" style="padding:.6rem 1rem;background:rgba(255,255,255,.08);color:rgba(255,255,255,.6);border:1px solid rgba(255,255,255,.15);border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;font-family:inherit">← All Projects</button>
      </div>
    </div>
    <!-- Funding bar -->
    <div style="margin-top:1.5rem;background:rgba(255,255,255,.06);border-radius:12px;padding:1rem;border:1px solid rgba(255,255,255,.1)">
      <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:.6rem">
        <div><span style="font-size:1.5rem;font-weight:900;color:#fff">$${p.raised.toLocaleString()}</span><span style="font-size:13px;color:rgba(255,255,255,.4);margin-left:.4rem">raised</span></div>
        <div style="text-align:right"><div style="font-size:13px;color:rgba(255,255,255,.4)">Goal: $${(p.goal / 1000).toFixed(0)}k</div><div style="font-size:12px;color:rgba(255,255,255,.4)">${p.backers} backers</div></div>
      </div>
      <div style="height:8px;background:rgba(255,255,255,.1);border-radius:4px;overflow:hidden"><div style="height:100%;width:${pct}%;background:linear-gradient(90deg,var(--pink),var(--gold));border-radius:4px;transition:width 1s ease"></div></div>
      <div style="font-size:11px;color:rgba(255,255,255,.35);margin-top:.4rem">${pct}% funded · Backing open</div>
    </div>
  </div>

  <!-- TABS NAV -->
  <div class="dash-tabs" id="projTabs">
    <div class="dash-tab active" onclick="showProjTab('overview',this)">Overview</div>
    <div class="dash-tab" onclick="showProjTab('invest',this)">Back This Project</div>
    <div class="dash-tab" onclick="showProjTab('milestones',this)">Milestones</div>
    <div class="dash-tab" onclick="showProjTab('updates',this)">Updates (${p.updates.length})</div>
    <div class="dash-tab" onclick="showProjTab('team',this)">Team</div>
  </div>

  <!-- TAB BODIES -->
  <div id="projTab-overview" style="padding:1.5rem">
    <div class="grid2-3" style="gap:1.25rem">
      <div>
        <div class="card" style="margin-bottom:1.25rem">
          <div class="section-title">About This Project</div>
          <p style="font-size:13px;color:var(--text);line-height:1.8;text-wrap:pretty">${p.desc}</p>
          <div style="display:flex;gap:.5rem;flex-wrap:wrap;margin-top:1rem">
            <span style="padding:.25rem .65rem;border-radius:20px;background:rgba(233,30,140,.08);color:var(--pink);border:1px solid rgba(233,30,140,.15);font-size:11px;font-weight:600">${p.chain}</span>
            <span style="padding:.25rem .65rem;border-radius:20px;background:rgba(0,212,255,.08);color:var(--cyan2);border:1px solid rgba(0,212,255,.15);font-size:11px;font-weight:600">${p.token}</span>
            <span style="padding:.25rem .65px .25rem .65rem;border-radius:20px;background:rgba(255,184,0,.08);color:var(--gold2);border:1px solid rgba(255,184,0,.15);font-size:11px;font-weight:600;padding:.25rem .65rem">${p.phase}</span>
          </div>
        </div>
        <div class="card">
          <div class="section-title">On-Chain Details</div>
          <div style="display:flex;flex-direction:column;gap:.5rem">
            ${[['Chain', p.chain], ['Token', p.token], ['Contract', p.contract], ['Repo', p.repo]].map(([l, v]) => `<div style="display:flex;justify-content:space-between;align-items:center;padding:.5rem;background:var(--bg);border-radius:6px"><span style="font-size:11px;color:var(--muted)">${l}</span><span style="font-size:11px;font-weight:600;color:var(--text);font-family:monospace">${v}</span></div>`).join('')}
          </div>
        </div>
      </div>
      <div>
        <div class="card" style="margin-bottom:1rem">
          <div class="section-title">Backing Tiers</div>
          ${p.tiers.map(t => `<div style="border:1.5px solid var(--border);border-radius:10px;padding:.85rem;margin-bottom:.65rem;transition:all .2s;cursor:pointer" onmouseenter="this.style.borderColor='${t.color}'" onmouseleave="this.style.borderColor='var(--border)'" onclick="openInvestFlow('${p.id}','${t.name}')">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.4rem">
              <span style="font-weight:700;font-size:12px;color:var(--text)">${t.name}</span>
              <span style="font-weight:800;font-size:13px;color:${t.color}">$${t.price}</span>
            </div>
            <div style="font-size:10px;color:var(--muted);margin-bottom:.5rem">${t.token.toLocaleString()} ${p.token} included</div>
            ${t.perks.map(perk => `<div style="font-size:11px;color:var(--muted);display:flex;align-items:center;gap:.35rem;margin-bottom:.2rem"><span style="color:var(--success);font-size:9px">✓</span>${perk}</div>`).join('')}
            <button style="width:100%;margin-top:.65rem;padding:.5rem;background:transparent;border:1px solid ${t.color};color:${t.color};border-radius:7px;font-size:11px;font-weight:700;cursor:pointer;font-family:inherit;transition:all .2s" onmouseenter="this.style.background='${t.color}';this.style.color='#fff'" onmouseleave="this.style.background='transparent';this.style.color='${t.color}'">Back at this tier →</button>
          </div>`).join('')}
        </div>
      </div>
    </div>
  </div>

  <div id="projTab-invest" style="padding:1.5rem;display:none">
    ${renderInvestTabHTML(p)}
  </div>

  <div id="projTab-milestones" style="padding:1.5rem;display:none">
    <div class="card">
      <div class="section-title">Project Milestones</div>
      <div style="position:relative;padding-left:1.5rem">
        ${p.milestones.map((m, i) => `<div style="position:relative;margin-bottom:1.25rem">
          <div style="position:absolute;left:-1.5rem;top:2px;width:12px;height:12px;border-radius:50%;background:${m.done ? 'var(--success)' : 'var(--border)'};border:2px solid ${m.done ? 'var(--success)' : 'var(--border)'};z-index:1"></div>
          ${i < p.milestones.length - 1 ? `<div style="position:absolute;left:-1.5rem;top:14px;width:2px;height:calc(100% + 1rem);background:var(--border);margin-left:5px"></div>` : ''}
          <div style="padding:.85rem;background:${m.done ? 'rgba(22,163,74,.04)' : 'var(--bg)'};border-radius:10px;border:1px solid ${m.done ? 'rgba(22,163,74,.2)' : 'var(--border)'}">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:.3rem">
              <span style="font-weight:700;font-size:13px;color:var(--text)">${m.title}</span>
              <div style="display:flex;align-items:center;gap:.5rem"><span style="font-size:11px;color:var(--muted)">${m.date}</span><span class="badge ${m.done ? 'badge-live' : 'badge-soon'}">${m.done ? 'Complete' : 'Upcoming'}</span></div>
            </div>
            <p style="font-size:12px;color:var(--muted);line-height:1.5">${m.desc}</p>
          </div>
        </div>`).join('')}
      </div>
    </div>
  </div>

  <div id="projTab-updates" style="padding:1.5rem;display:none">
    ${p.updates.length === 0 ? `<div class="card" style="text-align:center;padding:3rem"><div style="font-size:2rem;margin-bottom:.75rem">📭</div><div style="font-weight:600;color:var(--text)">No updates yet</div><div style="font-size:12px;color:var(--muted);margin-top:.3rem">Updates will appear here as the project progresses.</div></div>` :
            p.updates.map(u => `<div class="card" style="margin-bottom:1rem">
      <div style="display:flex;align-items:center;gap:.75rem;margin-bottom:.85rem;padding-bottom:.85rem;border-bottom:1px solid var(--border)">
        <div style="width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,var(--pink),var(--gold));display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:#fff;flex-shrink:0">${u.author.slice(0, 2).toUpperCase()}</div>
        <div><div style="font-weight:700;font-size:12px;color:var(--text)">${u.author}</div><div style="font-size:11px;color:var(--muted)">${u.date}</div></div>
        <span class="badge badge-live" style="margin-left:auto">Update</span>
      </div>
      <div style="font-weight:700;font-size:13px;color:var(--text);margin-bottom:.5rem">${u.title}</div>
      <p style="font-size:13px;color:var(--muted);line-height:1.7">${u.body}</p>
    </div>`).join('')}
  </div>

  <div id="projTab-team" style="padding:1.5rem;display:none">
    <div class="card">
      <div class="section-title">Core Team</div>
      <div class="grid3">
        ${p.team.map(t => `<div style="text-align:center;padding:1.25rem;background:var(--bg);border-radius:12px;border:1px solid var(--border)">
          <div style="width:48px;height:48px;border-radius:50%;background:linear-gradient(135deg,var(--pink),var(--gold));display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:700;color:#fff;margin:0 auto .75rem">${t.name[0]}</div>
          <div style="font-weight:700;font-size:13px;color:var(--text)">${t.name}</div>
          <div style="font-size:11px;color:var(--muted);margin-top:.2rem">${t.role}</div>
        </div>`).join('')}
      </div>
    </div>
  </div>
  `;
}

function showProjTab(tab, el) {
    document.querySelectorAll('#projTabs .dash-tab').forEach(t => t.classList.remove('active'));
    if (el) el.classList.add('active');
    ['overview', 'invest', 'milestones', 'updates', 'team'].forEach(t => {
        const pane = document.getElementById('projTab-' + t);
        if (pane) pane.style.display = t === tab ? 'block' : 'none';
    });
}

function renderInvestTabHTML(p) {
    return `<div style="max-width:560px;margin:0 auto">
    <div style="text-align:center;margin-bottom:1.5rem">
      <h3 style="font-size:1.15rem;font-weight:800;color:var(--text);margin-bottom:.3rem">Back ${p.name}</h3>
      <p style="font-size:13px;color:var(--muted)">Choose a tier or enter a custom amount. Payments in USDC on Base.</p>
    </div>
    <div style="display:flex;flex-direction:column;gap:.75rem;margin-bottom:1.5rem" id="investTierList">
      ${p.tiers.map((t, i) => `<div class="invest-tier" data-tier="${i}" onclick="selectTier(${i},'${p.id}')" style="border:2px solid var(--border);border-radius:12px;padding:1rem;cursor:pointer;transition:all .2s;position:relative">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <div><div style="font-weight:700;font-size:13px;color:var(--text)">${t.name}</div><div style="font-size:11px;color:var(--muted);margin-top:2px">${t.token.toLocaleString()} ${p.token}</div></div>
          <div style="text-align:right"><div style="font-size:1.2rem;font-weight:900;color:${t.color}">$${t.price}</div><div style="font-size:10px;color:var(--muted)">USDC</div></div>
        </div>
        <div style="display:flex;gap:.4rem;flex-wrap:wrap;margin-top:.6rem">${t.perks.map(perk => `<span style="font-size:10px;padding:.15rem .55rem;border-radius:20px;background:rgba(22,163,74,.08);color:var(--success);border:1px solid rgba(22,163,74,.15)">${perk}</span>`).join('')}</div>
      </div>`).join('')}
    </div>
    <div class="card" style="margin-bottom:1rem">
      <div class="section-title">Custom Amount</div>
      <div style="display:flex;gap:.75rem;align-items:center">
        <div style="flex:1;position:relative">
          <span style="position:absolute;left:.85rem;top:50%;transform:translateY(-50%);font-weight:700;color:var(--muted)">$</span>
          <input id="customInvestAmt" type="number" placeholder="Enter amount" style="width:100%;padding:.65rem .85rem .65rem 1.6rem;border:1.5px solid var(--border);border-radius:8px;font-size:14px;font-weight:700;outline:none;font-family:inherit" oninput="updateCustomInvest('${p.token}',${p.tiers[0].price})"/>
        </div>
        <span style="font-size:12px;color:var(--muted)" id="customTokenEst">— ${p.token}</span>
      </div>
    </div>
    <button onclick="proceedToCheckout('${p.id}')" style="width:100%;padding:.9rem;background:linear-gradient(135deg,var(--pink),var(--gold2));color:#fff;border:none;border-radius:10px;font-size:14px;font-weight:800;cursor:pointer;font-family:inherit;transition:opacity .2s" onmouseenter="this.style.opacity='.9'" onmouseleave="this.style.opacity='1'">Continue to Checkout →</button>
    <p style="text-align:center;font-size:11px;color:var(--muted);margin-top:.75rem">Payments via USDC on Base · No gas fees · Refundable pre-launch</p>
  </div>`;
}

function selectTier(idx, projId) {
    document.querySelectorAll('.invest-tier').forEach((el, i) => {
        const p = PROJECT_DETAIL[projId];
        const t = p.tiers[i];
        el.style.borderColor = i === idx ? t.color : 'var(--border)';
        el.style.background = i === idx ? 'rgba(233,30,140,.03)' : 'var(--card)';
    });
    const proj = PROJECT_DETAIL[projId];
    const tier = proj.tiers[idx];
    document.getElementById('customInvestAmt').value = tier.price;
    updateCustomInvest(proj.token, tier.price);
}

function updateCustomInvest(token, basePrice) {
    const amt = parseFloat(document.getElementById('customInvestAmt')?.value) || 0;
    const tokens = Math.round(amt / basePrice * PROJECT_DETAIL[currentProjectId]?.tiers[0]?.token || 0);
    const el = document.getElementById('customTokenEst');
    if (el) el.textContent = amt > 0 ? `≈ ${tokens.toLocaleString()} ${token}` : `— ${token}`;
}

function openInvestFlow(projId, tierName) {
    currentProjectId = projId;
    const p = PROJECT_DETAIL[projId];
    const tierIdx = tierName ? p.tiers.findIndex(t => t.name === tierName) : 0;
    renderInvestCheckout(p, tierIdx);
    navigate('project-invest', null);
}

function proceedToCheckout(projId) {
    openInvestFlow(projId);
}

function renderInvestCheckout(p, tierIdx) {
    const el = document.getElementById('investBody');
    if (!el) return;
    const tier = p.tiers[tierIdx] || p.tiers[0];
    let step = 1;
    function renderStep(s) {
        step = s;
        const steps = ['Select Tier', 'Payment', 'Confirm'];
        el.innerHTML = `
    <!-- Step header -->
    <div style="max-width:560px;margin:0 auto 2rem">
      <div style="display:flex;align-items:center;gap:0;margin-bottom:2rem">
        ${steps.map((st, i) => `
          <div style="flex:1;display:flex;align-items:center;gap:0">
            <div style="display:flex;flex-direction:column;align-items:center;gap:.3rem;min-width:80px">
              <div style="width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:12px;border:2px solid ${i + 1 <= step ? 'var(--pink)' : 'var(--border)'};background:${i + 1 < step ? 'var(--pink)' : i + 1 === step ? 'rgba(233,30,140,.1)' : 'transparent'};color:${i + 1 <= step ? 'var(--pink)' : 'var(--muted)'}">
                ${i + 1 < step ? '✓' : i + 1}
              </div>
              <span style="font-size:10px;font-weight:600;color:${i + 1 <= step ? 'var(--text)' : 'var(--muted)'}">${st}</span>
            </div>
            ${i < steps.length - 1 ? `<div style="flex:1;height:2px;background:${i + 1 < step ? 'var(--pink)' : 'var(--border)'};margin-bottom:1.2rem"></div>` : ''}
          </div>`).join('')}
      </div>

      ${step === 1 ? `
      <div class="card" style="margin-bottom:1rem">
        <div class="section-title">Selected Tier</div>
        <div style="display:flex;justify-content:space-between;align-items:center;padding:.85rem;background:rgba(233,30,140,.04);border-radius:10px;border:1.5px solid rgba(233,30,140,.2)">
          <div><div style="font-weight:700;color:var(--text)">${tier.name}</div><div style="font-size:11px;color:var(--muted);margin-top:2px">${tier.token.toLocaleString()} ${p.token} · ${tier.perks.length} perks</div></div>
          <div style="font-size:1.25rem;font-weight:900;color:var(--pink)">$${tier.price} USDC</div>
        </div>
        <div style="margin-top:.85rem">
          <div class="section-title">Change Tier</div>
          ${p.tiers.map((t, i) => `<div onclick="renderInvestCheckout(PROJECT_DETAIL['${p.id}'],${i})" style="display:flex;justify-content:space-between;align-items:center;padding:.6rem .75rem;border-radius:8px;border:1px solid ${i === tierIdx ? 'var(--pink)' : 'var(--border)'};margin-bottom:.4rem;cursor:pointer;transition:all .15s" onmouseenter="this.style.borderColor='var(--pink)'" onmouseleave="this.style.borderColor='${i === tierIdx ? 'var(--pink)' : 'var(--border)'}'">
            <span style="font-size:12px;font-weight:600;color:var(--text)">${t.name}</span>
            <span style="font-size:12px;font-weight:700;color:${t.color}">$${t.price}</span>
          </div>`).join('')}
        </div>
      </div>
      <button onclick="(function(){${`renderInvestCheckoutStep2(PROJECT_DETAIL['${p.id}'],${tierIdx})`}})()" style="width:100%;padding:.85rem;background:var(--pink);color:#fff;border:none;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit">Continue to Payment →</button>
      ` : ''}

      ${step === 2 ? `
      <div class="card" style="margin-bottom:1rem">
        <div style="display:flex;justify-content:space-between;margin-bottom:1rem;padding-bottom:.85rem;border-bottom:1px solid var(--border)">
          <span style="font-size:13px;font-weight:600;color:var(--text)">${tier.name}</span>
          <span style="font-size:13px;font-weight:700;color:var(--pink)">$${tier.price} USDC</span>
        </div>
        <div class="section-title">Payment Method</div>
        <div style="display:flex;flex-direction:column;gap:.5rem;margin-bottom:1rem">
          <div style="border:2px solid var(--pink);border-radius:10px;padding:.85rem;display:flex;align-items:center;gap:.75rem;cursor:pointer;background:rgba(233,30,140,.03)">
            <div style="width:34px;height:34px;border-radius:8px;background:#0052FF;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:11px;color:#fff">B</div>
            <div style="flex:1"><div style="font-weight:600;font-size:13px;color:var(--text)">Base Network USDC</div><div style="font-size:11px;color:var(--muted)">~$0.001 gas · Instant settlement</div></div>
            <span class="badge badge-live">Recommended</span>
          </div>
          <div style="border:1px solid var(--border);border-radius:10px;padding:.85rem;display:flex;align-items:center;gap:.75rem;cursor:pointer;opacity:.6" onclick="showToast('Connect Coinbase Wallet to use this option')">
            <div style="width:34px;height:34px;border-radius:8px;background:#635BFF;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:11px;color:#fff">$</div>
            <div style="flex:1"><div style="font-weight:600;font-size:13px;color:var(--text)">Stripe (Card)</div><div style="font-size:11px;color:var(--muted)">Credit/debit · 2.9% fee</div></div>
          </div>
        </div>
        <div class="section-title">Wallet Address</div>
        <div style="background:var(--bg);border-radius:8px;padding:.75rem;font-family:monospace;font-size:12px;color:var(--muted);display:flex;align-items:center;justify-content:space-between">
          <span id="payWallet">${walletConnected ? '0x7f3a...d4e2' : 'No wallet connected'}</span>
          ${walletConnected ? '<span class="badge badge-live">Connected</span>' : `<button onclick="toggleWallet();renderInvestCheckout(PROJECT_DETAIL['${p.id}'],${tierIdx})" class="tb-btn primary" style="font-size:10px;padding:.2rem .65rem">Connect</button>`}
        </div>
      </div>
      <button onclick="renderInvestCheckoutStep3(PROJECT_DETAIL['${p.id}'],${tierIdx})" style="width:100%;padding:.85rem;background:var(--pink);color:#fff;border:none;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit">Review & Confirm →</button>
      <button onclick="renderInvestCheckout(PROJECT_DETAIL['${p.id}'],${tierIdx})" style="width:100%;padding:.65rem;border:1px solid var(--border);background:transparent;color:var(--muted);border-radius:8px;font-size:12px;cursor:pointer;font-family:inherit;margin-top:.5rem">← Back</button>
      ` : ''}

      ${step === 3 ? `
      <div class="card" style="margin-bottom:1rem">
        <div class="section-title">Order Summary</div>
        ${[['Project', p.name], ['Tier', tier.name], ['Amount', `$${tier.price} USDC`], [`${p.token} Received`, `${tier.token.toLocaleString()} ${p.token}`], ['Network', 'Base'], ['Gas', '~$0.001'],].map(([l, v]) => `<div style="display:flex;justify-content:space-between;padding:.5rem 0;border-bottom:1px solid rgba(229,231,235,.5);font-size:12px"><span style="color:var(--muted)">${l}</span><span style="font-weight:600;color:var(--text)">${v}</span></div>`).join('')}
        <div style="display:flex;justify-content:space-between;padding:.65rem 0;font-size:13px"><span style="font-weight:700;color:var(--text)">Total</span><span style="font-weight:800;color:var(--pink)">$${tier.price} USDC</span></div>
        <div style="background:rgba(22,163,74,.04);border:1px solid rgba(22,163,74,.2);border-radius:8px;padding:.75rem;font-size:11px;color:var(--muted);line-height:1.5;margin-top:.5rem">🔒 Funds held in escrow until project milestones are met. Refundable if project does not launch.</div>
      </div>
      <button onclick="confirmInvestment('${p.id}','${tier.name}',${tier.price},${tier.token},'${p.token}')" style="width:100%;padding:.9rem;background:linear-gradient(135deg,var(--pink),var(--gold2));color:#fff;border:none;border-radius:10px;font-size:14px;font-weight:800;cursor:pointer;font-family:inherit">Confirm & Back Project →</button>
      <button onclick="renderInvestCheckoutStep2(PROJECT_DETAIL['${p.id}'],${tierIdx})" style="width:100%;padding:.65rem;border:1px solid var(--border);background:transparent;color:var(--muted);border-radius:8px;font-size:12px;cursor:pointer;font-family:inherit;margin-top:.5rem">← Back</button>
      ` : ''}
    </div>`;
    }
    renderStep(1);
}

function renderInvestCheckoutStep2(p, tierIdx) {
    currentProjectId = p.id;
    renderInvestCheckout(p, tierIdx);
    // Force step 2 by re-calling with a modified render
    const el = document.getElementById('investBody');
    const tier = p.tiers[tierIdx];
    const steps = ['Select Tier', 'Payment', 'Confirm'];
    const stepHtml = el.innerHTML;
    // Just re-render step 2 directly
    el.querySelector && renderInvestStep(p, tier, tierIdx, 2);
}

function renderInvestStep(p, tier, tierIdx, step) {
    const el = document.getElementById('investBody');
    if (!el) return;
    const steps = ['Select Tier', 'Payment', 'Confirm'];
    const stepBar = `<div style="display:flex;align-items:center;gap:0;margin-bottom:2rem">${steps.map((st, i) => `<div style="flex:1;display:flex;align-items:center;gap:0"><div style="display:flex;flex-direction:column;align-items:center;gap:.3rem;min-width:80px"><div style="width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:12px;border:2px solid ${i + 1 <= step ? 'var(--pink)' : 'var(--border)'};background:${i + 1 < step ? 'var(--pink)' : i + 1 === step ? 'rgba(233,30,140,.1)' : 'transparent'};color:${i + 1 <= step ? 'var(--pink)' : 'var(--muted)'}">${i + 1 < step ? '✓' : i + 1}</div><span style="font-size:10px;font-weight:600;color:${i + 1 <= step ? 'var(--text)' : 'var(--muted)'}">${st}</span></div>${i < steps.length - 1 ? `<div style="flex:1;height:2px;background:${i + 1 < step ? 'var(--pink)' : 'var(--border)'};margin-bottom:1.2rem"></div>` : ''}</div>`).join('')}</div>`;
    if (step === 2) {
        el.innerHTML = `<div style="max-width:560px;margin:0 auto 2rem">${stepBar}
    <div class="card" style="margin-bottom:1rem">
      <div style="display:flex;justify-content:space-between;margin-bottom:1rem;padding-bottom:.85rem;border-bottom:1px solid var(--border)"><span style="font-size:13px;font-weight:600;color:var(--text)">${tier.name}</span><span style="font-size:13px;font-weight:700;color:var(--pink)">$${tier.price} USDC</span></div>
      <div class="section-title">Payment Method</div>
      <div style="border:2px solid var(--pink);border-radius:10px;padding:.85rem;display:flex;align-items:center;gap:.75rem;cursor:pointer;background:rgba(233,30,140,.03);margin-bottom:.5rem">
        <div style="width:34px;height:34px;border-radius:8px;background:#0052FF;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:11px;color:#fff">B</div>
        <div style="flex:1"><div style="font-weight:600;font-size:13px;color:var(--text)">Base Network USDC</div><div style="font-size:11px;color:var(--muted)">~$0.001 gas · Instant</div></div>
        <span class="badge badge-live">Selected</span>
      </div>
      <div class="section-title" style="margin-top:.75rem">Wallet</div>
      <div style="background:var(--bg);border-radius:8px;padding:.75rem;font-family:monospace;font-size:12px;color:var(--muted);display:flex;justify-content:space-between;align-items:center">
        <span>${walletConnected ? '0x7f3a...d4e2' : 'No wallet connected'}</span>
        ${walletConnected ? '<span class="badge badge-live">Connected</span>' : `<button onclick="toggleWallet()" class="tb-btn primary" style="font-size:10px;padding:.2rem .65rem">Connect</button>`}
      </div>
    </div>
    <button onclick="renderInvestStep(PROJECT_DETAIL['${p.id}'],PROJECT_DETAIL['${p.id}'].tiers[${tierIdx}],${tierIdx},3)" style="width:100%;padding:.85rem;background:var(--pink);color:#fff;border:none;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit">Review & Confirm →</button>
    <button onclick="renderInvestCheckout(PROJECT_DETAIL['${p.id}'],${tierIdx})" style="width:100%;padding:.65rem;border:1px solid var(--border);background:transparent;color:var(--muted);border-radius:8px;font-size:12px;cursor:pointer;font-family:inherit;margin-top:.5rem">← Back</button>
    </div>`;
    } else if (step === 3) {
        el.innerHTML = `<div style="max-width:560px;margin:0 auto 2rem">${stepBar}
    <div class="card" style="margin-bottom:1rem">
      <div class="section-title">Order Summary</div>
      ${[['Project', p.name], ['Tier', tier.name], ['Amount', `$${tier.price} USDC`], [`${p.token} Received`, `${tier.token.toLocaleString()} ${p.token}`], ['Network', 'Base'], ['Gas', '~$0.001']].map(([l, v]) => `<div style="display:flex;justify-content:space-between;padding:.5rem 0;border-bottom:1px solid rgba(229,231,235,.5);font-size:12px"><span style="color:var(--muted)">${l}</span><span style="font-weight:600;color:var(--text)">${v}</span></div>`).join('')}
      <div style="display:flex;justify-content:space-between;padding:.65rem 0;font-size:13px"><span style="font-weight:700">Total</span><span style="font-weight:800;color:var(--pink)">$${tier.price} USDC</span></div>
      <div style="background:rgba(22,163,74,.04);border:1px solid rgba(22,163,74,.2);border-radius:8px;padding:.75rem;font-size:11px;color:var(--muted);line-height:1.5;margin-top:.5rem">🔒 Funds held in escrow. Refundable if project does not launch by milestone date.</div>
    </div>
    <button onclick="confirmInvestment('${p.id}','${tier.name}',${tier.price},${tier.token},'${p.token}')" style="width:100%;padding:.9rem;background:linear-gradient(135deg,var(--pink),var(--gold2));color:#fff;border:none;border-radius:10px;font-size:14px;font-weight:800;cursor:pointer;font-family:inherit">Confirm & Back Project →</button>
    <button onclick="renderInvestStep(PROJECT_DETAIL['${p.id}'],PROJECT_DETAIL['${p.id}'].tiers[${tierIdx}],${tierIdx},2)" style="width:100%;padding:.65rem;border:1px solid var(--border);background:transparent;color:var(--muted);border-radius:8px;font-size:12px;cursor:pointer;font-family:inherit;margin-top:.5rem">← Back</button>
    </div>`;
    }
}

function renderInvestCheckoutStep2(p, tierIdx) { renderInvestStep(p, p.tiers[tierIdx], tierIdx, 2); }
function renderInvestCheckoutStep3(p, tierIdx) { renderInvestStep(p, p.tiers[tierIdx], tierIdx, 3); }

function confirmInvestment(projId, tierName, amount, tokens, token) {
    // Show success screen
    const el = document.getElementById('investBody');
    if (!el) return;
    el.innerHTML = `<div style="max-width:480px;margin:3rem auto;text-align:center">
    <div style="width:72px;height:72px;border-radius:50%;background:linear-gradient(135deg,var(--success),var(--cyan));display:flex;align-items:center;justify-content:center;font-size:28px;margin:0 auto 1.25rem;animation:fadeUp .5s ease">✓</div>
    <h2 style="font-size:1.3rem;font-weight:800;color:var(--text);margin-bottom:.5rem">You're in!</h2>
    <p style="font-size:13px;color:var(--muted);margin-bottom:1.5rem;line-height:1.7">Your backing of <strong>$${amount} USDC</strong> has been recorded.<br>${tokens.toLocaleString()} <strong>${token}</strong> will be airdropped at TGE.</p>
    <div class="card" style="text-align:left;margin-bottom:1.25rem">
      ${[['Project', PROJECT_DETAIL[projId]?.name], ['Tier', tierName], ['Amount', `$${amount} USDC`], [`${token} at TGE`, `${tokens.toLocaleString()}`], ['Status', 'Confirmed (demo)'], ['Tx Hash', '0xdemo...pending']].map(([l, v]) => `<div style="display:flex;justify-content:space-between;padding:.45rem 0;border-bottom:1px solid rgba(229,231,235,.4);font-size:12px"><span style="color:var(--muted)">${l}</span><span style="font-weight:600;color:var(--text)">${v}</span></div>`).join('')}
    </div>
    <div style="display:flex;gap:.75rem;justify-content:center;flex-wrap:wrap">
      <button onclick="openProject('${projId}')" class="tb-btn primary">View Project Updates</button>
      <button onclick="navigate('pub-projects',navItem('pub-projects'))" class="tb-btn">All Projects</button>
    </div>
  </div>`;
}

/* ━━━ BLOG COMPOSE FLOW ━━━ */
function saveBlogDraft(publish) {
    const title = document.getElementById('blogTitle')?.value?.trim();
    const content = document.getElementById('blogContent')?.value?.trim();
    const cat = document.getElementById('blogCat')?.value || 'intelligence';
    const author = document.getElementById('blogAuthor')?.value?.trim() || 'Quanta S';
    const excerpt = document.getElementById('blogExcerpt')?.value?.trim();
    if (!title) { showToast('Add a title first'); return; }
    const id = editingDraftId || ('draft-' + Date.now());
    const existing = blogDrafts.findIndex(d => d.id === id);
    const draft = { id, title, content, cat, author, excerpt, status: publish ? 'published' : 'draft', date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) };
    if (existing >= 0) blogDrafts[existing] = draft;
    else blogDrafts.unshift(draft);
    localStorage.setItem('sc_drafts', JSON.stringify(blogDrafts));
    editingDraftId = null;
    showToast(publish ? '✓ Article published to NewsDesk' : '✓ Draft saved');
    navigate('blog-drafts', null);
    renderBlogDrafts();
}

function editDraft(id) {
    const d = blogDrafts.find(x => x.id === id);
    if (!d) return;
    editingDraftId = id;
    navigate('blog-compose', null);
    setTimeout(() => {
        const t = document.getElementById('blogTitle');
        const c = document.getElementById('blogContent');
        const ct = document.getElementById('blogCat');
        const a = document.getElementById('blogAuthor');
        const e = document.getElementById('blogExcerpt');
        if (t) t.value = d.title;
        if (c) c.value = d.content || '';
        if (ct) ct.value = d.cat;
        if (a) a.value = d.author;
        if (e) e.value = d.excerpt || '';
    }, 50);
}

function deleteDraft(id) {
    blogDrafts = blogDrafts.filter(d => d.id !== id);
    localStorage.setItem('sc_drafts', JSON.stringify(blogDrafts));
    renderBlogDrafts();
    showToast('Draft deleted');
}

function renderBlogDrafts() {
    const el = document.getElementById('blogDraftsBody');
    if (!el) return;
    const all = [...blogDrafts, ...ARTICLES.map(a => ({ ...a, id: a.id, status: a.live ? 'published' : 'draft', title: a.title, cat: a.cat, author: a.author, date: a.date, excerpt: a.excerpt }))];
    if (all.length === 0) {
        el.innerHTML = `<div class="card" style="text-align:center;padding:3rem"><div style="font-size:2rem;margin-bottom:.75rem">📝</div><div style="font-weight:600;color:var(--text)">No drafts yet</div><div style="font-size:12px;color:var(--muted);margin-top:.3rem">Start writing your first article.</div><button class="tb-btn primary" style="margin-top:1rem" onclick="navigate('blog-compose',null)">+ New Article</button></div>`;
        return;
    }
    const catStyle = { intelligence: 'background:rgba(233,30,140,.1);color:var(--pink)', sovereignty: 'background:rgba(0,212,255,.1);color:var(--cyan2)', dispatch: 'background:rgba(255,184,0,.1);color:var(--gold2)', signal: 'background:rgba(99,102,241,.1);color:#6366f1' };
    el.innerHTML = all.map(d => `<div style="display:flex;align-items:center;gap:.75rem;padding:.85rem;border-radius:10px;border:1px solid var(--border);background:var(--card);margin-bottom:.6rem;transition:all .15s" onmouseenter="this.style.borderColor='rgba(233,30,140,.3)'" onmouseleave="this.style.borderColor='var(--border)'">
    <span class="article-cat" style="${catStyle[d.cat] || catStyle.intelligence}">${(d.cat || '').slice(0, 4)}</span>
    <div style="flex:1;min-width:0">
      <div style="font-weight:700;font-size:13px;color:var(--text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${d.title}</div>
      <div style="font-size:11px;color:var(--muted);margin-top:.15rem">${d.date} · ${d.author}</div>
    </div>
    <span class="badge ${d.status === 'published' ? 'badge-live' : 'badge-progress'}">${d.status}</span>
    <div style="display:flex;gap:.4rem;flex-shrink:0">
      ${d.id.startsWith('draft-') ? `<button class="tb-btn" style="font-size:10px;padding:.2rem .55rem" onclick="editDraft('${d.id}')">Edit</button><button class="tb-btn primary" style="font-size:10px;padding:.2rem .55rem" onclick="publishDraft('${d.id}')">Publish</button><button class="tb-btn" style="font-size:10px;padding:.2rem .55rem;border-color:var(--danger);color:var(--danger)" onclick="deleteDraft('${d.id}')">×</button>` : `<button class="tb-btn" style="font-size:10px;padding:.2rem .55rem" onclick="openArticle('${d.id}')">View</button>`}
    </div>
  </div>`).join('');
}

function publishDraft(id) {
    const d = blogDrafts.find(x => x.id === id);
    if (d) { d.status = 'published'; localStorage.setItem('sc_drafts', JSON.stringify(blogDrafts)); renderBlogDrafts(); showToast('✓ Published to NewsDesk'); }
}

async function blogAiAssist(type) {
    const title = document.getElementById('blogTitle')?.value || '';
    const content = document.getElementById('blogContent')?.value || '';
    const prompts = {
        headline: `You are Quanta S, Supercompute's Web3 content agent. Generate 3 punchy headline options for an article. Current title: "${title || 'Untitled'}". Return a numbered list only.`,
        expand: `You are Quanta S, a Web3 intelligence agent. Expand this draft into a well-structured article with h3 headers. Keep the voice direct and technical. Draft: "${content.slice(0, 500) || title}"`,
        excerpt: `Write a 2-sentence compelling excerpt for a Web3 article titled: "${title}". Be direct, specific, and use the language of operators and builders.`,
        tags: `Generate 5 concise SEO tags for a Web3 article titled "${title}". Return comma-separated, no hashes.`
    };
    showToast('✨ Quanta S generating...');
    const aiOut = document.getElementById('blogAiOutput');
    if (aiOut) { aiOut.style.display = 'block'; aiOut.textContent = 'Generating…'; }
    try {
        const result = await window.claude.complete(prompts[type] || prompts.excerpt);
        if (aiOut) aiOut.textContent = result;
        if (type === 'excerpt') {
            const ex = document.getElementById('blogExcerpt');
            if (ex) ex.value = result;
        }
        showToast('✓ Done — review in the AI panel');
    } catch (e) { if (aiOut) aiOut.textContent = 'AI assist unavailable. Try again.'; showToast('AI assist error'); }
}

function insertAiContent() {
    const aiOut = document.getElementById('blogAiOutput');
    const content = document.getElementById('blogContent');
    if (aiOut && content && aiOut.textContent && aiOut.textContent !== 'Generating…') {
        content.value += '\n\n' + aiOut.textContent;
        aiOut.style.display = 'none';
        showToast('✓ Inserted into editor');
    }
}

function updateWordCount() {
    const content = document.getElementById('blogContent')?.value || '';
    const words = content.trim() ? content.trim().split(/\s+/).length : 0;
    const el = document.getElementById('wordCount');
    if (el) el.textContent = `${words} words · ~${Math.max(1, Math.round(words / 200))} min read`;
}

/* ━━━ BOOKING FLOW ━━━ */
const BOOKING_SERVICES = [
    { id: 'defi', name: 'DeFi Onboarding', price: 200, dur: '2 hrs', desc: 'Wallet setup, protocol walkthrough, security best practices. Perfect for founders entering Web3 for the first time.', perks: ['MetaMask + hardware wallet setup', 'Base Chain walkthrough', 'First on-chain transaction', 'Security checklist'], color: 'var(--cyan2)' },
    { id: 'agent', name: 'Agent Automation', price: 300, dur: '2 hrs', desc: 'Design your 1-human + AI agent workflow. OpenClaw setup, Linear integration, and full automation strategy for your team.', perks: ['OpenClaw setup & training', 'Linear MCP integration', 'Custom automation playbook', '30-day follow-up support'], color: 'var(--pink)', popular: true },
    { id: 'refi', name: 'ReFi Strategy', price: 350, dur: '3 hrs', desc: 'Regenerative finance deep dive. Impact investing, green infrastructure on-chain, community treasury design.', perks: ['ReFi protocol overview', 'Carbon credit mechanics on Base', 'Community treasury setup', 'Impact framework design'], color: 'var(--success)' },
    { id: 'protocol', name: 'Protocol Deep Dive', price: 450, dur: '4 hrs', desc: 'Smart contract review, tokenomics design, L2 deployment on Base, and full go-to-market strategy.', perks: ['Smart contract architecture review', 'Tokenomics modeling', 'Base deployment walkthrough', 'GTM strategy + deck'], color: 'var(--gold2)' },
    { id: 'retainer', name: 'Monthly Retainer', price: 1200, dur: 'Ongoing', desc: 'Monthly autonomous community management. Social ops, content calendar, analytics reports, and on-chain governance facilitation.', perks: ['Full social ops management', 'Weekly analytics report', 'Content calendar + execution', 'Monthly strategy call'], color: '#8b5cf6' }
];

function openBooking(serviceId) {
    bookingState = { service: BOOKING_SERVICES.find(s => s.id === serviceId) || BOOKING_SERVICES[0], date: null, time: null };
    renderBookingSelect();
    navigate('booking', null);
}

function renderBookingSelect() {
    const el = document.getElementById('bookingBody');
    if (!el) return;
    renderBookingStep(1);
}

function renderBookingStep(step) {
    const el = document.getElementById('bookingBody');
    if (!el) return;
    const steps = ['Service', 'Schedule', 'Details', 'Confirm'];
    const bar = `<div style="display:flex;align-items:center;max-width:600px;margin:0 auto 2rem">${steps.map((s, i) => `<div style="flex:1;display:flex;align-items:center"><div style="display:flex;flex-direction:column;align-items:center;gap:.3rem;width:70px"><div style="width:30px;height:30px;border-radius:50%;border:2px solid ${i + 1 <= step ? 'var(--pink)' : 'var(--border)'};background:${i + 1 < step ? 'var(--pink)' : i + 1 === step ? 'rgba(233,30,140,.1)' : 'transparent'};color:${i + 1 <= step ? 'var(--pink)' : 'var(--muted)'};display:flex;align-items:center;justify-content:center;font-weight:700;font-size:11px">${i + 1 < step ? '✓' : i + 1}</div><span style="font-size:10px;font-weight:600;color:${i + 1 <= step ? 'var(--text)' : 'var(--muted)'};white-space:nowrap">${s}</span></div>${i < steps.length - 1 ? `<div style="flex:1;height:2px;background:${i + 1 < step ? 'var(--pink)' : 'var(--border)'};margin-bottom:1.2rem"></div>` : ''}</div>`).join('')}</div>`;

    if (step === 1) {
        el.innerHTML = `<div style="max-width:700px;margin:0 auto">${bar}
    <h3 style="font-weight:800;font-size:1rem;color:var(--text);margin-bottom:1rem;text-align:center">Select a Service</h3>
    <div style="display:flex;flex-direction:column;gap:.85rem">
      ${BOOKING_SERVICES.map(s => `<div onclick="bookingState.service=BOOKING_SERVICES.find(x=>x.id==='${s.id}');renderBookingStep(2)" style="border:2px solid ${bookingState.service?.id === s.id ? s.color : 'var(--border)'};border-radius:12px;padding:1.1rem 1.25rem;cursor:pointer;transition:all .2s;position:relative;background:${bookingState.service?.id === s.id ? 'rgba(233,30,140,.02)' : 'var(--card)'}" onmouseenter="this.style.borderColor='${s.color}'" onmouseleave="this.style.borderColor='${bookingState.service?.id === s.id ? s.color : 'var(--border)'}'">
        ${s.popular ? `<div style="position:absolute;top:-1px;right:16px;background:var(--pink);color:#fff;font-size:9px;font-weight:700;padding:.2rem .75rem;border-radius:0 0 8px 8px;letter-spacing:.5px">Most Requested</div>` : ''}
        <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:1rem">
          <div style="flex:1">
            <div style="display:flex;align-items:center;gap:.6rem;margin-bottom:.3rem">
              <span style="font-weight:700;font-size:14px;color:var(--text)">${s.name}</span>
              <span style="font-size:11px;color:var(--muted)">· ${s.dur}</span>
            </div>
            <p style="font-size:12px;color:var(--muted);line-height:1.6;margin-bottom:.6rem">${s.desc}</p>
            <div style="display:flex;gap:.35rem;flex-wrap:wrap">${s.perks.map(p => `<span style="font-size:10px;padding:.15rem .5rem;border-radius:20px;background:rgba(22,163,74,.07);color:var(--success);border:1px solid rgba(22,163,74,.15)">✓ ${p}</span>`).join('')}</div>
          </div>
          <div style="text-align:right;flex-shrink:0">
            <div style="font-size:1.4rem;font-weight:900;color:${s.color}">$${s.price}</div>
            <div style="font-size:10px;color:var(--muted)">${s.id === 'retainer' ? '/month' : 'per session'}</div>
          </div>
        </div>
      </div>`).join('')}
    </div></div>`;
    } else if (step === 2) {
        const svc = bookingState.service;
        // Generate next 14 days
        const dates = [];
        const today = new Date();
        for (let i = 1; i <= 18; i++) {
            const d = new Date(today); d.setDate(today.getDate() + i);
            if (d.getDay() !== 0 && d.getDay() !== 6) dates.push(d); // Weekdays only
            if (dates.length >= 10) break;
        }
        const times = ['9:00 AM', '10:00 AM', '11:00 AM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'];
        el.innerHTML = `<div style="max-width:600px;margin:0 auto">${bar}
    <div style="display:flex;align-items:center;gap:.75rem;background:rgba(233,30,140,.04);border:1px solid rgba(233,30,140,.15);border-radius:10px;padding:.85rem 1rem;margin-bottom:1.5rem">
      <div style="font-weight:700;font-size:13px;color:var(--text)">${svc.name}</div>
      <span style="font-size:13px;font-weight:800;color:var(--pink);margin-left:auto">$${svc.price}</span>
    </div>
    <div class="grid2" style="gap:1.25rem">
      <div class="card">
        <div class="section-title">Select Date</div>
        <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:.5rem">
          ${dates.map(d => { const key = d.toISOString().split('T')[0]; const lbl = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }); return `<div onclick="bookingState.date='${key}';document.querySelectorAll('.date-slot').forEach(x=>x.style.background='transparent');document.querySelectorAll('.date-slot').forEach(x=>x.style.borderColor='var(--border)');this.style.background='rgba(233,30,140,.08)';this.style.borderColor='var(--pink)'" class="date-slot" style="padding:.6rem;border-radius:8px;border:1.5px solid var(--border);cursor:pointer;text-align:center;font-size:11px;font-weight:600;color:var(--text);transition:all .15s">${lbl}</div>`; }).join('')}
        </div>
      </div>
      <div class="card">
        <div class="section-title">Select Time (PT)</div>
        <div style="display:flex;flex-direction:column;gap:.4rem">
          ${times.map(t => `<div onclick="bookingState.time='${t}';document.querySelectorAll('.time-slot').forEach(x=>x.style.background='transparent');document.querySelectorAll('.time-slot').forEach(x=>x.style.borderColor='var(--border)');this.style.background='rgba(233,30,140,.08)';this.style.borderColor='var(--pink)'" class="time-slot" style="padding:.55rem .85rem;border-radius:8px;border:1.5px solid var(--border);cursor:pointer;font-size:12px;font-weight:600;color:var(--text);transition:all .15s">${t} PT</div>`).join('')}
        </div>
      </div>
    </div>
    <div style="margin-top:1.25rem;display:flex;gap:.75rem">
      <button onclick="renderBookingStep(1)" class="tb-btn" style="flex:0 0 auto">← Back</button>
      <button onclick="if(!bookingState.date||!bookingState.time){showToast('Select a date and time');return;}renderBookingStep(3)" style="flex:1;padding:.85rem;background:var(--pink);color:#fff;border:none;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit">Continue →</button>
    </div></div>`;
    } else if (step === 3) {
        const svc = bookingState.service;
        const dateStr = bookingState.date ? new Date(bookingState.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) : '—';
        el.innerHTML = `<div style="max-width:560px;margin:0 auto">${bar}
    <div style="display:flex;align-items:center;justify-content:space-between;background:rgba(233,30,140,.04);border:1px solid rgba(233,30,140,.15);border-radius:10px;padding:.85rem 1rem;margin-bottom:1.5rem">
      <div><div style="font-weight:700;font-size:13px;color:var(--text)">${svc.name}</div><div style="font-size:11px;color:var(--muted);margin-top:2px">${dateStr} · ${bookingState.time} PT</div></div>
      <span style="font-size:1.1rem;font-weight:800;color:var(--pink)">$${svc.price}</span>
    </div>
    <div class="card" style="margin-bottom:1rem">
      <div class="section-title">Your Details</div>
      <div class="form-group"><label class="form-label">Full Name</label><input class="form-input" id="bookName" placeholder="Your full name" /></div>
      <div class="form-group"><label class="form-label">Email</label><input class="form-input" id="bookEmail" type="email" placeholder="your@email.com" /></div>
      <div class="form-group"><label class="form-label">Company / Project</label><input class="form-input" id="bookProject" placeholder="Your project or company name" /></div>
      <div class="form-group"><label class="form-label">What are you trying to solve?</label><textarea class="form-input" id="bookGoal" rows="4" placeholder="Tell us your biggest Web3 challenge right now..." style="resize:vertical"></textarea></div>
      <div class="form-group"><label class="form-label">How did you hear about us?</label><select class="form-select" id="bookSource"><option>X (Twitter)</option><option>Lens Protocol</option><option>Farcaster</option><option>Referral</option><option>Google</option><option>Other</option></select></div>
    </div>
    <div style="display:flex;gap:.75rem">
      <button onclick="renderBookingStep(2)" class="tb-btn" style="flex:0 0 auto">← Back</button>
      <button onclick="submitBooking()" style="flex:1;padding:.85rem;background:var(--pink);color:#fff;border:none;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit">Review Booking →</button>
    </div></div>`;
    } else if (step === 4) {
        const svc = bookingState.service;
        const name = document.getElementById('bookName')?.value || 'You';
        const email = document.getElementById('bookEmail')?.value || '—';
        const project = document.getElementById('bookProject')?.value || '—';
        const dateStr = bookingState.date ? new Date(bookingState.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) : '—';
        el.innerHTML = `<div style="max-width:560px;margin:0 auto">${bar}
    <div class="card" style="margin-bottom:1.25rem">
      <div class="section-title">Booking Summary</div>
      ${[['Service', svc.name], ['Date', dateStr], ['Time', `${bookingState.time} PT`], ['Duration', svc.dur], ['Name', name], ['Email', email], ['Project', project], ['Price', `$${svc.price}${svc.id === 'retainer' ? '/month' : ''}`]].map(([l, v]) => `<div style="display:flex;justify-content:space-between;padding:.5rem 0;border-bottom:1px solid rgba(229,231,235,.4);font-size:12px"><span style="color:var(--muted)">${l}</span><span style="font-weight:600;color:var(--text)">${v}</span></div>`).join('')}
    </div>
    <div style="background:rgba(22,163,74,.04);border:1px solid rgba(22,163,74,.2);border-radius:10px;padding:.85rem;font-size:12px;color:var(--muted);line-height:1.6;margin-bottom:1.25rem">
      ✅ You'll receive a calendar invite at the email above.<br>
      💳 Payment of <strong>$${svc.price}</strong> is due at time of session via USDC on Base or Stripe.<br>
      📅 Cancellations accepted up to 24h before session.
    </div>
    <button onclick="confirmBooking('${svc.id}')" style="width:100%;padding:.9rem;background:linear-gradient(135deg,var(--pink),var(--gold2));color:#fff;border:none;border-radius:10px;font-size:14px;font-weight:800;cursor:pointer;font-family:inherit">Confirm Booking →</button>
    <button onclick="renderBookingStep(3)" style="width:100%;padding:.65rem;border:1px solid var(--border);background:transparent;color:var(--muted);border-radius:8px;font-size:12px;cursor:pointer;font-family:inherit;margin-top:.5rem">← Edit Details</button>
    </div>`;
    }
}

function submitBooking() {
    const name = document.getElementById('bookName')?.value?.trim();
    const email = document.getElementById('bookEmail')?.value?.trim();
    if (!name || !email) { showToast('Name and email required'); return; }
    renderBookingStep(4);
}

function confirmBooking(serviceId) {
    const svc = BOOKING_SERVICES.find(s => s.id === serviceId);
    const dateStr = bookingState.date ? new Date(bookingState.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) : '—';
    const el = document.getElementById('bookingBody');
    if (!el) return;
    el.innerHTML = `<div style="max-width:480px;margin:3rem auto;text-align:center">
    <div style="width:72px;height:72px;border-radius:50%;background:linear-gradient(135deg,var(--pink),var(--gold));display:flex;align-items:center;justify-content:center;font-size:28px;margin:0 auto 1.25rem;animation:fadeUp .5s ease">📅</div>
    <h2 style="font-size:1.3rem;font-weight:800;color:var(--text);margin-bottom:.5rem">Booking Confirmed!</h2>
    <p style="font-size:13px;color:var(--muted);margin-bottom:1.5rem;line-height:1.7">You're booked for <strong>${svc?.name}</strong>.<br>Check your email for the calendar invite.</p>
    <div class="card" style="text-align:left;margin-bottom:1.25rem">
      ${[['Service', svc?.name], ['Date', dateStr], ['Time', `${bookingState.time} PT`], ['Duration', svc?.dur], ['Amount', `$${svc?.price}${serviceId === 'retainer' ? '/month' : ''}`], ['Confirmation', '#SC-' + Math.floor(Math.random() * 9000 + 1000)]].map(([l, v]) => `<div style="display:flex;justify-content:space-between;padding:.45rem 0;border-bottom:1px solid rgba(229,231,235,.4);font-size:12px"><span style="color:var(--muted)">${l}</span><span style="font-weight:600;color:var(--text)">${v}</span></div>`).join('')}
    </div>
    <div style="display:flex;gap:.75rem;justify-content:center;flex-wrap:wrap">
      <a href="https://calendly.com/ora_mi" target="_blank" class="tb-btn primary">View on Calendly</a>
      <button onclick="navigate('consulting',navItem('consulting'))" class="tb-btn">All Services</button>
    </div>
  </div>`;
    showToast('📅 Booking confirmed — check your email');
}

/* ━━━ PATCH INTO EXISTING PROJECT CARDS ━━━ */
// Override renderPubProjects to add openProject links
function renderPubProjectsEnhanced() {
    function card(p) {
        const pct = p.goal > 0 ? Math.min(Math.round(p.raised / p.goal * 100), 100) : 0;
        const hasDetail = !!PROJECT_DETAIL[p.id || p.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')];
        const detailId = Object.keys(PROJECT_DETAIL).find(k => PROJECT_DETAIL[k].name === p.name) || null;
        return `<div class="card card-hover" onclick="${detailId ? `openProject('${detailId}')` : `showToast('Project details coming soon')`}">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:.6rem">
        <span style="font-weight:700;color:var(--text)">${p.name}</span>
        <span class="badge ${p.bc}">${p.badge}</span>
      </div>
      <div style="font-size:.8rem;color:var(--muted);line-height:1.5;margin-bottom:.7rem">${p.desc}${p.coin !== '—' ? ` <span style="color:var(--pink);font-weight:700">${p.coin}</span>` : ''}</div>
      ${p.goal > 0 ? `<div style="font-size:10px;color:var(--muted);display:flex;justify-content:space-between;margin-bottom:.25rem"><span>$${p.raised.toLocaleString()} raised</span><span>$${(p.goal / 1000).toFixed(0)}k goal</span></div><div class="prog-track"><div class="prog-fill" style="width:${pct}%"></div></div>` : ''}
      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:.75rem">
        <span style="font-size:10px;color:var(--muted);font-family:monospace">${p.repo}</span>
        <button class="tb-btn primary" style="font-size:10px;padding:.25rem .65rem" onclick="event.stopPropagation();${detailId ? `openInvestFlow('${detailId}')` : `showToast('Backing opens May 2026')`}">Back this</button>
      </div>
    </div>`;
    }
    const act = document.getElementById('pubActiveProj');
    const soon = document.getElementById('pubSoonProj');
    if (act) act.innerHTML = PROJECTS.filter(p => !p.soon).map(card).join('');
    if (soon) soon.innerHTML = PROJECTS.filter(p => p.soon).map(card).join('');
}

// Override the original
window.renderPubProjects = renderPubProjectsEnhanced;

/* ━━━ CREATE PROJECT FLOW ━━━ */
var projectFormState = { step: 1, data: {} };
var customProjects = JSON.parse(localStorage.getItem('sc_projects') || '[]');

function openCreateProject() {
    projectFormState = { step: 1, data: {} };
    navigate('create-project', null);
    setTimeout(() => renderProjectForm(1), 30);
}

function renderProjectForm(step) {
    projectFormState.step = step;
    const steps = ['Basics', 'Details', 'Token & Funding', 'Tiers', 'Review'];
    const bar = document.getElementById('projFormStepBar');
    if (bar) {
        bar.innerHTML = steps.map((s, i) => `
      <div style="flex:1;display:flex;align-items:center">
        <div style="display:flex;flex-direction:column;align-items:center;gap:.3rem;min-width:72px">
          <div style="width:30px;height:30px;border-radius:50%;border:2px solid ${i + 1 <= step ? 'var(--pink)' : 'var(--border)'};background:${i + 1 < step ? 'var(--pink)' : i + 1 === step ? 'rgba(233,30,140,.1)' : 'transparent'};color:${i + 1 <= step ? 'var(--pink)' : 'var(--muted)'};display:flex;align-items:center;justify-content:center;font-weight:700;font-size:11px">${i + 1 < step ? '✓' : i + 1}</div>
          <span style="font-size:10px;font-weight:600;color:${i + 1 <= step ? 'var(--text)' : 'var(--muted)'};white-space:nowrap">${s}</span>
        </div>
        ${i < steps.length - 1 ? `<div style="flex:1;height:2px;background:${i + 1 < step ? 'var(--pink)' : 'var(--border)'};margin-bottom:1.2rem"></div>` : ''}
      </div>`).join('');
    }

    const el = document.getElementById('projFormBody');
    if (!el) return;
    const d = projectFormState.data;

    if (step === 1) {
        el.innerHTML = `
    <div class="grid2" style="gap:1.25rem">
      <div>
        <div class="card">
          <div class="section-title">Project Basics</div>
          <div class="form-group"><label class="form-label">Project Name *</label><input class="form-input" id="pfName" placeholder="e.g. Solar Punks DAO" value="${d.name || ''}"/></div>
          <div class="form-group"><label class="form-label">Tagline *</label><input class="form-input" id="pfTagline" placeholder="One sentence — what does this project do?" value="${d.tagline || ''}"/></div>
          <div class="form-group"><label class="form-label">Category</label>
            <select class="form-select" id="pfCategory">
              <option ${d.cat === 'defi' ? 'selected' : ''}>DeFi</option>
              <option ${d.cat === 'nft' ? 'selected' : ''}>NFT / Collectibles</option>
              <option ${d.cat === 'dao' ? 'selected' : ''}>DAO / Governance</option>
              <option ${d.cat === 'refi' ? 'selected' : ''}>ReFi / Impact</option>
              <option ${d.cat === 'infra' ? 'selected' : ''}>Infrastructure</option>
              <option ${d.cat === 'media' ? 'selected' : ''}>Media / Content</option>
              <option ${d.cat === 'edu' ? 'selected' : ''}>Education</option>
              <option ${d.cat === 'other' ? 'selected' : ''}>Other</option>
            </select>
          </div>
          <div class="form-group"><label class="form-label">Chain</label>
            <select class="form-select" id="pfChain">
              <option>Base</option><option>Ethereum</option><option>Polygon</option><option>Optimism</option><option>Arbitrum</option>
            </select>
          </div>
          <div class="form-group"><label class="form-label">GitHub / Repo URL</label><input class="form-input" id="pfRepo" placeholder="github.com/your-org/repo" value="${d.repo || ''}"/></div>
        </div>
      </div>
      <div style="display:flex;flex-direction:column;gap:1rem">
        <div class="card">
          <div class="section-title">Project Status</div>
          <div style="display:flex;flex-direction:column;gap:.5rem">
            ${[['concept', 'Just an idea — gathering interest'], ['building', 'Actively building — need backing'], ['launched', 'Live — expanding the community'], ['paused', 'On hold — returning soon']].map(([v, l]) => `
            <label style="display:flex;align-items:center;gap:.75rem;padding:.65rem;border-radius:8px;border:1.5px solid ${(d.status || 'building') === v ? 'var(--pink)' : 'var(--border)'};cursor:pointer;transition:all .15s" onclick="document.querySelectorAll('.status-opt').forEach(x=>x.style.borderColor='var(--border)');this.style.borderColor='var(--pink)';projectFormState.data.status='${v}'" class="status-opt">
              <div style="width:16px;height:16px;border-radius:50%;border:2px solid ${(d.status || 'building') === v ? 'var(--pink)' : 'var(--border)'};background:${(d.status || 'building') === v ? 'var(--pink)' : 'transparent'};flex-shrink:0"></div>
              <div><div style="font-weight:600;font-size:12px;color:var(--text);text-transform:capitalize">${v}</div><div style="font-size:11px;color:var(--muted)">${l}</div></div>
            </label>`).join('')}
          </div>
        </div>
        <div class="card" style="background:rgba(233,30,140,.03);border-color:rgba(233,30,140,.15)">
          <div style="font-size:12px;color:var(--muted);line-height:1.6"><strong style="color:var(--text)">What happens after submission?</strong><br><br>Your project goes into review. Once approved by the Supercompute team, it appears on the public Projects page. Backers can then fund it through the platform.</div>
        </div>
      </div>
    </div>
    <div style="margin-top:1.25rem;display:flex;justify-content:flex-end">
      <button onclick="projFormNext(1)" style="padding:.8rem 2rem;background:var(--pink);color:#fff;border:none;border-radius:9px;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit">Next: Project Details →</button>
    </div>`;
    } else if (step === 2) {
        el.innerHTML = `
    <div class="card" style="margin-bottom:1.25rem">
      <div class="section-title">Project Description</div>
      <div class="form-group"><label class="form-label">Full Description *</label>
        <textarea class="form-input" id="pfDesc" rows="6" placeholder="Describe your project in detail. What problem does it solve? Who is it for? What makes it different?" style="resize:vertical">${d.desc || ''}</textarea>
      </div>
      <div class="form-group"><label class="form-label">Mission Statement</label>
        <textarea class="form-input" id="pfMission" rows="3" placeholder="In one paragraph, what is the core mission of this project?" style="resize:vertical">${d.mission || ''}</textarea>
      </div>
    </div>
    <div class="card" style="margin-bottom:1.25rem">
      <div class="section-title">Team</div>
      <div id="pfTeamList">
        ${(d.team || [{ name: '', role: '' }]).map((t, i) => `
        <div style="display:grid;grid-template-columns:1fr 1fr auto;gap:.5rem;margin-bottom:.5rem;align-items:center" id="pfTeamRow-${i}">
          <input class="form-input" placeholder="Name" value="${t.name}" oninput="projectFormState.data.team[${i}].name=this.value"/>
          <input class="form-input" placeholder="Role (e.g. Founder, Dev)" value="${t.role}" oninput="projectFormState.data.team[${i}].role=this.value"/>
          ${i > 0 ? `<button onclick="removeTeamMember(${i})" style="padding:.5rem .75rem;border:1px solid var(--danger);color:var(--danger);background:none;border-radius:7px;cursor:pointer;font-size:13px;font-family:inherit">×</button>` : `<div></div>`}
        </div>`).join('')}
      </div>
      <button onclick="addTeamMember()" class="tb-btn" style="font-size:11px;margin-top:.4rem">+ Add Team Member</button>
    </div>
    <div class="card" style="margin-bottom:1.25rem">
      <div class="section-title">Milestones</div>
      <div id="pfMilestoneList">
        ${(d.milestones || [{ date: '', title: '', desc: '' }]).map((m, i) => `
        <div style="display:grid;grid-template-columns:120px 1fr auto;gap:.5rem;margin-bottom:.5rem;align-items:start" id="pfMilestone-${i}">
          <input class="form-input" placeholder="Q2 2026" value="${m.date}" oninput="projectFormState.data.milestones[${i}].date=this.value"/>
          <input class="form-input" placeholder="Milestone title" value="${m.title}" oninput="projectFormState.data.milestones[${i}].title=this.value"/>
          ${i > 0 ? `<button onclick="removeMilestone(${i})" style="padding:.5rem .75rem;border:1px solid var(--danger);color:var(--danger);background:none;border-radius:7px;cursor:pointer;font-family:inherit">×</button>` : `<div></div>`}
        </div>`).join('')}
      </div>
      <button onclick="addMilestone()" class="tb-btn" style="font-size:11px;margin-top:.4rem">+ Add Milestone</button>
    </div>
    <div style="display:flex;gap:.75rem;justify-content:space-between">
      <button onclick="renderProjectForm(1)" class="tb-btn">← Back</button>
      <button onclick="projFormNext(2)" style="padding:.8rem 2rem;background:var(--pink);color:#fff;border:none;border-radius:9px;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit">Next: Token & Funding →</button>
    </div>`;
        if (!projectFormState.data.team) projectFormState.data.team = [{ name: '', role: '' }];
        if (!projectFormState.data.milestones) projectFormState.data.milestones = [{ date: '', title: '', desc: '' }];
    } else if (step === 3) {
        el.innerHTML = `
    <div class="grid2" style="gap:1.25rem;margin-bottom:1.25rem">
      <div class="card">
        <div class="section-title">Token Details</div>
        <div class="form-group"><label class="form-label">Token Symbol</label><input class="form-input" id="pfToken" placeholder="e.g. $SOLAR" value="${d.token || ''}"/></div>
        <div class="form-group"><label class="form-label">Token Standard</label>
          <select class="form-select" id="pfTokenStandard"><option>ERC-20</option><option>ERC-721</option><option>ERC-1155</option><option>No token</option></select>
        </div>
        <div class="form-group"><label class="form-label">Total Supply</label><input class="form-input" id="pfSupply" placeholder="e.g. 1,000,000" value="${d.supply || ''}"/></div>
        <div class="form-group"><label class="form-label">Token Utility</label>
          <textarea class="form-input" id="pfTokenUtility" rows="3" placeholder="What does the token do? Governance, staking, access, revenue share?" style="resize:none">${d.tokenUtility || ''}</textarea>
        </div>
      </div>
      <div class="card">
        <div class="section-title">Funding Goal</div>
        <div class="form-group"><label class="form-label">Funding Target (USD)</label>
          <div style="position:relative"><span style="position:absolute;left:.85rem;top:50%;transform:translateY(-50%);font-weight:700;color:var(--muted)">$</span>
          <input class="form-input" id="pfGoal" type="number" placeholder="250000" style="padding-left:1.6rem" value="${d.goal || ''}"/></div>
        </div>
        <div class="form-group"><label class="form-label">Minimum Viable Funding</label>
          <div style="position:relative"><span style="position:absolute;left:.85rem;top:50%;transform:translateY(-50%);font-weight:700;color:var(--muted)">$</span>
          <input class="form-input" id="pfMinGoal" type="number" placeholder="50000" style="padding-left:1.6rem" value="${d.minGoal || ''}"/></div>
        </div>
        <div class="form-group"><label class="form-label">Deadline</label><input class="form-input" id="pfDeadline" type="date" value="${d.deadline || ''}"/></div>
        <div class="form-group"><label class="form-label">Use of Funds</label>
          <textarea class="form-input" id="pfUseOfFunds" rows="4" placeholder="Dev: 40%&#10;Marketing: 25%&#10;Operations: 20%&#10;Treasury: 15%" style="resize:none">${d.useOfFunds || ''}</textarea>
        </div>
      </div>
    </div>
    <div style="display:flex;gap:.75rem;justify-content:space-between">
      <button onclick="renderProjectForm(2)" class="tb-btn">← Back</button>
      <button onclick="projFormNext(3)" style="padding:.8rem 2rem;background:var(--pink);color:#fff;border:none;border-radius:9px;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit">Next: Backing Tiers →</button>
    </div>`;
    } else if (step === 4) {
        if (!projectFormState.data.tiers) projectFormState.data.tiers = [
            { name: 'Supporter', price: 50, perks: '' },
            { name: 'Backer', price: 250, perks: '' },
            { name: 'Founding', price: 1000, perks: '' }
        ];
        const tiers = projectFormState.data.tiers;
        el.innerHTML = `
    <div class="card" style="margin-bottom:1.25rem">
      <div class="section-title">Backing Tiers</div>
      <p style="font-size:12px;color:var(--muted);margin-bottom:1rem">Define up to 5 tiers. Each tier should offer meaningful perks to backers at that level.</p>
      <div id="pfTierList">
        ${tiers.map((t, i) => `
        <div style="border:1.5px solid var(--border);border-radius:12px;padding:1rem;margin-bottom:.85rem" id="pfTier-${i}">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:.75rem">
            <span style="font-weight:700;font-size:12px;color:var(--text)">Tier ${i + 1}</span>
            ${i > 2 ? `<button onclick="removeTier(${i})" style="border:none;background:none;color:var(--danger);cursor:pointer;font-size:12px;font-family:inherit">Remove ×</button>` : ''}
          </div>
          <div class="grid3" style="gap:.5rem;margin-bottom:.5rem">
            <div><label class="form-label">Tier Name</label><input class="form-input" placeholder="e.g. Founding Backer" value="${t.name}" oninput="projectFormState.data.tiers[${i}].name=this.value"/></div>
            <div><label class="form-label">Price (USD)</label><input class="form-input" type="number" placeholder="50" value="${t.price}" oninput="projectFormState.data.tiers[${i}].price=this.value"/></div>
            <div><label class="form-label">Token Allocation</label><input class="form-input" placeholder="e.g. 5,000" value="${t.tokens || ''}" oninput="projectFormState.data.tiers[${i}].tokens=this.value"/></div>
          </div>
          <div><label class="form-label">Perks (one per line)</label>
            <textarea class="form-input" rows="3" placeholder="NFT credential&#10;Discord role&#10;Early access" style="resize:none" oninput="projectFormState.data.tiers[${i}].perks=this.value">${t.perks || ''}</textarea>
          </div>
        </div>`).join('')}
      </div>
      ${tiers.length < 5 ? `<button onclick="addTier()" class="tb-btn" style="font-size:11px">+ Add Tier</button>` : ''}
    </div>
    <div style="display:flex;gap:.75rem;justify-content:space-between">
      <button onclick="renderProjectForm(3)" class="tb-btn">← Back</button>
      <button onclick="projFormNext(4)" style="padding:.8rem 2rem;background:var(--pink);color:#fff;border:none;border-radius:9px;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit">Next: Review →</button>
    </div>`;
    } else if (step === 5) {
        const d = projectFormState.data;
        el.innerHTML = `
    <div class="card" style="margin-bottom:1.25rem">
      <div style="display:flex;align-items:center;gap:.75rem;margin-bottom:1.25rem;padding-bottom:1rem;border-bottom:1px solid var(--border)">
        <div style="width:48px;height:48px;border-radius:12px;background:linear-gradient(135deg,var(--pink),var(--gold));display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:800;color:#fff;flex-shrink:0">${(d.name || '?')[0]}</div>
        <div><div style="font-weight:800;font-size:1.1rem;color:var(--text)">${d.name || 'Untitled Project'}</div><div style="font-size:12px;color:var(--muted)">${d.tagline || 'No tagline'}</div></div>
        <span class="badge badge-progress" style="margin-left:auto">Pending Review</span>
      </div>
      <div class="grid2" style="gap:1rem">
        <div>
          ${[['Category', d.category || '—'], ['Chain', d.chain || 'Base'], ['Status', d.status || 'Building'], ['Token', d.token || 'None'], ['Funding Goal', d.goal ? `$${Number(d.goal).toLocaleString()}` : '—'], ['Deadline', d.deadline || '—']].map(([l, v]) => `<div style="display:flex;justify-content:space-between;padding:.45rem 0;border-bottom:1px solid rgba(229,231,235,.4);font-size:12px"><span style="color:var(--muted)">${l}</span><span style="font-weight:600;color:var(--text)">${v}</span></div>`).join('')}
        </div>
        <div>
          <div style="font-size:10px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.7px;margin-bottom:.5rem">Team</div>
          ${(d.team || []).filter(t => t.name).map(t => `<div style="font-size:12px;color:var(--text);margin-bottom:.3rem"><strong>${t.name}</strong> · ${t.role}</div>`).join('') || '<div style="font-size:12px;color:var(--muted)">No team added</div>'}
          <div style="font-size:10px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.7px;margin:.75rem 0 .5rem">Tiers</div>
          ${(d.tiers || []).map(t => `<div style="font-size:12px;color:var(--text);margin-bottom:.3rem"><strong>${t.name}</strong> · $${t.price}</div>`).join('') || '<div style="font-size:12px;color:var(--muted)">No tiers defined</div>'}
        </div>
      </div>
    </div>
    <div style="background:rgba(255,184,0,.06);border:1px solid rgba(255,184,0,.2);border-radius:10px;padding:.85rem;font-size:12px;color:var(--muted);line-height:1.6;margin-bottom:1.25rem">
      ⚠️ Submissions are reviewed by the Supercompute team within 48 hours. You'll receive an email confirmation once approved.
    </div>
    <div style="display:flex;gap:.75rem;justify-content:space-between">
      <button onclick="renderProjectForm(4)" class="tb-btn">← Edit Tiers</button>
      <button onclick="submitProject()" style="padding:.8rem 2rem;background:linear-gradient(135deg,var(--pink),var(--gold2));color:#fff;border:none;border-radius:10px;font-size:14px;font-weight:800;cursor:pointer;font-family:inherit">Submit Project →</button>
    </div>`;
    }
}

function projFormNext(fromStep) {
    const d = projectFormState.data;
    if (fromStep === 1) {
        const name = document.getElementById('pfName')?.value?.trim();
        const tagline = document.getElementById('pfTagline')?.value?.trim();
        if (!name || !tagline) { showToast('Project name and tagline required'); return; }
        d.name = name; d.tagline = tagline;
        d.category = document.getElementById('pfCategory')?.value;
        d.chain = document.getElementById('pfChain')?.value;
        d.repo = document.getElementById('pfRepo')?.value?.trim();
    } else if (fromStep === 2) {
        const desc = document.getElementById('pfDesc')?.value?.trim();
        if (!desc) { showToast('Project description required'); return; }
        d.desc = desc; d.mission = document.getElementById('pfMission')?.value?.trim();
    } else if (fromStep === 3) {
        d.token = document.getElementById('pfToken')?.value?.trim();
        d.supply = document.getElementById('pfSupply')?.value?.trim();
        d.goal = document.getElementById('pfGoal')?.value;
        d.minGoal = document.getElementById('pfMinGoal')?.value;
        d.deadline = document.getElementById('pfDeadline')?.value;
        d.useOfFunds = document.getElementById('pfUseOfFunds')?.value?.trim();
        d.tokenUtility = document.getElementById('pfTokenUtility')?.value?.trim();
    } else if (fromStep === 4) {
        // tiers already tracked via oninput
    }
    renderProjectForm(fromStep + 1);
}

function addTeamMember() {
    if (!projectFormState.data.team) projectFormState.data.team = [];
    projectFormState.data.team.push({ name: '', role: '' });
    renderProjectForm(2);
}
function removeTeamMember(i) {
    projectFormState.data.team.splice(i, 1);
    renderProjectForm(2);
}
function addMilestone() {
    if (!projectFormState.data.milestones) projectFormState.data.milestones = [];
    projectFormState.data.milestones.push({ date: '', title: '', desc: '' });
    renderProjectForm(2);
}
function removeMilestone(i) {
    projectFormState.data.milestones.splice(i, 1);
    renderProjectForm(2);
}
function addTier() {
    if (!projectFormState.data.tiers) projectFormState.data.tiers = [];
    projectFormState.data.tiers.push({ name: '', price: '', perks: '' });
    renderProjectForm(4);
}
function removeTier(i) {
    projectFormState.data.tiers.splice(i, 1);
    renderProjectForm(4);
}
function saveProjectDraft() {
    showToast('✓ Project draft saved');
    localStorage.setItem('sc_project_draft', JSON.stringify(projectFormState.data));
}
function submitProject() {
    const d = projectFormState.data;
    if (!d.name) { showToast('Complete required fields before submitting'); return; }
    customProjects.push({ ...d, id: 'proj-' + Date.now(), status: 'pending', submitted: new Date().toLocaleDateString() });
    localStorage.setItem('sc_projects', JSON.stringify(customProjects));
    const el = document.getElementById('projFormBody');
    if (!el) return;
    document.getElementById('projFormStepBar').innerHTML = '';
    el.innerHTML = `<div style="max-width:480px;margin:3rem auto;text-align:center">
    <div style="width:72px;height:72px;border-radius:50%;background:linear-gradient(135deg,var(--pink),var(--gold));display:flex;align-items:center;justify-content:center;font-size:28px;margin:0 auto 1.25rem;animation:fadeUp .5s ease">🚀</div>
    <h2 style="font-size:1.3rem;font-weight:800;color:var(--text);margin-bottom:.5rem">Project Submitted!</h2>
    <p style="font-size:13px;color:var(--muted);margin-bottom:1.5rem;line-height:1.7"><strong>${d.name}</strong> is in review.<br>You'll hear back within 48 hours.</p>
    <div class="card" style="text-align:left;margin-bottom:1.25rem">
      ${[['Project', d.name], ['Chain', d.chain || 'Base'], ['Token', d.token || 'None'], ['Goal', d.goal ? '$' + Number(d.goal).toLocaleString() : 'TBD'], ['Status', 'Under Review'], ['Ref', '#PROJ-' + Math.floor(Math.random() * 9000 + 1000)]].map(([l, v]) => `<div style="display:flex;justify-content:space-between;padding:.45rem 0;border-bottom:1px solid rgba(229,231,235,.4);font-size:12px"><span style="color:var(--muted)">${l}</span><span style="font-weight:600;color:var(--text)">${v}</span></div>`).join('')}
    </div>
    <div style="display:flex;gap:.75rem;justify-content:center">
      <button onclick="navigate('pub-projects',navItem('pub-projects'))" class="tb-btn primary">View All Projects</button>
      <button onclick="openCreateProject()" class="tb-btn">Submit Another</button>
    </div>
  </div>`;
    showToast('🚀 Project submitted for review!');
}

/* Patch pub-projects topbar to include Create button */
window.addEventListener('DOMContentLoaded', () => {
    const projPage = document.getElementById('page-pub-projects');
    if (projPage) {
        const hdr = projPage.querySelector('[style*="border-bottom"]');
        if (hdr) {
            const btn = document.createElement('button');
            btn.className = 'tb-btn primary';
            btn.style.cssText = 'margin-top:.75rem;font-size:11px';
            btn.innerHTML = '+ Submit a Project';
            btn.onclick = () => authGate('create-project', null);
            hdr.appendChild(btn);
        }
    }
});


/* ━━━ ADD ASSET FLOW ━━━ */
var userAssets = JSON.parse(localStorage.getItem('sc_assets') || '[]');

function openAddAsset() {
    navigate('add-asset', null);
    setTimeout(() => renderAddAsset('search'), 30);
}

function renderAddAsset(view) {
    const el = document.getElementById('addAssetBody');
    if (!el) return;

    const POPULAR_TOKENS = [
        { sym: 'ETH', name: 'Ethereum', bg: '#627EEA', abbr: 'E', chain: 'Base', price: '$1,978' },
        { sym: 'USDC', name: 'USD Coin', bg: '#2775CA', abbr: '$', chain: 'Base', price: '$1.00' },
        { sym: 'CBBTC', name: 'Coinbase BTC', bg: '#F7931A', abbr: '₿', chain: 'Base', price: '$61,890' },
        { sym: 'DEGEN', name: 'Degen', bg: '#a855f7', abbr: 'D', chain: 'Base', price: '$0.018' },
        { sym: 'BALD', name: 'Bald', bg: '#f59e0b', abbr: 'B', chain: 'Base', price: '$0.00021' },
        { sym: 'BRETT', name: 'Brett', bg: '#3b82f6', abbr: 'BR', chain: 'Base', price: '$0.142' },
        { sym: '$SCOM', name: 'Supercompute', bg: 'linear-gradient(135deg,#E91E8C,#FFB800)', abbr: 'SC', chain: 'Base', price: 'Pre-launch' },
        { sym: '$QUANTA', name: 'Quanta S Token', bg: 'linear-gradient(135deg,#7c3aed,#00D4FF)', abbr: 'QS', chain: 'Base', price: 'Pending' },
    ];

    if (view === 'search') {
        el.innerHTML = `
    <div class="card" style="margin-bottom:1.25rem">
      <div class="section-title">Search for a Token</div>
      <div style="position:relative;margin-bottom:1rem">
        <span style="position:absolute;left:.85rem;top:50%;transform:translateY(-50%);color:var(--muted);font-size:15px">⌕</span>
        <input class="form-input" id="assetSearch" placeholder="Search by name or symbol…" style="padding-left:2.2rem;font-size:14px" oninput="filterAssetSearch(this.value)"/>
      </div>
      <div id="assetSearchResults">
        <div class="section-title" style="margin-bottom:.5rem">Popular on Base</div>
        <div style="display:flex;flex-direction:column;gap:.4rem" id="popularTokenList">
          ${POPULAR_TOKENS.map(t => `
          <div onclick="selectAssetToken(${JSON.stringify(t).replace(/"/g, '&quot;')})" style="display:flex;align-items:center;gap:.75rem;padding:.75rem;border-radius:9px;border:1px solid var(--border);cursor:pointer;transition:all .15s" onmouseenter="this.style.borderColor='var(--pink)';this.style.background='rgba(233,30,140,.02)'" onmouseleave="this.style.borderColor='var(--border)';this.style.background=''">
            <div style="width:36px;height:36px;border-radius:50%;background:${t.bg};display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;color:#fff;flex-shrink:0">${t.abbr}</div>
            <div style="flex:1"><div style="font-weight:700;font-size:13px;color:var(--text)">${t.sym}</div><div style="font-size:11px;color:var(--muted)">${t.name} · ${t.chain}</div></div>
            <div style="text-align:right"><div style="font-weight:600;font-size:12px;color:var(--text)">${t.price}</div></div>
          </div>`).join('')}
        </div>
      </div>
    </div>
    <div class="card" style="margin-bottom:1rem">
      <div class="section-title">Add by Contract Address</div>
      <div style="display:flex;gap:.5rem">
        <input class="form-input" id="contractAddr" placeholder="0x… contract address" style="flex:1;font-family:monospace;font-size:12px"/>
        <button class="tb-btn primary" onclick="addByContract()" style="white-space:nowrap">Add Token</button>
      </div>
      <div style="font-size:11px;color:var(--muted);margin-top:.4rem">Supports ERC-20 tokens on Base, Ethereum, and other EVM chains.</div>
    </div>
    <div class="card">
      <div class="section-title">Add NFT Collection</div>
      <div class="form-group"><label class="form-label">Collection Address</label><input class="form-input" placeholder="0x… NFT contract" style="font-family:monospace;font-size:12px"/></div>
      <div class="form-group"><label class="form-label">Token ID (optional)</label><input class="form-input" type="number" placeholder="e.g. 42"/></div>
      <button class="tb-btn" onclick="showToast('NFT import coming soon')">Import NFT Collection</button>
    </div>`;
    } else if (view === 'add') {
        const t = window._selectedToken || {};
        el.innerHTML = `
    <div class="card" style="margin-bottom:1.25rem">
      <div style="display:flex;align-items:center;gap:1rem;margin-bottom:1.25rem;padding-bottom:1rem;border-bottom:1px solid var(--border)">
        <div style="width:48px;height:48px;border-radius:50%;background:${t.bg || 'var(--pink)'};display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:800;color:#fff;flex-shrink:0">${t.abbr || '?'}</div>
        <div><div style="font-weight:800;font-size:1.1rem;color:var(--text)">${t.sym || 'Unknown'}</div><div style="font-size:12px;color:var(--muted)">${t.name || ''} · ${t.chain || 'Base'}</div></div>
        <div style="margin-left:auto;text-align:right"><div style="font-size:.85rem;font-weight:700;color:var(--text)">${t.price || '—'}</div><div style="font-size:11px;color:var(--muted)">Current price</div></div>
      </div>
      <div class="section-title">Configure Tracking</div>
      <div class="form-group"><label class="form-label">Balance / Amount</label><input class="form-input" id="assetBalance" type="number" placeholder="0.00" step="any"/></div>
      <div class="form-group"><label class="form-label">Average Buy Price (USD)</label>
        <div style="position:relative"><span style="position:absolute;left:.85rem;top:50%;transform:translateY(-50%);font-weight:700;color:var(--muted)">$</span>
        <input class="form-input" id="assetBuyPrice" type="number" placeholder="0.00" style="padding-left:1.6rem"/></div>
      </div>
      <div class="form-group"><label class="form-label">Notes (optional)</label><input class="form-input" id="assetNotes" placeholder="e.g. DCA position, staking rewards…"/></div>
    </div>
    <div style="display:flex;gap:.75rem">
      <button onclick="renderAddAsset('search')" class="tb-btn">← Back</button>
      <button onclick="confirmAddAsset()" style="flex:1;padding:.85rem;background:var(--pink);color:#fff;border:none;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit">Add to Portfolio →</button>
    </div>`;
    }
}

function selectAssetToken(t) {
    window._selectedToken = t;
    renderAddAsset('add');
}

function addByContract() {
    const addr = document.getElementById('contractAddr')?.value?.trim();
    if (!addr || !addr.startsWith('0x')) { showToast('Enter a valid 0x contract address'); return; }
    window._selectedToken = { sym: addr.slice(0, 6) + '…', name: 'Custom Token', bg: 'var(--muted)', abbr: '?', chain: 'Base', price: '—', contract: addr };
    renderAddAsset('add');
}

function filterAssetSearch(q) {
    if (!q) { document.getElementById('popularTokenList') && renderAddAsset('search'); return; }
    // Filter popular tokens
}

function confirmAddAsset() {
    const t = window._selectedToken || {};
    const balance = document.getElementById('assetBalance')?.value || '0';
    const buyPrice = document.getElementById('assetBuyPrice')?.value || '0';
    const notes = document.getElementById('assetNotes')?.value || '';
    const asset = { ...t, balance, buyPrice, notes, added: new Date().toLocaleDateString() };
    userAssets.push(asset);
    localStorage.setItem('sc_assets', JSON.stringify(userAssets));
    // Show confirmation
    const el = document.getElementById('addAssetBody');
    el.innerHTML = `<div style="max-width:420px;margin:3rem auto;text-align:center">
    <div style="width:64px;height:64px;border-radius:50%;background:linear-gradient(135deg,var(--success),var(--cyan));display:flex;align-items:center;justify-content:center;font-size:26px;margin:0 auto 1.25rem">✓</div>
    <h2 style="font-size:1.2rem;font-weight:800;color:var(--text);margin-bottom:.5rem">${t.sym} Added!</h2>
    <p style="font-size:13px;color:var(--muted);margin-bottom:1.5rem">${t.name} has been added to your portfolio.</p>
    <div class="card" style="text-align:left;margin-bottom:1.25rem">
      ${[['Token', t.sym], ['Network', t.chain || 'Base'], ['Balance', balance], ['Buy Price', buyPrice ? '$' + buyPrice : '—']].map(([l, v]) => `<div style="display:flex;justify-content:space-between;padding:.45rem 0;border-bottom:1px solid rgba(229,231,235,.4);font-size:12px"><span style="color:var(--muted)">${l}</span><span style="font-weight:600;color:var(--text)">${v}</span></div>`).join('')}
    </div>
    <div style="display:flex;gap:.75rem;justify-content:center">
      <button onclick="navigate('assets',navItem('assets'))" class="tb-btn primary">View Portfolio</button>
      <button onclick="renderAddAsset('search')" class="tb-btn">+ Add Another</button>
    </div>
  </div>`;
    showToast('✓ Asset added to portfolio');
}


/* ━━━ NEW POST FLOW ━━━ */
var postState = { platforms: ['twitter'], content: '', media: null, scheduleDate: null, scheduleTime: null };

function openNewPost() {
    postState = { platforms: ['twitter'], content: '', media: null };
    navigate('new-post', null);
    setTimeout(renderNewPostComposer, 30);
}

function renderNewPostComposer() {
    const el = document.getElementById('newPostBody');
    if (!el) return;

    const platDefs = [
        { id: 'twitter', label: '𝕏 Twitter', handle: '@supercomputeco', limit: 280, color: '#000' },
        { id: 'lens', label: '◉ Lens', handle: '@quanta.lens', limit: 500, color: 'var(--pink)' },
        { id: 'farcaster', label: '⬡ Farcaster', handle: 'supercompute', limit: 320, color: '#8b5cf6' },
    ];

    el.innerHTML = `
  <!-- Left: Composer -->
  <div style="padding:1.5rem;border-right:1px solid var(--border);overflow-y:auto;display:flex;flex-direction:column;gap:1rem">
    <!-- Platform selector -->
    <div>
      <div class="form-label" style="margin-bottom:.5rem">Post to</div>
      <div style="display:flex;gap:.5rem;flex-wrap:wrap">
        ${platDefs.map(p => `<button id="platBtn-${p.id}" onclick="togglePostPlatform('${p.id}')" style="padding:.45rem .9rem;border-radius:20px;border:2px solid ${postState.platforms.includes(p.id) ? p.color : 'var(--border)'};background:${postState.platforms.includes(p.id) ? 'rgba(233,30,140,.06)' : 'transparent'};font-size:12px;font-weight:600;color:${postState.platforms.includes(p.id) ? p.color : 'var(--muted)'};cursor:pointer;font-family:inherit;transition:all .15s">${p.label}</button>`).join('')}
      </div>
    </div>

    <!-- Active platform handles -->
    <div style="display:flex;gap:.5rem;flex-wrap:wrap">
      ${platDefs.filter(p => postState.platforms.includes(p.id)).map(p => `<div style="display:flex;align-items:center;gap:.4rem;padding:.3rem .65rem;background:var(--bg);border-radius:20px;border:1px solid var(--border);font-size:11px"><span style="color:${p.color}">${p.label.split(' ')[0]}</span><span style="color:var(--muted)">${p.handle}</span></div>`).join('')}
    </div>

    <!-- Content textarea -->
    <div style="flex:1;display:flex;flex-direction:column">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.4rem">
        <div class="form-label">Content</div>
        <span id="postCharCount" style="font-size:11px;color:var(--muted)">0 / 280</span>
      </div>
      <textarea id="postContent" style="flex:1;min-height:200px;border:1.5px solid var(--border);border-radius:10px;padding:1rem;font-size:13px;line-height:1.7;outline:none;resize:none;font-family:inherit;color:var(--text);transition:border-color .2s" placeholder="What's happening in Web3?&#10;&#10;Share insights, project updates, or signal to your community across all connected platforms." oninput="updatePostCount(this.value)"></textarea>
    </div>

    <!-- Thread toggle -->
    <div style="display:flex;align-items:center;gap:.75rem;padding:.75rem;background:var(--bg);border-radius:8px;border:1px solid var(--border)">
      <span style="font-size:13px">🧵</span>
      <div style="flex:1"><div style="font-weight:600;font-size:12px;color:var(--text)">Thread mode</div><div style="font-size:11px;color:var(--muted)">Break content into multiple connected posts</div></div>
      <button onclick="showToast('Thread mode — coming in Phase 1.1')" style="padding:.3rem .75rem;border:1px solid var(--border);border-radius:20px;font-size:11px;cursor:pointer;background:none;color:var(--muted);font-family:inherit">Enable</button>
    </div>

    <!-- Media -->
    <div>
      <div class="form-label" style="margin-bottom:.4rem">Media</div>
      <div style="border:2px dashed var(--border);border-radius:10px;padding:1.5rem;text-align:center;cursor:pointer;transition:all .2s" onclick="showToast('Image upload coming soon — R2 integration')" onmouseenter="this.style.borderColor='var(--pink)'" onmouseleave="this.style.borderColor='var(--border)'">
        <div style="font-size:1.5rem;margin-bottom:.3rem">🖼</div>
        <div style="font-size:12px;color:var(--muted)">Click to attach image or video</div>
        <div style="font-size:11px;color:var(--muted);margin-top:.2rem">PNG, JPG, GIF, MP4 · Max 10MB</div>
      </div>
    </div>
  </div>

  <!-- Right: Sidebar -->
  <div style="background:var(--bg);overflow-y:auto;display:flex;flex-direction:column;gap:.85rem;padding:1.25rem">

    <!-- Preview -->
    <div class="card-sm">
      <div style="display:flex;align-items:center;gap:.4rem;margin-bottom:.65rem">
        <span class="pulse-green"></span>
        <div class="section-title" style="margin:0">Live Preview</div>
      </div>
      <div id="postPreview" style="border:1px solid var(--border);border-radius:10px;padding:.85rem;background:#fff;min-height:80px">
        <div style="display:flex;align-items:center;gap:.5rem;margin-bottom:.5rem">
          <div style="width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,var(--pink),var(--gold))"></div>
          <div><div style="font-weight:700;font-size:11px;color:var(--text)">SUPERCOMPUTE</div><div style="font-size:10px;color:var(--muted)">@supercomputeco</div></div>
        </div>
        <div id="postPreviewText" style="font-size:12px;color:var(--text);line-height:1.6">Start typing to see your preview…</div>
      </div>
    </div>

    <!-- AI Assist -->
    <div class="card-sm">
      <div style="display:flex;align-items:center;gap:.4rem;margin-bottom:.65rem">
        <span class="pulse-green"></span>
        <div class="section-title" style="margin:0">✨ OpenClaw AI</div>
      </div>
      <button class="tb-btn" style="width:100%;margin-bottom:.4rem;font-size:11px;justify-content:flex-start" onclick="postAiAssist('improve')">✍️ Improve writing</button>
      <button class="tb-btn" style="width:100%;margin-bottom:.4rem;font-size:11px;justify-content:flex-start" onclick="postAiAssist('hashtags')">🏷️ Generate hashtags</button>
      <button class="tb-btn" style="width:100%;margin-bottom:.4rem;font-size:11px;justify-content:flex-start" onclick="postAiAssist('cta')">📣 Add call-to-action</button>
      <button class="tb-btn" style="width:100%;font-size:11px;justify-content:flex-start" onclick="postAiAssist('thread')">🧵 Convert to thread</button>
      <div id="postAiResult" style="display:none;margin-top:.65rem;background:rgba(233,30,140,.04);border:1px solid rgba(233,30,140,.15);border-radius:8px;padding:.75rem;font-size:11px;color:var(--text);line-height:1.6">
        <div style="font-size:9px;font-weight:700;color:var(--pink);text-transform:uppercase;margin-bottom:.3rem">OpenClaw suggests:</div>
        <div id="postAiResultText"></div>
        <button onclick="applyPostAiSuggestion()" class="tb-btn primary" style="width:100%;margin-top:.5rem;font-size:10px">Use this ↑</button>
      </div>
    </div>

    <!-- Schedule -->
    <div class="card-sm">
      <div class="section-title">Schedule</div>
      <div class="form-group"><label class="form-label">Date</label><input class="form-input" id="postDate" type="date" oninput="postState.scheduleDate=this.value"/></div>
      <div class="form-group"><label class="form-label">Time (PT)</label>
        <select class="form-select" id="postTime" onchange="postState.scheduleTime=this.value">
          <option value="">Post immediately</option>
          <option>9:00 AM</option><option>10:00 AM</option><option>11:00 AM</option>
          <option>12:00 PM</option><option>1:00 PM</option><option>2:00 PM</option>
          <option>3:00 PM</option><option>4:00 PM</option><option>5:00 PM</option>
        </select>
      </div>
    </div>

    <!-- Best times -->
    <div class="card-sm">
      <div class="section-title">Best Times to Post</div>
      <div style="display:flex;flex-direction:column;gap:.35rem">
        ${[['Mon–Fri', '9:00 AM PT', 'Highest reach'], ['Tue & Thu', '12:00 PM PT', 'Top engagement'], ['Weekends', '11:00 AM PT', 'Community peak']].map(([day, time, note]) => `
        <div onclick="document.getElementById('postTime').value=time.split(' ')[0]+':00'+time.split(' ')[1];postState.scheduleTime=this" style="display:flex;justify-content:space-between;padding:.45rem .6rem;border-radius:6px;border:1px solid var(--border);font-size:11px;cursor:pointer;transition:background .15s" onmouseenter="this.style.background='rgba(233,30,140,.04)'" onmouseleave="this.style.background=''">
          <span style="font-weight:600;color:var(--text)">${day}</span>
          <span style="color:var(--muted)">${time}</span>
          <span style="color:var(--success);font-size:10px">${note}</span>
        </div>`).join('')}
      </div>
    </div>
  </div>`;
}

function togglePostPlatform(id) {
    const idx = postState.platforms.indexOf(id);
    if (idx >= 0) {
        if (postState.platforms.length <= 1) { showToast('Select at least one platform'); return; }
        postState.platforms.splice(idx, 1);
    } else {
        postState.platforms.push(id);
    }
    renderNewPostComposer();
    // Restore content
    setTimeout(() => {
        const ta = document.getElementById('postContent');
        if (ta) { ta.value = postState.content; updatePostCount(postState.content); }
    }, 20);
}

function updatePostCount(val) {
    postState.content = val;
    const limit = 280;
    const count = val.length;
    const el = document.getElementById('postCharCount');
    if (el) { el.textContent = `${count} / ${limit}`; el.style.color = count > limit ? 'var(--danger)' : count > limit * 0.8 ? 'var(--warning)' : 'var(--muted)'; }
    const preview = document.getElementById('postPreviewText');
    if (preview) preview.textContent = val || 'Start typing to see your preview…';
}

async function postAiAssist(type) {
    const content = document.getElementById('postContent')?.value || '';
    const prompts = {
        improve: `Rewrite this social media post to be more engaging for a Web3/crypto audience. Keep it under 240 chars. Original: "${content}"`,
        hashtags: `Generate 5 relevant hashtags for this Web3 post. Return only hashtags separated by spaces: "${content || 'Web3 AI agents Base Chain'}"`,
        cta: `Add a compelling call-to-action to this Web3 post. Keep total under 270 chars: "${content}"`,
        thread: `Break this into a 3-tweet thread for a Web3 audience. Number each tweet 1/, 2/, 3/: "${content}"`
    };
    const resultEl = document.getElementById('postAiResult');
    const textEl = document.getElementById('postAiResultText');
    if (resultEl) resultEl.style.display = 'block';
    if (textEl) textEl.textContent = 'Generating…';
    showToast('✨ OpenClaw thinking…');
    try {
        const result = await window.claude.complete(prompts[type] || prompts.improve);
        if (textEl) textEl.textContent = result;
        showToast('✓ Suggestion ready');
    } catch (e) {
        if (textEl) textEl.textContent = 'AI assist unavailable. Try again.';
    }
}

function applyPostAiSuggestion() {
    const suggestion = document.getElementById('postAiResultText')?.textContent;
    const ta = document.getElementById('postContent');
    if (ta && suggestion && suggestion !== 'Generating…') {
        ta.value = suggestion;
        postState.content = suggestion;
        updatePostCount(suggestion);
        document.getElementById('postAiResult').style.display = 'none';
        showToast('✓ Applied to composer');
    }
}

function schedulePost(publishNow) {
    const content = document.getElementById('postContent')?.value?.trim() || postState.content?.trim();
    if (!content) { showToast('Write something first'); return; }
    const platforms = postState.platforms;
    const date = document.getElementById('postDate')?.value;
    const time = document.getElementById('postTime')?.value;
    const schedStr = date && time ? `${new Date(date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} · ${time} PT` : publishNow ? 'Now' : 'Immediately';

    // Add to SOCIAL_POSTS
    const newPost = {
        id: 'p' + Date.now(), platform: platforms[0],
        handle: platforms[0] === 'twitter' ? '@supercomputeco' : platforms[0] === 'lens' ? '@quanta.lens' : 'supercompute',
        content, scheduled: schedStr, source: 'Manual', status: publishNow ? 'published' : 'scheduled'
    };
    SOCIAL_POSTS.unshift(newPost);

    // Show success
    const el = document.getElementById('newPostBody');
    el.style.display = 'flex';
    el.style.alignItems = 'center';
    el.style.justifyContent = 'center';
    el.innerHTML = `<div style="max-width:420px;text-align:center;padding:2rem">
    <div style="width:64px;height:64px;border-radius:50%;background:linear-gradient(135deg,var(--pink),var(--gold));display:flex;align-items:center;justify-content:center;font-size:26px;margin:0 auto 1.25rem;animation:fadeUp .5s ease">${publishNow ? '🚀' : '📅'}</div>
    <h2 style="font-size:1.2rem;font-weight:800;color:var(--text);margin-bottom:.5rem">${publishNow ? 'Post Published!' : 'Post Scheduled!'}</h2>
    <p style="font-size:13px;color:var(--muted);margin-bottom:1.5rem;line-height:1.7">Your post will go live on <strong>${platforms.join(', ')}</strong><br>${publishNow ? 'immediately' : 'at ' + schedStr}.</p>
    <div class="card" style="text-align:left;margin-bottom:1.25rem">
      <div style="font-size:12px;color:var(--text);line-height:1.6;padding:.25rem 0">"${content.length > 100 ? content.slice(0, 100) + '…' : content}"</div>
      <div style="margin-top:.65rem;font-size:11px;color:var(--muted)">Platforms: ${platforms.join(' · ')} · ${schedStr}</div>
    </div>
    <div style="display:flex;gap:.75rem;justify-content:center">
      <button onclick="navigate('socialmedia',navItem('socialmedia'))" class="tb-btn primary">View Queue</button>
      <button onclick="openNewPost()" class="tb-btn">+ New Post</button>
    </div>
  </div>`;
    showToast(publishNow ? '🚀 Post published!' : '📅 Post scheduled!');
}
