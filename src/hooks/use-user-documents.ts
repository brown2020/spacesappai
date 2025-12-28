"use client";

import { useMemo } from "react";
import { collection, query } from "firebase/firestore";
import { useCollection } from "react-firebase-hooks/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { COLLECTIONS, db, auth as firebaseAuth } from "@/firebase/firebaseConfig";
import type { GroupedRoomDocuments, RoomDocument } from "@/types";

interface UseUserDocumentsReturn {
  documents: GroupedRoomDocuments;
  isLoading: boolean;
  error: Error | undefined;
  isEmpty: boolean;
}

/**
 * Hook for fetching all documents the current user has access to
 * Groups documents by role (owner vs editor)
 */
export function useUserDocuments(): UseUserDocumentsReturn {
  const [user] = useAuthState(firebaseAuth);
  const currentUserId = user?.uid;

  const roomsQuery = useMemo(() => {
    if (!currentUserId) return null;
    // Read only the current user's rooms (no collectionGroup needed).
    const roomsRef = collection(db, COLLECTIONS.USERS, currentUserId, COLLECTIONS.ROOMS);
    return query(roomsRef);
  }, [currentUserId]);

  const [snapshot, isLoading, error] = useCollection(roomsQuery);

  const documents = useMemo<GroupedRoomDocuments>(() => {
    if (!snapshot?.docs) {
      return { owner: [], editor: [] };
    }

    return snapshot.docs.reduce<GroupedRoomDocuments>(
      (acc, doc) => {
        const roomData = {
          id: doc.id,
          ...doc.data(),
        } as RoomDocument;

        if (roomData.role === "owner") {
          acc.owner.push(roomData);
        } else {
          acc.editor.push(roomData);
        }

        return acc;
      },
      { owner: [], editor: [] }
    );
  }, [snapshot]);

  const isEmpty = documents.owner.length === 0 && documents.editor.length === 0;

  return {
    documents,
    isLoading,
    error,
    isEmpty,
  };
}


