import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import {
  getFirestore,
  initializeFirestore,
  type Firestore,
} from "firebase/firestore";
import { getAuth, type Auth } from "firebase/auth";
import { clientEnv } from "@/lib/client-env";

export { COLLECTIONS } from "@/firebase/collections";

// ============================================================================
// FIREBASE CLIENT CONFIGURATION
// ============================================================================

/**
 * Firebase configuration from environment variables.
 * These are inlined at build time. Missing values stay undefined so the
 * module can load during `next build` without initializing the SDK.
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

const MISSING_CLIENT_CONFIG_WARNING =
  "[firebase] Firebase client is not configured. Set NEXT_PUBLIC_FIREBASE_APIKEY, NEXT_PUBLIC_FIREBASE_AUTHDOMAIN, NEXT_PUBLIC_FIREBASE_PROJECTID, and NEXT_PUBLIC_FIREBASE_APPID. Auth and Firestore stay disabled until those are set.";

function isNonEmpty(value: string | undefined): value is string {
  return typeof value === "string" && value.length > 0;
}

/**
 * True when the public client config is complete enough to call initializeApp.
 * getAuth() rejects an API key that contains ":", so that shape is treated as unset.
 * App IDs look like "1:123:web:abc" and are allowed to contain colons.
 */
export function isFirebaseClientConfigured(): boolean {
  return (
    isNonEmpty(firebaseConfig.apiKey) &&
    !firebaseConfig.apiKey.includes(":") &&
    isNonEmpty(firebaseConfig.authDomain) &&
    isNonEmpty(firebaseConfig.projectId) &&
    isNonEmpty(firebaseConfig.appId)
  );
}

declare global {
  var __FIREBASE_CLIENT_DB__: Firestore | undefined;
  var __FIREBASE_CLIENT_CONFIG_WARNED__: boolean | undefined;
}

function warnMissingFirebaseConfig(): void {
  if (globalThis.__FIREBASE_CLIENT_CONFIG_WARNED__) return;
  globalThis.__FIREBASE_CLIENT_CONFIG_WARNED__ = true;
  console.warn(MISSING_CLIENT_CONFIG_WARNING);
}

if (!isFirebaseClientConfigured()) {
  warnMissingFirebaseConfig();
}

// ============================================================================
// FIREBASE INITIALIZATION
// ============================================================================

/**
 * Browser-only app singleton. Never called while Next is prerendering.
 */
function getFirebaseApp(): FirebaseApp {
  if (getApps().length > 0) {
    return getApp();
  }
  return initializeApp({
    apiKey: firebaseConfig.apiKey,
    authDomain: firebaseConfig.authDomain,
    projectId: firebaseConfig.projectId,
    storageBucket: firebaseConfig.storageBucket,
    messagingSenderId: firebaseConfig.messagingSenderId,
    appId: firebaseConfig.appId,
    measurementId: firebaseConfig.measurementId,
  });
}

function createBrowserAuth(): Auth {
  return getAuth(getFirebaseApp());
}

function createBrowserFirestore(): Firestore {
  if (globalThis.__FIREBASE_CLIENT_DB__) {
    return globalThis.__FIREBASE_CLIENT_DB__;
  }

  const firebaseApp = getFirebaseApp();
  const isLocalhost =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";

  // Workaround for Firestore watch-stream internal assertion issues seen in
  // some local dev setups (React/Next Fast Refresh + WebChannel streaming).
  const db = isLocalhost
    ? initializeFirestore(firebaseApp, {
        experimentalForceLongPolling: true,
      })
    : getFirestore(firebaseApp);

  globalThis.__FIREBASE_CLIENT_DB__ = db;
  return db;
}

/**
 * Stand-in used on the server and when public config is missing.
 * `useAuthState` reads `currentUser` during render. Auth listeners are
 * no-ops so effects do not call getAuth().
 */
const unavailableAuth = {
  currentUser: null,
  onAuthStateChanged(next?: (user: null) => void) {
    if (typeof next === "function") next(null);
    return () => {};
  },
  onIdTokenChanged(next?: (user: null) => void) {
    if (typeof next === "function") next(null);
    return () => {};
  },
} as unknown as Auth;

function resolveAuth(): Auth {
  if (typeof window === "undefined" || !isFirebaseClientConfigured()) {
    return unavailableAuth;
  }
  return createBrowserAuth();
}

/**
 * Stand-in Firestore. Nothing on the home page reads it during prerender.
 * Document screens only touch Firestore in the browser after config is present.
 */
const unavailableDb = {} as Firestore;

function resolveDb(): Firestore {
  if (typeof window === "undefined" || !isFirebaseClientConfigured()) {
    return unavailableDb;
  }
  return createBrowserFirestore();
}

/**
 * Auth and Firestore are created when this module loads in the browser with
 * a complete public config. Server prerender and `next build` keep the
 * unavailable stand-in so getAuth() is not called without an API key.
 */
export const auth: Auth = resolveAuth();
export const db: Firestore = resolveDb();
