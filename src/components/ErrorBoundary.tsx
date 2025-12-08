"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button } from "./ui/button";

// ============================================================================
// TYPES
// ============================================================================

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
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
    <div className="flex flex-col items-center justify-center min-h-[200px] p-6 bg-red-50 rounded-lg border border-red-200">
      <div className="text-center max-w-md">
        <h2 className="text-lg font-semibold text-red-800 mb-2">
          Something went wrong
        </h2>
        <p className="text-sm text-red-600 mb-4">
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
 * <ErrorBoundary fallback={<p>Something went wrong</p>}>
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
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to console in development
    console.error("[ErrorBoundary] Caught error:", error, errorInfo);

    // Call optional error handler
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Render custom fallback or default
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <DefaultFallback
          error={this.state.error}
          onRetry={this.handleRetry}
        />
      );
    }

    return this.props.children;
  }
}

// ============================================================================
// DOCUMENT ERROR BOUNDARY
// ============================================================================

/**
 * Specialized error boundary for document/editor sections
 * with contextual messaging and recovery options
 */
export function DocumentErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8 bg-gray-50 rounded-lg">
          <div className="text-center max-w-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Unable to load document
            </h2>
            <p className="text-gray-600 mb-4">
              There was a problem loading this document. Please try refreshing
              the page or contact support if the issue persists.
            </p>
            <Button
              onClick={() => window.location.reload()}
              variant="default"
            >
              Refresh Page
            </Button>
          </div>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}

export default ErrorBoundary;

