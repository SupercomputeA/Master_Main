// Cloudflare Worker with Site Assets
export default {
  async fetch(request, env) {
    // Try to get asset from sites
    try {
      return await env.ASSETS.fetch(request);
    } catch (e) {
      return new Response('Error: ' + e.message, { status: 500 });
    }
  },
};