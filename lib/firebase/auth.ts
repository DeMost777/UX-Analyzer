import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  User as FirebaseUser,
  updateProfile,
} from "firebase/auth"
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore"
import { auth, db } from "./config"

// Check if Firebase is initialized
function checkFirebase() {
  if (!auth || !db) {
    throw new Error("Firebase is not initialized. Please check your environment variables.")
  }
}

export interface User {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
  createdAt?: any
  lastLogin?: any
}

// Convert Firebase user to our User type
export function firebaseUserToUser(firebaseUser: FirebaseUser): User {
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName,
    photoURL: firebaseUser.photoURL,
  }
}

// Register new user
export async function registerUser(email: string, password: string, name?: string): Promise<User> {
  try {
    checkFirebase()
    const userCredential = await createUserWithEmailAndPassword(auth!, email, password)
    const user = userCredential.user

    // Update profile with name if provided
    if (name) {
      await updateProfile(user, { displayName: name })
    }

    // Create user document in Firestore
    await setDoc(
      doc(db!, "users", user.uid),
      {
        email: user.email,
        name: name || user.displayName || null,
        avatar_url: user.photoURL || null,
        created_at: serverTimestamp(),
        last_login: serverTimestamp(),
      },
      { merge: true },
    )

    // Initialize usage stats
    await setDoc(
      doc(db!, "usage_stats", user.uid),
      {
        analyses_run: 0,
        storage_used_mb: 0,
        ai_requests: 0,
        updated_at: serverTimestamp(),
      },
      { merge: true },
    )

    return firebaseUserToUser(user)
  } catch (error: any) {
    throw new Error(error.message || "Failed to register user")
  }
}

// Login user
export async function loginUser(email: string, password: string): Promise<User> {
  try {
    checkFirebase()
    const userCredential = await signInWithEmailAndPassword(auth!, email, password)
    const user = userCredential.user

    // Update last login
    await setDoc(
      doc(db!, "users", user.uid),
      {
        last_login: serverTimestamp(),
      },
      { merge: true },
    )

    return firebaseUserToUser(user)
  } catch (error: any) {
    throw new Error(error.message || "Failed to login")
  }
}

// Login with Google
export async function loginWithGoogle(): Promise<User> {
  try {
    checkFirebase()
    const provider = new GoogleAuthProvider()
    const userCredential = await signInWithPopup(auth!, provider)
    const user = userCredential.user

    // Create or update user document
    await setDoc(
      doc(db!, "users", user.uid),
      {
        email: user.email,
        name: user.displayName || null,
        avatar_url: user.photoURL || null,
        last_login: serverTimestamp(),
      },
      { merge: true },
    )

    // Initialize usage stats if doesn't exist
    const statsDoc = await getDoc(doc(db!, "usage_stats", user.uid))
    if (!statsDoc.exists()) {
      await setDoc(
        doc(db!, "usage_stats", user.uid),
        {
          analyses_run: 0,
          storage_used_mb: 0,
          ai_requests: 0,
          updated_at: serverTimestamp(),
        },
        { merge: true },
      )
    }

    return firebaseUserToUser(user)
  } catch (error: any) {
    throw new Error(error.message || "Failed to login with Google")
  }
}

// Logout user
export async function logoutUser(): Promise<void> {
  try {
    checkFirebase()
    await signOut(auth!)
  } catch (error: any) {
    throw new Error(error.message || "Failed to logout")
  }
}

// Get current user
export function getCurrentUser(): FirebaseUser | null {
  if (!auth) return null
  return auth.currentUser
}

// Listen to auth state changes
export function onAuthStateChange(callback: (user: User | null) => void): () => void {
  if (!auth) {
    callback(null)
    return () => {}
  }
  return onAuthStateChanged(auth, (firebaseUser) => {
    if (firebaseUser) {
      callback(firebaseUserToUser(firebaseUser))
    } else {
      callback(null)
    }
  })
}

// Get user data from Firestore
export async function getUserData(uid: string): Promise<User | null> {
  try {
    checkFirebase()
    const userDoc = await getDoc(doc(db!, "users", uid))
    if (!userDoc.exists()) {
      return null
    }

    const data = userDoc.data()
    return {
      uid,
      email: data.email || null,
      displayName: data.name || null,
      photoURL: data.avatar_url || null,
      createdAt: data.created_at,
      lastLogin: data.last_login,
    }
  } catch (error) {
    console.error("Error getting user data:", error)
    return null
  }
}

