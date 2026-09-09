// eas-debug-register.mjs — clean register with tx hash + receipt, then getSchema
import { createWalletClient, createPublicClient, http, getContract } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { base } from 'viem/chains'

const REG_ADDR = '0x4200000000000000000000000000000000000020'
const REG_ABI = [
  { type: 'function', name: 'register', stateMutability: 'nonpayable', inputs: [{ name: 'schema', type: 'string' }, { name: 'resolverAddress', type: 'address' }, { name: 'revocable', type: 'bool' }], outputs: [{ name: '', type: 'bytes32' }] },
  { type: 'function', name: 'getSchema', stateMutability: 'view', inputs: [{ name: 'schema', type: 'bytes32' }], outputs: [{ type: 'tuple', components: [{ name: 'uid', type: 'bytes32' }, { name: 'resolver', type: 'address' }, { name: 'revocable', type: 'bool' }, { name: 'schema', type: 'string' }], name: '' }] },
]
const SCHEMA = 'string slug,string title,uint64 published_at,address author,string authorName'
const pk = (process.env.PK || '').replace(/^=/, '')
const account = privateKeyToAccount(pk.startsWith('0x') ? pk : `0x${pk}`)
const wallet = createWalletClient({ account, chain: base, transport: http('https://mainnet.base.org') })
const publicClient = createPublicClient({ chain: base, transport: http('https://mainnet.base.org') })
const reg = getContract({ address: REG_ADDR, abi: REG_ABI, client: { public: publicClient, wallet } })

console.log('signer:', account.address)
try {
  const tx = await reg.write.register([SCHEMA, '0x0000000000000000000000000000000000000000', true])
  console.log('tx:', tx)
  const rcpt = await publicClient.waitForTransactionReceipt({ hash: tx })
  console.log('receipt status:', rcpt.status, '| logs:', rcpt.logs.length)
  // find SchemaRegistered log
  for (const l of rcpt.logs) {
    console.log(' log topics:', l.topics.slice(0, 3).map((t) => t.slice(0, 18)))
    console.log(' log data:', l.data.slice(0, 66))
  }
} catch (e) {
  console.log('register ERR:', (e.shortMessage || e.message).slice(0, 100))
}

// query getSchema with the uid the SDK computes
const { encodeAbiParameters, parseAbiParameters, keccak256 } = await import('viem')
const computed = keccak256(encodeAbiParameters(parseAbiParameters('string,address,bool'), [SCHEMA, '0x0000000000000000000000000000000000000000', true]))
console.log('computed uid:', computed)
const s = await reg.read.getSchema([computed])
console.log('getSchema(computed):', JSON.stringify(s).slice(0, 160))
