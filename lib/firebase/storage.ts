// Vercel Blob Storage Implementation
// This file now uses Vercel Blob instead of Firebase Storage
import {
  uploadScreenshot as blobUploadScreenshot,
  uploadScreenshots as blobUploadScreenshots,
  deleteScreenshot as blobDeleteScreenshot,
  getFileSizeMB,
} from "../storage/blob-storage"

/**
 * Upload a screenshot to Vercel Blob Storage with progress tracking
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
  return blobUploadScreenshot(file, userId, analysisId, onProgress)
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
  return blobUploadScreenshots(files, userId, analysisId)
}

/**
 * Delete a screenshot from Vercel Blob Storage
 * @param url - The URL of the file to delete
 */
export async function deleteScreenshot(url: string): Promise<void> {
  return blobDeleteScreenshot(url)
}

/**
 * Calculate file size in MB
 */
export { getFileSizeMB }

