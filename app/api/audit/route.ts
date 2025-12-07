import { NextRequest, NextResponse } from "next/server"
import { performProfessionalAudit } from "@/lib/professional-ux-audit"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "File must be an image" }, { status: 400 })
    }

    // Perform professional audit
    const result = await performProfessionalAudit(file)

    return NextResponse.json(result, {
      headers: {
        "Content-Type": "application/json",
      },
    })
  } catch (error) {
    console.error("Audit error:", error)
    return NextResponse.json(
      { error: "Failed to analyze image", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

