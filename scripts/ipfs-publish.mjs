// ipfs-publish.mjs — Publish the static build to IPFS and update IPNS.
//
// B (content rail): after `npm run next:build`, this:
//   1. Pins out/ to the local IPFS node (ipfs add -r)
//   2. Publishes /ipfs/<CID> under the fleet IPNS key (ipfs name publish)
//   3. Prints the CID + IPNS name — the value readers resolve via
//      contenthash on supercompute.eth (already set by ipns-contenthash.mjs)
//
// NOTE: this uses the LOCAL ipfs daemon (kubo). For production-grade pinning
// (always-on availability without your machine), add a remote pinning service
// (nft.storage / pinata) — see README note at the bottom.
import { execSync } from 'node:child_process'
import { readdirSync, statSync } from 'node:fs'
import path from 'node:path'

const KEY_NAME = process.env.IPNS_KEY || 'supercompute-content'
const BUILD_DIR = process.env.BUILD_DIR || 'out'

function sh(cmd) {
  return execSync(cmd, { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }).trim()
}

// Quick sanity: the build dir exists and has content
try {
  const entries = readdirSync(BUILD_DIR)
  const total = entries.reduce((n, e) => n + (statSync(path.join(BUILD_DIR, e)).isDirectory() ? 0 : 1), 0)
  if (entries.length === 0) throw new Error('empty')
  console.log(`[ipfs] build dir "${BUILD_DIR}" — ${entries.length} entries`)
} catch {
  console.error(`[ipfs] BUILD_DIR "${BUILD_DIR}" missing or empty — run npm run next:build first`)
  process.exit(1)
}

// 1. Pin the build
console.log(`[ipfs] adding ${BUILD_DIR}/ …`)
const addOut = sh(`ipfs add -r -Q ${BUILD_DIR}`)
console.log(`[ipfs] pinned CID: ${addOut}`)

// 2. Publish under the fleet IPNS key
console.log(`[ipfs] publishing /ipfs/${addOut} → ipns key "${KEY_NAME}" …`)
const nameOut = sh(`ipfs name publish --key=${KEY_NAME} /ipfs/${addOut}`)
const ipnsMatch = nameOut.match(/Published to (.*):/)
const ipns = ipnsMatch ? ipnsMatch[1] : nameOut.trim()
console.log(`[ipfs] IPNS name: ${ipns}`)
console.log(`[ipfs] readers resolve supercompute.eth → contenthash → ipns://${ipns}`)

// 3. Verify the name resolves back to our CID
const resolveOut = sh(`ipfs name resolve ${ipns}`)
const ok = resolveOut.includes(addOut)
console.log(`[ipfs] resolve check: ${ok ? 'PASS' : 'CHECK ' + resolveOut}`)

console.log(`
Pinning note: the local ipfs daemon must stay online for the content to remain
available. For always-on pinning, add a remote service and mirror:
  - nft.storage (free):  nft.storage.upload with the CAR of out/
  - pinata:               pinata.add with the CID
  - OR run 'ipfs pin remote service add' for a pinning partner.
`)
