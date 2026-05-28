import type { NextApiRequest, NextApiResponse } from "next"

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const address = req.query.address as string
  const nonce = req.query.nonce as string
  if (!address || !nonce || !/^0x[0-9a-fA-F]{40}$/.test(address)) {
    return res.status(400).json({ error: "invalid address or nonce" })
  }
  const expiry = new Date(Date.now() + 10 * 60 * 1000).toISOString()
  const message = [
    "supercompute.io wants you to sign in with your Ethereum account.",
    "",
    "URI: https://supercompute.io",
    "Version: 1",
    "Chain ID: 8453",
    `Nonce: ${nonce}`,
    `Expiration Time: ${expiry}`,
    "",
    "Sign in to SUPERCOMPUTE Web3 Platform",
  ].join("\n")
  res.json({ message })
}
