// sync-drafts-to-d1.mjs — Push writer drafts from supercompute-publishing into D1.
// Reads ~/2026/supercompute-publishing/content/drafts/*.md, upserts each into the
// articles table with status=draft (idempotent). Skips any slug already present.
// Same auth pattern as d1-seed-articles.mjs: CLOUDFLARE_API_TOKEN env → wrangler OAuth.
//
// USAGE: node scripts/sync-drafts-to-d1.mjs [--dry-run]
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { execSync } from 'node:child_process'

const DRY = process.argv.includes('--dry-run')

const ENV_TOKEN = (process.env.CLOUDFLARE_API_TOKEN || '').trim()
const TOKEN = ENV_TOKEN ||
  execSync('grep oauth_token ~/.wrangler/config/default.toml | sed -E \'s/oauth_token = "([^"]+)"/\\1/\'')
    .toString().trim()
const ACCT_ID = 'c830485ab81a0f5c9ccece564e9b74c5'
const DB_ID = 'e3c7c7f9-df4a-4e1b-9bc7-97f1faadf282'
const DRAFTS_DIR = '/Users/mone/2026/supercompute-publishing/content/drafts'

async function d1Query(sql) {
  const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${ACCT_ID}/d1/database/${DB_ID}/query`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ sql })
  })
  const j = await res.json()
  if (!res.ok || j.errors?.length) throw new Error('D1 error: ' + JSON.stringify(j.errors || j))
  return j
}

function parseFrontmatter(raw) {
  const fm = {}
  const m = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n?/)
  if (m) {
    for (const line of m[1].split('\n')) {
      const idx = line.indexOf(':')
      if (idx > 0) {
        const k = line.slice(0, idx).trim()
        let v = line.slice(idx + 1).trim()
        v = v.replace(/^["']|["']$/g, '')
        if (k) fm[k] = v
      }
    }
  }
  return fm
}

async function main() {
  console.log(`\n=== Draft Sync (${DRY ? 'DRY RUN' : 'LIVE'}) ===`)
  if (!existsSync(DRAFTS_DIR)) { console.error('Drafts dir not found:', DRAFTS_DIR); process.exit(1) }

  const files = readdirSync(DRAFTS_DIR).filter((f) => f.endsWith('.md')).sort()
  console.log(`Found ${files.length} drafts in ${DRAFTS_DIR}`)

  // Live mode: pull existing slugs once for skip logic
  let existing = new Set()
  if (!DRY) {
    const q = await d1Query('SELECT slug FROM articles;')
    for (const row of (q.result?.[0]?.results || [])) if (row.slug) existing.add(row.slug)
    console.log(`Existing articles in D1: ${existing.size}`)
  }

  let inserted = 0, skipped = 0
  for (const file of files) {
    const raw = readFileSync(`${DRAFTS_DIR}/${file}`, 'utf-8')
    const fm = parseFrontmatter(raw)
    const slug = fm.slug || file.replace('.md', '')
    const title = (fm.title || file.replace('.md', '')).replace(/^["']|["']$/g, '')
    const excerpt = (fm.excerpt || '').replace(/^["']|["']$/g, '')
    const category = (fm.category || 'SIGNAL').toUpperCase()
    const author = fm.author || 'Quanta Sovereigna'
    const icon = fm.icon || '◎'
    const now = Math.floor(Date.now() / 1000)

    if (DRY) { console.log(`[dry] would insert ${slug} — "${title}" (${category}, ${author})`); continue }

    if (existing.has(slug)) { skipped++; console.log(`skip (exists): ${slug}`); continue }

    const clean = (s) => s.replace(/'/g, "''")
    await d1Query(
      `INSERT INTO articles (id, title, slug, excerpt, category, author, icon, status, created_at) VALUES (lower(hex(randomblob(16))), '${clean(title)}', '${clean(slug)}', '${clean(excerpt)}', '${clean(category)}', '${clean(author)}', '${clean(icon)}', 'draft', ${now});`
    )
    inserted++
    console.log(`insert: ${slug}`)
  }

  console.log(`\nDone. ${DRY ? '[dry] ' : ''}inserted=${inserted}, skipped=${skipped}`)
}

main().catch((e) => { console.error('FAILED:', e.message); process.exit(1) })
