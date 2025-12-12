"use client"

import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/theme-provider"
import { Moon, Sun, Plus, ArrowLeft } from "lucide-react"
import { Logo } from "@/components/logo"
import type { AppScreen } from "@/components/flow-ux-app"

interface AppHeaderProps {
  currentScreen: AppScreen
  onNewAnalysis: () => void
  hasAnalysis: boolean
  showBackButton?: boolean
}

export function AppHeader({ currentScreen, onNewAnalysis, hasAnalysis, showBackButton }: AppHeaderProps) {
  const { theme, setTheme } = useTheme()

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="flex h-14 items-center justify-between px-6">
        <div className="flex items-center gap-3">
          {showBackButton && (
            <Button variant="ghost" size="icon" onClick={onNewAnalysis} className="h-9 w-9">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <div className="flex items-center gap-2">
            <Logo className="h-8 w-8" />
            <span className="text-lg font-semibold tracking-tight">Flow UX AI</span>
          </div>
          {currentScreen !== "upload" && (
            <div className="ml-4 flex items-center gap-1 text-sm text-muted-foreground">
              <span className="rounded bg-muted px-2 py-0.5 text-xs font-medium capitalize">{currentScreen}</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {hasAnalysis && currentScreen !== "upload" && (
            <Button variant="outline" size="sm" onClick={onNewAnalysis} className="gap-2 bg-transparent">
              <Plus className="h-4 w-4" />
              New Analysis
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="h-9 w-9"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
