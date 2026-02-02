"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import { doc } from "firebase/firestore";
import { useDocumentData } from "react-firebase-hooks/firestore";
import { db, COLLECTIONS } from "@/firebase/firebaseConfig";
import { updateDocumentIcon } from "@/lib/documentActions";

interface UseDocumentIconReturn {
  icon: string | null;
  updateIcon: (icon: string | null) => Promise<void>;
  isUpdating: boolean;
  isLoading: boolean;
}

/**
 * Hook for managing document icon (emoji)
 * Uses optimistic updates for instant feedback
 */
export function useDocumentIcon(documentId: string): UseDocumentIconReturn {
  const docRef = useMemo(
    () => doc(db, COLLECTIONS.DOCUMENTS, documentId),
    [documentId]
  );
  const [data, isLoading] = useDocumentData(docRef);
  const [optimisticIcon, setOptimisticIcon] = useState<string | null | undefined>(undefined);
  const [isPending, startTransition] = useTransition();

  // Use optimistic value if set, otherwise use Firestore data
  const icon = optimisticIcon !== undefined ? optimisticIcon : (data?.icon ?? null);

  const updateIcon = useCallback(
    async (newIcon: string | null) => {
      // Optimistic update for instant feedback
      setOptimisticIcon(newIcon);

      startTransition(async () => {
        const result = await updateDocumentIcon(documentId, newIcon);

        if (!result.success) {
          // Revert optimistic update on failure
          setOptimisticIcon(undefined);
          console.error("[useDocumentIcon] Failed to update icon:", result.error);
        } else {
          // Clear optimistic state so Firestore data takes over
          // (small delay to let Firestore listener catch up)
          setTimeout(() => setOptimisticIcon(undefined), 300);
        }
      });
    },
    [documentId]
  );

  return {
    icon,
    updateIcon,
    isUpdating: isPending,
    isLoading,
  };
}
