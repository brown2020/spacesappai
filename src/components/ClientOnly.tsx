"use client";

import { useSyncExternalStore, type ReactNode } from "react";

// ============================================================================
// TYPES
// ============================================================================

interface ClientOnlyProps {
  /** Content to render only on the client */
  children: ReactNode;
  /** Optional fallback to show during SSR/hydration */
  fallback?: ReactNode;
}

function subscribe() {
  return () => {};
}

function getClientSnapshot() {
  return true;
}

function getServerSnapshot() {
  return false;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * Wrapper component that only renders children on the client side.
 * Uses useSyncExternalStore to avoid hydration flicker from mount effects.
 */
export default function ClientOnly({
  children,
  fallback = null,
}: ClientOnlyProps) {
  const isMounted = useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot
  );

  if (!isMounted) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
