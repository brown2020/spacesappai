import { adminAuth, adminDb } from "@/firebase/firebaseAdmin";
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
  const email = (user.email ?? "").toLowerCase().trim();
  const shouldDebug =
    process.env.NODE_ENV !== "production" &&
    (process.env.ROOM_OWNERSHIP_DEBUG === "1" ||
      roomId === "SbYy0vIHt7zblvfxv8Et");

  const docExists = await adminDb
    .collection(COLLECTIONS.DOCUMENTS)
    .doc(roomId)
    .get()
    .then((snap) => snap.exists)
    .catch(() => false);

  if (shouldDebug) {
    console.info("[ensureRoomHasOwner] start", {
      roomId,
      uid: user.uid,
      email: user.email ?? null,
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
        typeof data.userEmail === "string" ? data.userEmail.toLowerCase().trim() : "";
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

  const currentUserRoomRef = adminDb
    .collection(COLLECTIONS.USERS)
    .doc(user.uid)
    .collection(COLLECTIONS.ROOMS)
    .doc(roomId);

  const currentUserRoomSnap = await currentUserRoomRef.get();
  if (!currentUserRoomSnap.exists) {
    // If the uid-keyed entry doesn't exist but we matched a legacy owner doc to this user,
    // create the uid-keyed owner entry to restore expected behavior.
    if (!matchedLegacyData) {
      if (shouldDebug) {
        console.info("[ensureRoomHasOwner] uid-room-missing-no-legacy-match", {
          roomId,
          uid: user.uid,
        });
      }
      return;
    }

    // TS note: matchedLegacyData is assigned inside a callback. Some TS control-flow
    // paths don't narrow it reliably under Next's build typecheck, so we assert here.
    const legacyData = matchedLegacyData as Record<string, unknown>;

    await currentUserRoomRef.set(
      {
        ...legacyData,
        role: "owner",
        userId: user.uid,
        userEmail: user.email ?? undefined,
        roomId,
      },
      { merge: true }
    );

    if (shouldDebug) {
      console.info("[ensureRoomHasOwner] created-uid-owner-entry", {
        roomId,
        uid: user.uid,
      });
    }

    return;
  }

  await currentUserRoomRef.set(
    {
      role: "owner",
      userId: user.uid,
      userEmail: user.email ?? undefined,
      roomId,
    },
    { merge: true }
  );

  if (shouldDebug) {
    console.info("[ensureRoomHasOwner] promoted-existing-uid-entry-to-owner", {
      roomId,
      uid: user.uid,
    });
  }
}
