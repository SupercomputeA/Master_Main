// src/api/agents.js — Agent Fleet API
export async function handleAgents(request, env, ctx) {
  const url = new URL(request.url);
  const path = url.pathname.replace('/api/agents', '') || '/';
  const method = request.method;

  // GET /api/agents — List all agents
  if (method === 'GET' && path === '/') {
    return new Response(JSON.stringify({
      agents: [
        { id: 'openclaw', name: 'OpenClaw', status: 'active', role: 'browser_automation', uptime: 99.9 },
        { id: 'quanta-s', name: 'Quanta S', status: 'active', role: 'newsdesk_intelligence', uptime: 99.9 },
        { id: 'knight', name: 'KNIGHT', status: 'observer', role: 'tradedesk', uptime: 0 },
        { id: 'claude-desktop', name: 'Claude Desktop', status: 'command', role: 'strategic_command', uptime: 100 },
      ]
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // GET /api/agents/:id — Get agent status
  if (method === 'GET' && path.match(/^\/\w+$/)) {
    const id = path.slice(1);
    // TODO: Fetch from D1
    return new Response(JSON.stringify({
      id,
      name: id,
      status: 'active',
      last_seen: Date.now() / 1000,
      messages_processed: 0,
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // POST /api/agents/:id/message — Send message to agent
  if (method === 'POST' && path.match(/^\/\w+\/message$/)) {
    const id = path.split('/')[1];
    const body = await request.json();
    // TODO: Process via OpenClaw or other
    return new Response(JSON.stringify({
      success: true,
      agent: id,
      response: 'Message received'
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response('Agents endpoint', { status: 404 });
}