import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { getUsageStats } from "@/lib/db/client"

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

    const stats = await getUsageStats(userId)
    if (!stats) {
      return NextResponse.json({ error: "Stats not found" }, { status: 404 })
    }

    return NextResponse.json({ stats })
  } catch (error) {
    console.error("Get stats error:", error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}

