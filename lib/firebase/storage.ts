import { ref, uploadBytes, uploadBytesResumable, getDownloadURL, deleteObject, UploadResult, UploadTaskSnapshot } from "firebase/storage"
import { storage } from "./config"

// Check if Firebase Storage is initialized
function checkStorage() {
  if (!storage) {
    throw new Error("Firebase Storage is not initialized. Please check your environment variables.")
  }
}

/**
 * Upload a screenshot to Firebase Storage with progress tracking
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
    checkStorage()
    
    // Validate file before upload
    if (!file || file.size === 0) {
      throw new Error("Invalid file: File is empty or not provided")
    }
    
    if (file.size > 10 * 1024 * 1024) {
      throw new Error(`File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds 10MB limit`)
    }
    
    // Create a reference to the file location
    const filePath = `analyses/${userId}/${analysisId}/${file.name}`
    const fileRef = ref(storage!, filePath)
    
    console.log("Uploading file to:", filePath, "Size:", file.size, "Type:", file.type)

    // Use uploadBytesResumable for progress tracking if callback provided, otherwise use uploadBytes
    if (onProgress) {
      // Use resumable upload for progress tracking
      const uploadTask = uploadBytesResumable(fileRef, file)
      
      return new Promise((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          (snapshot: UploadTaskSnapshot) => {
            // Track upload progress
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            console.log(`Upload progress: ${progress.toFixed(1)}% (${snapshot.bytesTransferred}/${snapshot.totalBytes} bytes)`)
            onProgress(Math.round(progress))
          },
          (error) => {
            console.error("Upload error:", error)
            console.error("Error details:", {
              code: error?.code,
              message: error?.message,
              stack: error?.stack,
              name: error?.name
            })
            
            // Provide more specific error messages
            if (error?.code === "storage/unauthorized") {
              reject(new Error("Upload unauthorized. Please check Firebase Storage security rules and ensure you're logged in."))
            } else if (error?.code === "storage/canceled") {
              reject(new Error("Upload was canceled"))
            } else if (error?.code === "storage/unknown") {
              reject(new Error("Unknown storage error. Please check your internet connection and try again."))
            } else if (error?.message?.includes("quota") || error?.message?.includes("quota")) {
              reject(new Error("Storage quota exceeded. Please contact support or delete some files."))
            } else if (error?.message) {
              reject(new Error(`Upload failed: ${error.message}`))
            } else {
              reject(new Error("Failed to upload screenshot. Please check your internet connection and try again."))
            }
          },
          async () => {
            // Upload completed successfully
            console.log("Upload completed, getting download URL...")
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)
              console.log("Download URL obtained:", downloadURL.substring(0, 50) + "...")
              resolve(downloadURL)
            } catch (urlError: any) {
              console.error("Error getting download URL:", urlError)
              reject(new Error(`Upload completed but failed to get download URL: ${urlError.message || "Unknown error"}`))
            }
          }
        )
      })
    } else {
      // Use simple uploadBytes for smaller files or when progress not needed
      const snapshot: UploadResult = await uploadBytes(fileRef, file)
      console.log("Upload completed, getting download URL...")

      // Get the download URL
      const downloadURL = await getDownloadURL(snapshot.ref)
      console.log("Download URL obtained:", downloadURL.substring(0, 50) + "...")

      return downloadURL
    }
  } catch (error: any) {
    console.error("Error uploading screenshot:", error)
    console.error("Error details:", {
      code: error?.code,
      message: error?.message,
      stack: error?.stack,
      name: error?.name
    })
    
    // Provide more specific error messages
    if (error?.code === "storage/unauthorized") {
      throw new Error("Upload unauthorized. Please check Firebase Storage security rules and ensure you're logged in.")
    } else if (error?.code === "storage/canceled") {
      throw new Error("Upload was canceled")
    } else if (error?.code === "storage/unknown") {
      throw new Error("Unknown storage error. Please check your internet connection and try again.")
    } else if (error?.message?.includes("quota") || error?.message?.includes("quota")) {
      throw new Error("Storage quota exceeded. Please contact support or delete some files.")
    } else if (error?.message) {
      throw new Error(`Upload failed: ${error.message}`)
    } else {
      throw new Error("Failed to upload screenshot. Please check your internet connection and try again.")
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

