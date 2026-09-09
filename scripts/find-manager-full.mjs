// find-manager-full.mjs — definitive vault sweep: ALL 64-hex substrings in every
// field/login/notes value of every item, derive each, match target.
import { privateKeyToAccount } from 'viem/accounts'

const target = (process.argv[2] || '').toLowerCase()
let raw = ''
process.stdin.on('data', (c) => (raw += c))
process.stdin.on('end', () => {
  let items
  try {
    const d = JSON.parse(raw)
    items = d.data || d
  } catch {
    console.error('parse err')
    process.exit(1)
  }

  const PK_RE = /(?:0x)?[0-9a-fA-F]{64}/g
  const results = []

  function scanValue(name, value, source) {
    if (typeof value !== 'string') return
    for (const m of value.matchAll(PK_RE)) {
      let pk = m[0]
      if (!pk.startsWith('0x')) pk = '0x' + pk
      try {
        const addr = privateKeyToAccount(pk).address.toLowerCase()
        results.push({ name, addr, source })
        if (target && addr === target) console.log(`MATCH: ${name} [${source}] -> ${addr}`)
      } catch { /* invalid key */ }
    }
  }

  for (const it of items) {
    const name = it.name || '<unnamed>'
    const login = it.login || {}
    scanValue(name, login.password, 'login.password')
    scanValue(name, login.username, 'login.username')
    for (const f of it.fields || []) scanValue(name, f.value, `field:${f.name}`)
    scanValue(name, it.notes, 'notes')
  }

  if (target) {
    console.log(`\nscanned: ${items.length} items, all substrings`)
    console.log(`total derivable keys: ${results.length}`)
    const seen = new Set()
    for (const r of results) {
      if (!seen.has(r.addr)) { seen.add(r.addr); console.log(' ', r.addr, '<-', r.name, `[${r.source}]`) }
    }
    console.log(`target ${target} found: ${results.some((r) => r.addr === target)}`)
  }
})
