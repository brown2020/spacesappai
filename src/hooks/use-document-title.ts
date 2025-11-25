"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { useDocumentData } from "react-firebase-hooks/firestore";
import { db, COLLECTIONS } from "@/firebase/firebaseConfig";

interface UseDocumentTitleReturn {
  title: string;
  setTitle: (title: string) => void;
  updateTitle: () => Promise<void>;
  isUpdating: boolean;
  isLoading: boolean;
  error: Error | undefined;
}

/**
 * Hook for managing document title with optimistic updates
 */
export function useDocumentTitle(documentId: string): UseDocumentTitleReturn {
  const [data, isLoading, error] = useDocumentData(
    doc(db, COLLECTIONS.DOCUMENTS, documentId)
  );
  const [title, setTitle] = useState("");
  const [isUpdating, startTransition] = useTransition();

  // Sync title with Firestore data
  useEffect(() => {
    if (data?.title) {
      setTitle(data.title);
    }
  }, [data?.title]);

  const updateTitle = useCallback(async () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;

    startTransition(async () => {
      await updateDoc(doc(db, COLLECTIONS.DOCUMENTS, documentId), {
        title: trimmedTitle,
      });
    });
  }, [documentId, title]);

  return {
    title,
    setTitle,
    updateTitle,
    isUpdating,
    isLoading,
    error,
  };
}
