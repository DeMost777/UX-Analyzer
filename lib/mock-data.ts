import type { AnalysisResult, Screenshot } from "@/lib/types"
import { analyzeScreenshot } from "@/lib/ux-analyzer"

const mockScreenshots: Screenshot[] = [
  {
    id: "screen-1",
    name: "Login Screen",
    url: "/mobile-login-screen-ui-design-with-email-password-.jpg",
    width: 375,
    height: 600,
  },
  {
    id: "screen-2",
    name: "Dashboard",
    url: "/mobile-dashboard-ui-with-cards-and-charts-analytic.jpg",
    width: 375,
    height: 600,
  },
  {
    id: "screen-3",
    name: "Settings",
    url: "/mobile-settings-screen-ui-with-toggle-switches.jpg",
    width: 375,
    height: 600,
  },
]

async function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight })
      URL.revokeObjectURL(img.src)
    }
    img.onerror = () => {
      resolve({ width: 375, height: 812 })
    }
    img.src = URL.createObjectURL(file)
  })
}

export async function generateMockAnalysis(files: File[]): Promise<AnalysisResult> {
  if (files.length === 0) {
    return {
      id: `analysis-${Date.now()}`,
      createdAt: new Date(),
      screenshots: [],
      issues: [],
    }
  }

  // Build screenshots from uploaded files
  const screenshots: Screenshot[] = await Promise.all(
    files.map(async (file, index) => {
      const dimensions = await getImageDimensions(file)
      return {
        id: `screen-${index + 1}`,
        name: file.name.replace(/\.[^/.]+$/, "") || `Screen ${index + 1}`,
        url: URL.createObjectURL(file),
        width: dimensions.width,
        height: dimensions.height,
      }
    }),
  )

  // Run real UX analysis on each screenshot
  const allIssues = await Promise.all(files.map((file, index) => analyzeScreenshot(file, `screen-${index + 1}`)))

  return {
    id: `analysis-${Date.now()}`,
    createdAt: new Date(),
    screenshots,
    issues: allIssues.flat(),
  }
}