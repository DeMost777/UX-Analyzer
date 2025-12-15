"use client"

import { useState } from "react"
import { MoreVertical, Eye, Edit, Trash2, CheckCircle2, Loader2, XCircle, Image as ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatDistanceToNow } from "date-fns"
import type { Analysis } from "@/lib/db/types"

interface AnalysisCardProps {
  analysis: Analysis
  onView: () => void
  onDelete: () => void
  onRename: (newTitle: string) => void
}

export function AnalysisCard({ analysis, onView, onDelete, onRename }: AnalysisCardProps) {
  const [isRenaming, setIsRenaming] = useState(false)
  const [newTitle, setNewTitle] = useState(analysis.title)

  const getStatusIcon = () => {
    switch (analysis.status) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case "processing":
        return <Loader2 className="h-4 w-4 text-yellow-500 animate-spin" />
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />
    }
  }

  const getStatusColor = () => {
    switch (analysis.status) {
      case "completed":
        return "bg-green-500/10 text-green-400 border-green-500/20"
      case "processing":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
      case "failed":
        return "bg-red-500/10 text-red-400 border-red-500/20"
    }
  }

  const handleRename = () => {
    if (newTitle.trim() && newTitle !== analysis.title) {
      onRename(newTitle.trim())
    }
    setIsRenaming(false)
  }

  return (
    <div className="group relative rounded-lg border border-[#1A1A1A] bg-[#111111] p-4 transition-all hover:border-[#2A2A2A] hover:shadow-lg">
      {/* Thumbnail */}
      <div className="mb-3 aspect-video w-full overflow-hidden rounded-md bg-[#0D0D0D]">
        {analysis.screenshot_url ? (
          <img
            src={analysis.screenshot_url}
            alt={analysis.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <ImageIcon className="h-8 w-8 text-gray-600" />
          </div>
        )}
      </div>

      {/* Title */}
      {isRenaming ? (
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onBlur={handleRename}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleRename()
            if (e.key === "Escape") {
              setNewTitle(analysis.title)
              setIsRenaming(false)
            }
          }}
          className="mb-2 w-full rounded-md border border-[#1A1A1A] bg-[#0D0D0D] px-2 py-1 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#4F7CFF]"
          autoFocus
        />
      ) : (
        <h3 className="mb-2 line-clamp-2 text-sm font-semibold text-white">{analysis.title}</h3>
      )}

      {/* Status and Date */}
      <div className="mb-3 flex items-center justify-between">
        <div className={`flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs ${getStatusColor()}`}>
          {getStatusIcon()}
          <span className="capitalize">{analysis.status}</span>
        </div>
        <span className="text-xs text-gray-400">
          {(() => {
            try {
              const date = analysis.created_at ? new Date(analysis.created_at) : new Date()
              if (isNaN(date.getTime())) {
                return "Recently"
              }
              return formatDistanceToNow(date, { addSuffix: true })
            } catch {
              return "Recently"
            }
          })()}
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <Button
          onClick={onView}
          variant="ghost"
          size="sm"
          className="text-xs text-gray-400 hover:text-white"
        >
          <Eye className="mr-1 h-3 w-3" />
          View
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-[#111111] border-[#1A1A1A]">
            <DropdownMenuItem
              onClick={() => setIsRenaming(true)}
              className="text-white hover:bg-[#1A1A1A] cursor-pointer"
            >
              <Edit className="mr-2 h-4 w-4" />
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={onDelete}
              className="text-red-400 hover:bg-red-500/10 cursor-pointer"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

