import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { getAnalysisById, updateAnalysis, deleteAnalysis } from "@/lib/db/client"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const userId = getSession(token)
    if (!userId) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    const { id } = await params
    const analysis = await getAnalysisById(id)
    if (!analysis) {
      return NextResponse.json({ error: "Analysis not found" }, { status: 404 })
    }

    if (analysis.user_id !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    return NextResponse.json({ analysis })
  } catch (error) {
    console.error("Get analysis error:", error)
    return NextResponse.json({ error: "Failed to fetch analysis" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const userId = getSession(token)
    if (!userId) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    const { id } = await params
    const analysis = await getAnalysisById(id)
    if (!analysis) {
      return NextResponse.json({ error: "Analysis not found" }, { status: 404 })
    }

    if (analysis.user_id !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const updates = await request.json()
    const updated = await updateAnalysis(id, updates)

    return NextResponse.json({ analysis: updated })
  } catch (error) {
    console.error("Update analysis error:", error)
    return NextResponse.json({ error: "Failed to update analysis" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const userId = getSession(token)
    if (!userId) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    const { id } = await params
    const analysis = await getAnalysisById(id)
    if (!analysis) {
      return NextResponse.json({ error: "Analysis not found" }, { status: 404 })
    }

    if (analysis.user_id !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    await deleteAnalysis(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete analysis error:", error)
    return NextResponse.json({ error: "Failed to delete analysis" }, { status: 500 })
  }
}

