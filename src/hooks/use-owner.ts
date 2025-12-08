"use client";

import { useMemo } from "react";
import { useRoom } from "@liveblocks/react/suspense";
import { useRoomUsers } from "./use-room-users";

interface UseOwnerReturn {
  isOwner: boolean;
  isLoading: boolean;
}

/**
 * Hook to check if the current user is the owner of the current room
 */
export function useOwner(): UseOwnerReturn {
  const room = useRoom();
  const { users, isLoading, currentUserEmail } = useRoomUsers(room.id);

  const isOwner = useMemo(() => {
    if (!currentUserEmail || users.length === 0) return false;

    return users.some(
      (user) => user.role === "owner" && user.userId === currentUserEmail
    );
  }, [users, currentUserEmail]);

  return { isOwner, isLoading };
}

// Default export for backwards compatibility
export default function useOwnerLegacy(): boolean {
  const { isOwner } = useOwner();
  return isOwner;
}


