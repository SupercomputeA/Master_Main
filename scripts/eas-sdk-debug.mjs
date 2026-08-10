// eas-sdk-debug.mjs — use the EAS SDK's CJS build (avoids the lodash ESM interop bug)
// to read the true registered schema UID + attest. CJS require path works fine.
import { createRequire } from 'node:module'
import { createWalletClient, createPublicClient, http, encodeAbiParameters, parseAbiParameters } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { base } from 'viem/chains'

const require = createRequire(import.meta.url)
const { EAS, SchemaRegistry } = require('@ethereum-attestation-service/eas-sdk')

const EAS_ADDR = '0x4200000000000000000000000000000000000021'
const REG_ADDR = '0x4200000000000000000000000000000000000020'
const SCHEMA = 'string slug,string title,uint64 published_at,address author,string authorName'
const PUBLISHER = 'supercompute.eth'

const pk = (process.env.PK || '').replace(/^=/, '')
const account = pk ? privateKeyToAccount(pk.startsWith('0x') ? pk : `0x${pk}`) : null
const wallet = account
  ? createWalletClient({ account, chain: base, transport: http('https://mainnet.base.org') })
  : null
const publicClient = createPublicClient({ chain: base, transport: http('https://mainnet.base.org') })

// SDK signer adapter (wallet client → SDK Signer)
const sdkSigner = account
  ? {
      signMessage: (m) => wallet.signMessage(m),
      getAddress: async () => account.address,
      signTypedData: (m) => wallet.signTypedData(m),
    }
  : null

const cmd = process.argv[2]
const [slug, title, ts] = process.argv.slice(3)

async function main() {
  if (cmd === 'register') {
    const reg = new SchemaRegistry(REG_ADDR)
    reg.connect(sdkSigner)
    const tx = await reg.register({ schema: SCHEMA, resolverAddress: '0x0000000000000000000000000000000000000000', revocable: true })
    console.log('tx:', tx.tx.hash)
    const uid = await tx.wait()
    console.log('SCHEMA UID:', uid)
    console.log('SCHEMA:', SCHEMA)
    return
  }
  if (cmd === 'attest') {
    if (!slug || !title || !ts) throw new Error('attest needs slug title ts')
    const uid = process.env.SCHEMA_ID
    if (!uid) throw new Error('SCHEMA_ID env required')
    const eas = new EAS(EAS_ADDR)
    eas.connect(sdkSigner)
    const data = encodeAbiParameters(parseAbiParameters('string,string,uint64,address,string'), [slug, title, BigInt(ts), account.address, PUBLISHER])
    const tx = await eas.attest({
      schema: uid,
      data: { recipient: account.address, expirationTime: 0n, revocable: true, refUID: '0x' + '0'.repeat(64), data, value: 0n },
    })
    console.log('attest tx:', tx.tx.hash)
    const attUid = await tx.wait()
    console.log('ATTESTATION UID:', attUid)
    return
  }
  if (cmd === 'read') {
    const reg = new SchemaRegistry(REG_ADDR)
    // SDK needs a signer object for reads too, but never signs — pass a dummy
    reg.connect({ signMessage: async () => '0x', getAddress: async () => account.address, signTypedData: async () => '0x' })
    // Try the uid returned earlier + the SDK-computed one
    for (const uid of [process.env.SCHEMA_ID, '0x91d025243592d757661558276ad25f3f92586551caf48b47073c585d9c489840']) {
      if (!uid) continue
      try {
        const s = await reg.getSchema({ uid })
        console.log('getSchema', uid.slice(0, 12), '->', JSON.stringify(s))
      } catch (e) {
        console.log('getSchema', uid.slice(0, 12), 'ERR:', e.message.slice(0, 80))
      }
    }
    return
  }
  console.log('usage: node scripts/eas-sdk-debug.mjs <register|attest|read> [slug title ts]')
  console.log('  PK env required for register/attest; SCHEMA_ID env for attest')
}

main().catch((e) => { console.error('ERR:', e.message); process.exit(1) })
