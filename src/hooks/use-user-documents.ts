"use client";

import { useMemo } from "react";
import { collectionGroup, query, where } from "firebase/firestore";
import { useCollection } from "react-firebase-hooks/firestore";
import { useUser } from "@clerk/nextjs";
import { db } from "@/firebase/firebaseConfig";
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
  const { user } = useUser();
  const userEmail = user?.emailAddresses[0]?.toString();

  const [snapshot, isLoading, error] = useCollection(
    userEmail
      ? query(collectionGroup(db, "rooms"), where("userId", "==", userEmail))
      : null
  );

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


