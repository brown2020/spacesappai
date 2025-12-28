import { adminDb } from "@/firebase/firebaseAdmin";
import { COLLECTIONS } from "@/firebase/firebaseConfig";
import { requireAuthenticatedUser } from "@/lib/firebase-session";

/**
 * Ensure a room has at least one owner.
 *
 * This is a targeted self-heal for a data-corruption case where migrations could
 * accidentally remove the last owner role for a room, bricking owner-only UI
 * (delete/invite) for everyone.
 *
 * Behavior: if an owner exists, this is a no-op. If no owner exists and the
 * current user has a room entry, we promote that entry to `role: "owner"`.
 */
export async function ensureRoomHasOwner(roomId: string): Promise<void> {
  const user = await requireAuthenticatedUser();

  const docExists = await adminDb
    .collection(COLLECTIONS.DOCUMENTS)
    .doc(roomId)
    .get()
    .then((snap) => snap.exists)
    .catch(() => false);

  if (!docExists) return;

  const existingOwner = await adminDb
    .collectionGroup(COLLECTIONS.ROOMS)
    .where("roomId", "==", roomId)
    .where("role", "==", "owner")
    .limit(1)
    .get();

  if (!existingOwner.empty) return;

  const currentUserRoomRef = adminDb
    .collection(COLLECTIONS.USERS)
    .doc(user.uid)
    .collection(COLLECTIONS.ROOMS)
    .doc(roomId);

  const currentUserRoomSnap = await currentUserRoomRef.get();
  if (!currentUserRoomSnap.exists) return;

  await currentUserRoomRef.set(
    {
      role: "owner",
      userId: user.uid,
      userEmail: user.email ?? undefined,
      roomId,
    },
    { merge: true }
  );
}


