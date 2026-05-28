const API = "/api/auth"

export async function getNonce(): Promise<string> {
  const res = await fetch(`${API}/nonce`)
  const data = (await res.json()) as { nonce: string }
  return data.nonce
}

export async function getMessage(address: string, nonce: string): Promise<string> {
  const res = await fetch(`${API}/message?address=${address}&nonce=${nonce}`)
  const data = (await res.json()) as { message: string }
  return data.message
}

export async function login(address: string, signature: string, nonce: string): Promise<{ session?: string; user?: { name: string; role: string }; error?: string }> {
  const res = await fetch(`${API}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ address, signature, nonce }),
  })
  return res.json()
}

export async function getProfile(session: string): Promise<{ user?: { name: string; role: string } }> {
  const res = await fetch(`${API}/profile`, {
    headers: { Authorization: `Bearer ${session}` },
  })
  return res.json()
}

export async function logout(session: string) {
  await fetch(`${API}/logout`, {
    method: "POST",
    headers: { Authorization: `Bearer ${session}` },
  })
}
