// find-manager-mnemonic.mjs — scan vault items for BIP39 seed phrases (12/24 words)
// and derive the address. Prints only item names + derived addresses.
import { mnemonicToAccount } from 'viem/accounts'

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

  const WORD_RE = /^[a-z]{3,8}$/
  const matches = []

  function scanMnemonic(name, value, source) {
    if (typeof value !== 'string') return
    const words = value.trim().toLowerCase().split(/\s+/)
    // BIP39: 12, 15, 18, 21, or 24 words
    if (![12, 15, 18, 21, 24].includes(words.length)) return
    if (!words.every((w) => WORD_RE.test(w))) return
    try {
      const acct = mnemonicToAccount(words.join(' '))
      matches.push({ name, addr: acct.address.toLowerCase(), source })
      if (target && acct.address.toLowerCase() === target) {
        console.log(`MATCH: ${name} [${source}] -> ${acct.address}`)
      }
    } catch {
      /* not a valid mnemonic */
    }
  }

  for (const it of items) {
    const name = it.name || '<unnamed>'
    const login = it.login || {}
    scanMnemonic(name, login.password, 'login.password')
    scanMnemonic(name, login.username, 'login.username')
    for (const f of it.fields || []) scanMnemonic(name, f.value, `field:${f.name}`)
    scanMnemonic(name, it.notes, 'notes')
  }

  if (target) {
    console.log(`\ntarget: ${target}`)
    console.log(`scanned: ${items.length} items for mnemonics`)
    const found = matches.filter((m) => m.addr === target)
    console.log(`mnemonic matches: ${found.length}`)
    if (found.length === 0) {
      const seen = new Set()
      for (const m of matches) {
        if (!seen.has(m.addr)) { seen.add(m.addr); console.log(' ', m.addr, '<-', m.name) }
      }
      console.log(`(derived ${matches.length} mnemonic addresses)`)
    }
  }
})
