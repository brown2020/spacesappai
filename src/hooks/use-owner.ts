"use client";

import { useMemo } from "react";
import { useRoom } from "@liveblocks/react/suspense";
import { useRoomUsers } from "./use-room-users";

interface UseOwnerReturn {
  /** Whether the current user is the owner. Note: returns false while loading */
  isOwner: boolean;
  /** Whether the user data is still loading */
  isLoading: boolean;
  /** 
   * Whether the ownership check is ready (not loading).
   * Use this to conditionally render owner-only UI to avoid flash of content.
   */
  isReady: boolean;
}

/**
 * Hook to check if the current user is the owner of the current room
 * 
 * @example
 * ```tsx
 * const { isOwner, isLoading, isReady } = useOwner();
 * 
 * // Wait for ownership check to complete before showing owner-only UI
 * if (!isReady) return <Skeleton />;
 * if (isOwner) return <OwnerControls />;
 * ```
 */
export function useOwner(): UseOwnerReturn {
  const room = useRoom();
  const { users, isLoading, currentUserEmail } = useRoomUsers(room.id);

  const isOwner = useMemo(() => {
    // Return false during loading - consumers should check isLoading/isReady
    if (isLoading || !currentUserEmail || users.length === 0) return false;

    return users.some(
      (user) => user.role === "owner" && user.userId === currentUserEmail
    );
  }, [users, currentUserEmail, isLoading]);

  return { 
    isOwner, 
    isLoading,
    isReady: !isLoading && !!currentUserEmail,
  };
}

// Default export for backwards compatibility
export default function useOwnerLegacy(): boolean {
  const { isOwner } = useOwner();
  return isOwner;
}



