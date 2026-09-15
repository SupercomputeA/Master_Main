// functions/api/social/[[catchall]].js — route /api/social/<anything> into the
// social handler in functions/api/social.js.
//
// Cloudflare file routing maps functions/api/social.js to EXACTLY /api/social;
// without this catch-all, GET /api/social/accounts falls through to the static
// export and returns an HTML 404 (which breaks the client's r.json()).
// Same trap as /api/farcaster — see the supercompute-site-ops skill.
import { onRequest as socialOnRequest } from '../social.js';

export async function onRequest(context) {
  return socialOnRequest(context);
}
