"use server";

import { adminAuth, adminDb } from "@/firebase/firebaseAdmin";
import { COLLECTIONS } from "@/firebase/firebaseConfig";
import { liveblocks } from "@/lib/liveblocks";
import { requireAuthenticatedUser } from "@/lib/firebase-session";
import { errorResponse, successResponse } from "@/lib/action-utils";
import type { ActionResponse, CreateDocumentResponse } from "@/types";

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
    const user = await requireAuthenticatedUser();

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
        .doc(user.uid)
        .collection(COLLECTIONS.ROOMS)
        .doc(docRef.id);

      transaction.set(roomRef, {
        userId: user.uid,
        userEmail: user.email ?? undefined,
        role: "owner",
        createdAt: new Date(),
        roomId: docRef.id,
      });

      return docRef.id;
    });

    return successResponse({ docId });
  } catch (error) {
    console.error("[createNewDocument] Error:", error);
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return errorResponse<CreateDocumentResponse>(
        "UNAUTHORIZED",
        "Please sign in to create a document."
      );
    }
    return errorResponse<CreateDocumentResponse>(
      "INTERNAL_ERROR",
      "Failed to create document. Please try again."
    );
  }
}

/**
 * Delete all room entries for a document
 * Handles the race condition where collectionGroup queries don't participate
 * in transaction isolation by using a loop to ensure all entries are deleted
 */
async function deleteAllRoomEntries(roomId: string): Promise<void> {
  const BATCH_SIZE = 500;
  let hasMoreRooms = true;

  while (hasMoreRooms) {
    const roomsQuery = await adminDb
      .collectionGroup(COLLECTIONS.ROOMS)
      .where("roomId", "==", roomId)
      .limit(BATCH_SIZE)
      .get();

    if (roomsQuery.empty) {
      hasMoreRooms = false;
    } else {
      const batch = adminDb.batch();
      roomsQuery.docs.forEach((doc) => batch.delete(doc.ref));
      await batch.commit();
    }
  }
}

/**
 * Delete a Liveblocks room with retry logic
 * Retries up to 3 times with exponential backoff
 */
async function deleteLiveblocksRoomWithRetry(
  roomId: string,
  maxRetries = 3
): Promise<void> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await liveblocks.deleteRoom(roomId);
      return; // Success
    } catch (error) {
      lastError = error;

      // Don't retry if room doesn't exist (404)
      if (error instanceof Error && error.message.includes("404")) {
        return;
      }

      // Exponential backoff: 100ms, 200ms, 400ms
      if (attempt < maxRetries) {
        await new Promise((resolve) =>
          setTimeout(resolve, 100 * Math.pow(2, attempt - 1))
        );
      }
    }
  }

  // Log after all retries exhausted
  console.warn(
    `[deleteDocument] Liveblocks room deletion failed after ${maxRetries} attempts:`,
    lastError
  );
}

/**
 * Delete a document and all associated room entries
 * Only the owner can delete a document
 * Uses transaction for ownership verification, then cleans up room entries
 */
export async function deleteDocument(
  roomId: string
): Promise<ActionResponse<void>> {
  try {
    const user = await requireAuthenticatedUser();

    // Use transaction to verify ownership and delete the document atomically
    await adminDb.runTransaction(async (transaction) => {
      // Check ownership within the transaction
      const ownerRoomRef = adminDb
        .collection(COLLECTIONS.USERS)
        .doc(user.uid)
        .collection(COLLECTIONS.ROOMS)
        .doc(roomId);

      const ownerRoomDoc = await transaction.get(ownerRoomRef);

      if (!ownerRoomDoc.exists || ownerRoomDoc.data()?.role !== "owner") {
        throw new Error("FORBIDDEN");
      }

      // Get the document to ensure it exists
      const docRef = adminDb.collection(COLLECTIONS.DOCUMENTS).doc(roomId);
      const docSnapshot = await transaction.get(docRef);

      if (!docSnapshot.exists) {
        throw new Error("NOT_FOUND");
      }

      // Delete the document within the transaction
      transaction.delete(docRef);
    });

    // Clean up all room entries after document is deleted
    // This runs outside the transaction because collectionGroup queries
    // don't participate in transaction isolation. We use a loop to ensure
    // all entries (including any added during the race window) are deleted.
    await deleteAllRoomEntries(roomId);

    // Delete the Liveblocks room with retry logic
    await deleteLiveblocksRoomWithRetry(roomId);

    return successResponse();
  } catch (error) {
    console.error("[deleteDocument] Error:", error);

    // Handle specific error types
    if (error instanceof Error) {
      if (error.message === "UNAUTHORIZED") {
        return errorResponse("UNAUTHORIZED", "Please sign in to continue.");
      }
      if (error.message === "FORBIDDEN") {
        return errorResponse(
          "FORBIDDEN",
          "Only the document owner can delete this document."
        );
      }
      if (error.message === "NOT_FOUND") {
        return errorResponse("NOT_FOUND", "Document not found.");
      }
    }

    return errorResponse(
      "INTERNAL_ERROR",
      "Failed to delete document. Please try again."
    );
  }
}

/**
 * Invite a user to collaborate on a document
 * Only the owner can invite users
 * Uses transaction to prevent race conditions with duplicate invites
 */
export async function inviteUserToDocument(
  roomId: string,
  email: string
): Promise<ActionResponse<void>> {
  try {
    const currentUser = await requireAuthenticatedUser();
    const currentUserEmail = (currentUser.email ?? "").toLowerCase();

    // Validate email
    if (!email || !email.includes("@")) {
      return errorResponse("VALIDATION_ERROR", "Please provide a valid email.");
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // Resolve invitee Firebase uid from email (invitee must already exist in Firebase Auth)
    const invitee = await adminAuth
      .getUserByEmail(normalizedEmail)
      .catch(() => null);
    if (!invitee) {
      return errorResponse(
        "NOT_FOUND",
        "No Firebase user found with that email address."
      );
    }

    // Prevent self-invite (uid-based)
    if (invitee.uid === currentUser.uid || normalizedEmail === currentUserEmail) {
      return errorResponse("VALIDATION_ERROR", "You cannot invite yourself.");
    }

    // Use transaction to prevent race conditions
    await adminDb.runTransaction(async (transaction) => {
      // Check if current user is the owner
      const ownerRoomRef = adminDb
        .collection(COLLECTIONS.USERS)
        .doc(currentUser.uid)
        .collection(COLLECTIONS.ROOMS)
        .doc(roomId);

      const ownerRoomDoc = await transaction.get(ownerRoomRef);

      if (!ownerRoomDoc.exists || ownerRoomDoc.data()?.role !== "owner") {
        throw new Error("FORBIDDEN");
      }

      // Check if user already has access (within the transaction)
      const inviteeRoomRef = adminDb
        .collection(COLLECTIONS.USERS)
        .doc(invitee.uid)
        .collection(COLLECTIONS.ROOMS)
        .doc(roomId);

      const existingEntry = await transaction.get(inviteeRoomRef);

      if (existingEntry.exists) {
        throw new Error("ALREADY_EXISTS");
      }

      // Create room entry for the invited user
      transaction.set(inviteeRoomRef, {
        userId: invitee.uid,
        userEmail: normalizedEmail,
        role: "editor",
        createdAt: new Date(),
        roomId,
      });
    });

    return successResponse();
  } catch (error) {
    console.error("[inviteUserToDocument] Error:", error);

    // Handle specific error types
    if (error instanceof Error) {
      if (error.message === "UNAUTHORIZED") {
        return errorResponse("UNAUTHORIZED", "Please sign in to continue.");
      }
      if (error.message === "FORBIDDEN") {
        return errorResponse(
          "FORBIDDEN",
          "Only the document owner can invite users."
        );
      }
      if (error.message === "ALREADY_EXISTS") {
        return errorResponse(
          "VALIDATION_ERROR",
          "User already has access to this document."
        );
      }
    }

    return errorResponse(
      "INTERNAL_ERROR",
      "Failed to invite user. Please try again."
    );
  }
}

/**
 * Remove a user's access to a document
 * Only the owner can remove users, and owner cannot remove themselves
 * Uses transaction to verify user exists before removal
 */
export async function removeUserFromDocument(
  roomId: string,
  userIdToRemove: string
): Promise<ActionResponse<void>> {
  try {
    const currentUser = await requireAuthenticatedUser();

    // Prevent owner from removing themselves
    if (userIdToRemove === currentUser.uid) {
      return errorResponse(
        "VALIDATION_ERROR",
        "You cannot remove yourself. Delete the document instead."
      );
    }

    // Use transaction to ensure atomicity
    await adminDb.runTransaction(async (transaction) => {
      // Check if current user is the owner
      const ownerRoomRef = adminDb
        .collection(COLLECTIONS.USERS)
        .doc(currentUser.uid)
        .collection(COLLECTIONS.ROOMS)
        .doc(roomId);

      const ownerRoomDoc = await transaction.get(ownerRoomRef);

      if (!ownerRoomDoc.exists || ownerRoomDoc.data()?.role !== "owner") {
        throw new Error("FORBIDDEN");
      }

      // Check if the user to remove actually has access
      const userRoomRef = adminDb
        .collection(COLLECTIONS.USERS)
        .doc(userIdToRemove)
        .collection(COLLECTIONS.ROOMS)
        .doc(roomId);

      const userRoomDoc = await transaction.get(userRoomRef);

      if (!userRoomDoc.exists) {
        throw new Error("NOT_FOUND");
      }

      // Delete the room entry
      transaction.delete(userRoomRef);
    });

    return successResponse();
  } catch (error) {
    console.error("[removeUserFromDocument] Error:", error);

    // Handle specific error types
    if (error instanceof Error) {
      if (error.message === "UNAUTHORIZED") {
        return errorResponse("UNAUTHORIZED", "Please sign in to continue.");
      }
      if (error.message === "FORBIDDEN") {
        return errorResponse(
          "FORBIDDEN",
          "Only the document owner can remove users."
        );
      }
      if (error.message === "NOT_FOUND") {
        return errorResponse(
          "NOT_FOUND",
          "User does not have access to this document."
        );
      }
    }

    return errorResponse(
      "INTERNAL_ERROR",
      "Failed to remove user. Please try again."
    );
  }
}
