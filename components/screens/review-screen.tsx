"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { IssueSidebar } from "@/components/review/issue-sidebar"
import { Canvas } from "@/components/review/canvas"
import { ZoomControls } from "@/components/review/zoom-controls"
import { Download, ChevronLeft, ChevronRight } from "lucide-react"
import type { AnalysisResult, UXIssue } from "@/lib/types"

interface ReviewScreenProps {
  analysisResult: AnalysisResult
  onExport: () => void
}

export function ReviewScreen({ analysisResult, onExport }: ReviewScreenProps) {
  const [selectedIssue, setSelectedIssue] = useState<UXIssue | null>(null)
  const [hoveredIssue, setHoveredIssue] = useState<UXIssue | null>(null)
  const [zoom, setZoom] = useState(100)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const canvasRef = useRef<HTMLDivElement>(null)

  const handleIssueSelect = (issue: UXIssue) => {
    setSelectedIssue(issue)
    // Scroll to the screenshot containing this issue
    scrollToScreenshot(issue.screenshotId)
  }

  const handleIssueHover = (issue: UXIssue | null) => {
    setHoveredIssue(issue)
  }

  const scrollToScreenshot = (screenshotId: string) => {
    const element = document.getElementById(`screenshot-${screenshotId}`)
    if (element && canvasRef.current) {
      element.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" })
    }
  }

  const handleZoomIn = () => setZoom((z) => Math.min(z + 25, 200))
  const handleZoomOut = () => setZoom((z) => Math.max(z - 25, 50))
  const handleZoomReset = () => setZoom(100)

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      {/* Sidebar */}
      <div
        className={`relative border-r border-border bg-sidebar transition-all duration-300 ${
          sidebarCollapsed ? "w-0 overflow-hidden" : "w-80"
        }`}
      >
        <IssueSidebar
          analysisResult={analysisResult}
          selectedIssue={selectedIssue}
          hoveredIssue={hoveredIssue}
          onIssueSelect={handleIssueSelect}
          onIssueHover={handleIssueHover}
        />
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        className="absolute left-0 top-1/2 z-10 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-r-md border border-l-0 border-border bg-card text-muted-foreground hover:bg-muted transition-all"
        style={{ left: sidebarCollapsed ? 0 : "19.5rem" }}
      >
        {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>

      {/* Canvas Area */}
      <div className="relative flex-1 overflow-hidden bg-muted/30">
        <Canvas
          ref={canvasRef}
          analysisResult={analysisResult}
          selectedIssue={selectedIssue}
          hoveredIssue={hoveredIssue}
          onIssueSelect={handleIssueSelect}
          onIssueHover={handleIssueHover}
          zoom={zoom}
        />

        {/* Zoom Controls */}
        <ZoomControls zoom={zoom} onZoomIn={handleZoomIn} onZoomOut={handleZoomOut} onZoomReset={handleZoomReset} />

        {/* Export Button */}
        <div className="absolute top-4 right-4">
          <Button onClick={onExport} className="gap-2 shadow-lg">
            <Download className="h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>
    </div>
  )
}