"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/logo"
import { MarketingThemeToggle } from "@/components/marketing/theme-toggle"

export function MarketingHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur-md">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] rounded-md bg-background px-3 py-2 text-sm text-foreground shadow"
      >
        Skip to content
      </a>

      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <Link href="/marketing" className="flex items-center gap-2">
            <Logo className="h-8 w-8" />
            <span className="text-sm font-semibold tracking-tight">Flow UX AI</span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
            <a
              href="#features"
              className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground hover:bg-foreground/5"
            >
              Features
            </a>
            <a
              href="#workflow"
              className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground hover:bg-foreground/5"
            >
              Workflow
            </a>
            <a
              href="#security"
              className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground hover:bg-foreground/5"
            >
              Security
            </a>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <MarketingThemeToggle />
          <Link href="/">
            <Button
              className="group bg-primary text-primary-foreground hover:bg-primary/90"
              size="sm"
            >
              Open app
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  )
}
