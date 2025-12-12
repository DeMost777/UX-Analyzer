import bcrypt from "bcryptjs"
import type { User } from "./db/types"

// In a real app, use environment variables
const SALT_ROUNDS = 10

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export function createSessionToken(userId: string): string {
  // In production, use JWT or similar
  // For now, return a simple token (replace with proper JWT)
  return Buffer.from(`${userId}:${Date.now()}`).toString("base64")
}

export function validateSessionToken(token: string): string | null {
  try {
    const decoded = Buffer.from(token, "base64").toString("utf-8")
    const [userId] = decoded.split(":")
    return userId || null
  } catch {
    return null
  }
}

// Session storage (in production, use Redis or database)
const sessions = new Map<string, { userId: string; expiresAt: number }>()

export function storeSession(token: string, userId: string): void {
  const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days
  sessions.set(token, { userId, expiresAt })
  
  // Clean up expired sessions
  for (const [t, session] of sessions.entries()) {
    if (session.expiresAt < Date.now()) {
      sessions.delete(t)
    }
  }
}

export function getSession(token: string): string | null {
  const session = sessions.get(token)
  if (!session || session.expiresAt < Date.now()) {
    sessions.delete(token)
    return null
  }
  return session.userId
}

export function clearSession(token: string): void {
  sessions.delete(token)
}

