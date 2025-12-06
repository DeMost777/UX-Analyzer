"use client"

import { X, AlertCircle, AlertTriangle, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { UXIssue } from "@/lib/types"

interface IssueCardProps {
  issue: UXIssue
  onClose: () => void
}

export function IssueCard({ issue, onClose }: IssueCardProps) {
  const getSeverityIcon = (severity: UXIssue["severity"]) => {
    switch (severity) {
      case "critical":
        return <AlertCircle className="h-5 w-5 text-red-500" />
      case "major":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case "minor":
        return <Info className="h-5 w-5 text-blue-500" />
    }
  }

  const getSeverityColor = (severity: UXIssue["severity"]) => {
    switch (severity) {
      case "critical":
        return "border-red-500 bg-red-500/10"
      case "major":
        return "border-yellow-500 bg-yellow-500/10"
      case "minor":
        return "border-blue-500 bg-blue-500/10"
    }
  }

  return (
    <div
      className={cn(
        "absolute left-1/2 top-full mt-4 z-50 w-80 -translate-x-1/2 rounded-lg border-2 bg-card p-4 shadow-xl",
        getSeverityColor(issue.severity),
      )}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          {getSeverityIcon(issue.severity)}
          <span className="text-sm font-semibold capitalize text-foreground">{issue.severity} Issue</span>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-6 w-6">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-1">Problem</h3>
          <p className="text-sm text-muted-foreground">{issue.problem}</p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-foreground mb-1">Cause</h3>
          <p className="text-sm text-muted-foreground">{issue.cause}</p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-foreground mb-1">Fix</h3>
          <p className="text-sm text-muted-foreground">{issue.fix}</p>
        </div>

        <div className="pt-2 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Coordinates: ({issue.coordinates.x}, {issue.coordinates.y})
          </p>
        </div>
      </div>
    </div>
  )
}
