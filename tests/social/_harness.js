// tests/social/_harness.js — mock environment for the /api/social/* admin gate.
//
// Reuses tests/auth/_harness.js so the session check the gate performs is mocked with
// the SAME semantics as the canonical SIWE login tests (existence + expiry, and
// revoked_at if present). Only the two things this suite cares about are layered on:
//   1. admin_wallets lookups answer from an explicit `admins` list, with the row
//      comparison FOLLOWING THE SQL THE HANDLER ACTUALLY SENT: `lower(wallet_address) = ?`
//      compares case-insensitively (so a mixed-case prod row is representable) while a
//      bare `wallet_address = ?` compares byte-exact, exactly as SQLite would. A mock
//      that is case-insensitive for EVERY SQL shape cannot detect a regression to the
//      case-sensitive query — reverting the gate kept every mock-driven test green
//      (PR #62 security review, round 1). The real-engine tests at the bottom of
//      admin-gate.test.js cover what no JS-side mock can.
//   2. `.all()` exists on every statement — the social routes list rows
//      (social_accounts / social_queue) where the auth tests only ever .first().

import { makeEnv as makeAuthEnv } from '../auth/_harness.js'

export const ADMIN_ADDR = '0x1a828cd220559479e2f761805da4ee722683323b'
// Real prod row: admin_wallets stores this mixed-case (checksummed) address. A
// case-sensitive query misses it; the gate's `lower(wallet_address) = ?` must not.
export const MIXED_CASE_ADDR = '0xe7A3Ed04F24b6482b4490ae06641Be4e4305Df34'
export const RANDO_ADDR = '0x9999999999999999999999999999999999999999'

// SEC-F1b (item 1): the live owners of the two ENS-named admin_wallets rows, resolved on
// mainnet at block 25980491 via the ENS universal resolver (viem getEnsAddress) and
// cross-checked against api.ensideas.com. Corroborated in-repo by seed-admin.sql,
// docs/DECISION-ens-content-layer.md:43 and scripts/ipns-contenthash.mjs:103
// (supercompute.eth), and on-chain by the reverse record on 0x5536EC4C… naming itself
// `orami.eth` (orami.eth). `sessions.wallet_address` is ALWAYS one of these lowercase 0x
// forms (login.js:120), never a name — which is why an ENS-named row can never match the
// gate's `lower(wallet_address) = ?` and its owner needs an address row.
export const SUPERCOMPUTE_ETH_ADDR = '0x5056a0729a7860a0c6f63575e74a51d5c2b85cf1'
export const ORAMI_ETH_ADDR = '0x5536ec4cf7c0ce0dab48444afd1f69f4db2bf6f4'

export const SESSION_ID = 'sess_t46a05469'
export const EXPIRED_SESSION_ID = 'sess_expired'

export const future = () => Math.floor(Date.now() / 1000) + 3600

// sessions: Map<sessionId, { wallet_address, expires_at }>
// failSessionLookup: make the SESSION read throw, like a D1 error on a missing table.
//   Mirrors `failAdminLookup` — the gate's first DB touch is the session read, so this
//   is how a non-JSON 500 (SEC-F1b, card t_f750de01) is exercised.
export function makeSocialEnv({ admins = [], users = new Map(), sessions = new Map(), failAdminLookup = false, failSessionLookup = false } = {}) {
  const cacheStore = new Map()
  cacheStore.set('__sessions__', sessions)
  const env = makeAuthEnv({ cacheStore, adminAddresses: admins, existingUsers: users })
  const origPrepare = env.DB.prepare.bind(env.DB)

  const emptyStatement = {
    first: async () => null,
    run: async () => ({ success: true }),
    all: async () => ({ results: [] }),
  }

  env.DB.prepare = (sql) => {
    const normalized = String(sql).replace(/\s+/g, ' ').trim()
    const isAdminLookup = normalized.includes('admin_wallets')
    // The PRE-FIX gate read `users.role` first with its own query shape, which the
    // auth harness does not model (`SELECT id, role FROM users` is login.js's). Mock
    // it here so the regression suite is genuinely RED against the old handler.
    const isUsersRoleLookup = /^SELECT role FROM users\b/.test(normalized)
    const isSessionLookup = /SELECT wallet_address FROM sessions\b/.test(normalized)
    return {
      bind(...args) {
        if (isSessionLookup && failSessionLookup) {
          const boom = () => { throw new Error('D1_ERROR: no such table: sessions') }
          return { first: async () => boom(), run: async () => boom(), all: async () => boom() }
        }
        if (isAdminLookup) {
          if (failAdminLookup) {
            return {
              first: async () => { throw new Error('D1_ERROR: no such table: admin_wallets') },
              run: async () => { throw new Error('D1_ERROR: no such table: admin_wallets') },
              all: async () => { throw new Error('D1_ERROR: no such table: admin_wallets') },
            }
          }
          // Mirror SQLite for the statement the handler sent, instead of lowercasing both
          // sides unconditionally. `lower(wallet_address) = ?` is the case-insensitive
          // comparison; a bare `wallet_address = ?` is byte-exact. Keying off the SQL text
          // is what makes this mock able to go RED when the gate loses its `lower(`.
          const caseInsensitive = /lower\s*\(/.test(normalized)
          const bound = String(args[0] ?? '')
          const hit = admins.find((a) => {
            const stored = String(a.wallet ?? '')
            return caseInsensitive ? stored.toLowerCase() === bound.toLowerCase() : stored === bound
          })
          return {
            first: async () => (hit ? { role: hit.role } : null),
            run: async () => ({ success: true }),
            all: async () => ({ results: hit ? [hit] : [] }),
          }
        }
        if (isUsersRoleLookup) {
          const wallet = String(args[0] ?? '').toLowerCase()
          const row = users.get(wallet)
          return {
            first: async () => (row ? { ...row } : null),
            run: async () => ({ success: true }),
            all: async () => ({ results: row ? [row] : [] }),
          }
        }
        const bound = origPrepare(sql).bind(...args)
        if (typeof bound.all !== 'function') bound.all = async () => ({ results: [] })
        return bound
      },
      ...emptyStatement,
    }
  }
  return env
}

export function socialRequest(sessionId, { path = '/api/social/health', method = 'GET', origin = 'https://supercompute.io' } = {}) {
  const headers = { Origin: origin }
  if (sessionId) headers.Authorization = `Bearer ${sessionId}`
  return new Request(`https://supercompute.io${path}`, { method, headers })
}
