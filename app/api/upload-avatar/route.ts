import { NextRequest, NextResponse } from "next/server"
import { put } from "@vercel/blob"

export async function POST(request: NextRequest) {
  try {
    const token = process.env.BLOB_READ_WRITE_TOKEN
    if (!token) {
      return NextResponse.json(
        { error: "BLOB_READ_WRITE_TOKEN is not configured" },
        { status: 500 }
      )
    }

    const formData = await request.formData()
    const file = formData.get("file") as File
    const userId = formData.get("userId") as string

    if (!file || !userId) {
      return NextResponse.json(
        { error: "Missing required fields: file or userId" },
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

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: `File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds 5MB limit` },
        { status: 400 }
      )
    }

    // Validate file type
    const validTypes = ["image/png", "image/jpeg", "image/jpg"]
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Only PNG and JPG images are supported" },
        { status: 400 }
      )
    }

    // Create file path for avatar
    const fileExtension = file.name.split('.').pop() || 'jpg'
    const filePath = `avatars/${userId}/avatar.${fileExtension}`

    // Upload to Vercel Blob
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
    console.error("Avatar upload error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to upload avatar" },
      { status: 500 }
    )
  }
}
