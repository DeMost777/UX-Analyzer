// Database client abstraction
// In production, replace with actual database client (PostgreSQL, Supabase, etc.)

import type { User, Analysis, UsageStats, CreateAnalysisInput, UpdateAnalysisInput } from "./types"

// In-memory storage for development (replace with real database)
const db = {
  users: new Map<string, User>(),
  analyses: new Map<string, Analysis>(),
  usageStats: new Map<string, UsageStats>(),
}

// User operations
export async function createUser(email: string, passwordHash: string, name?: string): Promise<User> {
  const user: User = {
    user_id: crypto.randomUUID(),
    email,
    password_hash: passwordHash,
    name,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
  db.users.set(user.user_id, user)
  
  // Initialize usage stats
  const stats: UsageStats = {
    stat_id: crypto.randomUUID(),
    user_id: user.user_id,
    analyses_run: 0,
    storage_used_mb: 0,
    ai_requests: 0,
    updated_at: new Date().toISOString(),
  }
  db.usageStats.set(user.user_id, stats)
  
  return user
}

export async function getUserByEmail(email: string): Promise<User | null> {
  for (const user of db.users.values()) {
    if (user.email === email) {
      return { ...user, password_hash: undefined } as User
    }
  }
  return null
}

export async function getUserById(userId: string): Promise<User | null> {
  const user = db.users.get(userId)
  if (!user) return null
  return { ...user, password_hash: undefined } as User
}

export async function getUserWithPassword(email: string): Promise<(User & { password_hash: string }) | null> {
  for (const user of db.users.values()) {
    if (user.email === email) {
      return user as User & { password_hash: string }
    }
  }
  return null
}

export async function updateUserLastLogin(userId: string): Promise<void> {
  const user = db.users.get(userId)
  if (user) {
    user.last_login = new Date().toISOString()
    user.updated_at = new Date().toISOString()
    db.users.set(userId, user)
  }
}

// Analysis operations
export async function createAnalysis(input: CreateAnalysisInput): Promise<Analysis> {
  const analysis: Analysis = {
    analysis_id: crypto.randomUUID(),
    user_id: input.user_id,
    title: input.title,
    status: "processing",
    screenshot_url: input.screenshot_url,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
  db.analyses.set(analysis.analysis_id, analysis)
  return analysis
}

export async function getAnalysisById(analysisId: string): Promise<Analysis | null> {
  return db.analyses.get(analysisId) || null
}

export async function getAnalysesByUserId(userId: string, limit = 50): Promise<Analysis[]> {
  const analyses: Analysis[] = []
  for (const analysis of db.analyses.values()) {
    if (analysis.user_id === userId) {
      analyses.push(analysis)
    }
  }
  return analyses
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, limit)
}

export async function updateAnalysis(analysisId: string, input: UpdateAnalysisInput): Promise<Analysis | null> {
  const analysis = db.analyses.get(analysisId)
  if (!analysis) return null
  
  Object.assign(analysis, input, { updated_at: new Date().toISOString() })
  db.analyses.set(analysisId, analysis)
  return analysis
}

export async function deleteAnalysis(analysisId: string): Promise<boolean> {
  return db.analyses.delete(analysisId)
}

export async function searchAnalyses(userId: string, query: string): Promise<Analysis[]> {
  const analyses: Analysis[] = []
  const lowerQuery = query.toLowerCase()
  
  for (const analysis of db.analyses.values()) {
    if (analysis.user_id === userId && analysis.title.toLowerCase().includes(lowerQuery)) {
      analyses.push(analysis)
    }
  }
  
  return analyses.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
}

// Usage stats operations
export async function getUsageStats(userId: string): Promise<UsageStats | null> {
  return db.usageStats.get(userId) || null
}

export async function incrementUsageStats(userId: string, type: "analyses_run" | "ai_requests" | "storage_used_mb", value = 1): Promise<void> {
  const stats = db.usageStats.get(userId)
  if (stats) {
    if (type === "analyses_run") stats.analyses_run += value
    else if (type === "ai_requests") stats.ai_requests += value
    else if (type === "storage_used_mb") stats.storage_used_mb += value
    
    stats.updated_at = new Date().toISOString()
    db.usageStats.set(userId, stats)
  }
}

