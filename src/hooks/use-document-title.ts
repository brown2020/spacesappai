"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { doc } from "firebase/firestore";
import { useDocumentData } from "react-firebase-hooks/firestore";
import { db, COLLECTIONS } from "@/firebase/firebaseConfig";
import { updateDocumentTitle } from "@/lib/documentActions";
import { useIsMounted } from "./use-is-mounted";

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
  const docRef = useMemo(
    () => doc(db, COLLECTIONS.DOCUMENTS, documentId),
    [documentId]
  );
  const [data, isLoading, error] = useDocumentData(docRef);
  const [title, setTitle] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // Track if user has modified the input (prevents overwriting user input)
  const hasUserEditedRef = useRef(false);
  // Track initial load to set title only once
  const hasInitializedRef = useRef(false);
  // Track if an update is in flight (prevents race conditions)
  const updateInFlightRef = useRef(false);
  // Track timeout for cleanup to prevent memory leaks
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  // Track if component is mounted to prevent state updates after unmount
  const isMountedRef = useIsMounted();
  // Track current title value to avoid stale closures in updateTitle callback
  const titleRef = useRef(title);

  // Sync title with Firestore data only on initial load
  // or when the remote title changes AND user hasn't edited
  useEffect(() => {
    if (data?.title) {
      // Only set title on first load OR if user hasn't made local changes
      // AND no update is currently in flight
      if (!hasInitializedRef.current) {
        setTitle(data.title);
        hasInitializedRef.current = true;
      } else if (!hasUserEditedRef.current && !updateInFlightRef.current) {
        // Remote update came in and user hasn't edited locally
        setTitle(data.title);
      }
    }
  }, [data?.title]);

  // Reset refs when document changes and cleanup timeout
  useEffect(() => {
    hasInitializedRef.current = false;
    hasUserEditedRef.current = false;
    updateInFlightRef.current = false;

    // Cleanup timeout on document change or unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [documentId]);

  // Keep titleRef in sync with title state
  useEffect(() => {
    titleRef.current = title;
  }, [title]);

  // Wrapper for setTitle that tracks user edits
  const handleSetTitle = useCallback((newTitle: string) => {
    hasUserEditedRef.current = true;
    setTitle(newTitle);
  }, []);

  // Use a ref to avoid recreating the callback when isUpdating toggles
  const isUpdatingRef = useRef(false);

  const updateTitle = useCallback(async () => {
    // Use ref to get current title value (avoids stale closure)
    const trimmedTitle = titleRef.current.trim();
    if (!trimmedTitle || isUpdatingRef.current) return;

    setIsUpdating(true);
    isUpdatingRef.current = true;
    updateInFlightRef.current = true;

    try {
      const result = await updateDocumentTitle(documentId, trimmedTitle);
      if (!result.success) {
        throw new Error(result.error.message);
      }
      // After successful update, allow remote updates again
      hasUserEditedRef.current = false;
    } catch (err) {
      // Re-throw so caller can handle if needed
      throw err;
    } finally {
      // Only update state if still mounted (isMountedRef is stable, not in deps)
      if (isMountedRef.current) {
        setIsUpdating(false);
      }
      isUpdatingRef.current = false;
      // Clear any existing timeout before setting a new one
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      // Delay resetting the in-flight flag to allow Firestore real-time
      // listener to catch up with our update, preventing stale data flash
      timeoutRef.current = setTimeout(() => {
        updateInFlightRef.current = false;
        timeoutRef.current = null;
      }, 500);
    }
  }, [documentId]);

  return {
    title,
    setTitle: handleSetTitle,
    updateTitle,
    isUpdating,
    isLoading,
    error,
  };
}
