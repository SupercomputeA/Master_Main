import crypto from "crypto"

export const ADMIN_WALLETS = [
  "supercompute.eth",
  "orami.eth",
  "0x1a828cd220559479e2f761805da4ee722683323b",
]

const store = new Map<string, { wallet: string; expiresAt: number }>()

export function createSession(wallet: string): string {
  const id = crypto.randomBytes(32).toString("hex")
  store.set(id, { wallet, expiresAt: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60 })
  return id
}

export function getSession(sid: string) {
  const s = store.get(sid)
  if (!s || s.expiresAt < Math.floor(Date.now() / 1000)) {
    store.delete(sid)
    return null
  }
  return s
}

export function deleteSession(sid: string) {
  store.delete(sid)
}

export function isAdminWallet(wallet: string): boolean {
  return ADMIN_WALLETS.some(w => w.toLowerCase() === wallet.toLowerCase())
}
