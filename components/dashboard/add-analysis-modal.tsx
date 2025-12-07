"use client"

import { useState, useCallback } from "react"
import { X, Upload, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useDropzone } from "react-dropzone"
import type { Analysis } from "@/lib/db/types"

interface AddAnalysisModalProps {
  onClose: () => void
  onAnalysisCreated: (analysis: Analysis) => void
}

export function AddAnalysisModal({ onClose, onAnalysisCreated }: AddAnalysisModalProps) {
  const [title, setTitle] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

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

    try {
      // Create analysis record
      const analysisResponse = await fetch("/api/analyses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          screenshot_url: preview, // In production, upload to storage first
        }),
      })

      if (!analysisResponse.ok) {
        throw new Error("Failed to create analysis")
      }

      const { analysis } = await analysisResponse.json()
      onAnalysisCreated(analysis)
    } catch (error) {
      console.error("Failed to create analysis:", error)
      alert("Failed to create analysis. Please try again.")
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
                  Creating...
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

