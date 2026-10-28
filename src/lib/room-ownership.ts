import { FieldValue } from "firebase-admin/firestore";
import { adminAuth, adminDb } from "@/firebase/firebaseAdmin";
import { COLLECTIONS } from "@/firebase/collections";
import {
  requireAuthenticatedUser,
  type AuthenticatedUser,
} from "@/lib/firebase-session";
import {
  decideOwnershipPromotion,
  MAX_OWNER_CANDIDATES,
} from "@/lib/room-ownership-policy";
import { normalizeEmail } from "@/lib/utils";

/**
 * Ensure a room has at least one canonical Firebase-auth owner.
 *
 * Promotes an existing editor when no owner remains. A viewer is promoted
 * only when a verified email matches a legacy owner row. The document
 * `ownerId` field is the transaction lock so two members cannot both promote.
 */
export async function ensureRoomHasOwner(
  roomId: string,
  user?: Pick<AuthenticatedUser, "uid" | "email" | "emailVerified">
): Promise<void> {
  const authenticatedUser = user ?? (await requireAuthenticatedUser());
  const email = normalizeEmail(authenticatedUser.email);
  const emailVerified = authenticatedUser.emailVerified === true;
  const shouldDebug =
    process.env.NODE_ENV !== "production" &&
    process.env.ROOM_OWNERSHIP_DEBUG === "1";

  const docRef = adminDb.collection(COLLECTIONS.DOCUMENTS).doc(roomId);
  const docSnap = await docRef.get().catch(() => null);
  if (!docSnap?.exists) return;

  const recordedOwnerId = docSnap.data()?.ownerId;
  if (typeof recordedOwnerId === "string" && recordedOwnerId.length > 0) {
    try {
      await adminAuth.getUser(recordedOwnerId);
      return;
    } catch {
      // Stale lock. Fall through and assign a live owner.
    }
  }

  if (shouldDebug) {
    console.info("[ensureRoomHasOwner] start", {
      roomId,
      uid: authenticatedUser.uid,
      emailVerified,
    });
  }

  const ownerCandidates = await adminDb
    .collectionGroup(COLLECTIONS.ROOMS)
    .where("roomId", "==", roomId)
    .where("role", "==", "owner")
    .limit(MAX_OWNER_CANDIDATES + 1)
    .get();

  if (ownerCandidates.size > MAX_OWNER_CANDIDATES) {
    if (shouldDebug) {
      console.info("[ensureRoomHasOwner] too-many-owner-rows", {
        roomId,
        ownerCount: ownerCandidates.size,
      });
    }
    return;
  }

  let hasCanonicalOwner = false;
  for (const ownerDoc of ownerCandidates.docs) {
    const parentUserDocId = ownerDoc.ref.parent.parent?.id;
    if (!parentUserDocId || parentUserDocId.includes("@")) continue;
    try {
      await adminAuth.getUser(parentUserDocId);
      hasCanonicalOwner = true;
      break;
    } catch {
      // Not a Firebase Auth uid; treat as legacy and keep scanning.
    }
  }

  if (hasCanonicalOwner) return;

  let hasVerifiedLegacyMatch = false;
  let matchedLegacyData: Record<string, unknown> | null = null;
  if (!ownerCandidates.empty && email && emailVerified) {
    for (const ownerDoc of ownerCandidates.docs) {
      const data = ownerDoc.data() as Record<string, unknown>;
      const parentUserDocId = ownerDoc.ref.parent.parent?.id ?? "";
      const docUserEmail =
        typeof data.userEmail === "string" ? normalizeEmail(data.userEmail) : "";
      const docUserId = typeof data.userId === "string" ? data.userId : "";
      const isMatch =
        parentUserDocId.toLowerCase() === email ||
        docUserEmail === email ||
        docUserId.toLowerCase() === email;
      if (isMatch) {
        hasVerifiedLegacyMatch = true;
        matchedLegacyData = data;
        break;
      }
    }
  }

  const currentUserRoomRef = adminDb
    .collection(COLLECTIONS.USERS)
    .doc(authenticatedUser.uid)
    .collection(COLLECTIONS.ROOMS)
    .doc(roomId);

  const currentUserRoomSnap = await currentUserRoomRef.get();
  const currentRole = currentUserRoomSnap.exists
    ? (currentUserRoomSnap.data()?.role as "owner" | "editor" | "viewer" | undefined)
    : null;

  const decision = decideOwnershipPromotion({
    hasCanonicalOwner,
    ownerCandidateCount: ownerCandidates.size,
    hasVerifiedLegacyMatch,
    currentRole: currentRole ?? null,
  });

  if (decision === "noop") return;

  await adminDb.runTransaction(async (transaction) => {
    const freshDoc = await transaction.get(docRef);
    if (!freshDoc.exists) return;

    const lockedOwnerId = freshDoc.data()?.ownerId;
    const hadStaleLock =
      typeof recordedOwnerId === "string" && recordedOwnerId.length > 0;
    if (typeof lockedOwnerId === "string" && lockedOwnerId.length > 0) {
      // A concurrent heal already published a new owner, or the lock is live.
      if (!hadStaleLock || lockedOwnerId !== recordedOwnerId) return;
    }

    const freshRoom = await transaction.get(currentUserRoomRef);
    const freshRole = freshRoom.exists
      ? (freshRoom.data()?.role as "owner" | "editor" | "viewer" | undefined) ?? null
      : null;

    const freshDecision = decideOwnershipPromotion({
      hasCanonicalOwner: false,
      ownerCandidateCount: ownerCandidates.size,
      hasVerifiedLegacyMatch,
      currentRole: freshRole,
    });

    if (freshDecision === "noop") return;

    if (freshDecision === "create-from-legacy") {
      const legacyData = matchedLegacyData ?? {};
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
      });
    } else {
      transaction.set(
        currentUserRoomRef,
        {
          role: "owner",
          userId: authenticatedUser.uid,
          userEmail: authenticatedUser.email ?? undefined,
          roomId,
        },
        { merge: true }
      );
    }

    transaction.update(docRef, {
      ownerId: authenticatedUser.uid,
      updatedAt: FieldValue.serverTimestamp(),
    });
  });
}
