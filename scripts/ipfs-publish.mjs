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

// 4. Remote pin — always-on availability without the local daemon.
//    Two free CID-preserving paths (either one suffices):
//      A) nft.storage:  NFT_STORAGE_API_KEY env (free, CAR upload keeps the exact CID)
//      B) Pinata:        PINATA_JWT env (pinFileToIPFS wraps → NOT our CID; pinByHash
//                        is paid-only; kept for compat but prints the caveat)
//    No key → warn but continue (local pin still works).
const nftKey = (process.env.NFT_STORAGE_API_KEY || '').trim()
const pinataJwt = (process.env.PINATA_JWT || '').trim()
if (nftKey) {
  try {
    // Build the CID-exact CAR once, upload to nft.storage (preserves root CID)
    const car = sh(`ipfs dag export ${addOut}`)
    const upload = await fetch('https://api.nft.storage/upload', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${nftKey}`, 'Content-Type': 'application/car' },
      body: new Blob([car], { type: 'application/car' }),
    })
    const body = await upload.json()
    if (upload.ok && body.ok) console.log(`[ipfs] nft.storage pin OK: ${body.value.cid}`)
    else console.log(`[ipfs] nft.storage warn: ${JSON.stringify(body).slice(0, 120)}`)
  } catch (e) {
    console.log(`[ipfs] nft.storage warn: ${e.message}`)
  }
} else if (pinataJwt) {
  try {
    const res = await fetch(`https://api.pinata.cloud/pinning/pinByHash`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${pinataJwt}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ hashToPin: addOut }),
    })
    const body = await res.json()
    if (res.ok) console.log(`[ipfs] Pinata pin OK: ${addOut}`)
    else console.log(`[ipfs] Pinata pin warn: ${JSON.stringify(body).slice(0, 120)} (pinByHash is paid-only on free plans)`)
  } catch (e) {
    console.log(`[ipfs] Pinata pin warn: ${e.message}`)
  }
} else {
  console.log('[ipfs] no NFT_STORAGE_API_KEY / PINATA_JWT env — skipping remote pin (local pin only)')
}

console.log(`\nIPNS published: ipns://${ipns} → /ipfs/${addOut}`)
console.log(`Remote pinning: nft.storage (NFT_STORAGE_API_KEY) or Pinata (PINATA_JWT).`)
console.log(`With a remote pin the content stays available even when the local daemon is offline.`)


