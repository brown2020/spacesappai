"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { getComments } from "@/lib/documentActions";
import type { Comment } from "@/types";

interface UseCommentsReturn {
  comments: Comment[];
  isLoading: boolean;
  error: string | undefined;
  count: number;
  refresh: () => void;
}

const POLL_INTERVAL_MS = 10_000;

/**
 * Hook for fetching comments via server action (Admin SDK).
 * Polls every 10 seconds for near-real-time updates.
 * Call `refresh()` after adding/deleting a comment for instant update.
 */
export function useComments(documentId: string): UseCommentsReturn {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mountedRef = useRef(true);

  const fetchComments = useCallback(async () => {
    try {
      const result = await getComments(documentId);
      if (!mountedRef.current) return;

      if (result.success) {
        setComments(result.data);
        setError(undefined);
      } else {
        setError(result.error.message);
      }
    } catch {
      if (mountedRef.current) {
        setError("Failed to load comments.");
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [documentId]);

  // Initial fetch + polling
  useEffect(() => {
    mountedRef.current = true;
    setIsLoading(true);
    fetchComments();

    intervalRef.current = setInterval(fetchComments, POLL_INTERVAL_MS);

    return () => {
      mountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchComments]);

  // Manual refresh (called after add/delete)
  const refresh = useCallback(() => {
    fetchComments();
  }, [fetchComments]);

  return {
    comments,
    isLoading,
    error,
    count: comments.length,
    refresh,
  };
}
