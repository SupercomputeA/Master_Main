/* lib/guild.ts — stub.
 *
 * Originally removed in commit 89e04b0 (fix: restore website pages from 58bd83a,
 * separate publishing app concerns). The actual Guild.xyz integration was
 * migrated to the publishing app; the website's lib/ens.ts re-exports symbols
 * from here, but no contact was kept.
 *
 * This stub provides the type signatures used by lib/ens.ts. The functions
 * return empty defaults so the website build succeeds. Real Guild membership
 * logic lives in the publishing app.
 *
 * This stub is intentionally minimal — do not grow it. If a real integration
 * is needed, open a kanban task against the publishing profile. */

export type GuildMember = {
  address: string
  joinedAt: string
  roleIds: number[]
}

export type GuildInfo = {
  id: number
  name: string
  urlName: string
  memberCount: number
}

export async function getGuildsByAddress(_address: string): Promise<GuildInfo[]> {
  return []
}

export async function checkGuildMembership(
  _guildId: number,
  _address: string,
): Promise<GuildMember | null> {
  return null
}

export async function getMemberRoles(
  _guildId: number,
  _address: string,
): Promise<number[]> {
  return []
}
