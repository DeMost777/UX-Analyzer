export interface Screenshot {
    id: string
    name: string
    url: string
    width: number
    height: number
  }
  
  export interface UXIssue {
    id: string
    screenshotId: string
    problem: string
    cause: string
    fix: string
    severity: "critical" | "major" | "minor"
    category: "visual" | "accessibility" | "logic"
    coordinates: {
      x: number
      y: number
    }
  }
  
  export interface AnalysisResult {
    id: string
    createdAt: Date | string // Accept both Date and ISO string for Firestore compatibility
    screenshots: Screenshot[]
    issues: UXIssue[]
  }