import { useEnsName, useEnsAddress } from "wagmi"
import { base } from "wagmi/chains"
import { useAccount } from "wagmi"
import { useQuery } from "@tanstack/react-query"
import {
  getGuildsByAddress,
  checkGuildMembership,
  getMemberRoles,
  type GuildMember,
  type GuildInfo,
} from "./guild"

export function useENSName(address: string | undefined) {
  return useEnsName({
    address: address as `0x${string}` | undefined,
    chainId: base.id,
  })
}

export function useENSAddress(name: string | undefined) {
  return useEnsAddress({
    name,
    chainId: base.id,
  })
}

export function formatAddress(address: string, ensName?: string | null): string {
  if (ensName) return ensName
  if (!address) return ""
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function useGuildMemberships() {
  const { address } = useAccount()

  return useQuery({
    queryKey: ["guild-memberships", address],
    queryFn: () => (address ? getGuildsByAddress(address) : Promise.resolve([] as GuildInfo[])),
    enabled: !!address,
    staleTime: 1000 * 60 * 5,
  })
}

export function useGuildMember(guildId: number) {
  const { address } = useAccount()

  return useQuery({
    queryKey: ["guild-member", guildId, address],
    queryFn: () =>
      address
        ? checkGuildMembership(guildId, address)
        : Promise.resolve(null as GuildMember | null),
    enabled: !!address,
    staleTime: 1000 * 60 * 5,
  })
}

export function useGuildRoles(guildId: number) {
  const { address } = useAccount()

  return useQuery({
    queryKey: ["guild-roles", guildId, address],
    queryFn: () => (address ? getMemberRoles(guildId, address) : Promise.resolve([] as number[])),
    enabled: !!address,
    staleTime: 1000 * 60 * 5,
  })
}

export { checkGuildMembership, getGuildsByAddress, type GuildMember, type GuildInfo }