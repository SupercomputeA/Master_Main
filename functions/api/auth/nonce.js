import { generateNonce, json } from '../auth.js';
export async function onRequest({ env }) {
  const nonce = generateNonce();
  if (env?.CACHE) {
    await env.CACHE.put(`siwe:nonce:${nonce}`, 'pending', { expirationTtl: 600 });
  }
  return json({ nonce });
}
