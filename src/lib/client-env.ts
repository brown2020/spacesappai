/**
 * Browser-safe environment values. Only NEXT_PUBLIC_ variables and NODE_ENV.
 * Server secrets live in server-env.ts.
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

export const isProd = process.env.NODE_ENV === "production";
