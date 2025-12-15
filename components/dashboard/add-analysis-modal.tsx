"use client"

import { useState, useCallback } from "react"
import { X, Upload, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useDropzone } from "react-dropzone"
import { getCurrentUser } from "@/lib/firebase/auth"
import { uploadScreenshot, getFileSizeMB } from "@/lib/firebase/storage"
import { createAnalysis, incrementUsageStats, updateAnalysis, getAnalysisById } from "@/lib/firebase/firestore"
import { analyzeScreenshot } from "@/lib/ux-analyzer"
import type { Analysis } from "@/lib/db/types"
import type { AnalysisResult } from "@/lib/types"

interface AddAnalysisModalProps {
  onClose: () => void
  onAnalysisCreated: (analysis: Analysis) => void
}

export function AddAnalysisModal({ onClose, onAnalysisCreated }: AddAnalysisModalProps) {
  const [title, setTitle] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [status, setStatus] = useState<string>("")
  const [error, setError] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState<number>(0)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      setFile(file)
      const reader = new FileReader()
      reader.onload = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".webp"],
    },
    maxFiles: 1,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || !title.trim()) return

    setUploading(true)
    setStatus("Creating analysis...")
    setError(null)
    setUploadProgress(0)

    try {
      const currentUser = getCurrentUser()
      if (!currentUser) {
        throw new Error("User not authenticated. Please log in and try again.")
      }

      // Validate file before proceeding
      if (file.size > 10 * 1024 * 1024) {
        throw new Error("File size exceeds 10MB limit. Please use a smaller image.")
      }

      const validImageTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif"]
      if (!validImageTypes.includes(file.type)) {
        throw new Error(`Invalid file type: ${file.type}. Please upload a PNG, JPEG, WEBP, or GIF image.`)
      }

      // Create analysis record first to get the analysis ID
      setStatus("Creating analysis record...")
      let analysis
      try {
        analysis = await createAnalysis({
          user_id: currentUser.uid,
          title: title.trim(),
        })
      } catch (createError: any) {
        throw new Error(`Failed to create analysis: ${createError.message || "Unknown error"}`)
      }

      // Upload screenshot to Firebase Storage (if file exists)
      if (file) {
        let screenshotUrl: string | null = null
        
        try {
          setStatus("Uploading screenshot...")
          setUploadProgress(0)
          console.log("Starting upload for file:", file.name, "Size:", file.size)
          
          // Upload with progress tracking
          screenshotUrl = await uploadScreenshot(
            file, 
            currentUser.uid, 
            analysis.analysis_id,
            (progress) => {
              setUploadProgress(progress)
              if (progress < 100) {
                setStatus(`Uploading screenshot... ${progress}%`)
              } else {
                setStatus("Upload complete, processing...")
              }
            }
          )
          setUploadProgress(100)
          console.log("Upload completed, URL:", screenshotUrl)
          
          // Validate screenshot URL before updating
          if (screenshotUrl && typeof screenshotUrl === "string" && screenshotUrl.trim().length > 0) {
            // Update analysis with screenshot URL
            await updateAnalysis(analysis.analysis_id, {
              screenshot_url: screenshotUrl,
            })
          } else {
            throw new Error("Invalid screenshot URL received from upload")
          }

          // Update usage stats
          const fileSizeMB = getFileSizeMB(file)
          await incrementUsageStats(currentUser.uid, "storage_used_mb", fileSizeMB)
        } catch (uploadError: any) {
          console.error("Failed to upload screenshot:", uploadError)
          const errorMessage = uploadError.message || "Unknown upload error"
          setError(`Upload failed: ${errorMessage}`)
          setStatus(`Upload error: ${errorMessage}`)
          
          // Update status to failed
          try {
            await updateAnalysis(analysis.analysis_id, {
              status: "failed",
            })
          } catch (updateError) {
            console.error("Failed to update analysis status:", updateError)
          }
          
          // Don't continue with analysis if upload failed
          setUploading(false)
          return
        }

        // Run UX analysis on the screenshot
        try {
          setStatus("Preparing image for analysis...")
          
          // Get image dimensions with timeout
          const imageDimensions = await Promise.race([
            new Promise<{ width: number; height: number }>((resolve, reject) => {
              const img = new Image()
              const objectUrl = URL.createObjectURL(file)
              
              const cleanup = () => {
                URL.revokeObjectURL(objectUrl)
              }
              
              img.onload = () => {
                if (img.width === 0 || img.height === 0) {
                  cleanup()
                  reject(new Error("Invalid image dimensions"))
                  return
                }
                resolve({ width: img.width, height: img.height })
                cleanup()
              }
              
              img.onerror = (e) => {
                cleanup()
                reject(new Error("Failed to load image. The file may be corrupted."))
              }
              
              img.src = objectUrl
            }),
            new Promise<never>((_, reject) => {
              setTimeout(() => {
                reject(new Error("Image loading timeout. The file may be too large or corrupted."))
              }, 10000) // 10 second timeout for image loading
            })
          ])

          if (imageDimensions.width === 0 || imageDimensions.height === 0) {
            throw new Error("Invalid image dimensions. Please use a valid image file.")
          }

          setStatus("Running UX analysis... (this may take 30-60 seconds)")
          console.log("Starting UX analysis for analysis:", analysis.analysis_id)
          
          // Add progress updates during analysis
          const progressInterval = setInterval(() => {
            setStatus((prev) => {
              if (prev.includes("Running UX analysis")) {
                return "Running UX analysis... (still processing, please wait)"
              }
              return prev
            })
          }, 15000) // Update every 15 seconds
          
          try {
            // Add timeout to prevent hanging indefinitely
            const analysisPromise = analyzeScreenshot(file, analysis.analysis_id)
            const timeoutPromise = new Promise<never>((_, reject) => {
              setTimeout(() => {
                console.error("Analysis timeout after 90 seconds")
                reject(new Error("Analysis timed out after 90 seconds. The image may be too complex. Please try with a simpler image."))
              }, 90000) // Increased to 90 seconds
            })
            
            const issues = await Promise.race([analysisPromise, timeoutPromise])
            clearInterval(progressInterval)
            
            console.log("UX analysis completed, found", issues.length, "issues")
            
            // Create analysis result object
            // Use ISO string for createdAt to avoid date parsing issues
            const analysisResult: AnalysisResult = {
              id: analysis.analysis_id,
              createdAt: new Date().toISOString() as any, // Store as ISO string for Firestore compatibility
              screenshots: [
                {
                  id: analysis.analysis_id,
                  name: file.name,
                  url: screenshotUrl!,
                  width: imageDimensions.width,
                  height: imageDimensions.height,
                },
              ],
              issues: issues,
            }

            setStatus("Saving results...")
            
            // Update analysis with results
            await updateAnalysis(analysis.analysis_id, {
              status: "completed",
              result_json: analysisResult,
            })

            // Increment AI requests usage stats
            await incrementUsageStats(currentUser.uid, "ai_requests", 1)

            // Reload analysis to get updated data
            const updated = await getAnalysisById(analysis.analysis_id)
            if (updated) {
              setStatus("Complete!")
              setTimeout(() => {
                onAnalysisCreated(updated)
                onClose()
              }, 500)
              return
            } else {
              throw new Error("Failed to retrieve updated analysis")
            }
          } catch (analysisError: any) {
            clearInterval(progressInterval)
            console.error("Failed to analyze screenshot:", analysisError)
            
            const errorMessage = analysisError instanceof Error 
              ? analysisError.message 
              : "Unknown analysis error"
            
            setError(`Analysis failed: ${errorMessage}`)
            setStatus(`Analysis error: ${errorMessage}`)
            
            // Update status to failed
            try {
              await updateAnalysis(analysis.analysis_id, {
                status: "failed",
              })
            } catch (updateError) {
              console.error("Failed to update analysis status:", updateError)
            }
            
            // Still return the analysis so user can see it
            const updated = await getAnalysisById(analysis.analysis_id)
            if (updated) {
              // Don't close modal on error, let user see the error
              setUploading(false)
              return
            }
          }
        } catch (imageError: any) {
          console.error("Failed to process image:", imageError)
          const errorMessage = imageError instanceof Error 
            ? imageError.message 
            : "Unknown image processing error"
          
          setError(`Image processing failed: ${errorMessage}`)
          setStatus(`Error: ${errorMessage}`)
          
          // Update status to failed
          try {
            await updateAnalysis(analysis.analysis_id, {
              status: "failed",
            })
          } catch (updateError) {
            console.error("Failed to update analysis status:", updateError)
          }
          
          setUploading(false)
          return
        }
      }

      // If no file was uploaded, still return the analysis
      onAnalysisCreated(analysis)
      onClose()
    } catch (error: any) {
      console.error("Failed to create analysis:", error)
      const errorMessage = error.message || "Failed to create analysis. Please try again."
      setError(errorMessage)
      setStatus(`Error: ${errorMessage}`)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-2xl rounded-lg border border-[#1A1A1A] bg-[#111111] p-6 shadow-xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="mb-6 text-xl font-semibold text-white">New Analysis</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="title" className="text-gray-300">
              Title
            </Label>
            <Input
              id="title"
              type="text"
              placeholder="My UX Analysis"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="mt-2 bg-[#0D0D0D] border-[#1A1A1A] text-white"
            />
          </div>

          <div>
            <Label className="text-gray-300">Screenshot</Label>
            <div
              {...getRootProps()}
              className={`mt-2 cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
                isDragActive
                  ? "border-[#4F7CFF] bg-[#4F7CFF]/5"
                  : "border-[#1A1A1A] bg-[#0D0D0D] hover:border-[#2A2A2A]"
              }`}
            >
              <input {...getInputProps()} />
              {preview ? (
                <div className="space-y-2">
                  <img src={preview} alt="Preview" className="mx-auto max-h-64 rounded-md" />
                  <p className="text-sm text-gray-400">{file?.name}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="mx-auto h-8 w-8 text-gray-500" />
                  <p className="text-sm text-gray-400">
                    {isDragActive ? "Drop the file here" : "Drag & drop or click to upload"}
                  </p>
                  <p className="text-xs text-gray-500">PNG, JPG, WEBP up to 10MB</p>
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-4">
              <p className="text-sm text-red-400">{error}</p>
              <button
                type="button"
                onClick={() => setError(null)}
                className="mt-2 text-xs text-red-300 hover:text-red-200 underline"
              >
                Dismiss
              </button>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose} 
              disabled={uploading}
              className="border-[#1A1A1A] text-white"
            >
              {uploading ? "Processing..." : "Cancel"}
            </Button>
            <Button
              type="submit"
              disabled={!file || !title.trim() || uploading}
              className="bg-[#4F7CFF] hover:bg-[#3D6AFF] text-white disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {status || "Creating..."}
                  {uploadProgress > 0 && uploadProgress < 100 && (
                    <span className="ml-2 text-xs">({uploadProgress}%)</span>
                  )}
                </>
              ) : (
                "Create Analysis"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

