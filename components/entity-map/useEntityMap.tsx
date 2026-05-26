"use client"

import { createContext, useContext, useReducer, useMemo, useCallback } from "react"
import type { ReactNode } from "react"
import type { EntityNode, EntityEdge, PresetView, NarrativePath, Transform, EntityMapData } from "./types"

interface EntityMapState {
  nodes: EntityNode[]
  edges: EntityEdge[]
  presets: PresetView[]
  narratives: NarrativePath[]
  selectedNodeId: string | null
  hoveredNodeId: string | null
  highlightedNodeIds: Set<string>
  transform: Transform
  targetTransform: Transform | null
  searchQuery: string
  activeFilters: Set<string>
  activePresetId: string | null
  activePath: string[] | null
  pathProgress: number
  isPathPlaying: boolean
  pathSpeed: number
  timelineRange: [Date, Date] | null
  timelineCursor: Date | null
  activeNarrativeId: string | null
  narrativeStep: number
}

type Action =
  | { type: "SELECT_NODE"; id: string | null }
  | { type: "HOVER_NODE"; id: string | null }
  | { type: "SET_HIGHLIGHTS"; ids: Set<string> }
  | { type: "SET_TRANSFORM"; transform: Transform }
  | { type: "ANIMATE_TO"; transform: Transform }
  | { type: "CLEAR_TARGET_TRANSFORM" }
  | { type: "SET_SEARCH"; query: string }
  | { type: "TOGGLE_FILTER"; nodeType: string }
  | { type: "SET_FILTERS"; filters: Set<string> }
  | { type: "ACTIVATE_PRESET"; preset: PresetView }
  | { type: "CLEAR_PRESET" }
  | { type: "START_PATH"; nodeIds: string[] }
  | { type: "SET_PATH_PROGRESS"; progress: number }
  | { type: "TOGGLE_PATH_PLAYING" }
  | { type: "STOP_PATH" }
  | { type: "SET_PATH_SPEED"; speed: number }
  | { type: "SET_TIMELINE_RANGE"; range: [Date, Date] | null }
  | { type: "SET_TIMELINE_CURSOR"; cursor: Date | null }
  | { type: "START_NARRATIVE"; narrativeId: string }
  | { type: "SET_NARRATIVE_STEP"; step: number }
  | { type: "STOP_NARRATIVE" }

function reducer(state: EntityMapState, action: Action): EntityMapState {
  switch (action.type) {
    case "SELECT_NODE":
      return { ...state, selectedNodeId: action.id }
    case "HOVER_NODE":
      return { ...state, hoveredNodeId: action.id }
    case "SET_HIGHLIGHTS":
      return { ...state, highlightedNodeIds: action.ids }
    case "SET_TRANSFORM":
      return { ...state, transform: action.transform }
    case "ANIMATE_TO":
      return { ...state, targetTransform: action.transform }
    case "CLEAR_TARGET_TRANSFORM":
      return { ...state, targetTransform: null }
    case "SET_SEARCH":
      return { ...state, searchQuery: action.query }
    case "TOGGLE_FILTER": {
      const next = new Set(state.activeFilters)
      if (next.has(action.nodeType)) next.delete(action.nodeType)
      else next.add(action.nodeType)
      return { ...state, activeFilters: next }
    }
    case "SET_FILTERS":
      return { ...state, activeFilters: action.filters }
    case "ACTIVATE_PRESET":
      return {
        ...state,
        activePresetId: action.preset.id,
        activeFilters: action.preset.filters ? new Set(action.preset.filters) : state.activeFilters,
        highlightedNodeIds: action.preset.highlightIds ? new Set(action.preset.highlightIds) : state.highlightedNodeIds,
        targetTransform: action.preset.camera ?? null,
        selectedNodeId: action.preset.focusNodeId ?? state.selectedNodeId,
      }
    case "CLEAR_PRESET":
      return {
        ...state,
        activePresetId: null,
        activeFilters: new Set(),
        highlightedNodeIds: new Set(),
        targetTransform: null,
      }
    case "START_PATH":
      return { ...state, activePath: action.nodeIds, pathProgress: 0, isPathPlaying: true }
    case "SET_PATH_PROGRESS":
      return { ...state, pathProgress: action.progress }
    case "TOGGLE_PATH_PLAYING":
      return { ...state, isPathPlaying: !state.isPathPlaying }
    case "STOP_PATH":
      return { ...state, activePath: null, pathProgress: 0, isPathPlaying: false }
    case "SET_PATH_SPEED":
      return { ...state, pathSpeed: action.speed }
    case "SET_TIMELINE_RANGE":
      return { ...state, timelineRange: action.range }
    case "SET_TIMELINE_CURSOR":
      return { ...state, timelineCursor: action.cursor }
    case "START_NARRATIVE": {
      const narrative = state.narratives.find(n => n.id === action.narrativeId)
      if (!narrative) return state
      return {
        ...state,
        activeNarrativeId: action.narrativeId,
        narrativeStep: 0,
        activePath: narrative.steps,
        pathProgress: 0,
        isPathPlaying: false,
        selectedNodeId: narrative.steps[0] ?? null,
      }
    }
    case "SET_NARRATIVE_STEP": {
      const narrative = state.narratives.find(n => n.id === state.activeNarrativeId)
      if (!narrative) return state
      const step = Math.max(0, Math.min(action.step, narrative.steps.length - 1))
      return {
        ...state,
        narrativeStep: step,
        selectedNodeId: narrative.steps[step] ?? null,
        pathProgress: step / Math.max(narrative.steps.length - 1, 1),
      }
    }
    case "STOP_NARRATIVE":
      return {
        ...state,
        activeNarrativeId: null,
        narrativeStep: 0,
        activePath: null,
        pathProgress: 0,
        isPathPlaying: false,
      }
    default:
      return state
  }
}

interface EntityMapContextValue {
  state: EntityMapState
  dispatch: React.Dispatch<Action>
  selectNode: (id: string | null) => void
  hoverNode: (id: string | null) => void
  setSearch: (query: string) => void
  toggleFilter: (type: string) => void
  activatePreset: (preset: PresetView) => void
  clearPreset: () => void
  startPath: (nodeIds: string[]) => void
  stopPath: () => void
  togglePathPlaying: () => void
  startNarrative: (id: string) => void
  narrativeNext: () => void
  narrativePrev: () => void
  stopNarrative: () => void
}

const EntityMapContext = createContext<EntityMapContextValue | null>(null)

export function EntityMapProvider({ data, children }: { data: EntityMapData; children: ReactNode }) {
  const initial: EntityMapState = {
    nodes: data.nodes,
    edges: data.edges,
    presets: data.presets ?? [],
    narratives: data.narratives ?? [],
    selectedNodeId: null,
    hoveredNodeId: null,
    highlightedNodeIds: new Set(),
    transform: { x: 0, y: 0, scale: 1 },
    targetTransform: null,
    searchQuery: "",
    activeFilters: new Set(),
    activePresetId: null,
    activePath: null,
    pathProgress: 0,
    isPathPlaying: false,
    pathSpeed: 1,
    timelineRange: null,
    timelineCursor: null,
    activeNarrativeId: null,
    narrativeStep: 0,
  }

  const [state, dispatch] = useReducer(reducer, initial)

  const selectNode = useCallback((id: string | null) => dispatch({ type: "SELECT_NODE", id }), [])
  const hoverNode = useCallback((id: string | null) => dispatch({ type: "HOVER_NODE", id }), [])
  const setSearch = useCallback((query: string) => dispatch({ type: "SET_SEARCH", query }), [])
  const toggleFilter = useCallback((type: string) => dispatch({ type: "TOGGLE_FILTER", nodeType: type }), [])
  const activatePreset = useCallback((preset: PresetView) => dispatch({ type: "ACTIVATE_PRESET", preset }), [])
  const clearPreset = useCallback(() => dispatch({ type: "CLEAR_PRESET" }), [])
  const startPath = useCallback((ids: string[]) => dispatch({ type: "START_PATH", nodeIds: ids }), [])
  const stopPath = useCallback(() => dispatch({ type: "STOP_PATH" }), [])
  const togglePathPlaying = useCallback(() => dispatch({ type: "TOGGLE_PATH_PLAYING" }), [])
  const startNarrative = useCallback((id: string) => dispatch({ type: "START_NARRATIVE", narrativeId: id }), [])
  const narrativeNext = useCallback(() => dispatch({ type: "SET_NARRATIVE_STEP", step: state.narrativeStep + 1 }), [state.narrativeStep])
  const narrativePrev = useCallback(() => dispatch({ type: "SET_NARRATIVE_STEP", step: state.narrativeStep - 1 }), [state.narrativeStep])
  const stopNarrative = useCallback(() => dispatch({ type: "STOP_NARRATIVE" }), [])

  const value = useMemo(() => ({
    state, dispatch,
    selectNode, hoverNode, setSearch, toggleFilter,
    activatePreset, clearPreset,
    startPath, stopPath, togglePathPlaying,
    startNarrative, narrativeNext, narrativePrev, stopNarrative,
  }), [state, selectNode, hoverNode, setSearch, toggleFilter, activatePreset, clearPreset, startPath, stopPath, togglePathPlaying, startNarrative, narrativeNext, narrativePrev, stopNarrative])

  return <EntityMapContext.Provider value={value}>{children}</EntityMapContext.Provider>
}

export function useEntityMap() {
  const ctx = useContext(EntityMapContext)
  if (!ctx) throw new Error("useEntityMap must be used within EntityMapProvider")
  return ctx
}
