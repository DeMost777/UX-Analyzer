"use client"

import { useState, useEffect } from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { LoginScreen } from "@/components/auth/login-screen"
import { SignupScreen } from "@/components/auth/signup-screen"
import { DashboardScreen } from "@/components/dashboard/dashboard-screen"
import { FlowUXApp } from "@/components/flow-ux-app"
import type { Analysis } from "@/lib/db/types"
import type { AnalysisResult } from "@/lib/types"

type AppView = "login" | "signup" | "dashboard" | "analysis"

export function AppWrapper() {
  const [view, setView] = useState<AppView>("login")
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [currentAnalysis, setCurrentAnalysis] = useState<Analysis | null>(null)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/me")
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        setView("dashboard")
      } else {
        setView("login")
      }
    } catch (error) {
      console.error("Auth check error:", error)
      setView("login")
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = (userData: any) => {
    setUser(userData)
    setView("dashboard")
  }

  const handleSignup = (userData: any) => {
    setUser(userData)
    setView("dashboard")
  }

  const handleLogout = () => {
    setUser(null)
    setView("login")
    setCurrentAnalysis(null)
  }

  const handleViewAnalysis = (analysis: Analysis) => {
    setCurrentAnalysis(analysis)
    setView("analysis")
  }

  const handleBackToDashboard = () => {
    setCurrentAnalysis(null)
    setView("dashboard")
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0D0D0D]">
        <div className="text-gray-400">Loading...</div>
      </div>
    )
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
      {view === "login" && (
        <LoginScreen onLogin={handleLogin} onSwitchToSignup={() => setView("signup")} />
      )}
      {view === "signup" && (
        <SignupScreen onSignup={handleSignup} onSwitchToLogin={() => setView("login")} />
      )}
      {view === "dashboard" && user && (
        <DashboardScreen user={user} onLogout={handleLogout} onViewAnalysis={handleViewAnalysis} />
      )}
      {view === "analysis" && currentAnalysis && (
        <FlowUXAppWithAnalysis
          analysis={currentAnalysis}
          onBackToDashboard={handleBackToDashboard}
        />
      )}
    </ThemeProvider>
  )
}

// Wrapper component that integrates existing FlowUXApp with saved analysis
function FlowUXAppWithAnalysis({
  analysis,
  onBackToDashboard,
}: {
  analysis: Analysis
  onBackToDashboard: () => void
}) {
  // Convert saved analysis to AnalysisResult format
  const analysisResult: AnalysisResult | null = analysis.result_json || null

  if (!analysisResult) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0D0D0D]">
        <div className="text-center">
          <p className="mb-4 text-gray-400">Analysis is still processing...</p>
          <button onClick={onBackToDashboard} className="text-[#4F7CFF] hover:text-[#3D6AFF]">
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <FlowUXApp
      initialAnalysis={analysisResult}
      onBackToDashboard={onBackToDashboard}
    />
  )
}

