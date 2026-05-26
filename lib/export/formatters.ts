import type { PostDraft, ExportResult, Platform } from "./types"
import { PLATFORMS } from "./types"

function truncate(text: string, max: number, suffix = "..."): string {
  if (text.length <= max) return text
  return text.slice(0, max - suffix.length).trimEnd() + suffix
}

function splitThread(text: string, maxChars: number): string[] {
  const parts: string[] = []
  const sentences = text.split(/(?<=[.!?])\s+/)
  let current = ""

  for (const sentence of sentences) {
    const counter = parts.length > 0 ? ` (${parts.length + 1}/?)` : ""
    if ((current + " " + sentence).length + counter.length > maxChars) {
      if (current) parts.push(current.trim())
      current = sentence
    } else {
      current = current ? current + " " + sentence : sentence
    }
  }
  if (current) parts.push(current.trim())

  return parts.map((p, i) => {
    if (parts.length === 1) return p
    return `${p} (${i + 1}/${parts.length})`
  })
}

function stripMarkdown(md: string): string {
  return md
    .replace(/#{1,6}\s/g, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/\[(.*?)\]\(.*?\)/g, "$1")
    .replace(/`(.*?)`/g, "$1")
    .replace(/>\s/g, "")
    .replace(/---/g, "")
    .trim()
}

function hashTags(tags: string[]): string {
  return tags
    .slice(0, 5)
    .map(t => "#" + t.replace(/\s+/g, "").replace(/[^a-zA-Z0-9]/g, ""))
    .join(" ")
}

export function formatForX(post: PostDraft): ExportResult {
  const config = PLATFORMS.x
  const tags = hashTags(post.tags)
  const link = post.knowledgeGraphUrl ? `\n\n${post.knowledgeGraphUrl}` : ""

  const header = `${post.title}\n\n`
  const available = config.maxChars - header.length - tags.length - link.length - 4
  const body = truncate(stripMarkdown(post.excerpt || post.body), available)
  const single = `${header}${body}\n\n${tags}${link}`

  if (single.length <= config.maxChars) {
    return {
      platform: "x",
      formatted: single,
      characterCount: single.length,
      metadata: { format: "single" },
      preview: single,
    }
  }

  const fullText = `${post.title}\n\n${stripMarkdown(post.body)}\n\n${tags}${link}`
  const parts = splitThread(fullText, config.maxChars)

  return {
    platform: "x",
    formatted: parts[0],
    characterCount: parts[0].length,
    threadParts: parts,
    metadata: { format: "thread", parts: String(parts.length) },
    preview: parts.map((p, i) => `[${i + 1}] ${p}`).join("\n\n"),
  }
}

export function formatForFarcaster(post: PostDraft): ExportResult {
  const config = PLATFORMS.farcaster
  const tags = hashTags(post.tags)
  const link = post.knowledgeGraphUrl ? `\n\n${post.knowledgeGraphUrl}` : ""

  const header = `${post.title}\n\n`
  const available = config.maxChars - header.length - tags.length - link.length - 4
  const body = truncate(stripMarkdown(post.excerpt || post.body), available)
  const single = `${header}${body}\n\n${tags}${link}`

  if (single.length <= config.maxChars) {
    return {
      platform: "farcaster",
      formatted: single,
      characterCount: single.length,
      metadata: { format: "cast" },
      preview: single,
    }
  }

  const fullText = `${post.title}\n\n${stripMarkdown(post.body)}\n\n${tags}${link}`
  const parts = splitThread(fullText, config.maxChars)

  return {
    platform: "farcaster",
    formatted: parts[0],
    characterCount: parts[0].length,
    threadParts: parts,
    metadata: { format: "thread", parts: String(parts.length) },
    preview: parts.map((p, i) => `[${i + 1}] ${p}`).join("\n\n"),
  }
}

export function formatForLens(post: PostDraft): ExportResult {
  const tags = post.tags.map(t => `#${t.replace(/\s+/g, "")}`).join(" ")

  const formatted = [
    `# ${post.title}`,
    "",
    `*By ${post.author}*`,
    "",
    post.body,
    "",
    `---`,
    "",
    tags,
    post.knowledgeGraphUrl ? `\n[View Entity Map](${post.knowledgeGraphUrl})` : "",
  ].filter(Boolean).join("\n")

  return {
    platform: "lens",
    formatted,
    characterCount: formatted.length,
    metadata: { format: "publication", contentType: "article" },
    preview: formatted,
  }
}

export function formatForMirror(post: PostDraft): ExportResult {
  const formatted = [
    `# ${post.title}`,
    "",
    `*${post.author} · ${post.category}*`,
    "",
    post.coverImage ? `![cover](${post.coverImage})` : "",
    "",
    post.body,
    "",
    `---`,
    "",
    `*Published via Supercompute Publishing*`,
    post.knowledgeGraphUrl ? `\n[Explore the Entity Map](${post.knowledgeGraphUrl})` : "",
  ].filter(Boolean).join("\n")

  return {
    platform: "mirror",
    formatted,
    characterCount: formatted.length,
    metadata: { format: "entry", contentType: "article" },
    preview: formatted,
  }
}

export function exportAll(post: PostDraft): ExportResult[] {
  return [
    formatForX(post),
    formatForFarcaster(post),
    formatForLens(post),
    formatForMirror(post),
  ]
}

export function formatForPlatform(post: PostDraft, platform: Platform): ExportResult {
  switch (platform) {
    case "x": return formatForX(post)
    case "farcaster": return formatForFarcaster(post)
    case "lens": return formatForLens(post)
    case "mirror": return formatForMirror(post)
  }
}
