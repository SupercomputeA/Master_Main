export type EntityNodeType =
  | "protocol"
  | "token"
  | "agent"
  | "concept"
  | "person"
  | "term"
  | "date"
  | "event"
  | "narrative"
  | "image"

export interface EntityNode {
  id: string
  label: string
  type: EntityNodeType
  description?: string
  properties?: Record<string, string>
  definition?: string
  datetime?: string
  location?: string
  src?: string
  alt?: string
  order?: number
  prompt?: string
}

export interface EntityEdge {
  from: string
  to: string
  label: string
  weight?: number
}

export interface PresetView {
  id: string
  label: string
  description?: string
  camera?: { x: number; y: number; scale: number }
  filters?: string[]
  highlightIds?: string[]
  focusNodeId?: string
}

export interface NarrativePath {
  id: string
  title: string
  description?: string
  steps: string[]
}

export interface EntityMapData {
  nodes: EntityNode[]
  edges: EntityEdge[]
  presets?: PresetView[]
  narratives?: NarrativePath[]
}

export type NodeShape = "circle" | "diamond" | "hexagon" | "roundedRect" | "arrow" | "square"

export interface Transform {
  x: number
  y: number
  scale: number
}

export interface PhysicsBody {
  x: number
  y: number
  vx: number
  vy: number
}

export interface GravityConfig {
  damping?: number
  repulsion?: number
  attraction?: number
  centerForce?: number
  edgeWeightMultiplier?: number
}
