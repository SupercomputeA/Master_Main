import type { NextApiRequest, NextApiResponse } from "next"
import { deleteSession } from "./_sessions"

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "method not allowed" })
  const auth = req.headers.authorization
  if (auth?.startsWith("Bearer ")) deleteSession(auth.slice(7))
  res.json({ success: true })
}
