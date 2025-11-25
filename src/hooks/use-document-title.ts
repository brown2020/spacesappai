"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
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
 * Prevents race condition where remote data overwrites user input
 */
export function useDocumentTitle(documentId: string): UseDocumentTitleReturn {
  const [data, isLoading, error] = useDocumentData(
    doc(db, COLLECTIONS.DOCUMENTS, documentId)
  );
  const [title, setTitle] = useState("");
  const [isUpdating, startTransition] = useTransition();

  // Track if user has modified the input (prevents overwriting user input)
  const hasUserEditedRef = useRef(false);
  // Track initial load to set title only once
  const hasInitializedRef = useRef(false);

  // Sync title with Firestore data only on initial load
  // or when the remote title changes AND user hasn't edited
  useEffect(() => {
    if (data?.title) {
      // Only set title on first load OR if user hasn't made local changes
      if (!hasInitializedRef.current) {
        setTitle(data.title);
        hasInitializedRef.current = true;
      } else if (!hasUserEditedRef.current) {
        // Remote update came in and user hasn't edited locally
        setTitle(data.title);
      }
    }
  }, [data?.title]);

  // Reset refs when document changes
  useEffect(() => {
    hasInitializedRef.current = false;
    hasUserEditedRef.current = false;
  }, [documentId]);

  // Wrapper for setTitle that tracks user edits
  const handleSetTitle = useCallback((newTitle: string) => {
    hasUserEditedRef.current = true;
    setTitle(newTitle);
  }, []);

  const updateTitle = useCallback(async () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;

    startTransition(async () => {
      await updateDoc(doc(db, COLLECTIONS.DOCUMENTS, documentId), {
        title: trimmedTitle,
        updatedAt: new Date(),
      });
      // After successful update, allow remote updates again
      hasUserEditedRef.current = false;
    });
  }, [documentId, title]);

  return {
    title,
    setTitle: handleSetTitle,
    updateTitle,
    isUpdating,
    isLoading,
    error,
  };
}
