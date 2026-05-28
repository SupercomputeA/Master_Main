"use client"

import { useState, useEffect, useCallback } from "react"
import { useAccount, useSignMessage, useDisconnect } from "wagmi"
import { useQuery, useMutation } from "@tanstack/react-query"
import {
  createSigner,
  getSignerStatus,
  getUserByAddress,
  getUserFromStorage,
  saveUserToStorage,
  clearUserFromStorage,
  saveSignerUuidToStorage,
  getSignerUuidFromStorage,
  buildNeynarUrl,
  type NeynarUser,
  type NeynarSigner,
} from "./neynar"

export function useNeynarUser() {
  const { address, isConnected } = useAccount()

  return useQuery({
    queryKey: ["neynar-user", address],
    queryFn: () => (address ? getUserByAddress(address) : Promise.resolve(null)),
    enabled: !!address && isConnected,
    staleTime: 1000 * 60 * 5,
  })
}

export function useNeynarSigner() {
  const [signer, setSigner] = useState<NeynarSigner | null>(null)
  const [signerUuid, setSignerUuid] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    const storedUuid = getSignerUuidFromStorage()
    if (storedUuid) setSignerUuid(storedUuid)
  }, [])

  const createNewSigner = useCallback(async () => {
    setIsCreating(true)
    try {
      const result = await createSigner()
      saveSignerUuidToStorage(result.signerUuid)
      setSignerUuid(result.signerUuid)
      return result.signerUuid
    } finally {
      setIsCreating(false)
    }
  }, [])

  const checkSignerStatus = useCallback(async (uuid: string) => {
    const status = await getSignerStatus(uuid)
    setSigner(status)
    return status
  }, [])

  return {
    signer,
    signerUuid,
    isCreating,
    createNewSigner,
    checkSignerStatus,
  }
}

export function useNeynarOnboarding() {
  const { address, isConnected } = useAccount()
  const { signMessageAsync } = useSignMessage()
  const { disconnect } = useDisconnect()
  const [isOnboarding, setIsOnboarding] = useState(false)
  const [step, setStep] = useState<"idle" | "creating" | "pending" | "approved" | "error">("idle")

  const startOnboarding = useCallback(async () => {
    setIsOnboarding(true)
    setStep("creating")

    try {
      const result = await createSigner()
      saveSignerUuidToStorage(result.signerUuid)
      setStep("pending")

      const redirectUri = window.location.origin + "/auth/callback"
      const clientId = process.env.NEXT_PUBLIC_NEYNAR_CLIENT_ID || ""
      const authUrl = buildNeynarUrl(clientId, redirectUri)

      window.location.href = authUrl
    } catch (err) {
      console.error("Onboarding error:", err)
      setStep("error")
      setIsOnboarding(false)
    }
  }, [])

  const pollSignerStatus = useCallback(
    async (signerUuid: string, maxAttempts = 60) => {
      for (let i = 0; i < maxAttempts; i++) {
        const status = await getSignerStatus(signerUuid)
        if (status?.status === "approved") {
          setStep("approved")
          setIsOnboarding(false)
          return status
        }
        if (status?.status === "revoked") {
          setStep("error")
          setIsOnboarding(false)
          return null
        }
        await new Promise((r) => setTimeout(r, 2000))
      }
      setStep("error")
      setIsOnboarding(false)
      return null
    },
    []
  )

  const completeOnboarding = useCallback(
    async (signerUuid: string) => {
      const signer = await pollSignerStatus(signerUuid)
      if (signer && address) {
        const user = await getUserByAddress(address)
        if (user) {
          saveUserToStorage(user)
        }
      }
      return signer
    },
    [address, pollSignerStatus]
  )

  const cancelOnboarding = useCallback(() => {
    setIsOnboarding(false)
    setStep("idle")
    clearUserFromStorage()
  }, [])

  return {
    isOnboarding,
    step,
    startOnboarding,
    completeOnboarding,
    cancelOnboarding,
    clearUser: clearUserFromStorage,
  }
}

export function useUserProfile() {
  const { address, isConnected } = useAccount()
  const [user, setUser] = useState<NeynarUser | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const stored = getUserFromStorage()
    if (stored) setUser(stored)
  }, [])

  useEffect(() => {
    if (address && isConnected) {
      setIsLoading(true)
      getUserByAddress(address)
        .then((u) => {
          if (u) {
            setUser(u)
            saveUserToStorage(u)
          }
        })
        .finally(() => setIsLoading(false))
    }
  }, [address, isConnected])

  return { user, isLoading, refetch: () => address && getUserByAddress(address) }
}

export function useDisconnectWithNeynar() {
  const { disconnect } = useDisconnect()
  return useCallback(() => {
    disconnect()
    clearUserFromStorage()
  }, [disconnect])
}