// functions/api/investors/data-room.js
// GET /api/investors/data-room — gated list of investor documents.
//
// Auth: requires a valid SIWE session whose users.role is 'investor' or
// 'admin'. Non-investors get 401. There is intentionally no "request access"
// path here — that lives on the public /investors page contact form.
//
// Storage: documents are stored in R2 (binding: INVESTOR_DOCS). For now the
// list is hard-coded below and the API returns presigned URLs (when R2 is
// configured) or the canonical path the doc would be served from. If neither
// is set, the endpoint still returns the catalog so the UI can show the menu
// — each row simply falls back to "ask the team" copy.
//
// Mone maintains this list by hand. To add a doc:
//   1. Upload to R2 bucket `supercompute-investor-docs` under investors/<slug>.pdf
//   2. Add an entry to the INVESTOR_DOCS catalog below.
//   3. Mark R2 binding as `INVESTOR_DOCS` in Cloudflare Pages.

import { verifySession } from '../auth.js';

const INVESTOR_DOCS = [
  {
    id: 'pitch-deck',
    title: 'Pitch deck (PDF)',
    r2Key: 'investors/pitch-deck.pdf',
    filename: 'supercompute-pitch-deck.pdf',
    blurb: '3-slide exec summary + product narrative.',
    audience: 'lead-investor',
    placeholder: true, // Mone has not uploaded the file yet.
  },
  {
    id: 'financial-model',
    title: 'Financial model (XLSX)',
    r2Key: 'investors/financial-model.xlsx',
    filename: 'supercompute-financial-model.xlsx',
    blurb: 'Revenue projections, runway, scenario analysis.',
    audience: 'lead-investor',
    placeholder: true,
  },
  {
    id: 'cap-table',
    title: 'Cap table (PDF)',
    r2Key: 'investors/cap-table.pdf',
    filename: 'supercompute-cap-table.pdf',
    blurb: 'Authorized + issued shares, SAFE notes, dilution schedule.',
    audience: 'lead-investor',
    placeholder: true,
  },
  {
    id: 'tech-architecture',
    title: 'Technical architecture (PDF)',
    r2Key: 'investors/tech-architecture.pdf',
    filename: 'supercompute-tech-architecture.pdf',
    blurb: 'TradeDesk / Robinhood Chain integration diagram + agent fleet topology.',
    audience: 'technical-diligence',
    placeholder: true,
  },
  {
    id: 'audit-reports',
    title: 'Audit reports (bundle)',
    r2Key: 'investors/audit-reports.zip',
    filename: 'supercompute-audit-reports.zip',
    blurb: 'Smart contract + agent audit reports. External firms TBD.',
    audience: 'technical-diligence',
    placeholder: true,
  },
  {
    id: 'traction-summary',
    title: 'Traction summary (PDF)',
    r2Key: 'investors/traction-summary.pdf',
    filename: 'supercompute-traction-summary.pdf',
    blurb: 'Top-of-funnel, on-chain usage, retention. Generated monthly.',
    audience: 'lead-investor',
    placeholder: true,
  },
];

function corsHeaders(reqOrigin) {
  let allowedOrigin = 'https://supercompute.io';
  if (reqOrigin) {
    try {
      const host = new URL(reqOrigin).hostname;
      const allowed =
        host === 'supercompute.io' ||
        host === 'supercompute.pages.dev' ||
        host === 'localhost' ||
        host === '127.0.0.1' ||
        host.endsWith('.pages.dev') ||
        host.endsWith('.cloudflarestaging.com') ||
        host.endsWith('.ngrok-free.app');
      if (allowed) allowedOrigin = reqOrigin;
    } catch {}
  }
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

function presignUrl(key) {
  // Cloudflare R2 presign via S3-compatible API requires AWS-style signing,
  // which Pages Functions can do via the @aws-sdk/client-s3 module but it's
  // not in the project deps. Until we add it, return the proxy URL that
  // /api/investors/file will serve from — that endpoint does the role check
  // and streams the object directly.
  return `/api/investors/file?key=${encodeURIComponent(key)}`;
}

export async function onRequest({ request, env }) {
  const cors = corsHeaders(request.headers.get('Origin'));
  const respond = (data, status = 200) =>
    new Response(JSON.stringify(data), {
      status,
      headers: { ...cors, 'Content-Type': 'application/json' },
    });

  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
  if (request.method !== 'GET') return respond({ ok: false, error: 'method_not_allowed' }, 405);

  const { valid, wallet } = await verifySession(env, request.headers.get('Authorization'));
  if (!valid) {
    return respond({ ok: false, error: 'unauthenticated' }, 401);
  }

  // Tier check: investor or admin in the users table.
  let role = 'user';
  try {
    if (env?.DB) {
      const row = await env.DB.prepare(
        'SELECT role FROM users WHERE wallet_address = ?',
      ).bind(wallet.toLowerCase()).first();
      role = row?.role ?? 'user';
    }
  } catch {}

  if (role !== 'investor' && role !== 'admin') {
    return respond(
      {
        ok: false,
        error: 'investor_tier_required',
        hint: 'Sign in with an investor-tier wallet, or contact the team via /investors.',
      },
      403,
    );
  }

  const r2Bucket = env?.INVESTOR_DOCS ?? null;
  const docs = await Promise.all(
    INVESTOR_DOCS.map(async (d) => ({
      id: d.id,
      title: d.title,
      filename: d.filename,
      blurb: d.blurb,
      audience: d.audience,
      available: Boolean(r2Bucket) && !d.placeholder,
      url: r2Bucket ? presignUrl(d.r2Key) : null,
      placeholder: d.placeholder,
    })),
  );

  return respond({
    ok: true,
    tier: role,
    wallet,
    r2Configured: Boolean(r2Bucket),
    docs,
    disclaimer:
      'Confidential. Forwarding these materials outside your firm without written consent is not permitted.',
  });
}