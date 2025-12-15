import { NextRequest, NextResponse } from "next/server"
import { put } from "@vercel/blob"

export async function POST(request: NextRequest) {
  try {
    // Get the token from environment (server-side only)
    const token = process.env.BLOB_READ_WRITE_TOKEN
    if (!token) {
      return NextResponse.json(
        { error: "BLOB_READ_WRITE_TOKEN is not configured" },
        { status: 500 }
      )
    }

    // Get form data
    const formData = await request.formData()
    const file = formData.get("file") as File
    const userId = formData.get("userId") as string
    const analysisId = formData.get("analysisId") as string

    if (!file || !userId || !analysisId) {
      return NextResponse.json(
        { error: "Missing required fields: file, userId, or analysisId" },
        { status: 400 }
      )
    }

    // Validate file
    if (file.size === 0) {
      return NextResponse.json(
        { error: "File is empty" },
        { status: 400 }
      )
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: `File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds 10MB limit` },
        { status: 400 }
      )
    }

    // Create file path
    const filePath = `analyses/${userId}/${analysisId}/${file.name}`

    // Upload to Vercel Blob
    // The token is automatically read from BLOB_READ_WRITE_TOKEN env var
    const blob = await put(filePath, file, {
      access: "public",
      contentType: file.type,
      addRandomSuffix: false,
    })

    return NextResponse.json({
      url: blob.url,
      path: filePath,
    })
  } catch (error: any) {
    console.error("Upload error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to upload file" },
      { status: 500 }
    )
  }
}
