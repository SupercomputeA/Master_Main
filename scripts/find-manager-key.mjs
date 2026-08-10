// find-manager-key.mjs — sweep every Bitwarden item for private-key-shaped values,
// derive each address, and match against the target. Prints ONLY item names + derived
// addresses — never the key material.
//
// Usage: BW_SESSION=<session> node scripts/find-manager-key.mjs <target-address>
// Items JSON comes on stdin (bw-audit list items).
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
    console.error('parse err — raw head:', raw.slice(0, 120))
    process.exit(1)
  }

  const PK_RE = /(?:0x)?[0-9a-fA-F]{64}/
  const matches = []

  function scanValue(name, value, source) {
    if (typeof value !== 'string') return
    const v = value.trim().replace(/^=/, '')
    if (!PK_RE.test(v)) return
    const m = v.match(PK_RE)
    if (!m) return
    let pk = m[0]
    if (!pk.startsWith('0x')) pk = '0x' + pk
    try {
      const addr = privateKeyToAccount(pk).address.toLowerCase()
      matches.push({ name, addr, source })
      if (target && addr === target) {
        console.log(`MATCH: ${name} [${source}] -> ${addr}`)
      }
    } catch {
      /* not a valid key */
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
    console.log(`\ntarget: ${target}`)
    console.log(`scanned: ${items.length} items`)
    const found = matches.filter((m) => m.addr === target)
    console.log(`addresses matching target: ${found.length}`)
    if (found.length === 0) {
      console.log('no match in scanned fields — list all derived addresses:')
      const seen = new Set()
      for (const m of matches) {
        const k = m.addr
        if (!seen.has(k)) { seen.add(k); console.log(' ', k, '<-', m.name) }
      }
    }
  }
})
