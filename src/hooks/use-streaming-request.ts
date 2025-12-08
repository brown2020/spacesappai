"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { readStreamableValue } from "@ai-sdk/rsc";
import type { ActionResponse } from "@/types";

// ============================================================================
// TYPES
// ============================================================================

interface UseStreamingRequestOptions {
  /** Toast message on success */
  successMessage?: string;
  /** Toast message on error */
  errorMessage?: string;
}

/**
 * The action can return either a StreamableValue or an ActionResponse (for errors)
 * We use `unknown` here because the exact StreamableValue type varies based on usage
 */
type StreamingActionResult = unknown | ActionResponse;

interface UseStreamingRequestReturn {
  /** Whether a request is in progress */
  isPending: boolean;
  /** The current result/answer */
  result: string;
  /** Reset the result state */
  reset: () => void;
  /** Execute a streaming request */
  execute: (action: () => Promise<StreamingActionResult>) => Promise<void>;
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * Hook for handling streaming AI requests with proper cleanup and cancellation
 *
 * Handles:
 * - Request cancellation on unmount
 * - Request ID tracking to prevent stale updates
 * - Mounted state checking
 * - Error responses from server actions
 * - Streaming value consumption
 *
 * @example
 * ```tsx
 * const { isPending, result, execute, reset } = useStreamingRequest({
 *   successMessage: "Translation complete",
 *   errorMessage: "Failed to translate"
 * });
 *
 * const handleSubmit = () => {
 *   execute(() => generateSummary(doc, language, model));
 * };
 * ```
 */
export function useStreamingRequest(
  options: UseStreamingRequestOptions = {}
): UseStreamingRequestReturn {
  const { successMessage, errorMessage = "Request failed. Please try again." } =
    options;

  const [isPending, setIsPending] = useState(false);
  const [result, setResult] = useState("");

  // Track if component is still mounted
  const isMountedRef = useRef(true);
  // Track current request ID to allow cancellation of outdated requests
  const currentRequestIdRef = useRef(0);
  // AbortController for cancelling in-flight requests
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      // Abort any in-flight request on unmount
      abortControllerRef.current?.abort();
    };
  }, []);

  const reset = useCallback(() => {
    // Abort any in-flight request
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    // Invalidate any pending request
    currentRequestIdRef.current++;
    // Reset state
    setResult("");
    setIsPending(false);
  }, []);

  const execute = useCallback(
    async (action: () => Promise<StreamingActionResult>) => {
      // Abort any previous request
      abortControllerRef.current?.abort();

      // Create new AbortController for this request
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      // Increment request ID to invalidate any pending requests
      const requestId = ++currentRequestIdRef.current;

      setIsPending(true);
      setResult("");

      try {
        const response = await action();

        // Check if result is an error response (ActionResponse has 'success' property)
        if (response && typeof response === "object" && "success" in response) {
          const errorResponse = response as ActionResponse;
          if (!errorResponse.success) {
            toast.error(errorResponse.error?.message || errorMessage);
            return;
          }
        }

        // At this point, response is a StreamableValue - cast to expected type
        for await (const content of readStreamableValue(
          response as Parameters<typeof readStreamableValue>[0]
        )) {
          // Check if this request is still current, component is mounted, and not aborted
          if (
            !isMountedRef.current ||
            requestId !== currentRequestIdRef.current ||
            abortController.signal.aborted
          ) {
            break;
          }

          if (content && typeof content === "string") {
            setResult(content.trim());
          }
        }

        // Only show success toast if still mounted, request is current, and not aborted
        if (
          isMountedRef.current &&
          requestId === currentRequestIdRef.current &&
          !abortController.signal.aborted &&
          successMessage
        ) {
          toast.success(successMessage);
        }
      } catch (error) {
        // Don't log or show error for aborted requests
        if (abortController.signal.aborted) {
          return;
        }

        console.error("[useStreamingRequest] Error:", error);
        if (isMountedRef.current && requestId === currentRequestIdRef.current) {
          toast.error(errorMessage);
        }
      } finally {
        if (
          isMountedRef.current &&
          requestId === currentRequestIdRef.current &&
          !abortController.signal.aborted
        ) {
          setIsPending(false);
        }
      }
    },
    [successMessage, errorMessage]
  );

  return { isPending, result, reset, execute };
}

