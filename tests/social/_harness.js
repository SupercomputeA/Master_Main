// tests/social/_harness.js — mock environment for the /api/social/* admin gate.
//
// Reuses tests/auth/_harness.js so the session check the gate performs is mocked with
// the SAME semantics as the canonical SIWE login tests (existence + expiry, and
// revoked_at if present). Only the two things this suite cares about are layered on:
//   1. admin_wallets lookups answer from an explicit `admins` list, with the row
//      comparison being case-INSENSITIVE on the stored column (mirrors
//      `lower(wallet_address) = ?`), so a mixed-case prod row is representable.
//   2. `.all()` exists on every statement — the social routes list rows
//      (social_accounts / social_queue) where the auth tests only ever .first().

import { makeEnv as makeAuthEnv } from '../auth/_harness.js'

export const ADMIN_ADDR = '0x1a828cd220559479e2f761805da4ee722683323b'
// Real prod row: admin_wallets stores this mixed-case (checksummed) address. A
// case-sensitive query misses it; the gate's `lower(wallet_address) = ?` must not.
export const MIXED_CASE_ADDR = '0xe7A3Ed04F24b6482b4490ae06641Be4e4305Df34'
export const RANDO_ADDR = '0x9999999999999999999999999999999999999999'

export const SESSION_ID = 'sess_t46a05469'
export const EXPIRED_SESSION_ID = 'sess_expired'

export const future = () => Math.floor(Date.now() / 1000) + 3600

// sessions: Map<sessionId, { wallet_address, expires_at }>
export function makeSocialEnv({ admins = [], users = new Map(), sessions = new Map(), failAdminLookup = false } = {}) {
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
    return {
      bind(...args) {
        if (isAdminLookup) {
          if (failAdminLookup) {
            return {
              first: async () => { throw new Error('D1_ERROR: no such table: admin_wallets') },
              run: async () => { throw new Error('D1_ERROR: no such table: admin_wallets') },
              all: async () => { throw new Error('D1_ERROR: no such table: admin_wallets') },
            }
          }
          const wallet = String(args[0] ?? '').toLowerCase()
          const hit = admins.find((a) => String(a.wallet).toLowerCase() === wallet)
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
