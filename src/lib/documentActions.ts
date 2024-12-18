"use server";

import { adminDb } from "@/firebase/firebaseAdmin";
import { liveblocks } from "@/lib/liveblocks";
import { auth } from "@clerk/nextjs/server";
import { QueryDocumentSnapshot } from "firebase-admin/firestore";

interface Response {
  success: boolean;
  docId?: string;
}

export async function createNewDocument(): Promise<Response> {
  const { sessionClaims } = await auth.protect();

  try {
    const docCollectionRef = adminDb.collection("documents");
    const docRef = await docCollectionRef.add({
      title: "New Doc",
    });

    // Ensure sessionClaims?.email is a valid string
    const email =
      typeof sessionClaims?.email === "string" ? sessionClaims.email : "noUser";

    await adminDb
      .collection("users")
      .doc(email) // email is guaranteed to be a string here
      .collection("rooms")
      .doc(docRef.id)
      .set({
        userId: email,
        role: "owner",
        createdAt: new Date(),
        roomId: docRef.id,
      });

    return { success: true, docId: docRef.id };
  } catch (error) {
    console.error("Error creating document:", error);
    return { success: false };
  }
}

export async function deleteDocument(roomId: string): Promise<Response> {
  await auth.protect();

  try {
    await adminDb.collection("documents").doc(roomId).delete();

    const query = await adminDb
      .collectionGroup("rooms")
      .where("roomId", "==", roomId)
      .get();

    const batch = adminDb.batch();
    query.docs.forEach((doc: QueryDocumentSnapshot) => {
      batch.delete(doc.ref);
    });
    await batch.commit();

    await liveblocks.deleteRoom(roomId);

    return { success: true };
  } catch (error) {
    console.error("Error deleting document:", error);
    return { success: false };
  }
}

export async function inviteUserToDocument(
  roomId: string,
  email: string
): Promise<Response> {
  await auth.protect();

  try {
    await adminDb
      .collection("users")
      .doc(email)
      .collection("rooms")
      .doc(roomId)
      .set({
        userId: email,
        role: "editor",
        createdAt: new Date(),
        roomId,
      });
    return { success: true };
  } catch (error) {
    console.error("Error inviting user to document:", error);
    return { success: false };
  }
}

export async function removeUserFromDocument(
  roomId: string,
  userId: string
): Promise<Response> {
  await auth.protect();

  try {
    await adminDb
      .collection("users")
      .doc(userId)
      .collection("rooms")
      .doc(roomId)
      .delete();
    return { success: true };
  } catch (error) {
    console.error("Error removing user from document:", error);
    return { success: false };
  }
}
