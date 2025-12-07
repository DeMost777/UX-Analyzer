import { initializeApp, getApps, FirebaseApp } from "firebase/app"
import { getAuth, Auth } from "firebase/auth"
import { getFirestore, Firestore } from "firebase/firestore"
import { getStorage, FirebaseStorage } from "firebase/storage"
import { getAnalytics, Analytics, isSupported } from "firebase/analytics"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyD6t5-tndSzZmQDEkEvbU_mPOBkZCmHtCQ",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "ux-analiysis.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "ux-analiysis",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "ux-analiysis.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "452676265216",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:452676265216:web:d6cf7f301b9a265230bfe5",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-GVDFTLWMSZ",
}

// Initialize Firebase only if config is valid
let app: FirebaseApp | null = null
let auth: Auth | null = null
let db: Firestore | null = null
let storage: FirebaseStorage | null = null
let analytics: Analytics | null = null

if (typeof window !== "undefined" && firebaseConfig.apiKey && firebaseConfig.apiKey !== "dummy-key") {
  try {
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig)
    } else {
      app = getApps()[0]
    }

    // Initialize services
    auth = getAuth(app)
    db = getFirestore(app)
    storage = getStorage(app)

    // Initialize Analytics (only in browser and if supported)
    if (typeof window !== "undefined" && app) {
      isSupported().then((supported) => {
        if (supported && app) {
          analytics = getAnalytics(app)
        }
      })
    }
  } catch (error) {
    console.error("Firebase initialization error:", error)
  }
}

export { auth, db, storage, analytics }
export default app

