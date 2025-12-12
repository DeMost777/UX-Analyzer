import { NextRequest, NextResponse } from "next/server"
import { clearSession } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value
    if (token) {
      clearSession(token)
    }

    const response = NextResponse.json({ success: true })
    response.cookies.delete("auth-token")
    return response
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json({ error: "Failed to logout" }, { status: 500 })
  }
}

