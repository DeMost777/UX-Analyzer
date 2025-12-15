/**
 * Vercel Blob Storage Implementation
 * 
 * This module provides file storage functionality using Vercel Blob Storage.
 * It replaces Firebase Storage with a simpler, Vercel-native solution.
 * 
 * NOTE: Direct Vercel Blob operations are now handled server-side via /api/upload
 * This file provides client-side wrappers that call the API route.
 */

/**
 * Upload a screenshot to Vercel Blob Storage with progress tracking
 * This function calls the API route which handles the upload server-side
 * @param file - The file to upload
 * @param userId - User ID for organizing files
 * @param analysisId - Analysis ID for organizing files
 * @param onProgress - Optional callback for upload progress (0-100)
 * @returns Download URL of the uploaded file
 */
export async function uploadScreenshot(
  file: File,
  userId: string,
  analysisId: string,
  onProgress?: (progress: number) => void,
): Promise<string> {
  try {
    // Validate file before upload
    if (!file || file.size === 0) {
      throw new Error("Invalid file: File is empty or not provided")
    }

    if (file.size > 10 * 1024 * 1024) {
      throw new Error(
        `File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds 10MB limit`
      )
    }

    console.log("Uploading file via API:", file.name, "Size:", file.size, "Type:", file.type)

    // Simulate progress
    if (onProgress) {
      onProgress(10)
    }

    // Create FormData to send to API route
    const formData = new FormData()
    formData.append("file", file)
    formData.append("userId", userId)
    formData.append("analysisId", analysisId)

    // Upload via API route (server-side)
    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    })

    if (onProgress) {
      onProgress(90)
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
      throw new Error(errorData.error || `Upload failed with status ${response.status}`)
    }

    const data = await response.json()

    if (onProgress) {
      onProgress(100)
    }

    console.log("Upload completed, URL:", data.url)

    return data.url
  } catch (error: any) {
    console.error("Error uploading screenshot:", error)
    console.error("Error details:", {
      message: error?.message,
      stack: error?.stack,
      name: error?.name,
    })

    // Provide more specific error messages
    if (error?.message?.includes("token") || error?.message?.includes("unauthorized")) {
      throw new Error(
        "Upload unauthorized. Please check BLOB_READ_WRITE_TOKEN environment variable."
      )
    } else if (error?.message?.includes("quota") || error?.message?.includes("limit")) {
      throw new Error(
        "Storage quota exceeded. Please upgrade your Vercel plan or delete some files."
      )
    } else if (error?.message) {
      throw new Error(`Upload failed: ${error.message}`)
    } else {
      throw new Error(
        "Failed to upload screenshot. Please check your internet connection and try again."
      )
    }
  }
}

/**
 * Upload multiple screenshots
 * @param files - Array of files to upload
 * @param userId - User ID
 * @param analysisId - Analysis ID
 * @returns Array of download URLs
 */
export async function uploadScreenshots(
  files: File[],
  userId: string,
  analysisId: string,
): Promise<string[]> {
  try {
    const uploadPromises = files.map((file) => uploadScreenshot(file, userId, analysisId))
    const urls = await Promise.all(uploadPromises)
    return urls
  } catch (error: any) {
    console.error("Error uploading screenshots:", error)
    throw new Error(error.message || "Failed to upload screenshots")
  }
}

/**
 * Delete a screenshot from Vercel Blob Storage
 * @param url - The URL of the file to delete
 * @note This function will need an API route to be implemented for server-side deletion
 */
export async function deleteScreenshot(url: string): Promise<void> {
  try {
    console.log("Deleting file from Vercel Blob:", url)
    
    // TODO: Implement API route for deletion
    // For now, just log - deletion can be implemented later if needed
    console.warn("Delete functionality not yet implemented via API route")
  } catch (error: any) {
    console.error("Error deleting screenshot:", error)
    throw new Error(error.message || "Failed to delete screenshot")
  }
}

/**
 * Calculate file size in MB
 */
export function getFileSizeMB(file: File): number {
  return file.size / (1024 * 1024)
}
