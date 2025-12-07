"use client"

import { useState, useEffect } from "react"
import { Search, Plus, MoreVertical, Image as ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AnalysisCard } from "./analysis-card"
import { UserMenu } from "./user-menu"
import { UsageStatsWidget } from "./usage-stats-widget"
import { EmptyState } from "./empty-state"
import { AddAnalysisModal } from "./add-analysis-modal"
import { getCurrentUser } from "@/lib/firebase/auth"
import { getAnalysesByUserId, searchAnalyses, deleteAnalysis as deleteAnalysisFirestore, updateAnalysis as updateAnalysisFirestore } from "@/lib/firebase/firestore"
import type { Analysis } from "@/lib/db/types"
import type { AnalysisResult } from "@/lib/types"

interface DashboardScreenProps {
  user: {
    user_id: string
    email: string
    name?: string
    avatar_url?: string
  }
  onLogout: () => void
  onViewAnalysis: (analysis: Analysis) => void
}

export function DashboardScreen({ user, onLogout, onViewAnalysis }: DashboardScreenProps) {
  const [analyses, setAnalyses] = useState<Analysis[]>([])
  const [filteredAnalyses, setFilteredAnalyses] = useState<Analysis[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [showAddModal, setShowAddModal] = useState(false)

  useEffect(() => {
    loadAnalyses()
  }, [])

  useEffect(() => {
    const performSearch = async () => {
      const currentUser = getCurrentUser()
      if (!currentUser) return

      if (searchQuery.trim() === "") {
        setFilteredAnalyses(analyses)
      } else {
        try {
          const searchResults = await searchAnalyses(currentUser.uid, searchQuery)
          setFilteredAnalyses(searchResults)
        } catch (error) {
          console.error("Search error:", error)
          // Fallback to client-side filtering
          const query = searchQuery.toLowerCase()
          setFilteredAnalyses(
            analyses.filter((a) => a.title.toLowerCase().includes(query) || a.status.toLowerCase().includes(query)),
          )
        }
      }
    }

    performSearch()
  }, [searchQuery, analyses])

  const loadAnalyses = async () => {
    try {
      const currentUser = getCurrentUser()
      if (!currentUser) {
        setLoading(false)
        return
      }

      const userAnalyses = await getAnalysesByUserId(currentUser.uid)
      setAnalyses(userAnalyses)
      setFilteredAnalyses(userAnalyses)
    } catch (error) {
      console.error("Failed to load analyses:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAnalysisCreated = async (analysis: Analysis) => {
    setAnalyses([analysis, ...analyses])
    setShowAddModal(false)
  }

  const handleDeleteAnalysis = async (analysisId: string) => {
    try {
      const success = await deleteAnalysisFirestore(analysisId)
      if (success) {
        setAnalyses(analyses.filter((a) => a.analysis_id !== analysisId))
      }
    } catch (error) {
      console.error("Failed to delete analysis:", error)
    }
  }

  const handleRenameAnalysis = async (analysisId: string, newTitle: string) => {
    try {
      const updated = await updateAnalysisFirestore(analysisId, { title: newTitle })
      if (updated) {
        setAnalyses(analyses.map((a) => (a.analysis_id === analysisId ? updated : a)))
      }
    } catch (error) {
      console.error("Failed to rename analysis:", error)
    }
  }

  return (
    <div className="min-h-screen bg-[#0D0D0D]">
      {/* Header */}
      <header className="border-b border-[#1A1A1A] bg-[#111111]">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <h1 className="text-xl font-semibold text-white">Flow UX AI</h1>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search analyses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-[#0D0D0D] border-[#1A1A1A] text-white placeholder:text-gray-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button
                onClick={() => setShowAddModal(true)}
                className="bg-[#4F7CFF] hover:bg-[#3D6AFF] text-white"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add New
              </Button>
              <UserMenu user={user} onLogout={onLogout} />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Usage Stats Widget */}
        <UsageStatsWidget />

        {/* Analyses Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-400">Loading...</div>
          </div>
        ) : filteredAnalyses.length === 0 ? (
          <EmptyState onAddNew={() => setShowAddModal(true)} hasSearched={searchQuery.trim() !== ""} />
        ) : (
          <div className="mt-8">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">
                {searchQuery ? `Search results (${filteredAnalyses.length})` : "Recent Analyses"}
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredAnalyses.map((analysis) => (
                <AnalysisCard
                  key={analysis.analysis_id}
                  analysis={analysis}
                  onView={() => onViewAnalysis(analysis)}
                  onDelete={() => handleDeleteAnalysis(analysis.analysis_id)}
                  onRename={(newTitle) => handleRenameAnalysis(analysis.analysis_id, newTitle)}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Add Analysis Modal */}
      {showAddModal && (
        <AddAnalysisModal
          onClose={() => setShowAddModal(false)}
          onAnalysisCreated={handleAnalysisCreated}
        />
      )}
    </div>
  )
}

