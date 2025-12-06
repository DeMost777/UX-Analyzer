"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import type { UXIssue } from "@/lib/types"

interface HotspotProps {
  issue: UXIssue
  isSelected: boolean
  isHovered: boolean
  onSelect: () => void
  onHover: (hovered: boolean) => void
  scale?: number
}

export function Hotspot({ issue, isSelected, isHovered, onSelect, onHover, scale = 1 }: HotspotProps) {
  const [showTooltip, setShowTooltip] = useState(false)

  const getSeverityColor = (severity: UXIssue["severity"]) => {
    switch (severity) {
      case "critical":
        return {
          bg: "bg-red-500",
          ring: "ring-red-500/30",
          glow: "shadow-red-500/50",
        }
      case "major":
        return {
          bg: "bg-yellow-500",
          ring: "ring-yellow-500/30",
          glow: "shadow-yellow-500/50",
        }
      case "minor":
        return {
          bg: "bg-blue-500",
          ring: "ring-blue-500/30",
          glow: "shadow-blue-500/50",
        }
    }
  }

  const colors = getSeverityColor(issue.severity)

  const scaledX = issue.coordinates.x * scale
  const scaledY = issue.coordinates.y * scale

  return (
    <div
      className="absolute"
      style={{
        left: scaledX,
        top: scaledY,
        transform: "translate(-50%, -50%)",
      }}
    >
      <button
        onClick={onSelect}
        onMouseEnter={() => {
          onHover(true)
          setShowTooltip(true)
        }}
        onMouseLeave={() => {
          onHover(false)
          setShowTooltip(false)
        }}
        className={cn(
          "relative flex h-6 w-6 items-center justify-center rounded-full transition-all duration-200",
          colors.bg,
          isSelected || isHovered
            ? `ring-4 ${colors.ring} scale-125 shadow-lg ${colors.glow}`
            : "ring-2 ring-white/50 hover:scale-110",
        )}
      >
        <span className="text-xs font-bold text-white">!</span>

        {(isSelected || isHovered) && (
          <span className={cn("absolute inset-0 rounded-full animate-ping opacity-75", colors.bg)} />
        )}
      </button>

      {showTooltip && !isSelected && (
        <div className="absolute left-1/2 top-full mt-2 -translate-x-1/2 z-50">
          <div className="rounded-lg bg-popover px-3 py-2 text-sm shadow-lg border border-border whitespace-nowrap">
            <p className="font-medium text-popover-foreground">{issue.problem}</p>
            <p className="text-xs text-muted-foreground mt-0.5 capitalize">{issue.severity} issue</p>
          </div>
        </div>
      )}
    </div>
  )
}
