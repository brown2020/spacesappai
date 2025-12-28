"use server";

import { adminDb } from "@/firebase/firebaseAdmin";
import { COLLECTIONS } from "@/firebase/firebaseConfig";
import { requireAuthenticatedUser } from "@/lib/firebase-session";

/**
 * Migrates legacy room entries from `users/{email}/rooms/*` to `users/{uid}/rooms/*`.
 *
 * This is needed because the app originally keyed Firestore by email, but our
 * rules + auth are moving to `request.auth.uid`.
 *
 * Additionally, earlier iterations stored rooms under a non-Firebase uid
 * (e.g. Clerk userId). We migrate those too by matching on `userEmail`.
 */
export async function migrateUserRoomsToUid(): Promise<void> {
  const user = await requireAuthenticatedUser();
  const email = user.email ?? "anonymous";

  // Nothing to migrate if we can't determine email.
  if (!email || email === "anonymous") return;

  const oldRoomsRef = adminDb
    .collection(COLLECTIONS.USERS)
    .doc(email)
    .collection(COLLECTIONS.ROOMS);

  const newRoomsRef = adminDb
    .collection(COLLECTIONS.USERS)
    .doc(user.uid)
    .collection(COLLECTIONS.ROOMS);

  // 1) Legacy: users/{email}/rooms/*
  const emailKeyedSnapshot = await oldRoomsRef.get();

  // 2) Legacy: users/{nonFirebaseUid}/rooms/* where userEmail matches
  // This query may require an index. If it fails, we skip it (migration remains best-effort).
  let emailMatchedSnapshot:
    | FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>
    | null = null;
  try {
    emailMatchedSnapshot = await adminDb
      .collectionGroup(COLLECTIONS.ROOMS)
      .where("userEmail", "==", email)
      .get();
  } catch (err) {
    console.warn(
      "[migrateUserRoomsToUid] Skipping collectionGroup userEmail migration (likely missing index):",
      err
    );
  }

  if (emailKeyedSnapshot.empty && !emailMatchedSnapshot) return;
  if (emailKeyedSnapshot.empty && emailMatchedSnapshot?.empty) return;

  const BATCH_SIZE = 400;
  let batch = adminDb.batch();
  let opCount = 0;

  const commitIfNeeded = async () => {
    if (opCount < BATCH_SIZE) return;
    await batch.commit();
    batch = adminDb.batch();
    opCount = 0;
  };

  const migrateDoc = async (
    docSnap: FirebaseFirestore.QueryDocumentSnapshot
  ): Promise<void> => {
    const data = docSnap.data();
    const targetRef = newRoomsRef.doc(docSnap.id);

    // IMPORTANT:
    // Avoid downgrading an existing owner's role.
    //
    // Before this guard, a legacy "editor" entry could be merged onto an
    // already-migrated "owner" entry (same doc id), overwriting `role` and
    // effectively removing owner capabilities (delete/invite).
    const existing = await targetRef.get();
    const existingRole = existing.exists ? (existing.data()?.role as unknown) : null;
    const legacyRole = (data?.role as unknown) ?? null;
    const shouldForceOwner = existingRole === "owner" || legacyRole === "owner";

    batch.set(
      targetRef,
      existing.exists
        ? {
            ...(shouldForceOwner ? { role: "owner" } : null),
            userId: user.uid,
            userEmail: email,
          }
        : {
            ...data,
            ...(shouldForceOwner ? { role: "owner" } : null),
            userId: user.uid,
            userEmail: email,
          },
      { merge: true }
    );

    // Delete legacy entry to avoid duplicates.
    batch.delete(docSnap.ref);

    opCount += 2;
    await commitIfNeeded();
  };

  // 1) Migrate email-keyed rooms (users/{email}/rooms/*)
  for (const docSnap of emailKeyedSnapshot.docs) {
    await migrateDoc(docSnap);
  }

  // 2) Migrate rooms stored under some other user doc id, matched by email.
  // Skip docs already under users/{currentUid}/rooms/* (no-op).
  if (emailMatchedSnapshot) {
    for (const docSnap of emailMatchedSnapshot.docs) {
      const sourceUserDocId = docSnap.ref.parent.parent?.id;
      if (!sourceUserDocId) continue;
      if (sourceUserDocId === user.uid) continue;

      await migrateDoc(docSnap);
    }
  }

  if (opCount > 0) {
    await batch.commit();
  }
}


