"use client"

import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ZoomControlsProps {
  zoom: number
  onZoomIn: () => void
  onZoomOut: () => void
  onZoomReset: () => void
}

export function ZoomControls({ zoom, onZoomIn, onZoomOut, onZoomReset }: ZoomControlsProps) {
  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 rounded-lg border border-border bg-card/95 backdrop-blur-sm p-1 shadow-lg">
      <Button variant="ghost" size="icon" onClick={onZoomOut} disabled={zoom <= 50} className="h-8 w-8">
        <ZoomOut className="h-4 w-4" />
      </Button>
      <div className="px-3 py-1 text-sm font-medium text-foreground min-w-[3rem] text-center">{zoom}%</div>
      <Button variant="ghost" size="icon" onClick={onZoomIn} disabled={zoom >= 200} className="h-8 w-8">
        <ZoomIn className="h-4 w-4" />
      </Button>
      <div className="h-6 w-px bg-border mx-1" />
      <Button variant="ghost" size="icon" onClick={onZoomReset} className="h-8 w-8" title="Reset zoom">
        <RotateCcw className="h-4 w-4" />
      </Button>
    </div>
  )
}
