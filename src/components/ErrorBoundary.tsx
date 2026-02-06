"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button } from "./ui/button";

// ============================================================================
// TYPES
// ============================================================================

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  /** Render prop for fallback that receives error and retry function */
  fallbackRender?: (props: {
    error: Error | null;
    onRetry: () => void;
  }) => ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  retryCount: number;
}

// ============================================================================
// DEFAULT FALLBACK
// ============================================================================

interface DefaultFallbackProps {
  error: Error | null;
  onRetry: () => void;
}

function DefaultFallback({ error, onRetry }: DefaultFallbackProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] p-6 bg-destructive/10 rounded-lg border border-destructive/20">
      <div className="text-center max-w-md">
        <h2 className="text-lg font-semibold text-foreground mb-2">
          Something went wrong
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          {error?.message || "An unexpected error occurred"}
        </p>
        <Button onClick={onRetry} variant="outline" size="sm">
          Try Again
        </Button>
      </div>
    </div>
  );
}

// ============================================================================
// ERROR BOUNDARY COMPONENT
// ============================================================================

/**
 * Error boundary component to catch and handle errors in child components.
 * Prevents the entire app from crashing when a component fails.
 *
 * @example
 * ```tsx
 * // With static fallback
 * <ErrorBoundary fallback={<p>Something went wrong</p>}>
 *   <MyComponent />
 * </ErrorBoundary>
 *
 * // With fallback render prop (allows retry)
 * <ErrorBoundary fallbackRender={({ error, onRetry }) => (
 *   <div>
 *     <p>Error: {error?.message}</p>
 *     <button onClick={onRetry}>Retry</button>
 *   </div>
 * )}>
 *   <MyComponent />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, retryCount: 0 };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to console in development
    console.error("[ErrorBoundary] Caught error:", error, errorInfo);

    // Call optional error handler
    this.props.onError?.(error, errorInfo);
  }

  private static readonly MAX_RETRIES = 3;

  handleRetry = (): void => {
    if (this.state.retryCount >= ErrorBoundary.MAX_RETRIES) {
      return;
    }
    this.setState((prev) => ({
      hasError: false,
      error: null,
      retryCount: prev.retryCount + 1,
    }));
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Render with fallbackRender prop if provided (allows retry)
      if (this.props.fallbackRender) {
        return this.props.fallbackRender({
          error: this.state.error,
          onRetry: this.handleRetry,
        });
      }

      // Render static fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Render default fallback with retry (disable retry after max attempts)
      return (
        <DefaultFallback
          error={this.state.error}
          onRetry={this.state.retryCount < ErrorBoundary.MAX_RETRIES ? this.handleRetry : () => {}}
        />
      );
    }

    // Use key to force remount of children on retry
    return (
      <div key={this.state.retryCount}>
        {this.props.children}
      </div>
    );
  }
}

// ============================================================================
// DOCUMENT ERROR BOUNDARY
// ============================================================================

interface DocumentFallbackProps {
  error: Error | null;
  onRetry: () => void;
}

function DocumentFallback({ error, onRetry }: DocumentFallbackProps) {
  const isNetworkError =
    error?.message.toLowerCase().includes("network") ||
    error?.message.toLowerCase().includes("fetch");

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8 bg-muted rounded-lg">
      <div className="text-center max-w-md">
        <h2 className="text-xl font-semibold text-foreground mb-2">
          Unable to load document
        </h2>
        <p className="text-muted-foreground mb-4">
          {isNetworkError
            ? "Please check your internet connection and try again."
            : "There was a problem loading this document. Please try again or contact support if the issue persists."}
        </p>
        <div className="flex gap-3 justify-center">
          <Button onClick={onRetry} variant="default">
            Try Again
          </Button>
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
          >
            Refresh Page
          </Button>
        </div>
      </div>
    </div>
  );
}

/**
 * Specialized error boundary for document/editor sections
 * with contextual messaging and recovery options
 */
export function DocumentErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      fallbackRender={({ error, onRetry }) => (
        <DocumentFallback error={error} onRetry={onRetry} />
      )}
    >
      {children}
    </ErrorBoundary>
  );
}

export default ErrorBoundary;

