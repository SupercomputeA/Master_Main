// functions/api/subscribers/admin/expire-sweep.js
// Admin endpoint: flip subscribers with expires_at < now AND status='active' to 'expired'.
// Designed for the 60s subscription sync cron at ~/.hermes/profiles/website/scripts/supercompute-subscription-sync.sh
// Auth: Bearer token from HERMES_INTERNAL_TOKEN env (or SUBSCRIBERS_ADMIN_TOKEN override).
// Silent on success — cron watchdog pattern (empty stdout = no message).

import { json } from '../../auth.js';
import { corsOrigin, corsHeadersFor } from '../../../_shared/cors.js';

export async function onRequest({ request, env }) {
  // Exact-origin allowlist — functions/_shared/cors.js (SEC-F4). This is the
  // mutating admin endpoint security probed with forged *.pages.dev / ngrok /
  // localhost origins; only env.CORS_ORIGIN is echoed now.
  const origin = corsOrigin(request, env);
  const cors = corsHeadersFor(request, env, { methods: 'POST, OPTIONS' });
  const j = (data, status = 200) => json(data, status, origin);

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: cors });
  }
  if (request.method !== 'POST') return j({ error: 'POST required' }, 405);

  // Token auth — env vars HERMES_INTERNAL_TOKEN / SUBSCRIBERS_ADMIN_TOKEN.
  const expected = env?.SUBSCRIBERS_ADMIN_TOKEN || env?.HERMES_INTERNAL_TOKEN;
  if (!expected) {
    return j({ error: 'admin token not configured on server', expired: 0 }, 503);
  }
  const authHeader = request.headers.get('Authorization') || '';
  if (!authHeader.startsWith('Bearer ') || authHeader.slice(7) !== expected) {
    return j({ error: 'unauthorized', expired: 0 }, 401);
  }

  if (!env?.DB) {
    return j({ expired: 0, error: 'D1 not bound' }, 503);
  }

  const now = Math.floor(Date.now() / 1000);
  try {
    const result = await env.DB.prepare(
      `UPDATE subscribers
         SET status = 'expired', updated_at = ?
       WHERE status = 'active'
         AND expires_at IS NOT NULL
         AND expires_at < ?`
    ).bind(now, now).run();
    const expired = result.meta?.changes || 0;
    return j({ expired, checkedAt: new Date(now * 1000).toISOString() }, 200);
  } catch (e) {
    return j({ expired: 0, error: e instanceof Error ? e.message : String(e) }, 500);
  }
}