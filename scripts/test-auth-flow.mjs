// scripts/test-auth-flow.mjs
// End-to-end SIWE auth test against the live site.
// Uses viem to create a throwaway wallet and walk the full flow.
// No browser, no MetaMask needed.

import { createWalletClient, http, recoverMessageAddress } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { base } from 'viem/chains'

const SITE = 'https://supercompute.pages.dev'
const headers = { 'Content-Type': 'application/json', 'Origin': 'https://supercompute.pages.dev' }

async function main() {
  console.log('=== SUPERCOMPUTE Auth Flow Test ===\n')

  // Step 0: Generate a throwaway wallet
  const account = privateKeyToAccount(`0x${'ab'.repeat(32)}`) // deterministic test key
  const wallet = createWalletClient({ account, chain: base, transport: http() })
  const address = account.address
  console.log(`Wallet: ${address}`)

  // Step 1: GET /api/auth/nonce
  console.log('\n1. GET /api/auth/nonce')
  const nonceRes = await fetch(`${SITE}/api/auth/nonce`, { headers })
  const nonceData = await nonceRes.json()
  if (!nonceRes.ok || !nonceData.nonce) {
    throw new Error(`Nonce failed: ${nonceRes.status} ${JSON.stringify(nonceData)}`)
  }
  console.log(`   ✅ Nonce: ${nonceData.nonce.substring(0, 16)}...`)

  // Step 2: GET /api/auth/message
  console.log('\n2. GET /api/auth/message')
  const msgRes = await fetch(`${SITE}/api/auth/message?address=${address}&nonce=${nonceData.nonce}`, { headers })
  const msgData = await msgRes.json()
  if (!msgRes.ok || !msgData.message) {
    throw new Error(`Message failed: ${msgRes.status} ${JSON.stringify(msgData)}`)
  }
  console.log(`   ✅ SIWE message received (${msgData.message.length} chars)`)
  console.log(`   Chain ID: ${msgData.message.match(/Chain ID: (\d+)/)?.[1]}`)

  // Step 3: Sign the SIWE message with our throwaway wallet
  console.log('\n3. Sign SIWE message')
  const signature = await wallet.signMessage({ message: msgData.message })
  console.log(`   ✅ Signature: ${signature.substring(0, 20)}...`)

  // Verify locally first
  const recovered = await recoverMessageAddress({ message: msgData.message, signature })
  if (recovered.toLowerCase() !== address.toLowerCase()) {
    throw new Error(`Local verification failed: ${recovered} !== ${address}`)
  }
  console.log(`   ✅ Local verification: ${recovered} matches`)

  // Step 4: POST /api/auth/login
  console.log('\n4. POST /api/auth/login')
  const loginRes = await fetch(`${SITE}/api/auth/login`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ address, signature, nonce: nonceData.nonce }),
  })
  const loginData = await loginRes.json()
  
  if (!loginRes.ok) {
    // This wallet is not an admin, so we expect a session but no admin role
    console.log(`   Response: ${JSON.stringify(loginData)}`)
    if (loginData.error) {
      console.log(`   ⚠️  ${loginData.error}`)
    }
  } else {
    console.log(`   ✅ Login success`)
    console.log(`   Session: ${loginData.session?.substring(0, 16)}...`)
    console.log(`   Role: ${loginData.user?.role}`)

    // Step 5: Test session with profile endpoint
    console.log('\n5. GET /api/auth/profile')
    const profRes = await fetch(`${SITE}/api/auth/profile`, {
      headers: { ...headers, Authorization: `Bearer ${loginData.session}` },
    })
    const profData = await profRes.json()
    console.log(`   ${profRes.ok ? '✅' : '❌'} Profile: ${JSON.stringify(profData)}`)

    // Step 6: Test token gate
    console.log('\n6. POST /api/web3/gate')
    const gateRes = await fetch(`${SITE}/api/web3/gate`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        wallet: address,
        requirements: [{ token: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', minBalance: '1' }],
      }),
    })
    const gateData = await gateRes.json()
    console.log(`   ${gateRes.ok ? '✅' : '❌'} Gate: passed=${gateData.passed}`)

    // Step 7: Logout
    console.log('\n7. POST /api/auth/logout')
    const logoutRes = await fetch(`${SITE}/api/auth/logout`, {
      method: 'POST',
      headers: { ...headers, Authorization: `Bearer ${loginData.session}` },
    })
    console.log(`   ${logoutRes.ok ? '✅' : '❌'} Logout: ${logoutRes.status}`)
  }

  console.log('\n=== Test complete ===')
  console.log(`Admin test wallet: 0x1a828cd220559479e2f761805da4ee722683323b`)
  console.log(`→ Use that wallet in a regular Chrome window (not incognito)`)
  console.log(`→ Open DevTools → Network tab → // CONNECT → sign SIWE`)
  console.log(`→ Expect POST /api/auth/login → 200 { user: { role: "admin" } }`)
}

main().catch(err => {
  console.error('\n❌ Test failed:', err.message)
  process.exit(1)
})
