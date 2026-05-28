export interface PostDraft {
  title: string
  body: string
  excerpt: string
  author: string
  tags: string[]
  category: string
  coverImage?: string
  knowledgeGraphUrl?: string
}

export interface ExportResult {
  platform: Platform
  formatted: string
  characterCount: number
  threadParts?: string[]
  metadata: Record<string, string>
  preview: string
}

export type Platform = "x" | "farcaster" | "lens" | "mirror"

export interface PlatformConfig {
  name: string
  maxChars: number
  supportsMarkdown: boolean
  supportsImages: boolean
  supportsThreads: boolean
  icon: string
}

export const PLATFORMS: Record<Platform, PlatformConfig> = {
  x: {
    name: "X / Twitter",
    maxChars: 280,
    supportsMarkdown: false,
    supportsImages: true,
    supportsThreads: true,
    icon: "𝕏",
  },
  farcaster: {
    name: "Farcaster",
    maxChars: 1024,
    supportsMarkdown: false,
    supportsImages: true,
    supportsThreads: true,
    icon: "⌐◨-◨",
  },
  lens: {
    name: "Lens Protocol",
    maxChars: 5000,
    supportsMarkdown: true,
    supportsImages: true,
    supportsThreads: false,
    icon: "🌿",
  },
  mirror: {
    name: "Mirror",
    maxChars: 100000,
    supportsMarkdown: true,
    supportsImages: true,
    supportsThreads: false,
    icon: "✦",
  },
}
