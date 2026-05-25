import { json } from '../auth.js';
export async function onRequest({ request, env }) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return json({ user: null });
  const sessionId = authHeader.slice(7);
  if (!env?.DB) return json({ user: null });
  try {
    const session = await env.DB.prepare('SELECT wallet_address FROM sessions WHERE id = ? AND expires_at > ?').bind(sessionId, Math.floor(Date.now() / 1000)).first();
    if (!session) return json({ user: null });
    const user = await env.DB.prepare('SELECT id, name, wallet_address, role FROM users WHERE wallet_address = ?').bind(session.wallet_address).first();
    return json({ user });
  } catch { return json({ user: null }); }
}
