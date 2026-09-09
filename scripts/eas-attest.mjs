// eas-attest.mjs — EAS authorship rail for SUPERCOMPUTE articles (SDK version).
//
// D (authorship rail): every article carries an on-chain attestation
// "published by supercompute.eth, authored by Quanta Sovereigna".
//
//   register   → register the authorship schema on Base (one-time)
//   attest     → attest an article (slug + title hash + published_at)
//   query      → list recent authorship attestations (read-only, no key)
//
// EAS on Base (official deploy): SchemaRegistry 0x4200...0020, EAS 0x4200...0021
// Signer = fleet GATEWAY_WALLET_UNRESTRICTED (0xa3f4...7365). Key from vault:
//   source ~/.hermes/profiles/supercompute/bin/bw-unlock
//   PK=$(bw-audit list items --search imported_top_level --session "$BW_SESSION" \
//       | python3 -c "import sys,json;d=json.load(sys.stdin);a=d['data'] if isinstance(d,dict) and 'data' in d else d;print([f.get('value','').strip().lstrip('=') for x in a for f in (x.get('fields') or []) if f.get('name')=='GATEWAY_WALLET_UNRESTRICTED_KEY'][0])")
import { createWalletClient, createPublicClient, http, encodeAbiParameters, parseAbiParameters, keccak256 } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { base } from 'viem/chains'
import { EAS, SchemaRegistry } from '@ethereum-attestation-service/eas-sdk'

const EAS_ADDR = '0x4200000000000000000000000000000000000021'
const REG_ADDR = '0x4200000000000000000000000000000000000020'
const PUBLISHER_NAME = 'supercompute.eth'
const SCHEMA = 'string slug,string title,uint64 published_at,address author,string authorName'

const [cmd, ...rest] = process.argv.slice(2)

function signer() {
  const pk = process.env.PK
  if (!pk) throw new Error('PK env required — GATEWAY_WALLET_UNRESTRICTED_KEY from vault')
  return privateKeyToAccount(pk.startsWith('0x') ? pk : `0x${pk}`)
}

async function run() {
  if (!cmd) {
    console.log('usage: node scripts/eas-attest.mjs <register|attest|query>')
    console.log('  register                     — register authorship schema (one-time, needs PK)')
    console.log('  attest <slug> <title> <ts>   — attest an article (needs PK)')
    console.log('  query <uid>                  — read an attestation (no key)')
    process.exit(0)
  }

  const account = signer()
  const wallet = createWalletClient({ account, chain: base, transport: http('https://mainnet.base.org') })
  const publicClient = createPublicClient({ chain: base, transport: http('https://mainnet.base.org') })
  console.log(`[eas] signer: ${account.address} (Base)`)

  if (cmd === 'register') {
    const reg = new SchemaRegistry(REG_ADDR)
    reg.connect({ signer: account, chain: base, address: REG_ADDR } )
    // SDK connect expects a signer; use the low-level wallet-signer bridge
    const sdkSigner = { signMessage: (m) => wallet.signMessage(m), getAddress: async () => account.address }
    reg.connect(sdkSigner)
    const tx = await reg.register({ schema: SCHEMA, resolverAddress: '0x0000000000000000000000000000000000000000', revocable: true })
    console.log(`[eas] tx: ${tx.tx.hash}`)
    const uid = await tx.wait()
    console.log(`[eas] schema registered: ${uid}`)
    console.log(`[eas] schema: ${SCHEMA}`)
    return
  }

  if (cmd === 'attest') {
    const [slug, title, ts] = rest
    if (!slug || !title || !ts) throw new Error('attest needs: slug title unix-ts')
    const uid = process.env.SCHEMA_ID
    if (!uid) throw new Error('SCHEMA_ID env required (the schema uid from register)')
    const eas = new EAS(EAS_ADDR)
    const sdkSigner = { signMessage: (m) => wallet.signMessage(m), getAddress: async () => account.address }
    eas.connect(sdkSigner)
    const data = encodeAbiParameters(
      parseAbiParameters('string,string,uint64,address,string'),
      [slug, title, BigInt(ts), account.address, PUBLISHER_NAME]
    )
    const tx = await eas.attest({
      schema: uid,
      data: {
        recipient: account.address,
        expirationTime: 0n,
        revocable: true,
        refUID: '0x' + '0'.repeat(64),
        data,
        value: 0n,
      },
    })
    console.log(`[eas] tx: ${tx.tx.hash}`)
    const attUid = await tx.wait()
    console.log(`[eas] attestation: ${attUid}`)
    console.log(`[eas] slug: ${slug} | title: ${title} | published_at: ${ts}`)
    console.log(`[eas] verify: node scripts/eas-attest.mjs query ${attUid}`)
    return
  }

  if (cmd === 'query') {
    const attUid = rest[0]
    if (!attUid) throw new Error('query needs an attestation uid')
    const eas = new EAS(EAS_ADDR)
    const attestation = await eas.getAttestation(attUid)
    console.log('attestation:', JSON.stringify({
      uid: attestation.uid, schema: attestation.schema, time: attestation.time.toString(),
      recipient: attestation.recipient, attester: attestation.attester, data: attestation.data,
    }, null, 2))
    return
  }

  throw new Error(`unknown command: ${cmd}`)
}

run().catch((e) => { console.error('ERR:', e.message); process.exit(1) })
