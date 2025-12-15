"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { ArrowLeft, Upload, LogOut, Trash2, Save, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useDropzone } from "react-dropzone"
import { getCurrentUser, updateUserProfile } from "@/lib/firebase/auth"
import { updateUserDocument, getUserDocument } from "@/lib/firebase/firestore"
import { logoutUser } from "@/lib/firebase/auth"

interface SettingsScreenProps {
  user: {
    user_id: string
    email: string
    name?: string
    avatar_url?: string
  }
  onBack: () => void
  onLogout: () => void
}

export function SettingsScreen({ user, onBack, onLogout }: SettingsScreenProps) {
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(user.avatar_url)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [email] = useState(user.email) // Read-only
  const [enableWCAG, setEnableWCAG] = useState(false)
  const [enableCognitiveLoad, setEnableCognitiveLoad] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load user preferences on mount
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const currentUser = getCurrentUser()
        if (!currentUser) return

        const userDoc = await getUserDocument(currentUser.uid)
        if (userDoc) {
          const preferences = (userDoc as any).preferences
          if (preferences) {
            setEnableWCAG(preferences.enable_wcag_checks || false)
            setEnableCognitiveLoad(preferences.enable_cognitive_load_analysis || false)
          }
        }
      } catch (error) {
        console.error("Failed to load preferences:", error)
      } finally {
        setLoading(false)
      }
    }

    loadPreferences()
  }, [])

  const getInitials = () => {
    if (user.name) {
      return user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    }
    return user.email[0].toUpperCase()
  }

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    // Validate file type
    const validTypes = ["image/png", "image/jpeg", "image/jpg"]
    if (!validTypes.includes(file.type)) {
      setError("Only PNG and JPG images are supported")
      return
    }

    // Validate file size (max 5MB for avatars)
    if (file.size > 5 * 1024 * 1024) {
      setError("Avatar image must be less than 5MB")
      return
    }

    setError(null)
    setAvatarFile(file)

    // Create preview
    const reader = new FileReader()
    reader.onload = () => {
      setAvatarPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
    },
    multiple: false,
    noClick: true, // We'll use a button to trigger
  })

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)

    try {
      const currentUser = getCurrentUser()
      if (!currentUser) {
        throw new Error("User not authenticated")
      }

      let newAvatarUrl = avatarUrl

      // Upload avatar if a new file was selected
      if (avatarFile) {
        try {
          const formData = new FormData()
          formData.append("file", avatarFile)
          formData.append("userId", currentUser.uid)
          formData.append("type", "avatar")

          const response = await fetch("/api/upload-avatar", {
            method: "POST",
            body: formData,
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || "Failed to upload avatar")
          }

          const data = await response.json()
          newAvatarUrl = data.url
          setAvatarUrl(newAvatarUrl)
        } catch (uploadError: any) {
          throw new Error(`Avatar upload failed: ${uploadError.message}`)
        }
      }

      // Update Firebase Auth profile
      if (newAvatarUrl !== user.avatar_url) {
        await updateUserProfile(currentUser, { photoURL: newAvatarUrl || undefined })
      }

      // Update Firestore user document
      await updateUserDocument(currentUser.uid, {
        avatar_url: newAvatarUrl || null,
        preferences: {
          enable_wcag_checks: enableWCAG,
          enable_cognitive_load_analysis: enableCognitiveLoad,
        },
      })

      // Clear avatar file state
      setAvatarFile(null)
      setAvatarPreview(null)

      // Show success (you could add a toast notification here)
      alert("Profile saved successfully!")
    } catch (err: any) {
      setError(err.message || "Failed to save profile")
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    try {
      await logoutUser()
      onLogout()
    } catch (error) {
      console.error("Logout error:", error)
      onLogout() // Still logout on client side
    }
  }

  const handleDeleteAccount = async () => {
    // TODO: Implement account deletion
    // This should:
    // 1. Delete all user's analyses
    // 2. Delete user's storage files
    // 3. Delete user document from Firestore
    // 4. Delete Firebase Auth account
    alert("Account deletion is not yet implemented. Please contact support.")
    setShowDeleteConfirm(false)
  }

  return (
    <div className="min-h-screen bg-[#0D0D0D]">
      {/* Header */}
      <header className="border-b border-[#1A1A1A] bg-[#111111]">
        <div className="mx-auto max-w-4xl px-6 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={onBack}
              className="text-gray-400 hover:text-white"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <h1 className="text-xl font-semibold text-white">Settings</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-6 py-8">
        {error && (
          <div className="mb-6 rounded-lg border border-red-500/50 bg-red-500/10 p-4">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-400">Loading settings...</div>
          </div>
        ) : (
          <div className="space-y-8">
          {/* Profile Section */}
          <section className="rounded-lg border border-[#1A1A1A] bg-[#111111] p-6">
            <h2 className="mb-6 text-lg font-semibold text-white">Profile</h2>

            <div className="space-y-6">
              {/* Avatar Upload */}
              <div>
                <Label className="text-gray-300 mb-3 block">Avatar</Label>
                <div className="flex items-start gap-6">
                  <div className="relative">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={avatarPreview || avatarUrl} alt={user.name || user.email} />
                      <AvatarFallback className="bg-[#4F7CFF] text-white text-xl">
                        {getInitials()}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="flex-1">
                    <div {...getRootProps()}>
                      <input {...getInputProps()} ref={fileInputRef} />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleAvatarClick}
                        className="border-[#1A1A1A] text-white hover:bg-[#1A1A1A]"
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Change avatar
                      </Button>
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                      PNG or JPG, max 5MB. Square images work best.
                    </p>
                  </div>
                </div>
              </div>

              {/* Email Field */}
              <div>
                <Label htmlFor="email" className="text-gray-300">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  disabled
                  className="mt-2 bg-[#0D0D0D] border-[#1A1A1A] text-gray-400 cursor-not-allowed"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Email cannot be changed
                </p>
              </div>
            </div>
          </section>

          {/* Analysis Preferences Section */}
          <section className="rounded-lg border border-[#1A1A1A] bg-[#111111] p-6">
            <h2 className="mb-6 text-lg font-semibold text-white">Analysis Preferences</h2>

            <div className="space-y-4">
              {/* WCAG Toggle */}
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Label htmlFor="wcag-toggle" className="text-gray-300 cursor-pointer">
                    Enable accessibility checks (WCAG)
                  </Label>
                  <p className="mt-1 text-xs text-gray-500">
                    Automatically check designs against WCAG 2.1 accessibility standards
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    id="wcag-toggle"
                    checked={enableWCAG}
                    onChange={(e) => setEnableWCAG(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-[#1A1A1A] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#4F7CFF] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4F7CFF]"></div>
                </label>
              </div>

              {/* Cognitive Load Toggle */}
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Label htmlFor="cognitive-toggle" className="text-gray-300 cursor-pointer">
                    Enable cognitive load analysis
                  </Label>
                  <p className="mt-1 text-xs text-gray-500">
                    Analyze visual complexity and information density to improve user comprehension
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    id="cognitive-toggle"
                    checked={enableCognitiveLoad}
                    onChange={(e) => setEnableCognitiveLoad(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-[#1A1A1A] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#4F7CFF] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4F7CFF]"></div>
                </label>
              </div>
            </div>
          </section>

          {/* Actions Section */}
          <section className="rounded-lg border border-[#1A1A1A] bg-[#111111] p-6">
            <h2 className="mb-6 text-lg font-semibold text-white">Actions</h2>

            <div className="space-y-4">
              {/* Save Button */}
              <Button
                onClick={handleSave}
                disabled={saving}
                className="w-full bg-[#4F7CFF] hover:bg-[#3D6AFF] text-white"
              >
                {saving ? (
                  <>
                    <Save className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save profile changes
                  </>
                )}
              </Button>

              {/* Logout Button */}
              <Button
                onClick={handleLogout}
                variant="outline"
                className="w-full border-[#1A1A1A] text-white hover:bg-[#1A1A1A]"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </Button>

              {/* Delete Account Button */}
              <Button
                onClick={() => setShowDeleteConfirm(true)}
                variant="outline"
                className="w-full border-red-500/50 text-red-400 hover:bg-red-500/10 hover:border-red-500"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete account
              </Button>
            </div>
          </section>
        </div>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative w-full max-w-md rounded-lg border border-red-500/50 bg-[#111111] p-6 shadow-xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-full bg-red-500/20 p-2">
                <AlertTriangle className="h-5 w-5 text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">Delete Account</h3>
            </div>

            <div className="mb-6 space-y-3">
              <p className="text-sm text-gray-300">
                Are you sure you want to delete your account? This action cannot be undone.
              </p>
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3">
                <p className="text-xs font-medium text-red-400 mb-2">This will permanently delete:</p>
                <ul className="text-xs text-gray-400 space-y-1 list-disc list-inside">
                  <li>All your analyses and results</li>
                  <li>All uploaded screenshots and files</li>
                  <li>Your account data and preferences</li>
                  <li>All usage statistics</li>
                </ul>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => setShowDeleteConfirm(false)}
                variant="outline"
                className="flex-1 border-[#1A1A1A] text-white hover:bg-[#1A1A1A]"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeleteAccount}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white"
              >
                Delete account
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
