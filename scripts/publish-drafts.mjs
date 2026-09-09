// publish-drafts.mjs — Publish the approved draft queue: promote drafts to published
// in D1 (with full content body), and optionally attest each on EAS (Base).
//
// USAGE:
//   node scripts/publish-drafts.mjs [--dry-run]              # D1 only, no attestation
//   node scripts/publish-drafts.mjs [--dry-run] --attest     # + EAS attestation (needs PK)
//
// Reads ~/2026/supercompute-publishing/content/drafts/*.md (frontmatter + body),
// upserts into D1 articles with status=published. Idempotent. Dry-run fully offline.
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { execSync } from 'node:child_process'

const DRY = process.argv.includes('--dry-run')
const DO_ATTEST = process.argv.includes('--attest')

const ENV_TOKEN = (process.env.CLOUDFLARE_API_TOKEN || '').trim()
const TOKEN = ENV_TOKEN ||
  execSync('grep oauth_token ~/.wrangler/config/default.toml | sed -E \'s/oauth_token = "([^"]+)"/\\1/\'')
    .toString().trim()
const ACCT_ID = 'c830485ab81a0f5c9ccece564e9b74c5'
const DB_ID = 'e3c7c7f9-df4a-4e1b-9bc7-97f1faadf282'
const DRAFTS_DIR = '/Users/mone/2026/supercompute-publishing/content/drafts'
// Copy the already-synced draft rows to published even if file missing (the seed path
// seeded 24; the remaining 5 files below are on disk and get inserted fresh).
const ALREADY_SYNCED = true

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

function bodyAfterFrontmatter(raw) {
  const m = raw.match(/^---\s*\n[\s\S]*?\n---\s*\n?([\s\S]*)$/)
  return (m ? m[1] : raw).trim()
}

async function main() {
  console.log(`\n=== Publish Drafts (${DRY ? 'DRY RUN' : 'LIVE'}) ===`)
  if (!existsSync(DRAFTS_DIR)) { console.error('Drafts dir not found:', DRAFTS_DIR); process.exit(1) }

  const files = readdirSync(DRAFTS_DIR).filter((f) => f.endsWith('.md')).sort()
  console.log(`Found ${files.length} drafts in ${DRAFTS_DIR}`)

  let published = 0, updated = 0, skipped = 0
  const toAttest = []

  for (const file of files) {
    const raw = readFileSync(`${DRAFTS_DIR}/${file}`, 'utf-8')
    const fm = parseFrontmatter(raw)
    const slug = fm.slug || file.replace('.md', '')
    const title = (fm.title || file.replace('.md', '')).replace(/^["']|["']$/g, '')
    const excerpt = (fm.excerpt || '').replace(/^["']|["']$/g, '')
    const category = (fm.category || 'SIGNAL').toUpperCase()
    const author = fm.author || 'Quanta Sovereigna'
    const icon = fm.icon || '◎'
    const content = bodyAfterFrontmatter(raw)
    const now = Math.floor(Date.now() / 1000)

    if (DRY) {
      console.log(`[dry] publish ${slug} — "${title}" (${category}, ${content.length} chars body)`)
      continue
    }

    const clean = (s) => s.replace(/'/g, "''")
    const exists = await d1Query(`SELECT COUNT(*) AS n FROM articles WHERE slug = '${clean(slug)}';`)
    const n = exists.result?.[0]?.results?.[0]?.n ?? 0

    if (n > 0) {
      await d1Query(
        `UPDATE articles SET title='${clean(title)}', excerpt='${clean(excerpt)}', category='${clean(category)}', author='${clean(author)}', icon='${clean(icon)}', content='${clean(content)}', status='published', published_at=${now}, updated_at=${now} WHERE slug='${clean(slug)}';`
      )
      updated++
    } else {
      await d1Query(
        `INSERT INTO articles (id, title, slug, excerpt, category, author, icon, content, status, published_at, created_at) VALUES (lower(hex(randomblob(16))), '${clean(title)}', '${clean(slug)}', '${clean(excerpt)}', '${clean(category)}', '${clean(author)}', '${clean(icon)}', '${clean(content)}', 'published', ${now}, ${now});`
      )
      published++
    }
    toAttest.push({ slug, title })
    console.log(`publish: ${slug}`)
  }

  console.log(`\nDone. ${DRY ? '[dry] ' : ''}inserted=${published}, updated=${updated}, total_promoted=${toAttest.length}`)

  if (!DRY) {
    const after = await d1Query(`SELECT status, COUNT(*) AS n FROM articles GROUP BY status;`)
    console.log('D1 after publish:', JSON.stringify(after.result?.[0]?.results || []))
  }

  if (DO_ATTEST && !DRY) {
    console.log('\n=== EAS Attestation pass ===')
    const { execSync: run } = await import('node:child_process')
    for (const a of toAttest.slice(0, 5)) {
      try {
        const out = run(`PK="${process.env.PK}" TS="${Math.floor(Date.now()/1000)}" node scripts/eas-attest-raw.mjs "${a.slug}" "${a.title}"`, { encoding: 'utf8', cwd: process.cwd() })
        console.log(`attest ${a.slug}:`, out.trim().split('\n').pop())
      } catch (e) {
        console.log(`attest ${a.slug} ERR:`, String(e.message || e).split('\n').slice(-1)[0])
      }
    }
  }
}

main().catch((e) => { console.error('FAILED:', e.message); process.exit(1) })
