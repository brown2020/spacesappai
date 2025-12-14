import { SpinnerWithText } from "@/components/ui/spinner";

// ============================================================================
// LOADING STATE
// ============================================================================

/**
 * Loading state for document pages
 * Shown while the document is being fetched
 */
export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <SpinnerWithText size={48} text="Loading document..." />
    </div>
  );
}

