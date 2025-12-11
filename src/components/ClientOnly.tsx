"use client";

import { useState, useEffect, type ReactNode } from "react";

// ============================================================================
// TYPES
// ============================================================================

interface ClientOnlyProps {
  /** Content to render only on the client */
  children: ReactNode;
  /** Optional fallback to show during SSR/hydration */
  fallback?: ReactNode;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * Wrapper component that only renders children on the client side
 * Useful for preventing hydration mismatches with components that:
 * - Generate different IDs on server vs client (Radix UI)
 * - Depend on browser APIs
 * - Use random values
 *
 * @example
 * ```tsx
 * <ClientOnly fallback={<Skeleton />}>
 *   <ComponentWithHydrationIssues />
 * </ClientOnly>
 * ```
 */
export default function ClientOnly({
  children,
  fallback = null,
}: ClientOnlyProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
