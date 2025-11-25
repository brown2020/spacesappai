"use server";

import { auth } from "@clerk/nextjs/server";
import { QueryDocumentSnapshot } from "firebase-admin/firestore";
import { adminDb, createBatch } from "@/firebase/firebaseAdmin";
import { liveblocks } from "@/lib/liveblocks";
import type {
  ActionResponse,
  ActionErrorCode,
  CreateDocumentResponse,
} from "@/types";

// ============================================================================
// CONSTANTS
// ============================================================================

const COLLECTIONS = {
  DOCUMENTS: "documents",
  USERS: "users",
  ROOMS: "rooms",
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get user email from session claims with fallback
 */
function getUserEmail(sessionClaims: Record<string, unknown> | null): string {
  if (typeof sessionClaims?.email === "string") {
    return sessionClaims.email;
  }
  return "anonymous";
}

/**
 * Create an error response
 */
function errorResponse<T = undefined>(
  code: ActionErrorCode,
  message: string
): ActionResponse<T> {
  return {
    success: false,
    error: { code, message },
  };
}

/**
 * Create a success response
 */
function successResponse<T>(data?: T): ActionResponse<T> {
  return {
    success: true,
    data,
  };
}

// ============================================================================
// DOCUMENT ACTIONS
// ============================================================================

/**
 * Create a new document and assign the current user as owner
 */
export async function createNewDocument(): Promise<
  ActionResponse<CreateDocumentResponse>
> {
  try {
    const { sessionClaims } = await auth.protect();
    const email = getUserEmail(sessionClaims);

    // Create the document
    const docRef = await adminDb.collection(COLLECTIONS.DOCUMENTS).add({
      title: "New Doc",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Create room entry for the owner
    await adminDb
      .collection(COLLECTIONS.USERS)
      .doc(email)
      .collection(COLLECTIONS.ROOMS)
      .doc(docRef.id)
      .set({
        userId: email,
        role: "owner",
        createdAt: new Date(),
        roomId: docRef.id,
      });

    return successResponse({ docId: docRef.id });
  } catch (error) {
    console.error("[createNewDocument] Error:", error);
    return errorResponse<CreateDocumentResponse>(
      "INTERNAL_ERROR",
      "Failed to create document. Please try again."
    );
  }
}

/**
 * Delete a document and all associated room entries
 */
export async function deleteDocument(
  roomId: string
): Promise<ActionResponse<void>> {
  try {
    await auth.protect();

    // Delete the document
    await adminDb.collection(COLLECTIONS.DOCUMENTS).doc(roomId).delete();

    // Find and delete all room entries for this document
    const roomsQuery = await adminDb
      .collectionGroup(COLLECTIONS.ROOMS)
      .where("roomId", "==", roomId)
      .get();

    // Batch delete all room entries
    const batch = createBatch();
    roomsQuery.docs.forEach((doc: QueryDocumentSnapshot) => {
      batch.delete(doc.ref);
    });
    await batch.commit();

    // Delete the Liveblocks room
    await liveblocks.deleteRoom(roomId);

    return successResponse();
  } catch (error) {
    console.error("[deleteDocument] Error:", error);
    return errorResponse(
      "INTERNAL_ERROR",
      "Failed to delete document. Please try again."
    );
  }
}

/**
 * Invite a user to collaborate on a document
 */
export async function inviteUserToDocument(
  roomId: string,
  email: string
): Promise<ActionResponse<void>> {
  try {
    await auth.protect();

    // Validate email
    if (!email || !email.includes("@")) {
      return errorResponse("VALIDATION_ERROR", "Please provide a valid email.");
    }

    // Check if user is already in the room
    const existingEntry = await adminDb
      .collection(COLLECTIONS.USERS)
      .doc(email)
      .collection(COLLECTIONS.ROOMS)
      .doc(roomId)
      .get();

    if (existingEntry.exists) {
      return errorResponse(
        "VALIDATION_ERROR",
        "User already has access to this document."
      );
    }

    // Create room entry for the invited user
    await adminDb
      .collection(COLLECTIONS.USERS)
      .doc(email)
      .collection(COLLECTIONS.ROOMS)
      .doc(roomId)
      .set({
        userId: email,
        role: "editor",
        createdAt: new Date(),
        roomId,
      });

    return successResponse();
  } catch (error) {
    console.error("[inviteUserToDocument] Error:", error);
    return errorResponse(
      "INTERNAL_ERROR",
      "Failed to invite user. Please try again."
    );
  }
}

/**
 * Remove a user's access to a document
 */
export async function removeUserFromDocument(
  roomId: string,
  userId: string
): Promise<ActionResponse<void>> {
  try {
    await auth.protect();

    // Delete the room entry
    await adminDb
      .collection(COLLECTIONS.USERS)
      .doc(userId)
      .collection(COLLECTIONS.ROOMS)
      .doc(roomId)
      .delete();

    return successResponse();
  } catch (error) {
    console.error("[removeUserFromDocument] Error:", error);
    return errorResponse(
      "INTERNAL_ERROR",
      "Failed to remove user. Please try again."
    );
  }
}
