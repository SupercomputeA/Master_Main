import type { NextApiRequest, NextApiResponse } from "next"
import { getSession, isAdminWallet } from "./_sessions"

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const auth = req.headers.authorization
  if (!auth?.startsWith("Bearer ")) return res.json({ user: null })

  const session = getSession(auth.slice(7))
  if (!session) return res.json({ user: null })

  const wallet = session.wallet
  res.json({
    user: {
      id: wallet,
      name: wallet.slice(0, 6) + "..." + wallet.slice(-4),
      wallet_address: wallet,
      role: isAdminWallet(wallet) ? "admin" : "user",
    },
  })
}
