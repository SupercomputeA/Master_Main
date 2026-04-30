// src/api/articles.js — NewsDesk Articles API
export async function handleArticles(request, env, ctx) {
  const url = new URL(request.url);
  const path = url.pathname.replace('/api/articles', '') || '/';
  const method = request.method;

  // GET /api/articles — List all articles
  if (method === 'GET' && path === '/') {
    const articles = [
      { id: '1', title: 'Understanding Base Chain: The Future of Ethereum L2', excerpt: 'Base Chain has become the go-to Layer 2 for builders seeking low-cost, fast transactions with full Ethereum compatibility and a growing DeFi ecosystem.', category: 'intelligence', author: 'Quanta S', views: 2847, published_at: Date.now() / 1000 - 7200, icon: '⛓️' },
      { id: '2', title: 'DeFi Security: Protecting Your On-Chain Assets in 2026', excerpt: 'With over $2B lost to exploits in Q1 2026, smart contract security has never been more critical. Here are the protocols we trust.', category: 'sovereignty', author: 'Quanta S', views: 1203, published_at: Date.now() / 1000 - 86400, icon: '🛡️' },
      { id: '3', title: 'KNIGHT Week 1: Paper Trading Performance Report', excerpt: 'KNIGHT logged 47 paper trades in its first operational week, achieving a simulated +2.68% on a $500 practice portfolio with zero security incidents.', category: 'dispatch', author: 'KNIGHT', views: 634, published_at: Date.now() / 1000 - 172800, icon: '📊' },
      { id: '4', title: 'Cloudflare Workers + D1: Building at the Edge', excerpt: 'Our decision to build the Supercompute API on Cloudflare Workers was driven by speed, cost, and zero cold-start latency at the global edge.', category: 'signal', author: 'Quanta S', views: 411, published_at: Date.now() / 1000 - 259200, icon: '🔧' },
      { id: '5', title: 'Web3 Community Building: The Supercompute Playbook', excerpt: 'After 3 years building in Web3, we have developed a systematic approach to community growth that combines human insight with AI-native automation.', category: 'intelligence', author: 'Quanta S', views: 3105, published_at: Date.now() / 1000 - 432000, icon: '🌐' },
    ];
    
    return new Response(JSON.stringify({ articles }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // GET /api/articles/:id — Get single article
  if (method === 'GET' && path.match(/^\/\w+$/)) {
    const id = path.slice(1);
    // TODO: Fetch from D1
    return new Response(JSON.stringify({ 
      id, 
      title: 'Article ' + id,
      content: 'Full article content here...',
      author: 'Quanta S',
      published_at: Date.now() / 1000
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // POST /api/articles — Create article (admin only)
  if (method === 'POST' && path === '/') {
    const body = await request.json();
    // TODO: Insert into D1
    return new Response(JSON.stringify({ success: true, id: 'new-id' }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response('Articles endpoint', { status: 404 });
}