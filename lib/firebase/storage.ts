import { ref, uploadBytes, getDownloadURL, deleteObject, UploadResult } from "firebase/storage"
import { storage } from "./config"

// Check if Firebase Storage is initialized
function checkStorage() {
  if (!storage) {
    throw new Error("Firebase Storage is not initialized. Please check your environment variables.")
  }
}

/**
 * Upload a screenshot to Firebase Storage
 * @param file - The file to upload
 * @param userId - User ID for organizing files
 * @param analysisId - Analysis ID for organizing files
 * @returns Download URL of the uploaded file
 */
export async function uploadScreenshot(
  file: File,
  userId: string,
  analysisId: string,
): Promise<string> {
  try {
    checkStorage()
    // Create a reference to the file location
    const fileRef = ref(storage!, `analyses/${userId}/${analysisId}/${file.name}`)

    // Upload the file
    const snapshot: UploadResult = await uploadBytes(fileRef, file)

    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref)

    return downloadURL
  } catch (error: any) {
    console.error("Error uploading screenshot:", error)
    throw new Error(error.message || "Failed to upload screenshot")
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
 * Delete a screenshot from Firebase Storage
 * @param url - The download URL of the file to delete
 */
export async function deleteScreenshot(url: string): Promise<void> {
  try {
    checkStorage()
    // Extract the file path from the URL
    const urlObj = new URL(url)
    const path = decodeURIComponent(urlObj.pathname.split("/o/")[1].split("?")[0])

    // Create a reference to the file
    const fileRef = ref(storage!, path)

    // Delete the file
    await deleteObject(fileRef)
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

