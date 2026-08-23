// find-key-in-files.mjs — scan local files for private-key-shaped values and
// derive addresses, matching a target. Prints only file paths + derived addresses.
import { privateKeyToAccount } from 'viem/accounts'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'

const target = (process.argv[2] || '').toLowerCase()
const roots = process.argv.slice(3)
const PK_RE = /(?:0x)?[0-9a-fA-F]{64}/g
const SKIP_DIRS = new Set(['node_modules', '.git', 'cache', 'lsp', '.smart-env', 'archived-skills'])
const SKIP_EXT = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.mp4', '.mov', '.db', '.sqlite', '.keystore', '.p12', '.pyc'])
const LIMIT = 40

const found = [] // { file, addr }
let filesScanned = 0

function scanFile(file) {
  let buf
  try { buf = readFileSync(file) } catch { return }
  if (buf.length > 2_000_000) return // skip huge binaries
  let text
  try { text = buf.toString('utf8') } catch { return }
  filesScanned++
  for (const m of text.matchAll(PK_RE)) {
    let pk = m[0]
    if (!pk.startsWith('0x')) pk = '0x' + pk
    try {
      const addr = privateKeyToAccount(pk).address.toLowerCase()
      if (target && addr === target) {
        console.log(`MATCH: ${file} -> ${addr}`)
      } else if (!target) {
        found.push({ file, addr })
      }
    } catch { /* not a key */ }
  }
  if (!target && found.length > LIMIT) { console.log('limit reached'); process.exit(0) }
}

function walk(dir, depth) {
  if (depth > 6) return
  let entries
  try { entries = readdirSync(dir) } catch { return }
  for (const e of entries) {
    if (SKIP_DIRS.has(e)) continue
    const p = path.join(dir, e)
    let st
    try { st = statSync(p) } catch { continue }
    if (st.isDirectory()) walk(p, depth + 1)
    else if (!SKIP_EXT.has(path.extname(e).toLowerCase())) scanFile(p)
  }
}

for (const root of roots) walk(root, 0)

if (target) {
  console.log(`\ntarget: ${target}`)
  console.log(`files scanned: ${filesScanned}`)
  console.log(`matches: ${found.length}`)
} else {
  console.log(`files scanned: ${filesScanned}`)
  const seen = new Set()
  for (const m of found) {
    if (!seen.has(m.addr)) { seen.add(m.addr); console.log(' ', m.addr, '<-', m.file) }
  }
}
