// src/worker.js — Main Cloudflare Worker entry point
import { handleAuth } from './api/auth.js';
import { handleArticles } from './api/articles.js';
import { handleStaking } from './api/staking.js';
import { handleAgents } from './api/agents.js';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    // Handle preflight
    if (method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // Route: /api/auth/*
      if (path.startsWith('/api/auth')) {
        return handleAuth(request, env, ctx);
      }

      // Route: /api/articles/*
      if (path.startsWith('/api/articles')) {
        return handleArticles(request, env, ctx);
      }

      // Route: /api/staking/*
      if (path.startsWith('/api/staking')) {
        return handleStaking(request, env, ctx);
      }

      // Route: /api/agents/*
      if (path.startsWith('/api/agents')) {
        return handleAgents(request, env, ctx);
      }

      // Route: /api/health
      if (path === '/api/health') {
        return new Response(JSON.stringify({ status: 'ok', timestamp: Date.now() }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Serve static files from /public
      if (method === 'GET' && !path.startsWith('/api')) {
        return serveStatic(path, corsHeaders);
      }

      return new Response('Not Found', { status: 404, headers: corsHeaders });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  },
};

async function serveStatic(path, corsHeaders) {
  // Default to index.html for SPA routing
  let filePath = path === '/' ? '/Supercompute.html' : path;
  
  // Remove leading slash for file lookup
  const fileName = filePath.replace(/^\//, '');
  
  // Try to get from class e.g., ASSETS
  // For now, basic static serving - you'll bind assets in wrangler.toml
  return new Response('Static file: ' + fileName, { 
    headers: { ...corsHeaders, 'Content-Type': 'text/html' } 
  });
}