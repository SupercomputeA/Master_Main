import { promises as fs } from "node:fs"
import path from "node:path"

const CONTENT_ROOT = path.join(process.cwd(), "content")

export interface ProjectUpdate {
  from: string
  date: string
  text: string
  type: "agent" | "admin" | "milestone" | "release" | "incident"
}

export interface Project {
  slug: string
  title: string
  tagline: string
  description: string
  category: string
  status: string
  chain: string
  agents: number
  tokenSymbol: string
  tokenName: string
  tokenAddress: string
  tokenPrice: string
  tvl: string
  goal: number
  raised: number
  investors: number
  progress: number
  quantaRequired: number
  updates: ProjectUpdate[]
}

export interface SchoolLesson {
  id: string
  title: string
  description: string
  duration: string
  topics: string
}

export interface SchoolModuleContent {
  moduleId: string
  title: string
  subtitle: string
  description: string
  difficulty: "Beginner" | "Intermediate" | "Advanced"
  access: "free" | "member"
  duration: string
  credential: string
  icon: string
  color: string
  done: boolean
  lessons: SchoolLesson[]
}

async function readJsonDir<T>(dir: string): Promise<T[]> {
  const full = path.join(CONTENT_ROOT, dir)
  try {
    const files = await fs.readdir(full)
    const out: T[] = []
    for (const f of files) {
      if (!f.endsWith(".json")) continue
      const raw = await fs.readFile(path.join(full, f), "utf8")
      out.push(JSON.parse(raw) as T)
    }
    return out
  } catch {
    return []
  }
}

export async function getAllProjects(): Promise<Project[]> {
  return readJsonDir<Project>("projects")
}

export async function getProject(slug: string): Promise<Project | null> {
  const all = await getAllProjects()
  return all.find(p => p.slug === slug) ?? null
}

export async function getAllSchoolModules(): Promise<SchoolModuleContent[]> {
  const mods = await readJsonDir<SchoolModuleContent>("school")
  return mods.sort((a, b) => a.moduleId.localeCompare(b.moduleId))
}

export async function getSchoolModule(moduleId: string): Promise<SchoolModuleContent | null> {
  const all = await getAllSchoolModules()
  return all.find(m => m.moduleId === moduleId) ?? null
}
