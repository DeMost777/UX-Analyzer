"use client"

import { useState } from "react"
import { ChevronDown, ChevronRight, AlertCircle, AlertTriangle, Info, ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import type { AnalysisResult, UXIssue } from "@/lib/types"
import { ScrollArea } from "@/components/ui/scroll-area"

interface IssueSidebarProps {
  analysisResult: AnalysisResult
  selectedIssue: UXIssue | null
  hoveredIssue: UXIssue | null
  onIssueSelect: (issue: UXIssue) => void
  onIssueHover: (issue: UXIssue | null) => void
}

export function IssueSidebar({
  analysisResult,
  selectedIssue,
  hoveredIssue,
  onIssueSelect,
  onIssueHover,
}: IssueSidebarProps) {
  const [expandedScreenshots, setExpandedScreenshots] = useState<Set<string>>(
    new Set(analysisResult.screenshots.map((s) => s.id)),
  )

  const toggleScreenshot = (id: string) => {
    const newExpanded = new Set(expandedScreenshots)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedScreenshots(newExpanded)
  }

  const getIssuesByScreenshot = (screenshotId: string) => {
    return analysisResult.issues.filter((issue) => issue.screenshotId === screenshotId)
  }

  const getSeverityIcon = (severity: UXIssue["severity"]) => {
    switch (severity) {
      case "critical":
        return <AlertCircle className="h-3.5 w-3.5 text-red-500" />
      case "major":
        return <AlertTriangle className="h-3.5 w-3.5 text-yellow-500" />
      case "minor":
        return <Info className="h-3.5 w-3.5 text-blue-500" />
    }
  }

  const getSeverityColor = (severity: UXIssue["severity"]) => {
    switch (severity) {
      case "critical":
        return "border-l-red-500"
      case "major":
        return "border-l-yellow-500"
      case "minor":
        return "border-l-blue-500"
    }
  }

  const totalIssues = analysisResult.issues.length
  const criticalCount = analysisResult.issues.filter((i) => i.severity === "critical").length
  const majorCount = analysisResult.issues.filter((i) => i.severity === "major").length
  const minorCount = analysisResult.issues.filter((i) => i.severity === "minor").length

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-sidebar-border p-4">
        <h2 className="font-semibold text-sidebar-foreground">Issues Found</h2>
        <div className="mt-2 flex items-center gap-3 text-xs">
          <span className="text-sidebar-foreground font-medium">{totalIssues} total</span>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-red-500" />
            <span className="text-muted-foreground">{criticalCount}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-yellow-500" />
            <span className="text-muted-foreground">{majorCount}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-blue-500" />
            <span className="text-muted-foreground">{minorCount}</span>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2">
          {analysisResult.screenshots.map((screenshot) => {
            const issues = getIssuesByScreenshot(screenshot.id)
            const isExpanded = expandedScreenshots.has(screenshot.id)

            return (
              <div key={screenshot.id} className="mb-1">
                <button
                  onClick={() => toggleScreenshot(screenshot.id)}
                  className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left hover:bg-sidebar-accent transition-colors"
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                  <ImageIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="flex-1 truncate text-sm font-medium text-sidebar-foreground">{screenshot.name}</span>
                  <span className="text-xs text-muted-foreground">{issues.length}</span>
                </button>

                {isExpanded && (
                  <div className="ml-4 space-y-1 py-1">
                    {issues.map((issue) => (
                      <button
                        key={issue.id}
                        onClick={() => onIssueSelect(issue)}
                        onMouseEnter={() => onIssueHover(issue)}
                        onMouseLeave={() => onIssueHover(null)}
                        className={cn(
                          "flex w-full items-start gap-2 rounded-lg border-l-2 px-3 py-2 text-left transition-all",
                          getSeverityColor(issue.severity),
                          selectedIssue?.id === issue.id
                            ? "bg-sidebar-accent"
                            : hoveredIssue?.id === issue.id
                              ? "bg-sidebar-accent/50"
                              : "hover:bg-sidebar-accent/30",
                        )}
                      >
                        {getSeverityIcon(issue.severity)}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-sidebar-foreground truncate">{issue.problem}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            ({issue.coordinates.x}, {issue.coordinates.y})
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
}
