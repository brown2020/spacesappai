import { adminAuth, adminDb } from "@/firebase/firebaseAdmin";
import { COLLECTIONS } from "@/firebase/firebaseConfig";
import { requireAuthenticatedUser } from "@/lib/firebase-session";
import { normalizeEmail } from "@/lib/utils";

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
export async function ensureRoomHasOwner(
  roomId: string,
  user?: { uid: string; email?: string | null }
): Promise<void> {
  const authenticatedUser = user ?? (await requireAuthenticatedUser());
  const email = normalizeEmail(authenticatedUser.email);
  const shouldDebug =
    process.env.NODE_ENV !== "production" &&
    process.env.ROOM_OWNERSHIP_DEBUG === "1";

  const docExists = await adminDb
    .collection(COLLECTIONS.DOCUMENTS)
    .doc(roomId)
    .get()
    .then((snap) => snap.exists)
    .catch(() => false);

  if (shouldDebug) {
    console.info("[ensureRoomHasOwner] start", {
      roomId,
      uid: authenticatedUser.uid,
      email: authenticatedUser.email ?? null,
      docExists,
    });
  }

  if (!docExists) return;

  const ownerCandidates = await adminDb
    .collectionGroup(COLLECTIONS.ROOMS)
    .where("roomId", "==", roomId)
    .where("role", "==", "owner")
    .get();

  // Only treat Firebase-auth-uid owners as canonical.
  // Legacy data can be keyed by email (`users/{email}/...`) or other ids (e.g. Clerk userId),
  // which can falsely satisfy "owner exists" checks while the real uid-keyed entry is "editor".
  //
  // We validate by checking if `users/{parentUserDocId}` is a real Firebase Auth user.
  let hasCanonicalOwner = false;
  for (const doc of ownerCandidates.docs.slice(0, 10)) {
    const parentUserDocId = doc.ref.parent.parent?.id;
    if (!parentUserDocId) continue;
    if (parentUserDocId.includes("@")) continue; // fast-path: legacy email-keyed user doc

    try {
      await adminAuth.getUser(parentUserDocId);
      hasCanonicalOwner = true;
      break;
    } catch {
      // Not a Firebase Auth uid; treat as legacy and keep scanning.
    }
  }

  if (shouldDebug) {
    const sample = ownerCandidates.docs.slice(0, 10).map((d) => {
      const parentUserDocId = d.ref.parent.parent?.id ?? null;
      const data = d.data() as Record<string, unknown>;
      return {
        parentUserDocId,
        userId: typeof data.userId === "string" ? data.userId : null,
        userEmail: typeof data.userEmail === "string" ? data.userEmail : null,
        role: typeof data.role === "string" ? data.role : null,
      };
    });
    console.info("[ensureRoomHasOwner] owners", {
      roomId,
      ownerCount: ownerCandidates.size,
      hasCanonicalOwner,
      sample,
    });
  }

  if (hasCanonicalOwner) return;

  // If only legacy owners exist, only promote the current user when there's strong evidence
  // they were the legacy owner (by email).
  let matchedLegacyParentUserDocId: string | null = null;
  let matchedLegacyData: Record<string, unknown> | null = null;
  if (!ownerCandidates.empty && email) {
    const isLegacyOwnerForCurrentUser = ownerCandidates.docs.some((doc) => {
      const data = doc.data() as Record<string, unknown>;
      const parentUserDocId = doc.ref.parent.parent?.id ?? "";
      const docUserEmail =
        typeof data.userEmail === "string" ? normalizeEmail(data.userEmail) : "";
      const docUserId = typeof data.userId === "string" ? data.userId : "";

      const isMatch =
        parentUserDocId.toLowerCase() === email ||
        docUserEmail === email ||
        docUserId.toLowerCase() === email;
      if (isMatch) {
        matchedLegacyParentUserDocId = doc.ref.parent.parent?.id ?? null;
        matchedLegacyData = data;
      }
      return isMatch;
    });

    if (shouldDebug) {
      console.info("[ensureRoomHasOwner] legacy-owner-match", {
        roomId,
        isLegacyOwnerForCurrentUser,
        matchedLegacyParentUserDocId,
      });
    }

    if (!isLegacyOwnerForCurrentUser) return;
  }

  // Use a transaction to prevent two concurrent users from both being promoted to owner
  const currentUserRoomRef = adminDb
    .collection(COLLECTIONS.USERS)
    .doc(authenticatedUser.uid)
    .collection(COLLECTIONS.ROOMS)
    .doc(roomId);

  await adminDb.runTransaction(async (transaction) => {
    const currentUserRoomSnap = await transaction.get(currentUserRoomRef);

    if (!currentUserRoomSnap.exists) {
      if (!matchedLegacyData) {
        if (shouldDebug) {
          console.info("[ensureRoomHasOwner] uid-room-missing-no-legacy-match", {
            roomId,
            uid: authenticatedUser.uid,
          });
        }
        return;
      }

      // Only pick known fields from legacy data to avoid writing arbitrary data
      const legacyData = matchedLegacyData as Record<string, unknown>;
      const safeFields: Record<string, unknown> = {};
      for (const key of ["createdAt", "roomId", "userId", "userEmail", "role"]) {
        if (key in legacyData) safeFields[key] = legacyData[key];
      }

      transaction.set(currentUserRoomRef, {
        ...safeFields,
        role: "owner",
        userId: authenticatedUser.uid,
        userEmail: authenticatedUser.email ?? undefined,
        roomId,
      }, { merge: true });

      if (shouldDebug) {
        console.info("[ensureRoomHasOwner] created-uid-owner-entry", {
          roomId,
          uid: authenticatedUser.uid,
        });
      }
      return;
    }

    transaction.set(currentUserRoomRef, {
      role: "owner",
      userId: authenticatedUser.uid,
      userEmail: authenticatedUser.email ?? undefined,
      roomId,
    }, { merge: true });

    if (shouldDebug) {
      console.info("[ensureRoomHasOwner] promoted-existing-uid-entry-to-owner", {
        roomId,
        uid: authenticatedUser.uid,
      });
    }
  });
}
