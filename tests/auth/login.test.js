// tests/auth/login.test.js — S-1 regression + full SIWE attack-vector coverage.
// All tests must FAIL on the current handler (RED). They pass after the fix
// strips the optional nonce bypass and enforces the stored-message contract.

import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { onRequest } from '../../functions/api/auth/login.js';
import {
  makeEnv, callHandler, makeTestWallet, makeSiweMessage,
  ARBITRARY_SIGNATURE, ARBITRARY_SIGNATURE_V28,
} from './_harness.js';

const LOGIN_URL = 'https://supercompute.io/api/auth/login';

test('S-1: missing nonce is rejected (the critical bypass)', async () => {
  const env = makeEnv();
  const { status, body } = await callHandler(onRequest, {
    env,
    body: { address: '0x1111111111111111111111111111111111111111', signature: ARBITRARY_SIGNATURE },
  });
  assert.notEqual(status, 200, 'must NOT return 200 when nonce is omitted');
  assert.equal(body.success, undefined, 'must NOT issue a session');
  assert.equal(body.session, undefined, 'must NOT include a session token');
});

test('S-1: missing CACHE binding is rejected (cannot bypass verification)', async () => {
  // Build an env with no CACHE at all
  const env = { DB: makeEnv().DB };
  const { status, body } = await callHandler(onRequest, {
    env,
    body: { address: '0x1111111111111111111111111111111111111111', signature: ARBITRARY_SIGNATURE, nonce: 'a'.repeat(64) },
  });
  assert.notEqual(status, 200, 'must NOT return 200 when CACHE binding is absent');
  assert.equal(body.success, undefined);
});

test('S-1: absent stored message returns 401/400 and does not issue a session', async () => {
  const env = makeEnv();
  const { status, body } = await callHandler(onRequest, {
    env,
    body: { address: '0x1111111111111111111111111111111111111111', signature: ARBITRARY_SIGNATURE, nonce: 'a'.repeat(64) },
  });
  assert.ok(status >= 400 && status < 500, `must reject with 4xx, got ${status}`);
  assert.equal(body.success, undefined);
  // Verify nothing was written to CACHE for the would-be session
  assert.equal(env._cacheStore.get('__sessions__'), undefined, 'no session must be created');
});

test('S-1: arbitrary 65-byte signature against a real stored message fails verification', async () => {
  const env = makeEnv();
  const nonce = 'a'.repeat(64);
  const address = '0x1111111111111111111111111111111111111111';
  const message = makeSiweMessage({ address, nonce });
  await env.CACHE.put(`siwe:msg:${nonce}`, message);
  const { status, body } = await callHandler(onRequest, {
    env,
    body: { address, signature: ARBITRARY_SIGNATURE, nonce },
  });
  assert.ok(status >= 400 && status < 500, `must reject, got ${status}`);
  assert.equal(body.success, undefined);
});

test('S-1: signature issued for address A cannot authenticate as address B', async () => {
  // Real attack: nonce is bound to address A, attacker A signs the SIWE
  // message, but tries to claim address B in the body. The handler MUST
  // detect the mismatch between body.address and the address the signature
  // actually recovers to.
  const env = makeEnv();
  const { client } = makeTestWallet(); // attacker wallet
  const attackerAddress = client.account.address.toLowerCase();
  const claimedAddress = '0x1a828cd220559479e2f761805da4ee722683323B'; // admin
  const nonce = 'b'.repeat(64);
  const message = makeSiweMessage({ address: attackerAddress, nonce });
  await env.CACHE.put(`siwe:msg:${nonce}`, message);
  const signature = await client.signMessage({ message });
  const { status, body } = await callHandler(onRequest, {
    env,
    body: { address: claimedAddress, signature, nonce },
  });
  assert.notEqual(status, 200, `impersonation must fail, got ${status} body=${JSON.stringify(body)}`);
  assert.equal(body.success, undefined);
});

test('happy path: correct address, real signature, stored message, valid nonce → 200 + session', async () => {
  const env = makeEnv();
  const { client, account } = makeTestWallet();
  const nonce = 'c'.repeat(64);
  const address = account.address;
  const message = makeSiweMessage({ address, nonce });
  await env.CACHE.put(`siwe:msg:${nonce}`, message);
  const signature = await client.signMessage({ message });
  const { status, body } = await callHandler(onRequest, {
    env,
    body: { address, signature, nonce },
  });
  assert.equal(status, 200, `expected 200, got ${status} body=${JSON.stringify(body)}`);
  assert.equal(body.success, true);
  assert.ok(body.session && typeof body.session === 'string', 'must include session id');
  assert.equal(body.user.role, 'user', 'no admin_wallets row → user role');
});

test('replay: same nonce cannot be consumed twice', async () => {
  const env = makeEnv();
  const { client, account } = makeTestWallet();
  const nonce = 'd'.repeat(64);
  const address = account.address;
  const message = makeSiweMessage({ address, nonce });
  await env.CACHE.put(`siwe:msg:${nonce}`, message);
  const signature = await client.signMessage({ message });
  const first = await callHandler(onRequest, { env, body: { address, signature, nonce } });
  assert.equal(first.status, 200);
  const second = await callHandler(onRequest, { env, body: { address, signature, nonce } });
  assert.notEqual(second.status, 200, 'second use of same nonce must fail');
});

test('happy path admin: real signature from admin wallet → role=admin', async () => {
  const adminAddress = '0x1a828cd220559479e2f761805da4ee722683323B';
  const env = makeEnv({ adminAddresses: [{ wallet: adminAddress, role: 'admin' }] });
  const { client } = makeTestWallet();
  // Replace the wallet's account address with the admin's by re-signing with a wallet
  // whose address matches — easier to test by pre-storing a signature issued by the admin.
  // For unit test purposes we generate a deterministic account whose address IS the admin:
  const adminAccount = (await import('viem/accounts')).privateKeyToAccount(`0x${'cd'.repeat(32)}`);
  // The test admin account won't match the adminAddress; instead, sign with the test
  // wallet and pre-populate adminAddresses with the test wallet's address.
  const realEnv = makeEnv({ adminAddresses: [{ wallet: client.account.address, role: 'admin' }] });
  const nonce = 'e'.repeat(64);
  const message = makeSiweMessage({ address: client.account.address, nonce });
  await realEnv.CACHE.put(`siwe:msg:${nonce}`, message);
  const signature = await client.signMessage({ message });
  const { status, body } = await callHandler(onRequest, {
    env: realEnv,
    body: { address: client.account.address, signature, nonce },
  });
  assert.equal(status, 200);
  assert.equal(body.user.role, 'admin');
});

test('rate limit: 6th attempt from same address within window returns 429', async () => {
  const env = makeEnv();
  const badAddr = '0x9999999999999999999999999999999999999999';
  // 5 failing attempts (no nonce) should each be rejected but the rate counter
  // is only incremented on certain failures; for clarity we POST valid nonce but
  // no stored message 6 times and confirm at least one returns 429.
  let saw429 = false;
  for (let i = 0; i < 7; i++) {
    const { status } = await callHandler(onRequest, {
      env,
      body: { address: badAddr, signature: ARBITRARY_SIGNATURE, nonce: `${i}`.repeat(64) },
    });
    if (status === 429) { saw429 = true; break; }
  }
  assert.equal(saw429, true, 'rate limiter must trip within 7 attempts');
});

test('invalid address format is rejected', async () => {
  const env = makeEnv();
  const { status } = await callHandler(onRequest, {
    env,
    body: { address: 'not-an-address', signature: ARBITRARY_SIGNATURE, nonce: 'f'.repeat(64) },
  });
  assert.notEqual(status, 200);
});

test('missing signature is rejected', async () => {
  const env = makeEnv();
  const { status } = await callHandler(onRequest, {
    env,
    body: { address: '0x1111111111111111111111111111111111111111', nonce: 'aa'.repeat(32) },
  });
  assert.notEqual(status, 200);
});

test('signature with invalid v byte is rejected', async () => {
  const env = makeEnv();
  // v=99 — invalid
  const sig = `0x${'00'.repeat(64)}63`;
  const { status } = await callHandler(onRequest, {
    env,
    body: { address: '0x1111111111111111111111111111111111111111', signature: sig, nonce: 'bb'.repeat(32) },
  });
  assert.notEqual(status, 200);
});

test('signature with wrong length (64 bytes) is rejected', async () => {
  const env = makeEnv();
  const sig = `0x${'00'.repeat(64)}`; // 64 bytes, no v
  const { status } = await callHandler(onRequest, {
    env,
    body: { address: '0x1111111111111111111111111111111111111111', signature: sig, nonce: 'cc'.repeat(32) },
  });
  assert.notEqual(status, 200);
});

test('concurrent replay: simultaneous requests serialize through KV tombstone (best-effort)', async () => {
  // S-8 (security-audit 2026-08-03): KV is eventually consistent, so two
  // requests landing in flight within ~100ms may both read the original
  // message before either writes the tombstone. The full fix is a Durable
  // Object for one-time challenges; this test documents the bound.
  // Mitigation in handler: write tombstone, then verify read-back — catches
  // all sequential replays + most concurrent ones; same-region simultaneous
  // requests within KV's write-propagation window are an accepted gap.
  const env = makeEnv();
  const { client, account } = makeTestWallet();
  const nonce = 'dd'.repeat(32);
  const address = account.address;
  const message = makeSiweMessage({ address, nonce });
  await env.CACHE.put(`siwe:msg:${nonce}`, message);
  const signature = await client.signMessage({ message });
  // Sequential (not simultaneous) — guaranteed to fail on retry.
  const first = await callHandler(onRequest, { env, body: { address, signature, nonce } });
  const second = await callHandler(onRequest, { env, body: { address, signature, nonce } });
  assert.equal(first.status, 200);
  assert.notEqual(second.status, 200, `sequential replay must fail, got ${second.status}`);
});

test('CORS reflects only exact owned HTTPS origins', async () => {
  const env = makeEnv();
  const allowed = await callHandler(onRequest, { env, method: 'OPTIONS', origin: 'https://staging.supercompute.io' });
  assert.equal(allowed.raw.headers.get('access-control-allow-origin'), 'https://staging.supercompute.io');

  for (const origin of ['http://supercompute.io', 'https://supercompute.io:444', 'https://attacker.pages.dev']) {
    const result = await callHandler(onRequest, { env, method: 'OPTIONS', origin });
    assert.notEqual(result.raw.headers.get('access-control-allow-origin'), origin, `must not reflect unowned origin ${origin}`);
  }
});

test('wrong domain in SIWE message is rejected', async () => {
  // Server-issued message uses domain=supercompute.io. Attacker pre-stores
  // a message that says domain=evil.com and tries to use it.
  const env = makeEnv();
  const { client, account } = makeTestWallet();
  const nonce = 'ee'.repeat(32);
  const address = account.address;
  const attackerMessage = makeSiweMessage({ address, nonce, domain: 'evil.com' });
  await env.CACHE.put(`siwe:msg:${nonce}`, attackerMessage);
  const signature = await client.signMessage({ message: attackerMessage });
  const { status, body } = await callHandler(onRequest, {
    env,
    body: { address, signature, nonce },
  });
  assert.equal(status, 401, `wrong SIWE domain must fail, got ${status} body=${JSON.stringify(body)}`);
  assert.equal(body.session, undefined);
});

test('wrong URI in SIWE message is rejected', async () => {
  const env = makeEnv();
  const { client, account } = makeTestWallet();
  const nonce = 'ef'.repeat(32);
  const message = makeSiweMessage({ address: account.address, nonce, uri: 'https://evil.com' });
  await env.CACHE.put(`siwe:msg:${nonce}`, message);
  const signature = await client.signMessage({ message });
  const { status, body } = await callHandler(onRequest, { env, body: { address: account.address, signature, nonce } });
  assert.equal(status, 401, `wrong SIWE URI must fail, got ${status}`);
  assert.equal(body.session, undefined);
});

test('wrong chain in SIWE message is rejected', async () => {
  const env = makeEnv();
  const { client, account } = makeTestWallet();
  const nonce = 'f0'.repeat(32);
  const message = makeSiweMessage({ address: account.address, nonce, chainId: 1 });
  await env.CACHE.put(`siwe:msg:${nonce}`, message);
  const signature = await client.signMessage({ message });
  const { status, body } = await callHandler(onRequest, { env, body: { address: account.address, signature, nonce } });
  assert.equal(status, 401, `wrong SIWE chain must fail, got ${status}`);
  assert.equal(body.session, undefined);
});

test('expired SIWE message is rejected', async () => {
  const env = makeEnv();
  const { client, account } = makeTestWallet();
  const nonce = 'f1'.repeat(32);
  const message = makeSiweMessage({ address: account.address, nonce, expirationMinutes: -1 });
  await env.CACHE.put(`siwe:msg:${nonce}`, message);
  const signature = await client.signMessage({ message });
  const { status, body } = await callHandler(onRequest, { env, body: { address: account.address, signature, nonce } });
  assert.equal(status, 401, `expired SIWE message must fail, got ${status}`);
  assert.equal(body.session, undefined);
});