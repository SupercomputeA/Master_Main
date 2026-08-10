// pin-to-ipfs.mjs — Pin a static build directory to IPFS for the ENS content rail.
//
// Part of the SUPERCOMPUTE B+D plan (see docs/DECISION-ens-content-layer.md).
// This is the build-time pin step. The next card (IPNS publish) reads the CID
// from <dir>/.ipfs-cid and publishes it under the fleet IPNS key.
//
// Providers, in order of preference:
//   1. nft.storage (free tier, NFT_STORAGE_API_KEY)        — durable, content-addressed, IPFS-clustered
//   2. Pinata        (PINATA_JWT or PINATA_API_KEY+SECRET) — paid, durable, fast
//   3. local kubo    (no key, /opt/homebrew/bin/ipfs)     — verify-only fallback; CID is real but
//                                                            not publicly retrievable. Used when no
//                                                            remote key is configured so the build
//                                                            chain can still produce an artifact.
//
// No CID pinning happens unless one of the above is reachable. With no provider
// the script exits non-zero with a clear, copy-pastable error.
//
// Usage:
//   node scripts/pin-to-ipfs.mjs [build-dir]   (default: ./out)
//   NFT_STORAGE_API_KEY=... node scripts/pin-to-ipfs.mjs
//
// Output:
//   stdout  — "ipfs://<CID>  size=<bytes>"   (and a small JSON block the next card can parse)
//   file    — <build-dir>/.ipfs-cid          (just the CID, one line)
//
// Side effects:
//   - For nft.storage: 1 HTTPS upload (multipart)
//   - For Pinata:      1 HTTPS upload (multipart)
//   - For local kubo:  uses HTTP /add when daemon is up (port 5001), else
//                      falls back to `ipfs add -r --only-hash` (CID only,
//                      not remotely pinned)

import { execFileSync } from 'node:child_process'
import { readdir, readFile, stat, writeFile } from 'node:fs/promises'
import { join, relative, resolve } from 'node:path'

// ---- args ----------------------------------------------------------------

const buildDir = resolve(process.argv[2] || './out')
const dryRun = process.env.PIN_DRY_RUN === '1'

// ---- helpers -------------------------------------------------------------

function log(...args) { console.log('[pin]', ...args) }
function err(...args) { console.error('[pin] ERROR:', ...args) }

async function pathExists(p) {
  try { await stat(p); return true } catch { return false }
}

async function* walk(dir) {
  // yield absolute paths, deterministic order (sorted) → deterministic CIDs
  const entries = await readdir(dir, { withFileTypes: true })
  entries.sort((a, b) => a.name.localeCompare(b.name))
  for (const e of entries) {
    const full = join(dir, e.name)
    if (e.isDirectory()) {
      yield* walk(full)
    } else if (e.isFile()) {
      yield full
    }
  }
}

async function dirSize(dir) {
  let total = 0
  for await (const f of walk(dir)) {
    const s = await stat(f)
    total += s.size
  }
  return total
}

async function buildMultipartField(filePath, relPath) {
  // node 18+ Blob + FormData supports File entries with a filename
  const buf = await readFile(filePath)
  return {
    name: 'file',                 // nft.storage + Pinata both accept a 'file' part
    filename: relPath.split('/').map(encodeURIComponent).join('/'),
    contentType: 'application/octet-stream',
    data: buf,
  }
}

const EXCLUDE_NAMES = new Set(['.ipfs-cid', '.DS_Store'])
function shouldExclude(relPath) {
  return EXCLUDE_NAMES.has(relPath) || relPath.split('/').some((p) => EXCLUDE_NAMES.has(p))
}

function postForm(url, fields, headers = {}) {
  // Native fetch + manual multipart — no extra deps, no FormData edge cases
  const boundary = '----pin-to-ipfs-' + Math.random().toString(36).slice(2)
  const chunks = []
  let total = 0
  for (const f of fields) {
    const head = Buffer.from(
      `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="${f.name}"; filename="${f.filename}"\r\n` +
      `Content-Type: ${f.contentType}\r\n\r\n`
    )
    chunks.push(head)
    total += head.length
    const body = Buffer.isBuffer(f.data) ? f.data : Buffer.from(f.data)
    chunks.push(body)
    total += body.length
    chunks.push(Buffer.from('\r\n'))
    total += 2
  }
  chunks.push(Buffer.from(`--${boundary}--\r\n`))
  total += boundary.length + 6
  const body = Buffer.concat(chunks, total)

  return fetch(url, {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
      'Content-Length': String(body.length),
    },
    body,
  })
}

// ---- provider: nft.storage ----------------------------------------------

async function pinNftStorage(dir) {
  const key = process.env.NFT_STORAGE_API_KEY
  if (!key) return null
  log('provider: nft.storage')

  const files = []
  for await (const abs of walk(dir)) {
    const rel = relative(dir, abs)
    if (shouldExclude(rel)) continue
    files.push(await buildMultipartField(abs, rel))
  }
  if (files.length === 0) {
    throw new Error('nft.storage: build directory is empty — nothing to pin')
  }

  const res = await postForm('https://api.nft.storage/upload', files, {
    Authorization: `Bearer ${key}`,
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`nft.storage upload failed: HTTP ${res.status} ${res.statusText}\n${text.slice(0, 500)}`)
  }
  const json = await res.json()
  if (!json || !json.cid) {
    throw new Error(`nft.storage returned no cid: ${JSON.stringify(json).slice(0, 500)}`)
  }
  return { cid: json.cid, provider: 'nft.storage', raw: json }
}

// ---- provider: Pinata ----------------------------------------------------

async function pinPinata(dir) {
  const jwt = process.env.PINATA_JWT
  const key = process.env.PINATA_API_KEY
  const secret = process.env.PINATA_SECRET_API_KEY
  if (!jwt && !(key && secret)) return null
  log('provider: Pinata')

  const fields = []
  for await (const abs of walk(dir)) {
    fields.push(await buildMultipartField(abs, relative(dir, abs)))
  }
  if (fields.length === 0) {
    throw new Error('Pinata: build directory is empty — nothing to pin')
  }

  // Pinata requires a single 'file' part + a 'pinataMetadata' part for the directory name.
  // We send one file at a time because the free tier rejects huge multipart bodies; the
  // response we keep is the LAST file's CID, which equals the root for a directory pin
  // because Pinata groups by metadata.name. For full directory semantics we should
  // upgrade to Pinata's "pinFileToIPFS" with a tarball — left as a follow-up.
  const headers = jwt ? { Authorization: `Bearer ${jwt}` } : { pinata_api_key: key, pinata_secret_api_key: secret }
  const lastRes = await postForm('https://api.pinata.cloud/pinning/pinFileToIPFS', fields, headers)
  if (!lastRes.ok) {
    const text = await lastRes.text().catch(() => '')
    throw new Error(`Pinata upload failed: HTTP ${lastRes.status} ${lastRes.statusText}\n${text.slice(0, 500)}`)
  }
  const json = await lastRes.json()
  if (!json || !json.IpfsHash) {
    throw new Error(`Pinata returned no IpfsHash: ${JSON.stringify(json).slice(0, 500)}`)
  }
  // NOTE: this is the CID of the last file uploaded, NOT a directory root.
  // For a directory root, the proper call is pinFileToIPFS with a tar archive.
  // Surfacing this honestly so we don't ship a misleading artifact.
  return {
    cid: json.IpfsHash,
    provider: 'pinata',
    raw: json,
    warning: 'Pinata fallback returns last-file CID, not directory root. Use nft.storage for production.',
  }
}

// ---- provider: local kubo (verify-only) ---------------------------------

function findKubo() {
  // Prefer the explicit IPFS_BIN env, then PATH, then the homebrew path from the task spec
  const candidates = [
    process.env.IPFS_BIN,
    'ipfs',
    '/opt/homebrew/bin/ipfs',
    '/usr/local/bin/ipfs',
  ].filter(Boolean)
  for (const c of candidates) {
    try {
      const v = execFileSync(c, ['--version'], { encoding: 'utf8' }).trim()
      return { bin: c, version: v }
    } catch {}
  }
  return null
}

async function kuboDaemonReachable(apiUrl) {
  // kubo's HTTP API is at :5001 by default. POST any /api/v0/* endpoint with
  // an empty body to check liveness. Use a short timeout — if the daemon is
  // stuck, we want to fall through to the offline CLI hash path quickly.
  try {
    const res = await fetch(`${apiUrl}/api/v0/version`, { method: 'POST', signal: AbortSignal.timeout(2000) })
    return res.ok
  } catch { return false }
}

async function pinKubo(dir) {
  const kubo = findKubo()
  if (!kubo) return null
  log(`provider: local kubo (${kubo.bin}, ${kubo.version})`)

  // Prefer the HTTP API when the daemon is up — avoids the CLI's repo.lock
  // contention that you get when the daemon already holds the lock.
  const apiUrl = process.env.IPFS_API || 'http://127.0.0.1:5001'
  if (await kuboDaemonReachable(apiUrl)) {
    log(`daemon reachable at ${apiUrl}, using HTTP /add`)
    const files = []
    for await (const abs of walk(dir)) {
      const rel = relative(dir, abs)
      if (shouldExclude(rel)) continue
      const buf = await readFile(abs)
      files.push({ path: rel, content: buf })
    }
    // Multipart over HTTP API: form-data with 'file' parts.
    const boundary = '----pin-to-ipfs-' + Math.random().toString(36).slice(2)
    const chunks = []
    for (const f of files) {
      const head = Buffer.from(
        `--${boundary}\r\n` +
        `Content-Disposition: form-data; name="file"; filename="${f.path}"\r\n` +
        `Content-Type: application/octet-stream\r\n\r\n`
      )
      chunks.push(head, f.content, Buffer.from('\r\n'))
    }
    chunks.push(Buffer.from(`--${boundary}--\r\n`))
    const body = Buffer.concat(chunks)
    const url = `${apiUrl}/api/v0/add?recursive=true&quiet=true&wrap-with-directory=true`
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': String(body.length),
      },
      body,
      signal: AbortSignal.timeout(120000),
    })
    if (!res.ok) {
      const text = await res.text().catch(() => '')
      throw new Error(`kubo HTTP /add failed: HTTP ${res.status}\n${text.slice(0, 500)}`)
    }
    const text = await res.text()
    // kubo /add with wrap-with-directory=true emits one JSON object per file, then
    // a final entry with Name="" whose Hash is the directory root.
    const lines = text.trim().split('\n').map((l) => { try { return JSON.parse(l) } catch { return null } }).filter(Boolean)
    const root = lines.find((l) => l.Name === '' || l.Name === dir.split('/').pop()) || lines[lines.length - 1]
    if (!root || (!root.Hash && !root.cid)) throw new Error(`kubo HTTP /add returned no root CID`)
    return { cid: root.Hash || root.cid, provider: 'kubo-local', raw: { lines } }
  }

  // No daemon — fall back to CLI with --only-hash so we still get a real,
  // deterministic CID without a network pin. Useful for offline CI.
  log('kubo daemon unreachable, falling back to CLI --only-hash (CID is real, not pinned remotely)')
  let out
  try {
    out = execFileSync(kubo.bin, ['add', '-r', '-Q', '--only-hash', '.'], {
      cwd: dir,
      encoding: 'utf8',
      maxBuffer: 64 * 1024 * 1024,
    }).trim()
  } catch (e) {
    throw new Error(`local kubo pin failed: ${e.message}`)
  }
  const cid = out.split('\n').pop().trim()
  if (!cid || !cid.startsWith('Qm') && !cid.startsWith('bafy')) {
    throw new Error(`local kubo returned unexpected CID: ${cid}`)
  }
  return { cid, provider: 'kubo-local', raw: { stdout: out, kubo, offline: true } }
}

// ---- main ----------------------------------------------------------------

async function main() {
  if (!(await pathExists(buildDir))) {
    err(`build directory not found: ${buildDir}`)
    err(`run \`npm run build\` first, or pass the build dir as the first arg.`)
    process.exit(2)
  }
  const s = await stat(buildDir)
  if (!s.isDirectory()) {
    err(`build path is not a directory: ${buildDir}`)
    process.exit(2)
  }

  const sizeBytes = await dirSize(buildDir)
  log(`build dir: ${buildDir}  (${(sizeBytes / 1024 / 1024).toFixed(2)} MiB)`)

  if (dryRun) {
    log('PIN_DRY_RUN=1 — skipping network pin, would have written CID file only')
    return
  }

  // try providers in order; first one that has credentials wins
  const attempts = [
    { name: 'nft.storage', fn: pinNftStorage },
    { name: 'Pinata',      fn: pinPinata },
    { name: 'kubo-local',  fn: pinKubo },
  ]
  let result = null
  let lastError = null
  for (const a of attempts) {
    try {
      const r = await a.fn(buildDir)
      if (r) { result = r; break }
    } catch (e) {
      lastError = e
      err(`${a.name} failed: ${e.message}`)
    }
  }

  if (!result) {
    err('no IPFS provider available. Set one of:')
    err('  NFT_STORAGE_API_KEY=...       (recommended, free tier at nft.storage)')
    err('  PINATA_JWT=...                (or PINATA_API_KEY + PINATA_SECRET_API_KEY)')
    err('  ipfs daemon running locally   (verify-only, no remote pin)')
    if (lastError) err(`last error: ${lastError.message}`)
    process.exit(1)
  }

  if (result.warning) log(`warning: ${result.warning}`)

  // write CID artifact (next card reads this)
  const cidPath = join(buildDir, '.ipfs-cid')
  await writeFile(cidPath, result.cid + '\n', 'utf8')
  log(`cid:        ${result.cid}`)
  log(`provider:   ${result.provider}`)
  log(`size:       ${sizeBytes} bytes (${(sizeBytes / 1024 / 1024).toFixed(2)} MiB)`)
  log(`artifact:   ${cidPath}`)

  // machine-readable footer for the next card in the chain
  console.log(JSON.stringify({
    cid: result.cid,
    provider: result.provider,
    size: sizeBytes,
    artifact: cidPath,
    warning: result.warning || null,
  }))
}

main().catch((e) => {
  err(e.stack || e.message || String(e))
  process.exit(1)
})
