"use client";

import { useRef, useInsertionEffect } from "react";

/**
 * Hook to keep a ref that always has the latest value
 * Useful for accessing values in callbacks without causing re-renders
 * or recreating effects
 *
 * @param value - The value to keep latest
 * @returns A ref that always contains the latest value
 *
 * @example
 * ```tsx
 * const onReadyRef = useLatest(onReady);
 *
 * useEffect(() => {
 *   // onReadyRef.current will always be the latest callback
 *   // without needing onReady in the dependency array
 *   someAsyncOperation().then(() => {
 *     onReadyRef.current?.();
 *   });
 * }, []);
 * ```
 */
export function useLatest<T>(value: T) {
  const ref = useRef(value);
  
  // Use useInsertionEffect to update the ref synchronously before effects run
  // This ensures the ref is always current when accessed in callbacks/effects
  useInsertionEffect(() => {
    ref.current = value;
  });
  
  return ref;
}

