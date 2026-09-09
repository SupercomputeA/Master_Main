// find-key-in-sessions.mjs — scan Hermes session DBs for 64-hex keys and derive
// addresses, matching target. Prints only session + derived address.
import { privateKeyToAccount } from 'viem/accounts'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'

const target = (process.argv[2] || '').toLowerCase()
const roots = process.argv.slice(3)
const PK_RE = /(?:0x)?[0-9a-fA-F]{64}/g
const found = []
let scanned = 0

function scanBuffer(file, buf) {
  let text
  try { text = buf.toString('utf8') } catch { return }
  if (!/0x[0-9a-fA-F]{64}|[0-9a-fA-F]{64}/.test(text)) return
  scanned++
  for (const m of text.matchAll(PK_RE)) {
    let pk = m[0]
    if (!pk.startsWith('0x')) pk = '0x' + pk
    try {
      const addr = privateKeyToAccount(pk).address.toLowerCase()
      found.push({ file, addr })
      if (target && addr === target) console.log(`MATCH: ${file} -> ${addr}`)
    } catch { /* not a key */ }
  }
}

function walk(dir, depth) {
  if (depth > 3) return
  let entries
  try { entries = readdirSync(dir) } catch { return }
  for (const e of entries) {
    const p = path.join(dir, e)
    let st
    try { st = statSync(p) } catch { continue }
    if (st.isDirectory()) walk(p, depth + 1)
    else if (st.size < 200_000_000) {
      try { scanBuffer(p, readFileSync(p)) } catch { /* skip */ }
    }
  }
}

for (const root of roots) walk(root, 0)

console.log(`\nscanned ${scanned} files with key-shaped content`)
if (target) {
  const seen = new Set()
  for (const m of found) {
    if (!seen.has(m.addr)) { seen.add(m.addr); console.log(' ', m.addr, '<-', m.file.slice(0, 90)) }
  }
  console.log(`target ${target} found: ${found.some((m) => m.addr === target)}`)
}
