// functions/api/farcaster/[[catchall]].js
// Cloudflare Pages Functions routing: a flat file (farcaster.js) only serves
// the exact path /api/farcaster — every subpath (/casts, /user, /info,
// /snapchain/*) 404'd in production because nothing matched them.
// This catch-all routes all subpaths to the same handler.
export { onRequest } from "../farcaster.js"
