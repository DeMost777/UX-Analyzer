"use client"

import { FileX, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface EmptyStateProps {
  onAddNew: () => void
  hasSearched: boolean
}

export function EmptyState({ onAddNew, hasSearched }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="mb-4 rounded-full bg-[#1A1A1A] p-6">
        <FileX className="h-12 w-12 text-gray-500" />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-white">
        {hasSearched ? "No analyses found" : "No analyses yet"}
      </h3>
      <p className="mb-6 text-center text-sm text-gray-400 max-w-md">
        {hasSearched
          ? "Try adjusting your search query to find what you're looking for."
          : "Get started by running your first UX analysis. Upload a screenshot and let AI detect UX issues automatically."}
      </p>
      {!hasSearched && (
        <Button onClick={onAddNew} className="bg-[#4F7CFF] hover:bg-[#3D6AFF] text-white">
          <Plus className="mr-2 h-4 w-4" />
          Run your first analysis
        </Button>
      )}
    </div>
  )
}

