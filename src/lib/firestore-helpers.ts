import { adminDb } from "@/firebase/firebaseAdmin";
import { COLLECTIONS } from "@/firebase/collections";
import type { Transaction } from "firebase-admin/firestore";

/**
 * Get a reference to a user's room document
 */
export function getUserRoomRef(userId: string, roomId: string) {
  return adminDb
    .collection(COLLECTIONS.USERS)
    .doc(userId)
    .collection(COLLECTIONS.ROOMS)
    .doc(roomId);
}

/**
 * Get a reference to a document
 */
export function getDocumentRef(roomId: string) {
  return adminDb.collection(COLLECTIONS.DOCUMENTS).doc(roomId);
}

/** Membership row for a document, or null when the user has no access. */
export async function getUserRoomMembership(
  userId: string,
  roomId: string
): Promise<{ role: string | null } | null> {
  if (!userId || !roomId) return null;
  const snap = await getUserRoomRef(userId, roomId).get();
  if (!snap.exists) return null;
  const role = snap.data()?.role;
  return { role: typeof role === "string" && role.length > 0 ? role : null };
}

/** True when the user has any membership row for the document. */
export async function userHasRoomAccess(
  userId: string,
  roomId: string
): Promise<boolean> {
  return (await getUserRoomMembership(userId, roomId)) !== null;
}

/**
 * Verify user is owner of a room within a transaction.
 * Throws "FORBIDDEN" error if not owner.
 */
export async function verifyOwnership(
  transaction: Transaction,
  userId: string,
  roomId: string
): Promise<void> {
  const ownerRoomRef = getUserRoomRef(userId, roomId);
  const ownerRoomDoc = await transaction.get(ownerRoomRef);

  if (!ownerRoomDoc.exists || ownerRoomDoc.data()?.role !== "owner") {
    throw new Error("FORBIDDEN");
  }
}
