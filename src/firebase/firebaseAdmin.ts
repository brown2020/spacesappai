import admin from "firebase-admin";
import { getApps, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { getAuth, type Auth } from "firebase-admin/auth";
import { clientEnv, serverEnv } from "@/lib/env";

// ============================================================================
// FIREBASE ADMIN CONFIGURATION
// ============================================================================

/**
 * Firebase Admin credentials from environment variables
 */
const adminCredentials = {
  type: serverEnv.firebase.type,
  projectId: serverEnv.firebase.projectId,
  privateKeyId: serverEnv.firebase.privateKeyId,
  privateKey: serverEnv.firebase.privateKey,
  clientEmail: serverEnv.firebase.clientEmail,
  clientId: serverEnv.firebase.clientId,
  authUri: serverEnv.firebase.authUri,
  tokenUri: serverEnv.firebase.tokenUri,
  authProviderX509CertUrl: serverEnv.firebase.authProviderX509CertUrl,
  clientCertsUrl: serverEnv.firebase.clientCertsUrl,
} as const;

// ============================================================================
// FIREBASE ADMIN INITIALIZATION
// ============================================================================

/**
 * Initialize Firebase Admin app (singleton pattern)
 */
function initializeFirebaseAdmin(): App {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  return admin.initializeApp({
    credential: admin.credential.cert(adminCredentials),
    storageBucket: clientEnv.firebase.storageBucket,
  });
}

// Initialize on module load
initializeFirebaseAdmin();

// ============================================================================
// FIREBASE ADMIN SERVICES
// ============================================================================

/**
 * Firestore Admin database instance
 */
export const adminDb: Firestore = getFirestore();

/**
 * Firebase Admin Authentication instance
 */
export const adminAuth: Auth = getAuth();

