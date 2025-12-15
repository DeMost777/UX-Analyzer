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

// Helper function to remove undefined values from an object
// Firestore does not allow undefined values
function removeUndefined<T extends Record<string, any>>(obj: T): T {
  const cleaned: any = {}
  for (const key in obj) {
    const value = obj[key]
    // Explicitly check for undefined (not just falsy values)
    if (value !== undefined) {
      // Also check nested objects/arrays
      // Skip Firestore Timestamps (they have toDate method) and Date objects
      if (value && typeof value === "object") {
        const valueObj = value as any
        // Check if it's a Date or Firestore Timestamp
        if (valueObj instanceof Date || typeof valueObj.toDate === "function") {
          cleaned[key] = value
        } else if (!Array.isArray(value)) {
          // Recursively clean nested objects
          cleaned[key] = removeUndefined(value)
        } else {
          cleaned[key] = value
        }
      } else {
        cleaned[key] = value
      }
    }
  }
  return cleaned as T
}

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

// Normalize AnalysisResult to ensure createdAt is always a valid ISO string
function normalizeAnalysisResult(result: any): any {
  if (!result || typeof result !== 'object') {
    return result
  }
  
  // Normalize createdAt field
  if (result.createdAt !== undefined) {
    try {
      if (result.createdAt instanceof Date) {
        result.createdAt = result.createdAt.toISOString()
      } else if (typeof result.createdAt === 'string') {
        // Validate it's a valid date string
        const date = new Date(result.createdAt)
        if (isNaN(date.getTime())) {
          result.createdAt = new Date().toISOString()
        }
      } else {
        // Invalid date, use current date
        result.createdAt = new Date().toISOString()
      }
    } catch {
      result.createdAt = new Date().toISOString()
    }
  }
  
  return result
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

export async function updateUserDocument(
  uid: string,
  updates: {
    avatar_url?: string | null
    name?: string | null
    preferences?: {
      enable_wcag_checks?: boolean
      enable_cognitive_load_analysis?: boolean
    }
  }
): Promise<void> {
  checkFirestore()
  const updateData: any = {
    updated_at: serverTimestamp(),
  }

  if (updates.avatar_url !== undefined) {
    updateData.avatar_url = updates.avatar_url
  }
  if (updates.name !== undefined) {
    updateData.name = updates.name
  }
  if (updates.preferences !== undefined) {
    updateData.preferences = updates.preferences
  }

  await setDoc(doc(db!, "users", uid), updateData, { merge: true })
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
  
  // Prepare Firestore document data
  // CRITICAL: Firestore does not allow undefined values - we must never include them
  const firestoreData: Record<string, any> = {
    user_id: input.user_id,
    title: input.title,
    status: "processing",
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  }

  // Only add screenshot_url if it's a valid non-empty string
  // Explicitly check for all invalid cases to prevent undefined from reaching Firestore
  const hasValidScreenshotUrl =
    input.screenshot_url !== undefined &&
    input.screenshot_url !== null &&
    input.screenshot_url !== "" &&
    typeof input.screenshot_url === "string" &&
    input.screenshot_url.trim().length > 0

  if (hasValidScreenshotUrl) {
    firestoreData.screenshot_url = input.screenshot_url
  }
  // If screenshot_url is invalid, we don't include it at all (Firestore will not have this field)

  // Remove any undefined values as a final safety check
  const cleanedData = removeUndefined(firestoreData)
  
  // Double-check: ensure no undefined values exist (defensive programming)
  for (const key in cleanedData) {
    if (cleanedData[key] === undefined) {
      console.error(`ERROR: Found undefined value in field "${key}" before setDoc. Removing it.`)
      delete cleanedData[key]
    }
  }
  
  await setDoc(analysisRef, cleanedData)

  // Return analysis object with ISO timestamps
  const analysis: Analysis = {
    analysis_id: analysisRef.id,
    user_id: input.user_id,
    title: input.title,
    status: "processing",
    screenshot_url: input.screenshot_url || undefined,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

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
    screenshot_url: data.screenshot_url || undefined, // Convert null/empty to undefined for TypeScript
    result_json: data.result_json ? normalizeAnalysisResult(data.result_json) : undefined,
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
      screenshot_url: data.screenshot_url || undefined, // Convert null/empty to undefined
      result_json: data.result_json ? normalizeAnalysisResult(data.result_json) : undefined,
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
    
    // Prepare update data, excluding undefined values
    const updateData: any = {
      updated_at: serverTimestamp(),
    }

    if (updates.title !== undefined) updateData.title = updates.title
    if (updates.status !== undefined) updateData.status = updates.status
    if (updates.result_json !== undefined) updateData.result_json = updates.result_json
    // Handle screenshot_url with extra care
    if (updates.screenshot_url !== undefined) {
      // Only include screenshot_url if it's a valid non-empty string
      if (updates.screenshot_url === null) {
        // Set to null to clear the field
        updateData.screenshot_url = null
      } else if (
        typeof updates.screenshot_url === "string" &&
        updates.screenshot_url.trim().length > 0
      ) {
        updateData.screenshot_url = updates.screenshot_url
      }
      // If it's undefined or empty string, don't include it at all
    }

    // Remove any undefined values as a final safety check
    const cleanedUpdateData = removeUndefined(updateData)
    
    // Double-check: ensure no undefined values exist (defensive programming)
    for (const key in cleanedUpdateData) {
      if (cleanedUpdateData[key] === undefined) {
        console.error(`ERROR: Found undefined value in field "${key}" before updateDoc. Removing it.`)
        delete cleanedUpdateData[key]
      }
    }
    
    await updateDoc(analysisRef, cleanedUpdateData)

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

