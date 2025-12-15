"use client"

import { useState, useCallback } from "react"
import { X, Upload, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useDropzone } from "react-dropzone"
import { getCurrentUser } from "@/lib/firebase/auth"
import { uploadScreenshot, uploadScreenshots, getFileSizeMB } from "@/lib/firebase/storage"
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
  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<Array<{ file: File; url: string }>>([])
  const [uploading, setUploading] = useState(false)
  const [status, setStatus] = useState<string>("")
  const [error, setError] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState<number>(0)

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    console.log("onDrop called with", acceptedFiles.length, "accepted files")
    if (rejectedFiles.length > 0) {
      console.warn("Rejected files:", rejectedFiles)
    }

    const validFiles: File[] = []

    // First, validate all files
    acceptedFiles.forEach((file) => {
      // Validate file size
      if (file.size > 10 * 1024 * 1024) {
        console.warn(`File ${file.name} exceeds 10MB limit, skipping`)
        return
      }

      // Validate file type
      const validImageTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif"]
      if (!validImageTypes.includes(file.type)) {
        console.warn(`File ${file.name} has invalid type: ${file.type}, skipping`)
        return
      }

      validFiles.push(file)
    })

    console.log("Valid files after validation:", validFiles.length)

    // Update files state immediately
    setFiles((prev) => {
      const updated = [...prev, ...validFiles]
      console.log("Total files after update:", updated.length)
      return updated
    })

    // Load previews for all valid files
    validFiles.forEach((file) => {
      const reader = new FileReader()
      reader.onload = () => {
        setPreviews((prev) => [
          ...prev,
          {
            file,
            url: reader.result as string,
          },
        ])
      }
      reader.readAsDataURL(file)
    })
  }, [])

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
    setPreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".webp"],
    },
    multiple: true,
    noClick: false, // Allow clicking to open file picker
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("handleSubmit called with files.length:", files.length)
    if (files.length === 0 || !title.trim()) {
      console.warn("Cannot submit: files.length =", files.length, "title =", title.trim())
      return
    }

    setUploading(true)
    setStatus("Creating analysis...")
    setError(null)
    setUploadProgress(0)

    try {
      const currentUser = getCurrentUser()
      if (!currentUser) {
        throw new Error("User not authenticated. Please log in and try again.")
      }

      console.log("Submitting with", files.length, "file(s):", files.map(f => f.name))

      // Validate all files before proceeding
      const validImageTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif"]
      for (const file of files) {
        if (file.size > 10 * 1024 * 1024) {
          throw new Error(`File "${file.name}" exceeds 10MB limit. Please use smaller images.`)
        }
        if (!validImageTypes.includes(file.type)) {
          throw new Error(`File "${file.name}" has invalid type: ${file.type}. Please upload PNG, JPEG, WEBP, or GIF images.`)
        }
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

      // Upload screenshots to Vercel Blob Storage
      if (files.length > 0) {
        let screenshotUrls: string[] = []
        
        try {
          setStatus(`Uploading ${files.length} screenshot${files.length > 1 ? 's' : ''}...`)
          setUploadProgress(0)
          console.log(`Starting upload for ${files.length} file(s)`)
          
          // Upload all files
          screenshotUrls = await uploadScreenshots(
            files, 
            currentUser.uid, 
            analysis.analysis_id
          )
          
          // Track progress
          setUploadProgress(50)
          setStatus("Upload complete, processing...")
          console.log("Upload completed, URLs:", screenshotUrls)
          
          // Validate screenshot URLs
          if (screenshotUrls.length === 0 || !screenshotUrls.every(url => url && typeof url === "string" && url.trim().length > 0)) {
            throw new Error("Invalid screenshot URLs received from upload")
          }

          // Update analysis with first screenshot URL (for thumbnail)
          await updateAnalysis(analysis.analysis_id, {
            screenshot_url: screenshotUrls[0],
          })

          // Update usage stats for all files
          const totalSizeMB = files.reduce((sum, file) => sum + getFileSizeMB(file), 0)
          await incrementUsageStats(currentUser.uid, "storage_used_mb", totalSizeMB)
        } catch (uploadError: any) {
          console.error("Failed to upload screenshots:", uploadError)
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

        // Run UX analysis on all screenshots
        try {
          setStatus("Preparing images for analysis...")
          
          // Get image dimensions for all files
          const imageDimensionsPromises = files.map((file) =>
            Promise.race([
              new Promise<{ file: File; width: number; height: number }>((resolve, reject) => {
                const img = new Image()
                const objectUrl = URL.createObjectURL(file)
                
                const cleanup = () => {
                  URL.revokeObjectURL(objectUrl)
                }
                
                img.onload = () => {
                  if (img.width === 0 || img.height === 0) {
                    cleanup()
                    reject(new Error(`Invalid image dimensions for ${file.name}`))
                    return
                  }
                  resolve({ file, width: img.width, height: img.height })
                  cleanup()
                }
                
                img.onerror = () => {
                  cleanup()
                  reject(new Error(`Failed to load image: ${file.name}. The file may be corrupted.`))
                }
                
                img.src = objectUrl
              }),
              new Promise<never>((_, reject) => {
                setTimeout(() => {
                  reject(new Error(`Image loading timeout for ${file.name}. The file may be too large or corrupted.`))
                }, 10000) // 10 second timeout for image loading
              })
            ])
          )

          const imageDimensions = await Promise.all(imageDimensionsPromises)

          setStatus(`Running UX analysis on ${files.length} screenshot${files.length > 1 ? 's' : ''}... (this may take 30-90 seconds)`)
          console.log("Starting UX analysis for analysis:", analysis.analysis_id)
          
          // Add progress updates during analysis
          const progressInterval = setInterval(() => {
            setStatus((prev) => {
              if (prev.includes("Running UX analysis")) {
                return `Running UX analysis... (still processing ${files.length} screenshot${files.length > 1 ? 's' : ''}, please wait)`
              }
              return prev
            })
          }, 15000) // Update every 15 seconds
          
          try {
            // Analyze all screenshots
            const analysisPromises = files.map((file, index) => 
              analyzeScreenshot(file, `${analysis.analysis_id}-${index}`)
            )
            
            // Add timeout to prevent hanging indefinitely (90 seconds per file, but we'll use a reasonable total)
            const totalTimeout = Math.min(90000 * files.length, 300000) // Max 5 minutes total
            const timeoutPromise = new Promise<never>((_, reject) => {
              setTimeout(() => {
                console.error("Analysis timeout")
                reject(new Error(`Analysis timed out after ${Math.floor(totalTimeout / 1000)} seconds. The images may be too complex. Please try with simpler images.`))
              }, totalTimeout)
            })
            
            const allIssues = await Promise.race([
              Promise.all(analysisPromises),
              timeoutPromise
            ])
            clearInterval(progressInterval)
            
            const totalIssues = (allIssues as any[]).flat()
            console.log("UX analysis completed, found", totalIssues.length, "issues across", files.length, "screenshots")
            
            // Create analysis result object with all screenshots
            const analysisResult: AnalysisResult = {
              id: analysis.analysis_id,
              createdAt: new Date().toISOString() as any, // Store as ISO string for Firestore compatibility
              screenshots: imageDimensions.map((dim, index) => ({
                id: `${analysis.analysis_id}-${index}`,
                name: dim.file.name,
                url: screenshotUrls[index],
                width: dim.width,
                height: dim.height,
              })),
              issues: totalIssues,
            }

            setStatus("Saving results...")
            
            // Update analysis with results
            await updateAnalysis(analysis.analysis_id, {
              status: "completed",
              result_json: analysisResult,
            })

            // Increment AI requests usage stats (one per file analyzed)
            await incrementUsageStats(currentUser.uid, "ai_requests", files.length)

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
            <Label className="text-gray-300">Screenshots</Label>
            <div
              {...getRootProps()}
              className={`mt-2 cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
                isDragActive
                  ? "border-[#4F7CFF] bg-[#4F7CFF]/5"
                  : "border-[#1A1A1A] bg-[#0D0D0D] hover:border-[#2A2A2A]"
              }`}
            >
              <input {...getInputProps()} />
              {previews.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {previews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img 
                          src={preview.url} 
                          alt={`Preview ${index + 1}`} 
                          className="w-full h-32 object-cover rounded-md"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            removeFile(index)
                          }}
                          className="absolute top-1 right-1 bg-red-500/80 hover:bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                        <p className="text-xs text-gray-400 mt-1 truncate">{preview.file.name}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-gray-500">
                      {files.length} file{files.length > 1 ? 's' : ''} selected
                    </p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        open()
                      }}
                      className="text-xs text-[#4F7CFF] hover:text-[#3D6AFF] underline"
                    >
                      Add more files
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="mx-auto h-8 w-8 text-gray-500" />
                  <p className="text-sm text-gray-400">
                    {isDragActive ? "Drop files here" : "Drag & drop or click to upload"}
                  </p>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, WEBP up to 10MB each
                  </p>
                  <p className="text-xs text-blue-400 font-medium mt-1">
                    💡 Tip: Hold Ctrl/Cmd while clicking to select multiple files
                  </p>
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
              disabled={files.length === 0 || !title.trim() || uploading}
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

