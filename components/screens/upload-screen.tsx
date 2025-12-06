"use client"

import { useState, useCallback, useEffect } from "react"
import { useDropzone } from "react-dropzone"
import { Upload, ImageIcon, FileImage, Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { AnalysisResult } from "@/lib/types"
import { generateMockAnalysis } from "@/lib/mock-data"

interface UploadScreenProps {
  onAnalysisComplete: (result: AnalysisResult) => void
  initialFiles?: File[] | null
}

type UploadState = "idle" | "uploading" | "analyzing" | "complete" | "error"

export function UploadScreen({ onAnalysisComplete, initialFiles }: UploadScreenProps) {
  const [uploadState, setUploadState] = useState<UploadState>("idle")
  const [files, setFiles] = useState<File[]>([])
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (initialFiles && initialFiles.length > 0) {
      setFiles(initialFiles)
      handleAnalysis(initialFiles)
    }
  }, [initialFiles])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(acceptedFiles)
    handleAnalysis(acceptedFiles)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/webp": [".webp"],
    },
    multiple: true,
  })

  const handleAnalysis = async (uploadedFiles: File[]) => {
    setUploadState("uploading")
    setProgress(0)

    // Simulate upload progress
    for (let i = 0; i <= 30; i += 10) {
      await new Promise((r) => setTimeout(r, 200))
      setProgress(i)
    }

    setUploadState("analyzing")

    // Simulate AI analysis
    for (let i = 30; i <= 100; i += 5) {
      await new Promise((r) => setTimeout(r, 150))
      setProgress(i)
    }

    setUploadState("complete")

    // Generate mock analysis result with uploaded files
    const result = await generateMockAnalysis(uploadedFiles)

    await new Promise((r) => setTimeout(r, 500))
    onAnalysisComplete(result)
  }

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center p-6">
      <div className="w-full max-w-2xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <h1 className="text-3xl font-semibold tracking-tight">Upload your designs</h1>
          <p className="text-muted-foreground text-balance">
            Drop your Figma exports and let AI analyze UX issues instantly
          </p>
        </div>

        {/* Upload Zone */}
        <div
          {...getRootProps()}
          className={cn(
            "relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 transition-all duration-200 cursor-pointer",
            isDragActive
              ? "border-primary bg-primary/5 scale-[1.02]"
              : "border-border hover:border-primary/50 hover:bg-muted/30",
            uploadState !== "idle" && "pointer-events-none",
          )}
        >
          <input {...getInputProps()} />

          {uploadState === "idle" && (
            <>
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
                <Upload className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="mb-2 text-lg font-medium">{isDragActive ? "Drop files here" : "Drag & drop screenshots"}</p>
              <p className="text-sm text-muted-foreground mb-4">or click to browse</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <FileImage className="h-3.5 w-3.5" />
                <span>PNG, JPG, WebP supported</span>
              </div>
            </>
          )}

          {(uploadState === "uploading" || uploadState === "analyzing") && (
            <div className="flex flex-col items-center space-y-4">
              <div className="relative h-16 w-16">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
              </div>
              <div className="text-center">
                <p className="font-medium">{uploadState === "uploading" ? "Uploading..." : "Analyzing with AI..."}</p>
                <p className="text-sm text-muted-foreground mt-1">{progress}% complete</p>
              </div>
              <div className="w-64 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {uploadState === "complete" && (
            <div className="flex flex-col items-center space-y-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
              <p className="font-medium text-green-500">Analysis complete!</p>
            </div>
          )}

          {uploadState === "error" && (
            <div className="flex flex-col items-center space-y-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                <AlertCircle className="h-8 w-8 text-destructive" />
              </div>
              <p className="font-medium text-destructive">Upload failed</p>
              <Button variant="outline" onClick={() => setUploadState("idle")}>
                Try again
              </Button>
            </div>
          )}
        </div>

        {/* File Preview */}
        {files.length > 0 && uploadState === "idle" && (
          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground">Selected files ({files.length})</p>
            <div className="grid grid-cols-3 gap-3">
              {files.map((file, i) => (
                <div key={i} className="flex items-center gap-2 rounded-lg border border-border bg-card p-3">
                  <ImageIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm truncate">{file.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Help Text */}
        <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
            <span>Contrast analysis</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-yellow-500" />
            <span>Spacing issues</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
            <span>Hierarchy problems</span>
          </div>
        </div>
      </div>
    </div>
  )
}