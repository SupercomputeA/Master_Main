// ipns-contenthash.mjs — Prepare the ENS content layer for supercompute.eth.
//
// B (content rail): contenthash → IPNS. This script:
//   1. Ensures a fleet IPNS key exists (ipfs key gen) — or loads it
//   2. Prints the IPNS peer id (the part after ipns://)
//   3. Computes the ENS contenthash for ipns://<peer-id> (EIP-1577 format)
//   4. Prints the exact ENS setContenthash calldata for supercompute.eth
//      (the owner signs this tx — human gate, custody via security)
//
// No on-chain writes happen here. Everything is local + readable.
//
// EIP-1577 contenthash: 0x e3 01 <varint> <codec> <varint> <payload>
//   - first byte 0xe3 = contenthash prefix
//   - 0x01 = IPNS namespace (ENSIP-7 / content-hash spec: ipns-ns = 0x01)
//   - codec 0x72 = libp2p-key multicodec
//   - payload = CIDv1 bytes (codec 0x72, identity multihash of ed25519 pubkey)
import { execSync } from 'node:child_process'
import { CID } from 'multiformats/cid'
import { base58btc } from 'multiformats/bases/base58'
import jsSha3 from 'js-sha3'
const { keccak256 } = jsSha3

// ENS namehash (EIP-137): keccak256 of the sequence of label hashes
function ensNamehash(name) {
  let node = new Uint8Array(32)
  if (!name) return '0x' + Buffer.from(node).toString('hex')
  const labels = name.split('.')
  for (let i = labels.length - 1; i >= 0; i--) {
    const labelHash = keccak256.array(labels[i])
    const concat = new Uint8Array(64)
    concat.set(node, 0)
    concat.set(labelHash, 32)
    node = keccak256.array(concat)
  }
  return '0x' + Buffer.from(node).toString('hex')
}

const KEY_NAME = process.env.IPNS_KEY || 'supercompute-content'

function sh(cmd) {
  return execSync(cmd, { encoding: 'utf-8' }).trim()
}

// ULEB128 varint (multiformats-compatible)
function varint(n) {
  const out = []
  let v = n
  do {
    let b = v & 0x7f
    v >>>= 7
    if (v) b |= 0x80
    out.push(b)
  } while (v)
  return out
}

// 1. Ensure IPNS key exists (base58btc multibase output: z5Aan...)
let peerId
try {
  peerId = sh(`ipfs key list -l --ipns-base=base58btc | grep "${KEY_NAME}" | awk '{print $1}'`)
} catch {
  peerId = ''
}
if (!peerId) {
  console.log(`[ipns] key "${KEY_NAME}" missing — generating…`)
  peerId = sh(`ipfs key gen --type=ed25519 ${KEY_NAME}`)
  console.log(`[ipns] generated: ${peerId}`)
} else {
  console.log(`[ipns] existing key: ${peerId}`)
}

// 2. Decode the peer id → CIDv1 bytes (codec 0x72 libp2p-key, identity multihash)
let cidBytes
try {
  const cid = CID.decode(base58btc.decode(peerId))
  cidBytes = cid.bytes
  console.log(`[ens] peer id decoded: CIDv${cid.version}, codec 0x${cid.code.toString(16)}, multihash size ${cid.multihash.size}`)
} catch (e) {
  console.error(`[ens] FAILED to decode peer id as base58btc CID: ${e.message.slice(0, 120)}`)
  process.exit(1)
}

// 3. Build EIP-1577 contenthash for IPNS
// 0xe3 01 <varint-len-cid> <cid-bytes>  (0x01 = ipns-ns; CID carries codec 0x72 inside)
const body = Buffer.concat([Buffer.from([0x01]), Buffer.from(varint(cidBytes.length)), cidBytes])
const contenthash = '0x' + Buffer.concat([Buffer.from([0xe3]), body]).toString('hex')
console.log(`\n[ens] ipns uri:    ipns://${peerId.replace(/^z/, '')}`)
console.log(`[ens] contenthash: ${contenthash}`)

// 4. Validate: decode back and confirm the CID round-trips
try {
  const hex = contenthash.slice(2)
  const b = Buffer.from(hex, 'hex')
  const chPrefix = b.subarray(0, 2).toString('hex')
  const cidBack = CID.decode(b.subarray(3))
  console.log(`[ens] round-trip:  PASS (prefix ${chPrefix}, CIDv${cidBack.version} codec 0x${cidBack.code.toString(16)})`)
  console.log(`[ens] verify URI:  ipns://${cidBack.toString()}`)
} catch (e) {
  console.error(`[ens] round-trip FAILED: ${e.message.slice(0, 120)}`)
  process.exit(1)
}

console.log(`\n[ens] owner (0x5056a0729a7860a0c6f63575e74a51d5c2b85cf1) signs one tx via`)
console.log(`  ENS PublicResolver (0x231b0Ee14048e9dCcD1d247744d114aBCEB5E8E8):`)
console.log(`  setContenthash(bytes32 node, bytes calldata hash)`)
console.log(`  node = namehash('supercompute.eth') = ${ensNamehash('supercompute.eth')}`)
console.log(`  hash = ${contenthash}`)

console.log(`\n[ens] custody: back up the IPNS key (security/Bitwarden):`)
console.log(`  ipfs key export ${KEY_NAME} -o supercompute-content.key`)
console.log(`[ens] to publish a new build: pin CID → ipfs name publish /ipfs/<CID> --key=${KEY_NAME}`)
