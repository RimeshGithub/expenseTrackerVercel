// Firebase configuration and initialization with fallback
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app"
import { getAuth, type Auth } from "firebase/auth"
import { getFirestore, type Firestore } from "firebase/firestore"

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
}

// Validate configuration
const isValidConfig = Object.values(firebaseConfig).every((value) => value && value.trim() !== "")

let app: FirebaseApp | null = null
let auth: Auth | null = null
let db: Firestore | null = null
let initializationError: string | null = null

// Only initialize Firebase if we have valid configuration
if (isValidConfig) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()

    // Initialize services with additional error handling
    try {
      auth = getAuth(app)
    } catch (authError) {
      console.error("Failed to initialize Firebase Auth:", authError)
      initializationError = `Auth initialization failed: ${authError}`
    }

    try {
      db = getFirestore(app)
    } catch (dbError) {
      console.error("Failed to initialize Firestore:", dbError)
      initializationError = initializationError
        ? `${initializationError}, DB initialization failed: ${dbError}`
        : `DB initialization failed: ${dbError}`
    }
  } catch (error) {
    console.error("Failed to initialize Firebase app:", error)
    initializationError = `App initialization failed: ${error}`
  }
} else {
  initializationError = "Invalid Firebase configuration - missing environment variables"
  console.error("Firebase configuration error:", initializationError)
}

// Export functions that handle the null cases
export const getFirebaseAuth = (): Auth | null => {
  if (!auth && initializationError) {
    console.warn("Firebase Auth not available:", initializationError)
  }
  return auth
}

export const getFirebaseDB = (): Firestore | null => {
  if (!db && initializationError) {
    console.warn("Firestore not available:", initializationError)
  }
  return db
}

export const isFirebaseInitialized = (): boolean => {
  return !!(app && auth && db)
}

export const getFirebaseError = (): string | null => {
  return initializationError
}

// Legacy exports for backward compatibility
export { auth, db }
export default app
