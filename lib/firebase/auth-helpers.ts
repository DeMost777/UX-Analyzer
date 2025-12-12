/**
 * Helper functions for Firebase Authentication troubleshooting
 */

export function getCurrentDomain(): string {
  if (typeof window === "undefined") return "server"
  return window.location.hostname
}

export function getAuthDomainFromConfig(): string {
  // Extract auth domain from the config
  const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "ux-analiysis.firebaseapp.com"
  return authDomain
}

export function checkDomainAuthorization(): {
  currentDomain: string
  authDomain: string
  isLocalhost: boolean
  needsAuthorization: boolean
} {
  const currentDomain = getCurrentDomain()
  const authDomain = getAuthDomainFromConfig()
  const isLocalhost = currentDomain === "localhost" || currentDomain === "127.0.0.1"

  return {
    currentDomain,
    authDomain,
    isLocalhost,
    needsAuthorization: isLocalhost || !currentDomain.includes("firebaseapp.com"),
  }
}

export function getFirebaseConsoleLink(): string {
  return "https://console.firebase.google.com/project/ux-analiysis/authentication/settings"
}

/**
 * Maps Firebase Auth errors to user-friendly messages
 */
export function mapFirebaseAuthError(error: any): string {
  if (!error) return "An unexpected error occurred. Please try again."

  // Handle FirebaseError instances
  if (error.code) {
    switch (error.code) {
      case "auth/email-already-in-use":
        return "This email is already in use. Please try logging in or use a different email."
      case "auth/invalid-email":
        return "The email address is not valid."
      case "auth/operation-not-allowed":
        return "Email/password sign-in is not enabled. Please contact support."
      case "auth/weak-password":
        return "The password is too weak. Please use at least 6 characters."
      case "auth/user-not-found":
      case "auth/wrong-password":
        return "Invalid email or password."
      case "auth/unauthorized-domain":
        const currentDomain = typeof window !== "undefined" ? window.location.hostname : "unknown"
        const firebaseProjectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "ux-analiysis"
        const firebaseConsoleUrl = `https://console.firebase.google.com/project/${firebaseProjectId}/authentication/settings`
        return `Domain not authorized: "${currentDomain}"\n\nTo fix:\n1. Go to: ${firebaseConsoleUrl}\n2. Scroll to "Authorized domains"\n3. Click "Add domain"\n4. Enter: ${currentDomain}\n5. Click "Add"\n6. Refresh this page`
      case "auth/popup-closed-by-user":
        return "Google sign-in popup closed. Please try again."
      case "auth/network-request-failed":
        return "Network error. Please check your internet connection."
      default:
        return `Firebase Error: ${error.message || error.code}`
    }
  }

  // Handle error messages
  if (error.message) {
    if (error.message.includes("unauthorized-domain")) {
      const currentDomain = typeof window !== "undefined" ? window.location.hostname : "unknown"
      const firebaseProjectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "ux-analiysis"
      const firebaseConsoleUrl = `https://console.firebase.google.com/project/${firebaseProjectId}/authentication/settings`
      return `Domain not authorized: "${currentDomain}"\n\nTo fix:\n1. Go to: ${firebaseConsoleUrl}\n2. Scroll to "Authorized domains"\n3. Click "Add domain"\n4. Enter: ${currentDomain}\n5. Click "Add"\n6. Refresh this page`
    }
    return error.message
  }

  return "An unexpected error occurred. Please try again."
}

