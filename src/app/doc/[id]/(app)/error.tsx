"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

// ============================================================================
// TYPES
// ============================================================================

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

// ============================================================================
// ERROR PAGE
// ============================================================================

/**
 * Error boundary for document pages
 * Catches errors during document loading/rendering
 */
export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("[Document Error]", error);
  }, [error]);

  const isNetworkError =
    error.message.toLowerCase().includes("network") ||
    error.message.toLowerCase().includes("fetch") ||
    error.message.toLowerCase().includes("failed to load");

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-background">
      <div className="text-center max-w-md">
        <div className="mb-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-destructive"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Unable to load document
          </h1>
          <p className="text-muted-foreground">
            {isNetworkError
              ? "Please check your internet connection and try again."
              : "There was a problem loading this document. Please try again or contact support if the issue persists."}
          </p>
        </div>

        <div className="flex gap-3 justify-center">
          <Button onClick={reset} variant="default">
            Try Again
          </Button>
          <Button
            onClick={() => (window.location.href = "/")}
            variant="outline"
          >
            Go Home
          </Button>
        </div>
      </div>
    </div>
  );
}

