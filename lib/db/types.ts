export interface User {
  user_id: string
  email: string
  password_hash?: string // Never return in API responses
  name?: string
  avatar_url?: string
  created_at: string
  last_login?: string
  updated_at: string
}

export interface Analysis {
  analysis_id: string
  user_id: string
  title: string
  status: "processing" | "completed" | "failed"
  screenshot_url?: string
  result_json?: any // AnalysisResult type
  created_at: string
  updated_at: string
}

export interface UsageStats {
  stat_id: string
  user_id: string
  analyses_run: number
  storage_used_mb: number
  ai_requests: number
  updated_at: string
}

export interface CreateAnalysisInput {
  user_id: string
  title: string
  screenshot_url?: string
}

export interface UpdateAnalysisInput {
  title?: string
  status?: "processing" | "completed" | "failed"
  result_json?: any
  screenshot_url?: string
}

