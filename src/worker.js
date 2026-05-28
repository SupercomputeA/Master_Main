// Cloudflare Worker — API router + static assets
import { handleAuth } from './api/auth.js';
import { handleArticles } from './api/articles.js';
import { handleProjects } from './api/projects.js';
import { handleAgents } from './api/agents.js';
import { handleStaking } from './api/staking.js';

function corsHeaders(env) {
  return {
    'Access-Control-Allow-Origin': env.CORS_ORIGIN || '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  };
}

function withCors(response, env) {
  const headers = new Headers(response.headers);
  for (const [k, v] of Object.entries(corsHeaders(env))) headers.set(k, v);
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS' && url.pathname.startsWith('/api/')) {
      return new Response(null, { status: 204, headers: corsHeaders(env) });
    }

    try {
      let response;
      if (url.pathname.startsWith('/api/auth')) {
        response = await handleAuth(request, env, ctx);
      } else if (url.pathname.startsWith('/api/articles')) {
        response = await handleArticles(request, env, ctx);
      } else if (url.pathname.startsWith('/api/projects')) {
        response = await handleProjects(request, env, ctx);
      } else if (url.pathname.startsWith('/api/agents')) {
        response = await handleAgents(request, env, ctx);
      } else if (url.pathname.startsWith('/api/staking')) {
        response = await handleStaking(request, env, ctx);
      } else {
        return env.ASSETS ? env.ASSETS.fetch(request) : new Response('Not Found', { status: 404 });
      }
      return withCors(response, env);
    } catch (err) {
      return withCors(
        new Response(JSON.stringify({ error: 'Internal Server Error', detail: err.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }),
        env,
      );
    }
  },
};
