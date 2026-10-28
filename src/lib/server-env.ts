import "server-only";

/**
 * Server-only environment variables. Importing this module from a client
 * component fails the build.
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
