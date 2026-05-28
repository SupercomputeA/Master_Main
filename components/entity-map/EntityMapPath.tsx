"use client"

import { useEffect, useRef } from "react"
import { useEntityMap } from "./useEntityMap"

export default function EntityMapPath() {
  const { state, dispatch, togglePathPlaying, stopPath } = useEntityMap()
  const { activePath, pathProgress, isPathPlaying, pathSpeed } = state
  const frameRef = useRef<number>(0)

  useEffect(() => {
    if (!isPathPlaying || !activePath || activePath.length < 2) return

    const advance = () => {
      const increment = 0.003 * pathSpeed
      dispatch({ type: "SET_PATH_PROGRESS", progress: Math.min(pathProgress + increment, 1) })
      if (pathProgress + increment < 1) {
        frameRef.current = requestAnimationFrame(advance)
      } else {
        dispatch({ type: "TOGGLE_PATH_PLAYING" })
      }
    }

    frameRef.current = requestAnimationFrame(advance)
    return () => cancelAnimationFrame(frameRef.current)
  }, [isPathPlaying, pathProgress, pathSpeed, activePath])

  if (!activePath || activePath.length < 2) return null

  const currentStep = Math.floor(pathProgress * (activePath.length - 1))

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: 8,
      padding: "6px 12px",
      background: "var(--surface)",
      borderTop: "1px solid var(--border)",
    }}>
      <button
        onClick={togglePathPlaying}
        style={{
          width: 28,
          height: 28,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--accent)",
          color: "var(--bg)",
          border: "none",
          cursor: "pointer",
          fontFamily: "var(--font-mono)",
          fontSize: 12,
        }}
      >
        {isPathPlaying ? "||" : "▶"}
      </button>

      <button
        onClick={() => {
          const prev = Math.max(0, currentStep - 1) / Math.max(activePath.length - 1, 1)
          dispatch({ type: "SET_PATH_PROGRESS", progress: prev })
        }}
        style={{
          background: "transparent",
          border: "1px solid var(--border)",
          color: "var(--muted)",
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          padding: "4px 8px",
          cursor: "pointer",
        }}
      >
        PREV
      </button>

      <div style={{
        flex: 1,
        height: 4,
        background: "var(--bg)",
        position: "relative",
        cursor: "pointer",
      }}
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect()
          const progress = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
          dispatch({ type: "SET_PATH_PROGRESS", progress })
        }}
      >
        <div style={{
          width: `${pathProgress * 100}%`,
          height: "100%",
          background: "var(--accent)",
        }} />
      </div>

      <button
        onClick={() => {
          const next = Math.min(activePath.length - 1, currentStep + 1) / Math.max(activePath.length - 1, 1)
          dispatch({ type: "SET_PATH_PROGRESS", progress: next })
        }}
        style={{
          background: "transparent",
          border: "1px solid var(--border)",
          color: "var(--muted)",
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          padding: "4px 8px",
          cursor: "pointer",
        }}
      >
        NEXT
      </button>

      <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--muted)", minWidth: 60 }}>
        {currentStep + 1} / {activePath.length}
      </span>

      <select
        value={pathSpeed}
        onChange={(e) => dispatch({ type: "SET_PATH_SPEED", speed: Number(e.target.value) })}
        style={{
          background: "var(--bg)",
          border: "1px solid var(--border)",
          color: "var(--muted)",
          fontFamily: "var(--font-mono)",
          fontSize: 9,
          padding: "3px 6px",
          cursor: "pointer",
        }}
      >
        <option value={0.5}>0.5x</option>
        <option value={1}>1x</option>
        <option value={2}>2x</option>
      </select>

      <button
        onClick={stopPath}
        style={{
          background: "transparent",
          border: "1px solid var(--border)",
          color: "var(--danger, #ff6b6b)",
          fontFamily: "var(--font-mono)",
          fontSize: 9,
          padding: "4px 8px",
          cursor: "pointer",
        }}
      >
        STOP
      </button>
    </div>
  )
}
