import type { NextApiRequest, NextApiResponse } from "next"
import { createSession, isAdminWallet } from "./_sessions"

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "method not allowed" })

  const { address, signature } = req.body
  if (!address || !signature) {
    return res.status(400).json({ error: "address and signature required" })
  }
  const wallet = address.toLowerCase()
  if (!/^0x[0-9a-fA-F]{40}$/.test(wallet)) {
    return res.status(400).json({ error: "invalid address" })
  }

  const sessionId = createSession(wallet)
  const displayName = wallet.slice(0, 6) + "..." + wallet.slice(-4)

  res.json({
    success: true,
    session: sessionId,
    user: {
      id: wallet,
      name: displayName,
      address: wallet,
      role: isAdminWallet(wallet) ? "admin" : "user",
    },
  })
}
