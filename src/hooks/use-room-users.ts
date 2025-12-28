"use client";

import { useMemo } from "react";
import { collectionGroup, query, where } from "firebase/firestore";
import { useCollection } from "react-firebase-hooks/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { COLLECTIONS, db, auth as firebaseAuth } from "@/firebase/firebaseConfig";
import type { RoomDocument } from "@/types";

interface UseRoomUsersReturn {
  users: RoomDocument[];
  isLoading: boolean;
  error: Error | undefined;
  currentUserId: string | undefined;
}

/**
 * Hook for fetching users in a room
 */
export function useRoomUsers(roomId: string): UseRoomUsersReturn {
  const [user] = useAuthState(firebaseAuth);
  const isSignedIn = !!user;

  const roomsQuery = useMemo(() => {
    if (!isSignedIn) return null;
    return query(
      collectionGroup(db, COLLECTIONS.ROOMS),
      where("roomId", "==", roomId)
    );
  }, [isSignedIn, roomId]);

  const [snapshot, isLoading, error] = useCollection(roomsQuery);

  const users = useMemo(() => {
    if (!snapshot?.docs) return [];

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as RoomDocument[];
  }, [snapshot]);

  const currentUserId = user?.uid;

  return {
    users,
    isLoading,
    error,
    currentUserId,
  };
}


