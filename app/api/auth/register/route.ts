import { NextRequest, NextResponse } from "next/server"
import { createUser, getUserByEmail } from "@/lib/db/client"
import { hashPassword } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await getUserByEmail(email)
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 409 })
    }

    // Hash password and create user
    const passwordHash = await hashPassword(password)
    const user = await createUser(email, passwordHash, name)

    return NextResponse.json(
      {
        user: {
          user_id: user.user_id,
          email: user.email,
          name: user.name,
          avatar_url: user.avatar_url,
        },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Failed to register user" }, { status: 500 })
  }
}

