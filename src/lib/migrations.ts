"use server";

import { auth } from "@clerk/nextjs/server";
import { adminDb } from "@/firebase/firebaseAdmin";
import { COLLECTIONS } from "@/firebase/firebaseConfig";
import { getUserEmail } from "@/lib/auth-utils";

/**
 * Migrates legacy room entries from `users/{email}/rooms/*` to `users/{uid}/rooms/*`.
 *
 * This is needed because the app originally keyed Firestore by email, but our
 * rules + auth are moving to `request.auth.uid` (Firebase custom token where
 * uid = Clerk userId).
 */
export async function migrateUserRoomsToUid(): Promise<void> {
  const { userId, sessionClaims } = await auth.protect();
  const email = getUserEmail(sessionClaims);

  // Nothing to migrate if we can't determine email.
  if (!email || email === "anonymous") return;

  const oldRoomsRef = adminDb
    .collection(COLLECTIONS.USERS)
    .doc(email)
    .collection(COLLECTIONS.ROOMS);

  const newRoomsRef = adminDb
    .collection(COLLECTIONS.USERS)
    .doc(userId)
    .collection(COLLECTIONS.ROOMS);

  const snapshot = await oldRoomsRef.get();
  if (snapshot.empty) return;

  const BATCH_SIZE = 400;
  let batch = adminDb.batch();
  let opCount = 0;

  for (const docSnap of snapshot.docs) {
    const data = docSnap.data();
    const targetRef = newRoomsRef.doc(docSnap.id);

    batch.set(
      targetRef,
      {
        ...data,
        userId,
        userEmail: email,
      },
      { merge: true }
    );

    // Delete legacy entry to avoid duplicates.
    batch.delete(docSnap.ref);

    opCount += 2;
    if (opCount >= BATCH_SIZE) {
      await batch.commit();
      batch = adminDb.batch();
      opCount = 0;
    }
  }

  if (opCount > 0) {
    await batch.commit();
  }
}


