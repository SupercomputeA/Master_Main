// derive-address.mjs — derives the address for a private key passed via env.
// Prints ONLY the derived address. Never prints the key.
import { privateKeyToAccount } from 'viem/accounts'

let pk = process.env.PK || ''
pk = pk.trim().replace(/^=/, '')
if (!pk.startsWith('0x')) pk = '0x' + pk
try {
  const acct = privateKeyToAccount(pk)
  console.log(acct.address)
} catch (e) {
  console.error('DERIVE_ERR:', e.message.slice(0, 80))
  process.exit(1)
}
