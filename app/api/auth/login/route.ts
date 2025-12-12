import { NextRequest, NextResponse } from "next/server"
import { getUserWithPassword, updateUserLastLogin } from "@/lib/db/client"
import { verifyPassword, createSessionToken, storeSession } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Get user with password hash
    const user = await getUserWithPassword(email)
    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    // Verify password
    const isValid = await verifyPassword(password, user.password_hash)
    if (!isValid) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    // Update last login
    await updateUserLastLogin(user.user_id)

    // Create session
    const token = createSessionToken(user.user_id)
    storeSession(token, user.user_id)

    // Set cookie
    const response = NextResponse.json({
      user: {
        user_id: user.user_id,
        email: user.email,
        name: user.name,
        avatar_url: user.avatar_url,
      },
      token,
    })

    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    })

    return response
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Failed to login" }, { status: 500 })
  }
}

