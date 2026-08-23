// functions/api/articles/[[catchall]].js — route /api/articles/:id (and any subpath)
// into the articles handler. Cloudflare file routing maps functions/api/articles.js
// to EXACTLY /api/articles; without this catch-all, GET /api/articles/<id> fell
// through to the Next.js SPA and returned a 404 HTML page (breaking the edit page,
// which fetches the article by ID and json()'s the response).
import { onRequest as articlesOnRequest } from '../articles.js';

export async function onRequest(context) {
  return articlesOnRequest(context);
}
