import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getAuth, type Auth } from "firebase/auth";
import { getStorage, type FirebaseStorage } from "firebase/storage";
import { clientEnv } from "@/lib/env";

// ============================================================================
// FIREBASE CLIENT CONFIGURATION
// ============================================================================

/**
 * Firebase configuration from environment variables
 */
const firebaseConfig = {
  apiKey: clientEnv.firebase.apiKey,
  authDomain: clientEnv.firebase.authDomain,
  projectId: clientEnv.firebase.projectId,
  storageBucket: clientEnv.firebase.storageBucket,
  messagingSenderId: clientEnv.firebase.messagingSenderId,
  appId: clientEnv.firebase.appId,
  measurementId: clientEnv.firebase.measurementId,
} as const;

// ============================================================================
// FIREBASE INITIALIZATION
// ============================================================================

/**
 * Initialize Firebase app (singleton pattern)
 */
function initializeFirebaseApp(): FirebaseApp {
  if (getApps().length > 0) {
    return getApp();
  }
  return initializeApp(firebaseConfig);
}

const app = initializeFirebaseApp();

// ============================================================================
// FIREBASE SERVICES
// ============================================================================

/**
 * Firestore database instance
 */
export const db: Firestore = getFirestore(app);

/**
 * Firebase Authentication instance
 */
export const auth: Auth = getAuth(app);

/**
 * Firebase Storage instance
 */
export const storage: FirebaseStorage = getStorage(app);

/**
 * Firebase app instance
 */
export { app };

// ============================================================================
// COLLECTION REFERENCES
// ============================================================================

/**
 * Collection names as constants for consistency
 */
export const COLLECTIONS = {
  DOCUMENTS: "documents",
  USERS: "users",
  ROOMS: "rooms",
} as const;

export type CollectionName = (typeof COLLECTIONS)[keyof typeof COLLECTIONS];
