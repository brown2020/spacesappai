"use client";

import { useEffect, useRef } from "react";

/**
 * Hook to track if a component is mounted
 * Useful for preventing state updates after unmount in async operations
 *
 * @returns A ref that is true when mounted, false when unmounted
 *
 * @example
 * ```tsx
 * const isMountedRef = useIsMounted();
 *
 * const handleAsync = async () => {
 *   const result = await fetchData();
 *   if (isMountedRef.current) {
 *     setState(result);
 *   }
 * };
 * ```
 */
export function useIsMounted() {
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return isMountedRef;
}


