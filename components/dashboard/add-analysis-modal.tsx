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

    try {
      const currentUser = getCurrentUser()
      if (!currentUser) {
        throw new Error("User not authenticated")
      }

      // Create analysis record first to get the analysis ID
      setStatus("Creating analysis record...")
      const analysis = await createAnalysis({
        user_id: currentUser.uid,
        title: title.trim(),
      })

      // Upload screenshot to Firebase Storage (if file exists)
      if (file) {
        try {
          setStatus("Uploading screenshot...")
          const screenshotUrl = await uploadScreenshot(file, currentUser.uid, analysis.analysis_id)
          
          // Validate screenshot URL before updating
          if (screenshotUrl && typeof screenshotUrl === "string" && screenshotUrl.trim().length > 0) {
            // Update analysis with screenshot URL
            await updateAnalysis(analysis.analysis_id, {
              screenshot_url: screenshotUrl,
            })
          } else {
            console.warn("Invalid screenshot URL received, skipping update:", screenshotUrl)
          }

          // Update usage stats
          const fileSizeMB = getFileSizeMB(file)
          await incrementUsageStats(currentUser.uid, "storage_used_mb", fileSizeMB)

          // Run UX analysis on the screenshot
          try {
            setStatus("Analyzing screenshot...")
            
            // Get image dimensions
            const imageDimensions = await new Promise<{ width: number; height: number }>((resolve) => {
              const img = new Image()
              img.onload = () => {
                resolve({ width: img.width, height: img.height })
                URL.revokeObjectURL(img.src)
              }
              img.onerror = () => {
                resolve({ width: 0, height: 0 })
                URL.revokeObjectURL(img.src)
              }
              img.src = URL.createObjectURL(file)
            })

            setStatus("Running UX analysis... (this may take 10-30 seconds)")
            console.log("Starting UX analysis for analysis:", analysis.analysis_id)
            
            // Add timeout to prevent hanging indefinitely
            const analysisPromise = analyzeScreenshot(file, analysis.analysis_id)
            const timeoutPromise = new Promise<never>((_, reject) => {
              setTimeout(() => {
                console.error("Analysis timeout after 60 seconds")
                reject(new Error("Analysis timeout after 60 seconds"))
              }, 60000)
            })
            
            const issues = await Promise.race([analysisPromise, timeoutPromise])
            console.log("UX analysis completed, found", issues.length, "issues")
            
            // Create analysis result object
            const analysisResult: AnalysisResult = {
              id: analysis.analysis_id,
              createdAt: new Date(),
              screenshots: [
                {
                  id: analysis.analysis_id,
                  name: file.name,
                  url: screenshotUrl,
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
              onAnalysisCreated(updated)
              return
            }
          } catch (analysisError) {
            console.error("Failed to analyze screenshot:", analysisError)
            setStatus(`Analysis error: ${analysisError instanceof Error ? analysisError.message : "Unknown error"}`)
            // Update status to failed
            await updateAnalysis(analysis.analysis_id, {
              status: "failed",
            })
            // Still return the analysis so user can see it
            const updated = await getAnalysisById(analysis.analysis_id)
            if (updated) {
              onAnalysisCreated(updated)
              return
            }
          }
        } catch (uploadError) {
          console.error("Failed to upload screenshot:", uploadError)
          setStatus(`Upload error: ${uploadError instanceof Error ? uploadError.message : "Unknown error"}`)
          // Update status to failed
          await updateAnalysis(analysis.analysis_id, {
            status: "failed",
          })
          // Continue with analysis even if upload fails
        }
      }

      // If no file was uploaded, still return the analysis
      onAnalysisCreated(analysis)
    } catch (error: any) {
      console.error("Failed to create analysis:", error)
      setStatus(`Error: ${error.message || "Failed to create analysis"}`)
      alert(error.message || "Failed to create analysis. Please try again.")
    } finally {
      setUploading(false)
      setStatus("")
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

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose} className="border-[#1A1A1A] text-white">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!file || !title.trim() || uploading}
              className="bg-[#4F7CFF] hover:bg-[#3D6AFF] text-white"
            >
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {status || "Creating..."}
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

