import { json } from '../auth.js';
export async function onRequest({ request, env }) {
  const authHeader = request.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ') && env?.DB) {
    await env.DB.prepare('DELETE FROM sessions WHERE id = ?').bind(authHeader.slice(7)).run().catch(() => {});
  }
  return json({ success: true });
}
