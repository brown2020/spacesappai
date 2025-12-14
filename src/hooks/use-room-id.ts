"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { getRoomIdFromPath } from "@/lib/utils";

/**
 * Hook to get the current room/document ID from the URL path
 * Replaces repeated getRoomIdFromPath(usePathname()) pattern
 *
 * @returns The room ID or null if not on a document page
 *
 * @example
 * ```tsx
 * const roomId = useRoomId();
 *
 * if (!roomId) {
 *   return <div>Not on a document page</div>;
 * }
 *
 * // Use roomId for operations...
 * ```
 */
export function useRoomId(): string | null {
  const pathname = usePathname();

  return useMemo(() => getRoomIdFromPath(pathname), [pathname]);
}

