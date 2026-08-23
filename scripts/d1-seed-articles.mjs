// d1-seed-articles.mjs — Seed real articles into D1 from content/posts/*.md
// Removes known mock/demo rows, upserts our real posts (idempotent).
// Same pattern as d1-seed-admin.mjs (wrangler OAuth token → direct CF API).
//
// USAGE: node scripts/d1-seed-articles.mjs [--dry-run]
import { readFileSync, readdirSync } from 'node:fs'
import { execSync } from 'node:child_process'

const DRY = process.argv.includes('--dry-run')

// Token precedence: CLOUDFLARE_API_TOKEN env (CI / non-interactive) → wrangler OAuth
const ENV_TOKEN = (process.env.CLOUDFLARE_API_TOKEN || '').trim()
const TOKEN = ENV_TOKEN ||
  execSync('grep oauth_token ~/.wrangler/config/default.toml | sed -E \'s/oauth_token = "([^"]+)"/\\1/\'')
    .toString().trim()
const ACCT_ID = 'c830485ab81a0f5c9ccece564e9b74c5'
const DB_ID = 'e3c7c7f9-df4a-4e1b-9bc7-97f1faadf282'

async function d1Query(sql) {
  const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${ACCT_ID}/d1/database/${DB_ID}/query`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ sql })
  })
  const j = await res.json()
  if (!res.ok || j.errors?.length) {
    throw new Error('D1 error: ' + JSON.stringify(j.errors || j))
  }
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

// Known mock/demo rows to purge (Alice Chen, demo titles, placeholder authors)
const MOCK_SLUGS = [
  'defi-yield-strategies-for-2026',
  'understanding-refi',
  'base-ecosystem-the-builders-guide',
]
const MOCK_SLUG_SQL = MOCK_SLUGS.map((s) => `'${s}'`).join(', ')

async function main() {
  console.log(`\n=== D1 Articles Seed (${DRY ? 'DRY RUN' : 'LIVE'}) ===`)

  // 1. Count current articles (skip in dry-run — dry-run is fully offline)
  if (!DRY) {
    const cur = await d1Query('SELECT COUNT(*) AS n FROM articles;')
    console.log('Current articles in D1:', cur.result?.[0]?.results?.[0]?.n ?? '?')
  } else {
    console.log('[dry] offline — no D1 calls; showing planned mutations only')
  }

  // 2. Purge mock rows (dry-run: report only)
  if (DRY) {
    console.log(`[dry] Would DELETE mock slugs: ${MOCK_SLUGS.join(', ')}`)
  } else {
    const del = await d1Query(`DELETE FROM articles WHERE slug IN (${MOCK_SLUG_SQL});`)
    console.log('Purged mock rows:', JSON.stringify(del.result?.[0]?.meta ?? del.result?.[0] ?? del))
  }

  // 3. Upsert real posts from content/posts/*.md
  const postsDir = new URL('../content/posts/', import.meta.url)
  const files = readdirSync(postsDir).filter((f) => f.endsWith('.md')).sort()
  console.log(`Found ${files.length} real posts in content/posts/`)

  let inserted = 0, skipped = 0
  for (const file of files) {
    const raw = readFileSync(new URL(file, postsDir), 'utf-8')
    const fm = parseFrontmatter(raw)
    const slug = fm.slug || file.replace('.md', '')
    const title = (fm.title || file.replace('.md', '')).replace(/^["']|["']$/g, '')
    const excerpt = (fm.excerpt || '').replace(/^["']|["']$/g, '')
    const category = (fm.category || 'SIGNAL').toUpperCase()
    const author = fm.author || 'Quanta Sovereigna'
    const status = fm.status || 'published'
    // date → unix seconds (accept ISO or already-numeric)
    let ts = Math.floor(Date.now() / 1000)
    if (fm.date) {
      const d = new Date(fm.date)
      if (!isNaN(d.getTime())) ts = Math.floor(d.getTime() / 1000)
      else if (!isNaN(Number(fm.date))) ts = Math.floor(Number(fm.date))
    }
    const icon = fm.icon || '◎'

    if (DRY) {
      console.log(`[dry] upsert ${slug} — "${title}" (${category}, ${author})`)
      continue
    }

    // Upsert: UPDATE existing by slug, else INSERT
    const exists = await d1Query(`SELECT COUNT(*) AS n FROM articles WHERE slug = '${slug}';`)
    const n = exists.result?.[0]?.results?.[0]?.n ?? 0
    const clean = (s) => s.replace(/'/g, "''")
    if (n > 0) {
      await d1Query(
        `UPDATE articles SET title='${clean(title)}', excerpt='${clean(excerpt)}', category='${clean(category)}', author='${clean(author)}', status='${clean(status)}', published_at=${ts} WHERE slug='${clean(slug)}';`
      )
      skipped++
    } else {
      await d1Query(
        `INSERT INTO articles (id, title, slug, excerpt, category, author, icon, status, published_at, created_at) VALUES (lower(hex(randomblob(16))), '${clean(title)}', '${clean(slug)}', '${clean(excerpt)}', '${clean(category)}', '${clean(author)}', '${clean(icon)}', '${clean(status)}', ${ts}, ${Math.floor(Date.now()/1000)});`
      )
      inserted++
    }
  }

  console.log(`\nDone. ${DRY ? '[dry] ' : ''}inserted=${inserted}, updated=${skipped}`)
  if (!DRY) {
    const after = await d1Query('SELECT COUNT(*) AS n FROM articles;')
    console.log('Articles in D1 after seed:', after.result?.[0]?.results?.[0]?.n ?? '?')
  }
}

main().catch((e) => { console.error('FAILED:', e.message); process.exit(1) })
