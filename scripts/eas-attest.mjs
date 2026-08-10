// eas-attest.mjs — EAS authorship rail for SUPERCOMPUTE articles.
//
// D (authorship rail): every article carries an on-chain attestation
// "published by supercompute.eth, authored by Quanta Sovereigna".
//
//   register   → register the authorship schema on Base (one-time)
//   attest     → attest an article (slug + title hash + published_at)
//   query      → list recent authorship attestations (read-only, no key)
//
// EAS on Base (official deploy): SchemaRegistry 0x4200...0020, EAS 0x4200...0021
// Signer key comes from env (SECURITY: PRIVATE_KEY — custody via security profile /
// Bitwarden; never hardcode, never commit).
import { createWalletClient, createPublicClient, http, getContract } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { base } from 'viem/chains'

const EAS_ADDR = '0x4200000000000000000000000000000000000021'
const REG_ADDR = '0x4200000000000000000000000000000000000020'
const PUBLISHER_NAME = 'supercompute.eth'

// Article authorship schema (string slug, string title, uint64 published_at,
// address author, string authorName). resolve: true — recipient is the author.
const SCHEMA = 'string slug,string title,uint64 published_at,address author,string authorName'

const [cmd, ...rest] = process.argv.slice(2)
const publicClient = createPublicClient({ chain: base, transport: http() })

function signerClient() {
  const pk = process.env.PRIVATE_KEY
  if (!pk) throw new Error('PRIVATE_KEY env required (security custody). Run: infisical run --env=dev -- node scripts/eas-attest.mjs …')
  const account = privateKeyToAccount(pk.startsWith('0x') ? pk : `0x${pk}`)
  return createWalletClient({ account, chain: base, transport: http() })
}

// Minimal EAS ABI slices (register + attest + uid lookup)
const REG_ABI = [
  { type: 'function', name: 'register', stateMutability: 'nonpayable', inputs: [{ name: 'schema', type: 'string' }, { name: 'resolverAddress', type: 'address' }, { name: 'revocable', type: 'bool' }], outputs: [{ name: '', type: 'bytes32' }] },
  { type: 'function', name: 'getSchema', stateMutability: 'view', inputs: [{ name: 'schema', type: 'bytes32' }], outputs: [{ type: 'tuple', components: [{ name: 'uid', type: 'bytes32' }, { name: 'resolver', type: 'address' }, { name: 'revocable', type: 'bool' }, { name: 'schema', type: 'string' }], name: '' }] },
]
const EAS_ABI = [
  { type: 'function', name: 'attest', stateMutability: 'payable', inputs: [{ name: 'request', type: 'tuple', components: [{ name: 'schema', type: 'bytes32' }, { name: 'data', type: 'tuple', components: [{ name: 'recipient', type: 'address' }, { name: 'expirationTime', type: 'uint64' }, { name: 'revocable', type: 'bool' }, { name: 'refUID', type: 'bytes32' }, { name: 'data', type: 'bytes' }, { name: 'value', type: 'uint256' }] }] }], outputs: [{ name: '', type: 'bytes32' }] },
  { type: 'function', name: 'getAttestation', stateMutability: 'view', inputs: [{ name: 'uid', type: 'bytes32' }], outputs: [{ type: 'tuple', components: [{ name: 'uid', type: 'bytes32' }, { name: 'schema', type: 'bytes32' }, { name: 'time', type: 'uint64' }, { name: 'expirationTime', type: 'uint64' }, { name: 'revocationTime', type: 'uint64' }, { name: 'refUID', type: 'bytes32' }, { name: 'recipient', type: 'address' }, { name: 'attester', type: 'address' }, { name: 'revocable', type: 'bool' }, { name: 'data', type: 'bytes' }], name: '' }] },
]

// abi.encode for the schema's data tuple
import { encodeAbiParameters, parseAbiParameters } from 'viem'
function encodeArticle(slug, title, publishedAt, author, authorName) {
  return encodeAbiParameters(
    parseAbiParameters('string,string,uint64,address,string'),
    [slug, title, BigInt(publishedAt), author, authorName]
  )
}

async function run() {
  if (!cmd) {
    console.log('usage: node scripts/eas-attest.mjs <register|attest|query>')
    console.log('  register                     — register authorship schema (one-time, needs PRIVATE_KEY)')
    console.log('  attest <slug> <title> <ts>   — attest an article (needs PRIVATE_KEY)')
    console.log('  query <uid>                  — read an attestation (no key)')
    process.exit(0)
  }

  if (cmd === 'query') {
    const uid = rest[0]
    if (!uid) throw new Error('query needs an attestation uid')
    const eas = getContract({ address: EAS_ADDR, abi: EAS_ABI, client: { public: publicClient } })
    const a = await eas.read.getAttestation([uid])
    console.log('attestation:', JSON.stringify({ uid, schema: a.schema, time: a.time.toString(), recipient: a.recipient, attester: a.attester, data: a.data }, null, 2))
    return
  }

  const wallet = signerClient()
  const account = wallet.account
  console.log(`[eas] signer: ${account.address} (Base)`)

  if (cmd === 'register') {
    const reg = getContract({ address: REG_ADDR, abi: REG_ABI, client: { public: publicClient, wallet } })
    const schemaId = await reg.write.register([SCHEMA, '0x0000000000000000000000000000000000000000', true])
    console.log(`[eas] schema registered: ${schemaId}`)
    console.log(`[eas] schema: ${SCHEMA}`)
    return
  }

  if (cmd === 'attest') {
    const [slug, title, ts] = rest
    if (!slug || !title || !ts) throw new Error('attest needs: slug title unix-ts')
    const eas = getContract({ address: EAS_ADDR, abi: EAS_ABI, client: { public: publicClient, wallet } })
    // recipient = signer (the publishing account); author field = supercompute.eth owner
    const data = encodeArticle(slug, title, Number(ts), account.address, PUBLISHER_NAME)
    const uid = await eas.write.attest([{
      schema: process.env.SCHEMA_ID || (await schemaId()),
      data: { recipient: account.address, expirationTime: 0n, revocable: true, refUID: '0x' + '0'.repeat(64), data, value: 0n },
    }])
    console.log(`[eas] attestation: ${uid}`)
    console.log(`[eas] slug: ${slug} | title: ${title} | published_at: ${ts}`)
    console.log(`[eas] verify: node scripts/eas-attest.mjs query ${uid}`)
    return
  }

  throw new Error(`unknown command: ${cmd}`)
}

async function schemaId() {
  // deterministic schema uid per EAS spec: keccak256(schema, resolver, revocable)
  const { keccak256, encodeAbiParameters, parseAbiParameters } = await import('viem')
  const reg = getContract({ address: REG_ADDR, abi: REG_ABI, client: { public: publicClient } })
  // getSchema needs a uid; we must derive it. EAS uid = keccak256(abi.encode(schema, resolver, revocable))
  const hash = keccak256(encodeAbiParameters(parseAbiParameters('string,address,bool'), [SCHEMA, '0x0000000000000000000000000000000000000000', true]))
  try { await reg.read.getSchema([hash]); console.log(`[eas] schema exists: ${hash}`) } catch { console.log(`[eas] schema NOT registered yet — run register first: ${hash}`) }
  return hash
}

run().catch((e) => { console.error('ERR:', e.message); process.exit(1) })
