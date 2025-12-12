"use client"

import { useEffect, useState } from "react"
import { BarChart3, FileText, HardDrive } from "lucide-react"
import { getCurrentUser } from "@/lib/firebase/auth"
import { getUsageStats } from "@/lib/firebase/firestore"
import type { UsageStats } from "@/lib/db/types"

export function UsageStatsWidget() {
  const [stats, setStats] = useState<UsageStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const currentUser = getCurrentUser()
      if (!currentUser) {
        setLoading(false)
        return
      }

      const userStats = await getUsageStats(currentUser.uid)
      setStats(userStats)
    } catch (error) {
      console.error("Failed to load stats:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !stats) {
    return null
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <div className="rounded-lg border border-[#1A1A1A] bg-[#111111] p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400">Analyses Run</p>
            <p className="mt-1 text-2xl font-semibold text-white">{stats.analyses_run}</p>
          </div>
          <div className="rounded-full bg-[#4F7CFF]/10 p-3">
            <FileText className="h-5 w-5 text-[#4F7CFF]" />
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-[#1A1A1A] bg-[#111111] p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400">AI Requests</p>
            <p className="mt-1 text-2xl font-semibold text-white">{stats.ai_requests}</p>
          </div>
          <div className="rounded-full bg-[#4F7CFF]/10 p-3">
            <BarChart3 className="h-5 w-5 text-[#4F7CFF]" />
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-[#1A1A1A] bg-[#111111] p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400">Storage Used</p>
            <p className="mt-1 text-2xl font-semibold text-white">
              {stats.storage_used_mb.toFixed(1)} MB
            </p>
          </div>
          <div className="rounded-full bg-[#4F7CFF]/10 p-3">
            <HardDrive className="h-5 w-5 text-[#4F7CFF]" />
          </div>
        </div>
      </div>
    </div>
  )
}

