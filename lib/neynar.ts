const NEYNAR_API_BASE = "https://api.neynar.com"

export const NEYNAR_CLIENT_ID = process.env.NEXT_PUBLIC_NEYNAR_CLIENT_ID || ""
export const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY || ""

export interface NeynarUser {
  fid: number
  username: string
  displayName: string
  pfpUrl: string
  custodyAddress: string
  verifications: string[]
}

export interface NeynarSigner {
  signer_uuid: string
  fid: number
  custodianAddress: string
  status: "pending" | "approved" | "revoked"
  publicKey: string
}

async function neynarFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = endpoint.startsWith("http") ? endpoint : `${NEYNAR_API_BASE}${endpoint}`

  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "x-api-key": NEYNAR_API_KEY,
      ...options.headers,
    },
  })

  if (!res.ok) {
    const error = await res.text()
    throw new Error(`Neynar API error ${res.status}: ${error}`)
  }

  return res.json()
}

export async function getUserByAddress(address: string): Promise<NeynarUser | null> {
  try {
    const data = await neynarFetch<{ result: { user: NeynarUser } }>(
      `/v2/farcaster/user-by- custody-address?custodyAddress=${address}`,
      { method: "GET" }
    )
    return data.result.user
  } catch {
    return null
  }
}

export async function getUserByFid(fid: number): Promise<NeynarUser | null> {
  try {
    const data = await neynarFetch<{ result: { user: NeynarUser } }>(
      `/v2/farcaster/user?fid=${fid}`,
      { method: "GET" }
    )
    return data.result.user
  } catch {
    return null
  }
}

export async function getBulkUsers(fids: number[]): Promise<NeynarUser[]> {
  try {
    const data = await neynarFetch<{ result: { users: NeynarUser[] } }>(
      `/v2/farcaster/users?fids=${fids.join(",")}`,
      { method: "GET" }
    )
    return data.result.users
  } catch {
    return []
  }
}

export async function createSigner(): Promise<{ signerUuid: string; status: string }> {
  const data = await neynarFetch<{
    result: { signer_uuid: string; status: string }
  }>("/v2/signer", {
    method: "POST",
  })
  return { signerUuid: data.result.signer_uuid, status: data.result.status }
}

export async function getSignerStatus(signerUuid: string): Promise<NeynarSigner | null> {
  try {
    const data = await neynarFetch<{ result: { signer: NeynarSigner } }>(
      `/v2/signer/${signerUuid}`,
      { method: "GET" }
    )
    return data.result.signer
  } catch {
    return null
  }
}

export async function getChannelMembers(channelId: string): Promise<number[]> {
  try {
    const data = await neynarFetch<{ result: { members: { fid: number }[] } }>(
      `/v2/farcaster/channel/members?channelId=${channelId}`,
      { method: "GET" }
    )
    return data.result.members.map((m) => m.fid)
  } catch {
    return []
  }
}

export async function exchangeCode(code: string, codeVerifier: string, clientId: string) {
  const data = await neynarFetch<{
    result: {
      access_token: string
      refresh_token: string
      scope: string
      expires_in: number
    }
  }>("/v2/exchange-token", {
    method: "POST",
    body: JSON.stringify({
      client_id: clientId,
      code,
      code_verifier: codeVerifier,
      grant_type: "authorization_code",
    }),
  })
  return data.result
}

export function buildNeynarUrl(clientId: string, redirectUri: string, state?: string): string {
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    redirect_uri: redirectUri,
    scope: "read_users write_users",
  })
  if (state) params.set("state", state)

  return `https://app.neynar.com/login?${params.toString()}`
}

export function getUserFromStorage(): NeynarUser | null {
  if (typeof window === "undefined") return null
  const stored = localStorage.getItem("neynar_user")
  return stored ? JSON.parse(stored) : null
}

export function saveUserToStorage(user: NeynarUser): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("neynar_user", JSON.stringify(user))
  }
}

export function clearUserFromStorage(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("neynar_user")
    localStorage.removeItem("neynar_signer_uuid")
  }
}

export function getSignerUuidFromStorage(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("neynar_signer_uuid")
}

export function saveSignerUuidToStorage(signerUuid: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("neynar_signer_uuid", signerUuid)
  }
}