/**
 * Environment variable validation and access
 * Ensures all required environment variables are present at runtime
 */

// ============================================================================
// CLIENT-SIDE ENVIRONMENT VARIABLES
// ============================================================================

/**
 * Client-side environment configuration
 * These are exposed to the browser (NEXT_PUBLIC_ prefix)
 */
export const clientEnv = {
  firebase: {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_APIKEY!,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTHDOMAIN!,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECTID!,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGEBUCKET!,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGINGSENDERID!,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APPID!,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENTID,
  },
  liveblocks: {
    publicKey: process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY!,
  },
} as const;

// ============================================================================
// SERVER-SIDE ENVIRONMENT VARIABLES
// ============================================================================

/**
 * Server-side environment configuration
 * These are only available on the server
 */
export const serverEnv = {
  firebase: {
    type: process.env.FIREBASE_TYPE!,
    projectId: process.env.FIREBASE_PROJECT_ID!,
    privateKeyId: process.env.FIREBASE_PRIVATE_KEY_ID!,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
    clientId: process.env.FIREBASE_CLIENT_ID!,
    authUri: process.env.FIREBASE_AUTH_URI!,
    tokenUri: process.env.FIREBASE_TOKEN_URI!,
    authProviderX509CertUrl: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL!,
    clientCertsUrl: process.env.FIREBASE_CLIENT_CERTS_URL!,
  },
  liveblocks: {
    secretKey: process.env.LIVEBLOCKS_PRIVATE_KEY!,
  },
  ai: {
    openaiApiKey: process.env.OPENAI_API_KEY,
    googleApiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    mistralApiKey: process.env.MISTRAL_API_KEY,
    anthropicApiKey: process.env.ANTHROPIC_API_KEY,
    fireworksApiKey: process.env.FIREWORKS_API_KEY,
  },
  nodeEnv: process.env.NODE_ENV ?? "development",
} as const;

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Validates that a required environment variable is present
 */
export function requireEnv(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

/**
 * Validates client-side environment variables
 * Call this in a client component to ensure env vars are present
 */
export function validateClientEnv(): void {
  const required = [
    ["NEXT_PUBLIC_FIREBASE_APIKEY", clientEnv.firebase.apiKey],
    ["NEXT_PUBLIC_FIREBASE_PROJECTID", clientEnv.firebase.projectId],
    ["NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY", clientEnv.liveblocks.publicKey],
  ] as const;

  for (const [name, value] of required) {
    if (!value) {
      console.error(`Missing required client environment variable: ${name}`);
    }
  }
}

/**
 * Validates server-side environment variables
 * Call this on server startup
 */
export function validateServerEnv(): void {
  const required = [
    ["FIREBASE_PROJECT_ID", serverEnv.firebase.projectId],
    ["FIREBASE_PRIVATE_KEY", serverEnv.firebase.privateKey],
    ["FIREBASE_CLIENT_EMAIL", serverEnv.firebase.clientEmail],
    ["LIVEBLOCKS_PRIVATE_KEY", serverEnv.liveblocks.secretKey],
  ] as const;

  for (const [name, value] of required) {
    if (!value) {
      throw new Error(`Missing required server environment variable: ${name}`);
    }
  }
}

// ============================================================================
// ENVIRONMENT CHECKS
// ============================================================================

export const isDev = serverEnv.nodeEnv === "development";
export const isProd = serverEnv.nodeEnv === "production";
export const isTest = serverEnv.nodeEnv === "test";







