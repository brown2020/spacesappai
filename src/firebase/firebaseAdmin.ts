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
function getAdminCredentials() {
  return {
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
}

// ============================================================================
// FIREBASE ADMIN INITIALIZATION
// ============================================================================

/**
 * Initialize Firebase Admin app (singleton pattern).
 * Lazy so `next build` can collect page data without server credentials in CI.
 */
function initializeFirebaseAdmin(): App {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  const adminCredentials = getAdminCredentials();
  if (!adminCredentials.projectId || !adminCredentials.privateKey) {
    throw new Error(
      "Firebase Admin credentials are required (FIREBASE_PROJECT_ID / FIREBASE_PRIVATE_KEY)."
    );
  }

  return admin.initializeApp({
    credential: admin.credential.cert(adminCredentials),
    storageBucket: clientEnv.firebase.storageBucket,
  });
}

function getAdminApp(): App {
  return initializeFirebaseAdmin();
}

// ============================================================================
// FIREBASE ADMIN SERVICES
// ============================================================================

function createLazyService<T extends object>(factory: () => T): T {
  let instance: T | null = null;
  return new Proxy({} as T, {
    get(_target, prop, receiver) {
      if (!instance) {
        instance = factory();
      }
      const value = Reflect.get(instance, prop, receiver);
      return typeof value === "function" ? value.bind(instance) : value;
    },
  });
}

/**
 * Firestore Admin database instance (lazy)
 */
export const adminDb: Firestore = createLazyService(() =>
  getFirestore(getAdminApp())
);

/**
 * Firebase Admin Authentication instance (lazy)
 */
export const adminAuth: Auth = createLazyService(() => getAuth(getAdminApp()));
