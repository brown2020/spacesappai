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

/** True when the user has any membership row for the document. */
export async function userHasRoomAccess(
  userId: string,
  roomId: string
): Promise<boolean> {
  if (!userId || !roomId) return false;
  const snap = await getUserRoomRef(userId, roomId).get();
  return snap.exists;
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
