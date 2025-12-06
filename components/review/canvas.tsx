"use client"

import { forwardRef } from "react"
import { Hotspot } from "@/components/review/hotspot"
import { IssueCard } from "@/components/review/issue-card"
import type { AnalysisResult, UXIssue } from "@/lib/types"

interface CanvasProps {
  analysisResult: AnalysisResult
  selectedIssue: UXIssue | null
  hoveredIssue: UXIssue | null
  onIssueSelect: (issue: UXIssue) => void
  onIssueHover: (issue: UXIssue | null) => void
  zoom: number
}

const MAX_DISPLAY_HEIGHT = 600

export const Canvas = forwardRef<HTMLDivElement, CanvasProps>(
  ({ analysisResult, selectedIssue, hoveredIssue, onIssueSelect, onIssueHover, zoom }, ref) => {
    const getIssuesByScreenshot = (screenshotId: string) => {
      return analysisResult.issues.filter((issue) => issue.screenshotId === screenshotId)
    }

    const getDisplayDimensions = (width: number, height: number) => {
      if (height <= MAX_DISPLAY_HEIGHT) {
        return { width, height }
      }
      const aspectRatio = width / height
      const displayHeight = MAX_DISPLAY_HEIGHT
      const displayWidth = displayHeight * aspectRatio
      return { width: displayWidth, height: displayHeight }
    }

    return (
      <div ref={ref} className="h-full w-full overflow-auto p-8" style={{ scrollBehavior: "smooth" }}>
        <div
          className="flex gap-8 pb-8"
          style={{
            transform: `scale(${zoom / 100})`,
            transformOrigin: "top left",
            transition: "transform 0.2s ease-out",
          }}
        >
          {analysisResult.screenshots.map((screenshot) => {
            const issues = getIssuesByScreenshot(screenshot.id)
            const displayDimensions = getDisplayDimensions(screenshot.width, screenshot.height)
            const scale = displayDimensions.height / screenshot.height

            return (
              <div key={screenshot.id} id={`screenshot-${screenshot.id}`} className="relative flex-shrink-0">
                <div className="mb-3 flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">{screenshot.name}</span>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                    {issues.length} issues
                  </span>
                </div>

                <div
                  className="relative overflow-hidden rounded-xl border border-border bg-card shadow-lg"
                  style={{
                    width: displayDimensions.width,
                    height: displayDimensions.height,
                  }}
                >
                  <img
                    src={screenshot.url || "/placeholder.svg"}
                    alt={screenshot.name}
                    className="h-full w-full object-contain bg-background"
                  />

                  {issues.map((issue) => (
                    <Hotspot
                      key={issue.id}
                      issue={issue}
                      isSelected={selectedIssue?.id === issue.id}
                      isHovered={hoveredIssue?.id === issue.id}
                      onSelect={() => onIssueSelect(issue)}
                      onHover={(hovered) => onIssueHover(hovered ? issue : null)}
                      scale={scale}
                    />
                  ))}
                </div>

                {selectedIssue && selectedIssue.screenshotId === screenshot.id && (
                  <IssueCard issue={selectedIssue} onClose={() => onIssueSelect(selectedIssue)} />
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  },
)

Canvas.displayName = "Canvas"
