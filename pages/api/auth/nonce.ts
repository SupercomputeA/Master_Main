import type { NextApiRequest, NextApiResponse } from "next"
import crypto from "crypto"

export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  res.json({ nonce: crypto.randomBytes(32).toString("hex") })
}
