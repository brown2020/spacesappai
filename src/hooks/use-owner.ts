"use client";

import { useMemo } from "react";
import { useRoom } from "@liveblocks/react/suspense";
import { doc } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { useDocument } from "react-firebase-hooks/firestore";
import { auth as firebaseAuth, COLLECTIONS, db } from "@/firebase/firebaseConfig";
import type { RoomDocument, RoomRole } from "@/types";

interface UseOwnerReturn {
  /** The current user's role for this room */
  role: RoomRole | undefined;
  /** Whether the current user is the owner. Note: returns false while loading */
  isOwner: boolean;
  /** Whether the current user can edit (owner or editor, not viewer) */
  canEdit: boolean;
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
  const [user, isAuthLoading, authError] = useAuthState(firebaseAuth);

  const roomRef = useMemo(() => {
    if (!user) return null;
    return doc(db, COLLECTIONS.USERS, user.uid, COLLECTIONS.ROOMS, room.id);
  }, [room.id, user]);

  const [roomSnap, isRoomLoading, roomError] = useDocument(roomRef);

  const role = (roomSnap?.data() as RoomDocument | undefined)?.role as
    | RoomRole
    | undefined;

  const isOwner = role === "owner";
  const canEdit = role === "owner" || role === "editor";
  const isLoading = isAuthLoading || isRoomLoading;
  const isReady = !isLoading && !!user && !authError && !roomError;

  // Optional debug (client-only)
  if (
    process.env.NODE_ENV !== "production" &&
    typeof window !== "undefined" &&
    window.location.search.includes("debugOwner=1")
  ) {
    console.log("[useOwner]", {
      roomId: room.id,
      uid: user?.uid ?? null,
      isAuthLoading,
      isRoomLoading,
      authError: authError ? String(authError) : null,
      roomError: roomError ? String(roomError) : null,
      roomDocExists: roomSnap?.exists() ?? null,
      role: role ?? null,
      isOwner,
      isReady,
    });
  }

  return { role, isOwner, canEdit, isLoading, isReady };
}

