const GUILD_API_BASE = "https://api.guild.xyz/v2"

export interface GuildMember {
  userId: number
  guildId: number
  roles: number[]
  joinedAt: string
  isOwner: boolean
}

export interface GuildInfo {
  id: number
  name: string
  urlName: string
  description?: string
  imageUrl?: string
}

export async function getGuildMembers(guildId: number): Promise<GuildMember[]> {
  const res = await fetch(`${GUILD_API_BASE}/guilds/${guildId}/members`, {
    headers: { "Content-Type": "application/json" },
  })
  if (!res.ok) throw new Error(`Guild API error: ${res.status}`)
  return res.json()
}

export async function getGuildsByAddress(address: string): Promise<GuildInfo[]> {
  const res = await fetch(`${GUILD_API_BASE}/guild/address/${address}`, {
    headers: { "Content-Type": "application/json" },
  })
  if (!res.ok) throw new Error(`Guild API error: ${res.status}`)
  return res.json()
}

export async function checkGuildMembership(
  guildId: number,
  address: string
): Promise<GuildMember | null> {
  const res = await fetch(
    `${GUILD_API_BASE}/guilds/${guildId}/members/address/${address}`,
    { headers: { "Content-Type": "application/json" } }
  )
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`Guild API error: ${res.status}`)
  return res.json()
}

export async function getMemberRoles(
  guildId: number,
  address: string
): Promise<number[]> {
  const member = await checkGuildMembership(guildId, address)
  return member?.roles || []
}

export function hasRole(member: GuildMember | null, roleId: number): boolean {
  if (!member) return false
  return member.roles.includes(roleId)
}

export function hasAnyRole(member: GuildMember | null, roleIds: number[]): boolean {
  if (!member) return false
  return roleIds.some((r) => member.roles.includes(r))
}

export function hasAllRoles(member: GuildMember | null, roleIds: number[]): boolean {
  if (!member) return false
  return roleIds.every((r) => member.roles.includes(r))
}