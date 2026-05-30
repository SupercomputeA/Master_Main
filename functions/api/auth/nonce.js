import { generateNonce, json } from '../auth.js';
export async function onRequest({ request, env }) {
  const url = new URL(request.url);
  const address = url.searchParams.get('address') || '';
  const nonce = generateNonce();
  if (env?.CACHE) {
    // Bind nonce to requesting address to prevent replay with different address
    const payload = address ? JSON.stringify({ address: address.toLowerCase(), status: 'pending' }) : 'pending';
    await env.CACHE.put(`siwe:nonce:${nonce}`, payload, { expirationTtl: 600 });
  }
  return json({ nonce });
}
