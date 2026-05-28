import { isValidAddress, json } from '../auth.js';
export async function onRequest({ request, env }) {
  const url = new URL(request.url);
  const nonce = url.searchParams.get('nonce');
  const address = url.searchParams.get('address');
  if (!nonce || !address) return json({ error: 'nonce and address required' }, 400);
  if (!isValidAddress(address)) return json({ error: 'Invalid address' }, 400);
  if (env?.CACHE) {
    const stored = await env.CACHE.get(`siwe:nonce:${nonce}`);
    if (!stored) return json({ error: 'Invalid or expired nonce' }, 400);
  }
  const now = new Date(Date.now() + 10 * 60 * 1000).toISOString();
  const message = [
    'supercompute.io wants you to sign in with your Ethereum account.',
    '',
    'URI: https://supercompute.io',
    'Version: 1',
    'Chain ID: 8453',
    `Nonce: ${nonce}`,
    `Expiration Time: ${now}`,
    '',
    'Sign in to SUPERCOMPUTE Web3 Platform',
  ].join('\n');
  return json({ message });
}
