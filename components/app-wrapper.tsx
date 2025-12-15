"use client"

import { useState, useEffect } from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { LoginScreen } from "@/components/auth/login-screen"
import { SignupScreen } from "@/components/auth/signup-screen"
import { DashboardScreen } from "@/components/dashboard/dashboard-screen"
import { FlowUXApp } from "@/components/flow-ux-app"
import { onAuthStateChange, logoutUser, getCurrentUser } from "@/lib/firebase/auth"
import { getUserData } from "@/lib/firebase/auth"
import type { Analysis } from "@/lib/db/types"
import type { AnalysisResult } from "@/lib/types"

type AppView = "login" | "signup" | "dashboard" | "analysis"

export function AppWrapper() {
  const [view, setView] = useState<AppView>("login")
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [currentAnalysis, setCurrentAnalysis] = useState<Analysis | null>(null)

  useEffect(() => {
    // Listen to Firebase auth state changes
    const unsubscribe = onAuthStateChange(async (firebaseUser) => {
      if (firebaseUser) {
        // Get additional user data from Firestore
        const userData = await getUserData(firebaseUser.uid)
        setUser({
          user_id: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName || userData?.displayName,
          avatar_url: firebaseUser.photoURL || userData?.photoURL,
        })
        setView("dashboard")
      } else {
        setUser(null)
        setView("login")
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const handleLogin = (userData: any) => {
    setUser(userData)
    setView("dashboard")
  }

  const handleSignup = (userData: any) => {
    setUser(userData)
    setView("dashboard")
  }

  const handleLogout = async () => {
    try {
      await logoutUser()
      setUser(null)
      setView("login")
      setCurrentAnalysis(null)
    } catch (error) {
      console.error("Logout error:", error)
    }
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
  // Normalize the result_json to ensure createdAt is properly formatted
  const rawResult = analysis.result_json
  let analysisResult: AnalysisResult | null = null
  
  if (rawResult) {
    analysisResult = {
      ...rawResult,
      // Ensure createdAt is a valid date string
      createdAt: (() => {
        try {
          if (rawResult.createdAt instanceof Date) {
            return rawResult.createdAt.toISOString()
          }
          if (typeof rawResult.createdAt === 'string') {
            // Validate it's a valid date string
            const date = new Date(rawResult.createdAt)
            if (!isNaN(date.getTime())) {
              return rawResult.createdAt
            }
          }
          // Fallback to current date
          return new Date().toISOString()
        } catch {
          return new Date().toISOString()
        }
      })(),
    } as AnalysisResult
  }

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

