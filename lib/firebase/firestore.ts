import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore"
import { db } from "./config"
import type { Analysis, UsageStats } from "@/lib/db/types"

// Check if Firestore is initialized
function checkFirestore() {
  if (!db) {
    throw new Error("Firestore is not initialized. Please check your environment variables.")
  }
}

// Convert Firestore timestamp to ISO string
function timestampToISO(timestamp: any): string {
  if (timestamp?.toDate) {
    return timestamp.toDate().toISOString()
  }
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate().toISOString()
  }
  return timestamp || new Date().toISOString()
}

// User operations
export async function createUserDocument(uid: string, email: string, name?: string, avatarUrl?: string) {
  checkFirestore()
  await setDoc(
    doc(db!, "users", uid),
    {
      email,
      name: name || null,
      avatar_url: avatarUrl || null,
      created_at: serverTimestamp(),
      last_login: serverTimestamp(),
    },
    { merge: true },
  )
}

export async function getUserDocument(uid: string) {
  checkFirestore()
  const userDoc = await getDoc(doc(db!, "users", uid))
  if (!userDoc.exists()) {
    return null
  }
  return { user_id: uid, ...userDoc.data() }
}

export async function updateUserLastLogin(uid: string) {
  checkFirestore()
  await updateDoc(doc(db!, "users", uid), {
    last_login: serverTimestamp(),
  })
}

// Analysis operations
export async function createAnalysis(input: {
  user_id: string
  title: string
  screenshot_url?: string
}): Promise<Analysis> {
  checkFirestore()
  const analysisRef = doc(collection(db!, "analyses"))
  const analysis: Analysis = {
    analysis_id: analysisRef.id,
    user_id: input.user_id,
    title: input.title,
    status: "processing",
    screenshot_url: input.screenshot_url,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  await setDoc(analysisRef, {
    ...analysis,
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  })

  return analysis
}

export async function getAnalysisById(analysisId: string): Promise<Analysis | null> {
  checkFirestore()
  const analysisDoc = await getDoc(doc(db!, "analyses", analysisId))
  if (!analysisDoc.exists()) {
    return null
  }

  const data = analysisDoc.data()
  return {
    analysis_id: analysisDoc.id,
    user_id: data.user_id,
    title: data.title,
    status: data.status,
    screenshot_url: data.screenshot_url,
    result_json: data.result_json,
    created_at: timestampToISO(data.created_at),
    updated_at: timestampToISO(data.updated_at),
  }
}

export async function getAnalysesByUserId(userId: string, maxResults = 50): Promise<Analysis[]> {
  checkFirestore()
  const q = query(
    collection(db!, "analyses"),
    where("user_id", "==", userId),
    orderBy("created_at", "desc"),
    limit(maxResults),
  )

  const querySnapshot = await getDocs(q)
  return querySnapshot.docs.map((doc) => {
    const data = doc.data()
    return {
      analysis_id: doc.id,
      user_id: data.user_id,
      title: data.title,
      status: data.status,
      screenshot_url: data.screenshot_url,
      result_json: data.result_json,
      created_at: timestampToISO(data.created_at),
      updated_at: timestampToISO(data.updated_at),
    }
  })
}

export async function searchAnalyses(userId: string, searchQuery: string): Promise<Analysis[]> {
  // Firestore doesn't support full-text search natively
  // We'll fetch all user analyses and filter client-side
  // For production, consider using Algolia or similar
  const allAnalyses = await getAnalysesByUserId(userId, 100)
  const lowerQuery = searchQuery.toLowerCase()

  return allAnalyses.filter(
    (analysis) =>
      analysis.title.toLowerCase().includes(lowerQuery) ||
      analysis.status.toLowerCase().includes(lowerQuery),
  )
}

export async function updateAnalysis(
  analysisId: string,
  updates: {
    title?: string
    status?: "processing" | "completed" | "failed"
    result_json?: any
    screenshot_url?: string
  },
): Promise<Analysis | null> {
  try {
    checkFirestore()
    const analysisRef = doc(db!, "analyses", analysisId)
    await updateDoc(analysisRef, {
      ...updates,
      updated_at: serverTimestamp(),
    })

    return getAnalysisById(analysisId)
  } catch (error) {
    console.error("Error updating analysis:", error)
    return null
  }
}

export async function deleteAnalysis(analysisId: string): Promise<boolean> {
  try {
    checkFirestore()
    await deleteDoc(doc(db!, "analyses", analysisId))
    return true
  } catch (error) {
    console.error("Error deleting analysis:", error)
    return false
  }
}

// Usage stats operations
export async function getUsageStats(userId: string): Promise<UsageStats | null> {
  checkFirestore()
  const statsDoc = await getDoc(doc(db!, "usage_stats", userId))
  if (!statsDoc.exists()) {
    // Create default stats if doesn't exist
    const defaultStats: UsageStats = {
      stat_id: userId,
      user_id: userId,
      analyses_run: 0,
      storage_used_mb: 0,
      ai_requests: 0,
      updated_at: new Date().toISOString(),
    }
    await setDoc(doc(db!, "usage_stats", userId), {
      ...defaultStats,
      updated_at: serverTimestamp(),
    })
    return defaultStats
  }

  const data = statsDoc.data()
  return {
    stat_id: statsDoc.id,
    user_id: data.user_id || userId,
    analyses_run: data.analyses_run || 0,
    storage_used_mb: data.storage_used_mb || 0,
    ai_requests: data.ai_requests || 0,
    updated_at: timestampToISO(data.updated_at),
  }
}

export async function incrementUsageStats(
  userId: string,
  type: "analyses_run" | "ai_requests" | "storage_used_mb",
  value = 1,
): Promise<void> {
  checkFirestore()
  const statsRef = doc(db!, "usage_stats", userId)
  const statsDoc = await getDoc(statsRef)

  if (!statsDoc.exists()) {
    // Create default stats
    await setDoc(statsRef, {
      user_id: userId,
      analyses_run: 0,
      storage_used_mb: 0,
      ai_requests: 0,
      updated_at: serverTimestamp(),
    })
  }

  await updateDoc(statsRef, {
    [type]: statsDoc.exists()
      ? (statsDoc.data()[type] || 0) + value
      : value,
    updated_at: serverTimestamp(),
  })
}

