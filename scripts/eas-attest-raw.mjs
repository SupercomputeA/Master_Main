// eas-attest-raw.mjs — attest an article via raw viem with the CONFIRMED schema UID.
// Usage: PK=<key> TS=<unix> node scripts/eas-attest-raw.mjs <slug> <title>
import { createWalletClient, createPublicClient, http, getContract, encodeAbiParameters, parseAbiParameters } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { base } from 'viem/chains'

const EAS_ADDR = '0x4200000000000000000000000000000000000021'
const SCHEMA_UID = process.env.SCHEMA_ID || '0xbe907fb7f1621b3fd73d8c160b42d2d1acf8450cc7e14e2fe72d5681131a3f11'
const PUBLISHER = 'supercompute.eth'

const EAS_ABI = [
  { type: 'function', name: 'attest', stateMutability: 'payable', inputs: [{ name: 'request', type: 'tuple', components: [{ name: 'schema', type: 'bytes32' }, { name: 'data', type: 'tuple', components: [{ name: 'recipient', type: 'address' }, { name: 'expirationTime', type: 'uint64' }, { name: 'revocable', type: 'bool' }, { name: 'refUID', type: 'bytes32' }, { name: 'data', type: 'bytes' }, { name: 'value', type: 'uint256' }] }] }], outputs: [{ name: '', type: 'bytes32' }] },
  { type: 'event', name: 'Attested', inputs: [{ indexed: true, name: 'recipient', type: 'address' }, { indexed: true, name: 'attester', type: 'address' }, { name: 'uid', type: 'bytes32' }, { name: 'schema', type: 'bytes32' }] },
]

const [slug, title] = process.argv.slice(2)
if (!slug || !title) { console.error('usage: PK=.. TS=.. node scripts/eas-attest-raw.mjs <slug> <title>'); process.exit(1) }
const ts = process.env.TS || String(Math.floor(Date.now() / 1000))

const pk = (process.env.PK || '').replace(/^=/, '')
if (!pk) { console.error('PK env required'); process.exit(1) }
const account = privateKeyToAccount(pk.startsWith('0x') ? pk : `0x${pk}`)
const wallet = createWalletClient({ account, chain: base, transport: http('https://mainnet.base.org') })
const publicClient = createPublicClient({ chain: base, transport: http('https://mainnet.base.org') })
const eas = getContract({ address: EAS_ADDR, abi: EAS_ABI, client: { public: publicClient, wallet } })

const data = encodeAbiParameters(parseAbiParameters('string,string,uint64,address,string'), [slug, title, BigInt(ts), account.address, PUBLISHER])
console.log('signer:', account.address)
console.log('schema:', SCHEMA_UID)
console.log('article:', slug, '|', title, '| ts', ts)

try {
  const tx = await eas.write.attest([{ schema: SCHEMA_UID, data: { recipient: account.address, expirationTime: 0n, revocable: true, refUID: '0x' + '0'.repeat(64), data, value: 0n } }])
  console.log('attest tx:', tx)
  const rcpt = await publicClient.waitForTransactionReceipt({ hash: tx })
  console.log('status:', rcpt.status, '| gasUsed:', rcpt.gasUsed.toString(), '| logs:', rcpt.logs.length)
  for (const l of rcpt.logs) {
    console.log(' log addr:', l.address)
    console.log(' log topics:', l.topics.slice(0, 4).map((t) => t.slice(0, 20)))
    console.log(' log data:', l.data.slice(0, 130))
  }
} catch (e) {
  console.log('attest ERR:', (e.shortMessage || e.message).slice(0, 200))
}
