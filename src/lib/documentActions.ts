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

/**
 * Check if user is the owner of a document
 */
async function isDocumentOwner(
  userEmail: string,
  roomId: string
): Promise<boolean> {
  const roomDoc = await adminDb
    .collection(COLLECTIONS.USERS)
    .doc(userEmail)
    .collection(COLLECTIONS.ROOMS)
    .doc(roomId)
    .get();

  return roomDoc.exists && roomDoc.data()?.role === "owner";
}

// ============================================================================
// DOCUMENT ACTIONS
// ============================================================================

/**
 * Create a new document and assign the current user as owner
 * Uses Firestore transaction for atomicity
 */
export async function createNewDocument(): Promise<
  ActionResponse<CreateDocumentResponse>
> {
  try {
    const { sessionClaims } = await auth.protect();
    const email = getUserEmail(sessionClaims);

    // Use transaction for atomic operation
    const docId = await adminDb.runTransaction(async (transaction) => {
      // Create the document
      const docRef = adminDb.collection(COLLECTIONS.DOCUMENTS).doc();

      transaction.set(docRef, {
        title: "New Doc",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Create room entry for the owner
      const roomRef = adminDb
        .collection(COLLECTIONS.USERS)
        .doc(email)
        .collection(COLLECTIONS.ROOMS)
        .doc(docRef.id);

      transaction.set(roomRef, {
        userId: email,
        role: "owner",
        createdAt: new Date(),
        roomId: docRef.id,
      });

      return docRef.id;
    });

    return successResponse({ docId });
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
 * Only the owner can delete a document
 * Uses batch operations for atomicity
 */
export async function deleteDocument(
  roomId: string
): Promise<ActionResponse<void>> {
  try {
    const { sessionClaims } = await auth.protect();
    const email = getUserEmail(sessionClaims);

    // Authorization: Check if user is the owner
    const isOwner = await isDocumentOwner(email, roomId);
    if (!isOwner) {
      return errorResponse(
        "FORBIDDEN",
        "Only the document owner can delete this document."
      );
    }

    // Find all room entries for this document BEFORE deleting anything
    const roomsQuery = await adminDb
      .collectionGroup(COLLECTIONS.ROOMS)
      .where("roomId", "==", roomId)
      .get();

    // Use batch to delete document AND all room entries atomically
    const batch = createBatch();
    
    // Add document deletion to batch
    batch.delete(adminDb.collection(COLLECTIONS.DOCUMENTS).doc(roomId));
    
    // Add all room entry deletions to batch
    roomsQuery.docs.forEach((doc: QueryDocumentSnapshot) => {
      batch.delete(doc.ref);
    });
    
    // Commit all deletions atomically
    await batch.commit();

    // Delete the Liveblocks room (external service, best-effort)
    try {
      await liveblocks.deleteRoom(roomId);
    } catch (liveblocksError) {
      // Log but don't fail - room might not exist in Liveblocks
      console.warn(
        "[deleteDocument] Liveblocks room deletion:",
        liveblocksError
      );
    }

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
 * Only the owner can invite users
 */
export async function inviteUserToDocument(
  roomId: string,
  email: string
): Promise<ActionResponse<void>> {
  try {
    const { sessionClaims } = await auth.protect();
    const currentUserEmail = getUserEmail(sessionClaims);

    // Validate email
    if (!email || !email.includes("@")) {
      return errorResponse("VALIDATION_ERROR", "Please provide a valid email.");
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // Prevent self-invite
    if (normalizedEmail === currentUserEmail) {
      return errorResponse("VALIDATION_ERROR", "You cannot invite yourself.");
    }

    // Authorization: Check if current user is the owner
    const isOwner = await isDocumentOwner(currentUserEmail, roomId);
    if (!isOwner) {
      return errorResponse(
        "FORBIDDEN",
        "Only the document owner can invite users."
      );
    }

    // Check if user is already in the room
    const existingEntry = await adminDb
      .collection(COLLECTIONS.USERS)
      .doc(normalizedEmail)
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
      .doc(normalizedEmail)
      .collection(COLLECTIONS.ROOMS)
      .doc(roomId)
      .set({
        userId: normalizedEmail,
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
 * Only the owner can remove users, and owner cannot remove themselves
 */
export async function removeUserFromDocument(
  roomId: string,
  userIdToRemove: string
): Promise<ActionResponse<void>> {
  try {
    const { sessionClaims } = await auth.protect();
    const currentUserEmail = getUserEmail(sessionClaims);

    // Authorization: Check if current user is the owner
    const isOwner = await isDocumentOwner(currentUserEmail, roomId);
    if (!isOwner) {
      return errorResponse(
        "FORBIDDEN",
        "Only the document owner can remove users."
      );
    }

    // Prevent owner from removing themselves
    if (userIdToRemove === currentUserEmail) {
      return errorResponse(
        "VALIDATION_ERROR",
        "You cannot remove yourself. Delete the document instead."
      );
    }

    // Delete the room entry
    await adminDb
      .collection(COLLECTIONS.USERS)
      .doc(userIdToRemove)
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
