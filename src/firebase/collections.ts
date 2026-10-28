/**
 * Firestore collection names. Kept separate from the client SDK so server
 * modules can use them without initializing browser Auth during `next build`.
 */
export const COLLECTIONS = {
  DOCUMENTS: "documents",
  USERS: "users",
  ROOMS: "rooms",
} as const;
