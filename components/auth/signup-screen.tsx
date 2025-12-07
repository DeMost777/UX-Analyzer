"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Mail, Lock, User, Chrome } from "lucide-react"
import { Logo } from "@/components/logo"

interface SignupScreenProps {
  onSignup: (user: any) => void
  onSwitchToLogin: () => void
}

export function SignupScreen({ onSignup, onSwitchToLogin }: SignupScreenProps) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Failed to sign up")
        setLoading(false)
        return
      }

      // Auto-login after signup
      const loginResponse = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const loginData = await loginResponse.json()
      if (loginResponse.ok) {
        onSignup(loginData.user)
      } else {
        onSignup(data.user)
      }
    } catch (err) {
      setError("An error occurred. Please try again.")
      setLoading(false)
    }
  }

  const handleGoogleSignup = () => {
    // TODO: Implement Google OAuth
    alert("Google OAuth coming soon!")
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0D0D0D] p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>

        <div className="rounded-lg border border-[#1A1A1A] bg-[#111111] p-8 shadow-xl">
          <h1 className="mb-2 text-2xl font-semibold text-white">Create an account</h1>
          <p className="mb-6 text-sm text-gray-400">Get started with Flow UX AI</p>

          {error && (
            <div className="mb-4 rounded-md bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-300">
                Name
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10 bg-[#0D0D0D] border-[#1A1A1A] text-white placeholder:text-gray-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10 bg-[#0D0D0D] border-[#1A1A1A] text-white placeholder:text-gray-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="pl-10 bg-[#0D0D0D] border-[#1A1A1A] text-white"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#4F7CFF] hover:bg-[#3D6AFF] text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create account"
              )}
            </Button>
          </form>

          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-[#1A1A1A]" />
            <span className="px-4 text-xs text-gray-500">OR</span>
            <div className="flex-1 border-t border-[#1A1A1A]" />
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleSignup}
            className="w-full border-[#1A1A1A] bg-[#0D0D0D] text-white hover:bg-[#1A1A1A]"
          >
            <Chrome className="mr-2 h-4 w-4" />
            Continue with Google
          </Button>

          <p className="mt-6 text-center text-sm text-gray-400">
            Already have an account?{" "}
            <button
              onClick={onSwitchToLogin}
              className="text-[#4F7CFF] hover:text-[#3D6AFF] font-medium"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

