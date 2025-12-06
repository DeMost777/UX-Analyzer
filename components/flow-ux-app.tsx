"use client"

import { useState } from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { LandingScreen } from "@/components/screens/landing-screen"
import { UploadScreen } from "@/components/screens/upload-screen"
import { ReviewScreen } from "@/components/screens/review-screen"
import { ExportScreen } from "@/components/screens/export-screen"
import { AppHeader } from "@/components/app-header"
import type { AnalysisResult } from "@/lib/types"

export type AppScreen = "landing" | "upload" | "review" | "export"

export function FlowUXApp() {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>("landing")
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [pendingFiles, setPendingFiles] = useState<File[] | null>(null)

  const handleFilesFromLanding = (files: File[]) => {
    setPendingFiles(files)
    setCurrentScreen("upload")
  }

  const handleAnalysisComplete = (result: AnalysisResult) => {
    setAnalysisResult(result)
    setPendingFiles(null)
    setCurrentScreen("review")
  }

  const handleExport = () => {
    setCurrentScreen("export")
  }

  const handleBackToReview = () => {
    setCurrentScreen("review")
  }

  const handleNewAnalysis = () => {
    setAnalysisResult(null)
    setPendingFiles(null)
    setCurrentScreen("landing")
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
      <div className="min-h-screen bg-background">
        {currentScreen !== "landing" && (
          <AppHeader currentScreen={currentScreen} onNewAnalysis={handleNewAnalysis} hasAnalysis={!!analysisResult} />
        )}
        <main>
          {currentScreen === "landing" && <LandingScreen onFilesSelected={handleFilesFromLanding} />}
          {currentScreen === "upload" && (
            <UploadScreen onAnalysisComplete={handleAnalysisComplete} initialFiles={pendingFiles} />
          )}
          {currentScreen === "review" && analysisResult && (
            <ReviewScreen analysisResult={analysisResult} onExport={handleExport} />
          )}
          {currentScreen === "export" && analysisResult && (
            <ExportScreen analysisResult={analysisResult} onBack={handleBackToReview} />
          )}
        </main>
      </div>
    </ThemeProvider>
  )
}
