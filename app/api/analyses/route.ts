import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { createAnalysis, getAnalysesByUserId, searchAnalyses } from "@/lib/db/client"
import { incrementUsageStats } from "@/lib/db/client"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const userId = getSession(token)
    if (!userId) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get("q")

    let analyses
    if (query) {
      analyses = await searchAnalyses(userId, query)
    } else {
      analyses = await getAnalysesByUserId(userId)
    }

    return NextResponse.json({ analyses })
  } catch (error) {
    console.error("Get analyses error:", error)
    return NextResponse.json({ error: "Failed to fetch analyses" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const userId = getSession(token)
    if (!userId) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    const { title, screenshot_url } = await request.json()

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }

    const analysis = await createAnalysis({
      user_id: userId,
      title,
      screenshot_url,
    })

    // Increment usage stats
    await incrementUsageStats(userId, "analyses_run")

    return NextResponse.json({ analysis }, { status: 201 })
  } catch (error) {
    console.error("Create analysis error:", error)
    return NextResponse.json({ error: "Failed to create analysis" }, { status: 500 })
  }
}

