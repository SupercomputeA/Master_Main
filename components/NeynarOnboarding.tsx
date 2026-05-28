"use client"

import { useState, useEffect } from "react"
import { useNeynarOnboarding } from "@/lib/useNeynar"
import { getSignerUuidFromStorage } from "@/lib/neynar"
import styles from "./NeynarOnboarding.module.css"

interface NeynarOnboardingProps {
  onComplete?: () => void
  onCancel?: () => void
}

export function NeynarOnboarding({ onComplete, onCancel }: NeynarOnboardingProps) {
  const {
    isOnboarding,
    step,
    startOnboarding,
    completeOnboarding,
    cancelOnboarding,
  } = useNeynarOnboarding()

  const [statusMessage, setStatusMessage] = useState("")

  useEffect(() => {
    const existingSigner = getSignerUuidFromStorage()
    if (existingSigner && step === "idle") {
      completeOnboarding(existingSigner).then((signer) => {
        if (signer) onComplete?.()
      })
    }
  }, [step, completeOnboarding, onComplete])

  useEffect(() => {
    if (step === "creating") {
      setStatusMessage("Creating your signer key...")
    } else if (step === "pending") {
      setStatusMessage("Waiting for signature... Please sign in the Neynar mobile app")
    } else if (step === "approved") {
      setStatusMessage("Signer approved! Loading your profile...")
    } else if (step === "error") {
      setStatusMessage("Something went wrong. Please try again.")
    }
  }, [step])

  if (!isOnboarding) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.icon}>🔑</div>
          <h2 className={styles.title}>Set Up Your Web3 Identity</h2>
          <p className={styles.description}>
            Connect with Neynar to get a unified Web3 identity across the Supercompute ecosystem.
            Your signer key enables social login and wallet-less interactions.
          </p>
          <div className={styles.features}>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>✓</span>
              <span>Social login with Farcaster</span>
            </div>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>✓</span>
              <span>Desktop & mobile signer support</span>
            </div>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>✓</span>
              <span>Fiat on/off ramps</span>
            </div>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>✓</span>
              <span>Unified identity across dapps</span>
            </div>
          </div>
          <div className={styles.actions}>
            <button className={styles.primaryButton} onClick={startOnboarding}>
              Connect with Neynar
            </button>
            {onCancel && (
              <button className={styles.secondaryButton} onClick={onCancel}>
                Maybe Later
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.loadingSpinner}>
          <div className={styles.spinner}></div>
        </div>
        <h2 className={styles.title}>
          {step === "creating" && "Creating Signer"}
          {step === "pending" && "Waiting for Approval"}
          {step === "approved" && "Success!"}
          {step === "error" && "Error"}
        </h2>
        <p className={styles.status}>{statusMessage}</p>
        {step === "error" && (
          <div className={styles.actions}>
            <button className={styles.primaryButton} onClick={startOnboarding}>
              Try Again
            </button>
            <button className={styles.secondaryButton} onClick={cancelOnboarding}>
              Cancel
            </button>
          </div>
        )}
        {step === "pending" && (
          <div className={styles.hint}>
            <p>Open the Neynar mobile app to approve the signer request</p>
            <a
              href="https://apps.apple.com/app/neynar/id1622269682"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.link}
            >
              Download Neynar App →
            </a>
          </div>
        )}
      </div>
    </div>
  )
}

export function NeynarOnboardingModal({
  isOpen,
  onClose,
  onComplete,
}: {
  isOpen: boolean
  onClose: () => void
  onComplete?: () => void
}) {
  if (!isOpen) return null

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <button className={styles.closeButton} onClick={onClose}>
          ×
        </button>
        <NeynarOnboarding
          onComplete={() => {
            onComplete?.()
            onClose()
          }}
          onCancel={onClose}
        />
      </div>
    </div>
  )
}