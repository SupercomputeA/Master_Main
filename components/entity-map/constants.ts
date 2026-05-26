import type { EntityNodeType, NodeShape, GravityConfig } from "./types"

export const TYPE_COLORS: Record<string, string> = {
  protocol: "#10b981",
  token: "#fbbf24",
  agent: "#ff6b35",
  concept: "#a855f7",
  person: "#60a5fa",
  term: "#3b82f6",
  date: "#94a3b8",
  event: "#f97316",
  narrative: "#c084fc",
  image: "#22d3ee",
  officer: "#f59e0b",
  incident: "#0ea5e9",
  misconduct: "#ef4444",
  department: "#8b5cf6",
  complaint: "#06b6d4",
  member: "#60a5fa",
  default: "#64748b",
}

export const TYPE_SHAPES: Record<string, NodeShape> = {
  protocol: "circle",
  token: "circle",
  agent: "circle",
  concept: "circle",
  person: "circle",
  term: "roundedRect",
  date: "diamond",
  event: "hexagon",
  narrative: "arrow",
  image: "square",
  officer: "circle",
  incident: "hexagon",
  misconduct: "diamond",
  department: "square",
  complaint: "roundedRect",
  member: "circle",
  default: "circle",
}

export const TYPE_LABELS: Record<string, string> = {
  protocol: "Protocol",
  token: "Token",
  agent: "Agent",
  concept: "Concept",
  person: "Person",
  term: "Term",
  date: "Date",
  event: "Event",
  narrative: "Narrative",
  image: "Image",
  officer: "Officer",
  incident: "Incident",
  misconduct: "Misconduct",
  department: "Department",
  complaint: "Complaint",
  member: "Member",
}

export const DEFAULT_GRAVITY: Required<GravityConfig> = {
  damping: 0.85,
  repulsion: 4000,
  attraction: 0.006,
  centerForce: 0.003,
  edgeWeightMultiplier: 1.5,
}

export const GRID_SIZE = 40
export const BASE_NODE_RADIUS = 8
export const MAX_CONNECTION_BONUS = 10
export const CONNECTION_RADIUS_FACTOR = 1.2
