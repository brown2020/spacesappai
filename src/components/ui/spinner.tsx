import { cn } from "@/lib/utils";

// ============================================================================
// TYPES
// ============================================================================

interface SpinnerProps {
  /** Size of the spinner in pixels */
  size?: number;
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * A simple CSS-based loading spinner
 * Replaces react-spinners for lighter bundle size
 */
export function Spinner({ size = 40, className }: SpinnerProps) {
  return (
    <div
      className={cn(
        "animate-spin rounded-full border-4 border-purple-200 border-t-purple-600",
        className
      )}
      style={{ width: size, height: size }}
      role="status"
      aria-label="Loading"
    />
  );
}

/**
 * Spinner with accompanying text
 */
export function SpinnerWithText({
  size = 40,
  text = "Loading...",
  className,
}: SpinnerProps & { text?: string }) {
  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      <Spinner size={size} />
      <p className="text-sm text-gray-500">{text}</p>
    </div>
  );
}
