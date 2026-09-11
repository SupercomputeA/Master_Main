// scripts/test-subscriber-funnel.mjs
// End-to-end subscriber funnel test against a LIVE deployment:
//   SIWE login → POST /api/subscribers → GET /api/subscribers/me → /dashboard HTML.
// Uses viem to create a deterministic throwaway wallet. No browser, no MetaMask.
//
// Usage:
//   node scripts/test-subscriber-funnel.mjs                                  # https://supercompute.io
//   TEST_SITE=https://supercompute.pages.dev node scripts/test-subscriber-funnel.mjs
//
// Exit code 0 = every step passed. Any failed assertion exits 1.
//
// The wallet is deterministic on purpose: re-running the script UPDATES the same
// subscriber row (the endpoint is idempotent on wallet), so it never litters the
// table with throwaway rows.

import { createWalletClient, http, recoverMessageAddress } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { base } from 'viem/chains'

const SITE = (process.env.TEST_SITE || 'https://supercompute.io').replace(/\/$/, '')
const ORIGIN = process.env.TEST_ORIGIN || SITE
const headers = { 'Content-Type': 'application/json', Origin: ORIGIN, Referer: `${ORIGIN}/subscribe` }
const TIER = process.env.TEST_TIER || 'free'

let failures = 0
function check(label, ok, detail = '') {
  console.log(`   ${ok ? '✅' : '❌'} ${label}${detail ? ` — ${detail}` : ''}`)
  if (!ok) failures++
  return ok
}

async function main() {
  console.log(`=== SUPERCOMPUTE Subscriber Funnel Test ===\nSite: ${SITE}\nTier: ${TIER}\n`)

  // Deterministic throwaway wallet (distinct from test-auth-flow.mjs's 0xab key)
  const account = privateKeyToAccount(`0x${'cd'.repeat(32)}`)
  const wallet = createWalletClient({ account, chain: base, transport: http() })
  const address = account.address
  console.log(`Wallet: ${address}`)

  console.log('\n1. GET /api/auth/nonce')
  const nonceRes = await fetch(`${SITE}/api/auth/nonce`, { headers })
  const nonceData = await nonceRes.json().catch(() => ({}))
  if (!check('nonce issued', nonceRes.ok && !!nonceData.nonce, `HTTP ${nonceRes.status}`)) return

  console.log('\n2. GET /api/auth/message')
  const msgRes = await fetch(`${SITE}/api/auth/message?address=${address}&nonce=${nonceData.nonce}`, { headers })
  const msgData = await msgRes.json().catch(() => ({}))
  if (!check('SIWE message built', msgRes.ok && !!msgData.message, `HTTP ${msgRes.status}`)) return
  check('message pins Base', /Chain ID: 8453/.test(msgData.message))

  console.log('\n3. Sign SIWE message')
  const signature = await wallet.signMessage({ message: msgData.message })
  const recovered = await recoverMessageAddress({ message: msgData.message, signature })
  check('local signature recovery', recovered.toLowerCase() === address.toLowerCase())

  console.log('\n4. POST /api/auth/login')
  const loginRes = await fetch(`${SITE}/api/auth/login`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ address, signature, nonce: nonceData.nonce }),
  })
  const loginData = await loginRes.json().catch(() => ({}))
  const session = loginData.session
  if (!check('session issued', loginRes.ok && !!session, `HTTP ${loginRes.status} ${JSON.stringify(loginData).slice(0, 160)}`)) return
  console.log(`   session: ${String(session).slice(0, 16)}... role=${loginData.user?.role}`)

  const authHeaders = { ...headers, Authorization: `Bearer ${session}` }

  console.log(`\n5. POST /api/subscribers  { wallet, tier: '${TIER}' }`)
  const subRes = await fetch(`${SITE}/api/subscribers`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ wallet: address, tier: TIER, source: 'e2e-test' }),
  })
  const subData = await subRes.json().catch(() => ({}))
  const row = subData.subscriber
  if (!check('row created', subRes.ok && subData.ok === true && !!row, `HTTP ${subRes.status} ${JSON.stringify(subData).slice(0, 200)}`)) return
  console.log(`   id=${row.id} wallet=${row.wallet_address} tier=${row.tier} status=${row.status} joined_at=${row.joined_at} expires_at=${row.expires_at}`)
  check('row wallet matches signed-in wallet', String(row.wallet_address).toLowerCase() === address.toLowerCase())
  check(`row tier is '${TIER}'`, row.tier === TIER)
  check('row has an id', typeof row.id === 'string' && row.id.length > 0)

  console.log('\n6. GET /api/subscribers/me (session-scoped)')
  const meRes = await fetch(`${SITE}/api/subscribers/me`, { headers: authHeaders })
  const meData = await meRes.json().catch(() => ({}))
  const me = meData.subscriber
  check('me returns the row', meRes.ok && !!me && me.id === row.id, `HTTP ${meRes.status} ${JSON.stringify(meData).slice(0, 160)}`)

  console.log('\n7. POST /api/web3/gate (tier gate resolves the subscription)')
  const gateRes = await fetch(`${SITE}/api/web3/gate`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ wallet: address, surface: 'kg' }),
  })
  const gateData = await gateRes.json().catch(() => ({}))
  console.log(`   gate → ${JSON.stringify(gateData).slice(0, 240)}`)
  check('gate returns a tier verdict for a subscriber', gateRes.ok && typeof gateData.passed === 'boolean' && !!gateData.tier,
    `tier=${gateData.tier} passed=${gateData.passed}`)

  console.log('\n8. GET /subscribe + /dashboard (static surfaces)')
  for (const path of ['/subscribe', '/dashboard', '/terms', '/privacy']) {
    const res = await fetch(`${SITE}${path}`, { headers: { Origin: ORIGIN } })
    const body = await res.text()
    const hasContent = body.includes('<html') || body.includes('<!DOCTYPE')
    check(`${path} serves HTML`, res.ok && hasContent, `HTTP ${res.status} ${body.length}B`)
    if (path === '/subscribe') {
      check('/subscribe carries all four tiers', ['Free', 'Builder', 'Operator', 'Syndicate'].every(t => body.includes(t)))
      check('/subscribe shows canonical pricing', ['$29', '$99', '$499'].every(p => body.includes(p)))
      check('/subscribe links the legal pages', body.includes('href="/terms"') && body.includes('href="/privacy"'))
    }
    if (path === '/dashboard') {
      check('/dashboard ships the member shell', /dashboard|MEMBER|Wallet/i.test(body))
    }
  }

  console.log(`\n=== ${failures === 0 ? 'PASS' : `FAIL (${failures} assertion${failures === 1 ? '' : 's'})`} ===`)
  if (failures > 0) process.exit(1)
}

main().catch(err => {
  console.error('\n❌ Test errored:', err.message)
  process.exit(1)
})
